import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle, VehicleDocument } from './vehicle.schema';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>) {}

  // ==========================
  // إضافة مركبة جديدة للمستخدم
  // ==========================
  async createVehicle(userId: string, createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // التحقق من أن رقم اللوحة غير مسجل مسبقاً
    const existingVehicle = await this.vehicleModel.findOne({
      plateNumber: createVehicleDto.plateNumber,
    });

    if (existingVehicle) {
      throw new BadRequestException('رقم لوحة السيارة مسجل بالفعل');
    }

    const newVehicle = new this.vehicleModel({
      ...createVehicleDto,
      userId: new Types.ObjectId(userId),
    });

    return await newVehicle.save();
  }

  // ==========================
  // جلب جميع المركبات لمستخدم محدد
  // ==========================
  async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    return await this.vehicleModel.find({ userId: new Types.ObjectId(userId) });
  }

  // ==========================
  // جلب مركبة محددة حسب الـ ID
  // ==========================
  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findById(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('السيارة غير موجودة');
    }
    return vehicle;
  }

  // ==========================
  // تحديث بيانات المركبة
  // ==========================
  async updateVehicle(vehicleId: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      { $set: updateVehicleDto },
      { new: true }
    );

    if (!vehicle) {
      throw new NotFoundException('السيارة غير موجودة');
    }
    return vehicle;
  }

  // ==========================
  // تحديث موقع المركبة الحالي
  // ==========================
  async updateVehicleLocation(
    vehicleId: string,
    latitude: number,
    longitude: number,
    address: string,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      {
        $set: {
          location: { latitude, longitude, address },
        },
      },
      { new: true }
    );

    if (!vehicle) {
      throw new NotFoundException('السيارة غير موجودة');
    }
    return vehicle;
  }

  // ==========================
  // تحديث آخر تاريخ صيانة وزيادة عدد الصيانات
  // ==========================
  async updateLastServiceDate(vehicleId: string, date: Date): Promise<Vehicle> {
    const updatedVehicle = await this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      {
        $set: { lastServiceDate: date },
        $inc: { totalMaintenance: 1 },
      },
      { new: true }
    );
  
    if (!updatedVehicle) {
      throw new NotFoundException('المركبة غير موجودة');
    }
  
    return updatedVehicle;
  }

  // ==========================
  // جلب جميع المركبات النشطة
  // ==========================
  async getAllVehicles(): Promise<Vehicle[]> {
    return await this.vehicleModel.find({ isActive: true });
  }

  // ==========================
  // جلب المركبات حسب النوع والطراز
  // ==========================
  async getVehiclesByMakeAndModel(make: string, model: string): Promise<Vehicle[]> {
    return await this.vehicleModel.find({ make, model, isActive: true });
  }

  // ==========================
  // تعطيل المركبة
  // ==========================
  async deactivateVehicle(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!vehicle) {
      throw new NotFoundException('السيارة غير موجودة');
    }
    return vehicle;
  }

  // ==========================
  // تفعيل المركبة
  // ==========================
  async activateVehicle(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findByIdAndUpdate(
      vehicleId,
      { $set: { isActive: true } },
      { new: true }
    );

    if (!vehicle) {
      throw new NotFoundException('السيارة غير موجودة');
    }
    return vehicle;
  }

  // ==========================
  // حذف المركبة
  // ==========================
  async deleteVehicle(vehicleId: string): Promise<{ message: string }> {
    const result = await this.vehicleModel.findByIdAndDelete(vehicleId);
    if (!result) {
      throw new NotFoundException('السيارة غير موجودة');
    }
    return { message: 'تم حذف السيارة بنجاح' };
  }

  // ==========================
  // حساب عدد المركبات النشطة
  // ==========================
  async getVehicleCount(): Promise<number> {
    return await this.vehicleModel.countDocuments({ isActive: true });
  }
}
