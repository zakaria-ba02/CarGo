// ============================================
// decorators/current-user.decorator.ts
// ============================================
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // إذا طُلب حقل محدد، أرجعه فقط
    if (data) {
      return user[data];
    }

    // أرجع المستخدم كاملاً
    return user;
  },
);











