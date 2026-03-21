import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ZoneType {
  METRO_CORE  = 'METRO_CORE',
  METRO_OUTER = 'METRO_OUTER',
  SUBURBAN    = 'SUBURBAN',
  RURAL       = 'RURAL',
}

export type DeliveryZoneDocument = DeliveryZone & Document;

@Schema({ timestamps: true })
export class DeliveryZone {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: Object.values(ZoneType) })
  zoneType: ZoneType;

  @Prop({ type: Number, required: true })
  multiplier: number;

  @Prop({ type: [String], default: [] })
  pincodes: string[];

  @Prop({
    type: [{ latitude: Number, longitude: Number }],
    default: [],
  })
  boundary: { latitude: number; longitude: number }[];

  @Prop({ type: Types.ObjectId, ref: 'Warehouse' })
  warehouseId?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const DeliveryZoneSchema = SchemaFactory.createForClass(DeliveryZone);
DeliveryZoneSchema.index({ pincodes: 1 });
