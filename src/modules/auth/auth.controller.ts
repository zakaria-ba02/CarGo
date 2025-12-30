// ============================================
// auth.controller.ts - مبسّط
// ============================================
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============================================
  // التسجيل - Register
  // ============================================
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  // ============================================
  // الدخول - Login
  // ============================================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  // ============================================
  // تحديث الـ Token - Refresh Token
  // ============================================
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refresh_token: string }) {
    if (!body.refresh_token) {
      throw new BadRequestException('Refresh token مطلوب');
    }
    return await this.authService.refreshToken(body.refresh_token);
  }

  // ============================================
  // الملف الشخصي - Profile
  // ============================================
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      message: 'تم الحصول على الملف الشخصي بنجاح',
      user,
    };
  }

  // ============================================
  // الخروج - Logout (اختياري)
  // ============================================
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    return {
      message: 'تم تسجيل الخروج بنجاح',
      userId: user.sub,
    };
  }
}