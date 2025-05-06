import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { TransactionItem } from './entities/transaction-item.entity';
import { Cart } from '../cart/entities/cart.entity'; // Import entitas yg dibutuhkan service
import { CartItem } from '../cart/entities/cart-item.entity'; // Import entitas yg dibutuhkan service
import { Book } from '../books/entities/book.entity'; // Import entitas yg dibutuhkan service
import { User } from '../users/entities/user.entity'; // Import entitas yg dibutuhkan service
import { AuthModule } from '../auth/auth.module';
// import { CartModule } from '../cart/cart.module'; // Bisa import module jika ingin inject service-nya

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionItem,
      Cart, // Repo Cart dibutuhkan service
      CartItem, // Repo CartItem dibutuhkan service
      Book, // Repo Book dibutuhkan service
      User, // Repo User dibutuhkan service
    ]),
    AuthModule,
    // CartModule, // Uncomment jika ingin inject CartService
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  // Export tidak perlu jika tidak ada modul lain yang pakai service ini
})
export class TransactionsModule {}
