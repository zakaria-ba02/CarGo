import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

export enum ItemType {
  FUEL = 'fuel',
  OIL = 'oil',
  BATTERY = 'battery',
  TIRES = 'tires',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ required: true })
  name: string;

  // ✅ تجنب Object.values، استخدم enum مباشرة كـ array
  @Prop({ required: true, type: String, enum: ['fuel', 'oil', 'battery', 'tires', 'other'] })
  itemType: ItemType;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  unitPrice: number;

  @Prop()
  description?: string;

  @Prop({ required: true })
  minStockLevel: number;

  @Prop()
  maxStockLevel?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastRestockDate?: Date;

  @Prop()
  supplierId?: string;

  @Prop({ default: 0 })
  totalUsed: number;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
