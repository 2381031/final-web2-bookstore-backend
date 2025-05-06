import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../entities/transaction.entity';

// Contoh DTO untuk response riwayat transaksi
export class TransactionHistoryDto {
  @ApiProperty({
    type: [Transaction],
    description: 'Daftar transaksi pengguna',
  })
  data: Transaction[];

  // Tambahkan properti pagination jika diimplementasikan di service
  @ApiProperty({ example: 5, description: 'Total jumlah transaksi' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 1, description: 'Jumlah halaman total' })
  lastPage: number;
}
