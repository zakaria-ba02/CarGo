// ============================================
// guards/jwt-auth.guard.ts
// ============================================
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // إذا حدث خطأ أو لا يوجد مستخدم
    if (err || !user) {
      const message = info?.message || 'Token غير صحيح أو منتهي الصلاحية';
      throw err || new UnauthorizedException(message);
    }
    return user;
  }
}





