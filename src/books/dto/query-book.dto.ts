import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class QueryBookDto {
  @ApiPropertyOptional({
    description: 'Kata kunci pencarian untuk judul atau penulis',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Nomor halaman (mulai dari 1)',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Halaman harus berupa bilangan bulat' })
  @Min(1, { message: 'Halaman minimal adalah 1' })
  page?: number = 1; // Default value

  @ApiPropertyOptional({
    description: 'Jumlah item per halaman',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit harus berupa bilangan bulat' })
  @Min(1, { message: 'Limit minimal adalah 1' })
  limit?: number = 10; // Default value
}
