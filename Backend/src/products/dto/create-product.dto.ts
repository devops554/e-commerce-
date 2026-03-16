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
  IsEnum,
  Matches,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ReturnWindowUnit,
  ReturnCondition,
  RefundMethod,
  ExchangeAllowed,
} from '../schemas/product.schema';

// ─────────────────────────────────────────────
// EXISTING SUB-DTOs (unchanged)
// ─────────────────────────────────────────────

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
  includedInPrice?: boolean;
}

class FaqDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ─────────────────────────────────────────────
// NEW — RETURN POLICY DTOs
// ─────────────────────────────────────────────

/**
 * ReturnPolicyDto
 *
 * Maps 1-to-1 with Product.returnPolicy in the schema.
 * Used inside CreateProductDto and UpdateProductDto.
 *
 * Validation rules:
 *  - windowValue must be >= 0 (0 = no return window, same as isReturnable: false)
 *  - conditions must each be a valid ReturnCondition enum value
 *  - refundMethods must each be a valid RefundMethod enum value
 *  - at least one refundMethod must be provided when isReturnable is true
 *    (enforced at service layer, not here, to keep the DTO simple)
 */
export class ReturnPolicyDto {
  @IsBoolean()
  isReturnable: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'windowValue must be 0 or greater' })
  windowValue?: number;

  @IsOptional()
  @IsEnum(ReturnWindowUnit, {
    message: `windowUnit must be one of: ${Object.values(ReturnWindowUnit).join(', ')}`,
  })
  windowUnit?: ReturnWindowUnit;

  @IsOptional()
  @IsArray()
  @IsEnum(ReturnCondition, {
    each: true,
    message: `Each condition must be one of: ${Object.values(ReturnCondition).join(', ')}`,
  })
  conditions?: ReturnCondition[];

  @IsOptional()
  @IsBoolean()
  requiresQcPhoto?: boolean;

  @IsOptional()
  @IsBoolean()
  doorstepQcRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(RefundMethod, {
    each: true,
    message: `Each refundMethod must be one of: ${Object.values(RefundMethod).join(', ')}`,
  })
  refundMethods?: RefundMethod[];

  @IsOptional()
  @IsEnum(ExchangeAllowed, {
    message: `exchangeAllowed must be one of: ${Object.values(ExchangeAllowed).join(', ')}`,
  })
  exchangeAllowed?: ExchangeAllowed;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nonReturnableReasons?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedSkuPatterns?: string[];

  @IsOptional()
  @IsString()
  internalNote?: string;
}

/**
 * ReturnPolicyOverrideDto
 *
 * Used inside CreateProductVariantDto / UpdateProductVariantDto.
 * All fields except overrideEnabled are optional — only set what
 * differs from the parent product's returnPolicy.
 */
export class ReturnPolicyOverrideDto {
  @IsBoolean()
  overrideEnabled: boolean;

  @IsOptional()
  @IsBoolean()
  isReturnable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  windowValue?: number;

  @IsOptional()
  @IsEnum(ReturnWindowUnit, {
    message: `windowUnit must be one of: ${Object.values(ReturnWindowUnit).join(', ')}`,
  })
  windowUnit?: ReturnWindowUnit;

  @IsOptional()
  @IsArray()
  @IsEnum(ReturnCondition, {
    each: true,
    message: `Each condition must be one of: ${Object.values(ReturnCondition).join(', ')}`,
  })
  conditions?: ReturnCondition[];

  @IsOptional()
  @IsArray()
  @IsEnum(RefundMethod, {
    each: true,
    message: `Each refundMethod must be one of: ${Object.values(RefundMethod).join(', ')}`,
  })
  refundMethods?: RefundMethod[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nonReturnableReasons?: string[];
}

// ─────────────────────────────────────────────
// MAIN DTO
// ─────────────────────────────────────────────

export class CreateProductDto {
  // ── Basic info ──
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

  // ── Images ──
  @IsObject()
  @ValidateNested()
  @Type(() => ImageDto)
  thumbnail: ImageDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];

  // ── Filter options ──
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

  // ── Content ──
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

  // ── Meta ──
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

  // ── GST ──
  @IsOptional()
  @ValidateNested()
  @Type(() => GstDto)
  gst?: GstDto;

  // ── Return policy (NEW) ──
  /**
   * Pass returnPolicy when creating a product.
   * If omitted, the schema defaults apply:
   *   isReturnable: false, windowValue: 0, etc.
   *
   * Example payload:
   * {
   *   "returnPolicy": {
   *     "isReturnable": true,
   *     "windowValue": 10,
   *     "windowUnit": "DAYS",
   *     "conditions": ["ORIGINAL_PACKAGING", "WITH_TAGS"],
   *     "requiresQcPhoto": true,
   *     "doorstepQcRequired": true,
   *     "refundMethods": ["ORIGINAL_SOURCE", "WALLET"],
   *     "exchangeAllowed": "SIZE_ONLY",
   *     "nonReturnableReasons": [],
   *     "excludedSkuPatterns": []
   *   }
   * }
   */
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ReturnPolicyDto)
  returnPolicy?: ReturnPolicyDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqDto)
  faqs?: FaqDto[];
}