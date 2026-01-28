// ============================================
// auth.service.ts - الحل النهائي الصحيح 100%
// ============================================
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './auth.dto';
import { User, UserDocument  } from '../user/schema';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, name, phone, role } = registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('كلمات المرور غير متطابقة');
    }

    if (password.length < 4) {
      throw new BadRequestException('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
    }

    const existingUser = await this.userModel.findOne({ email }).lean().exec();
    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مسجل بالفعل');
    }

    // ✅ تحقق من رقم الهاتف
  const existingUserByPhone = await this.userModel.findOne({ phone }).lean().exec();
   if (existingUserByPhone) {
    throw new ConflictException('رقم الهاتف مستخدم مسبقاً');
    }    

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'customer',
      isActive: true,
    });

    await newUser.save();

    const tokens = this.generateTokens((newUser._id as any).toString(), newUser.email, newUser.role);


    return {
      message: 'تم التسجيل بنجاح',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).lean().exec();
    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('الحساب معطل');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);

    return {
      message: 'تم الدخول بنجاح',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      }) as JwtPayload;

      const user = await this.userModel.findById(decoded.sub).lean().exec();
      if (!user) {
        throw new UnauthorizedException('المستخدم غير موجود أو معطل');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('الحساب معطل');
      }

      return this.generateTokens(user._id.toString(), user.email, user.role);
    } catch (error) {
      throw new UnauthorizedException('Refresh Token غير صحيح أو منتهي الصلاحية');
    }
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    // إضافة exp يدوياً في الـ payload
    const now = Math.floor(Date.now() / 1000);
    
    const accessPayload = { 
      ...payload, 
      exp: now + (24 * 60 * 60) // 24 ساعة
    };
    
    const refreshPayload = { 
      ...payload, 
      exp: now + (7 * 24 * 60 * 60) // 7 أيام
    };

    const access_token = this.jwtService.sign(accessPayload, {
      secret: process.env.JWT_SECRET || 'jwt-secret-key',
    });

    const refresh_token = this.jwtService.sign(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    });

    return { access_token, refresh_token };
  }
}