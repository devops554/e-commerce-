import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'ProductType', required: true })
  productType: Types.ObjectId;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  image?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({
    type: [
      {
        name: String,
      },
    ],
    _id: false,
  })
  attributes: {
    name: string;
  }[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: String, default: null })
  parentId: string | null;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ name: 'text' });
