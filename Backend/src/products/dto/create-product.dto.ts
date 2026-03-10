import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  ValidateNested,
  IsNumber,
  IsIn,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  publicId: string;
}

class ManufacturerInfoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @IsOptional()
  @IsString()
  selfLife?: string;
}

class HighLightDto {
  @IsOptional()
  @IsString()
  materialtype?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  nutritionalInfo?: string;

  @IsOptional()
  @IsString()
  usage?: string;

  @IsOptional()
  @IsString()
  dietryPreference?: string;

  @IsOptional()
  @IsString()
  storage?: string;
}

export class ProductAttributeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  value?: string;
}

class CustomerCareDetailsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  profilePic?: string;
}

class SeoDto {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

export class GstDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}(\d{4})?$/, {
    message: 'hsnCode must be exactly 4 or 8 digits (e.g. 1004 or 10041000)',
  })
  hsnCode: string;

  @IsIn([0, 3, 5, 12, 18, 28], {
    message: 'gstRate must be one of: 0, 3, 5, 12, 18, 28',
  })
  gstRate: number;

  @IsBoolean()
  @IsOptional()
  includedInPrice?: boolean; // defaults to true in schema
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsString()
  @IsNotEmpty()
  productType: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  baseSku: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ImageDto)
  thumbnail: ImageDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableSizes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableColors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableStorage?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableModels?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HighLightDto)
  highLight?: HighLightDto;

  @IsOptional()
  @IsString()
  disclaimer?: string;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerCareDetailsDto)
  customerCareDetails?: CustomerCareDetailsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ManufacturerInfoDto)
  manufacturerInfo?: ManufacturerInfoDto;

  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => GstDto)
  gst: GstDto;
}
