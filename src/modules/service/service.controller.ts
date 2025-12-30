import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AppService } from './service.service';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';
import { ServiceType } from './service.schema';

@Controller('services') // تحديد الـ route الأساسي لجميع هذه الدوال
export class ServiceController {
  constructor(private readonly appService: AppService) {} // حقن Service (AppService) لاستخدامه في جميع الدوال

  // ==========================
  // إنشاء خدمة جديدة
  // ==========================
  @Post()
  async createService(@Body() createServiceDto: CreateServiceDto) {
    // استقبال بيانات الخدمة من الجسم وتمريرها لـ AppService لحفظها
    return await this.appService.createService(createServiceDto);
  }

  // ==========================
  // جلب كل الخدمات (مع خيار تصفية النشطة فقط)
  // ==========================
  @Get()
  async getAllServices(@Query('isActive') isActive?: boolean) {
    return await this.appService.getAllServices(isActive);
  }

  // ==========================
  // جلب الخدمات حسب النوع
  // ==========================
  @Get('type/:serviceType')
  async getServicesByType(@Param('serviceType') serviceType: ServiceType) {
    return await this.appService.getServicesByType(serviceType);
  }

  // ==========================
  // جلب الخدمات حسب الفئة
  // ==========================
  @Get('category/:category')
  async getServicesByCategory(@Param('category') category: string) {
    return await this.appService.getServicesByCategory(category);
  }

  // ==========================
  // عرض أكثر الخدمات طلبًا (الأكثر شعبية)
  // ==========================
  @Get('popular')
  async getPopularServices(@Query('limit') limit: number = 5) {
    return await this.appService.getPopularServices(limit);
  }

  // ==========================
  // عرض إحصائيات الخدمات
  // ==========================
  @Get('stats')
  async getServiceStatistics() {
    return await this.appService.getServiceStatistics();
  }

  // ==========================
  // جلب خدمة محددة حسب ID
  // ==========================
  @Get(':serviceId')
  async getServiceById(@Param('serviceId') serviceId: string) {
    return await this.appService.getServiceById(serviceId);
  }

  // ==========================
  // تحديث بيانات خدمة موجودة
  // ==========================
  @Put(':serviceId')
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return await this.appService.updateService(serviceId, updateServiceDto);
  }

  // ==========================
  // زيادة عدد الطلبات على الخدمة
  // ==========================
  @Put(':serviceId/order-count')
  async increaseOrderCount(@Param('serviceId') serviceId: string) {
    return await this.appService.increaseOrderCount(serviceId);
  }

  // ==========================
  // تحديث تقييم الخدمة (averageRating)
  // ==========================
  @Put(':serviceId/rating')
  async updateServiceRating(
    @Param('serviceId') serviceId: string,
    @Body() data: { rating: number },
  ) {
    return await this.appService.updateServiceRating(serviceId, data.rating);
  }

  // ==========================
  // تعطيل الخدمة (لن تظهر ضمن الاستعلامات النشطة)
  // ==========================
  @Put(':serviceId/deactivate')
  async deactivateService(@Param('serviceId') serviceId: string) {
    return await this.appService.deactivateService(serviceId);
  }

  // ==========================
  // إعادة تفعيل الخدمة
  // ==========================
  @Put(':serviceId/activate')
  async activateService(@Param('serviceId') serviceId: string) {
    return await this.appService.activateService(serviceId);
  }

  // ==========================
  // حذف خدمة نهائيًا
  // ==========================
  @Delete(':serviceId')
  async deleteService(@Param('serviceId') serviceId: string) {
    return await this.appService.deleteService(serviceId);
  }
}
