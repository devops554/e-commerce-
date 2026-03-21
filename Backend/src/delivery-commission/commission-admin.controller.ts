import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryRateConfig, DeliveryRateConfigDocument } from './schemas/delivery-rate-config.schema';
import { DeliverySurgeRule, DeliverySurgeRuleDocument } from './schemas/delivery-surge-rule.schema';
import { DeliveryZone, DeliveryZoneDocument } from './schemas/delivery-zone.schema';
import { PartnerOffer, PartnerOfferDocument } from './schemas/partner-offer.schema';
import { PartnerEarnings, PartnerEarningsDocument } from './schemas/partner-earnings.schema';
import { CommissionConfig, CommissionConfigDocument } from './schemas/commission-config.schema';
import { CommissionCalculatorService } from './commission-calculator.service';

import { RazorpayPayoutService } from '../payments/razorpay-payout.service';
import { DeliveryPartnersService } from '../delivery-partners/delivery-partners.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Controller('admin/commission')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionAdminController {
  constructor(
    @InjectModel(DeliveryRateConfig.name)
    private rateConfigModel: Model<DeliveryRateConfigDocument>,
    @InjectModel(DeliverySurgeRule.name)
    private surgeModel: Model<DeliverySurgeRuleDocument>,
    @InjectModel(DeliveryZone.name)
    private zoneModel: Model<DeliveryZoneDocument>,
    @InjectModel(PartnerOffer.name)
    private offerModel: Model<PartnerOfferDocument>,
    @InjectModel(PartnerEarnings.name)
    private earningsModel: Model<PartnerEarningsDocument>,
    @InjectModel(CommissionConfig.name)
    private configModel: Model<CommissionConfigDocument>,
    private calculatorService: CommissionCalculatorService,
    private payoutService: RazorpayPayoutService,
    private partnerService: DeliveryPartnersService,
    private notificationsService: NotificationsService,
  ) { }

  // ──────────────────────────────────────────────────────────────────────────
  // RATE CONFIG
  // ──────────────────────────────────────────────────────────────────────────

  @Get('rate-config')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async listRateConfigs() {
    return this.rateConfigModel.find().populate('warehouseId', 'name').exec();
  }

  @Post('rate-config')
  @Roles(UserRole.ADMIN)
  async createRateConfig(@Body() dto: any) {
    return this.rateConfigModel.create(dto);
  }

  @Patch('rate-config/:id')
  @Roles(UserRole.ADMIN)
  async updateRateConfig(@Param('id') id: string, @Body() dto: any) {
    return this.rateConfigModel.findByIdAndUpdate(id, { $set: dto }, { new: true });
  }

  @Delete('rate-config/:id')
  @Roles(UserRole.ADMIN)
  async deleteRateConfig(@Param('id') id: string) {
    return this.rateConfigModel.findByIdAndUpdate(id, { isActive: false });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SURGE RULES
  // ──────────────────────────────────────────────────────────────────────────

  @Get('surge-rules')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async listSurgeRules() {
    return this.surgeModel.find().exec();
  }

  @Post('surge-rules')
  @Roles(UserRole.ADMIN)
  async createSurgeRule(@Body() dto: any) {
    return this.surgeModel.create(dto);
  }

  @Patch('surge-rules/:id')
  @Roles(UserRole.ADMIN)
  async updateSurgeRule(@Param('id') id: string, @Body() dto: any) {
    return this.surgeModel.findByIdAndUpdate(id, { $set: dto }, { new: true });
  }

  @Patch('surge-rules/:id/toggle')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async toggleSurge(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    const update: any = {
      isActive: body.isActive,
      ...(body.isActive
        ? { manuallyActivatedAt: new Date() }
        : { manuallyDeactivatedAt: new Date() }),
    };
    return this.surgeModel.findByIdAndUpdate(id, update, { new: true });
  }

  // Quick rain toggle
  @Post('surge-rules/rain/activate')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async rainActivate() {
    return this.surgeModel.findOneAndUpdate(
      { $or: [{ name: /rain/i }, { triggerType: 'WEATHER' }] },
      { isActive: true, manuallyActivatedAt: new Date() },
      { new: true },
    );
  }

  @Post('surge-rules/rain/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async rainDeactivate() {
    return this.surgeModel.findOneAndUpdate(
      { $or: [{ name: /rain/i }, { triggerType: 'WEATHER' }] },
      { isActive: false, manuallyDeactivatedAt: new Date() },
      { new: true },
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ZONES
  // ──────────────────────────────────────────────────────────────────────────

  @Get('zones')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async listZones() {
    return this.zoneModel.find().exec();
  }

  @Post('zones')
  @Roles(UserRole.ADMIN)
  async createZone(@Body() dto: any) {
    return this.zoneModel.create(dto);
  }

  @Patch('zones/:id')
  @Roles(UserRole.ADMIN)
  async updateZone(@Param('id') id: string, @Body() dto: any) {
    return this.zoneModel.findByIdAndUpdate(id, { $set: dto }, { new: true });
  }

  @Post('zones/:id/add-pincodes')
  @Roles(UserRole.ADMIN)
  async addPincodes(@Param('id') id: string, @Body('pincodes') pincodes: string[]) {
    return this.zoneModel.findByIdAndUpdate(
      id,
      { $addToSet: { pincodes: { $each: pincodes } } },
      { new: true },
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PARTNER OFFERS
  // ──────────────────────────────────────────────────────────────────────────

  @Get('offers')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async listOffers() {
    return this.offerModel.find().sort({ createdAt: -1 }).exec();
  }

  @Post('offers')
  @Roles(UserRole.ADMIN)
  async createOffer(@Body() dto: any) {
    return this.offerModel.create(dto);
  }

  @Patch('offers/:id')
  @Roles(UserRole.ADMIN)
  async updateOffer(@Param('id') id: string, @Body() dto: any) {
    return this.offerModel.findByIdAndUpdate(id, { $set: dto }, { new: true });
  }

  @Patch('offers/:id/toggle')
  @Roles(UserRole.ADMIN)
  async toggleOffer(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.offerModel.findByIdAndUpdate(id, { isActive }, { new: true });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // EARNINGS & PAYOUTS
  // ──────────────────────────────────────────────────────────────────────────

  @Get('earnings')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async listEarnings(@Query() query: any) {
    const { partnerId, payoutStatus, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (partnerId) filter.partnerId = new Types.ObjectId(partnerId);
    if (payoutStatus) filter.payoutStatus = payoutStatus;
    if (dateFrom || dateTo) {
      filter.deliveredAt = {};
      if (dateFrom) filter.deliveredAt.$gte = new Date(dateFrom);
      if (dateTo) filter.deliveredAt.$lte = new Date(dateTo);
    }
    const [data, total] = await Promise.all([
      this.earningsModel
        .find(filter)
        .populate('partnerId', 'name phone')
        .populate('orderId', 'orderId')
        .sort({ deliveredAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('partnerId', 'name phone profileImage payoutMethod'),
      this.earningsModel.countDocuments(filter),
    ]);
    return { data, total, page: Number(page), totalPages: Math.ceil(total / limit) };
  }

  @Get('earnings/summary')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async earningsSummary() {
    return this.earningsModel.aggregate([
      {
        $group: {
          _id: '$partnerId',
          totalDeliveries: { $sum: 1 },
          totalEarned: { $sum: '$totalEarned' },
          totalPending: {
            $sum: { $cond: [{ $eq: ['$payoutStatus', 'PENDING'] }, '$totalEarned', 0] },
          },
          totalRequested: {
            $sum: { $cond: [{ $eq: ['$payoutStatus', 'REQUESTED'] }, '$totalEarned', 0] },
          },
          totalApproved: {
            $sum: { $cond: [{ $eq: ['$payoutStatus', 'APPROVED'] }, '$totalEarned', 0] },
          },
          totalPaid: {
            $sum: { $cond: [{ $eq: ['$payoutStatus', 'PAID'] }, '$totalEarned', 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'deliverypartners',
          localField: '_id',
          foreignField: '_id',
          as: 'partner',
        },
      },
      { $unwind: { path: '$partner', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          partnerName: '$partner.name',
          partnerPhone: '$partner.phone',
          payoutMethod: '$partner.payoutMethod',
          totalDeliveries: 1,
          totalEarned: 1,
          totalPending: 1,
          totalRequested: 1,
          totalApproved: 1,
          totalPaid: 1,
        },
      },
      { $sort: { totalPending: -1 } }
    ]);
  }

  @Get('earnings/disputed')
  @Roles(UserRole.ADMIN)
  async listDisputed() {
    return this.earningsModel.find({ payoutStatus: 'DISPUTED' })
      .populate('partnerId', 'name phone')
      .exec();
  }

  @Patch('earnings/approve-bulk')
  @Roles(UserRole.ADMIN)
  async approveBulk(@Body('earningsIds') ids: string[]) {
    return this.earningsModel.updateMany(
      { _id: { $in: ids.map((id) => new Types.ObjectId(id)) }, payoutStatus: 'PENDING' },
      { payoutStatus: 'APPROVED' },
    );
  }

  @Post('earnings/payout')
  @Roles(UserRole.ADMIN)
  async processPayout(@Body() body: {
    partnerId: string;
    amount: number;
    mode: 'RAZORPAY' | 'MANUAL_UPI' | 'BANK' | 'CASH';
    transactionId?: string;
    earningsIds: string[];
    note?: string;
  }) {
    const { partnerId, amount, mode, transactionId, earningsIds, note } = body;

    const partner = await this.partnerService.findById(partnerId);
    if (!partner) throw new BadRequestException('Partner not found');

    // Validate payout details
    const hasUpi = !!partner.payoutMethod?.upiId;
    const hasBank = !!partner.payoutMethod?.accountNumber && !!partner.payoutMethod?.ifsc;

    if (mode === 'RAZORPAY' && !partner.payoutMethod?.razorpayFundAccountId) {
      this.notifyMissingPayoutInfo(partnerId, partner.name, mode);
      throw new BadRequestException('Partner Razorpay Fund Account not configured. Partner notified.');
    }

    if (mode === 'MANUAL_UPI' && !hasUpi) {
      this.notifyMissingPayoutInfo(partnerId, partner.name, mode);
      throw new BadRequestException('Partner UPI ID not found. Partner notified.');
    }

    if (mode === 'BANK' && !hasBank) {
      this.notifyMissingPayoutInfo(partnerId, partner.name, mode);
      throw new BadRequestException('Partner Bank Account details not found. Partner notified.');
    }

    // Check if earnings are already paid or not approved
    const pendingEarnings = await this.earningsModel.find({
      _id: { $in: earningsIds.map(id => new Types.ObjectId(id)) },
      payoutStatus: { $in: ['APPROVED', 'REQUESTED'] },
    });

    if (pendingEarnings.length !== earningsIds.length) {
      throw new BadRequestException('Some earnings are not approved, requested or already paid');
    }

    let finalTransactionId = transactionId;

    if (mode === 'RAZORPAY') {
      const partner = await this.partnerService.findById(partnerId);
      if (!partner.payoutMethod?.razorpayFundAccountId) {
        throw new BadRequestException('Partner Razorpay Fund Account not configured');
      }

      const payout = await this.payoutService.createPayout(
        partner.payoutMethod.razorpayFundAccountId,
        amount,
        `PAYOUT_${Date.now()}`,
        note || 'Delivery Partner Earning Payout',
      );
      finalTransactionId = payout.id; // Razorpay Payout ID
    }

    // Update earnings status
    const update = {
      payoutStatus: mode === 'RAZORPAY' ? 'PENDING' : 'PAID', // For Razorpay, wait for webhook
      payoutMode: mode,
      payoutNote: note,
      paidAt: mode === 'RAZORPAY' ? undefined : new Date(),
      payoutTransactionId: finalTransactionId,
    };

    await this.earningsModel.updateMany(
      { _id: { $in: earningsIds.map(id => new Types.ObjectId(id)) } },
      update,
    );

    return {
      message: `Payout processed via ${mode}`,
      transactionId: finalTransactionId,
      status: mode === 'RAZORPAY' ? 'PENDING' : 'PAID',
    };
  }

  @Patch('earnings/:id/resolve-dispute')
  @Roles(UserRole.ADMIN)
  async resolveDispute(@Param('id') id: string, @Body() body: { finalAmount: number; resolution: string }) {
    return this.earningsModel.findByIdAndUpdate(id, {
      totalEarned: body.finalAmount,
      penaltyReason: body.resolution,
      payoutStatus: 'APPROVED',
    }, { new: true });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GLOBAL CONFIG
  // ──────────────────────────────────────────────────────────────────────────

  @Get('config')
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  async getConfig() {
    let config = await this.configModel.findOne({ configKey: 'GlobalConfig' });
    if (!config) {
      config = await this.configModel.create({ configKey: 'GlobalConfig' });
    }
    // Mask secret for safety if needed, but for admin it might be okay to show
    return config;
  }

  @Patch('config')
  @Roles(UserRole.ADMIN)
  async updateConfig(@Body() dto: any) {
    return this.configModel.findOneAndUpdate(
      { configKey: 'GlobalConfig' },
      { $set: dto },
      { new: true, upsert: true },
    );
  }

  private async notifyMissingPayoutInfo(partnerId: string, partnerName: string, mode: string) {
    // Notify Partner
    await this.notificationsService.create({
      recipientId: partnerId,
      recipientRole: 'delivery',
      type: NotificationType.SYSTEM,
      title: 'Action Required: Update Payout Details',
      message: `Admin tried to process your payout via ${mode}, but your details are missing. Please update your ${mode === 'BANK' ? 'Bank Account' : 'UPI ID'} in the app.`,
      metadata: { action: 'UPDATE_PAYOUT_DETAILS' },
    });

    // Notify Admin
    await this.notificationsService.create({
      recipientRole: 'admin',
      type: NotificationType.SYSTEM,
      title: 'Payout Blocked: Missing Details',
      message: `Payout for ${partnerName} was blocked because their ${mode} details are not configured.`,
      metadata: { partnerId },
    });
  }
}
