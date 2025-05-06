import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../entities/book.entity'; // Impor entitas Book

export class BookListResponseDto {
  @ApiProperty({ type: [Book], description: 'Daftar buku' })
  data: Book[];

  @ApiProperty({
    example: 100,
    description: 'Total jumlah buku yang cocok dengan query',
  })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah halaman total' })
  lastPage: number;
}
