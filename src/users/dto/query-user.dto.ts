import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum'; // Impor enum

export class QueryUserDto {
  @ApiPropertyOptional({ description: 'Kata kunci pencarian untuk email' })
  @IsOptional()
  @IsString()
  search?: string; // Contoh: search by email

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Filter berdasarkan role pengguna',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Nomor halaman',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah item per halaman',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
