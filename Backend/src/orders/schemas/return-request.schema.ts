import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReturnReason, ReturnRequestStatus, QcGrade } from './return-enums'; // I'll create this file next
import { encrypt, decrypt } from '../../utils/encryption.util';

export type ReturnRequestDocument = ReturnRequest & Document;

@Schema({ _id: false, toJSON: { getters: true }, toObject: { getters: true } })
export class BankDetails {
  @Prop({ type: String, get: decrypt, set: encrypt })
  accountHolderName: string;

  @Prop({ type: String, get: decrypt, set: encrypt })
  accountNumber: string;

  @Prop({ type: String, get: decrypt, set: encrypt })
  ifscCode: string;

  @Prop({ type: String, get: decrypt, set: encrypt })
  bankName: string;
}
export const BankDetailsSchema = SchemaFactory.createForClass(BankDetails);
BankDetailsSchema.set('toJSON', { getters: true });
BankDetailsSchema.set('toObject', { getters: true });

@Schema({ timestamps: true, toJSON: { getters: true }, toObject: { getters: true } })
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
  evidenceMedia: { url: string; publicId?: string }[];

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

  @Prop({ type: Types.ObjectId, ref: 'DeliveryPartner' })
  assignedPartnerId?: Types.ObjectId;

  @Prop({ type: Date })
  assignedAt?: Date;

  @Prop({ type: Number, default: 0 })
  assignmentAttempts: number;

  @Prop({ type: Date })
  partnerAcceptedAt?: Date;

  @Prop({ type: Date })
  partnerRejectedAt?: Date;

  @Prop({ type: String })
  partnerRejectionReason?: string;

  @Prop({ type: String })
  customerOtp?: string;

  @Prop({ type: Date })
  customerOtpVerifiedAt?: Date;

  @Prop({ type: String })
  managerOtp?: string;

  @Prop({ type: Date })
  managerOtpSentAt?: Date;

  @Prop({ type: Date })
  managerOtpVerifiedAt?: Date;

  @Prop({ type: Date })
  qcCompletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  qcDoneBy?: Types.ObjectId;

  @Prop({
    type: [{ url: String, publicId: String }],
  })
  verificationMedia: { url: string; publicId?: string }[];

  @Prop({ type: String })
  pickupNotes?: string;

  @Prop({ type: Number })
  weightKg?: number;

  @Prop({
    type: { length: Number, width: Number, height: Number },
    _id: false
  })
  dimensionsCm?: { length: number; width: number; height: number };

  @Prop({ type: BankDetailsSchema })
  bankDetails?: BankDetails;
}

export const ReturnRequestSchema = SchemaFactory.createForClass(ReturnRequest);
ReturnRequestSchema.set('toJSON', { getters: true });
ReturnRequestSchema.set('toObject', { getters: true });

ReturnRequestSchema.index({ assignedPartnerId: 1 });
ReturnRequestSchema.index({ warehouseId: 1, status: 1 });
