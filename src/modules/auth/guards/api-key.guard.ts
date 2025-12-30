// ============================================
// guards/api-key.guard.ts (اختياري)
// ============================================
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    const validApiKey = process.env.API_KEY || 'your-api-key';

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('API Key غير صحيح');
    }

    return true;
  }
}