import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object }) // ✅ إصلاح الخطأ هنا
  data?: Record<string, any>;

  @Prop({
    enum: ['order_update', 'driver_assigned', 'order_completed', 'payment', 'system'],
    default: 'system',
  })
  type: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
