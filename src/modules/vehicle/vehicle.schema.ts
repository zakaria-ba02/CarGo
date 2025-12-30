import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  plateNumber: string;

  @Prop({ required: true })
  make: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true, enum: ['sedan', 'suv', 'truck', 'van', 'sport', 'other'] })
  fuelType: string;

  @Prop({ type: Object })
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  registrationExpiry?: Date;

  @Prop({ default: 0 })
  totalMaintenance: number;

  @Prop()
  lastServiceDate?: Date;

  @Prop()
  insuranceProvider?: string;

  @Prop()
  insuranceExpiry?: Date;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);