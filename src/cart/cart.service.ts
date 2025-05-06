import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Book } from '../books/entities/book.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { User } from '../users/entities/user.entity'; // Import User
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Book) private bookRepository: Repository<Book>,
    @InjectRepository(User) private userRepository: Repository<User>, // Inject User Repo
  ) {}

  // Helper: Mendapatkan atau membuat keranjang untuk user
  private async findOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['items', 'items.book'], // Load items dan detail bukunya
    });

    if (!cart) {
      this.logger.log(
        `Keranjang tidak ditemukan untuk user ID ${userId}, membuat baru...`,
      );
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        // Ini seharusnya tidak terjadi jika user ID valid dari token
        this.logger.error(
          `User dengan ID ${userId} tidak ditemukan saat membuat keranjang.`,
        );
        throw new InternalServerErrorException(
          'Gagal mendapatkan data pengguna.',
        );
      }
      cart = this.cartRepository.create({
        user_id: userId,
        user: user,
        items: [],
      });
      await this.cartRepository.save(cart);
      // Re-load dengan relasi setelah save
      cart = await this.cartRepository.findOne({
        where: { id: cart.id },
        relations: ['items', 'items.book'],
      });
      if (!cart)
        throw new InternalServerErrorException(
          'Gagal membuat atau memuat keranjang.',
        ); // Safety check
    }
    return cart;
  }

  // Mendapatkan isi keranjang user
  async getCart(userId: number): Promise<Cart> {
    const cart = await this.findOrCreateCart(userId);
    // Hitung total harga di sini jika perlu sebelum dikirim ke controller
    // cart.totalPrice = cart.items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
    return cart;
  }

  // Menambahkan item ke keranjang
  async addItem(userId: number, addToCartDto: AddToCartDto): Promise<CartItem> {
    const { bookId, quantity } = addToCartDto;
    const cart = await this.findOrCreateCart(userId);

    // 1. Cari buku
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException(`Buku dengan ID ${bookId} tidak ditemukan.`);
    }

    // 2. Cek stok buku
    if (book.stock < quantity) {
      throw new BadRequestException(
        `Stok buku "${book.title}" tidak mencukupi (tersedia: ${book.stock}).`,
      );
    }

    // 3. Cek apakah buku sudah ada di keranjang
    let cartItem = cart.items.find((item) => item.book_id === bookId);

    if (cartItem) {
      // Jika sudah ada, update quantity
      const newQuantity = cartItem.quantity + quantity;
      if (book.stock < newQuantity) {
        throw new BadRequestException(
          `Stok buku "${book.title}" tidak mencukupi untuk menambah ${quantity} item (total jadi ${newQuantity}, stok: ${book.stock}).`,
        );
      }
      cartItem.quantity = newQuantity;
    } else {
      // Jika belum ada, buat CartItem baru
      cartItem = this.cartItemRepository.create({
        cart_id: cart.id,
        book_id: bookId,
        quantity: quantity,
        cart: cart, // Assign relasi
        book: book, // Assign relasi
      });
      // Tambahkan item baru ke array items di cart entity untuk konsistensi (meski akan disave terpisah)
      // cart.items.push(cartItem); // Sebaiknya tidak usah, karena cartItemRepository.save sudah cukup
    }

    // 4. Simpan perubahan pada CartItem
    try {
      return await this.cartItemRepository.save(cartItem);
    } catch (error) {
      this.logger.error(
        `Gagal menyimpan item keranjang untuk user ${userId}, buku ${bookId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Gagal menambahkan item ke keranjang.',
      );
    }
  }

  // Mengupdate jumlah item di keranjang
  async updateItemQuantity(
    userId: number,
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const { quantity } = updateCartItemDto;
    const cart = await this.findOrCreateCart(userId); // Pastikan user punya cart

    // Cari CartItem berdasarkan ID DAN pastikan item itu milik cart user ini
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cart_id: cart.id },
      relations: ['book'], // Load buku untuk cek stok
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Item keranjang dengan ID ${cartItemId} tidak ditemukan di keranjang Anda.`,
      );
    }

    // Cek stok buku
    if (!cartItem.book) {
      this.logger.error(`Buku tidak ter-load untuk CartItem ID ${cartItemId}`);
      throw new InternalServerErrorException('Gagal memuat detail buku item.');
    }
    if (cartItem.book.stock < quantity) {
      throw new BadRequestException(
        `Stok buku "${cartItem.book.title}" tidak mencukupi (tersedia: ${cartItem.book.stock}).`,
      );
    }

    // Update quantity dan simpan
    cartItem.quantity = quantity;
    try {
      return await this.cartItemRepository.save(cartItem);
    } catch (error) {
      this.logger.error(
        `Gagal mengupdate kuantitas item ${cartItemId} untuk user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Gagal mengupdate item keranjang.',
      );
    }
  }

  // Menghapus item dari keranjang
  async removeItem(
    userId: number,
    cartItemId: number,
  ): Promise<{ message: string }> {
    const cart = await this.findOrCreateCart(userId); // Perlu cart ID untuk memastikan item milik user

    const result = await this.cartItemRepository.delete({
      id: cartItemId,
      cart_id: cart.id, // Pastikan hanya menghapus item dari cart user ini
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Item keranjang dengan ID ${cartItemId} tidak ditemukan di keranjang Anda.`,
      );
    }
    return {
      message: `Item keranjang dengan ID ${cartItemId} berhasil dihapus.`,
    };
  }

  // Mengosongkan keranjang user
  async clearCart(userId: number): Promise<{ message: string }> {
    const cart = await this.findOrCreateCart(userId);
    if (!cart.items || cart.items.length === 0) {
      return { message: 'Keranjang sudah kosong.' };
    }
    try {
      // Hapus semua item yang terkait dengan cart_id ini
      await this.cartItemRepository.delete({ cart_id: cart.id });
      return { message: 'Keranjang berhasil dikosongkan.' };
    } catch (error) {
      this.logger.error(
        `Gagal mengosongkan keranjang untuk user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Gagal mengosongkan keranjang.');
    }
  }
}
