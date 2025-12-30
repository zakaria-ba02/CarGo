import { IsString, IsOptional, IsEnum, IsDate, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DriverStatus } from './driver.schema';

// تعريف الموقع أولاً
export class DriverLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  address: string;
}

// الآن يمكن استخدامه بأمان
export class CreateDriverDto {
  @IsString()
  licenseNumber: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  licenseExpiry?: Date;

 

  @IsOptional()
  @ValidateNested()
  @Type(() => DriverLocationDto)
  location?: DriverLocationDto;
}

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  licenseExpiry?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => DriverLocationDto)
  location?: DriverLocationDto;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
