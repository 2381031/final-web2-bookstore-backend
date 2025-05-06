import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer'; // Untuk konversi tipe

export class CreateBookDto {
  @ApiProperty({ example: 'Laskar Pelangi', description: 'Judul buku' })
  @IsNotEmpty({ message: 'Judul tidak boleh kosong' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Andrea Hirata', description: 'Nama penulis buku' })
  @IsNotEmpty({ message: 'Penulis tidak boleh kosong' })
  @IsString()
  author: string;

  @ApiProperty({ example: 75000.0, description: 'Harga buku', type: Number })
  @IsNotEmpty({ message: 'Harga tidak boleh kosong' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Harga harus berupa angka dengan maksimal 2 desimal' },
  )
  @Min(0, { message: 'Harga tidak boleh negatif' })
  @Type(() => Number) // Konversi string ke number jika perlu
  price: number;

  @ApiProperty({ example: 100, description: 'Jumlah stok buku', type: Number })
  @IsNotEmpty({ message: 'Stok tidak boleh kosong' })
  @IsInt({ message: 'Stok harus berupa bilangan bulat' })
  @Min(0, { message: 'Stok tidak boleh negatif' })
  @Type(() => Number) // Konversi string ke number jika perlu
  stock: number;

  // Opsional:
  // @ApiProperty({ example: 'Novel inspiratif...', description: 'Deskripsi singkat buku', required: false })
  // @IsOptional()
  // @IsString()
  // description?: string;

  // @ApiProperty({ example: 'https://example.com/image.jpg', description: 'URL gambar sampul', required: false })
  // @IsOptional()
  // @IsUrl({}, { message: 'Format URL gambar tidak valid' })
  // image_url?: string;
}
