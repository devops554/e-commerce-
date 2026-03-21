import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OfferPeriodType {
  DAILY   = 'DAILY',
  WEEKLY  = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM  = 'CUSTOM',
}

export enum OfferType {
  DELIVERY_COUNT = 'DELIVERY_COUNT',
  ZONE_DELIVERY  = 'ZONE_DELIVERY',
  COD_TARGET     = 'COD_TARGET',
  RATING_TARGET  = 'RATING_TARGET',
}

export type PartnerOfferDocument = PartnerOffer & Document;

@Schema({ timestamps: true })
export class PartnerOffer {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, enum: Object.values(OfferType) })
  offerType: OfferType;

  @Prop({ type: String, enum: Object.values(OfferPeriodType) })
  periodType: OfferPeriodType;

  @Prop({
    type: [{ targetCount: Number, bonusAmount: Number, label: String }],
    default: [],
  })
  tiers: { targetCount: number; bonusAmount: number; label?: string }[];

  @Prop({ type: Types.ObjectId, ref: 'DeliveryZone' })
  targetZoneId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Warehouse' }], default: [] })
  applicableWarehouses: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'DeliveryPartner' }], default: [] })
  applicablePartners: Types.ObjectId[];

  @Prop({ type: Date, required: true })
  validFrom: Date;

  @Prop({ type: Date, required: true })
  validTo: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const PartnerOfferSchema = SchemaFactory.createForClass(PartnerOffer);
PartnerOfferSchema.index({ validFrom: 1, validTo: 1, isActive: 1 });
