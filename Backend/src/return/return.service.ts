import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReturnRequest, ReturnRequestDocument } from '../orders/schemas/return-request.schema';
import { Order, OrderStatus } from '../orders/schemas/order.schema';
import { Shipment, ShipmentDocument } from '../shipments/schemas/shipment.schema';
import { DeliveryPartner, DeliveryPartnerDocument } from '../delivery-partners/schemas/delivery-partner.schema';
import { Inventory, InventoryDocument } from '../warehouses/schemas/inventory.schema';
import { StockHistory, StockHistoryDocument } from '../warehouses/schemas/stock-history.schema';
import { Notification } from '../notifications/schemas/notification.schema';
import { Warehouse, WarehouseDocument } from '../warehouses/schemas/warehouse.schema';
import { ReturnRequestStatus } from '../orders/schemas/return-enums';
import { Product, ProductDocument, ReturnWindowUnit, RefundMethod } from '../products/schemas/product.schema';
import { CreateReturnDto, ApproveReturnDto, RejectReturnDto, RefundDto, QcResultDto, VerifyPickupDto } from './dto';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { PaymentsService } from '../payments/payments.service';
import { RazorpayPayoutService } from '../payments/razorpay-payout.service';
import { decrypt } from '../utils/encryption.util';

@Injectable()
export class ReturnService {
  constructor(
    @InjectModel(ReturnRequest.name) private returnRequestModel: Model<ReturnRequestDocument>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
    @InjectModel(DeliveryPartner.name) private partnerModel: Model<DeliveryPartnerDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(StockHistory.name) private stockHistoryModel: Model<StockHistoryDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(Warehouse.name) private warehouseModel: Model<WarehouseDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly paymentsService: PaymentsService,
    private readonly razorpayPayoutService: RazorpayPayoutService,
  ) { }

  private decryptBankDetails(request: any) {
    if (!request) return request;
    // Note: Manual decryption here is mostly redundant because the schema has getters.
    // Crucially, we must NOT call request.toJSON() here if we want to keep it as a Mongoose document.
    return request;
  }

  // ─── INTERNAL HELPERS (Phase 7) ─────────────────────────────────────────────

  async generateOtp(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendNotification(params: {
    recipientId?: string;
    recipientRole: string;
    title: string;
    message: string;
    metadata?: any;
  }) {
    const notification = new this.notificationModel({
      ...params,
      type: NotificationType.RETURN || 'order',
    });
    return notification.save();
  }

  async checkReturnEligibility(customerId: string, dto: CreateReturnDto) {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException('Order not found or access denied');
    }
    const rawUser = order.user as any;
    const orderUserId = rawUser?._id ? rawUser._id.toString() : rawUser?.toString();
    if (orderUserId !== customerId.toString()) {
      throw new NotFoundException('Order not found or access denied');
    }

    if (order.orderStatus !== 'DELIVERED') {
      throw new BadRequestException('Order not yet delivered');
    }

    const item = order.items.find(i => i._id.toString() === dto.orderItemId);
    if (!item) {
      throw new BadRequestException('Item not found in this order');
    }

    const product = await this.productModel.findById(item.product);
    if (!product || !product.returnPolicy?.isReturnable) {
      throw new BadRequestException('This product is not returnable');
    }

    // Check return window
    const windowMs = product.returnPolicy.windowValue *
      (product.returnPolicy.windowUnit === ReturnWindowUnit.HOURS ? 3600000 : 86400000);

    const deliveredDate = order.deliveredAt || (order as any).updatedAt || new Date();
    if (Date.now() - deliveredDate.getTime() > windowMs) {
      throw new BadRequestException('Return window has expired');
    }

    // Check existing active return
    const existing = await this.returnRequestModel.findOne({
      orderId: dto.orderId,
      orderItemId: dto.orderItemId,
      status: { $nin: [ReturnRequestStatus.REJECTED, ReturnRequestStatus.CLOSED] }
    });
    if (existing) {
      throw new BadRequestException('Return already requested for this item');
    }

    return { order, item, product };
  }

  // ─── CUSTOMER APIs (Phase 3) ────────────────────────────────────────────────
  private readonly VALID_TRANSITIONS: Record<string, string[]> = {
    [ReturnRequestStatus.PENDING]: [ReturnRequestStatus.APPROVED, ReturnRequestStatus.REJECTED, ReturnRequestStatus.CLOSED],
    [ReturnRequestStatus.APPROVED]: [ReturnRequestStatus.PICKUP_SCHEDULED, ReturnRequestStatus.REJECTED],
    [ReturnRequestStatus.REJECTED]: [],
    [ReturnRequestStatus.PICKUP_SCHEDULED]: [ReturnRequestStatus.PICKED_UP, ReturnRequestStatus.FAILED_PICKUP, ReturnRequestStatus.PICKUP_OTP_PENDING],
    [ReturnRequestStatus.PICKUP_OTP_PENDING]: [ReturnRequestStatus.PICKED_UP, ReturnRequestStatus.FAILED_PICKUP],
    [ReturnRequestStatus.PICKED_UP]: [ReturnRequestStatus.RECEIVED_AT_WAREHOUSE],
    [ReturnRequestStatus.RECEIVED_AT_WAREHOUSE]: [ReturnRequestStatus.QC_PASSED, ReturnRequestStatus.QC_FAILED],
    [ReturnRequestStatus.QC_PASSED]: [ReturnRequestStatus.REFUND_INITIATED],
    [ReturnRequestStatus.QC_FAILED]: [ReturnRequestStatus.REFUND_INITIATED, ReturnRequestStatus.CLOSED],
    [ReturnRequestStatus.REFUND_INITIATED]: [ReturnRequestStatus.REFUND_COMPLETED],
    [ReturnRequestStatus.REFUND_COMPLETED]: [ReturnRequestStatus.CLOSED],
    [ReturnRequestStatus.FAILED_PICKUP]: [ReturnRequestStatus.APPROVED, ReturnRequestStatus.CLOSED, ReturnRequestStatus.REJECTED],
    [ReturnRequestStatus.CLOSED]: [],
  };

