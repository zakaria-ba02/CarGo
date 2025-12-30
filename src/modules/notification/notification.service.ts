import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';
import { CreateNotificationDto } from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  /**
   * إنشاء إشعار جديد
   * - يستقبل بيانات الإشعار من CreateNotificationDto
   * - يحول userId و orderId إلى ObjectId
   */
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const newNotification = new this.notificationModel({
      ...createNotificationDto,
      userId: new Types.ObjectId(createNotificationDto.userId),
      orderId: createNotificationDto.orderId
        ? new Types.ObjectId(createNotificationDto.orderId)
        : undefined,
    });

    return await newNotification.save();
  }

  /**
   * جلب آخر الإشعارات لمستخدم معين
   * - يمكن تحديد limit (افتراضي 20)
   * - مرتبة حسب الأحدث أولاً
   */
  async getNotificationsByUserId(userId: string, limit: number = 20): Promise<Notification[]> {
    return await this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * جلب كل الإشعارات غير المقروءة لمستخدم معين
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return await this.notificationModel.find({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  /**
   * وضع إشعار معين كمقروء
   * - يرجع الإشعار بعد تحديثه
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundException('الإشعار غير موجود');
    }
    return notification;
  }

  /**
   * وضع كل إشعارات المستخدم كمقروءة
   * - يرجع عدد الإشعارات التي تم تحديثها
   */
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * حذف إشعار معين
   * - يرجع رسالة تأكيد
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const result = await this.notificationModel.findByIdAndDelete(notificationId);
    if (!result) {
      throw new NotFoundException('الإشعار غير موجود');
    }
    return { message: 'تم حذف الإشعار بنجاح' };
  }

  /**
   * حذف كل إشعارات مستخدم معين
   * - يرجع عدد الإشعارات المحذوفة
   */
  async deleteAllUserNotifications(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });

    return { deletedCount: result.deletedCount };
  }

  /**
   * حساب عدد الإشعارات غير المقروءة لمستخدم معين
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  /**
   * إنشاء إشعار تلقائي عند تغيير حالة الطلب
   * - userId: صاحب الطلب
   * - orderId: الطلب المرتبط
   * - status: حالة الطلب الجديدة
   * - يستخدم رسالة محددة لكل حالة
   */
  async notifyOrderStatusChange(
    userId: string,
    orderId: string,
    status: string,
  ): Promise<Notification> {
    const messages = {
      accepted: 'تم قبول طلبك بنجاح',
      on_the_way: 'السائق في الطريق إليك',
      in_progress: 'جاري تنفيذ الخدمة',
      completed: 'تم إكمال الخدمة بنجاح',
      cancelled: 'تم إلغاء الطلب',
    };

    return await this.createNotification({
      userId,
      orderId,
      title: 'تحديث حالة الطلب',
      message: messages[status] || 'تم تحديث حالة الطلب',
      type: 'order_update',
    });
  }
}
