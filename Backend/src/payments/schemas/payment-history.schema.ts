import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentHistory extends Document {
    @Prop({ required: true })
    orderId: string; // Razorpay order ID or internal order ID

    @Prop()
    razorpayOrderId: string;

    @Prop()
    razorpayPaymentId: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ default: 'INR' })
    currency: string;

    @Prop({ required: true })
    status: string; // captured, failed, refunded, processing, etc.

    @Prop()
    method: string; // card, netbanking, wallet, etc.

    @Prop()
    email: string;

    @Prop()
    contact: string;

    @Prop({ type: Object })
    rawResponse: any;

    @Prop({ default: 'payment' })
    type: string; // payment, refund, payout

    @Prop()
    razorpayPayoutId?: string;

    @Prop()
    error_code?: string;

    @Prop()
    error_description?: string;

    @Prop()
    event?: string; // Captured from webhook: payment.captured, payment.failed, payout.processed, etc.
}

export const PaymentHistorySchema = SchemaFactory.createForClass(PaymentHistory);

PaymentHistorySchema.index({ orderId: 1 });
PaymentHistorySchema.index({ razorpayOrderId: 1 });
PaymentHistorySchema.index({ razorpayPaymentId: 1 });
