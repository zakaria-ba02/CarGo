// ============================================
// decorators/auth.decorator.ts
// ============================================
import { UseGuards, applyDecorators, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guards';

// Decorator للحماية بـ JWT
export const Auth = () => applyDecorators(UseGuards(JwtAuthGuard));

// Decorator للحماية بـ JWT والأدوار
export const AuthWithRoles = (...roles: string[]) =>
  applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );