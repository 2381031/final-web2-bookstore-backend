// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
// === PERBAIKAN PATH & HAPUS .ts ===
// Pastikan folder /src/auth/interfaces/ ada dan berisi jwt-payload.interface.ts
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'Fatal Error: JWT_SECRET tidak terdefinisi di environment variables!',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const userExists = await this.usersService.findByIdMinimal(payload.sub);
    if (!userExists) {
      throw new UnauthorizedException(
        'Pengguna terkait token ini tidak lagi valid.',
      );
    }
    // Optional: Cek role jika perlu di sini juga
    // if (userExists.role !== payload.role) {
    //   throw new UnauthorizedException('Role token tidak sesuai dengan data pengguna saat ini.');
    // }
    return payload;
  }
}
