import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class AdjustStockDto {
    @IsString()
    @IsNotEmpty()
    variantId: string;

    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number; // Positive to add, negative to reduce

    @IsString()
    @IsOptional()
    source?: string;
}

export class TransferStockDto {
    @IsString()
    @IsNotEmpty()
    variantId: string;

    @IsString()
    @IsNotEmpty()
    fromWarehouseId: string;

    @IsString()
    @IsNotEmpty()
    toWarehouseId: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    amount: number;

    @IsString()
    @IsOptional()
    source?: string;
}
