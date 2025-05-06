// src/cart/entities/cart.entity.ts
import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign key ke tabel users
  @Column()
  user_id: number;

  // Relasi One-to-One dengan User
  @OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' }) // Jika User dihapus, Cart juga dihapus
  @JoinColumn({ name: 'user_id' }) // Menentukan kolom foreign key secara eksplisit
  user: User;

  // Relasi One-to-Many dengan CartItem
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true, // Operasi pada Cart (save, remove) akan berpengaruh ke CartItem terkait
    eager: true, // Otomatis load CartItem saat query Cart
  })
  items: CartItem[]; // Keranjang berisi banyak item
}
