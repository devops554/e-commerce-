import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ShipmentStatus } from '../schemas/shipment.schema';

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
}
