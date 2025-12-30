import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Driver, DriverDocument, DriverStatus } from './driver.schema';
import { CreateDriverDto, UpdateDriverDto } from './driver.dto';

@Injectable()
export class DriverService {
  constructor(@InjectModel(Driver.name) private driverModel: Model<DriverDocument>) {}

  /**
   * إضافة سائق جديد مرتبط بمستخدم
   * - يتحقق أولًا إذا كان المستخدم مسجل كسائق مسبقًا
   * - إذا موجود يرمي خطأ
   * - إذا غير موجود ينشئ سائق جديد
   */
  async createDriver(userId: string, createDriverDto: CreateDriverDto): Promise<Driver> {
    const existingDriver = await this.driverModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existingDriver) {
      throw new BadRequestException('هذا المستخدم مسجل كسائق بالفعل');
    }

    const newDriver = new this.driverModel({
      ...createDriverDto,
      userId: new Types.ObjectId(userId),
    });

    return await newDriver.save();
  }

  /**
   * الحصول على بيانات سائق باستخدام ID الخاص به
   * - يشمل جلب بيانات المستخدم المرتبط
   * - يرمي خطأ إذا لم يتم العثور على السائق
   */
  async getDriverById(driverId: string): Promise<Driver> {
    const driver = await this.driverModel.findById(driverId).populate('userId');
    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * الحصول على بيانات السائق باستخدام UserId
   * - يستخدم للعثور على السائق المرتبط بمستخدم معين
   */
  async getDriverByUserId(userId: string): Promise<Driver> {
    const driver = await this.driverModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId');
    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * تحديث بيانات السائق
   * - يقبل الحقول المراد تحديثها
   * - يرجع بيانات السائق بعد التحديث
   */
  async updateDriver(driverId: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $set: updateDriverDto },
      { new: true },
    ).populate('userId');

    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * تحديث حالة السائق (Available, Offline, Busy, ...)
   * - يحدث أيضًا lastOnlineAt للوقت الحالي
   */
  async updateDriverStatus(driverId: string, status: DriverStatus): Promise<Driver> {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $set: { status, lastOnlineAt: new Date() } },
      { new: true },
    );

    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * تحديث موقع السائق الحالي
   * - يشمل latitude, longitude, address
   * - يتم تحديث lastOnlineAt أيضًا
   */
  async updateDriverLocation(
    driverId: string,
    latitude: number,
    longitude: number,
    address: string,
  ): Promise<Driver> {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $set: { location: { latitude, longitude, address }, lastOnlineAt: new Date() } },
      { new: true },
    );

    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * الحصول على جميع السائقين المتاحين والنشطين
   */
  async getAvailableDrivers(): Promise<Driver[]> {
    return this.driverModel.find({ status: DriverStatus.AVAILABLE, isActive: true }).populate('userId');
  }

  /**
   * الحصول على السائقين حسب حالة معينة
   */
  async getDriversByStatus(status: DriverStatus): Promise<Driver[]> {
    return this.driverModel.find({ status, isActive: true }).populate('userId');
  }

  /**
   * الحصول على السائقين المتاحين القريبين من موقع معين
   * - يستخدم $geoWithin و$centerSphere لتحديد النطاق
   */
  async getNearbyAvailableDrivers(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<Driver[]> {
    const radiusRadians = radiusKm / 6371;
    return this.driverModel
      .find({
        status: DriverStatus.AVAILABLE,
        isActive: true,
        location: { $geoWithin: { $centerSphere: [[longitude, latitude], radiusRadians] } },
      })
      .populate('userId');
  }

  /**
   * توثيق السائق رسميًا
   * - يحدث isVerified إلى true ويحدد verifiedAt
   */
  async verifyDriver(driverId: string): Promise<Driver> {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $set: { isVerified: true, verifiedAt: new Date() } },
      { new: true },
    );

    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * زيادة عدد الرحلات المنجزة للسائق بمقدار 1
   */
  async incrementTotalTrips(driverId: string): Promise<Driver> {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $inc: { totalTrips: 1 } },
      { new: true },
    );
    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * إضافة مبلغ إلى أرباح السائق
   */
  async addEarnings(driverId: string, amount: number): Promise<Driver> {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $inc: { totalEarnings: amount } },
      { new: true },
    );
    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * تحديث تقييم السائق بناءً على رحلة جديدة
   * - يحسب المتوسط الجديد للتقييم
   */
   async updateDriverRating(driverId: string, newRating: number): Promise<Driver> {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) throw new NotFoundException('السائق غير موجود');
  
    const currentRating = driver.rating ?? newRating; 
    const updatedRating = (currentRating + newRating) / 2;
  
    const updatedDriver = await this.driverModel.findByIdAndUpdate(
     driverId,
      { $set: { rating: updatedRating } },
      { new: true },
    );
  
    if (!updatedDriver) throw new NotFoundException('السائق غير موجود');
    return updatedDriver;
  }
  

  /**
   * جلب جميع السائقين
   * - يمكن فلترة حسب isActive
   */
  async getAllDrivers(isActive?: boolean): Promise<Driver[]> {
    const query = isActive !== undefined ? { isActive } : {};
    return this.driverModel.find(query).populate('userId');
  }

  /**
   * تعطيل السائق
   * - يحدث isActive إلى false
   * - يغير الحالة إلى OFFLINE
   */
  async deactivateDriver(driverId: string): Promise<Driver> {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $set: { isActive: false, status: DriverStatus.OFFLINE } },
      { new: true },
    );
    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * إعادة تفعيل السائق
   */
  async activateDriver(driverId: string): Promise<Driver> {
    const driver = await this.driverModel.findByIdAndUpdate(
      driverId,
      { $set: { isActive: true } },
      { new: true },
    );
    if (!driver) throw new NotFoundException('السائق غير موجود');
    return driver;
  }

  /**
   * جلب إحصاءات عن السائقين
   * - إجمالي السائقين
   * - عدد المتاحين
   * - متوسط التقييم
   * - مجموع الأرباح
   */
  async getDriverStatistics() {
    const totalDrivers = await this.driverModel.countDocuments({ isActive: true });
    const availableDrivers = await this.driverModel.countDocuments({ status: DriverStatus.AVAILABLE });
    const avgRating = await this.driverModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    const totalEarnings = await this.driverModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } },
    ]);

    return {
      totalDrivers,
      availableDrivers,
      averageRating: avgRating[0]?.avgRating || 0,
      totalEarnings: totalEarnings[0]?.total || 0,
    };
  }

  /**
   * حذف سائق نهائيًا من قاعدة البيانات
   */
  async deleteDriver(driverId: string): Promise<{ message: string }> {
    const result = await this.driverModel.findByIdAndDelete(driverId);
    if (!result) throw new NotFoundException('السائق غير موجود');
    return { message: 'تم حذف السائق بنجاح' };
  }
}
