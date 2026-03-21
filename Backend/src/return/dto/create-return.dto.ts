import { IsEnum, IsString, IsArray, IsOptional, IsNumber, IsMongoId, Min, ValidateNested, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnReason } from '../../orders/schemas/return-enums';
import { RefundMethod } from '../../products/schemas/product.schema';

export class MediaDto {
  @IsString() url: string;
  @IsOptional() @IsString() publicId?: string;
}

export class BankDetailsDto {
  @IsString() accountHolderName: string;
  @IsString() accountNumber: string;
  @IsString() ifscCode: string;
  @IsString() bankName: string;
}

export class CreateReturnDto {
  @IsMongoId() orderId: string;
  @IsMongoId() orderItemId: string;
  @IsEnum(ReturnReason) reason: ReturnReason;
  @IsOptional() @IsString() reasonDescription?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => MediaDto)
  evidenceMedia: MediaDto[];
  @IsNumber() @Min(1) quantity: number;
  @IsEnum(RefundMethod) refundMethod: RefundMethod;
  @IsOptional() @ValidateNested() @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto;
}
