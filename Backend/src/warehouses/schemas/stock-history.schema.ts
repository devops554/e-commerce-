import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum StockActionType {
    ADJUSTMENT = 'ADJUSTMENT',
    TRANSFER_IN = 'TRANSFER_IN',
    TRANSFER_OUT = 'TRANSFER_OUT',
    DISPATCH = 'DISPATCH',
    RESERVATION = 'RESERVATION',
    RELEASE = 'RELEASE',
}

export type StockHistoryDocument = StockHistory & Document;

@Schema({ timestamps: true })
export class StockHistory {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ProductVariant', required: true })
    variant: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
    warehouse: Types.ObjectId;

    @Prop({ type: String, enum: StockActionType, required: true })
    type: StockActionType;

    @Prop({ required: true })
    amount: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    actor: Types.ObjectId;

    @Prop()
    referenceId: string; // OrderId or other ref

    @Prop()
    source: string; // Vendor, company, or source of stock

    @Prop()
    notes: string;
}

export const StockHistorySchema = SchemaFactory.createForClass(StockHistory);
StockHistorySchema.index({ warehouse: 1, createdAt: -1 });
StockHistorySchema.index({ variant: 1 });
