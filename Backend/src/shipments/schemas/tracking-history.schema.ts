import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrackingHistoryDocument = TrackingHistory & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class TrackingHistory {
  @Prop({ type: Types.ObjectId, ref: 'Shipment', required: true })
  shipmentId: Types.ObjectId;

  @Prop({ required: true })
  status: string;

  @Prop({
    type: {
      latitude: Number,
      longitude: Number,
    },
    required: true,
  })
  location: {
    latitude: number;
    longitude: number;
  };

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const TrackingHistorySchema =
  SchemaFactory.createForClass(TrackingHistory);
