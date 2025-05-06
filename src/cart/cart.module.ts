// src/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module'; // <-- Impor ini sekarang seharusnya valid

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Book, User]),
    AuthModule, // Pastikan AuthModule sudah dibuat
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
