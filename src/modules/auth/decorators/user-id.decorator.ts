// ============================================
// decorators/user-id.decorator.ts
// ============================================
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const UserId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  if (!user || !user.sub) {
    throw new BadRequestException('لا يوجد مستخدم مسجل دخول');
  }

  return user.sub;
});