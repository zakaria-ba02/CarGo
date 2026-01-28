import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { AppService } from './service.service';
import { CreateServiceDto, UpdateServiceDto } from './service.dto';
import { ServiceType } from './service.schema';

import { AuthWithRoles } from '../auth/decorators/auth.decorator';

@Controller('services')
export class ServiceController {
  constructor(private readonly appService: AppService) {}

  // =====================================================
  // 👤 CUSTOMER + 🚗 DRIVER + 🛠 ADMIN (عرض فقط)
  // =====================================================

  /** جلب كل الخدمات (مع خيار تصفية النشطة فقط) */
  @Get()
  @AuthWithRoles('customer', 'driver', 'admin')
  getAllServices(@Query('isActive') isActive?: boolean) {
    return this.appService.getAllServices(isActive);
  }

  /** جلب الخدمات حسب النوع */
  @Get('type/:serviceType')
  @AuthWithRoles('customer', 'driver', 'admin')
  getServicesByType(@Param('serviceType') serviceType: ServiceType) {
    return this.appService.getServicesByType(serviceType);
  }

  /** جلب الخدمات حسب الفئة */
  @Get('category/:category')
  @AuthWithRoles('customer', 'driver', 'admin')
  getServicesByCategory(@Param('category') category: string) {
    return this.appService.getServicesByCategory(category);
  }

  /** عرض أكثر الخدمات طلبًا */
  @Get('popular')
  @AuthWithRoles('customer', 'driver', 'admin')
  getPopularServices(@Query('limit') limit: number = 5) {
    return this.appService.getPopularServices(limit);
  }

  /** إحصائيات الخدمات (ADMIN فقط) */
  @Get('stats')
  @AuthWithRoles('admin')
  getServiceStatistics() {
    return this.appService.getServiceStatistics();
  }

  /** جلب خدمة محددة */
  @Get(':serviceId')
  @AuthWithRoles('customer', 'driver', 'admin')
  getServiceById(@Param('serviceId') serviceId: string) {
    return this.appService.getServiceById(serviceId);
  }

  // =====================================================
  // 🛠 ADMIN فقط
  // =====================================================

  /** إنشاء خدمة جديدة */
  @Post()
  @AuthWithRoles('admin')
  createService(@Body() createServiceDto: CreateServiceDto) {
    return this.appService.createService(createServiceDto);
  }

  /** تحديث بيانات خدمة */
  @Put(':serviceId')
  @AuthWithRoles('admin')
  updateService(
    @Param('serviceId') serviceId: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.appService.updateService(serviceId, updateServiceDto);
  }

  /** زيادة عدد الطلبات على الخدمة */
  @Put(':serviceId/order-count')
  @AuthWithRoles('admin')
  increaseOrderCount(@Param('serviceId') serviceId: string) {
    return this.appService.increaseOrderCount(serviceId);
  }

  /** تحديث تقييم الخدمة */
  @Put(':serviceId/rating')
  @AuthWithRoles('admin')
  updateServiceRating(
    @Param('serviceId') serviceId: string,
    @Body() data: { rating: number },
  ) {
    return this.appService.updateServiceRating(serviceId, data.rating);
  }

  /** تعطيل الخدمة */
  @Put(':serviceId/deactivate')
  @AuthWithRoles('admin')
  deactivateService(@Param('serviceId') serviceId: string) {
    return this.appService.deactivateService(serviceId);
  }

  /** إعادة تفعيل الخدمة */
  @Put(':serviceId/activate')
  @AuthWithRoles('admin')
  activateService(@Param('serviceId') serviceId: string) {
    return this.appService.activateService(serviceId);
  }

  /** حذف خدمة نهائيًا */
  @Delete(':serviceId')
  @AuthWithRoles('admin')
  deleteService(@Param('serviceId') serviceId: string) {
    return this.appService.deleteService(serviceId);
  }
}
