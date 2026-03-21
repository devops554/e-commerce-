import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShipmentType {
  FORWARD = 'FORWARD',
  REVERSE = 'REVERSE',
}

export enum ShipmentStatus {
  ORDER_PLACED = 'ORDER_PLACED',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  ASSIGNED_TO_DELIVERY = 'ASSIGNED_TO_DELIVERY',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED_DELIVERY = 'FAILED_DELIVERY',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  FAILED_PICKUP = 'FAILED_PICKUP',
}

export type ShipmentDocument = Shipment & Document;

@Schema({ timestamps: true })
export class Shipment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
  warehouseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DeliveryPartner' })
  deliveryPartnerId: Types.ObjectId;

  @Prop({ unique: true, required: true })
  trackingNumber: string;

  @Prop({
    type: String,
    enum: Object.values(ShipmentType),
    default: ShipmentType.FORWARD,
  })
  type: ShipmentType;

  @Prop({
    type: String,
    enum: Object.values(ShipmentStatus),
    default: ShipmentStatus.ORDER_PLACED,
  })
  status: ShipmentStatus;

  @Prop({ type: Date })
  assignedAt: Date;

  @Prop({ type: Date })
  acceptedAt: Date;

  @Prop({ type: Date })
  pickedAt: Date;

  @Prop({ type: Date })
  outForDeliveryAt: Date;

  @Prop({ type: Date })
  deliveredAt: Date;
  @Prop()
  pickupOtp?: string;

  @Prop({ type: Date })
  pickupOtpExpires?: Date;

  @Prop()
  deliveryOtp?: string;

  @Prop({ type: Date })
  deliveryOtpExpires?: Date;

  @Prop([{ url: String, publicId: String }])
  verificationMedia?: { url: string; publicId: string }[];

  @Prop()
  pickupNotes?: string;

  @Prop({ default: 0 })
  commissionEarned?: number;

  @Prop({ type: Number, default: 0 })
  estimatedEarning: number;

  @Prop({ type: Number, default: 0 })
  actualEarning: number;

  @Prop([{
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  }])
  locationHistory: { latitude: number; longitude: number; timestamp: Date }[];

  // ── Commission / Logistics Metadata ──
  @Prop({ type: Number, default: 0 })
  distanceKm: number;

  @Prop({ type: String, enum: ['small', 'medium', 'large', 'xl'], default: 'small' })
  packageSize: string;

  @Prop({ type: Number, default: 0 })
  weightKg: number;

  @Prop({
    type: {
      length: Number,
      width: Number,
      height: Number,
    },
  })
  dimensionsCm?: { length: number; width: number; height: number };

  @Prop({ type: Boolean, default: false })
  codCollected: boolean;

  @Prop({
    type: String,
    enum: ['AUTO', 'MANUAL'],
    default: 'AUTO',
  })
  assignmentType: string;

  @Prop({ type: Types.ObjectId, ref: 'PartnerEarnings' })
  earningsId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ReturnRequest' })
  returnRequestId?: Types.ObjectId;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
