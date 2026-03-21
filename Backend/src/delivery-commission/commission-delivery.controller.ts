import { Controller, Get, Post, Body, Param, UseGuards, Req, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeliveryPartnerJwtGuard } from '../delivery-partners/delivery-partner.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PartnerEarnings, PartnerEarningsDocument, PayoutStatus } from './schemas/partner-earnings.schema';
import { PartnerOffer, PartnerOfferDocument } from './schemas/partner-offer.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Controller('delivery/earnings')
@UseGuards(DeliveryPartnerJwtGuard)
export class CommissionDeliveryController {
  constructor(
    @InjectModel(PartnerEarnings.name)
    private earningsModel: Model<PartnerEarningsDocument>,
    @InjectModel(PartnerOffer.name)
    private offerModel: Model<PartnerOfferDocument>,
    private readonly notificationsService: NotificationsService,
  ) { }

  @Get()
  async getSummary(@Req() req: any) {
    const partnerId = new Types.ObjectId(req.deliveryPartner._id);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayEarnings, weekEarnings, monthEarnings, payoutStats, todayDeliveries, recentEarnings] =
      await Promise.all([
        this.earningsModel.aggregate([
          { $match: { partnerId, deliveredAt: { $gte: today } } },
          { $group: { _id: null, total: { $sum: '$totalEarned' } } },
        ]),
        this.earningsModel.aggregate([
          { $match: { partnerId, deliveredAt: { $gte: weekStart } } },
          { $group: { _id: null, total: { $sum: '$totalEarned' } } },
        ]),
        this.earningsModel.aggregate([
          { $match: { partnerId, deliveredAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: '$totalEarned' } } },
        ]),
        this.earningsModel.aggregate([
          { $match: { partnerId, payoutStatus: { $ne: PayoutStatus.PAID } } },
          {
            $group: {
              _id: null,
              totalPending: {
                $sum: { $cond: [{ $eq: ['$payoutStatus', PayoutStatus.PENDING] }, '$totalEarned', 0] },
              },
              totalRequested: {
                $sum: { $cond: [{ $eq: ['$payoutStatus', PayoutStatus.REQUESTED] }, '$totalEarned', 0] },
              },
              totalApproved: {
                $sum: { $cond: [{ $eq: ['$payoutStatus', PayoutStatus.APPROVED] }, '$totalEarned', 0] },
              },
              totalDue: { $sum: '$totalEarned' },
            },
          },
        ]),
        this.earningsModel.countDocuments({ partnerId, deliveredAt: { $gte: today } }),
        this.earningsModel
          .find({ partnerId })
          .sort({ deliveredAt: -1 })
          .limit(10)
          .populate('orderId', 'orderId')
          .select('orderId totalEarned basePay distancePay weightPay surgePay codBonus targetBonus deliveredAt payoutStatus'),
      ]);

    // Active offers with per-offer progress
    const activeOffers = await this.offerModel.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      description: { $ne: "" },
      $or: [{ applicablePartners: { $size: 0 } }, { applicablePartners: partnerId }],
    });


    const offerProgress = await Promise.all(
      activeOffers.map(async (offer) => {
        const periodStart = this.getPeriodStart(offer.periodType as any);
        const currentCount = await this.earningsModel.countDocuments({
          partnerId,
          deliveredAt: { $gte: periodStart },
        });
        const sortedTiers = [...offer.tiers].sort((a, b) => a.targetCount - b.targetCount);
        const nextTier = sortedTiers.find((t) => t.targetCount > currentCount);
        const daysLeft = Math.ceil((new Date(offer.validTo).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          _id: offer._id,
          title: offer.title,
          currentCount,
          target: nextTier?.targetCount,
          bonus: nextTier?.bonusAmount,
          daysLeft,
        };
      })
    );

    return {
      todayEarnings: todayEarnings[0]?.total || 0,
      weekEarnings: weekEarnings[0]?.total || 0,
      monthEarnings: monthEarnings[0]?.total || 0,
      todayDeliveries,
      totalPending: payoutStats[0]?.totalPending || 0,
      totalDue: payoutStats[0]?.totalDue || 0,
      totalRequested: payoutStats[0]?.totalRequested || 0,
      totalApproved: payoutStats[0]?.totalApproved || 0,
      activeOffers: offerProgress,
      recentEarnings,
    };
  }

  @Get('payout-history')
  async payoutHistory(@Req() req: any) {
    const partnerId = new Types.ObjectId(req.deliveryPartner._id);
    return this.earningsModel
      .find({ partnerId, payoutStatus: 'PAID' })
      .sort({ paidAt: -1 })
      .select('totalEarned paidAt payoutTransactionId deliveredAt');
  }

  @Get(':earningsId')
  async getOne(@Req() req: any, @Param('earningsId') earningsId: string) {
    const partnerId = new Types.ObjectId(req.deliveryPartner._id);
    return this.earningsModel.findOne({
      _id: new Types.ObjectId(earningsId),
      partnerId,
    });
  }

  @Post(':earningsId/dispute')
  async raiseDispute(
    @Req() req: any,
    @Param('earningsId') earningsId: string,
    @Body('note') note: string,
  ) {
    const partnerId = new Types.ObjectId(req.deliveryPartner._id);
    const earning = await this.earningsModel.findOne({
      _id: new Types.ObjectId(earningsId),
      partnerId,
    });
    if (!earning) throw new NotFoundException('Earning not found');
    if (earning.payoutStatus === 'PAID') throw new ForbiddenException('Cannot dispute a paid earning');
    return this.earningsModel.findByIdAndUpdate(
      earningsId,
      { payoutStatus: PayoutStatus.DISPUTED, penaltyReason: note },
      { new: true },
    );
  }

  @Post('request-payout')
  async requestPayout(@Req() req: any) {
    const partnerId = new Types.ObjectId(req.deliveryPartner._id);
    const partnerName = req.deliveryPartner.name;

    // 1. Find all PENDING earnings
    const pendingEarnings = await this.earningsModel.find({
      partnerId,
      payoutStatus: PayoutStatus.PENDING,
    });

    if (pendingEarnings.length === 0) {
      throw new ForbiddenException('No pending earnings to request payout for');
    }

    const totalAmount = pendingEarnings.reduce((sum, e) => sum + e.totalEarned, 0);

    // 2. Update to REQUESTED
    await this.earningsModel.updateMany(
      { _id: { $in: pendingEarnings.map(e => e._id) } },
      { payoutStatus: PayoutStatus.REQUESTED }
    );

    // 3. Notify Admin/Subadmin
    await this.notificationsService.create({
      title: 'Payout Request Received',
      message: `Delivery Partner ${partnerName} has requested a payout of ₹${totalAmount.toFixed(2)} for ${pendingEarnings.length} deliveries.`,
      type: NotificationType.SYSTEM,
      recipientRole: 'admin',
      metadata: {
        partnerId: partnerId.toString(),
        amount: totalAmount,
        deliveryCount: pendingEarnings.length,
      }
    });

    return {
      message: 'Payout request sent successfully',
      amount: totalAmount,
      count: pendingEarnings.length,
    };
  }

  private getPeriodStart(periodType: string): Date {
    const now = new Date();
    if (periodType === 'DAILY') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (periodType === 'WEEKLY') {
      const d = now.getDay();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - d + (d === 0 ? -6 : 1));
    }
    if (periodType === 'MONTHLY') return new Date(now.getFullYear(), now.getMonth(), 1);
    return now;
  }
}
