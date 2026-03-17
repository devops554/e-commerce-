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
import { UserRole } from 'src/users/schemas/user.schema';

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
  ) { }

  async create(customerId: string, dto: any): Promise<ReturnRequestDocument> {
    const { orderId, orderItemId, productId, variantId, quantity, reason, reasonDescription, evidenceMedia, refundMethod, bankDetails } = dto;

    // 1. Fetch order and validate item
    const order = await this.ordersService.getOrderById(orderId);
    // Safely extract the user id whether it is a raw ObjectId or a populated doc
    const rawUser = order.user as any;
    const orderUserId = rawUser?._id ? rawUser._id.toString() : rawUser?.toString();
    if (orderUserId !== customerId.toString()) {
      throw new BadRequestException('You do not own this order');
    }



    const orderItem = order.items.find((item: any) => item._id.toString() === orderItemId);
    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    // ── Case-insensitive status check ──────────────────────────────────────
    if (orderItem.status?.toUpperCase() !== 'DELIVERED') {
      throw new BadRequestException('Item must be delivered before initiating a return');
    }

    // 2. Use the ALREADY POPULATED product + variant from the order (same data the frontend sees)
    // getOrderById() calls .populate('items.product').populate('items.variant')
    const product: any = orderItem.product;
    const variant: any = orderItem.variant;

    if (!product) throw new NotFoundException('Product not found in order item');
    if (!variant) throw new NotFoundException('Variant not found in order item');

    // ── Resolve effective return policy ────────────────────────────────────
    // variant.returnPolicyOverride (if overrideEnabled) → product.returnPolicy
    const variantOverride = variant.returnPolicyOverride;
    const effectivePolicy: any =
      variantOverride?.overrideEnabled
        ? { ...product.returnPolicy, ...variantOverride }
        : product.returnPolicy;

    this['logger']?.log?.(`[Return] Effective policy for item ${orderItemId}: ${JSON.stringify(effectivePolicy)}`);

    let isReturnable = effectivePolicy?.isReturnable ?? false;
    const windowValue = effectivePolicy?.windowValue ?? 7;
    const windowUnit = effectivePolicy?.windowUnit ?? ReturnWindowUnit.DAYS;

    // ── Check excluded SKU patterns ────────────────────────────────────────
    // SKU exclusions only apply to discretionary returns (CHANGED_MIND, SIZE_ISSUE, OTHER).
    // Fault-based reasons always bypass them — these are seller/fulfillment faults.
    const FAULT_REASONS = ['DAMAGED', 'DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED'];
    const isFaultReturn = FAULT_REASONS.includes((reason ?? '').toUpperCase());

    const sku = variant.sku ?? '';
    const excludedPatterns: string[] = product.returnPolicy?.excludedSkuPatterns ?? [];
    const isExcluded = !isFaultReturn && excludedPatterns.some((pattern: string) => {
      try {
        if (pattern.startsWith('/') && pattern.endsWith('/'))
          return new RegExp(pattern.slice(1, -1), 'i').test(sku);
        return sku.toLowerCase().includes(pattern.toLowerCase());
      } catch {
        return sku.includes(pattern);
      }
    });

    if (isExcluded) isReturnable = false;

    if (!isReturnable) {
      throw new BadRequestException('This item is not eligible for a return based on the return policy.');
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

    // ── Normalise evidenceMedia ─────────────────────────────────────────────
    // Frontend may send plain URL strings OR {url, publicId} objects.
    // Schema expects [{url, publicId}] so we normalise here.
    const normalisedEvidence = (evidenceMedia ?? []).map((item: any) => {
      if (typeof item === 'string') return { url: item, publicId: '' };
      return item;
    });

    // 5. Create request
    const request = new this.returnRequestModel({
      ...dto,
      evidenceMedia: normalisedEvidence,
      orderId: order._id,
      orderItemId: new Types.ObjectId(orderItemId),
      productId: new Types.ObjectId(productId),
      variantId: new Types.ObjectId(variantId),
      customerId: new Types.ObjectId(customerId),
      warehouseId: orderItem.warehouse,
      sellerId: orderItem.seller,
      status: ReturnRequestStatus.PENDING,
      refundMethod,
      bankDetails,
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
        recipientRole: UserRole.MANAGER,
        recipientId: (warehouse.managerId as any)?._id?.toString() || warehouse.managerId.toString(),
        link: `/manager/returns/${saved._id}`,
        metadata: { returnRequestId: saved._id }
      });
    }

    // 7. Notify Admin & Subadmin
    const stakeholders = [UserRole.ADMIN, UserRole.SUB_ADMIN];
    for (const role of stakeholders) {
      await this.notificationsService.create({
        title: 'New Return Request',
        message: `Order ${order.orderId}: A return request has been submitted by ${order.shippingAddress?.fullName || 'Customer'}.`,
        type: NotificationType.ORDER,
        recipientRole: role,
        link: `/manager/returns/${saved._id}`,
        metadata: { returnRequestId: saved._id }
      });
    }

    return saved;
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, status, customerId, sellerId, warehouseId, orderId } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (customerId) filter.customerId = new Types.ObjectId(customerId);
    if (sellerId) filter.sellerId = new Types.ObjectId(sellerId);
    if (warehouseId) filter.warehouseId = new Types.ObjectId(warehouseId);
    if (orderId) filter.orderId = new Types.ObjectId(orderId);


    const [data, total] = await Promise.all([
      this.returnRequestModel
        .find(filter)
        .populate('orderId')
        .populate('productId')
        .populate('variantId')
        .populate('warehouseId')
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
      .populate('warehouseId')
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
          orderId: (request.orderId as any)?._id?.toString() || request.orderId.toString(),
          warehouseId: (request.warehouseId as any)?._id?.toString() || request.warehouseId.toString(),
          type: 'REVERSE' as any,
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
      recipientId: (request.customerId as any)?._id?.toString() || request.customerId.toString(),
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
        variantId: (request.variantId as any)?._id?.toString() || request.variantId.toString(),
        warehouseId: (request.warehouseId as any)?._id?.toString() || request.warehouseId.toString(),
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

    // Ensure item has been received and QC'd before refunding (unless exception is made)
    if (request.status !== ReturnRequestStatus.RECEIVED_AT_WAREHOUSE && request.status !== ReturnRequestStatus.REFUND_INITIATED) {
      throw new BadRequestException('Cannot initiate refund. Item must be received at warehouse first.');
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
      recipientId: (request.customerId as any)?._id?.toString() || request.customerId.toString(),
      link: `/profile/returns/${request._id}`,
    });

    return saved;
  }
}
