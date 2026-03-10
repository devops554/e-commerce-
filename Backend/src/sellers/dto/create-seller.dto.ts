import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSellerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  storeName: string;

  @IsOptional()
  @IsString()
  storeDescription?: string;

  @IsNotEmpty()
  @IsString()
  businessType: string;

  @IsNotEmpty()
  @IsString()
  panNumber: string;

  @IsNotEmpty()
  @IsString()
  aadharNumber: string;

  @IsNotEmpty()
  @IsString()
  gstNumber: string;

  @IsNotEmpty()
  @IsObject()
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };

  @IsNotEmpty()
  @IsObject()
  pickupAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @IsNotEmpty()
  @IsString({ each: true })
  productCategories: string[];

  @IsNotEmpty()
  @IsString({ each: true })
  topCategories: string[];

  @IsNotEmpty()
  @IsString({ each: true })
  retailChannels: string[];

  @IsOptional()
  @IsString({ each: true })
  socialChannels?: string[];

  @IsOptional()
  @IsString()
  monthlySales?: string;

  @IsOptional()
  @IsString({ each: true })
  referenceLinks?: string[];

  @IsOptional()
  @IsString({ each: true })
  socialMediaLinks?: string[];

  @IsOptional()
  @IsString({ each: true })
  userCounts?: string[];

  @IsNotEmpty()
  @IsObject()
  spocDetails: {
    name: string;
    email: string;
    designation: string;
  };

  @IsOptional()
  @IsObject()
  documentPaths?: {
    aadhar?: string;
    pan?: string;
    license?: string;
    passbook?: string;
    digitalSignature?: string;
  };
}
