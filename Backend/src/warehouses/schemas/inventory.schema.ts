import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ProductVariant', required: true })
    variant: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
    warehouse: Types.ObjectId;

    @Prop({ required: true, min: 0, default: 0 })
    quantity: number;

    @Prop({ required: true, min: 0, default: 0 })
    totalReceived: number;

    @Prop({ required: true, min: 0, default: 0 })
    totalDispatched: number;

    @Prop({ required: true, min: 0, default: 0 })
    reserved: number; // For pending orders
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Unique index to ensure one record per variant per warehouse
InventorySchema.index({ variant: 1, warehouse: 1 }, { unique: true });
InventorySchema.index({ warehouse: 1 });
InventorySchema.index({ product: 1 });
