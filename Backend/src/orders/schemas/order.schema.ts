import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  CREATED = 'CREATED',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  FAILED_DELIVERY = 'FAILED_DELIVERY',
  PENDING_REASSIGNMENT = 'PENDING_REASSIGNMENT',
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

  @Prop([
    {
      product: { type: Types.ObjectId, ref: 'Product', required: true },
      variant: { type: Types.ObjectId, ref: 'ProductVariant', required: true },
      warehouse: { type: Types.ObjectId, ref: 'Warehouse' },
      quantity: { type: Number, required: true },

      // ─── Price snapshot ───
      price: { type: Number, required: true }, // selling price per unit (GST-inclusive)
      title: String,
      image: String,

      // ─── GST snapshot (captured at order time) ───
      hsnCode: { type: String, default: '' },
      gstRate: { type: Number, default: 0 }, // e.g. 18
      basePrice: { type: Number, default: 0 }, // taxable value per unit (ex-GST)
      gstAmountPerUnit: { type: Number, default: 0 },
      cgst: { type: Number, default: 0 }, // per unit (0 for inter-state)
      sgst: { type: Number, default: 0 }, // per unit (0 for inter-state)
      igst: { type: Number, default: 0 }, // per unit (0 for intra-state)

      // ─── Line totals ───
      lineTotal: { type: Number, default: 0 }, // price * quantity
      lineTaxableValue: { type: Number, default: 0 }, // basePrice * quantity
      lineCgst: { type: Number, default: 0 },
      lineSgst: { type: Number, default: 0 },
      lineIgst: { type: Number, default: 0 },
      lineTotalGst: { type: Number, default: 0 },

      status: { type: String, enum: OrderStatus, default: OrderStatus.PENDING },
      cancelReason: { type: String, default: '' },

      // ─── Seller snapshot ───
      seller: { type: Types.ObjectId, ref: 'Seller' },
      sellerName: { type: String, default: '' },
      sellerGstin: { type: String, default: '' },
      sellerStateCode: { type: String, default: '' },
    },
  ])
  items: {
    product: Types.ObjectId;
    variant: Types.ObjectId;
    warehouse: Types.ObjectId;
    quantity: number;

    // Price snapshot
    price: number;
    title: string;
    image?: string;

    // GST snapshot
    hsnCode: string;
    gstRate: number;
    basePrice: number;
    gstAmountPerUnit: number;
    cgst: number;
    sgst: number;
    igst: number;

    // Line totals
    lineTotal: number;
    lineTaxableValue: number;
    lineCgst: number;
    lineSgst: number;
    lineIgst: number;
    lineTotalGst: number;

    status: OrderStatus;
    cancelReason?: string;

    // Seller snapshot
    seller: Types.ObjectId;
    sellerName: string;
    sellerGstin: string;
    sellerStateCode: string;
  }[];

  // ─── GST Order-Level Totals ───
  @Prop({ type: Number, default: 0 })
  subTotal: number; // sum of all lineTaxableValue

  @Prop({ type: Number, default: 0 })
  totalCgst: number;

  @Prop({ type: Number, default: 0 })
  totalSgst: number;

  @Prop({ type: Number, default: 0 })
  totalIgst: number;

  @Prop({ type: Number, default: 0 })
  totalGstAmount: number; // totalCgst + totalSgst | totalIgst

  @Prop({ type: Number, default: 0 })
  shippingCharge: number;

  @Prop({ required: true })
  totalAmount: number; // subTotal + totalGstAmount + shippingCharge

  // ─── GST Tax Context ───
  @Prop({ type: Boolean, default: false })
  isInterState: boolean; // seller state !== buyer state

  @Prop({ type: String, default: '' })
  invoiceNumber: string; // INV-YYYYMM-00001

  @Prop({ type: Date })
  invoiceDate: Date;

  // ─── Payment ───
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

  @Prop([
    {
      actor: { type: Types.ObjectId, ref: 'User', required: true },
      actorRole: { type: String, required: true },
      action: { type: String, required: true }, // e.g., 'STATUS_UPDATE', 'CANCELLED'
      status: { type: String, enum: OrderStatus, required: true },
      note: String,
      timestamp: { type: Date, default: Date.now },
    },
  ])
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
OrderSchema.index({ invoiceNumber: 1 }, { sparse: true });
