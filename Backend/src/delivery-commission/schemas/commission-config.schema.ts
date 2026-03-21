import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommissionConfigDocument = CommissionConfig & Document;

@Schema({ timestamps: true })
export class CommissionConfig {
  @Prop({ required: true, default: 'GlobalConfig' })
  configKey: string;

  @Prop({ type: String, enum: ['MANUAL', 'RAZORPAY'], default: 'MANUAL' })
  payoutMode: 'MANUAL' | 'RAZORPAY';

  @Prop({ default: '' })
  razorpayKeyId: string;

  @Prop({ default: '' })
  razorpayKeySecret: string;

  @Prop({ default: '' })
  razorpayXAccountNumber: string;

  @Prop({ type: Number, default: 500 })
  minPayoutAmount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CommissionConfigSchema = SchemaFactory.createForClass(CommissionConfig);
CommissionConfigSchema.index({ configKey: 1 }, { unique: true });
