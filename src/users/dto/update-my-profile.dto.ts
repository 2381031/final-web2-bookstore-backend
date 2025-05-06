// src/users/dto/update-my-profile.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEmail, IsString, MaxLength } from 'class-validator';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({ example: 'Budi', description: 'Nama depan baru' })
  @IsOptional() // Semua field opsional saat update
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Gunawan Edit',
    description: 'Nama belakang baru',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'budi.baru@test.com',
    description: 'Email baru',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  // TIDAK ADA ROLE DI SINI
  // Password biasanya diubah via endpoint terpisah
}
