import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Order,
  OrderStatus,
  OrderType,
  DriverLocationRecord,
} from './order.schema';

import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  RateOrderDto,
} from './order.dto';

import { NotificationService } from '../notification/notification.service';
import { DriverService } from '../driver/driver.service';
import { Vehicle } from '../vehicle/vehicle.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly driverService: DriverService,
    @InjectModel(Vehicle.name)  // ✅ إضافة InjectModel هنا
    private readonly vehicleModel: Model<Vehicle>,
    private readonly notifi: NotificationService,

    @InjectModel('Service')
    private readonly serviceModel: Model<any>,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{ order: Order; nearbyDrivers: any[] }> {
    // التحقق من السيارة إذا تم اختيارها
    if (dto.vehicleId) {
      const vehicle = await this.vehicleModel.findOne({
        _id: dto.vehicleId,
        userId: new Types.ObjectId(userId),
        isActive: true,
      });

      if (!vehicle) {
        throw new BadRequestException('السيارة غير موجودة أو لا تخصك');
      }
    }

    // إنشاء الطلب
    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      vehicleId: dto.vehicleId
        ? new Types.ObjectId(dto.vehicleId)
        : undefined,
      serviceId: new Types.ObjectId(dto.serviceId),
      orderType: dto.orderType,
      scheduledAt: dto.scheduledAt,
      location: dto.location,
      notes: dto.notes,
      status: OrderStatus.PENDING,
      isLocationTrackingActive: false,
      driverLocationHistory: [],
    });

    const savedOrder = await order.save();
    if (!savedOrder) {
      throw new BadRequestException('حدث خطأ أثناء حفظ الطلب');
    }

    // إشعار المستخدم
    await this.notifi.createNotification({
      orderId: savedOrder._id.toString(),
      userId,
      title: 'تم إنشاء الطلب',
      message: 'جاري البحث عن سائق قريب منك',
    });

    // البحث عن سائقين قريبين
    if (!dto.location) {
      throw new BadRequestException('موقع الطلب مطلوب');
    }
    
    const nearbyDrivers =
      await this.driverService.getNearbyAvailableDrivers(
        dto.location.latitude,
        dto.location.longitude,
        dto.radius || 5,
      );
    

    return {
      order: savedOrder,
      nearbyDrivers,
    };
  }

  // =====================================================
  // GET
  // =====================================================

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('userId vehicleId serviceId driverId')
      .exec();

    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  async getOrdersByUserId(
    userId: string,
    status?: OrderStatus,
  ): Promise<Order[]> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (status) query.status = status;

    return this.orderModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getOrdersByDriverId(
    driverId: string,
    status?: OrderStatus,
  ): Promise<Order[]> {
    const query: any = { driverId: new Types.ObjectId(driverId) };
    if (status) query.status = status;

    return this.orderModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getAvailableOrders(orderType?: OrderType): Promise<Order[]> {
    const query: any = { status: OrderStatus.PENDING };
    if (orderType) query.orderType = orderType;

    return this.orderModel.find(query).sort({ createdAt: 1 }).exec();
  }

  async getOrdersByStatus(status?: OrderStatus): Promise<Order[]> {
    const query: any = {};
    if (status) query.status = status;

    return this.orderModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getOrderStatistics() {
    return this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
        },
      },
    ]);
  }

  // =====================================================
  // UPDATE
  // =====================================================

  async assignDriverToOrder(
    orderId: string,
    driverId: string,
  ): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        driverId: new Types.ObjectId(driverId),
        status: OrderStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      { new: true },
    );

    if (!order) throw new NotFoundException('الطلب غير موجود');

    // إشعار
    if (!order.userId) throw new NotFoundException('مستخدم الطلب غير موجود');
    await this.notifi.createNotification({
      orderId: order._id.toString(),
      userId: order.userId.toString(),
      title: 'تم قبول طلبك',
      message: 'تم تعيين سائق لطلبك بنجاح',
    });

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const update: any = { status: dto.status };

    if (dto.status === OrderStatus.IN_PROGRESS) {
      update.startedAt = new Date();
      update.isLocationTrackingActive = true;
    }

    if (dto.status === OrderStatus.COMPLETED) {
      update.completedAt = new Date();
      update.isLocationTrackingActive = false;
    }

    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      update,
      { new: true },
    );

    if (!order) throw new NotFoundException('الطلب غير موجود');
    if (!order.userId) throw new NotFoundException('مستخدم الطلب غير موجود');

    await this.notifi.createNotification({
      orderId: order._id.toString(),
      userId: order.userId.toString(),
      title: 'تحديث حالة الطلب',
      message: `تم تحديث حالة الطلب إلى ${order.status}`,
    });

    return order;
  }

  async startServiceExecution(orderId: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        status: OrderStatus.IN_PROGRESS,
        startedAt: new Date(),
        isLocationTrackingActive: true,
      },
      { new: true },
    );

    if (!order) throw new NotFoundException('الطلب غير موجود');
    if (!order.userId) throw new NotFoundException('مستخدم الطلب غير موجود');

    await this.notifi.createNotification({
      orderId: order._id.toString(),
      userId: order.userId.toString(),
      title: 'بدأ تنفيذ الطلب',
      message: 'السائق بدأ بتنفيذ الخدمة',
    });

    return order;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('الطلب غير موجود');
    if (!order.userId) throw new NotFoundException('مستخدم الطلب غير موجود');

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.ACCEPTED
    ) {
      throw new BadRequestException('لا يمكن إلغاء الطلب في هذه الحالة');
    }

    order.status = OrderStatus.CANCELLED;
    order.isLocationTrackingActive = false;

    const saved = await order.save();

    await this.notifi.createNotification({
      orderId: saved._id.toString(),
      userId: saved.userId.toString(),
      title: 'تم إلغاء الطلب',
      message: 'تم إلغاء الطلب بنجاح',
    });

    return saved;
  }

  async rateOrder(orderId: string, dto: RateOrderDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        isRated: true,
        rating: dto.rating,
        ratingComment: dto.comment,
      },
      { new: true },
    );

    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  // =====================================================
  // LOCATION
  // =====================================================

  async updateDriverLocationTracking(
    orderId: string,
    latitude: number,
    longitude: number,
    address: string,
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('الطلب غير موجود');

    if (!order.driverLocationHistory) {
      order.driverLocationHistory = [];
    }

    const record: DriverLocationRecord = {
      latitude,
      longitude,
      address,
      recordedAt: new Date(),
    };

    order.driverLocationHistory.push(record);
    return order.save();
  }

  async startLocationTracking(orderId: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { isLocationTrackingActive: true },
      { new: true },
    );

    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  async stopLocationTracking(orderId: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { isLocationTrackingActive: false },
      { new: true },
    );

    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  // =====================================================
  // DELETE
  // =====================================================

  async deleteOrder(orderId: string) {
    const result = await this.orderModel.findByIdAndDelete(orderId);
    if (!result) throw new NotFoundException('الطلب غير موجود');
    return { message: 'تم حذف الطلب بنجاح' };
  }
}
