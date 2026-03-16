import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReturnReason, ReturnRequestStatus, QcGrade } from './return-enums'; // I'll create this file next

export type ReturnRequestDocument = ReturnRequest & Document;

@Schema({ timestamps: true })
export class ReturnRequest {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: String, required: true }) // Storing as string since orderItems are nested in Order usually
  orderItemId: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant', required: true })
  variantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Seller' })
  sellerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
  warehouseId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ReturnReason),
    required: true,
  })
  reason: ReturnReason;

  @Prop()
  reasonDescription?: string;

  @Prop({
    type: [{ url: String, publicId: String }],
  })
  evidenceMedia: { url: string; publicId: string }[];

  @Prop({
    type: String,
    enum: Object.values(ReturnRequestStatus),
    default: ReturnRequestStatus.PENDING,
  })
  status: ReturnRequestStatus;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Shipment' })
  returnShipmentId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(QcGrade),
  })
  warehouseQcGrade?: QcGrade;

  @Prop()
  warehouseQcNotes?: string;

  @Prop({ type: Date })
  warehouseReceivedAt?: Date;

  @Prop({ type: String }) // Refund method chosen (Enum matching product policy)
  refundMethod?: string;

  @Prop({ type: Number })
  refundAmount?: number;

  @Prop({ type: Number })
  gstReversalAmount?: number;

  @Prop()
  refundTransactionId?: string;

  @Prop({ type: Date })
  refundInitiatedAt?: Date;

  @Prop({ type: Date })
  refundCompletedAt?: Date;

  @Prop({ type: Number, default: 1 })
  quantity: number;

  @Prop({ type: Types.ObjectId, ref: 'User' }) // Admin or Manager who reviewed
  reviewedBy?: Types.ObjectId;

  @Prop()
  adminNote?: string;
}

export const ReturnRequestSchema = SchemaFactory.createForClass(ReturnRequest);
