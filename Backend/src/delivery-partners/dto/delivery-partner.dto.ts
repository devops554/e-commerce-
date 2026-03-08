import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Types } from 'mongoose';

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

    @IsEnum(["BIKE", "SCOOTER", "CAR", "VAN"])
    @IsOptional()
    vehicleType?: string;

    @IsString()
    @IsOptional()
    vehicleNumber?: string;

    @IsString()
    @IsOptional()
    licenseNumber?: string;

    @IsString()
    @IsOptional()
    warehouseId?: string;

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
}

export class LoginDeliveryPartnerDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class UpdateDeliveryPartnerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(["BIKE", "SCOOTER", "CAR", "VAN"])
    vehicleType?: string;

    @IsOptional()
    @IsString()
    vehicleNumber?: string;

    @IsOptional()
    @IsEnum(["ONLINE", "OFFLINE", "BUSY"])
    availabilityStatus?: string;

    @IsOptional()
    @IsEnum(["ACTIVE", "INACTIVE", "BLOCKED"])
    accountStatus?: string;
}

export class UpdateLocationDto {
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;
}
