import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schema';
import { UpdateUserDto } from './user.dto';
import { Driver, DriverDocument, DriverStatus } from '../driver/driver.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // ✅ إضافة Driver Model
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
  ) {}

  // ==========================
  // ADMIN
  // ==========================

  async findAll(role?: string): Promise<User[]> {
    const query = role ? { role } : {};
    return this.userModel.find(query).select('-password');
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async deactivateUser(id: string) {
    return this.userModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
  }

  async activateUser(id: string) {
    return this.userModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true },
    );
  }

  // ==========================
  // DRIVER REQUESTS
  // ==========================

  async requestDriverRole(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    if (user.role !== 'customer') {
      throw new BadRequestException('لا يمكن تقديم الطلب');
    }

    if (user.driverRequestStatus === 'pending') {
      throw new BadRequestException('الطلب قيد المراجعة');
    }

    user.driverRequestStatus = 'pending';
    await user.save();

    return { message: 'تم إرسال طلب التحول إلى سائق' };
  }

  async getPendingDriverRequests() {
    return this.userModel
      .find({
        role: 'customer',
        driverRequestStatus: 'pending',
      })
      .select('-password');
  }

  // ✅ مُصلح: إنشاء سجل في جدول drivers عند الموافقة
  async approveDriver(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    // التحقق من أن المستخدم لديه طلب معلق
    if (user.driverRequestStatus !== 'pending') {
      throw new BadRequestException('لا يوجد طلب معلق لهذا المستخدم');
    }

    // تحديث دور المستخدم
    user.role = 'driver';
    user.driverRequestStatus = 'approved';
    await user.save();

    // ✅ التحقق إذا كان السائق موجود مسبقاً
    const existingDriver = await this.driverModel.findOne({ 
      userId: new Types.ObjectId(userId) 
    });

    if (!existingDriver) {
      // ✅ إنشاء سجل جديد في جدول drivers
      const newDriver = new this.driverModel({
        userId: new Types.ObjectId(userId),
        licenseNumber: 'PENDING', // يمكن تحديثه لاحقاً
        status: DriverStatus.OFFLINE,
        isActive: true,
        isVerified: false,
        totalTrips: 0,
        rating: 5,
        totalEarnings: 0,
        services: [],
      });

      await newDriver.save();
    }

    return { 
      message: 'تمت الموافقة وتحويل المستخدم إلى سائق',
      userId: userId,
    };
  }

  async rejectDriver(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    user.driverRequestStatus = 'rejected';
    await user.save();

    return { message: 'تم رفض طلب السائق' };
  }

  // ==========================
  // PROFILE
  // ==========================

  async updateProfile(id: string, dto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .select('-password');

    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async updateLocation(
    id: string,
    latitude: number,
    longitude: number,
    address: string,
  ) {
    return this.userModel.findByIdAndUpdate(
      id,
      { location: { latitude, longitude, address } },
      { new: true },
    );
  }

  async deleteUser(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('المستخدم غير موجود');
    return { message: 'تم حذف المستخدم' };
  }
}