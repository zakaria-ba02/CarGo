// ============================================
// guards/optional-jwt.guard.ts
// ============================================
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // لا تحتاج الـ Token، إذا كانت موجودة اقرأها
    // إذا لم تكن موجودة، تابع بدون مستخدم
    return user || null;
  }
}