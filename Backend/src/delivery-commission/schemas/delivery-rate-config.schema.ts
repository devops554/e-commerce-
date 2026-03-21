import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeliveryRateConfigDocument = DeliveryRateConfig & Document;

@Schema({ timestamps: true })
export class DeliveryRateConfig {
  @Prop({ type: Types.ObjectId, ref: 'Warehouse', default: null })
  warehouseId?: Types.ObjectId;

  @Prop({ required: true, default: 'Global Rate' })
  name: string;

  // ── Base pay ──
  @Prop({ type: Number, default: 30 })
  basePay: number;

  @Prop({ type: Number, default: 3 })
  baseKm: number;

  // ── Distance slabs ──
  @Prop({
    type: [{ fromKm: Number, toKm: Number, ratePerKm: Number }],
    default: [
      { fromKm: 3,  toKm: 10,   ratePerKm: 8 },
      { fromKm: 10, toKm: 20,   ratePerKm: 6 },
      { fromKm: 20, toKm: null, ratePerKm: 5 },
    ],
  })
  distanceSlabs: { fromKm: number; toKm: number | null; ratePerKm: number }[];

  // ── Weight slabs ──
  @Prop({
    type: [{ fromKg: Number, toKg: Number, flatPay: Number }],
    default: [
      { fromKg: 0,  toKg: 1,    flatPay: 0   },
      { fromKg: 1,  toKg: 5,    flatPay: 10  },
      { fromKg: 5,  toKg: 10,   flatPay: 25  },
      { fromKg: 10, toKg: 20,   flatPay: 50  },
      { fromKg: 20, toKg: null, flatPay: 100 },
    ],
  })
  weightSlabs: { fromKg: number; toKg: number | null; flatPay: number }[];

  // ── Size multipliers ──
  @Prop({
    type: { small: Number, medium: Number, large: Number, xl: Number },
    _id: false,
    default: { small: 1.0, medium: 1.1, large: 1.3, xl: 1.6 },
  })
  sizeMultipliers: { small: number; medium: number; large: number; xl: number };

  // ── Bonuses ──
  @Prop({ type: Number, default: 10 })
  codBonus: number;

  @Prop({ type: Number, default: 15 })
  firstDeliveryDayBonus: number;

  @Prop({ type: Number, default: 20 })
  fiveStarRatingBonus: number;

  // ── Penalties ──
  @Prop({ type: Number, default: 20 })
  cancelAfterAcceptPenalty: number;

  @Prop({ type: Number, default: 10 })
  lateDeliveryPenalty: number;

  @Prop({ type: Number, default: 15 })
  unjustifiedFailurePenalty: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const DeliveryRateConfigSchema = SchemaFactory.createForClass(DeliveryRateConfig);
DeliveryRateConfigSchema.index({ warehouseId: 1 }, { sparse: true });
