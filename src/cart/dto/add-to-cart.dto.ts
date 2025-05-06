import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID buku yang ingin ditambahkan' })
  @IsNotEmpty({ message: 'ID Buku tidak boleh kosong' })
  @Type(() => Number)
  @IsInt({ message: 'ID Buku harus berupa bilangan bulat' })
  bookId: number;

  @ApiProperty({
    example: 1,
    description: 'Jumlah buku yang ingin ditambahkan',
    default: 1,
  })
  @IsNotEmpty({ message: 'Jumlah tidak boleh kosong' })
  @Type(() => Number)
  @IsInt({ message: 'Jumlah harus berupa bilangan bulat' })
  @Min(1, { message: 'Jumlah minimal adalah 1' })
  quantity: number = 1;
}
