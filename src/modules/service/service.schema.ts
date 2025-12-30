import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceDocument = Service & Document;

export enum ServiceType {
  FUEL = 'fuel',
  CAR_WASH = 'car_wash',
  OIL_CHANGE = 'oil_change',
  BATTERY = 'battery',
  TIRES = 'tires',
}

export enum ServiceCategory {
  FUEL_SUPER = 'fuel_super',
  FUEL_SPECIAL = 'fuel_special',
  FUEL_DIESEL = 'fuel_diesel',
  WASH_EXTERIOR = 'wash_exterior',
  WASH_INTERIOR = 'wash_interior',
  WASH_FULL = 'wash_full',
  WASH_POLISH = 'wash_polish',
  WASH_WINDOWS = 'wash_windows',
  OIL_CHANGE = 'oil_change',
  OIL_FILTER = 'oil_filter',
  FLUIDS_CHECK = 'fluids_check',
  BATTERY_CHECK = 'battery_check',
  BATTERY_REPLACE = 'battery_replace',
  BATTERY_JUMPSTART = 'battery_jumpstart',
  TIRE_CHECK = 'tire_check',
  TIRE_REPAIR = 'tire_repair',
  TIRE_REPLACE = 'tire_replace',
}

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  basePrice: number;

  @Prop({ required: true, enum: Object.values(ServiceType) })
  serviceType: ServiceType;

  @Prop({ required: true, enum: Object.values(ServiceCategory) })
  category: ServiceCategory;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  estimatedDuration: number;

  @Prop()
  icon?: string;

  @Prop({ default: 0 })
  orderCount: number;

  @Prop({ default: 0 })
  averageRating: number;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);