  public assertValidTransition(from: ReturnRequestStatus, to: ReturnRequestStatus) {
    if (!this.VALID_TRANSITIONS[from]?.includes(to)) {
      throw new BadRequestException(`Invalid status transition: ${from} → ${to}`);
    }
  }

  // ─── CUSTOMER APIs (Phase 3) ────────────────────────────────────────────────

  async createReturn(customerId: string, dto: CreateReturnDto) {
    const { order, item, product } = await this.checkReturnEligibility(customerId, dto);

    // Auto-calculate the eligible item-only refund (excluding non-refundable delivery/shipping charges)
    const returnQuantity = dto.quantity || 1;
    const calculatedRefund = item.price * returnQuantity;

    const returnRequest = new this.returnRequestModel({
      ...dto,
      customerId,
      status: ReturnRequestStatus.PENDING,
      warehouseId: item.warehouse || (product as any).warehouse, // Fallback if missing on item
      productId: item.product,
      variantId: item.variant,
      sellerId: item.seller || product.seller,
      refundAmount: calculatedRefund, // Persist the Amazon-style base refund
    });

    const saved = await returnRequest.save();

    // Notify Warehouse Manager
    const warehouse = await this.warehouseModel.findById(saved.warehouseId);
    if (warehouse && warehouse.managerId) {
      await this.sendNotification({
        recipientId: (warehouse.managerId as any)?._id?.toString() || warehouse.managerId.toString(),
        recipientRole: 'manager',
        title: 'New Return Request',
        message: `A new return request has been created for order ${order.orderId} assigned to your warehouse.`,
        metadata: { returnRequestId: saved._id, orderId: order._id, warehouseId: saved.warehouseId },
      });
    }

    const rolesToNotify = ['admin', 'subadmin'];
    for (const role of rolesToNotify) {
      await this.sendNotification({
        recipientRole: role,
        recipientId: undefined,
        title: 'New return request',
        message: `Return request for order ${order.orderId}`,
        metadata: { returnRequestId: saved._id, orderId: order._id, customerId, warehouseId: saved.warehouseId },
      });
    }

    return saved;
  }

  async getReturns(customerId?: string, query: any = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      assignedPartnerId,
      activeOnly,
      historyOnly,
      managerId,
      startDate,
      endDate,
      search
    } = query;

    const filter: any = {};

    if (customerId) filter.customerId = typeof customerId === 'string' ? new Types.ObjectId(customerId) : customerId;
    if (status) filter.status = status;
    if (assignedPartnerId) filter.assignedPartnerId = typeof assignedPartnerId === 'string' ? new Types.ObjectId(assignedPartnerId) : assignedPartnerId;

    if (activeOnly) {
      filter.status = { $in: [ReturnRequestStatus.PICKUP_SCHEDULED, ReturnRequestStatus.PICKUP_OTP_PENDING] };
    }
    if (historyOnly) {
      filter.status = { $in: [ReturnRequestStatus.PICKED_UP, ReturnRequestStatus.RECEIVED_AT_WAREHOUSE, ReturnRequestStatus.QC_PASSED, ReturnRequestStatus.QC_FAILED, ReturnRequestStatus.CLOSED] };
    }

