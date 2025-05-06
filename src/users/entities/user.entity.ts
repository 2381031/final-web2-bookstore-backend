// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  BeforeInsert,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cart } from '../../cart/entities/cart.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { UserRole } from '../../shared/enums/user-role.enum'; // Import sudah benar tanpa .ts

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // === PERBAIKAN: Tambahkan tipe eksplisit 'varchar' ===
  @Column({
    type: 'varchar', // <-- Tambahkan ini
    length: 50,
    nullable: true,
  })
  first_name: string | null;

  @Column({
    type: 'varchar', // <-- Tambahkan ini
    length: 50,
    nullable: true,
  })
  last_name: string | null;
  // === AKHIR PERBAIKAN ===

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true }) // Sebaiknya email juga diberi tipe eksplisit
  email: string;

  @Column({ type: 'text' }) // Beri tipe 'text' agar lebih eksplisit untuk hash
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password_hash) {
      const saltRounds = 10;
      this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
    }
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    if (!this.password_hash || !plainPassword) {
      return false;
    }
    return bcrypt.compare(plainPassword, this.password_hash);
  }
}
