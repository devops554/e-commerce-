import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BannerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum BannerPage {
  HOME = 'home',
  CATEGORY = 'category',
  SEARCH_PAGE = 'search_page',
  PRODUCT_TYPE = 'product_type',
  PRODUCT_DETAIL = 'product_detail',
}

@Schema({ _id: false })
export class ButtonConfig {
  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ required: true, trim: true })
  link: string;
}

export const ButtonConfigSchema = SchemaFactory.createForClass(ButtonConfig);

@Schema({ _id: false })
export class BannerStat {
  @Prop({ required: true, trim: true })
  label: string;

  @Prop({ required: true, trim: true })
  value: string;
}

export const BannerStatSchema = SchemaFactory.createForClass(BannerStat);

@Schema({ timestamps: true })
export class Banner extends Document {
  @Prop({ type: [String], enum: BannerPage, default: [BannerPage.HOME] })
  pages: string[];

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  backgroundImage?: string;

  @Prop({ trim: true })
  mobileImage?: string;

  @Prop({ type: ButtonConfigSchema })
  primaryButton?: ButtonConfig;

  @Prop({ type: ButtonConfigSchema })
  secondaryButton?: ButtonConfig;

  @Prop({ default: true })
  showSearchBar: boolean;

  @Prop({ default: false })
  showStats: boolean;

  @Prop({ type: [BannerStatSchema], default: [] })
  stats: BannerStat[];

  @Prop({ enum: BannerStatus, default: BannerStatus.ACTIVE })
  status: BannerStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ status: 1, pages: 1 });
