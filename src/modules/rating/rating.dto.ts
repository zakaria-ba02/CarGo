import { IsNumber, IsString, IsOptional, IsBoolean, Min, Max, IsArray } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  orderId: string;

  @IsString()
  serviceId: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  photos?: string[];

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class UpdateRatingDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}