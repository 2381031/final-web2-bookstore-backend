// src/books/entities/book.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { TransactionItem } from '../../transactions/entities/transaction-item.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() // Tambahkan index untuk pencarian cepat
  @Column()
  title: string;

  @Index() // Tambahkan index untuk pencarian cepat
  @Column()
  author: string;

  @Column('decimal', { precision: 10, scale: 2 }) // Tipe data untuk harga (misal: 125000.00)
  price: number;

  @Column('int', { default: 0 }) // Stok buku, tipe integer
  stock: number;

  // Kolom opsional sesuai UI mockup:
  // @Column({ nullable: true })
  // description: string;
  // @Column({ nullable: true })
  // image_url: string; // URL atau path gambar sampul

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relasi One-to-Many dengan CartItem
  @OneToMany(() => CartItem, (cartItem) => cartItem.book)
  cartItems: CartItem[]; // Buku ini bisa ada di banyak item keranjang

  // Relasi One-to-Many dengan TransactionItem
  @OneToMany(() => TransactionItem, (transactionItem) => transactionItem.book)
  transactionItems: TransactionItem[]; // Buku ini bisa ada di banyak item transaksi
}
