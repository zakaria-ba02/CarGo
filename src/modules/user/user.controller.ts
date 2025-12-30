import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';

// 🔐 Auth
import { AuthWithRoles } from '../auth/decorators/auth.decorator';
import { UserId } from '../auth/decorators/user-id.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // =====================================================
  // 🛠 ADMIN
  // =====================================================

  /** جلب جميع المستخدمين (فلترة حسب الدور) */
  @Get()
  @AuthWithRoles('admin')
  getAllUsers(@Query('role') role?: string) {
    return this.userService.findAll(role);
  }

  /** جلب جميع السائقين */
  @Get('drivers')
  @AuthWithRoles('admin')
  getAllDrivers() {
    return this.userService.findAll('driver');
  }

  /** جلب جميع العملاء */
  @Get('customers')
  @AuthWithRoles('admin')
  getAllCustomers() {
    return this.userService.findAll('customer');
  }

  /** جلب مستخدم حسب ID */
  @Get(':id')
  @AuthWithRoles('admin')
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  /** تعطيل مستخدم */
  @Put(':id/deactivate')
  @AuthWithRoles('admin')
  deactivateUser(@Param('id') id: string) {
    return this.userService.deactivateUser(id);
  }

  /** تفعيل مستخدم */
  @Put(':id/activate')
  @AuthWithRoles('admin')
  activateUser(@Param('id') id: string) {
    return this.userService.activateUser(id);
  }

  /** تحديث تقييم المستخدم */
  @Put(':userId/rating')
  @AuthWithRoles('admin')
  updateUserRating(
    @Param('userId') userId: string,
    @Body() data: { rating: number },
  ) {
    return this.userService.updateUserRating(userId, data.rating);
  }

  /** حذف مستخدم */
  @Delete(':id')
  @AuthWithRoles('admin')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  // =====================================================
  // 👤 CUSTOMER & 🚗 DRIVER
  // =====================================================

  /** عرض الملف الشخصي (المستخدم الحالي) */
  @Get('me/profile')
  @AuthWithRoles('customer', 'driver')
  getMyProfile(@UserId() userId: string) {
    return this.userService.findById(userId);
  }

  /** تحديث الملف الشخصي */
  @Put('me/profile')
  @AuthWithRoles('customer', 'driver')
  updateProfile(
    @UserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(userId, updateUserDto);
  }

  /** تحديث الموقع الحالي */
  @Put('me/location')
  @AuthWithRoles('customer', 'driver')
  updateMyLocation(
    @UserId() userId: string,
    @Body() locationData: {
      latitude: number;
      longitude: number;
      address: string;
    },
  ) {
    return this.userService.updateLocation(
      userId,
      locationData.latitude,
      locationData.longitude,
      locationData.address,
    );
  }

  // =====================================================
  // 🚗 DRIVER
  // =====================================================

  /** البحث عن السائقين القريبين (للاستخدام الإداري أو التوسع لاحقًا) */
  @Get('drivers/location/nearby')
  @AuthWithRoles('admin', 'driver')
  getNearbyDrivers(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius = 5,
  ) {
    return this.userService.findDriversByLocation(latitude, longitude, radius);
  }
}
