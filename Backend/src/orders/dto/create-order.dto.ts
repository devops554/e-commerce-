import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../schemas/order.schema';

class ShippingAddressDto {
    @IsString() @IsNotEmpty() fullName: string;
    @IsString() @IsNotEmpty() phone: string;
    @IsString() @IsNotEmpty() street: string;
    @IsString() @IsOptional() landmark?: string;
    @IsString() @IsNotEmpty() city: string;
    @IsString() @IsNotEmpty() state: string;
    @IsString() @IsNotEmpty() postalCode: string;
    @IsString() @IsNotEmpty() country: string;
    @IsNumber() @IsOptional() latitude?: number;
    @IsNumber() @IsOptional() longitude?: number;
}

class OrderItemDto {
    @IsString() @IsNotEmpty() product: string;
    @IsString() @IsNotEmpty() variant: string;
    @IsNumber() @IsNotEmpty() quantity: number;
}

export class CreateOrderOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsObject()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress: ShippingAddressDto;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}
