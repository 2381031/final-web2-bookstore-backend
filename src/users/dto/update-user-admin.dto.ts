import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum';

export class UpdateUserAdminDto {
  @ApiPropertyOptional({
    example: 'new.user@example.com',
    description: 'Email baru pengguna',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Role baru pengguna' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role tidak valid' })
  role?: UserRole;

  // Opsional: Admin bisa reset password? (Perlu implementasi khusus)
  // @ApiPropertyOptional({ example: 'newStrongPass123', description: 'Password baru (jika ingin direset)' })
  // @IsOptional()
  // @IsString()
  // @MinLength(6)
  // password?: string;

  // Tambahkan field lain yang boleh diedit admin (misal: nama jika ada)
  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // name?: string;
}
