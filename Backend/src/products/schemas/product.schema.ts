import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {

    // ===== BASIC INFO =====
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug: string;

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
    baseSku: string;   // Parent SKU

    // ===== IMAGES =====
    @Prop({
        type: {
            url: String,
            publicId: String
        }
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
            selfLife: String
        },
        _id: false
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
        _id: false
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
        type: [
            {
                name: String,
                value: String
            }
        ],
        _id: false
    })
    attributes: {
        name: string;
        value: string;
    }[];

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
            profilePic: String
        },
        _id: false
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

    // Specs kept for legacy or unstructured info
    @Prop({ type: Object })
    specifications: Record<string, any>;

    @Prop({ type: Number, default: 0 })
    order: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slug: 1 });
ProductSchema.index({ title: 'text' });
ProductSchema.index({ category: 1 });

@Schema({ timestamps: true })
export class ProductVariant extends Document {

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    // ===== VARIANT SKU =====
    @Prop({ required: true, unique: true })
    sku: string;

    // ===== PRICE =====
    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ min: 0 })
    discount: number;

    @Prop({ min: 0 })
    discountPrice: number;

    @Prop({
        type: {
            name: String,
            value: String
        },
        _id: false
    })
    unit: {
        name?: string;
        value?: string;
    };

    @Prop({
        type: [
            {
                name: String,
                value: String
            }
        ],
        _id: false
    })
    attributes: {
        name: string;
        value: string;
    }[];

    // ===== STOCK =====
    @Prop({ required: true, min: 0 })
    stock: number;

    @Prop({ type: [String], default: [] })
    isFeatured: string[];

    // Variant images (color specific)
    @Prop([{ url: String, publicId: String }])
    images: { url: string; publicId: string }[];

    @Prop({ default: true })
    isActive: boolean;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

ProductVariantSchema.index({ product: 1 });
ProductVariantSchema.index({ sku: 1 });

