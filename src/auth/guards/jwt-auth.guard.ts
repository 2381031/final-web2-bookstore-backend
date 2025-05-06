import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'; // Impor key untuk @Public

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Menggunakan strategi 'jwt' yang kita definisikan
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Cek apakah endpoint ditandai sebagai @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Cek di level method/handler
      context.getClass(), // Cek di level class/controller
    ]);

    // Jika public, lewati pemeriksaan JWT
    if (isPublic) {
      return true;
    }

    // Jika tidak public, lanjutkan proses validasi JWT oleh Passport Strategy
    return super.canActivate(context);
  }

  // Optional: Menangani error autentikasi secara kustom
  handleRequest(err, user, info) {
    if (err || !user) {
      // Jika ada error atau user tidak ditemukan (token tidak valid/user tidak ada)
      let message = 'Akses ditolak.';
      if (info instanceof Error) {
        message =
          info.message === 'No auth token'
            ? 'Token autentikasi tidak ditemukan.'
            : info.message === 'jwt expired'
              ? 'Token sudah kedaluwarsa.'
              : 'Token tidak valid.';
      }
      throw err || new UnauthorizedException(message);
    }
    // Jika user valid, teruskan object user ke request handler
    return user;
  }
}
