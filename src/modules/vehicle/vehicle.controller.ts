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

import { VehicleService } from './vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicle.dto';

import { AuthWithRoles } from '../auth/decorators/auth.decorator';
import { UserId } from '../auth/decorators/user-id.decorator';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  // =====================================================
  // 👤 CUSTOMER
  // =====================================================

  /** إنشاء مركبة للمستخدم الحالي */
  @Post()
  @AuthWithRoles('customer')
  createVehicle(
    @UserId() userId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehicleService.createVehicle(userId, dto);
  }

  /** جلب مركبات المستخدم الحالي */
  @Get('my')
  @AuthWithRoles('customer')
  getMyVehicles(@UserId() userId: string) {
    return this.vehicleService.getVehiclesByUserId(userId);
  }

  /** تحديث بيانات مركبة */
  @Put(':vehicleId')
  @AuthWithRoles('customer')
  updateVehicle(
    @Param('vehicleId') vehicleId: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.updateVehicle(vehicleId, dto);
  }

  /** تحديث موقع المركبة */
  @Put(':vehicleId/location')
  @AuthWithRoles('customer')
  updateVehicleLocation(
    @Param('vehicleId') vehicleId: string,
    @Body() location: { latitude: number; longitude: number; address: string },
  ) {
    return this.vehicleService.updateVehicleLocation(
      vehicleId,
      location.latitude,
      location.longitude,
      location.address,
    );
  }

  /** تحديث تاريخ الصيانة */
  @Put(':vehicleId/service-date')
  @AuthWithRoles('customer')
  updateServiceDate(
    @Param('vehicleId') vehicleId: string,
    @Body() data: { date: Date },
  ) {
    return this.vehicleService.updateLastServiceDate(
      vehicleId,
      new Date(data.date),
    );
  }

  /** تعطيل المركبة */
  @Put(':vehicleId/deactivate')
  @AuthWithRoles('customer')
  deactivateVehicle(@Param('vehicleId') vehicleId: string) {
    return this.vehicleService.deactivateVehicle(vehicleId);
  }

  /** تفعيل المركبة */
  @Put(':vehicleId/activate')
  @AuthWithRoles('customer')
  activateVehicle(@Param('vehicleId') vehicleId: string) {
    return this.vehicleService.activateVehicle(vehicleId);
  }

  /** حذف المركبة */
  @Delete(':vehicleId')
  @AuthWithRoles('customer')
  deleteVehicle(@Param('vehicleId') vehicleId: string) {
    return this.vehicleService.deleteVehicle(vehicleId);
  }

  // =====================================================
  // 🚗 DRIVER
  // =====================================================

  /** عرض مركبة (للاطلاع فقط) */
  @Get(':vehicleId')
  @AuthWithRoles('customer', 'admin')
  getVehicleById(@Param('vehicleId') vehicleId: string) {
    return this.vehicleService.getVehicleById(vehicleId);
  }

  // =====================================================
  // 🛠 ADMIN
  // =====================================================

  /** جلب جميع المركبات */
  @Get()
  @AuthWithRoles('admin')
  getAllVehicles() {
    return this.vehicleService.getAllVehicles();
  }

  /** جلب مركبات مستخدم معين */
  @Get('user/:userId')
  @AuthWithRoles('admin')
  getUserVehicles(@Param('userId') userId: string) {
    return this.vehicleService.getVehiclesByUserId(userId);
  }

  /** البحث حسب الصنع والطراز */
  @Get('search/make-model')
  @AuthWithRoles('admin')
  getVehiclesByMakeAndModel(
    @Query('make') make: string,
    @Query('model') model: string,
  ) {
    return this.vehicleService.getVehiclesByMakeAndModel(make, model);
  }

  /** عدد المركبات */
  @Get('stats/count')
  @AuthWithRoles('admin')
  async getVehicleCount() {
    const count = await this.vehicleService.getVehicleCount();
    return { count };
  }
}
