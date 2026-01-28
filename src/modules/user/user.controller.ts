import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';

import { AuthWithRoles } from '../auth/decorators/auth.decorator';
import { UserId } from '../auth/decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==========================
  // ADMIN
  // ==========================

  @Get()
  @AuthWithRoles('admin')
  getAllUsers(@Query('role') role?: string) {
    return this.userService.findAll(role);
  }

  @Get('driver-requests/pending')
  @AuthWithRoles('admin')
  getPendingDriverRequests() {
    return this.userService.getPendingDriverRequests();
  }

  @Put(':id/approve-driver')
  @AuthWithRoles('admin')
  approveDriver(@Param('id') id: string) {
    return this.userService.approveDriver(id);
  }

  @Put(':id/reject-driver')
  @AuthWithRoles('admin')
  rejectDriver(@Param('id') id: string) {
    return this.userService.rejectDriver(id);
  }

  @Put(':id/deactivate')
  @AuthWithRoles('admin')
  deactivateUser(@Param('id') id: string) {
    return this.userService.deactivateUser(id);
  }

  @Put(':id/activate')
  @AuthWithRoles('admin')
  activateUser(@Param('id') id: string) {
    return this.userService.activateUser(id);
  }

  @Delete(':id')
  @AuthWithRoles('admin')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  // ==========================
  // CUSTOMER & DRIVER
  // ==========================

  @Get('me/profile')
  @AuthWithRoles('customer', 'driver')
  getMyProfile(@UserId() userId: string) {
    return this.userService.findById(userId);
  }

  @Put('me/profile')
  @AuthWithRoles('customer', 'driver')
  updateProfile(
    @UserId() userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  @Put('me/location')
  @AuthWithRoles('customer', 'driver')
  updateLocation(
    @UserId() userId: string,
    @Body()
    location: { latitude: number; longitude: number; address: string },
  ) {
    return this.userService.updateLocation(
      userId,
      location.latitude,
      location.longitude,
      location.address,
    );
  }

  @Put('me/request-driver')
  @AuthWithRoles('customer')
  requestDriver(@UserId() userId: string) {
    return this.userService.requestDriverRole(userId);
  }
}
