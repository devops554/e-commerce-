import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException, Logger, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from './schemas/order.schema';
import { CreateOrderOrderDto } from './dto/create-order.dto';
import { Product, ProductVariant } from '../products/schemas/product.schema';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(ProductVariant.name) private variantModel: Model<ProductVariant>,
        private paymentsService: PaymentsService,
    ) { }

    // ─── HELPER METHODS ───

    private validateObjectId(id: string, name: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`Invalid ${name} ID format: ${id}`);
        }
    }

    // ─── ORDER LIFECYCLE ───

    async createOrder(createOrderDto: CreateOrderOrderDto, userId: string): Promise<Order> {
        try {
            const { items, shippingAddress, paymentMethod } = createOrderDto;

            let totalAmount = 0;
            const orderItems: any[] = [];

            // 1. Validate products and snapshot prices (Never trust frontend amount)
            for (const item of items) {
                this.validateObjectId(item.product, 'product');
                this.validateObjectId(item.variant, 'variant');

                const product = await this.productModel.findById(item.product);
                if (!product || !product.isActive) {
                    throw new NotFoundException(`Product not found or inactive: ${item.product}`);
                }

                const variant = await this.variantModel.findById(item.variant);
                if (!variant || !variant.isActive || variant.product.toString() !== product._id.toString()) {
                    throw new NotFoundException(`Variant not found or invalid for product: ${item.variant}`);
                }

                if (variant.stock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for product variant: ${product.title} (${variant.sku})`);
                }

                const price = variant.discountPrice || variant.price;
                totalAmount += price * item.quantity;

                orderItems.push({
                    product: product._id,
                    variant: variant._id,
                    quantity: item.quantity,
                    price,
                    title: product.title,
                    status: paymentMethod === PaymentMethod.COD ? OrderStatus.PENDING : OrderStatus.CREATED,
                });
            }

            // 2. Create Order document
            const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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

            this.logger.log(`Order created: ${orderId} by user ${userId}`);
            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to create order: ${error.message}`, error.stack);
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
            this.logger.error(`Failed to fetch orders for user ${userId}: ${error.message}`, error.stack);
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
            this.logger.error(`Failed to fetch all orders: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to fetch orders');
        }
    }

    // ─── PAYMENT & STOCK ───

    async verifyPayment(orderId: string, razorpayPaymentId: string, signature: string) {
        try {
            const order = await this.orderModel.findOne({ razorpayOrderId: orderId });
            if (!order) throw new NotFoundException(`Order not found with Razorpay ID: ${orderId}`);

            const isValid = this.paymentsService.verifySignature(orderId, razorpayPaymentId, signature);
            if (!isValid) throw new BadRequestException('Invalid payment signature');

            // Idempotency: skip if already paid
            if (order.paymentStatus === PaymentStatus.PAID) return order;

            order.paymentStatus = PaymentStatus.PAID;
            order.orderStatus = OrderStatus.CONFIRMED;
            order.razorpayPaymentId = razorpayPaymentId;
            order.razorpaySignature = signature;

            // Deduct Stock
            await this.deductStock(order);
            order.isStockDeducted = true;

            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Payment verification failed for ${orderId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Payment verification failed');
        }
    }

    private async deductStock(order: Order) {
        for (const item of order.items) {
            await this.variantModel.findByIdAndUpdate(item.variant, {
                $inc: { stock: -item.quantity },
            });
        }
    }

    // ─── ADMINISTRATIVE ACTIONS ───

    async updateOrderStatus(id: string, status: OrderStatus) {
        try {
            this.validateObjectId(id, 'order');
            const order = await this.orderModel.findById(id);
            if (!order) throw new NotFoundException('Order not found');

            // Simple State Machine validation
            const allowedTransitions: Record<string, OrderStatus[]> = {
                [OrderStatus.CREATED]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
                [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.FAILED, OrderStatus.CANCELLED],
                [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED],
                [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
            };

            if (allowedTransitions[order.orderStatus] && !allowedTransitions[order.orderStatus].includes(status)) {
                throw new BadRequestException(`Invalid status transition from ${order.orderStatus} to ${status}`);
            }

            order.orderStatus = status;
            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to update order ${id} status: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to update status');
        }
    }

    async getOrderById(id: string) {
        try {
            this.validateObjectId(id, 'order');
            const order = await this.orderModel.findById(id)
                .populate('items.product')
                .populate('items.variant')
                .lean();

            if (!order) throw new NotFoundException('Order not found');
            return order;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to fetch order ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Resource fetch failed');
        }
    }

    async cancelOrder(orderId: string, userId: string, reason: string, cancelBy: 'user' | 'admin' = 'user') {
        try {
            this.validateObjectId(orderId, 'order');
            const order = await this.orderModel.findById(orderId);
            if (!order) throw new NotFoundException('Order not found');

            // Admin can cancel anything except already delivered/cancelled (unless forced, but let's keep it safe)
            // User can only cancel if not shipped/delivered
            const nonCancellableByUser = [OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
            const nonCancellableByAdmin = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];

            const isRestricted = cancelBy === 'user' ? nonCancellableByUser.includes(order.orderStatus) : nonCancellableByAdmin.includes(order.orderStatus);

            if (isRestricted) {
                throw new BadRequestException(`Order cannot be cancelled in ${order.orderStatus} status`);
            }

            order.orderStatus = OrderStatus.CANCELLED;
            order.cancelReason = reason;
            order.cancelBy = cancelBy;
            order.cancelAt = new Date();

            // Restore stock if it was deducted
            if (order.isStockDeducted) {
                for (const item of order.items) {
                    if (item.status !== OrderStatus.CANCELLED) {
                        await this.variantModel.findByIdAndUpdate(item.variant, {
                            $inc: { stock: item.quantity },
                        });
                        item.status = OrderStatus.CANCELLED;
                        item.cancelReason = 'Order-level cancellation';
                    }
                }
            } else {
                // If stock wasn't deducted yet, just mark items as cancelled
                order.items.forEach(item => {
                    item.status = OrderStatus.CANCELLED;
                    item.cancelReason = 'Order-level cancellation';
                });
            }

            this.logger.warn(`Order ${orderId} cancelled by ${cancelBy} ${userId}`);
            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Cancellation failed for order ${orderId}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Cancellation failed');
        }
    }

    async cancelOrderItem(orderId: string, variantId: string, reason: string, cancelBy: 'user' | 'admin' = 'user') {
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
                throw new BadRequestException(`Cannot cancel item when order is ${order.orderStatus}`);
            }

            // Restore stock if it was deducted
            if (order.isStockDeducted) {
                await this.variantModel.findByIdAndUpdate(variantId, {
                    $inc: { stock: item.quantity },
                });
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

            // Recalculate total amount? (Business decision: usually NO for online paid orders unless refunding)
            // For now, let's keep total amount same but update items

            this.logger.warn(`Item ${variantId} in order ${orderId} cancelled by ${cancelBy}`);
            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Item cancellation failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Item cancellation failed');
        }
    }

    async deleteOrder(id: string) {
        try {
            this.validateObjectId(id, 'order');
            const order = await this.orderModel.findById(id);
            if (!order) throw new NotFoundException('Order not found');

            order.isDeleted = true;
            return await order.save();
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Failed to delete order ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Delete operation failed');
        }
    }
}
