import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument, ServiceType } from './service.schema';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';

@Injectable()
export class AppService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) {}

  /** إنشاء خدمة جديدة */
  async createService(createServiceDto: CreateServiceDto): Promise<Service> {
    const newService = new this.serviceModel(createServiceDto);
    return await newService.save();
  }

  /** جلب جميع الخدمات مع إمكانية التصفية حسب كونها نشطة أو لا */
  async getAllServices(isActive?: boolean): Promise<Service[]> {
    const query = isActive !== undefined ? { isActive } : {};
    return await this.serviceModel.find(query);
  }

  /** جلب خدمة واحدة حسب معرفها */
  async getServiceById(serviceId: string): Promise<Service> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) throw new NotFoundException('الخدمة غير موجودة');
    return service;
  }

  /** جلب الخدمات حسب نوعها */
  async getServicesByType(serviceType: ServiceType): Promise<Service[]> {
    return await this.serviceModel.find({ serviceType, isActive: true });
  }

  /** جلب الخدمات حسب التصنيف (category) */
  async getServicesByCategory(category: string): Promise<Service[]> {
    return await this.serviceModel.find({ category, isActive: true });
  }

  /** تحديث بيانات خدمة معينة */
  async updateService(serviceId: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const updatedService = await this.serviceModel.findByIdAndUpdate(
      serviceId,
      { $set: updateServiceDto },
      { new: true }
    );

    if (!updatedService) throw new NotFoundException('الخدمة غير موجودة');
    return updatedService;
  }

  /** زيادة عدد الطلبات المرتبطة بالخدمة بمقدار واحد */
  async increaseOrderCount(serviceId: string): Promise<Service> {
    const updatedService = await this.serviceModel.findByIdAndUpdate(
      serviceId,
      { $inc: { orderCount: 1 } },
      { new: true },
    );

    if (!updatedService) throw new NotFoundException('الخدمة غير موجودة');
    return updatedService;
  }

  /** تحديث متوسط تقييم الخدمة بعد تلقي تقييم جديد */
  async updateServiceRating(serviceId: string, newRating: number): Promise<Service> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service) throw new NotFoundException('الخدمة غير موجودة');

    const currentAverage = service.averageRating;
    const totalOrders = service.orderCount;
    const updatedRating = (currentAverage * totalOrders + newRating) / (totalOrders + 1);

    const updatedService = await this.serviceModel.findByIdAndUpdate(
      serviceId,
      { $set: { averageRating: updatedRating } },
      { new: true }
    );

    if (!updatedService) throw new NotFoundException('حدث خطأ أثناء تحديث تقييم الخدمة');
    return updatedService;
  }

  /** تعطيل خدمة معينة */
  async deactivateService(serviceId: string): Promise<Service> {
    const updatedService = await this.serviceModel.findByIdAndUpdate(
      serviceId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!updatedService) throw new NotFoundException('الخدمة غير موجودة');
    return updatedService;
  }

  /** تفعيل خدمة معينة */
  async activateService(serviceId: string): Promise<Service> {
    const updatedService = await this.serviceModel.findByIdAndUpdate(
      serviceId,
      { $set: { isActive: true } },
      { new: true }
    );

    if (!updatedService) throw new NotFoundException('الخدمة غير موجودة');
    return updatedService;
  }

  /** حذف خدمة */
  async deleteService(serviceId: string): Promise<{ message: string }> {
    const result = await this.serviceModel.findByIdAndDelete(serviceId);
    if (!result) throw new NotFoundException('الخدمة غير موجودة');
    return { message: 'تم حذف الخدمة بنجاح' };
  }

  /** جلب أكثر الخدمات شعبية حسب عدد الطلبات */
  async getPopularServices(limit: number = 5): Promise<Service[]> {
    return await this.serviceModel.find({ isActive: true }).sort({ orderCount: -1 }).limit(limit);
  }

  /** الحصول على إحصائيات الخدمات: العدد الكلي، متوسط السعر، مجموع الطلبات */
  async getServiceStatistics() {
    const totalServices = await this.serviceModel.countDocuments({ isActive: true });
    const averagePrice = await this.serviceModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgPrice: { $avg: '$basePrice' } } },
    ]);

    const totalOrders = await this.serviceModel.aggregate([
      { $group: { _id: null, total: { $sum: '$orderCount' } } },
    ]);

    return {
      totalServices,
      averagePrice: averagePrice[0]?.avgPrice || 0,
      totalOrders: totalOrders[0]?.total || 0,
    };
  }
}
