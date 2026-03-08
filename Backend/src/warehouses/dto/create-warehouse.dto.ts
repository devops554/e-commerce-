import { IsString, IsNotEmpty, IsOptional, IsEmail, IsPhoneNumber, IsObject, IsNumber, IsEnum, IsBoolean } from 'class-validator';

export class ContactDto {
    @IsString()
    @IsNotEmpty()
    contactPerson: string;

    @IsString()
    @IsNotEmpty()
    @IsPhoneNumber()
    phone: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class AddressDto {
    @IsString()
    @IsNotEmpty()
    addressLine1: string;

    @IsString()
    @IsOptional()
    addressLine2?: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    pincode: string;
}

export class LocationDto {
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;
}

export class CapacityDto {
    @IsNumber()
    @IsNotEmpty()
    totalCapacity: number;

    @IsNumber()
    @IsOptional()
    usedCapacity?: number;
}

export class CreateWarehouseDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    managerId?: string;

    @IsObject()
    @IsNotEmpty()
    contact: ContactDto;

    @IsObject()
    @IsNotEmpty()
    address: AddressDto;

    @IsObject()
    @IsNotEmpty()
    location: LocationDto;

    @IsObject()
    @IsNotEmpty()
    capacity: CapacityDto;

    @IsEnum(["ACTIVE", "INACTIVE", "MAINTENANCE"])
    @IsOptional()
    status?: string;

    @IsBoolean()
    @IsOptional()
    isPickupAvailable?: boolean;

    @IsBoolean()
    @IsOptional()
    isDeliveryAvailable?: boolean;

    @IsBoolean()
    @IsOptional()
    isDefaultWarehouse?: boolean;

    @IsString()
    @IsOptional()
    notes?: string;
}
