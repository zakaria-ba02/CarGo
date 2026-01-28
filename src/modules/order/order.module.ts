import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderSchema } from './order.schema';
import { Service, ServiceSchema } from '../service/service.schema'; // استيراد سكيمة الخدمة
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notification.module';
import { DriverModule } from '../driver/driver.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { Vehicle, VehicleSchema } from '../vehicle/vehicle.schema';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Service.name, schema: ServiceSchema }, // إضافة ServiceModel هنا
      {name:Vehicle.name,schema:VehicleSchema},
    ]),
    NotificationModule,
    DriverModule,
    VehicleModule,
    ServiceModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],

})
export class OrderModule {}
