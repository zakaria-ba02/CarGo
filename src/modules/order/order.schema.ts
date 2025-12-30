import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

// ==========================
// Enums
// ==========================
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  ON_THE_WAY = 'on_the_way',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum OrderType {
  IMMEDIATE = 'immediate',
  SCHEDULED = 'scheduled',
}

// ==========================
// ثابت لتجنب union type المعقد
// ==========================
const ORDER_STATUS_ENUM = [
  'pending',
  'accepted',
  'on_the_way',
  'in_progress',
  'completed',
  'cancelled',
  'failed',
] as const;

const ORDER_TYPE_ENUM = ['immediate', 'scheduled'] as const;

// ==========================
// Driver Location Record
// ==========================
export interface DriverLocationRecord {
  latitude: number;
  longitude: number;
  address: string;
  recordedAt: Date;
  distanceFromDestination?: number;
}

// ==========================
// Order Schema
// ==========================
@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: false })
  vehicleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  driverId?: Types.ObjectId;

  @Prop({ type: String, enum: ORDER_STATUS_ENUM, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, enum: ORDER_TYPE_ENUM, default: OrderType.IMMEDIATE })
  orderType: OrderType;

  @Prop({ required: true })
  totalPrice: number;

  @Prop()
  scheduledAt?: Date;

  // ==========================
  // Timing Tracking
  // ==========================
  @Prop()
  acceptedAt?: Date;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  estimatedDuration?: number;

  @Prop()
  actualDuration?: number;

  @Prop()
  estimatedDeliveryTime?: Date;

  // ==========================
  // Location Tracking
  // ==========================
  @Prop({ type: Object, required: true })
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Prop({ type: [Object], default: [] })
  driverLocationHistory?: DriverLocationRecord[];

  @Prop({ default: false })
  isLocationTrackingActive?: boolean;

  // ==========================
  // Other Fields
  // ==========================
  @Prop()
  notes?: string;

  @Prop({ default: false })
  isRated: boolean;

  @Prop()
  rating?: number;

  @Prop()
  ratingComment?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