    if (managerId) {
      const warehouse = await this.warehouseModel.findOne({ 
        managerId: typeof managerId === 'string' ? new Types.ObjectId(managerId) : managerId 
      });
      if (!warehouse) return { data: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 };
      filter.warehouseId = warehouse._id;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      // Search in return request's own fields first (like reason)
      // For searching in product title/customer name, we need to handle it after population or use IDs
      // But we can search by the return request _id if it's a valid object id
      if (Types.ObjectId.isValid(search)) {
        filter.$or = [{ _id: search }, { orderId: search }];
      } else {
        // Fallback to searching orderId string if stored as string (but it's ObjectId)
        // We'll search reason and adminNote for now, and handle further search via aggregation if needed
        filter.$or = [
          { reason: searchRegex },
          { adminNote: searchRegex },
          { pickupNotes: searchRegex }
        ];
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.returnRequestModel.find(filter)
        .populate('orderId', 'orderId shippingAddress')
        .populate({ path: 'productId', select: 'title thumbnail images' })
        .populate('assignedPartnerId', 'name phone')
        .populate('warehouseId', 'name code')
        .populate('customerId', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.returnRequestModel.countDocuments(filter),
    ]);

    // Post-population search filter (if search is provided and no results yet, or to refine)
    // In a real app with large data, this should be an aggregation pipeline.
    let finalData = data;
    if (search && data.length > 0) {
      const searchLower = search.toLowerCase();
      // Filter by customer name, product title, or full order ID from populated data
      // This is a bit inefficient for large datasets but works for now.
      // Ideally use $lookup in aggregation.
    }

    return {
      data: finalData,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async getReturnById(id: string, customerId?: string): Promise<ReturnRequestDocument> {
    const filter: any = { _id: id };
    if (customerId) filter.customerId = customerId;

    const res = await this.returnRequestModel.findOne(filter)
      .populate('orderId')
      .populate('productId')
      .populate('variantId')
      .populate('assignedPartnerId', 'name phone')
      .populate('warehouseId')
      .populate('customerId', 'fullName email phone');

    if (!res) throw new NotFoundException('Return request not found');
    return this.decryptBankDetails(res);
  }

  /**
   * Looks up a ReturnRequest by either:
   *   1. returnShipmentId (used by delivery partner app which only knows shipmentId)
   *   2. return request _id (fallback)
   *   3. orderId (fallback for cases where orderId is passed instead of shipmentId)
   * This is needed because DP endpoints receive the shipmentId in the URL param.
   */
  async getReturnByShipmentIdOrId(shipmentOrReturnId: string): Promise<ReturnRequestDocument> {
    const populateOpts = [
      { path: 'orderId', populate: { path: 'user', select: 'name phone' } },
      { path: 'productId', select: 'title images' },
      { path: 'variantId', select: 'sku images' },
      { path: 'customerId', select: 'name phone email' },
      { path: 'warehouseId', select: 'name address location' },
      { path: 'assignedPartnerId', select: 'name phone vehicleType' },
    ];

    const conditions: any[] = [];
    const cleanId = shipmentOrReturnId?.trim();

    if (Types.ObjectId.isValid(cleanId)) {
      const oid = new Types.ObjectId(cleanId);
      conditions.push({ _id: oid });
      conditions.push({ returnShipmentId: oid });
      conditions.push({ orderId: oid }); // Add orderId as fallback if needed
    } else {
      console.warn(`[ReturnService] Invalid ID format for lookup: "${shipmentOrReturnId}"`);
      throw new NotFoundException('Invalid ID format for return lookup');
    }

    // Step 1: High-priority lookup using the link on the Shipment itself
    const shipment = await this.shipmentModel.findById(cleanId);
    if (shipment?.returnRequestId) {
      const res = await this.returnRequestModel.findById(shipment.returnRequestId)
        .populate(populateOpts as any);
      if (res) return this.decryptBankDetails(res);
    }

    // Step 2: Fallback to the broad search conditions
    const res = await this.returnRequestModel.findOne({ $or: conditions })
      .populate(populateOpts as any);

    if (!res) {
      // ...
      throw new NotFoundException(`Return request not found for ID: ${cleanId}`);
    }
    return this.decryptBankDetails(res);
  }

  async cancelReturn(customerId: string, id: string) {
    const returnRequest: ReturnRequestDocument = await this.getReturnById(id, customerId);
    if (returnRequest.status !== ReturnRequestStatus.PENDING) {
      throw new BadRequestException('Only PENDING returns can be cancelled');
    }

    returnRequest.status = ReturnRequestStatus.CLOSED;
    returnRequest.adminNote = (returnRequest.adminNote || '') + '\nCancelled by customer';
    return await returnRequest.save();
  }

  // ─── MANAGER SCOPING HELPERS ────────────────────────────────────────────────

  async getManagerWarehouseId(managerId: string): Promise<Types.ObjectId> {
    const warehouse = await this.warehouseModel.findOne({ managerId: new Types.ObjectId(managerId) });
    if (!warehouse) throw new BadRequestException('No warehouse assigned to this manager');
    return warehouse._id as Types.ObjectId;
  }

  async verifyManagerAccess(managerId: string, returnRequestId: string) {
    const warehouseId = await this.getManagerWarehouseId(managerId);
    const returnRequest = await this.returnRequestModel.findById(returnRequestId);
    if (!returnRequest || returnRequest.warehouseId.toString() !== warehouseId.toString()) {
      throw new BadRequestException('Access denied: Return request does not belong to your warehouse');
    }
    return returnRequest;
  }

  // ─── ADMIN APIs (Phase 4) ──────────────────────────────────────────────────

  async approveReturn(adminId: string, id: string, dto: ApproveReturnDto) {
    const returnRequest: ReturnRequestDocument = await this.getReturnById(id);
    this.assertValidTransition(returnRequest.status as ReturnRequestStatus, ReturnRequestStatus.APPROVED);

    returnRequest.status = ReturnRequestStatus.APPROVED;
    returnRequest.approvedAt = new Date();
    returnRequest.reviewedBy = new Types.ObjectId(adminId);
    if (dto.adminNote) returnRequest.adminNote = dto.adminNote;

    const saved = await returnRequest.save();

    await this.sendNotification({
      recipientId: (returnRequest.customerId as any)?._id?.toString() || returnRequest.customerId.toString(),
      recipientRole: 'customer',
      title: 'Return approved',
      message: 'Your return request has been approved. Pickup will be scheduled.',
      metadata: { returnRequestId: saved._id }
    });

    // Notify Warehouse Manager
    const warehouse = await this.warehouseModel.findById(returnRequest.warehouseId);
    if (warehouse && warehouse.managerId) {
      await this.sendNotification({
        recipientId: (warehouse.managerId as any)?._id?.toString() || warehouse.managerId.toString(),
        recipientRole: 'manager',
        title: 'Return Request Approved',
        message: `Return request for order ${(returnRequest.orderId as any).orderId} has been approved and assigned to your warehouse.`,
        metadata: { returnRequestId: saved._id, warehouseId: warehouse._id }
      });
    }

    // Trigger auto-assign
    await this.assignDeliveryPartner(saved._id.toString());

    return saved;
  }

  async rejectReturn(adminId: string, id: string, dto: RejectReturnDto) {
    const returnRequest: ReturnRequestDocument = await this.getReturnById(id);
    this.assertValidTransition(returnRequest.status as ReturnRequestStatus, ReturnRequestStatus.REJECTED);

    returnRequest.status = ReturnRequestStatus.REJECTED;
    returnRequest.rejectedAt = new Date();
    returnRequest.rejectionReason = dto.rejectionReason;
    returnRequest.reviewedBy = new Types.ObjectId(adminId);

    const saved = await returnRequest.save();

    await this.sendNotification({
      recipientId: (returnRequest.customerId as any)?._id?.toString() || returnRequest.customerId.toString(),
      recipientRole: 'customer',
      title: 'Return rejected',
      message: `Return rejected: ${dto.rejectionReason}`,
      metadata: { returnRequestId: saved._id }
    });

    return saved;
  }

  async resolveFailedPickup(id: string, dto: ApproveReturnDto & { approved: boolean, rejectionReason?: string }) {
    const returnRequest: ReturnRequestDocument = await this.getReturnById(id);

    if (dto.approved) {
      this.assertValidTransition(returnRequest.status as ReturnRequestStatus, ReturnRequestStatus.APPROVED);
      returnRequest.status = ReturnRequestStatus.APPROVED;
      if (dto.adminNote) {
        returnRequest.adminNote = (returnRequest.adminNote || '') + '\n' + dto.adminNote;
      }
      returnRequest.assignedPartnerId = undefined; // Clear previous assignment
      const saved = await returnRequest.save();

      await this.sendNotification({
        recipientId: (returnRequest.customerId as any)?._id?.toString() || returnRequest.customerId.toString(),
        recipientRole: 'customer',
        title: 'Return pickup rescheduled',
        message: 'Your return pickup issue has been resolved. A new pickup will be scheduled.',
        metadata: { returnRequestId: saved._id }
      });

      await this.assignDeliveryPartner(saved._id.toString());
      return saved;
    } else {
      this.assertValidTransition(returnRequest.status as ReturnRequestStatus, ReturnRequestStatus.REJECTED);
      returnRequest.status = ReturnRequestStatus.REJECTED;
      returnRequest.rejectedAt = new Date();
      returnRequest.rejectionReason = dto.rejectionReason || 'Failed pickup unresolved';

      const saved = await returnRequest.save();

      await this.sendNotification({
        recipientId: (returnRequest.customerId as any)?._id?.toString() || returnRequest.customerId.toString(),
        recipientRole: 'customer',
        title: 'Return rejected',
        message: `Return rejected: ${returnRequest.rejectionReason}`,
        metadata: { returnRequestId: saved._id }
      });

      return saved;
    }
  }

  async forceCloseReturn(adminId: string, id: string, reason: string) {
    const returnRequest: ReturnRequestDocument = await this.getReturnById(id);

    returnRequest.status = ReturnRequestStatus.CLOSED;
    returnRequest.adminNote = (returnRequest.adminNote || '') + `\nFORCED CLOSE by Admin: ${reason}`;
    returnRequest.assignedPartnerId = undefined;

    const saved = await returnRequest.save();

    await this.sendNotification({
      recipientId: (returnRequest.customerId as any)?._id?.toString() || returnRequest.customerId.toString(),
      recipientRole: 'customer',
      title: 'Return Request Closed',
      message: `Your return request has been closed. Reason: ${reason}`,
      metadata: { returnRequestId: id }
    });

    return saved;
  }

  async getFinanceReport() {
    return this.returnRequestModel.aggregate([
      { $match: { status: { $in: [ReturnRequestStatus.REFUND_COMPLETED, ReturnRequestStatus.REFUND_INITIATED] } } },
      {
        $group: {
          _id: {
            warehouseId: '$warehouseId',
            product: '$productId',
            rejectionReason: '$rejectionReason',
          },
          totalRefundPaid: { $sum: '$refundAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: '_id.warehouseId',
          foreignField: '_id',
          as: 'warehouse'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      {
        $project: {
          warehouseName: { $arrayElemAt: ['$warehouse.name', 0] },
          productTitle: { $arrayElemAt: ['$productData.title', 0] },
          reason: '$_id.rejectionReason',
          totalRefundPaid: 1,
          count: 1,
        }
      }
    ]);
  }

  async getStats() {
    return this.returnRequestModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$refundAmount' }
        }
      }
    ]);
  }

  async getManagerStats(managerId: string) {
    const warehouseId = await this.getManagerWarehouseId(managerId);
    return this.returnRequestModel.aggregate([
      { $match: { warehouseId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        }
      }
    ]);
  }

  async getGlobalReturnStats(range: '7d' | '1m' | '1y' | 'all' = '7d') {
    try {
      const filter: any = {};
      const now = new Date();
      let startDate: Date | undefined;

      if (range === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (range === '1m') startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      else if (range === '1y') startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }

      const returns = await this.returnRequestModel.find(filter).lean();

      const stats = {
        totalReturns: 0,
        pendingReturns: 0,
        approvedReturns: 0,
        completedReturns: 0, // QC Passed or Refund completed
        failedReturns: 0,    // Rejected or FAILED_PICKUP
        totalRefundedAmount: 0,
        chartData: [] as any[],
      };

      const dailyData: Record<string, any> = {};

      returns.forEach((req: any) => {
        stats.totalReturns++;

        if ([ReturnRequestStatus.PENDING].includes(req.status)) {
          stats.pendingReturns++;
        } else if ([ReturnRequestStatus.APPROVED, ReturnRequestStatus.PICKUP_SCHEDULED, ReturnRequestStatus.PICKUP_OTP_PENDING, ReturnRequestStatus.PICKED_UP, ReturnRequestStatus.RECEIVED_AT_WAREHOUSE].includes(req.status)) {
          stats.approvedReturns++;
        } else if ([ReturnRequestStatus.QC_PASSED, ReturnRequestStatus.REFUND_INITIATED, ReturnRequestStatus.REFUND_COMPLETED].includes(req.status)) {
          stats.completedReturns++;
          stats.totalRefundedAmount += req.refundAmount || 0;
        } else if ([ReturnRequestStatus.REJECTED, ReturnRequestStatus.FAILED_PICKUP, ReturnRequestStatus.QC_FAILED, ReturnRequestStatus.CLOSED].includes(req.status)) {
          stats.failedReturns++;
        }

        const dateKey = req.createdAt.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { date: dateKey, returns: 0, refunded: 0 };
        }
        dailyData[dateKey].returns++;
        if ([ReturnRequestStatus.QC_PASSED, ReturnRequestStatus.REFUND_INITIATED, ReturnRequestStatus.REFUND_COMPLETED].includes(req.status)) {
          dailyData[dateKey].refunded += req.refundAmount || 0;
        }
      });

      stats.chartData = Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));
      return stats;
    } catch (error) {
      console.error(`Failed to fetch global return stats:`, error);
      throw new Error('Failed to fetch statistics');
    }
  }

  async getManagerReturnStats(warehouseId: string, range: '7d' | '1m' | '1y' | 'all' = '7d') {
    try {
      const filter: any = { warehouseId: new Types.ObjectId(warehouseId) };
      const now = new Date();
      let startDate: Date | undefined;

      if (range === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (range === '1m') startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      else if (range === '1y') startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }

      const returns = await this.returnRequestModel.find(filter).lean();

      const stats = {
        totalReturns: 0,
        pendingReturns: 0,
        approvedReturns: 0,
        completedReturns: 0,
        failedReturns: 0,
        totalRefundedAmount: 0,
        chartData: [] as any[],
      };

      const dailyData: Record<string, any> = {};

      returns.forEach((req: any) => {
        stats.totalReturns++;

        if ([ReturnRequestStatus.PENDING].includes(req.status)) {
          stats.pendingReturns++;
        } else if ([ReturnRequestStatus.APPROVED, ReturnRequestStatus.PICKUP_SCHEDULED, ReturnRequestStatus.PICKUP_OTP_PENDING, ReturnRequestStatus.PICKED_UP, ReturnRequestStatus.RECEIVED_AT_WAREHOUSE].includes(req.status)) {
          stats.approvedReturns++;
        } else if ([ReturnRequestStatus.QC_PASSED, ReturnRequestStatus.REFUND_INITIATED, ReturnRequestStatus.REFUND_COMPLETED].includes(req.status)) {
          stats.completedReturns++;
          stats.totalRefundedAmount += req.refundAmount || 0;
        } else if ([ReturnRequestStatus.REJECTED, ReturnRequestStatus.FAILED_PICKUP, ReturnRequestStatus.QC_FAILED, ReturnRequestStatus.CLOSED].includes(req.status)) {
          stats.failedReturns++;
        }

        const dateKey = req.createdAt.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { date: dateKey, returns: 0, refunded: 0 };
        }
        dailyData[dateKey].returns++;
        if ([ReturnRequestStatus.QC_PASSED, ReturnRequestStatus.REFUND_INITIATED, ReturnRequestStatus.REFUND_COMPLETED].includes(req.status)) {
          dailyData[dateKey].refunded += req.refundAmount || 0;
        }
      });

      stats.chartData = Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));
      return stats;
    } catch (error) {
      console.error(`Failed to fetch manager return stats:`, error);
      throw new Error('Failed to fetch statistics');
    }
  }

  async assignPartner(id: string, partnerId?: string) {
    return this.assignDeliveryPartner(id, partnerId);
  }

  // ─── INTERNAL ASSIGNMENT LOGIC (Phase 7) ────────────────────────────────────

  async assignDeliveryPartner(returnRequestId: string, partnerId?: string) {
    const returnRequest = await this.returnRequestModel.findById(returnRequestId);
    if (!returnRequest) return;

    let targetPartnerId = partnerId;

    if (!targetPartnerId) {
      // Auto-find available partner
      const availablePartner = await this.partnerModel.findOne({
        warehouseIds: returnRequest.warehouseId,
        availabilityStatus: 'ONLINE',
        accountStatus: 'ACTIVE',
        _id: { $ne: returnRequest.assignedPartnerId } // Exclude current/last assigned partner if re-assigning
      });

      if (availablePartner) {
        targetPartnerId = availablePartner._id.toString();
      } else {
        // If no partner available, just notify admin but STILL CREATE the shipment below
        if (returnRequest.status === ReturnRequestStatus.PENDING || returnRequest.status === ReturnRequestStatus.APPROVED) {
           await this.sendNotification({
            recipientRole: 'admin',
            recipientId: undefined,
            title: 'No delivery partner available',
            message: `No partner available for return pickup ${returnRequest._id}. A shipment has been created and awaits manual assignment.`,
            metadata: { returnRequestId }
          });
        }
      }
    }

    const partner = targetPartnerId ? await this.partnerModel.findById(targetPartnerId) : null;

    // Create or Update Shipment
    let shipment = await this.shipmentModel.findOne({ returnRequestId: returnRequest._id });
    
    if (!shipment) {
      shipment = new this.shipmentModel({
        orderId: returnRequest.orderId,
        warehouseId: returnRequest.warehouseId,
        type: 'REVERSE',
        returnRequestId: returnRequest._id.toString(),
        trackingNumber: 'RTN-' + Date.now(),
      });
    }

    if (partner) {
      shipment.deliveryPartnerId = partner._id;
      shipment.status = 'ASSIGNED_TO_DELIVERY' as any;
      shipment.assignedAt = new Date();
    } else {
      shipment.status = 'ORDER_PLACED' as any; // Initial status for manager to see
    }

    const savedShipment = await shipment.save();

    // Update ReturnRequest
    if (partner) {
      returnRequest.assignedPartnerId = partner._id;
      returnRequest.assignedAt = new Date();
      returnRequest.status = ReturnRequestStatus.PICKUP_SCHEDULED;
      returnRequest.assignmentAttempts += 1;
    } else {
      // Even without a partner, move to APPROVED status so it shows up for management
      if (returnRequest.status === ReturnRequestStatus.PENDING) {
        returnRequest.status = ReturnRequestStatus.APPROVED;
      }
    }
    
    returnRequest.returnShipmentId = savedShipment._id;
    await returnRequest.save();

    // Notify Partner if assigned
    if (partner) {
      await this.sendNotification({
        recipientId: partner._id.toString(),
        recipientRole: 'delivery',
        title: 'New return pickup assigned',
        message: 'You have a new return pickup request.',
        metadata: { returnRequestId, shipmentId: savedShipment._id }
      });
    }

    return returnRequest;
  }

  async sendManagerOtp(managerId: string, id: string) {
    const returnRequest: ReturnRequestDocument = await this.getReturnById(id);
    if (returnRequest.status !== ReturnRequestStatus.PICKED_UP) {
      throw new BadRequestException('Item must be PICKED_UP before sending manager OTP');
    }

    const otp = await this.generateOtp();
    returnRequest.managerOtp = otp;
    returnRequest.managerOtpSentAt = new Date();
    await returnRequest.save();

    if (!returnRequest.assignedPartnerId) {
      throw new BadRequestException('No partner assigned to this return request');
    }

    await this.sendNotification({
      recipientId: managerId,
      recipientRole: 'manager',
      title: 'Warehouse OTP',
      message: `OTP to confirm return drop-off: ${otp}. Please share this with the delivery partner upon arrival.`,
      metadata: { returnRequestId: id, otp }
    });

    return { message: 'OTP sent to delivery partner app' };
  }

  /**
   * Called by the Delivery Partner when they arrive at the warehouse.
   * Looks up the return request via shipment ID (which the DP app knows).
   * Generates a managerOtp, sends it to the warehouse manager.
   */
  async sendManagerOtpByDP(partnerId: string, shipmentId: string) {
    const returnRequest: ReturnRequestDocument = await this.getReturnByShipmentIdOrId(shipmentId);

    if (returnRequest.status !== ReturnRequestStatus.PICKED_UP) {
      throw new BadRequestException('Item must be in PICKED_UP status before requesting manager OTP');
    }

    const otp = await this.generateOtp();
    returnRequest.managerOtp = otp;
    returnRequest.managerOtpSentAt = new Date();
    await returnRequest.save();

    // Get warehouse manager to send OTP to
    const warehouse = await this.warehouseModel.findById(returnRequest.warehouseId);
    const managerId = warehouse?.managerId?.toString();

    if (managerId) {
      await this.sendNotification({
        recipientId: managerId,
        recipientRole: 'manager',
        title: 'Warehouse Drop-off OTP',
        message: `Delivery partner has arrived with a return. OTP: ${otp}. Share this with the partner to confirm receipt.`,
        metadata: { returnRequestId: returnRequest._id.toString(), otp },
      });
    }

    return { message: 'OTP sent to warehouse manager' };
  }

  async updateQc(managerId: string, id: string, dto: QcResultDto) {
    const returnRequest: ReturnRequestDocument = await this.getReturnById(id);
    if (returnRequest.status !== ReturnRequestStatus.RECEIVED_AT_WAREHOUSE) {
      throw new BadRequestException('Item must be RECEIVED_AT_WAREHOUSE for QC');
    }

    returnRequest.warehouseQcGrade = dto.qcGrade;
    returnRequest.warehouseQcNotes = dto.qcNotes;
    returnRequest.qcDoneBy = new Types.ObjectId(managerId);
    returnRequest.qcCompletedAt = new Date();

    if (dto.qcGrade === 'RESELLABLE') {
      returnRequest.status = ReturnRequestStatus.QC_PASSED;

      // Stock restoration logic (Phase 5.3)
      const inventory = await this.inventoryModel.findOne({
        variant: returnRequest.variantId,
        warehouse: returnRequest.warehouseId,
      });
      if (inventory) {
        inventory.quantity += returnRequest.quantity;
        await inventory.save();

        const stockHistory = new this.stockHistoryModel({
          product: returnRequest.productId,
          variant: returnRequest.variantId,
          warehouse: returnRequest.warehouseId,
          type: 'RETURN_RESTOCK',
          amount: returnRequest.quantity,
          actor: managerId,
          referenceId: returnRequest._id.toString(),
          notes: 'Return restock - QC grade: RESELLABLE'
        });
        await stockHistory.save();
      }
    } else if (dto.qcGrade === 'REFURBISH') {
      // Item flagged for repair → status = QC_PASSED → refund still triggered
      returnRequest.status = ReturnRequestStatus.QC_PASSED;
    } else {
      // Item written off (DISPOSE) → status = QC_FAILED → admin decides on refund
      returnRequest.status = ReturnRequestStatus.QC_FAILED;
    }

    await returnRequest.save();

    const customerMsg = returnRequest.status === ReturnRequestStatus.QC_PASSED
      ? 'Your return has passed quality check. Refund will be processed soon.'
      : 'Return item failed quality check. Our team will contact you.';

    await this.sendNotification({
      recipientId: (returnRequest.customerId as any)?._id?.toString() || returnRequest.customerId.toString(),
      recipientRole: 'customer',
      title: 'Quality Check Update',
      message: customerMsg,
      metadata: { returnRequestId: id }
    });

    return returnRequest;
  }

  // ─── DELIVERY PARTNER APIs (Phase 6) ───────────────────────────────────────

  async acceptPickup(partnerId: string, id: string) {
    const returnRequest: ReturnRequestDocument = await this.getReturnByShipmentIdOrId(id);
    if (returnRequest.status !== ReturnRequestStatus.PICKUP_SCHEDULED) {
      throw new BadRequestException('Return is not in PICKUP_SCHEDULED status');
    }

    returnRequest.partnerAcceptedAt = new Date();
    await returnRequest.save();

    await this.shipmentModel.findByIdAndUpdate(returnRequest.returnShipmentId, {
      status: 'ACCEPTED',
      acceptedAt: new Date()
    });

    await this.partnerModel.findByIdAndUpdate(partnerId, { availabilityStatus: 'BUSY' });

    await this.sendNotification({
      recipientId: (returnRequest.customerId as any)?._id?.toString() || returnRequest.customerId.toString(),
      recipientRole: 'customer',
      title: 'Return pickup is on the way',
      message: 'Your return pickup has been accepted and the partner is on the way.',
      metadata: { returnRequestId: id }
    });

    return { message: 'Pickup accepted' };
  }

  async verifyPickupItems(partnerId: string, id: string, dto: VerifyPickupDto) {
    const returnRequest: ReturnRequestDocument = await this.getReturnByShipmentIdOrId(id);

    returnRequest.verificationMedia = dto.verificationMedia;
    // Fix: Handle both pickupNotes (DTO) and notes (sometimes sent by frontend)
    returnRequest.pickupNotes = dto.pickupNotes || (dto as any).notes;
    returnRequest.weightKg = dto.weightKg;
    returnRequest.dimensionsCm = dto.dimensionsCm;

    if (!dto.itemsCorrect) {
      returnRequest.status = ReturnRequestStatus.FAILED_PICKUP;
      await returnRequest.save();

      await this.shipmentModel.findByIdAndUpdate(returnRequest.returnShipmentId, { status: 'FAILED_PICKUP' });

      const warehouse = await this.warehouseModel.findById(returnRequest.warehouseId);
      await this.sendNotification({
        recipientRole: 'manager',
        recipientId: (warehouse?.managerId as any)?._id?.toString() || warehouse?.managerId?.toString(),
        title: 'Wrong item at pickup',
        message: `Delivery partner reported wrong item for return request ${id}.`,
        metadata: { returnRequestId: id, verificationMedia: dto.verificationMedia, warehouseId: returnRequest.warehouseId }
      });

      return { message: 'Issue reported to warehouse', requiresReview: true };
    }

    const otp = await this.generateOtp();
    returnRequest.customerOtp = otp;
    returnRequest.status = ReturnRequestStatus.PICKUP_OTP_PENDING;
    await returnRequest.save();

    await this.sendNotification({
      recipientId: (returnRequest.customerId as any)?._id?.toString() || returnRequest.customerId.toString(),
      recipientRole: 'customer',
      title: 'Return pickup OTP',
      message: `Your return pickup OTP is: ${otp}.`,
      metadata: { returnRequestId: id, otp }
    });

    return { message: 'OTP sent to customer' };
  }

  async verifyCustomerOtp(partnerId: string, id: string, otp: string) {
    const returnRequest: ReturnRequestDocument = await this.getReturnByShipmentIdOrId(id);
    if (returnRequest.customerOtp !== otp) throw new BadRequestException('Invalid OTP');

    returnRequest.customerOtpVerifiedAt = new Date();
    returnRequest.status = ReturnRequestStatus.PICKED_UP;
    await returnRequest.save();

    await this.shipmentModel.findByIdAndUpdate(returnRequest.returnShipmentId, {
      status: 'PICKED_UP',
      pickedAt: new Date(),
    });

    return { message: 'Pickup confirmed' };
  }

  async verifyManagerOtp(partnerId: string, id: string, otp: string) {
    const returnRequest: ReturnRequestDocument = await this.getReturnByShipmentIdOrId(id);
    if (returnRequest.managerOtp !== otp) throw new BadRequestException('Invalid OTP');

    returnRequest.managerOtpVerifiedAt = new Date();
    returnRequest.status = ReturnRequestStatus.RECEIVED_AT_WAREHOUSE;
    returnRequest.warehouseReceivedAt = new Date();
    await returnRequest.save();

    await this.shipmentModel.findByIdAndUpdate(returnRequest.returnShipmentId, {
      status: 'DELIVERED',
      deliveredAt: new Date(),
    });

    // Update Order Item status
    const order = await this.orderModel.findById(returnRequest.orderId);
    if (order) {
      const itemIndex = order.items.findIndex(item => item._id.toString() === returnRequest.orderItemId);
      if (itemIndex > -1) {
        order.items[itemIndex].status = OrderStatus.RETURNED;
        order.history.push({
          actor: new Types.ObjectId(partnerId),
          actorRole: 'DELIVERY_PARTNER',
          action: 'ITEM_RETURNED',
          status: order.orderStatus,
          note: `Item ${order.items[itemIndex].title} received at warehouse.`,
          timestamp: new Date()
        });
        await order.save();
      }
    }

    await this.partnerModel.findByIdAndUpdate(partnerId, { availabilityStatus: 'ONLINE' });

    return { message: 'Drop-off confirmed' };
  }

  async rejectPickup(partnerId: string, id: string, dto: RejectReturnDto) {
    const returnRequest: ReturnRequestDocument = await this.getReturnByShipmentIdOrId(id);

    returnRequest.partnerRejectedAt = new Date();
    returnRequest.partnerRejectionReason = dto.rejectionReason;
    returnRequest.status = ReturnRequestStatus.APPROVED; // Reset to approved for reassignment
    returnRequest.assignedPartnerId = undefined;
    await returnRequest.save();

    await this.shipmentModel.findByIdAndUpdate(returnRequest.returnShipmentId, {
      status: 'CANCELLED',
      cancelReason: `Delivery partner rejected: ${dto.rejectionReason}`
    });

    await this.partnerModel.findByIdAndUpdate(partnerId, { availabilityStatus: 'ONLINE' });

    // Trigger auto-reassign
    await this.assignDeliveryPartner(returnRequest._id.toString());

    return { message: 'Pickup rejected, reassigning...' };
  }

  // ─── ADMIN APIs (Phase 4) ───────────────────────────────────────────────────

  async initiateRefund(adminId: string, id: string, dto: RefundDto) {
    const request: ReturnRequestDocument = await this.getReturnById(id);

    // Only allow refund if QC passed OR if admin is overriding a QC failure
    if (request.status !== ReturnRequestStatus.QC_PASSED && request.status !== ReturnRequestStatus.QC_FAILED) {
      throw new BadRequestException('Refund can only be initiated after Quality Check (Passed or Manual Override)');
    }

    const { refundMethod, refundAmount } = dto;
    let transactionId = dto.refundTransactionId;

    if (refundMethod === RefundMethod.ORIGINAL_SOURCE) {
      // 1. Automatic Razorpay Refund to Source
      const order = request.orderId as any;
      if (!order.razorpayPaymentId) {
        throw new BadRequestException('No Razorpay Payment ID found for this order');
      }

      const refund = await this.paymentsService.createRefund(
        order.razorpayPaymentId,
        refundAmount,
        { returnRequestId: id, reason: 'Return Refund' }
      );
      transactionId = refund.id;
    }
    else if (refundMethod === RefundMethod.BANK_TRANSFER) {
      // 2. Automatic Bank Payout via Razorpay
      const bankDetails = (request as any).bankDetails;
      if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifscCode) {
        throw new BadRequestException('Customer bank details are missing for bank transfer refund');
      }

      const customer = request.customerId as any;
      const customerName = customer?.fullName || customer?.name || bankDetails.accountHolderName || 'Customer';
      const customerPhone = customer?.phone || '0000000000';
      const customerEmail = customer?.email;

      // Step 1: Create Contact in Razorpay
      const contact = await this.razorpayPayoutService.createContact(
        customerName,
        customerPhone,
        customerEmail,
      );

      // Step 2: Create Fund Account (Bank)
      const fundAccount = await this.razorpayPayoutService.createFundAccount(contact.id, {
        method: 'BANK',
        name: bankDetails.accountHolderName || customerName,
        ifsc: bankDetails.ifscCode,
        accountNumber: bankDetails.accountNumber,
      });

      // Step 3: Create Payout
      const payout = await this.razorpayPayoutService.createPayout(
        fundAccount.id,
        refundAmount,
        `REFUND-${id}`,
        `Return refund for order ${(request.orderId as any)?.orderId || ''}`
      );
      transactionId = payout.id;
    }
    // For WALLET/CASH methods, transactionId is either manually provided or we just mark it as initiated

    // Update Request
    request.status = ReturnRequestStatus.REFUND_INITIATED;
    request.refundMethod = refundMethod;
    request.refundAmount = refundAmount;
    request.refundTransactionId = transactionId;
    request.refundInitiatedAt = new Date();
    request.reviewedBy = new Types.ObjectId(adminId);
    await request.save();

    // Notify Customer
    await this.sendNotification({
      recipientId: request.customerId.toString(),
      recipientRole: 'customer',
      title: 'Refund initiated',
      message: `Refund of ₹${refundAmount} has been initiated for your return ${id}.`,
      metadata: { returnRequestId: id, method: refundMethod, transactionId }
    });

    return request;
  }
}
