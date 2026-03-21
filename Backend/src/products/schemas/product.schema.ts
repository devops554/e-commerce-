import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export enum ReturnWindowUnit {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
}

export enum ReturnCondition {
  UNUSED = 'UNUSED',
  ORIGINAL_PACKAGING = 'ORIGINAL_PACKAGING',
  WITH_TAGS = 'WITH_TAGS',
  ANY = 'ANY',
}

export enum RefundMethod {
  ORIGINAL_SOURCE = 'ORIGINAL_SOURCE',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum ExchangeAllowed {
  YES = 'YES',
  NO = 'NO',
  SIZE_ONLY = 'SIZE_ONLY',
}

// ─────────────────────────────────────────────
// SUB-SCHEMAS
// ─────────────────────────────────────────────

@Schema({ _id: false })
export class ReturnPolicy {
  @Prop({ default: false })
  isReturnable: boolean;

  @Prop({ default: 0 })
  windowValue: number;

  @Prop({
    type: String,
    enum: Object.values(ReturnWindowUnit),
    default: ReturnWindowUnit.DAYS,
  })
  windowUnit: ReturnWindowUnit;

  @Prop({
    type: [String],
    enum: Object.values(ReturnCondition),
    default: [],
  })
  conditions: ReturnCondition[];

  @Prop({ default: false })
  requiresQcPhoto: boolean;

  @Prop({ default: true })
  doorstepQcRequired: boolean;

  @Prop({
    type: [String],
    enum: Object.values(RefundMethod),
    default: [RefundMethod.ORIGINAL_SOURCE],
  })
  refundMethods: RefundMethod[];

  @Prop({
    type: String,
    enum: Object.values(ExchangeAllowed),
    default: ExchangeAllowed.NO,
  })
  exchangeAllowed: ExchangeAllowed;

  @Prop({ type: [String], default: [] })
  nonReturnableReasons: string[];

  @Prop({ type: [String], default: [] })
  excludedSkuPatterns: string[];

  @Prop({ type: String, default: '' })
  internalNote: string;
}

export const ReturnPolicySchema = SchemaFactory.createForClass(ReturnPolicy);

@Schema({ _id: false })
export class Faq {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);



export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  // ===== BASIC INFO =====
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ type: [FaqSchema], default: [] })
  faqs: Faq[];

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ type: Types.ObjectId, ref: 'ProductType', required: true })
  productType: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  subCategory?: Types.ObjectId;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  baseSku: string;

  // ===== IMAGES =====
  @Prop({
    type: {
      url: String,
      publicId: String,
    },
  })
  thumbnail: {
    url: string;
    publicId: string;
  };

  @Prop([{ url: String, publicId: String }])
  images: { url: string; publicId: string }[];

  // ===== FILTER OPTIONS =====
  @Prop([String])
  availableSizes: string[];

  @Prop([String])
  availableColors: string[];

  @Prop([String])
  availableStorage: string[];

  @Prop([String])
  availableModels: string[];

  // ===== RATING =====
  @Prop({ default: 0 })
  ratingsAverage: number;

  @Prop({ default: 0 })
  ratingsCount: number;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  // ===== MANUFACTURER INFO =====
  @Prop({
    type: {
      name: String,
      address: String,
      countryOfOrigin: String,
      selfLife: String,
    },
    _id: false,
  })
  manufacturerInfo: {
    name?: string;
    address?: string;
    countryOfOrigin?: string;
    selfLife?: string;
  };

  @Prop({
    type: {
      materialtype: String,
      ingredients: String,
      nutritionalInfo: String,
      usage: String,
      dietryPreference: String,
      storage: String,
    },
    _id: false,
  })
  highLight: {
    materialtype?: string;
    ingredients?: string;
    nutritionalInfo?: string;
    usage?: string;
    dietryPreference?: string;
    storage?: string;
  };

  @Prop({
    type: [{ name: String, value: String }],
    _id: false,
  })
  attributes: { name: string; value: string }[];

  @Prop({ type: String })
  disclaimer: string;

  @Prop({ type: String })
  warranty: string;

  @Prop({
    type: {
      name: String,
      address: String,
      email: String,
      phone: String,
      profilePic: String,
    },
    _id: false,
  })
  customerCareDetails: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
    profilePic?: string;
  };

  // ===== SEO =====
  @Prop({
    type: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    _id: false,
  })
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  // ===== GST / TAX =====
  @Prop({
    type: {
      hsnCode: { type: String },
      gstRate: { type: Number, enum: [0, 3, 5, 12, 18, 28] },
      includedInPrice: { type: Boolean, default: true },
    },
    _id: false,
  })
  gst?: {
    hsnCode: string;
    gstRate: number;
    includedInPrice: boolean;
  };

  // ===== RETURN POLICY (NEW) =====
  @Prop({ type: ReturnPolicySchema, default: () => ({}) })
  returnPolicy: ReturnPolicy;

  // ===== ADMIN / META =====
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: false })
  isNewArrival: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop([String])
  tags: string[];

  @Prop({ type: Object })
  specifications: Record<string, any>;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'Seller' })
  seller?: Types.ObjectId;

  @Prop({ type: String, default: '' })
  sellerStateCode?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ title: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ 'returnPolicy.isReturnable': 1 });

// ─────────────────────────────────────────────
// PRODUCT VARIANT SCHEMA (unchanged)
// ─────────────────────────────────────────────

@Schema({ timestamps: true })
export class ProductVariant extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  discount: number;

  @Prop({ min: 0 })
  discountPrice: number;

  @Prop({
    type: { name: String, value: String },
    _id: false,
  })
  unit: { name?: string; value?: string };

  @Prop({
    type: [{ name: String, value: String }],
    _id: false,
  })
  attributes: { name: string; value: string }[];

  @Prop({ type: [String], default: [] })
  isFeatured: string[];

  @Prop([{ url: String, publicId: String }])
  images: { url: string; publicId: string }[];

  @Prop({ default: true })
  isActive: boolean;

  // ── Commission / Shipping Metadata ──
  @Prop({ type: Number, default: 0 })
  weightKg: number;           // weight of this variant in kg

  @Prop({
    type: { length: Number, width: Number, height: Number },
    _id: false
  })
  dimensionsCm?: { length: number; width: number; height: number };

}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

ProductVariantSchema.index({ product: 1 });
ProductVariantSchema.index({ sku: 1 });

// ─────────────────────────────────────────────
// END OF FILE
// ─────────────────────────────────────────────