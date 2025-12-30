import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './notification.dto';
import { AuthWithRoles } from '../auth/decorators/auth.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @AuthWithRoles('admin', 'driver', 'customer')
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationService.createNotification(createNotificationDto);
  }

  @Get('user/:userId')
  @AuthWithRoles('driver', 'customer')
  async getNotificationsByUserId(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 20,
  ) {
    return await this.notificationService.getNotificationsByUserId(userId, limit);
  }

  @Get('user/:userId/unread')
  @AuthWithRoles('driver', 'customer')
  async getUnreadNotifications(@Param('userId') userId: string) {
    return await this.notificationService.getUnreadNotifications(userId);
  }

  @Get('user/:userId/unread-count')
  @AuthWithRoles('driver', 'customer')
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  @Put(':notificationId/read')
  @AuthWithRoles('driver', 'customer')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return await this.notificationService.markAsRead(notificationId);
  }

  @Put('user/:userId/read-all')
  @AuthWithRoles('driver', 'customer')
  async markAllAsRead(@Param('userId') userId: string) {
    return await this.notificationService.markAllAsRead(userId);
  }

  @Delete(':notificationId')
  @AuthWithRoles('admin')
  async deleteNotification(@Param('notificationId') notificationId: string) {
    return await this.notificationService.deleteNotification(notificationId);
  }

  @Delete('user/:userId/all')
  @AuthWithRoles('admin')
  async deleteAllUserNotifications(@Param('userId') userId: string) {
    return await this.notificationService.deleteAllUserNotifications(userId);
  }
}

