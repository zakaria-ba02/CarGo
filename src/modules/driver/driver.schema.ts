import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DriverDocument = HydratedDocument<Driver>;

export enum DriverStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ON_BREAK = 'on_break',
}

@Schema({ timestamps: true })
export class Driver {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Service', default: [] })
  services: Types.ObjectId[];

  @Prop({ required: true })
  licenseNumber: string;

  @Prop()
  licenseExpiry?: Date;

  @Prop({ enum: Object.values(DriverStatus), default: DriverStatus.OFFLINE })
  status: DriverStatus;

  @Prop({ type: Object })
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Prop({ default: 0 })
  totalTrips: number;

  @Prop({ default: 5 })
  rating: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop()
  verifiedAt?: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  documentURL?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  vehicleIds?: Types.ObjectId[];

  @Prop()
  lastOnlineAt?: Date;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
