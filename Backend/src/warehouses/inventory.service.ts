import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { StockHistory, StockHistoryDocument, StockActionType } from './schemas/stock-history.schema';
import { AdjustStockDto, TransferStockDto } from './dto/inventory.dto';
import { ProductVariant } from '../products/schemas/product.schema';
import { Warehouse, WarehouseDocument } from './schemas/warehouse.schema';
import { EventsGateway } from '../events/events.gateway';
import { ProductsService } from '../products/products.service';

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
        @InjectModel(StockHistory.name) private historyModel: Model<StockHistoryDocument>,
        @InjectModel(ProductVariant.name) private variantModel: Model<any>,
        @InjectModel(Warehouse.name) private warehouseModel: Model<WarehouseDocument>,
        private readonly eventsGateway: EventsGateway,
        private readonly productsService: ProductsService,
    ) { }

    async adjustStock(adjustStockDto: AdjustStockDto): Promise<Inventory> {
        const { variantId, warehouseId, amount, source } = adjustStockDto;

        // Ensure variant exists and get its product ID
        const variant = await this.variantModel.findById(variantId);
        if (!variant) {
            throw new NotFoundException(`Product variant with ID ${variantId} not found`);
        }

        let inventory = await this.inventoryModel.findOne({
            variant: new Types.ObjectId(variantId),
            warehouse: new Types.ObjectId(warehouseId),
        });

        if (!inventory) {
            if (amount < 0) {
                throw new BadRequestException('Cannot reduce stock for non-existent inventory');
            }
            inventory = new this.inventoryModel({
                product: variant.product,
                variant: new Types.ObjectId(variantId),
                warehouse: new Types.ObjectId(warehouseId),
                quantity: 0,
                totalReceived: 0,
                totalDispatched: 0,
                reserved: 0,
            });
        }

        const newQuantity = inventory.quantity + amount;
        if (newQuantity < 0) {
            throw new BadRequestException(`Insufficient stock. Current: ${inventory.quantity}, Requested adjustment: ${amount}`);
        }

        inventory.quantity = newQuantity;
        if (amount > 0) {
            inventory.totalReceived = (inventory.totalReceived || 0) + amount;
        }
        const savedInventory = await inventory.save();

        // Log history
        await this.logHistory({
            product: variant.product,
            variant: new Types.ObjectId(variantId),
            warehouse: new Types.ObjectId(warehouseId),
            type: StockActionType.ADJUSTMENT,
            amount: amount,
            source: source,
            notes: amount > 0 ? (source ? `Received from ${source}` : 'Manual stock addition') : 'Manual stock reduction'
        });

        // Update global variant stock (Aggregated)
        await this.updateGlobalVariantStock(variantId, warehouseId);

        // Update warehouse capacity
        await this.warehouseModel.findByIdAndUpdate(
            warehouseId,
            { $inc: { 'capacity.usedCapacity': amount } }
        );

        return savedInventory;
    }

    async transferStock(transferStockDto: TransferStockDto): Promise<any> {
        const { variantId, fromWarehouseId, toWarehouseId, amount } = transferStockDto;

        if (fromWarehouseId === toWarehouseId) {
            throw new BadRequestException('Source and destination warehouses must be different');
        }

        // Reduce from source
        await this.adjustStock({
            variantId,
            warehouseId: fromWarehouseId,
            amount: -amount,
        });

        // Add to destination
        await this.adjustStock({
            variantId,
            warehouseId: toWarehouseId,
            amount: amount,
        });

        return { message: 'Stock transferred successfully', amount, variantId };
    }

    async getWarehouseInventory(warehouseId: string): Promise<Inventory[]> {
        return this.inventoryModel.find({ warehouse: new Types.ObjectId(warehouseId) })
            .populate('product')
            .populate('variant')
            .exec();
    }

    async findWarehouseWithStock(
        variantId: string,
        quantity: number,
        shippingAddress?: { postalCode: string; city: string; state: string; latitude?: number; longitude?: number }
    ): Promise<Inventory | null> {
        // Fetch all warehouses that have enough stock for this variant
        const inventories = await this.inventoryModel.find({
            variant: new Types.ObjectId(variantId),
            quantity: { $gte: quantity },
        })
            .populate('warehouse')
            .exec();

        if (inventories.length === 0) {
            return null;
        }

        if (!shippingAddress) {
            // Fallback: Just return the first available one if no address provided
            return inventories[0];
        }

        let bestMatch: Inventory | null = null;
        let highestPriority = -1; // 5 = Geo distance, 4 = Pincode, 3 = City, 2 = State, 1 = Default, 0 = Any
        let shortestDistance = Infinity;

        this.logger.debug(`Finding optimal warehouse for variant ${variantId} with quantity ${quantity} for address ${JSON.stringify(shippingAddress)}`);

        for (const inventory of inventories) {
            const warehouse = inventory.warehouse as unknown as WarehouseDocument;
            let priority = 0; // Any

            // Attempt Geo-Location match if both shipping and warehouse have coordinates
            if (shippingAddress.latitude && shippingAddress.longitude && warehouse.location?.latitude && warehouse.location?.longitude) {
                const distance = this.calculateDistance(
                    shippingAddress.latitude,
                    shippingAddress.longitude,
                    warehouse.location.latitude,
                    warehouse.location.longitude
                );

                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    bestMatch = inventory;
                    highestPriority = 5; // Highest priority
                }
            } else if (highestPriority < 5) { // Fallback to textual match if geo match wasn't found or couldn't be evaluated
                if (warehouse.isDefaultWarehouse) {
                    priority = Math.max(priority, 1);
                }

                if (warehouse.address) {
                    const wState = warehouse.address.state?.toLowerCase();
                    const sState = shippingAddress.state?.toLowerCase();
                    const wCity = warehouse.address.city?.toLowerCase();
                    const sCity = shippingAddress.city?.toLowerCase();

                    if (wState === sState) {
                        priority = Math.max(priority, 2);
                    }

                    if (wCity === sCity) {
                        priority = Math.max(priority, 3);
                    }

                    if (warehouse.address.pincode === shippingAddress.postalCode) {
                        priority = 4;
                    }
                }

                if (priority > highestPriority) {
                    highestPriority = priority;
                    bestMatch = inventory;
                }
            }
        }

        if (bestMatch) {
            this.logger.log(`Selected warehouse ${(bestMatch.warehouse as any).code} with priority ${highestPriority}${highestPriority === 5 ? ` (distance: ${shortestDistance.toFixed(2)}km)` : ''} for variant ${variantId}`);
        }

        return bestMatch || inventories[0];
    }

    async reserveStock(variantId: string, warehouseId: string, amount: number): Promise<Inventory> {

        let inventory = await this.inventoryModel.findOne({
            variant: new Types.ObjectId(variantId),
            warehouse: new Types.ObjectId(warehouseId),
        });

        if (!inventory || inventory.quantity < amount) {
            throw new BadRequestException('Insufficient stock in specified warehouse');
        }

        inventory.quantity -= amount;
        inventory.reserved += amount;

        const saved = await inventory.save();

        // Log history
        await this.logHistory({
            product: inventory.product,
            variant: new Types.ObjectId(variantId),
            warehouse: new Types.ObjectId(warehouseId),
            type: StockActionType.RESERVATION,
            amount: -amount, // Available stock decreased
            notes: 'Stock reserved for order'
        });

        await this.updateGlobalVariantStock(variantId, warehouseId);
        return saved;
    }

    async releaseStock(variantId: string, warehouseId: string, amount: number): Promise<Inventory> {
        let inventory = await this.inventoryModel.findOne({
            variant: new Types.ObjectId(variantId),
            warehouse: new Types.ObjectId(warehouseId),
        });

        if (!inventory || inventory.reserved < amount) {
            // This might happen if order is cancelled but stock wasn't reserved correctly
            // Log error but maybe don't block? Let's be strict for now.
            throw new BadRequestException('Insufficient reserved stock to release');
        }

        inventory.quantity += amount;
        inventory.reserved -= amount;

        const saved = await inventory.save();

        // Log history
        await this.logHistory({
            product: inventory.product,
            variant: new Types.ObjectId(variantId),
            warehouse: new Types.ObjectId(warehouseId),
            type: StockActionType.RELEASE,
            amount: amount, // Available stock increased
            notes: 'Stock released from reservation'
        });

        await this.updateGlobalVariantStock(variantId, warehouseId);
        return saved;
    }

    async confirmDispatch(variantId: string, warehouseId: string, amount: number): Promise<Inventory> {
        let inventory = await this.inventoryModel.findOne({
            variant: new Types.ObjectId(variantId),
            warehouse: new Types.ObjectId(warehouseId),
        });

        if (!inventory || inventory.reserved < amount) {
            throw new BadRequestException('Insufficient reserved stock for dispatch');
        }

        inventory.reserved -= amount;
        inventory.totalDispatched = (inventory.totalDispatched || 0) + amount;
        const saved = await inventory.save();

        // Log history
        await this.logHistory({
            product: inventory.product,
            variant: new Types.ObjectId(variantId),
            warehouse: new Types.ObjectId(warehouseId),
            type: StockActionType.DISPATCH,
            amount: 0, // Available didn't change (already reduced during reservation)
            notes: 'Stock dispatched from warehouse'
        });

        // Global stock was already reduced during reservation, so no need to update global again here
        // Update warehouse capacity
        await this.warehouseModel.findByIdAndUpdate(
            warehouseId,
            { $inc: { 'capacity.usedCapacity': -amount } }
        );

        // Emit event to update warehouse utilization in UI
        await this.updateGlobalVariantStock(variantId, warehouseId);

        return saved;
    }

    async getVariantTotalStock(variantId: string): Promise<number> {
        const inventories = await this.inventoryModel.find({ variant: new Types.ObjectId(variantId) });
        return inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    }

    private async updateGlobalVariantStock(variantId: string, warehouseId?: string) {
        // Since we removed 'stock' from ProductVariant schema, we don't update it directly anymore.
        // This method can still be used to emit events if needed, or we just rely on aggregated queries.
        const totalStock = await this.getVariantTotalStock(variantId);

        // Find variant to get product ID for event
        const variant = await this.variantModel.findById(variantId);
        if (variant) {
            this.eventsGateway.emitEvent('stock.updated', {
                variantId: variant._id,
                productId: variant.product,
                stock: totalStock,
                warehouseId: warehouseId
            });
            // Clear the product cache so the public page gets the latest stock immediately
            await this.productsService.invalidateProductCache(variant.product.toString());
        }
    }

    private async logHistory(data: any) {
        try {
            const log = new this.historyModel(data);
            await log.save();
        } catch (error) {
            console.error('Failed to log stock history:', error);
        }
    }

    async getHistory(warehouseId: string) {
        return this.historyModel.find({ warehouse: new Types.ObjectId(warehouseId) })
            .populate('product', 'title')
            .populate('variant', 'sku')
            .sort({ createdAt: -1 })
            .limit(100)
            .exec();
    }

    // Manager-scoped: resolve warehouse automatically from managerId
    async managerReceiveStock(managerId: string, variantId: string, amount: number, source?: string): Promise<Inventory> {
        const warehouse = await this.warehouseModel.findOne({
            managerId: new Types.ObjectId(managerId),
        });
        if (!warehouse) {
            throw new NotFoundException('No warehouse assigned to this manager');
        }
        return this.adjustStock({ variantId, warehouseId: String(warehouse._id), amount, source });
    }

    // Manager-scoped: get their own warehouse inventory
    async getManagerWarehouseInventory(managerId: string): Promise<Inventory[]> {
        const warehouse = await this.warehouseModel.findOne({
            managerId: new Types.ObjectId(managerId),
        });
        if (!warehouse) {
            throw new NotFoundException('No warehouse assigned to this manager');
        }
        return this.getWarehouseInventory(String(warehouse._id));
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }
}


