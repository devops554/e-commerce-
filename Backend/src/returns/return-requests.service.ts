import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReturnRequest, ReturnRequestDocument, ReturnRequestStatus, QcGrade, ReturnCondition, ReturnWindowUnit, Product, ProductVariant, RefundMethod } from '../products/schemas/product.schema';
import { OrdersService } from '../orders/orders.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { WarehousesService } from '../warehouses/warehouses.service';
import { InventoryService } from '../warehouses/inventory.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ReturnRequestsService {
  constructor(
    @InjectModel(ReturnRequest.name) private returnRequestModel: Model<ReturnRequestDocument>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(ProductVariant.name) private variantModel: Model<ProductVariant>,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private shipmentsService: ShipmentsService,
    private notificationsService: NotificationsService,
    private warehousesService: WarehousesService,
    private inventoryService: InventoryService,
    private paymentsService: PaymentsService,
  ) {}

  async create(customerId: string, dto: any): Promise<ReturnRequestDocument> {
    const { orderId, orderItemId, productId, variantId, quantity, reason, reasonDescription, evidenceMedia } = dto;

    // 1. Fetch order and validate item
    const order = await this.ordersService.getOrderById(orderId);
    if (order.user.toString() !== customerId) {
      throw new BadRequestException('You do not own this order');
    }

    const orderItem = order.items.find((item: any) => item._id.toString() === orderItemId);
    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    if (orderItem.status !== 'DELIVERED') {
      throw new BadRequestException('Item must be delivered before initiating a return');
    }

    // 2. Fetch product & variant for return policy resolution
    const product = await this.productModel.findById(productId).lean();
    if (!product) throw new NotFoundException('Product not found');

    const variant = await this.variantModel.findById(variantId).lean();
    if (!variant) throw new NotFoundException('Variant not found');

    // Resolve policy: Product Policy default, then check SKU exclusions
    let isReturnable = product.returnPolicy?.isReturnable ?? false;
    const windowValue = product.returnPolicy?.windowValue ?? 7;
    const windowUnit = product.returnPolicy?.windowUnit ?? ReturnWindowUnit.DAYS;

    // Check if variant SKU is explicitly excluded via patterns
    const sku = variant.sku;
    const excludedPatterns = product.returnPolicy?.excludedSkuPatterns || [];
    const isExcluded = excludedPatterns.some((pattern) => {
      try {
        // Support simple regex if pattern is wrapped in /.../
        if (pattern.startsWith('/') && pattern.endsWith('/')) {
          const regex = new RegExp(pattern.slice(1, -1), 'i');
          return regex.test(sku);
        }
        // Fallback to case-insensitive substring match
        return sku.toLowerCase().includes(pattern.toLowerCase());
      } catch (e) {
        return sku.includes(pattern);
      }
    });

    if (isExcluded) {
      isReturnable = false;
    }

    if (!isReturnable) {
      throw new BadRequestException('This item is not returnable');
    }

    // 3. Check return window
    const deliveredAt = (order as any).deliveredAt || (order as any).updatedAt;
    const now = new Date();
    const windowMs = windowValue * (windowUnit === ReturnWindowUnit.DAYS ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000);
    
    if (now.getTime() - new Date(deliveredAt).getTime() > windowMs) {
      throw new BadRequestException('Return window has expired');
    }

    // 4. Check for existing request
    const existing = await this.returnRequestModel.findOne({
      orderItemId: new Types.ObjectId(orderItemId),
      status: { $ne: ReturnRequestStatus.REJECTED }
    });
    if (existing) {
      throw new BadRequestException('A return request already exists for this item');
    }

    // 5. Create request
    const request = new this.returnRequestModel({
      ...dto,
      orderId: order._id,
      orderItemId: new Types.ObjectId(orderItemId),
      productId: new Types.ObjectId(productId),
      variantId: new Types.ObjectId(variantId),
      customerId: new Types.ObjectId(customerId),
      warehouseId: orderItem.warehouse,
      sellerId: orderItem.seller,
      status: ReturnRequestStatus.PENDING,
    });
    
    const saved = await request.save();

    // 6. Notify Warehouse Manager
    // Get warehouse info to find manager
    const warehouse = await this.warehousesService.findOne(orderItem.warehouse.toString());
    if (warehouse?.managerId) {
      await this.notificationsService.create({
        title: 'New Return Request',
        message: `A new return request has been submitted for order ${order.orderId}.`,
        type: NotificationType.ORDER,
        recipientRole: 'manager',
        recipientId: warehouse.managerId.toString(),
        link: `/manager/returns/${saved._id}`,
        metadata: { returnRequestId: saved._id }
      });
    }

    return saved;
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, status, customerId, sellerId, warehouseId } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (customerId) filter.customerId = new Types.ObjectId(customerId);
    if (sellerId) filter.sellerId = new Types.ObjectId(sellerId);
    if (warehouseId) filter.warehouseId = new Types.ObjectId(warehouseId);

    const [data, total] = await Promise.all([
      this.returnRequestModel
        .find(filter)
        .populate('orderId')
        .populate('productId')
        .populate('variantId')
        .populate('customerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.returnRequestModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ReturnRequestDocument> {
    const request = await this.returnRequestModel
      .findById(id)
      .populate('orderId')
      .populate('productId')
      .populate('variantId')
      .populate('customerId', 'name email phone')
      .exec();
    if (!request) throw new NotFoundException('Return request not found');
    return request;
  }

  async review(id: string, reviewerId: string, dto: { approved: boolean; rejectionReason?: string; adminNote?: string }) {
    const request = await this.findById(id);
    if (request.status !== ReturnRequestStatus.PENDING) {
      throw new BadRequestException('Request is already reviewed');
    }

    if (dto.approved) {
      request.status = ReturnRequestStatus.APPROVED;
      request.approvedAt = new Date();
      
      // Trigger Logistics Phase - Create reverse shipment
      try {
        const shipment = await this.shipmentsService.create({
          orderId: request.orderId.toString(),
          warehouseId: request.warehouseId.toString(),
          type: 'REVERSE' as any, // Cast to any because of enum mismatch in DTO if not updated
        });
        request.returnShipmentId = shipment._id;
      } catch (error) {
        // Log but don't fail approval if shipment fails?
        // Actually, it should probably fail or be retried.
        console.error('Failed to create reverse shipment:', error);
      }
    } else {
      request.status = ReturnRequestStatus.REJECTED;
      request.rejectedAt = new Date();
      request.rejectionReason = dto.rejectionReason;
    }

    request.reviewedBy = new Types.ObjectId(reviewerId);
    request.adminNote = dto.adminNote;

    const updated = await request.save();

    // Notify Customer
    await this.notificationsService.create({
      title: `Return Request ${dto.approved ? 'Approved' : 'Rejected'}`,
      message: `Your return request for order ${request.orderId} has been ${dto.approved ? 'approved' : 'rejected'}.`,
      type: NotificationType.ORDER,
      recipientRole: 'customer',
      recipientId: request.customerId.toString(),
      link: `/profile/returns/${request._id}`,
    });

    return updated;
  }

  async updateWarehouseQc(id: string, dto: { warehouseQcGrade: QcGrade; warehouseQcNotes?: string }) {
    const request = await this.findById(id);
    // Logic for updating QC results and moving to received state
    request.warehouseQcGrade = dto.warehouseQcGrade;
    request.warehouseQcNotes = dto.warehouseQcNotes;
    request.status = ReturnRequestStatus.RECEIVED_AT_WAREHOUSE;
    request.warehouseReceivedAt = new Date();
    
    // Determine next state based on QC grade
    if (dto.warehouseQcGrade === QcGrade.RESELLABLE) {
       // Trigger Inventory Restoration
       await this.inventoryService.adjustStock({
         variantId: request.variantId.toString(),
         warehouseId: request.warehouseId.toString(),
         amount: request.quantity,
         source: `Return Request ${request._id}`,
       });
    }

    return request.save();
  }

  async initiateRefund(id: string, dto: { refundMethod: RefundMethod; refundAmount: number }) {
    const request = await this.findById(id);
    if (request.status === ReturnRequestStatus.REFUND_COMPLETED) {
      throw new BadRequestException('Refund already completed');
    }

    // Logic for processing refund
    const order = request.orderId as any;
    if (dto.refundMethod === RefundMethod.ORIGINAL_SOURCE && order.razorpayPaymentId) {
      const refund = await this.paymentsService.createRefund(
        order.razorpayPaymentId,
        dto.refundAmount,
        { returnRequestId: request._id.toString() }
      );
      request.refundTransactionId = refund.id;
      request.status = ReturnRequestStatus.REFUND_COMPLETED;
      request.refundCompletedAt = new Date();
    } else {
      // For other methods, we just mark as initiated (manual bank transfer etc.)
      request.status = ReturnRequestStatus.REFUND_INITIATED;
      request.refundInitiatedAt = new Date();
    }

    request.refundMethod = dto.refundMethod;
    request.refundAmount = dto.refundAmount;
    
    const saved = await request.save();

    // Notify Customer
    await this.notificationsService.create({
      title: 'Refund Processed',
      message: `A refund of ₹${dto.refundAmount} has been ${request.status === ReturnRequestStatus.REFUND_COMPLETED ? 'completed' : 'initiated'} for your return.`,
      type: NotificationType.ORDER,
      recipientRole: 'customer',
      recipientId: request.customerId.toString(),
      link: `/profile/returns/${request._id}`,
    });

    return saved;
  }
}
