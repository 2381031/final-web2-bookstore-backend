import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionItem } from './entities/transaction-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Book) private bookRepository: Repository<Book>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private dataSource: DataSource,
  ) {}

  async createTransactionFromCart(userId: number): Promise<Transaction> {
    // <-- Return type tetap Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let savedTransactionId: number | null = null; // Simpan ID untuk query ulang

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user_id: userId },
        relations: ['items', 'items.book'],
      });
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException('Keranjang Anda kosong.');
      }
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      if (!user)
        throw new InternalServerErrorException(
          'Gagal mendapatkan data pengguna.',
        );

      let totalPrice = 0;
      const transactionItems: TransactionItem[] = [];
      for (const item of cart.items) {
        const book = item.book;
        if (!book)
          throw new InternalServerErrorException(
            `Detail buku item ${item.id} tidak ada.`,
          );
        const currentBookStock = await queryRunner.manager.findOne(Book, {
          where: { id: book.id },
        });
        if (!currentBookStock)
          throw new NotFoundException(`Buku ${book.title} tidak ditemukan.`);
        if (currentBookStock.stock < item.quantity) {
          throw new BadRequestException(
            `Stok buku "${book.title}" tidak cukup.`,
          );
        }
        totalPrice += book.price * item.quantity;
        const newItem = new TransactionItem();
        newItem.book_id = item.book_id;
        newItem.quantity = item.quantity;
        newItem.price_per_item = book.price;
        newItem.book = book;
        transactionItems.push(newItem);
        await queryRunner.manager.decrement(
          Book,
          { id: book.id },
          'stock',
          item.quantity,
        );
      }

      const newTransaction = new Transaction();
      newTransaction.user_id = userId;
      newTransaction.user = user;
      newTransaction.total_price = totalPrice;
      newTransaction.items = transactionItems;
      const savedTransaction = await queryRunner.manager.save(
        Transaction,
        newTransaction,
      );
      savedTransactionId = savedTransaction.id; // <-- Simpan ID di sini
      this.logger.log(
        `Transaksi baru ID ${savedTransactionId} berhasil disimpan.`,
      );

      await queryRunner.manager.delete(CartItem, { cart_id: cart.id });
      this.logger.log(
        `Item keranjang untuk user ID ${userId} berhasil dihapus.`,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        `Transaksi checkout untuk user ID ${userId} berhasil di-commit.`,
      );

      // === PERBAIKAN: Query ulang dan cek null ===
      const finalTransaction = await this.transactionRepository.findOne({
        where: { id: savedTransactionId }, // Gunakan ID yang disimpan
        relations: ['items', 'items.book'],
      });

      if (!finalTransaction) {
        // Ini seharusnya tidak terjadi jika save berhasil, tapi untuk keamanan tipe
        this.logger.error(
          `Gagal menemukan transaksi ID ${savedTransactionId} setelah commit.`,
        );
        throw new InternalServerErrorException(
          'Gagal memuat detail transaksi setelah checkout.',
        );
      }

      return finalTransaction; // <-- Return transaksi yang sudah pasti tidak null
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Checkout Error User ${userId}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException(
        `Checkout gagal: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getOrderHistory(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.transactionRepository.findAndCount({
      where: { user_id: userId },
      relations: ['items', 'items.book'],
      order: { created_at: 'DESC' },
      skip: skip,
      take: limit,
    });
    const lastPage = Math.ceil(total / limit);
    return { data, total, page, lastPage };
  }

  async getTransactionDetails(
    userId: number,
    transactionId: number,
  ): Promise<Transaction | null> {
    // Return type ini sudah benar (memperbolehkan null)
    return this.transactionRepository.findOne({
      where: { id: transactionId, user_id: userId },
      relations: ['items', 'items.book', 'user'],
    });
  }
}
