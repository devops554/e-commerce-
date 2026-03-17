import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShipmentType {
  FORWARD = 'FORWARD',
  REVERSE = 'REVERSE',
}

export enum ShipmentStatus {
  ORDER_PLACED = 'ORDER_PLACED',
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
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
