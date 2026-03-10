import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document, Types } from 'mongoose';

export type WarehouseDocument = Warehouse & Document;

@Schema({ timestamps: true })
export class Warehouse {
  @Prop({ required: true, unique: true })
  code: string; // WH-PATNA-01

  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  managerId: Types.ObjectId;

  @Prop({
    type: {
      contactPerson: String,
      phone: String,
      email: String,
    },
  })
  contact: {
    contactPerson: string;
    phone: string;
    email: string;
  };

  @Prop({
    type: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
  })
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };

  @Prop({
    type: {
      latitude: Number,
      longitude: Number,
    },
  })
  location: {
    latitude: number;
    longitude: number;
  };

  @Prop({
    type: {
      totalCapacity: Number,
      usedCapacity: Number,
    },
  })
  capacity: {
    totalCapacity: number;
    usedCapacity: number;
  };

  @Prop({
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
    default: 'ACTIVE',
  })
  status: string;

  @Prop({ default: true })
  isPickupAvailable: boolean;

  @Prop({ default: true })
  isDeliveryAvailable: boolean;

  @Prop({ default: false })
  isDefaultWarehouse: boolean;

  @Prop()
  notes: string;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
