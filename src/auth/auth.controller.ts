// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto'; // Pastikan DTO diimpor
import { LoginUserDto } from './dto/login-user.dto'; // Pastikan DTO diimpor
import { LoginResponseDto } from './dto/login-response.dto'; // Pastikan DTO diimpor

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register pengguna baru' })
  @ApiBody({ type: RegisterUserDto }) // Definisikan body untuk Swagger
  @ApiResponse({ status: 201, description: 'Registrasi berhasil.' })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<{ message: string }> {
    // <-- Gunakan DTO
    // Panggil service register yang sudah diimplementasi
    return this.authService.register(registerUserDto); // <-- Panggil dengan DTO
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login pengguna' })
  @ApiBody({ type: LoginUserDto }) // Definisikan body untuk Swagger
  @ApiResponse({ status: 200, type: LoginResponseDto }) // Definisikan response
  @ApiResponse({ status: 401, description: 'Email atau password salah.' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    // <-- Gunakan DTO
    // Panggil service login yang sudah diimplementasi
    return this.authService.login(loginUserDto); // <-- Panggil dengan DTO
  }
}
