// src/transactions/entities/transaction-item.entity.ts
import { Book } from '../../books/entities/book.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('transaction_items')
export class TransactionItem {
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign key ke tabel transactions
  @Column()
  transaction_id: number;

  // Foreign key ke tabel books
  @Column()
  book_id: number;

  @Column('int')
  quantity: number; // Jumlah buku yang dibeli

  // Simpan harga per item SAAT transaksi terjadi
  // Harga buku bisa berubah, jadi kita catat harga historisnya di sini
  @Column('decimal', { precision: 10, scale: 2 })
  price_per_item: number;

  // Relasi Many-to-One dengan Transaction
  @ManyToOne(() => Transaction, (transaction) => transaction.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  // Relasi Many-to-One dengan Book
  // Kita simpan relasi ke buku untuk referensi, tapi harga pakai price_per_item
  @ManyToOne(() => Book, (book) => book.transactionItems)
  @JoinColumn({ name: 'book_id' })
  book: Book; // Relasi ini opsional di-load (tidak eager by default)
}
