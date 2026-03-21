import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SurgeTriggerType {
  MANUAL      = 'MANUAL',
  TIME_WINDOW = 'TIME_WINDOW',
  DATE_RANGE  = 'DATE_RANGE',
  WEATHER     = 'WEATHER',
  DEMAND      = 'DEMAND',
}

export type DeliverySurgeRuleDocument = DeliverySurgeRule & Document;

@Schema({ timestamps: true })
export class DeliverySurgeRule {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: Object.values(SurgeTriggerType) })
  triggerType: SurgeTriggerType;

  @Prop({ type: Number, required: true })
  multiplier: number;

  @Prop({ type: Number })
  startHour?: number;

  @Prop({ type: Number })
  endHour?: number;

  @Prop({ type: Date })
  validFrom?: Date;

  @Prop({ type: Date })
  validTo?: Date;

  @Prop({ type: Number })
  demandThresholdPercent?: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Warehouse' }], default: [] })
  applicableWarehouses: Types.ObjectId[];

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: Date })
  manuallyActivatedAt?: Date;

  @Prop({ type: Date })
  manuallyDeactivatedAt?: Date;
}

export const DeliverySurgeRuleSchema = SchemaFactory.createForClass(DeliverySurgeRule);
