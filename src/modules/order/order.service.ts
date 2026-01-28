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
} from './order.schema';

import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  RateOrderDto,
} from './order.dto';

import { NotificationService } from '../notification/notification.service';
import { DriverService } from '../driver/driver.service';
import { Vehicle } from '../vehicle/vehicle.schema';
import { Service } from '../service/service.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,

    private readonly driverService: DriverService,

    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<Vehicle>,

    private readonly notifi: NotificationService,

    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
  ) {}

  // =====================================================
  // 🔧 HELPER: Populate الحقول المرتبطة
  // =====================================================
  private getPopulateOptions() {
    return [
      { path: 'userId', select: '-password' },
      { path: 'vehicleId' },
      { path: 'serviceId' },
      { path: 'driverId', select: '-password' },
    ];
  }

  // =====================================================
  // CREATE ORDER
  // =====================================================
  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{ order: Order; nearbyDrivers: any[] }> {

    if (!dto.location) {
      throw new BadRequestException('موقع الطلب مطلوب');
    }

    const service = await this.serviceModel.findById(dto.serviceId).lean();
    if (!service) {
      throw new BadRequestException('الخدمة غير موجودة');
    }

    if (typeof service.basePrice !== 'number' || service.basePrice <= 0) {
      throw new BadRequestException('سعر الخدمة غير صالح');
    }

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
      totalPrice: service.basePrice,
      status: OrderStatus.PENDING,
      isLocationTrackingActive: false,
      driverLocationHistory: [],
    });

    const savedOrder = await order.save();

    // ✅ Populate البيانات قبل الإرجاع
    const populatedOrder = await this.orderModel
      .findById(savedOrder._id)
      .populate(this.getPopulateOptions())
      .exec();

    if (!populatedOrder) {
      throw new BadRequestException('فشل في إنشاء الطلب');
    }

    await this.notifi.createNotification({
      orderId: savedOrder._id.toString(),
      userId,
      title: 'تم إنشاء الطلب',
      message: 'جاري البحث عن سائق قريب منك',
    });

    const nearbyDrivers =
      await this.driverService.getNearbyAvailableDrivers(
        dto.location.latitude,
        dto.location.longitude,
        dto.radius ?? 5,
      );

    return { order: populatedOrder, nearbyDrivers };
  }

  // =====================================================
  // GET
  // =====================================================
  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());

    if (!order) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  // ✅ مُصلح: إضافة populate
  async getOrdersByUserId(userId: string, status?: OrderStatus) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (status) query.status = status;
    return this.orderModel
      .find(query)
      .populate(this.getPopulateOptions())
      .sort({ createdAt: -1 });
  }

  // ✅ مُصلح: إضافة populate
  async getOrdersByDriverId(driverId: string, status?: OrderStatus) {
    const query: any = { driverId: new Types.ObjectId(driverId) };
    if (status) query.status = status;
    return this.orderModel
      .find(query)
      .populate(this.getPopulateOptions())
      .sort({ createdAt: -1 });
  }

  // ✅ مُصلح: إضافة populate
  async getAvailableOrders(orderType?: OrderType) {
    const query: any = { status: OrderStatus.PENDING };
    if (orderType) query.orderType = orderType;
    return this.orderModel
      .find(query)
      .populate(this.getPopulateOptions())
      .sort({ createdAt: 1 });
  }

  // ✅ مُصلح: إضافة populate
  async getOrdersByStatus(status?: OrderStatus) {
    const query: any = {};
    if (status) query.status = status;
    return this.orderModel
      .find(query)
      .populate(this.getPopulateOptions())
      .sort({ createdAt: -1 });
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
  async assignDriverToOrder(orderId: string, driverId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('الطلب غير موجود');

    order.driverId = new Types.ObjectId(driverId);
    order.status = OrderStatus.ACCEPTED;
    order.acceptedAt = new Date();

    await order.save();

    // ✅ إرجاع الطلب مع populate
    return this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());
  }

  // ================== 🔥 NEW 🔥 ==================
  async startServiceExecution(orderId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException(
        'لا يمكن بدء التنفيذ إلا بعد قبول الطلب',
      );
    }

    order.status = OrderStatus.IN_PROGRESS;
    order.startedAt = new Date();
    order.isLocationTrackingActive = true;

    await order.save();

    // ✅ Populate قبل الإرجاع
    const populatedOrder = await this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());

    await this.notifi.createNotification({
      orderId: orderId,
      userId: order.userId.toString(),
      title: 'بدأ تنفيذ الطلب',
      message: 'السائق بدأ بتنفيذ الخدمة',
    });

    return populatedOrder;
  }
  // =====================================================

  // ✅ مُصلح: إضافة دعم driverId للسائق عند قبول الطلب
  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto & { driverId?: string }) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('الطلب غير موجود');

    order.status = dto.status;

    // ✅ إذا كان السائق يقبل الطلب
    if (dto.driverId) {
      order.driverId = new Types.ObjectId(dto.driverId);
    }

    if (dto.status === OrderStatus.ACCEPTED) {
      order.acceptedAt = new Date();
    }

    if (dto.status === OrderStatus.IN_PROGRESS) {
      order.startedAt = new Date();
      order.isLocationTrackingActive = true;
    }

    if (dto.status === OrderStatus.COMPLETED) {
      order.completedAt = new Date();
      order.isLocationTrackingActive = false;
    }

    await order.save();

    // ✅ إرجاع مع populate
    return this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());
  }

  async cancelOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('الطلب غير موجود');

    if (![OrderStatus.PENDING, OrderStatus.ACCEPTED].includes(order.status)) {
      throw new BadRequestException('لا يمكن إلغاء الطلب في هذه الحالة');
    }

    order.status = OrderStatus.CANCELLED;
    order.isLocationTrackingActive = false;

    await order.save();

    return this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());
  }

  async rateOrder(orderId: string, dto: RateOrderDto) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('الطلب غير موجود');

    order.isRated = true;
    order.rating = dto.rating;
    order.ratingComment = dto.comment;

    await order.save();

    return this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());
  }

  // =====================================================
  // LOCATION
  // =====================================================
  async updateDriverLocationTracking(
    orderId: string,
    latitude: number,
    longitude: number,
    address: string,
  ) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('الطلب غير موجود');

    order.driverLocationHistory ??= [];
    order.driverLocationHistory.push({
      latitude,
      longitude,
      address,
      recordedAt: new Date(),
    });

    await order.save();

    return this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());
  }

  async startLocationTracking(orderId: string) {
    await this.orderModel.findByIdAndUpdate(
      orderId,
      { isLocationTrackingActive: true },
      { new: true },
    );

    return this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());
  }

  async stopLocationTracking(orderId: string) {
    await this.orderModel.findByIdAndUpdate(
      orderId,
      { isLocationTrackingActive: false },
      { new: true },
    );

    return this.orderModel
      .findById(orderId)
      .populate(this.getPopulateOptions());
  }

  async deleteOrder(orderId: string) {
    const result = await this.orderModel.findByIdAndDelete(orderId);
    if (!result) throw new NotFoundException('الطلب غير موجود');
    return { message: 'تم حذف الطلب بنجاح' };
  }
}