import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { OrderService } from './order.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  RateOrderDto,
} from './order.dto';

import { OrderType, OrderStatus } from './order.schema';

// 🔐 Auth
import { AuthWithRoles } from '../auth/decorators/auth.decorator';
import { UserId } from '../auth/decorators/user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // =====================================================
  // 🧑‍💼 CUSTOMER
  // =====================================================

  /** إنشاء طلب جديد */
  @Post('create/order')
  @AuthWithRoles('customer')
  createOrder(
    @UserId() userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, dto);
  }

  /** جلب جميع طلبات المستخدم الحالي */
  @Get('my')
  @AuthWithRoles('customer')
  getMyOrders(
    @UserId() userId: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orderService.getOrdersByUserId(userId, status);
  }

  /** جلب طلب محدد (لصاحب الطلب أو الأدمن أو السائق) */
  @Get(':orderId')
  @AuthWithRoles('customer', 'admin', 'driver')
  getOrderById(@Param('orderId') orderId: string) {
    return this.orderService.getOrderById(orderId);
  }

  /** تقييم الطلب */
  @Put(':orderId/rate')
  @AuthWithRoles('customer')
  rateOrder(
    @Param('orderId') orderId: string,
    @Body() dto: RateOrderDto,
  ) {
    return this.orderService.rateOrder(orderId, dto);
  }

  /** إلغاء الطلب */
  @Put(':orderId/cancel')
  @AuthWithRoles('customer', 'admin')
  cancelOrder(@Param('orderId') orderId: string) {
    return this.orderService.cancelOrder(orderId);
  }

  // =====================================================
  // 🚗 DRIVER
  // =====================================================

  /** جلب الطلبات المتاحة */
  @Get('available/list')
  @AuthWithRoles('driver')
  getAvailableOrders(@Query('orderType') orderType?: OrderType) {
    return this.orderService.getAvailableOrders(orderType);
  }

  /** جلب طلبات السائق الحالي */
  @Get('driver/my')
  @AuthWithRoles('driver')
  getDriverOrders(
    @UserId() driverId: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orderService.getOrdersByDriverId(driverId, status);
  }

  /** ✅ جديد: تحديث حالة الطلب من السائق (قبول/رفض) */
  @Put(':orderId/status')
  @AuthWithRoles('driver', 'admin')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto & { driverId?: string },
  ) {
    return this.orderService.updateOrderStatus(orderId, dto);
  }

  /** بدء تنفيذ الطلب */
  @Put(':orderId/start-execution')
  @AuthWithRoles('driver')
  startExecution(@Param('orderId') orderId: string) {
    return this.orderService.startServiceExecution(orderId);
  }

  /** تحديث موقع السائق */
  @Put(':orderId/driver-location')
  @AuthWithRoles('driver')
  updateDriverLocation(
    @Param('orderId') orderId: string,
    @Body() body: {
      latitude: number;
      longitude: number;
      address: string;
    },
  ) {
    return this.orderService.updateDriverLocationTracking(
      orderId,
      body.latitude,
      body.longitude,
      body.address,
    );
  }

  /** بدء تتبع الموقع */
  @Put(':orderId/start-tracking')
  @AuthWithRoles('driver')
  startTracking(@Param('orderId') orderId: string) {
    return this.orderService.startLocationTracking(orderId);
  }

  /** إيقاف تتبع الموقع */
  @Put(':orderId/stop-tracking')
  @AuthWithRoles('driver')
  stopTracking(@Param('orderId') orderId: string) {
    return this.orderService.stopLocationTracking(orderId);
  }

  // =====================================================
  // 🛠 ADMIN
  // =====================================================

  /** جلب جميع الطلبات (مع فلترة اختيارية حسب الحالة) */
  @Get()
  @AuthWithRoles('admin')
  getAllOrders(@Query('status') status?: OrderStatus) {
    return this.orderService.getOrdersByStatus(status);
  }

  /** تعيين سائق لطلب */
  @Put(':orderId/assign-driver')
  @AuthWithRoles('admin')
  assignDriver(
    @Param('orderId') orderId: string,
    @Body() body: { driverId: string },
  ) {
    return this.orderService.assignDriverToOrder(orderId, body.driverId);
  }

  /** إحصائيات الطلبات */
  @Get('stats/all')
  @AuthWithRoles('admin')
  getStatistics() {
    return this.orderService.getOrderStatistics();
  }

  /** حذف طلب */
  @Delete(':orderId')
  @AuthWithRoles('admin')
  deleteOrder(@Param('orderId') orderId: string) {
    return this.orderService.deleteOrder(orderId);
  }
}