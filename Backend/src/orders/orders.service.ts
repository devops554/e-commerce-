
import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from './schemas/order.schema';
import { CreateOrderOrderDto } from './dto/create-order.dto';
import { Product, ProductVariant } from '../products/schemas/product.schema';
import { PaymentsService } from '../payments/payments.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { UserRole } from '../users/schemas/user.schema';
import { InventoryService } from '../warehouses/inventory.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(ProductVariant.name) private variantModel: Model<ProductVariant>,
        private paymentsService: PaymentsService,
        private eventsGateway: EventsGateway,
        private notificationsService: NotificationsService,
        private inventoryService: InventoryService,
    ) { }


    // ─── HELPER METHODS ───

    private validateObjectId(id: string, name: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid ${name} ID format: ${id} `);
        }
    }

    // ─── ORDER LIFECYCLE ───

    async createOrder(createOrderDto: CreateOrderOrderDto, userId: string): Promise<Order> {
        try {
            const { items, shippingAddress, paymentMethod } = createOrderDto;

            let totalAmount = 0;
            const orderItems: any[] = [];
            const managersToNotify = new Set<string>();

            // 1. Validate products and snapshot prices (Never trust frontend amount)
            for (const item of items) {
                this.validateObjectId(item.product, 'product');
                this.validateObjectId(item.variant, 'variant');

                const product = await this.productModel.findById(item.product);
                if (!product || !product.isActive) {
                    throw new NotFoundException(`Product not found or inactive: ${item.product} `);
                }

                const variant = await this.variantModel.findById(item.variant);
                if (!variant || !variant.isActive || variant.product.toString() !== product._id.toString()) {
                    throw new NotFoundException(`Variant not found or invalid for product: ${item.variant} `);
                }

                const currentStock = await this.inventoryService.getVariantTotalStock(item.variant);
                if (currentStock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for product variant: ${product.title} (${variant.sku})`);
                }

                const price = variant.discountPrice || variant.price;
                totalAmount += price * item.quantity;

                // Find a warehouse with stock (prioritizing the nearest one)
                const inventorySlot = await this.inventoryService.findWarehouseWithStock(
                    item.variant,
                    item.quantity,
                    {
                        postalCode: shippingAddress.postalCode,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        latitude: shippingAddress.latitude,
                        longitude: shippingAddress.longitude
                    }
                );
                if (!inventorySlot) {
                    throw new BadRequestException(`No warehouse has sufficient stock for ${product.title} (${variant.sku})`);
                }

                orderItems.push({
                    product: product._id,
                    variant: variant._id,
                    warehouse: (inventorySlot.warehouse as any)._id || inventorySlot.warehouse,
                    quantity: item.quantity,
                    price,
                    title: product.title,
                    status: paymentMethod === PaymentMethod.COD ? OrderStatus.PENDING : OrderStatus.CREATED,
                });

                const selectedWarehouseId = (inventorySlot.warehouse as any)._id?.toString() || inventorySlot.warehouse.toString();

                if ((inventorySlot.warehouse as any).managerId) {
                    managersToNotify.add((inventorySlot.warehouse as any).managerId.toString());
                }

                // Reserve stock immediately
                await this.inventoryService.reserveStock(item.variant, selectedWarehouseId, item.quantity);
            }

            // 2. Create Order document
            const orderId = `ORD - ${Date.now()} -${Math.floor(Math.random() * 1000)} `;
            const order = new this.orderModel({
                orderId,
                user: new Types.ObjectId(userId),
                items: orderItems,
                totalAmount,
                shippingAddress,
                paymentMethod,
                orderStatus: paymentMethod === PaymentMethod.COD ? OrderStatus.PENDING : OrderStatus.CREATED,
            });

            // 3. Handle Online Payment (Razorpay)
            if (paymentMethod === PaymentMethod.RAZORPAY) {
                const razorpayOrder = await this.paymentsService.createRazorpayOrder(totalAmount, orderId);
                order.razorpayOrderId = razorpayOrder.id;
                order.orderStatus = OrderStatus.PENDING;
            }

            this.logger.log(`Order created: ${orderId} by user ${userId} `);
            const savedOrder = await order.save();

            // Create notification for admin
            await this.notificationsService.create({
                title: 'New Order Received',
                message: `Order ${orderId} has been placed for ₹${totalAmount}.`,
                type: NotificationType.ORDER,
                recipientRole: 'admin',
                link: `/admin/orders/${savedOrder._id}`,
                metadata: { orderId: savedOrder._id },
            });

            // Create notification for involved managers
            for (const managerId of managersToNotify) {
                await this.notificationsService.create({
                    title: 'New Fulfillment Assignment',
                    message: `Order ${orderId} requires fulfillment from your warehouse.`,
                    type: NotificationType.ORDER,
                    recipientRole: 'manager',
                    recipientId: managerId,
                    link: `/manager/orders`,
                    metadata: { orderId: savedOrder._id },
                });
            }

            // Emit WebSocket event
            this.eventsGateway.emitEvent('order.created', savedOrder);

            return savedOrder;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to create order: ${error.message} `, error.stack);
            throw new InternalServerErrorException('Failed to create order');
        }
    }

    async getMyOrders(userId: string, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const filter = { user: new Types.ObjectId(userId), isDeleted: { $ne: true } };

            const [orders, total] = await Promise.all([
                this.orderModel
                    .find(filter)
                    .populate('items.product', 'title images')
                    .populate('items.variant', 'images attributes')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.orderModel.countDocuments(filter),
            ]);

            return {
                orders: orders as unknown as Order[],
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            this.logger.error(`Failed to fetch orders for user ${userId}: ${error.message} `, error.stack);
            throw new InternalServerErrorException('Failed to fetch orders');
        }
    }

    async getAllOrders(params: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        userId?: string;
    }): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> {
        try {
            const { page = 1, limit = 20, status, search, userId } = params;
            const skip = (page - 1) * limit;

            const filter: any = { isDeleted: { $ne: true } };
            if (status) filter.orderStatus = status;
            if (userId) filter.user = new Types.ObjectId(userId);
            if (search) {
                filter.$or = [
                    { orderId: { $regex: search, $options: 'i' } },
                    { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
                    { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
                ];
            }

            const [orders, total] = await Promise.all([
                this.orderModel
                    .find(filter)
                    .populate('user', 'name email')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.orderModel.countDocuments(filter),
            ]);

            return {
                orders: orders as unknown as Order[],
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            this.logger.error(`Failed to fetch all orders: ${error.message} `, error.stack);
            throw new InternalServerErrorException('Failed to fetch orders');
        }
    }

    // ─── PAYMENT & STOCK ───

    async verifyPayment(orderId: string, razorpayPaymentId: string, signature: string) {
        try {
            const order = await this.orderModel.findOne({ razorpayOrderId: orderId });
            if (!order) throw new NotFoundException(`Order not found with Razorpay ID: ${orderId} `);

            const isValid = this.paymentsService.verifySignature(orderId, razorpayPaymentId, signature);
            if (!isValid) throw new BadRequestException('Invalid payment signature');

            // Idempotency: skip if already paid
            if (order.paymentStatus === PaymentStatus.PAID) return order;

            order.paymentStatus = PaymentStatus.PAID;
            order.orderStatus = OrderStatus.CONFIRMED;
            order.razorpayPaymentId = razorpayPaymentId;
            order.razorpaySignature = signature;

            // Stock was already reserved during creation
            order.isStockDeducted = true;

            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Payment verification failed for ${orderId}: ${error.message} `, error.stack);
            throw new InternalServerErrorException('Payment verification failed');
        }
    }

    private async deductStock(order: Order) {
        for (const item of order.items) {
            // Stock was already reserved/deducted during reservation if confirmed/cod
            // We just need to trigger alerts if needed, but aggregated stock is what matters.
            const currentStock = await this.inventoryService.getVariantTotalStock(item.variant?.toString());
            const variant = await this.variantModel.findById(item.variant);

            if (variant) {
                const product = await this.productModel.findById(variant.product);
                // Stock Alert Notification for Admin/Subadmin
                await this.notificationsService.create({
                    title: 'Low Stock Alert',
                    message: `Product variant ${variant.sku} is low on stock (${currentStock} left).`,
                    type: NotificationType.STOCK,
                    recipientRole: 'admin',
                    link: `/admin/inventory`,
                    metadata: { variantId: variant._id, productId: variant.product },
                });

                // Stock Alert Notification for Seller (if applicable)
                if (product && product.createdBy) {
                    await this.notificationsService.create({
                        title: 'Low Stock Alert',
                        message: `Your product variant ${variant.sku} is low on stock (${currentStock} left).`,
                        type: NotificationType.STOCK,
                        recipientRole: 'seller',
                        recipientId: product.createdBy.toString(),
                        link: `/seller/inventory`,
                        metadata: { variantId: variant._id, productId: variant.product },
                    });
                }

                this.eventsGateway.emitEvent('stock.updated', {
                    variantId: variant._id,
                    productId: variant.product,
                    stock: currentStock
                });
            }
        }
    }

    // ─── ADMINISTRATIVE ACTIONS ───

    async updateOrderStatus(id: string, status: OrderStatus, actorId: string, actorRole: string) {
        try {
            this.validateObjectId(id, 'order');
            const order = await this.orderModel.findById(id);
            if (!order) throw new NotFoundException('Order not found');

            // Simple State Machine validation
            const allowedTransitions: Record<string, OrderStatus[]> = {
                [OrderStatus.CREATED]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
                [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.FAILED, OrderStatus.CANCELLED],
                [OrderStatus.CONFIRMED]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
                [OrderStatus.PACKED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
                [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
                [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.FAILED_DELIVERY, OrderStatus.CANCELLED],
                [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
                [OrderStatus.FAILED_DELIVERY]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
            };

            if (allowedTransitions[order.orderStatus] && !allowedTransitions[order.orderStatus].includes(status)) {
                throw new BadRequestException(`Invalid status transition from ${order.orderStatus} to ${status} `);
            }

            order.orderStatus = status;
            order.history.push({
                actor: new Types.ObjectId(actorId),
                actorRole,
                action: 'STATUS_UPDATE',
                status,
                timestamp: new Date()
            });

            const updatedOrder = await order.save();

            // Notify User: Status Update
            const statusDisplay = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            await this.notificationsService.create({
                title: `Order ${statusDisplay}`,
                message: `Your order ${updatedOrder.orderId} has been ${statusDisplay.toLowerCase()}.`,
                type: NotificationType.ORDER,
                recipientRole: 'customer',
                recipientId: updatedOrder.user.toString(),
                link: `/my-orders/${updatedOrder._id}`,
            });

            this.eventsGateway.emitEvent('order.updated', updatedOrder);

            return updatedOrder;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to update order ${id} status: ${error.message} `, error.stack);
            throw new InternalServerErrorException('Failed to update status');
        }
    }

    async getOrderById(id: string) {
        try {
            const isObjectId = Types.ObjectId.isValid(id);
            const query = isObjectId ? { _id: id } : { orderId: id };

            const order = await this.orderModel.findOne(query)
                .populate('items.product')
                .populate('items.variant')
                .lean();

            if (!order) throw new NotFoundException('Order not found');
            return order;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to fetch order ${id}: ${error.message} `, error.stack);
            throw new InternalServerErrorException('Resource fetch failed');
        }
    }

    async cancelOrder(orderId: string, userId: string, userRole: string, reason: string, cancelBy: 'customer' | 'admin' = 'customer') {
        try {
            this.validateObjectId(orderId, 'order');
            const order = await this.orderModel.findById(orderId);
            if (!order) throw new NotFoundException('Order not found');

            // Admin can cancel anything except already delivered/cancelled (unless forced, but let's keep it safe)
            // User can only cancel if not shipped/delivered
            const nonCancellableByUser = [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
            const nonCancellableByAdmin = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

            const isRestricted = cancelBy === 'customer' ? nonCancellableByUser.includes(order.orderStatus) : nonCancellableByAdmin.includes(order.orderStatus);

            if (isRestricted) {
                throw new BadRequestException(`Order cannot be cancelled in ${order.orderStatus} status`);
            }

            order.orderStatus = OrderStatus.CANCELLED;
            order.cancelReason = reason;
            order.cancelBy = cancelBy;
            order.cancelAt = new Date();

            // Restore stock if it was reserved/deducted
            if (order.isStockDeducted || order.orderStatus !== OrderStatus.CANCELLED) {
                for (const item of order.items) {
                    if (item.status !== OrderStatus.CANCELLED && item.warehouse) {
                        await this.inventoryService.releaseStock(
                            item.variant.toString(),
                            item.warehouse.toString(),
                            item.quantity
                        );
                        item.status = OrderStatus.CANCELLED;
                        item.cancelReason = 'Order-level cancellation';
                    }
                }
            }
            else {
                // If stock wasn't deducted yet, just mark items as cancelled
                order.items.forEach(item => {
                    item.status = OrderStatus.CANCELLED;
                    item.cancelReason = 'Order-level cancellation';
                });
            }

            this.logger.warn(`Order ${orderId} cancelled by ${cancelBy} ${userId} `);
            order.history.push({
                actor: new Types.ObjectId(userId),
                actorRole: userRole,
                action: 'CANCELLED',
                status: OrderStatus.CANCELLED,
                note: reason,
                timestamp: new Date()
            });
            const savedOrder = await order.save();

            // Notify concerned party
            if (cancelBy === 'customer') {
                await this.notificationsService.create({
                    title: 'Order Cancelled by Customer',
                    message: `Order ${savedOrder.orderId} has been cancelled by the customer. Reason: ${reason}`,
                    type: NotificationType.ORDER,
                    recipientRole: 'admin',
                    link: `/admin/orders/${savedOrder._id}`,
                });
            } else {
                await this.notificationsService.create({
                    title: 'Order Cancelled',
                    message: `Your order ${savedOrder.orderId} has been cancelled. Reason: ${reason}`,
                    type: NotificationType.ORDER,
                    recipientRole: 'customer',
                    recipientId: savedOrder.user.toString(),
                    link: `/my-orders/${savedOrder._id}`,
                });
            }

            return savedOrder;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Cancellation failed for order ${orderId}: ${error.message} `, error.stack);
            throw new InternalServerErrorException('Cancellation failed');
        }
    }

    async cancelOrderItem(orderId: string, variantId: string, userId: string, userRole: string, reason: string, cancelBy: 'customer' | 'admin' = 'customer') {
        try {
            this.validateObjectId(orderId, 'order');
            this.validateObjectId(variantId, 'variant');

            const order = await this.orderModel.findById(orderId);
            if (!order) throw new NotFoundException('Order not found');

            const itemIndex = order.items.findIndex(i => i.variant.toString() === variantId);
            if (itemIndex === -1) throw new NotFoundException('Item not found in order');

            const item = order.items[itemIndex];
            if (item.status === OrderStatus.CANCELLED) {
                throw new BadRequestException('Item is already cancelled');
            }

            // Check if per-item cancellation is allowed
            if (order.orderStatus === OrderStatus.DELIVERED || order.orderStatus === OrderStatus.CANCELLED) {
                throw new BadRequestException(`Cannot cancel item when order is ${order.orderStatus} `);
            }

            // Restore stock if it was deducted
            if (order.isStockDeducted && item.warehouse) {
                await this.inventoryService.releaseStock(
                    variantId,
                    item.warehouse.toString(),
                    item.quantity
                );
            }

            item.status = OrderStatus.CANCELLED;
            item.cancelReason = reason;

            // If all items are now cancelled, cancel the entire order
            const allCancelled = order.items.every(i => i.status === OrderStatus.CANCELLED);
            if (allCancelled) {
                order.orderStatus = OrderStatus.CANCELLED;
                order.cancelReason = "All items cancelled individually";
                order.cancelBy = cancelBy;
                order.cancelAt = new Date();
            }

            order.history.push({
                actor: new Types.ObjectId(userId),
                actorRole: userRole,
                action: 'ITEM_CANCELLED',
                status: order.orderStatus,
                note: `Item ${variantId} cancelled: ${reason}`,
                timestamp: new Date()
            });

            // Recalculate total amount? (Business decision: usually NO for online paid orders unless refunding)
            // For now, let's keep total amount same but update items

            this.logger.warn(`Item ${variantId} in order ${orderId} cancelled by ${cancelBy} `);
            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Item cancellation failed: ${error.message} `, error.stack);
            throw new InternalServerErrorException('Item cancellation failed');
        }
    }

    async confirmOrderItemDispatch(orderId: string, variantId: string, warehouseId: string, userId: string, userRole: string) {
        try {
            this.validateObjectId(orderId, 'order');
            this.validateObjectId(variantId, 'variant');
            this.validateObjectId(warehouseId, 'warehouse');

            const order = await this.orderModel.findById(orderId);
            if (!order) throw new NotFoundException('Order not found');

            const item = order.items.find(i => i.variant.toString() === variantId && i.warehouse?.toString() === warehouseId);
            if (!item) throw new NotFoundException('Item not found for this warehouse in the order');

            if (item.status === OrderStatus.CONFIRMED || item.status === OrderStatus.PACKED || item.status === OrderStatus.SHIPPED || item.status === OrderStatus.DELIVERED) {
                throw new BadRequestException('Item already confirmed or dispatched');
            }

            // Confirm dispatch in inventory (Reduce reserved stock)
            await this.inventoryService.confirmDispatch(variantId, warehouseId, item.quantity);

            // Step 1: If order is still pending/created, move it to confirmed
            if (order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.CREATED) {
                order.orderStatus = OrderStatus.CONFIRMED;
                order.history.push({
                    actor: new Types.ObjectId(userId),
                    actorRole: userRole,
                    action: 'STATUS_UPDATE',
                    status: OrderStatus.CONFIRMED,
                    note: `Order auto-confirmed by manager on item confirmation`,
                    timestamp: new Date()
                });
            }

            // Step 2: Mark this item as confirmed (packed will be set later when delivery boy is assigned)
            item.status = OrderStatus.CONFIRMED;

            order.history.push({
                actor: new Types.ObjectId(userId),
                actorRole: userRole,
                action: 'ITEM_CONFIRMED',
                status: order.orderStatus,
                note: `Item ${variantId} confirmed by manager at warehouse ${warehouseId}`,
                timestamp: new Date()
            });

            const savedOrder = await order.save();
            this.eventsGateway.emitEvent('order.updated', savedOrder);

            return savedOrder;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Dispatch failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Dispatch failed');
        }
    }

    async getWarehouseOrders(warehouseId: string) {
        return this.orderModel.find({
            'items.warehouse': new Types.ObjectId(warehouseId),
            isDeleted: { $ne: true }
        })
            .populate('user', 'name email')
            .populate('items.product')
            .populate('items.variant')
            .sort({ createdAt: -1 })
            .exec();
    }

    async deleteOrder(id: string) {
        try {
            this.validateObjectId(id, 'order');
            const order = await this.orderModel.findById(id);
            if (!order) throw new NotFoundException('Order not found');

            // Soft delete
            order.isDeleted = true;

            // Log history
            order.history.push({
                actor: new Types.ObjectId('000000000000000000000000'), // System/Admin placeholder if actor not passed, but controller passes id
                actorRole: 'admin',
                action: 'DELETED',
                status: order.orderStatus,
                note: 'Order soft-deleted by admin',
                timestamp: new Date()
            });

            // If order was not cancelled/delivered, we should release stock
            const nonFilledStatus = [OrderStatus.CREATED, OrderStatus.PENDING, OrderStatus.CONFIRMED];
            if (nonFilledStatus.includes(order.orderStatus)) {
                for (const item of order.items) {
                    if (item.status !== OrderStatus.CANCELLED && item.warehouse) {
                        await this.inventoryService.releaseStock(
                            item.variant.toString(),
                            item.warehouse.toString(),
                            item.quantity
                        );
                        item.status = OrderStatus.CANCELLED;
                    }
                }
                order.orderStatus = OrderStatus.CANCELLED;
            }

            this.logger.warn(`Order ${id} soft-deleted by admin`);
            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to delete order ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to delete order');
        }
    }
}

