// src/transactions/entities/transaction.entity.ts
import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TransactionItem } from './transaction-item.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign key ke tabel users
  @Column()
  user_id: number;

  // Total harga transaksi saat checkout
  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;

  @CreateDateColumn()
  created_at: Date; // Waktu transaksi dibuat

  // Relasi Many-to-One dengan User
  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relasi One-to-Many dengan TransactionItem
  @OneToMany(() => TransactionItem, (item) => item.transaction, {
    cascade: true, // Simpan TransactionItem saat Transaction disimpan
    eager: true, // Otomatis load item saat query Transaction
  })
  items: TransactionItem[]; // Transaksi berisi detail item yang dibeli
}
