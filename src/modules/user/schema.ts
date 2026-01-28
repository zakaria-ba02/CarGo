import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>; // ✅ بدل User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, enum: ['customer', 'driver', 'admin'] })
  role: string;

  @Prop({
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  })
  driverRequestStatus: 'none' | 'pending' | 'approved' | 'rejected';

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  profileImage?: string;

  @Prop({ type: Object })
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalOrders: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
