import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption.util';

export enum UserRole {
  ADMIN = 'admin',
  SUB_ADMIN = 'subadmin',
  SELLER = 'seller',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

@Schema({ timestamps: true })
export class Address {
  _id: Types.ObjectId;

  @Prop({ required: true })
  label: string; // "Home", "Office", "Other"

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  street: string;

  @Prop()
  landmark?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: { latitude: Number, longitude: Number } })
  location?: { latitude: number; longitude: number };
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true })
export class BankAccount {
  _id: Types.ObjectId;

  @Prop({ required: true, get: decrypt, set: encrypt })
  accountHolderName: string;

  @Prop({ required: true, get: decrypt, set: encrypt })
  accountNumber: string;

  @Prop({ required: true, get: decrypt, set: encrypt })
  ifscCode: string;

  @Prop({ required: true, get: decrypt, set: encrypt })
  bankName: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);

export type UserDocument = User & Document;

@Schema({ timestamps: true, toJSON: { getters: true }, toObject: { getters: true } })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  avatar: string;

  @Prop({ enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop()
  phone?: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];

  @Prop({ type: [BankAccountSchema], default: [] })
  bankAccounts: BankAccount[];

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
