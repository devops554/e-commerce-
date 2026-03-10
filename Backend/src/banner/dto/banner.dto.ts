import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BannerPage, BannerStatus } from '../schemas/banner.schema';
import { PartialType } from '@nestjs/mapped-types';

export class ButtonConfigDto {
  @IsString()
  text: string;

  @IsString()
  link: string;
}

export class BannerStatDto {
  @IsString()
  label: string;

  @IsString()
  value: string;
}

export class CreateBannerDto {
  @IsArray()
  @IsEnum(BannerPage, { each: true })
  @IsOptional()
  pages?: string[];

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsString()
  @IsOptional()
  mobileImage?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ButtonConfigDto)
  primaryButton?: ButtonConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ButtonConfigDto)
  secondaryButton?: ButtonConfigDto;

  @IsBoolean()
  @IsOptional()
  showSearchBar?: boolean;

  @IsBoolean()
  @IsOptional()
  showStats?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BannerStatDto)
  stats?: BannerStatDto[];

  @IsEnum(BannerStatus)
  @IsOptional()
  status?: BannerStatus;

  @IsMongoId()
  @IsOptional()
  updatedBy?: string;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}

export class BannerQueryDto {
  @IsOptional()
  @IsString()
  page?: string; // pagination page

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(BannerStatus)
  status?: BannerStatus;

  @IsOptional()
  @IsString()
  pages?: string; // filter by page e.g. "home"
}
