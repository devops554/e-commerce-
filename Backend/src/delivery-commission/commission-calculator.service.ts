import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shipment, ShipmentDocument } from '../shipments/schemas/shipment.schema';
import { DeliveryRateConfig, DeliveryRateConfigDocument } from './schemas/delivery-rate-config.schema';
import { DeliverySurgeRule, DeliverySurgeRuleDocument, SurgeTriggerType } from './schemas/delivery-surge-rule.schema';
import { DeliveryZone, DeliveryZoneDocument } from './schemas/delivery-zone.schema';
import { PartnerOffer, PartnerOfferDocument, OfferPeriodType } from './schemas/partner-offer.schema';
import { PartnerEarnings, PartnerEarningsDocument } from './schemas/partner-earnings.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class CommissionCalculatorService {
  private readonly logger = new Logger(CommissionCalculatorService.name);

  constructor(
    @InjectModel(Shipment.name)
    private shipmentModel: Model<ShipmentDocument>,
    @InjectModel(DeliveryRateConfig.name)
    private rateConfigModel: Model<DeliveryRateConfigDocument>,
    @InjectModel(DeliverySurgeRule.name)
    private surgeRuleModel: Model<DeliverySurgeRuleDocument>,
    @InjectModel(DeliveryZone.name)
    private zoneModel: Model<DeliveryZoneDocument>,
    @InjectModel(PartnerOffer.name)
    private partnerOfferModel: Model<PartnerOfferDocument>,
    @InjectModel(PartnerEarnings.name)
    private partnerEarningsModel: Model<PartnerEarningsDocument>,
    private notificationsService: NotificationsService,
  ) {}

  // ─── MAIN ENTRY POINT ─────────────────────────────────────────────────────
  async calculateAndSave(shipmentId: string): Promise<PartnerEarnings> {
    const shipment = await this.shipmentModel
      .findById(shipmentId)
      .populate('orderId')
      .populate('deliveryPartnerId')
      .populate('warehouseId')
      .exec();

    if (!shipment) throw new NotFoundException('Shipment not found');

    const order     = (shipment as any).orderId;
    const partner   = (shipment as any).deliveryPartnerId;
    const warehouse = (shipment as any).warehouseId;

    // Get rate config (warehouse-specific fallback to global)
    const rateConfig = await this.getRateConfig(warehouse?._id);

    // Calculate distance
    const distanceKm = this.calculateDistanceKm(
      warehouse?.location,
      order?.shippingAddress,
    );

    // Get zone for pincode
    const zone = await this.getZoneForPincode(order?.shippingAddress?.postalCode);

    // Active surges at delivery time
    const activeSurges = await this.getActiveSurges(
      warehouse?._id,
      shipment.deliveredAt || new Date(),
    );

    const isCod = (order?.paymentMethod || '').toLowerCase() === 'cod';
    const breakdown = this.computeBreakdown({
      rateConfig,
      distanceKm,
      weightKg: shipment.weightKg || 0,
      packageSize: shipment.packageSize || 'small',
      surges: activeSurges,
      zone,
      isCod,
      codCollected: shipment.codCollected || false,
      isFirstDeliveryToday: await this.isFirstDeliveryToday(partner?._id),
    });

    const targetBonus = await this.checkTargetBonuses(partner?._id, warehouse?._id);

    const earnings = await this.partnerEarningsModel.create({
      partnerId:         partner?._id,
      shipmentId:        shipment._id,
      orderId:           order?._id,
      distanceKm,
      weightKg:          shipment.weightKg,
      packageSize:       shipment.packageSize,
      surgeMultiplier:   breakdown.surgeMultiplier,
      zoneMultiplier:    zone?.multiplier || 1.0,
      zoneName:          zone?.name,
      activeSurgeNames:  activeSurges.map((s) => s.name),
      basePay:           breakdown.basePay,
      distancePay:       breakdown.distancePay,
      weightPay:         breakdown.weightPay,
      sizePay:           breakdown.sizePay,
      surgePay:          breakdown.surgePay,
      zonePay:           breakdown.zonePay,
      codBonus:          breakdown.codBonus,
      firstDeliveryBonus: breakdown.firstDeliveryBonus,
      ratingBonus:       0,
      targetBonus:       targetBonus.amount,
      appliedOfferId:    targetBonus.offerId,
      penalties:         0,
      totalEarned:       breakdown.total + targetBonus.amount,
      deliveredAt:       shipment.deliveredAt || new Date(),
      payoutStatus:      'PENDING',
    });

    await this.shipmentModel.findByIdAndUpdate(shipmentId, {
      commissionEarned: earnings.totalEarned,
      earningsId:       earnings._id,
    });

    await this.notificationsService.create({
      recipientId:   partner?._id?.toString(),
      recipientRole: 'delivery',
      type:          NotificationType.SYSTEM,
      title:         'Delivery complete — earnings credited',
      message:       `You earned ₹${earnings.totalEarned} for this delivery.${
        targetBonus.amount > 0
          ? ` Bonus: ₹${targetBonus.amount} from "${targetBonus.offerTitle}"`
          : ''
      }`,
      metadata: { earningsId: earnings._id, totalEarned: earnings.totalEarned },
    });

    return earnings;
  }

  // ─── COMPUTE BREAKDOWN ────────────────────────────────────────────────────
  computeBreakdown(params: {
    rateConfig: DeliveryRateConfig;
    distanceKm: number;
    weightKg: number;
    packageSize: string;
    surges: DeliverySurgeRule[];
    zone: DeliveryZone | null;
    isCod: boolean;
    codCollected: boolean;
    isFirstDeliveryToday: boolean;
  }) {
    const { rateConfig, distanceKm, weightKg, packageSize } = params;

    const basePay = rateConfig.basePay;

    // Distance pay via slabs
    let distancePay = 0;
    let remaining = Math.max(0, distanceKm - rateConfig.baseKm);
    for (const slab of rateConfig.distanceSlabs) {
      if (remaining <= 0) break;
      const slabKm = slab.toKm != null
        ? Math.min(remaining, slab.toKm - slab.fromKm)
        : remaining;
      distancePay += slabKm * slab.ratePerKm;
      remaining -= slabKm;
    }

    // Weight pay via slabs
    let weightPay = 0;
    for (const slab of rateConfig.weightSlabs) {
      if (weightKg > slab.fromKg && (slab.toKg == null || weightKg <= slab.toKg)) {
        weightPay = slab.flatPay;
        break;
      }
    }

    const subtotal = basePay + distancePay + weightPay;

    // Size multiplier
    const sizeMultiplierMap: Record<string, number> = rateConfig.sizeMultipliers as any;
    const sizeMultiplier = sizeMultiplierMap[packageSize] ?? 1.0;
    const afterSize = subtotal * sizeMultiplier;
    const sizePay   = afterSize - subtotal;

    // Surge multiplier (highest active)
    const surgeMultiplier = params.surges.length > 0
      ? Math.max(...params.surges.map((s) => s.multiplier))
      : 1.0;
    const afterSurge = afterSize * surgeMultiplier;
    const surgePay   = afterSurge - afterSize;

    // Zone multiplier
    const zoneMultiplier = params.zone?.multiplier || 1.0;
    const afterZone  = afterSurge * zoneMultiplier;
    const zonePay    = afterZone - afterSurge;

    const codBonus           = params.isCod && params.codCollected ? rateConfig.codBonus : 0;
    const firstDeliveryBonus = params.isFirstDeliveryToday ? rateConfig.firstDeliveryDayBonus : 0;
    const total = Math.round(afterZone + codBonus + firstDeliveryBonus);

    return {
      basePay, distancePay, weightPay, sizePay, surgePay, zonePay,
      sizeMultiplier, surgeMultiplier, zoneMultiplier,
      codBonus, firstDeliveryBonus, total,
    };
  }

  // ─── DISTANCE (Haversine) ─────────────────────────────────────────────────
  calculateDistanceKm(
    warehouseLocation?: { latitude: number; longitude: number },
    shippingAddress?: any,
  ): number {
    if (!warehouseLocation) return 5; // default fallback

    const customerLoc = shippingAddress?.location;
    if (customerLoc?.latitude != null) {
      return this.haversineKm(
        warehouseLocation.latitude, warehouseLocation.longitude,
        customerLoc.latitude, customerLoc.longitude,
      );
    }
    return 5; // Pincode-based lookup can be added later
  }

  haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  getPackageSize(items: any[]): 'small' | 'medium' | 'large' | 'xl' {
    let maxDim = 0;
    for (const item of items) {
      const dims = item?.variant?.dimensionsCm || item?.dimensionsCm;
      if (dims) {
        const m = Math.max(dims.length ?? 0, dims.width ?? 0, dims.height ?? 0);
        if (m > maxDim) maxDim = m;
      }
    }
    if (maxDim < 30)  return 'small';
    if (maxDim < 60)  return 'medium';
    if (maxDim < 100) return 'large';
    return 'xl';
  }

  // ─── RATE CONFIG ─────────────────────────────────────────────────────────
  private async getRateConfig(warehouseId?: Types.ObjectId): Promise<DeliveryRateConfig> {
    if (warehouseId) {
      const specific = await this.rateConfigModel.findOne({ warehouseId, isActive: true });
      if (specific) return specific;
    }
    const global = await this.rateConfigModel.findOne({ warehouseId: null, isActive: true });
    if (global) return global;

    // Ultimate fallback — return hardcoded defaults
    return {
      basePay: 30, baseKm: 3,
      distanceSlabs: [{ fromKm: 3, toKm: 10, ratePerKm: 8 }, { fromKm: 10, toKm: null, ratePerKm: 6 }],
      weightSlabs: [{ fromKg: 0, toKg: 1, flatPay: 0 }, { fromKg: 1, toKg: null, flatPay: 20 }],
      sizeMultipliers: { small: 1.0, medium: 1.1, large: 1.3, xl: 1.6 },
      codBonus: 10, firstDeliveryDayBonus: 15, fiveStarRatingBonus: 20,
      cancelAfterAcceptPenalty: 20, lateDeliveryPenalty: 10, unjustifiedFailurePenalty: 15,
      isActive: true, name: 'Default',
    } as DeliveryRateConfig;
  }

  // ─── ZONE LOOKUP ──────────────────────────────────────────────────────────
  private async getZoneForPincode(pincode?: string): Promise<DeliveryZone | null> {
    if (!pincode) return null;
    return this.zoneModel.findOne({ pincodes: pincode, isActive: true }) || null;
  }

  // ─── ACTIVE SURGES ────────────────────────────────────────────────────────
  async getActiveSurges(warehouseId: Types.ObjectId, atTime: Date): Promise<DeliverySurgeRule[]> {
    const hour = atTime.getHours();
    const all = await this.surgeRuleModel.find({
      $or: [
        { applicableWarehouses: { $size: 0 } },
        { applicableWarehouses: warehouseId },
      ],
    });

    return all.filter((rule) => {
      if (!rule.isActive && rule.triggerType === SurgeTriggerType.MANUAL) return false;
      if (rule.triggerType === SurgeTriggerType.MANUAL)      return rule.isActive;
      if (rule.triggerType === SurgeTriggerType.TIME_WINDOW && rule.startHour != null && rule.endHour != null) {
        return rule.startHour > rule.endHour
          ? (hour >= rule.startHour || hour < rule.endHour)
          : (hour >= rule.startHour && hour < rule.endHour);
      }
      if (rule.triggerType === SurgeTriggerType.DATE_RANGE && rule.validFrom && rule.validTo) {
        return atTime >= rule.validFrom && atTime <= rule.validTo;
      }
      return false;
    });
  }

  // ─── FIRST DELIVERY TODAY ──────────────────────────────────────────────────
  private async isFirstDeliveryToday(partnerId: Types.ObjectId): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.partnerEarningsModel.countDocuments({
      partnerId,
      deliveredAt: { $gte: today },
    });
    return count === 0;
  }

  // ─── TARGET BONUSES ───────────────────────────────────────────────────────
  private async checkTargetBonuses(
    partnerId: Types.ObjectId,
    warehouseId: Types.ObjectId,
  ): Promise<{ amount: number; offerId?: Types.ObjectId; offerTitle?: string }> {
    const now = new Date();
    const activeOffers = await this.partnerOfferModel.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo:   { $gte: now },
      $and: [
        { $or: [{ applicableWarehouses: { $size: 0 } }, { applicableWarehouses: warehouseId }] },
        { $or: [{ applicablePartners:   { $size: 0 } }, { applicablePartners:   partnerId   }] },
      ],
    });

    let maxBonus = 0;
    let appliedOffer: PartnerOfferDocument | null = null;

    for (const offer of activeOffers) {
      const periodStart = this.getPeriodStart(offer.periodType);
      const completedCount = await this.partnerEarningsModel.countDocuments({
        partnerId,
        deliveredAt: { $gte: periodStart },
      });

      const sortedTiers = [...offer.tiers].sort((a, b) => b.targetCount - a.targetCount);
      for (const tier of sortedTiers) {
        if (completedCount >= tier.targetCount && tier.bonusAmount > maxBonus) {
          const alreadyPaid = await this.partnerEarningsModel.findOne({
            partnerId,
            appliedOfferId: offer._id,
            deliveredAt: { $gte: periodStart },
          });
          if (!alreadyPaid) {
            maxBonus = tier.bonusAmount;
            appliedOffer = offer as PartnerOfferDocument;
          }
          break;
        }
      }
    }

    return { amount: maxBonus, offerId: appliedOffer?._id, offerTitle: appliedOffer?.title };
  }

  private getPeriodStart(periodType: OfferPeriodType): Date {
    const now = new Date();
    if (periodType === OfferPeriodType.DAILY) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (periodType === OfferPeriodType.WEEKLY) {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.getFullYear(), now.getMonth(), diff);
    }
    if (periodType === OfferPeriodType.MONTHLY) {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return now;
  }
}
