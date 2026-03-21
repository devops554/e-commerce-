import { NextFunction } from 'express';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption.util';

@Schema({ timestamps: true, toJSON: { getters: true }, toObject: { getters: true } })
export class Seller extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  storeName: string;

  @Prop()
  storeDescription: string;

  @Prop({ required: true })
  businessType: string;

  @Prop({ required: true })
  panNumber: string;

  @Prop({ required: true })
  aadharNumber: string;

  @Prop({ required: true })
  gstNumber: string;

  @Prop({
    type: {
      accountHolderName: { type: String, get: decrypt, set: encrypt },
      accountNumber: { type: String, get: decrypt, set: encrypt },
      ifscCode: { type: String, get: decrypt, set: encrypt },
      bankName: { type: String, get: decrypt, set: encrypt },
    },
    required: true,
  })
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };

  @Prop({
    type: {
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
    },
    required: true,
  })
  pickupAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };

  @Prop({ type: [String], required: true })
  productCategories: string[];

  @Prop({ type: [String], required: true })
  topCategories: string[];

  @Prop({ type: [String], required: true })
  retailChannels: string[];

  @Prop({ type: [String] })
  socialChannels: string[];

  @Prop({ type: String })
  monthlySales: string;

  @Prop({ type: [String] })
  referenceLinks: string[];

  @Prop({ type: [String] })
  socialMediaLinks: string[];

  @Prop({ type: [Number] })
  userCounts: number[];

  @Prop({
    type: {
      name: String,
      email: String,
      designation: String,
    },
    required: true,
  })
  spocDetails: {
    name: string;
    email: string;
    designation: string;
  };

  @Prop({
    type: {
      aadhar: String,
      pan: String,
      license: String,
      passbook: String,
      digitalSignature: String,
    },
  })
  documentPaths: {
    aadhar: string;
    pan: string;
    license: string;
    passbook: string;
    digitalSignature: string;
  };

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ unique: true, sparse: true })
  slug: string;

  @Prop({ type: String, default: '' })
  stateCode: string; // extracted from gstNumber.slice(0,2)
}

export const SellerSchema = SchemaFactory.createForClass(Seller);

// Pre-save hook
SellerSchema.pre('save', async function () {
  const seller = this as any;
  if (seller.gstNumber?.length >= 2) {
    seller.stateCode = seller.gstNumber.slice(0, 2);
  }
});

SellerSchema.pre('findOneAndReplace', async function () {
  const update = this.getUpdate() as any;
  if (update?.gstNumber?.length >= 2) {
    update.stateCode = update.gstNumber.slice(0, 2);
  }
});

SellerSchema.index({ user: 1 });
SellerSchema.index({ email: 1 });
SellerSchema.index({ slug: 1 });
