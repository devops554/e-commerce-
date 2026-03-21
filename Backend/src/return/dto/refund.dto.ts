import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RefundMethod } from '../../products/schemas/product.schema';

export class RefundDto {
  @IsNumber() @Min(0) refundAmount: number;
  @IsEnum(RefundMethod) refundMethod: RefundMethod;
  @IsOptional() @IsString() refundTransactionId?: string;
  @IsOptional() @IsString() note?: string;
}
