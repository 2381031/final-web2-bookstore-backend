import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 2,
    description: 'Jumlah baru untuk item di keranjang',
  })
  @IsNotEmpty({ message: 'Jumlah tidak boleh kosong' })
  @Type(() => Number)
  @IsInt({ message: 'Jumlah harus berupa bilangan bulat' })
  @Min(1, { message: 'Jumlah minimal adalah 1' }) // Atau Min(0) jika ingin menghapus item saat 0? (Hapus lebih baik pakai DELETE)
  quantity: number;
}
