import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreConfigDocument = StoreConfig & Document;

@Schema({ timestamps: true })
export class StoreConfig {
  @Prop({ required: true, default: 'GlobalConfig' })
  configKey: string;

  @Prop({ required: true, default: 'Bivha Edusolution' })
  legalName: string;

  @Prop({ default: '' })
  gstin: string;

  @Prop({ default: '' })
  stateCode: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  phone: string;
}

export const StoreConfigSchema = SchemaFactory.createForClass(StoreConfig);
StoreConfigSchema.index({ configKey: 1 }, { unique: true });
