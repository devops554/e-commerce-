import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PayoutStatus {
  PENDING = 'PENDING',
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  DISPUTED = 'DISPUTED',
}

export type PartnerEarningsDocument = PartnerEarnings & Document;

@Schema({ timestamps: true })
export class PartnerEarnings {
  @Prop({ type: Types.ObjectId, ref: 'DeliveryPartner', required: true })
  partnerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Shipment', required: true })
  shipmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  // ── Inputs used for calculation ──
  @Prop({ type: Number }) distanceKm: number;
  @Prop({ type: Number }) weightKg: number;
  @Prop({ type: String, enum: ['small', 'medium', 'large', 'xl'] }) packageSize: string;
  @Prop({ type: Number, default: 1.0 }) surgeMultiplier: number;
  @Prop({ type: Number, default: 1.0 }) zoneMultiplier: number;
  @Prop({ type: String }) zoneName?: string;
  @Prop({ type: [String], default: [] }) activeSurgeNames: string[];

  // ── Breakdown ──
  @Prop({ type: Number, default: 0 }) basePay: number;
  @Prop({ type: Number, default: 0 }) distancePay: number;
  @Prop({ type: Number, default: 0 }) weightPay: number;
  @Prop({ type: Number, default: 0 }) sizePay: number;
  @Prop({ type: Number, default: 0 }) surgePay: number;
  @Prop({ type: Number, default: 0 }) zonePay: number;
  @Prop({ type: Number, default: 0 }) codBonus: number;
  @Prop({ type: Number, default: 0 }) firstDeliveryBonus: number;
  @Prop({ type: Number, default: 0 }) ratingBonus: number;
  @Prop({ type: Number, default: 0 }) targetBonus: number;
  @Prop({ type: Number, default: 0 }) penalties: number;
  @Prop({ type: String }) penaltyReason?: string;

  // ── Total ──
  @Prop({ type: Number, required: true })
  totalEarned: number;

  // ── Offer that triggered targetBonus ──
  @Prop({ type: Types.ObjectId, ref: 'PartnerOffer' })
  appliedOfferId?: Types.ObjectId;

  // ── Payout status ──
  @Prop({ type: String, enum: Object.values(PayoutStatus), default: PayoutStatus.PENDING })
  payoutStatus: PayoutStatus;

  @Prop({ type: String, enum: ['RAZORPAY', 'MANUAL_UPI', 'CASH'] })
  payoutMode?: string;

  @Prop({ type: String })
  payoutNote?: string;

  @Prop({ type: Date }) paidAt?: Date;
  @Prop({ type: String }) payoutTransactionId?: string;
  @Prop({ type: Date }) deliveredAt: Date;
}

export const PartnerEarningsSchema = SchemaFactory.createForClass(PartnerEarnings);
PartnerEarningsSchema.index({ partnerId: 1, deliveredAt: -1 });
PartnerEarningsSchema.index({ payoutStatus: 1 });
PartnerEarningsSchema.index({ shipmentId: 1 }, { unique: true });
