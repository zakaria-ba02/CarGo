import { IsString, IsEnum, IsOptional, IsNumber, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ✅ ضع هذا الكلاس أولاً
export class VehicleLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  address: string;
}

export class CreateVehicleDto {
  @IsString()
  plateNumber: string;

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsEnum(['sedan', 'suv', 'truck', 'van', 'sport', 'other'])
  fuelType: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleLocationDto)
  location?: VehicleLocationDto;

  @IsOptional()
  @IsDate()
  registrationExpiry?: Date;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleLocationDto)
  location?: VehicleLocationDto;

  @IsOptional()
  @IsDate()
  lastServiceDate?: Date;
}
