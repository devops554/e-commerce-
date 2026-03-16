import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from './product.schema';
import { User } from '../../users/schemas/user.schema';
import { Order } from '../../orders/schemas/order.schema';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ _id: false })
class ImageAsset {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  publicId: string;
}

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: [ImageAsset], default: [] })
  images: ImageAsset[];

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  // Delivery-specific feedback
  @Prop({ min: 1, max: 5 })
  deliveryRating?: number;

  @Prop()
  deliveryComment?: string;

  @Prop({
    type: String,
    enum: Object.values(ReviewStatus),
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  moderatedBy?: Types.ObjectId;

  @Prop()
  moderatedAt?: Date;

  @Prop()
  rejectionReason?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Add indexes for efficient querying
ReviewSchema.index({ productId: 1, status: 1 });
ReviewSchema.index({ customerId: 1 });
ReviewSchema.index({ orderId: 1 }, { unique: true }); // One review per order-item/order
