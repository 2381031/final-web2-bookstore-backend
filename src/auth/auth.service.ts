// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto'; // Impor jika belum
import { User } from '../users/entities/user.entity'; // Impor User
import { LoginResponseDto } from './dto/login-response.dto'; // Impor DTO Response Login
import { UnauthorizedException } from '@nestjs/common'; // Impor UnauthorizedException
import { JwtPayload } from './interfaces/jwt-payload.interface'; // Impor JwtPayload

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // === IMPLEMENTASI REGISTER ===
  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ message: string }> {
    const { email, password } = registerUserDto;

    // 1. Cek apakah email sudah ada
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Registrasi gagal: Email ${email} sudah terdaftar.`);
      throw new ConflictException('Email sudah terdaftar');
    }

    // 2. Buat user baru melalui UsersService
    try {
      // UsersService.create akan menghandle hashing password via Entity Listener
      await this.usersService.create(registerUserDto);
      this.logger.log(`User ${email} berhasil diregistrasi.`);
      return { message: 'Registrasi berhasil!' }; // Atau tidak return apa-apa (void)
    } catch (error) {
      this.logger.error(
        `Gagal menyimpan user ${email}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat registrasi.',
      );
    }
  }

  // === IMPLEMENTASI LOGIN ===
  async login(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const { email, password } = loginUserDto;
    const user = await this.usersService.findByEmail(email);

    // Validasi user dan password
    if (user && (await user.comparePassword(password))) {
      // Jika valid, buat payload untuk JWT
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role, // Sertakan role dalam payload
      };

      // Generate token
      const accessToken = await this.jwtService.signAsync(payload);
      this.logger.log(`User ${email} berhasil login.`);
      return { access_token: accessToken };
    } else {
      this.logger.warn(`Login gagal untuk email: ${email}`);
      throw new UnauthorizedException('Email atau password salah.');
    }
  }

  // (Fungsi validateUser bisa dihapus jika logika validasi langsung di login)
  // async validateUser(email: string, pass: string): Promise<any> { ... }
}
