import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemType } from './inventory.schema';

export class CreateInventoryDto {
  @IsString()
  name: string;

  @IsEnum(ItemType)
  itemType: ItemType;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  minStockLevel: number;

  @IsOptional()
  @IsNumber()
  maxStockLevel?: number;

  @IsOptional()
  @IsString()
  supplierId?: string;
}

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  minStockLevel?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}