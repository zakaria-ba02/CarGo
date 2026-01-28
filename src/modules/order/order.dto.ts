// ============================================
// order.dto.ts - معدل (دفع كاش فقط)
// ============================================
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsDate,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, OrderStatus } from './order.schema';

// ============================================
// DTO موقع الطلب
// ============================================

export class OrderLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  address: string;
}

// ============================================
// DTOs للإنشاء والتحديث
// ============================================

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsString()
  serviceId: string;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledAt?: Date;

  
  @ValidateNested()
  @Type(() => OrderLocationDto)
  location?: OrderLocationDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  radius?: number;

}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  driverId?: string;
}

export class RateOrderDto {
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

 
}

// ============================================
// DTOs للاستجابة (Response)
// ============================================

export class OrderResponseDto {
  _id: string;
  userId: string;
  vehicleId: string;
  serviceId: string;
  driverId?: string;
  status: string;
  orderType: string;
  totalPrice: number;
  scheduledAt?: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDeliveryTime?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  location: OrderLocationDto;
  notes?: string;
  isRated: boolean;
  rating?: number;
  ratingComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// DTOs للتتبع الزمني
// ============================================

export class OrderTimingDetailsDto {
  status: string;
  acceptedAt?: Date;
  startedAt?: Date;
  estimatedDeliveryTime?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  elapsedTime?: number;
  remainingTime?: number;
}

export class RemainingTimeDto {
  remainingMinutes: number;
  estimatedDeliveryTime: Date;
  elapsedMinutes: number;
  status: string;
}

export class OrderDurationDto {
  durationMinutes: number;
  startTime: Date;
  endTime: Date;
}

// ============================================
// DTOs لتتبع الموقع
// ============================================

export class LocationRecordDto {
  latitude: number;
  longitude: number;
  address: string;
  recordedAt: Date;
  distanceFromDestination?: number;
}

export class DriverLocationHistoryDto {
  orderId: string;
  totalLocationsRecorded: number;
  currentLocation?: LocationRecordDto;
  locationHistory: LocationRecordDto[];
}

export class DriverCurrentLocationDto {
  orderId: string;
  currentLocation?: LocationRecordDto;
  distanceFromDestination: number;
  estimatedArrivalTime?: Date;
}

export class DriverRouteDto {
  startLocation?: LocationRecordDto;
  endLocation?: LocationRecordDto;
  totalDistance: number;
  totalWaypoints: number;
  waypoints: LocationRecordDto[];
}

// ============================================
// DTOs للـ Requests
// ============================================

export class UpdateDriverLocationRequest {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  address: string;
}
