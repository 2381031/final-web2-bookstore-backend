// src/auth/dto/register-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class RegisterUserDto {
  // === TAMBAHKAN Field Nama ===
  @ApiProperty({
    example: 'Budi',
    description: 'Nama depan pengguna',
    required: true,
  }) // Buat required true jika wajib
  @IsNotEmpty({ message: 'Nama depan tidak boleh kosong' })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    example: 'Santoso',
    description: 'Nama belakang pengguna',
    required: true,
  })
  @IsNotEmpty({ message: 'Nama belakang tidak boleh kosong' })
  @IsString()
  @MaxLength(50)
  lastName: string;
  // === AKHIR PENAMBAHAN ===

  @ApiProperty({
    example: 'user@example.com',
    description: 'Alamat email unik pengguna',
  })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Kata sandi pengguna (minimal 6 karakter)',
  })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(6, { message: 'Password minimal harus 6 karakter' })
  password: string;
}
