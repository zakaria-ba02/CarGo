// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Modules
import { UserModule } from './modules/user/user.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { ServiceModule } from './modules/service/service.module';
import { OrderModule } from './modules/order/order.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RatingModule } from './modules/rating/rating.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { DriverModule } from './modules/driver/driver.module';

// Controllers
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // تكوين المتغيرات البيئية
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // اتصال MongoDB
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb+srv://baroudamohmmed_db_user:aaa123aaa@cluster0.nu13vho.mongodb.net/?tls=true&tlsCertificateKeyFilePassword=aaa123aaa',
    ),

    // جميع الـ Modules
    UserModule,
    VehicleModule,
    ServiceModule,
    OrderModule,
    NotificationModule,
    RatingModule,
    InventoryModule,
    DriverModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers:[AppService],
})
export class AppModule {}