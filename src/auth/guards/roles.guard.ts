// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException, // Impor jika ingin digunakan
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
// Hapus ekstensi .ts dan pastikan path benar
import { UserRole } from '../../shared/enums/user-role.enum';
// Hapus ekstensi .ts dan pastikan nama folder benar (interfaces)
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload; // Ambil payload dari request.user

    if (!user || !user.role) {
      // Pertimbangkan UnauthorizedException jika masalahnya lebih ke token/payload tidak valid
      // throw new UnauthorizedException('Payload pengguna tidak valid atau tidak lengkap.');
      throw new ForbiddenException('Tidak dapat memverifikasi role pengguna.');
    }

    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Akses ditolak. Membutuhkan role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
