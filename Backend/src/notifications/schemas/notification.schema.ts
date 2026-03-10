import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum NotificationType {
  ORDER = 'order',
  STOCK = 'stock',
  SELLER = 'seller',
  SYSTEM = 'system',
  SHIPMENT = 'shipment',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    required: true,
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ required: true })
  recipientRole: string; // 'admin', 'subadmin', or 'user'

  @Prop()
  recipientId?: string; // Optional: target a specific user ID

  @Prop()
  link?: string; // Optional path for frontend navigation

  @Prop({ type: Object })
  metadata?: any; // Extra data like orderId or productId
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
