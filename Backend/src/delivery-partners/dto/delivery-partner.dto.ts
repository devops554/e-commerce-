import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  IsObject,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class AddressDto {
  @IsString()
  @IsOptional()
  addressLine?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  pincode?: string;
}

export class RegisterDeliveryPartnerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['BIKE', 'SCOOTER', 'CAR', 'VAN'])
  @IsOptional()
  vehicleType?: string;

  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsOptional()
  warehouseIds?: string[];

  @IsString()
  @IsOptional()
  aadhaarNumber?: string;

  @IsString()
  @IsOptional()
  panNumber?: string;

  @IsString()
  @IsOptional()
  aadhaarImage?: string;

  @IsString()
  @IsOptional()
  panImage?: string;

  @IsString()
  @IsOptional()
  drivingLicenseImage?: string;

  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  permanentAddress?: AddressDto;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  currentAddress?: AddressDto;
}

export class LoginDeliveryPartnerDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class PayoutMethodDto {
  @IsEnum(['BANK', 'UPI'])
  @IsOptional()
  method?: 'BANK' | 'UPI';

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  ifsc?: string;

  @IsString()
  @IsOptional()
  upiId?: string;

  @IsString()
  @IsOptional()
  razorpayContactId?: string;

  @IsString()
  @IsOptional()
  razorpayFundAccountId?: string;
}

export class UpdateDeliveryPartnerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['BIKE', 'SCOOTER', 'CAR', 'VAN'])
  vehicleType?: string;

  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  warehouseIds?: string[];

  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  permanentAddress?: AddressDto;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  currentAddress?: AddressDto;

  @IsOptional()
  @IsObject()
  @Type(() => PayoutMethodDto)
  payoutMethod?: PayoutMethodDto;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  accountStatus?: string;

  @IsOptional()
  @IsEnum(['ONLINE', 'OFFLINE', 'BUSY'])
  availabilityStatus?: string;

  @IsOptional()
  @IsString()
  blockReason?: string;

  @IsOptional()
  @IsString()
  aadhaarImage?: string;

  @IsOptional()
  @IsString()
  panImage?: string;

  @IsOptional()
  @IsString()
  drivingLicenseImage?: string;

  @IsOptional()
  @IsObject()
  documents?: {
    aadhaarNumber?: string;
    aadhaarImage?: string;
    panNumber?: string;
    panImage?: string;
    drivingLicenseImage?: string;
  };

  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class UpdateLocationDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
