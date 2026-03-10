import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from './schemas/order.schema';
import { CreateOrderOrderDto } from './dto/create-order.dto';
import { Product, ProductVariant } from '../products/schemas/product.schema';
import { PaymentsService } from '../payments/payments.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { UserRole } from '../users/schemas/user.schema';
import { InventoryService } from '../warehouses/inventory.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { Seller } from '../sellers/schemas/seller.schema';
import { normalizeState, getOrderItemGst } from '../common/utils/gst.util';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(ProductVariant.name)
    private variantModel: Model<ProductVariant>,
    private paymentsService: PaymentsService,
    private eventsGateway: EventsGateway,
    private notificationsService: NotificationsService,
    private inventoryService: InventoryService,
    private shipmentsService: ShipmentsService,
    private settingsService: SettingsService,
    @InjectModel(Seller.name) private sellerModel: Model<Seller>,
  ) { }

  private r2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  // ─── HELPER METHODS ───

  private validateObjectId(id: string, name: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${name} ID format: ${id} `);
    }
  }

  // ─── HELPER: Invoice Number Generator ───

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const lastOrder = await this.orderModel
      .findOne(
        {
          invoiceDate: { $gte: monthStart, $lt: monthEnd },
          invoiceNumber: { $ne: '' },
        },
        { invoiceNumber: 1 },
      )
      .sort({ invoiceDate: -1 })
      .lean()
      .exec();

    let seq = 1;
    if (lastOrder?.invoiceNumber) {
      const parts = lastOrder.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `INV-${yyyymm}-${String(seq).padStart(5, '0')}`;
  }

  // ─── ORDER LIFECYCLE ───

  async createOrder(
    createOrderDto: CreateOrderOrderDto,
    userId: string,
  ): Promise<Order> {
    try {
      const { items, shippingAddress, paymentMethod } = createOrderDto;

      const managersToNotify = new Set<string>();

      const PLATFORM_STATE = process.env.SELLER_STATE_CODE ?? '27';
      const buyerState = normalizeState(shippingAddress.state);

      // Determine intra/inter-state at order level (for overall display/legacy)
      const storeConfig = await this.settingsService.getConfig();
      const isInterState =
        normalizeState(storeConfig?.stateCode || PLATFORM_STATE) !== buyerState;

      // ── 1. Validate products, compute GST, snapshot prices ───────────────
      const orderItems: any[] = [];
      let subTotal = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;

      for (const item of items) {
        this.validateObjectId(item.product, 'product');
        this.validateObjectId(item.variant, 'variant');

        const product = await this.productModel.findById(item.product).lean();
        if (!product || !product.isActive) {
          throw new NotFoundException(
            `Product not found or inactive: ${item.product}`,
          );
        }

        // ── GST config validation ──
        if (!product.gst?.hsnCode || product.gst.gstRate === undefined) {
          throw new BadRequestException(
            `Product "${product.title}" is missing GST configuration (hsnCode / gstRate). ` +
            `Please update the product before placing an order.`,
          );
        }

        const variant = await this.variantModel.findById(item.variant).lean();
        if (
          !variant ||
          !variant.isActive ||
          variant.product.toString() !== (product as any)._id.toString()
        ) {
          throw new NotFoundException(
            `Variant not found or invalid for product: ${item.variant}`,
          );
        }

        const currentStock = await this.inventoryService.getVariantTotalStock(
          item.variant,
        );
        if (currentStock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product variant: ${(product as any).title} (${variant.sku})`,
          );
        }

        // Get seller if product has one
        const seller = (product as any).seller
          ? await this.sellerModel.findById((product as any).seller).lean()
          : null;

        // Effective seller state (seller's pickup state OR platform state)
        const effectiveSellerState =
          (seller as any)?.stateCode ?? PLATFORM_STATE;
        const itemIsInterState =
          normalizeState(effectiveSellerState) !== buyerState;

        // ── Selling price & GST breakdown ──
        const sellingPrice = variant.discountPrice || variant.price;
        const gstResult = getOrderItemGst(
          sellingPrice,
          (product as any).gst,
          itemIsInterState,
        );

        const qty = item.quantity;
        const lineTotal = this.r2(gstResult.sellingPrice * qty);
        const lineTaxableValue = this.r2(gstResult.basePrice * qty);
        const lineCgst = this.r2(gstResult.cgst * qty);
        const lineSgst = this.r2(gstResult.sgst * qty);
        const lineIgst = this.r2(gstResult.igst * qty);
        const lineTotalGst = this.r2(gstResult.gstAmountPerUnit * qty);

        subTotal += lineTaxableValue;
        totalCgst += lineCgst;
        totalSgst += lineSgst;
        totalIgst += lineIgst;

        // ── Find nearest warehouse with stock ──
        const inventorySlot =
          await this.inventoryService.findWarehouseWithStock(
            item.variant,
            item.quantity,
            {
              postalCode: shippingAddress.postalCode,
              city: shippingAddress.city,
              state: shippingAddress.state,
              latitude: shippingAddress.latitude,
              longitude: shippingAddress.longitude,
            },
          );
        if (!inventorySlot) {
          throw new BadRequestException(
            `No warehouse has sufficient stock for ${product.title} (${variant.sku})`,
          );
        }

        // Thumbnail image (first variant image or product thumbnail)
        const image =
          variant.images?.[0]?.url || (product as any).thumbnail?.url || '';

        orderItems.push({
          product: product._id,
          variant: variant._id,
          warehouse:
            (inventorySlot.warehouse as any)._id || inventorySlot.warehouse,
          quantity: qty,

          // Price snapshot
          price: gstResult.sellingPrice,
          title: product.title,
          image,

          // GST snapshot
          hsnCode: gstResult.hsnCode,
          gstRate: gstResult.gstRate,
          basePrice: gstResult.basePrice,
          gstAmountPerUnit: gstResult.gstAmountPerUnit,
          cgst: gstResult.cgst,
          sgst: gstResult.sgst,
          igst: gstResult.igst,

          // Line totals
          lineTotal,
          lineTaxableValue,
          lineCgst,
          lineSgst,
          lineIgst,
          lineTotalGst,

          // Seller snapshot
          seller: seller?._id ?? null,
          sellerName: seller?.storeName ?? process.env.SELLER_LEGAL_NAME ?? '',
          sellerGstin: seller?.gstNumber ?? process.env.SELLER_GSTIN ?? '',
          sellerStateCode: effectiveSellerState,

          status:
            paymentMethod === PaymentMethod.COD
              ? OrderStatus.PENDING
              : OrderStatus.CREATED,
        });

        const selectedWarehouseId =
          (inventorySlot.warehouse as any)._id?.toString() ||
          inventorySlot.warehouse.toString();

        if ((inventorySlot.warehouse as any).managerId) {
          managersToNotify.add(
            (inventorySlot.warehouse as any).managerId.toString(),
          );
        }

        // Reserve stock immediately
        await this.inventoryService.reserveStock(
          item.variant,
          selectedWarehouseId,
          item.quantity,
        );
      }

      // ── 2. Compute order-level totals ──────────────────────────────────────
      const shippingCharge = 0; // Extend later if needed
      const totalGstAmount = this.r2(totalCgst + totalSgst + totalIgst);
      const totalAmount = this.r2(subTotal + totalGstAmount + shippingCharge);

      // ── 3. Generate Invoice Number ─────────────────────────────────────────
      const invoiceNumber = await this.generateInvoiceNumber();
      const invoiceDate = new Date();

      // ── 4. Create Order ────────────────────────────────────────────────────
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const order = new this.orderModel({
        orderId,
        user: new Types.ObjectId(userId),
        items: orderItems,

        // GST totals
        subTotal: this.r2(subTotal),
        totalCgst: this.r2(totalCgst),
        totalSgst: this.r2(totalSgst),
        totalIgst: this.r2(totalIgst),
        totalGstAmount,
        shippingCharge,
        totalAmount,
        isInterState,
        invoiceNumber,
        invoiceDate,

        shippingAddress,
        paymentMethod,
        orderStatus:
          paymentMethod === PaymentMethod.COD
            ? OrderStatus.PENDING
            : OrderStatus.CREATED,
      });

      // ── 5. Handle Online Payment (Razorpay) ───────────────────────────────
      if (paymentMethod === PaymentMethod.RAZORPAY) {
        const razorpayOrder = await this.paymentsService.createRazorpayOrder(
          totalAmount,
          orderId,
        );
        order.razorpayOrderId = razorpayOrder.id;
        order.orderStatus = OrderStatus.PENDING;
      }

      this.logger.log(`Order created: ${orderId} by user ${userId}`);
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
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async getMyOrders(userId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const filter = {
        user: new Types.ObjectId(userId),
        isDeleted: { $ne: true },
      };

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
      this.logger.error(
        `Failed to fetch orders for user ${userId}: ${error.message} `,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async getAllOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    userId?: string;
  }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
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
      this.logger.error(
        `Failed to fetch all orders: ${error.message} `,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  // ─── PAYMENT & STOCK ───

  async verifyPayment(
    orderId: string,
    razorpayPaymentId: string,
    signature: string,
  ) {
    try {
      const order = await this.orderModel.findOne({ razorpayOrderId: orderId });
      if (!order)
        throw new NotFoundException(
          `Order not found with Razorpay ID: ${orderId} `,
        );

      const isValid = this.paymentsService.verifySignature(
        orderId,
        razorpayPaymentId,
        signature,
      );
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
      this.logger.error(
        `Payment verification failed for ${orderId}: ${error.message} `,
        error.stack,
      );
      throw new InternalServerErrorException('Payment verification failed');
    }
  }

  private async deductStock(order: Order) {
    for (const item of order.items) {
      // Stock was already reserved/deducted during reservation if confirmed/cod
      // We just need to trigger alerts if needed, but aggregated stock is what matters.
      const currentStock = await this.inventoryService.getVariantTotalStock(
        item.variant?.toString(),
      );
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
          stock: currentStock,
        });
      }
    }
  }

  // ─── ADMINISTRATIVE ACTIONS ───

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    actorId: string,
    actorRole: string,
  ) {
    try {
      this.validateObjectId(id, 'order');
      const order = await this.orderModel.findById(id);
      if (!order) throw new NotFoundException('Order not found');

      // Simple State Machine validation
      const allowedTransitions: Record<string, OrderStatus[]> = {
        [OrderStatus.CREATED]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
        [OrderStatus.PENDING]: [
          OrderStatus.CONFIRMED,
          OrderStatus.FAILED,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.CONFIRMED]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
        [OrderStatus.PACKED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]: [
          OrderStatus.OUT_FOR_DELIVERY,
          OrderStatus.DELIVERED,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.OUT_FOR_DELIVERY]: [
          OrderStatus.DELIVERED,
          OrderStatus.FAILED_DELIVERY,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
        [OrderStatus.FAILED_DELIVERY]: [
          OrderStatus.OUT_FOR_DELIVERY,
          OrderStatus.CANCELLED,
        ],
      };

      if (
        allowedTransitions[order.orderStatus] &&
        !allowedTransitions[order.orderStatus].includes(status)
      ) {
        throw new BadRequestException(
          `Invalid status transition from ${order.orderStatus} to ${status} `,
        );
      }

      order.orderStatus = status;
      order.history.push({
        actor: new Types.ObjectId(actorId),
        actorRole,
        action: 'STATUS_UPDATE',
        status,
        timestamp: new Date(),
      });

      const updatedOrder = await order.save();

      // Trigger Shipment creation if status is PACKED
      if (status === OrderStatus.PACKED) {
        const warehouses = new Set<string>();
        updatedOrder.items.forEach((item) => {
          if (item.warehouse) warehouses.add(item.warehouse.toString());
        });

        for (const warehouseId of warehouses) {
          try {
            await this.shipmentsService.create({
              orderId: updatedOrder._id.toString(),
              warehouseId: warehouseId,
            });
            this.logger.log(
              `Shipment created for order ${updatedOrder.orderId} at warehouse ${warehouseId}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to create shipment for order ${updatedOrder.orderId}: ${error.message}`,
            );
          }
        }
      }

      // Notify User: Status Update
      const statusDisplay = status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
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
      this.logger.error(
        `Failed to update order ${id} status: ${error.message} `,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update status');
    }
  }

  async getOrderById(id: string) {
    try {
      const isObjectId = Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { orderId: id };

      const order = await this.orderModel
        .findOne(query)
        .populate('items.product')
        .populate('items.variant')
        .lean();

      if (!order) throw new NotFoundException('Order not found');
      return order;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to fetch order ${id}: ${error.message} `,
        error.stack,
      );
      throw new InternalServerErrorException('Resource fetch failed');
    }
  }

  async cancelOrder(
    orderId: string,
    userId: string,
    userRole: string,
    reason: string,
    cancelBy: 'customer' | 'admin' = 'customer',
  ) {
    try {
      this.validateObjectId(orderId, 'order');
      const order = await this.orderModel.findById(orderId);
      if (!order) throw new NotFoundException('Order not found');

      // If actor is manager, it's a reassignment request, not a full cancellation
      if (userRole === UserRole.MANAGER) {
        order.orderStatus = OrderStatus.PENDING_REASSIGNMENT;
        order.cancelReason = `Requested by Manager: ${reason}`;
        order.history.push({
          actor: new Types.ObjectId(userId),
          actorRole: userRole,
          action: 'REASSIGNMENT_REQUESTED',
          status: OrderStatus.PENDING_REASSIGNMENT,
          note: reason,
          timestamp: new Date(),
        });
        const saved = await order.save();

        // Notify Admin
        await this.notificationsService.create({
          title: 'Warehouse Fulfillment Issue',
          message: `Warehouse manager has requested reassignment for Order ${order.orderId}. Reason: ${reason}`,
          type: NotificationType.ORDER,
          recipientRole: 'admin',
          link: `/admin/orders/${order._id}`,
        });

        return saved;
      }

      // Admin/Customer full cancellation logic
      // User can only cancel if not shipped/delivered
      const nonCancellableByUser = [
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ];
      const nonCancellableByAdmin = [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ];

      const isRestricted =
        cancelBy === 'customer'
          ? nonCancellableByUser.includes(order.orderStatus)
          : nonCancellableByAdmin.includes(order.orderStatus);

      if (isRestricted) {
        throw new BadRequestException(
          `Order cannot be cancelled in ${order.orderStatus} status`,
        );
      }

      order.orderStatus = OrderStatus.CANCELLED;
      order.cancelReason = reason;
      order.cancelBy = cancelBy;
      order.cancelAt = new Date();

      // Restore stock if it was reserved/deducted
      if (
        order.isStockDeducted ||
        order.orderStatus !== OrderStatus.CANCELLED
      ) {
        for (const item of order.items) {
          if (item.status !== OrderStatus.CANCELLED && item.warehouse) {
            await this.inventoryService.releaseStock(
              item.variant.toString(),
              item.warehouse.toString(),
              item.quantity,
            );
            item.status = OrderStatus.CANCELLED;
            item.cancelReason = 'Order-level cancellation';
          }
        }
      } else {
        // If stock wasn't deducted yet, just mark items as cancelled
        order.items.forEach((item) => {
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
        timestamp: new Date(),
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
      this.logger.error(
        `Cancellation failed for order ${orderId}: ${error.message} `,
        error.stack,
      );
      throw new InternalServerErrorException('Cancellation failed');
    }
  }

  async cancelOrderItem(
    orderId: string,
    variantId: string,
    userId: string,
    userRole: string,
    reason: string,
    cancelBy: 'customer' | 'admin' = 'customer',
  ) {
    try {
      this.validateObjectId(orderId, 'order');
      this.validateObjectId(variantId, 'variant');

      const order = await this.orderModel.findById(orderId);
      if (!order) throw new NotFoundException('Order not found');

      // If actor is manager, mark for reassignment
      if (userRole === UserRole.MANAGER) {
        const item = order.items.find(
          (i) => i.variant.toString() === variantId,
        );
        if (item) {
          item.status = OrderStatus.PENDING_REASSIGNMENT;
          item.cancelReason = `Requested by Manager: ${reason}`;
          order.orderStatus = OrderStatus.PENDING_REASSIGNMENT;
          order.history.push({
            actor: new Types.ObjectId(userId),
            actorRole: userRole,
            action: 'ITEM_REASSIGNMENT_REQUESTED',
            status: OrderStatus.PENDING_REASSIGNMENT,
            note: `Item ${variantId}: ${reason}`,
            timestamp: new Date(),
          });
          const saved = await order.save();

          await this.notificationsService.create({
            title: 'Item Reassignment Requested',
            message: `Order ${order.orderId} item needs reassignment. Reason: ${reason}`,
            type: NotificationType.ORDER,
            recipientRole: 'admin',
            link: `/admin/orders/${order._id}`,
          });
          return saved;
        }
      }

      const itemIndex = order.items.findIndex(
        (i) => i.variant.toString() === variantId,
      );
      if (itemIndex === -1)
        throw new NotFoundException('Item not found in order');

      const item = order.items[itemIndex];
      if (item.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Item is already cancelled');
      }

      // Check if per-item cancellation is allowed
      if (
        order.orderStatus === OrderStatus.DELIVERED ||
        order.orderStatus === OrderStatus.CANCELLED
      ) {
        throw new BadRequestException(
          `Cannot cancel item when order is ${order.orderStatus} `,
        );
      }

      // Restore stock if it was deducted
      if (order.isStockDeducted && item.warehouse) {
        await this.inventoryService.releaseStock(
          variantId,
          item.warehouse.toString(),
          item.quantity,
        );
      }

      item.status = OrderStatus.CANCELLED;
      item.cancelReason = reason;

      // If all items are now cancelled, cancel the entire order
      const allCancelled = order.items.every(
        (i) => i.status === OrderStatus.CANCELLED,
      );
      if (allCancelled) {
        order.orderStatus = OrderStatus.CANCELLED;
        order.cancelReason = 'All items cancelled individually';
        order.cancelBy = cancelBy;
        order.cancelAt = new Date();
      }

      order.history.push({
        actor: new Types.ObjectId(userId),
        actorRole: userRole,
        action: 'ITEM_CANCELLED',
        status: order.orderStatus,
        note: `Item ${variantId} cancelled: ${reason}`,
        timestamp: new Date(),
      });

      // Recalculate total amount? (Business decision: usually NO for online paid orders unless refunding)
      // For now, let's keep total amount same but update items

      this.logger.warn(
        `Item ${variantId} in order ${orderId} cancelled by ${cancelBy} `,
      );
      return await order.save();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Item cancellation failed: ${error.message} `,
        error.stack,
      );
      throw new InternalServerErrorException('Item cancellation failed');
    }
  }

  async confirmOrderItemDispatch(
    orderId: string,
    variantId: string,
    warehouseId: string,
    userId: string,
    userRole: string,
  ) {
    try {
      this.validateObjectId(orderId, 'order');
      this.validateObjectId(variantId, 'variant');
      this.validateObjectId(warehouseId, 'warehouse');

      const order = await this.orderModel.findById(orderId);
      if (!order) throw new NotFoundException('Order not found');

      const item = order.items.find(
        (i) =>
          i.variant.toString() === variantId &&
          i.warehouse?.toString() === warehouseId,
      );
      if (!item)
        throw new NotFoundException(
          'Item not found for this warehouse in the order',
        );

      if (
        item.status === OrderStatus.CONFIRMED ||
        item.status === OrderStatus.PACKED ||
        item.status === OrderStatus.SHIPPED ||
        item.status === OrderStatus.DELIVERED
      ) {
        throw new BadRequestException('Item already confirmed or dispatched');
      }

      // NOTE: We no longer confirm dispatch here.
      // Physical stock reduction is moved to ShipmentsService.pickupShipment.
      // This step now only confirms fulfillment capability.

      // Manager can only confirm if order is ready (COD Pending or Paid)
      if (order.orderStatus === OrderStatus.CREATED) {
        throw new BadRequestException(
          'Order is awaiting payment. Cannot confirm items until payment is initialized or confirmed.',
        );
      }
      if (
        order.paymentMethod === PaymentMethod.RAZORPAY &&
        order.paymentStatus === PaymentStatus.PENDING
      ) {
        throw new BadRequestException(
          'Online payment is still pending. Please wait for payment confirmation before fulfilling.',
        );
      }

      // Step 1: If order is still pending, move it to confirmed
      if (order.orderStatus === OrderStatus.PENDING) {
        order.orderStatus = OrderStatus.CONFIRMED;
        order.history.push({
          actor: new Types.ObjectId(userId),
          actorRole: userRole,
          action: 'STATUS_UPDATE',
          status: OrderStatus.CONFIRMED,
          note: `Order auto-confirmed by manager on item confirmation`,
          timestamp: new Date(),
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
        timestamp: new Date(),
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

  async confirmWarehouseAllItems(
    orderId: string,
    warehouseId: string,
    userId: string,
    userRole: string,
  ) {
    try {
      this.validateObjectId(orderId, 'order');
      this.validateObjectId(warehouseId, 'warehouse');

      const order = await this.orderModel.findById(orderId);
      if (!order) throw new NotFoundException('Order not found');

      const myItems = order.items.filter(
        (i) => i.warehouse?.toString() === warehouseId,
      );

      if (myItems.length === 0) {
        throw new NotFoundException('No items found for this warehouse in the order');
      }

      const pendingItems = myItems.filter(
        (i) =>
          ![
            OrderStatus.CONFIRMED.toString(),
            OrderStatus.PACKED.toString(),
            OrderStatus.SHIPPED.toString(),
            OrderStatus.DELIVERED.toString(),
          ].includes(i.status?.toString()),
      );

      if (pendingItems.length === 0) {
        throw new BadRequestException('All items are already confirmed or dispatched');
      }

      // Manager can only confirm if order is ready (COD Pending or Paid)
      if (order.orderStatus === OrderStatus.CREATED) {
        throw new BadRequestException(
          'Order is awaiting payment. Cannot confirm items until payment is initialized or confirmed.',
        );
      }
      if (
        order.paymentMethod === PaymentMethod.RAZORPAY &&
        order.paymentStatus === PaymentStatus.PENDING
      ) {
        throw new BadRequestException(
          'Online payment is still pending. Please wait for payment confirmation before fulfilling.',
        );
      }

      // Step 1: If order is still pending, move it to confirmed
      if (order.orderStatus === OrderStatus.PENDING) {
        order.orderStatus = OrderStatus.CONFIRMED;
        order.history.push({
          actor: new Types.ObjectId(userId),
          actorRole: userRole,
          action: 'STATUS_UPDATE',
          status: OrderStatus.CONFIRMED,
          note: `Order auto-confirmed by manager on bulk item confirmation`,
          timestamp: new Date(),
        });
      }

      // Step 2: Mark all warehouse items as confirmed
      for (const item of pendingItems) {
        item.status = OrderStatus.CONFIRMED;
      }

      order.history.push({
        actor: new Types.ObjectId(userId),
        actorRole: userRole,
        action: 'ITEMS_BULK_CONFIRMED',
        status: order.orderStatus,
        note: `${pendingItems.length} items confirmed by manager at warehouse ${warehouseId}`,
        timestamp: new Date(),
      });

      const savedOrder = await order.save();
      this.eventsGateway.emitEvent('order.updated', savedOrder);

      return savedOrder;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Bulk dispatch failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Bulk dispatch failed');
    }
  }

  async reassignWarehouse(
    orderId: string,
    oldWarehouseId: string,
    newWarehouseId: string,
    userId: string,
    userRole: string,
  ) {
    try {
      this.validateObjectId(orderId, 'order');
      this.validateObjectId(oldWarehouseId, 'oldWarehouse');
      this.validateObjectId(newWarehouseId, 'newWarehouse');

      const order = await this.orderModel.findById(orderId);
      if (!order) throw new NotFoundException('Order not found');

      let itemsReassigned = 0;

      for (const item of order.items) {
        if (
          item.warehouse?.toString() === oldWarehouseId &&
          item.status !== OrderStatus.CANCELLED
        ) {
          // 1. Release stock from old warehouse
          await this.inventoryService.releaseStock(
            item.variant.toString(),
            oldWarehouseId,
            item.quantity,
          );

          // 2. Reserve stock in new warehouse
          await this.inventoryService.reserveStock(
            item.variant.toString(),
            newWarehouseId,
            item.quantity,
          );

          // 3. Update warehouse reference
          item.warehouse = new Types.ObjectId(newWarehouseId);
          item.status = OrderStatus.CONFIRMED; // Reset back to confirmed
          itemsReassigned++;
        }
      }

      if (itemsReassigned === 0) {
        throw new BadRequestException(
          'No items found for the specified old warehouse',
        );
      }

      // 4. Cancel existing shipments for the old warehouse
      const shipments = await this.shipmentsService.findAll({
        orderId: order._id.toString(),
        warehouseId: oldWarehouseId,
      });

      for (const shipment of shipments.data) {
        if (
          shipment.status !== 'CANCELLED' &&
          shipment.status !== 'DELIVERED'
        ) {
          await this.shipmentsService.cancelShipment(
            shipment._id.toString(),
            'Order reassigned to another warehouse',
          );
        }
      }

      // 5. Reset order status if it was pending reassignment
      if (order.orderStatus === OrderStatus.PENDING_REASSIGNMENT) {
        order.orderStatus = OrderStatus.CONFIRMED;
      }

      order.history.push({
        actor: new Types.ObjectId(userId),
        actorRole: userRole,
        action: 'WAREHOUSE_REASSIGNED',
        status: order.orderStatus,
        note: `Reassigned from ${oldWarehouseId} to ${newWarehouseId}`,
        timestamp: new Date(),
      });

      const savedOrder = await order.save();
      this.eventsGateway.emitEvent('order.updated', savedOrder);

      return savedOrder;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Reassignment failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Reassignment failed');
    }
  }

  async getWarehouseOrders(warehouseId: string) {
    return this.orderModel
      .find({
        'items.warehouse': new Types.ObjectId(warehouseId),
        orderStatus: {
          $in: [
            OrderStatus.CONFIRMED,
            OrderStatus.PENDING,
            OrderStatus.PACKED,
            OrderStatus.SHIPPED,
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.DELIVERED,
          ],
        },
        isDeleted: { $ne: true },
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
        timestamp: new Date(),
      });

      // If order was not cancelled/delivered, we should release stock
      const nonFilledStatus = [
        OrderStatus.CREATED,
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
      ];
      if (nonFilledStatus.includes(order.orderStatus)) {
        for (const item of order.items) {
          if (item.status !== OrderStatus.CANCELLED && item.warehouse) {
            await this.inventoryService.releaseStock(
              item.variant.toString(),
              item.warehouse.toString(),
              item.quantity,
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
      this.logger.error(
        `Failed to delete order ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete order');
    }
  }

  // ─── INVOICE ───

  async getInvoice(id: string, userId: string, userRole: string): Promise<any> {
    try {
      this.validateObjectId(id, 'order');

      const order = await this.orderModel
        .findOne({ _id: id, isDeleted: { $ne: true } })
        .populate<{ user: any }>('user', 'name email phone')
        .populate('items.variant')
        .lean()
        .exec();

      if (!order) throw new NotFoundException('Order not found');

      // Ownership check: customers can only see their own invoice
      const isAdminOrSubadmin = [UserRole.ADMIN, UserRole.SUB_ADMIN].includes(
        userRole as UserRole,
      );
      if (!isAdminOrSubadmin && order.user?._id?.toString() !== userId) {
        throw new UnauthorizedException(
          'You are not authorised to view this invoice',
        );
      }

      const storeConfig = await this.settingsService.getConfig();

      // Prioritise seller info from item snapshots if available
      const firstItem = order.items[0];

      return {
        seller: {
          legalName: firstItem?.sellerName || storeConfig?.legalName || '',
          gstin: firstItem?.sellerGstin || storeConfig?.gstin || '',
          stateCode: firstItem?.sellerStateCode || storeConfig?.stateCode || '',
          address: storeConfig?.address || '', // Address might still be global platform if not snapshotted
          email: storeConfig?.email || '',
          phone: storeConfig?.phone || '',
        },
        buyer: {
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          address: order.shippingAddress,
          gstin: null, // B2C orders — buyer GSTIN not captured
        },
        invoice: {
          invoiceNumber: order.invoiceNumber,
          invoiceDate: order.invoiceDate,
          orderId: order.orderId,
        },
        isInterState: order.isInterState,
        items: order.items.map((item: any) => ({
          title: item.title,
          sku: item.variant?.sku || '',
          attributes: item.variant?.attributes || [],
          thumbnail: item.image || '',
          hsnCode: item.hsnCode,
          gstRate: item.gstRate,
          quantity: item.quantity,
          unitPrice: item.price,
          basePrice: item.basePrice,
          cgst: item.cgst,
          sgst: item.sgst,
          igst: item.igst,
          gstAmountPerUnit: item.gstAmountPerUnit,
          lineTotal: item.lineTotal,
          lineTaxableValue: item.lineTaxableValue,
          lineCgst: item.lineCgst,
          lineSgst: item.lineSgst,
          lineIgst: item.lineIgst,
          lineTotalGst: item.lineTotalGst,
        })),
        totals: {
          subTotal: order.subTotal,
          totalCgst: order.totalCgst,
          totalSgst: order.totalSgst,
          totalIgst: order.totalIgst,
          totalGstAmount: order.totalGstAmount,
          shippingCharge: order.shippingCharge,
          totalAmount: order.totalAmount,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to get invoice for order ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve invoice');
    }
  }

  // ─── PACKING SLIP ───

  async getPackingSlip(orderId: string): Promise<any> {
    try {
      this.validateObjectId(orderId, 'order');

      const order = await this.orderModel
        .findOne({ _id: orderId, isDeleted: { $ne: true } })
        .populate<{ 'items.variant': any }>('items.variant', 'sku images')
        .lean()
        .exec();

      if (!order) throw new NotFoundException('Order not found');

      const storeConfig = await this.settingsService.getConfig();

      // Prioritise seller info from item snapshots if available
      const firstItem = order.items[0];

      return {
        seller: {
          legalName: firstItem?.sellerName || storeConfig?.legalName || '',
          gstin: firstItem?.sellerGstin || storeConfig?.gstin || '',
          stateCode: firstItem?.sellerStateCode || storeConfig?.stateCode || '',
          address: storeConfig?.address || '', // Address might still be global platform if not snapshotted
          email: storeConfig?.email || '',
          phone: storeConfig?.phone || '',
        },
        buyer: {
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          address: order.shippingAddress,
          gstin: null, // B2C orders — buyer GSTIN not captured
        },
        invoice: {
          invoiceNumber: order.invoiceNumber,
          invoiceDate: order.invoiceDate,
          orderId: order.orderId,
        },
        isInterState: order.isInterState,
        items: order.items.map((item: any) => ({
          title: item.title,
          sku: item.variant?.sku || '',
          attributes: item.variant?.attributes || [],
          thumbnail: item.image || '',
          hsnCode: item.hsnCode,
          gstRate: item.gstRate,
          quantity: item.quantity,
          unitPrice: item.price,
          basePrice: item.basePrice,
          cgst: item.cgst,
          sgst: item.sgst,
          igst: item.igst,
          gstAmountPerUnit: item.gstAmountPerUnit,
          lineTotal: item.lineTotal,
          lineTaxableValue: item.lineTaxableValue,
          lineCgst: item.lineCgst,
          lineSgst: item.lineSgst,
          lineIgst: item.lineIgst,
          lineTotalGst: item.lineTotalGst,
        })),
        totals: {
          subTotal: order.subTotal,
          totalCgst: order.totalCgst,
          totalSgst: order.totalSgst,
          totalIgst: order.totalIgst,
          totalGstAmount: order.totalGstAmount,
          shippingCharge: order.shippingCharge,
          totalAmount: order.totalAmount,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        `Failed to get invoice for order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve invoice');
    }
  }

}
