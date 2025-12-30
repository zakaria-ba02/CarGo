// ============================================
// auth.module.ts - الإصدار المصلح
// ============================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from '../user/schema';

@Module({
  imports: [
    // Passport Module
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    // JWT Module - بدون expiresIn في signOptions
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'jwt-secret-key',
        // لا نضع expiresIn هنا لتجنب مشاكل TypeScript
        // سيتم التعامل معه في auth.service.ts عبر exp في payload
      }),
    }),

    // Mongoose Module للـ User
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),

    // Config Module
    ConfigModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
  ],

  exports: [
    AuthService,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}