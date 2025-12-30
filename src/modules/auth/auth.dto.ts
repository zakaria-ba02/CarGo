// ============================================
// auth.dto.ts - مبسّط
// ============================================
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

// ============================================
// Login DTO
// ============================================
export class LoginDto {
  @IsString({ message: 'البريد الإلكتروني يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password: string;
}

// ============================================
// Register DTO
// ============================================
export class RegisterDto {
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  @MinLength(2, { message: 'الاسم يجب أن يكون 2 أحرف على الأقل' })
  @MaxLength(50, { message: 'الاسم يجب ألا يتجاوز 50 حرف' })
  name: string;

  @IsString({ message: 'البريد الإلكتروني يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  phone: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(4, { message: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' })
  password: string;

  @IsString({ message: 'تأكيد كلمة المرور يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'تأكيد كلمة المرور مطلوب' })
  confirmPassword: string;

  @IsEnum(['customer', 'driver', 'admin'], {
    message: 'الدور يجب أن يكون customer, driver أو admin',
  })
  @IsOptional()
  role?: string;
}

// ============================================
// Response DTOs
// ============================================
export class AuthResponseDto {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
}

export class TokenResponseDto {
  access_token: string;
  refresh_token: string;
}