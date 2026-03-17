import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ShipmentStatus, ShipmentType } from '../schemas/shipment.schema';

export class CreateShipmentDto {
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @IsMongoId()
  @IsNotEmpty()
  warehouseId: string;

  @IsMongoId()
  @IsOptional()
  deliveryPartnerId?: string;

  @IsEnum(ShipmentType)
  @IsOptional()
  type?: ShipmentType;
}

export class AssignShipmentDto {
  @IsMongoId()
  @IsNotEmpty()
  deliveryPartnerId: string;
}

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  @IsNotEmpty()
  status: ShipmentStatus;
}

export class UpdateTrackingLocationDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  verificationMedia?: { url: string; publicId: string }[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  otp: string;
}
