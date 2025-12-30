// ============================================
// guards/roles.guard.ts
// ============================================
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // احصل على الأدوار المطلوبة من الـ Decorator
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    // إذا لم تكن هناك أدوار مطلوبة، اسمح بالدخول
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // احصل على الطلب والمستخدم
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // تحقق من أن المستخدم موجود
    if (!user) {
      throw new ForbiddenException('لا يوجد مستخدم');
    }

    // تحقق من أن دور المستخدم مدرج في الأدوار المطلوبة
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `ليس لديك الصلاحية. الأدوار المطلوبة: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}