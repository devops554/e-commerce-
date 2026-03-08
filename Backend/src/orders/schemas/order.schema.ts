import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
    CREATED = 'created',
    PENDING = 'pending',
    PAID = 'paid',
    CONFIRMED = 'confirmed',
    PACKED = 'packed',
    SHIPPED = 'shipped',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    DELIVERED = 'delivered',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    RETURNED = 'returned',
    FAILED_DELIVERY = 'failed_delivery',
}

export enum PaymentMethod {
    COD = 'cod',
    RAZORPAY = 'razorpay',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Order extends Document {
    @Prop({ required: true })
    orderId: string; // Internal human-readable order ID

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop([{
        product: { type: Types.ObjectId, ref: 'Product', required: true },
        variant: { type: Types.ObjectId, ref: 'ProductVariant', required: true },
        warehouse: { type: Types.ObjectId, ref: 'Warehouse' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Snapshotted price
        title: String,
        status: { type: String, enum: OrderStatus, default: OrderStatus.PENDING },
        cancelReason: { type: String, default: '' },
    }])
    items: {
        product: Types.ObjectId;
        variant: Types.ObjectId;
        warehouse: Types.ObjectId;
        quantity: number;
        price: number;
        title: string;
        status: OrderStatus;
        cancelReason?: string;
    }[];

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true, enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
    paymentStatus: PaymentStatus;

    @Prop({ required: true, enum: OrderStatus, default: OrderStatus.CREATED })
    orderStatus: OrderStatus;

    @Prop({
        type: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            street: { type: String, required: true },
            landmark: String,
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        required: true,
    })
    shippingAddress: {
        fullName: string;
        phone: string;
        street: string;
        landmark?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };

    @Prop()
    razorpayOrderId?: string;

    @Prop()
    razorpayPaymentId?: string;

    @Prop()
    razorpaySignature?: string;

    @Prop({ default: false })
    isStockDeducted: boolean;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: '' })
    cancelReason: string;

    @Prop({ default: '' })
    cancelBy: string;

    @Prop({ default: null })
    cancelAt: Date;

    @Prop([{
        actor: { type: Types.ObjectId, ref: 'User', required: true },
        actorRole: { type: String, required: true },
        action: { type: String, required: true }, // e.g., 'STATUS_UPDATE', 'CANCELLED'
        status: { type: String, enum: OrderStatus, required: true },
        note: String,
        timestamp: { type: Date, default: Date.now }
    }])
    history: {
        actor: Types.ObjectId;
        actorRole: string;
        action: string;
        status: OrderStatus;
        note?: string;
        timestamp: Date;
    }[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderId: 1 });
OrderSchema.index({ user: 1 });
OrderSchema.index({ orderStatus: 1 });
