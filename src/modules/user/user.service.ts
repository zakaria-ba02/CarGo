import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User, UserDocument } from './schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {} // حقن الموديل للتعامل مع قاعدة البيانات

 
  // ==========================
  // جلب جميع المستخدمين (مع خيار تصفية الدور)
  // ==========================
  async findAll(role?: string): Promise<User[]> {
    const query = role ? { role } : {};
    return await this.userModel.find(query).select('-password'); // استبعاد كلمة المرور من النتيجة
  }

  // ==========================
  // جلب مستخدم محدد حسب ID
  // ==========================
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return user;
  }

  // ==========================
  // جلب مستخدم حسب البريد الإلكتروني
  // ==========================
  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email });
  }

  // ==========================
  // تحديث بيانات المستخدم (profile)
  // ==========================
  async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateUserDto },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return updatedUser;
  }

  // ==========================
  // تحديث موقع المستخدم الحالي
  // ==========================
  async updateLocation(id: string, latitude: number, longitude: number, address: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { location: { latitude, longitude, address } } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return updatedUser;
  }

  // ==========================
  // البحث عن السائقين بالقرب من موقع محدد
  // ==========================
  async findDriversByLocation(latitude: number, longitude: number, radiusKm: number = 5): Promise<User[]> {
    const radiusRadians = radiusKm / 6371; // تحويل المسافة بالكيلومتر إلى radians
    return await this.userModel.find({
      role: 'driver',
      isActive: true,
      location: {
        $geoWithin: { $centerSphere: [[longitude, latitude], radiusRadians] },
      },
    });
  }

  // ==========================
  // تعطيل المستخدم (isActive = false)
  // ==========================
  async deactivateUser(id: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return updatedUser;
  }

  // ==========================
  // تفعيل المستخدم (isActive = true)
  // ==========================
  async activateUser(id: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return updatedUser;
  }

  // ==========================
  // تحديث تقييم المستخدم (rating) وحساب المتوسط الجديد
  // ==========================
  async updateUserRating(userId: string, newRating: number): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const totalOrders = user.totalOrders;
    const currentRating = user.rating;
    const updatedRating = (currentRating * totalOrders + newRating) / (totalOrders + 1);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { rating: updatedRating }, $inc: { totalOrders: 1 } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('حدث خطأ أثناء تحديث التقييم');
    }
    return updatedUser;
  }

  // ==========================
  // زيادة عدد الطلبات للمستخدم (totalOrders)
  // ==========================
  async incrementUserOrders(userId: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { totalOrders: 1 } },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return updatedUser;
  }

  // ==========================
  // حذف مستخدم نهائيًا
  // ==========================
  async deleteUser(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return { message: 'تم حذف المستخدم بنجاح' };
  }
}
