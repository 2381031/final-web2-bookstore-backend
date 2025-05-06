// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule karena AuthService membutuhkannya
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity'; // Import User entity jika AuthService atau Strategy memerlukannya langsung
// Import Guards jika perlu di provide di sini, tapi biasanya sudah global atau di controller
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule, // AuthService butuh UsersService
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // JwtModule perlu akses ke ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME', '1d'), // Ambil dari .env atau default 1 hari
        },
      }),
    }),
    TypeOrmModule.forFeature([User]), // Jika service/strategy butuh User Repository
    ConfigModule, // Pastikan ConfigModule tersedia jika belum global
  ],
  controllers: [AuthController], // Pastikan Anda sudah membuat AuthController
  providers: [
    AuthService, // Pastikan Anda sudah membuat AuthService
    JwtStrategy, // Daftarkan JwtStrategy agar bisa digunakan PassportModule
    // JwtAuthGuard, // Tidak perlu provide di sini jika sudah jadi APP_GUARD global
    // RolesGuard,   // Biasanya tidak perlu provide di sini, cukup di UseGuards() controller
  ],
  exports: [AuthService, JwtModule, PassportModule], // Export jika dibutuhkan modul lain
})
export class AuthModule {}
