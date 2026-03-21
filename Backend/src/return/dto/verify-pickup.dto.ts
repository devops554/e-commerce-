import { IsBoolean, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaDto } from './create-return.dto';

export class VerifyPickupDto {
  @IsBoolean() itemsCorrect: boolean;
  @IsArray() @ValidateNested({ each: true }) @Type(() => MediaDto)
  verificationMedia: MediaDto[];
  @IsOptional() @IsString() pickupNotes?: string;
  @IsOptional() weightKg?: number;
  @IsOptional() dimensionsCm?: { length: number; width: number; height: number };
}
