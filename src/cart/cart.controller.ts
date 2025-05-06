import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiProperty, // Pastikan ApiProperty diimpor
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Pastikan path ini benar sesuai struktur folder Anda
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

// --- DTO Response untuk Cart ---
// (Jika belum ada di file terpisah, definisikan di sini atau impor)
export class CartResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() user_id: number;
  @ApiProperty({ type: () => [CartItem] }) items: CartItem[];
  @ApiProperty({ description: 'Total harga semua item di keranjang' })
  totalPrice: number;
}
// --- Akhir DTO Response ---

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan isi keranjang pengguna saat ini' })
  // === PERBAIKAN: Gunakan DTO Response di Swagger dan Return Type ===
  @ApiResponse({ status: 200, type: CartResponseDto }) // <-- Ganti type
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCart(@Request() req): Promise<CartResponseDto> {
    // <-- Ganti return type
    const user = req.user as JwtPayload;
    const cart = await this.cartService.getCart(user.sub);

    const totalPrice = cart.items.reduce((sum, item) => {
      const price = item.book?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);

    // === PERBAIKAN: Buat dan return objek DTO ===
    const response: CartResponseDto = {
      id: cart.id,
      user_id: cart.user_id,
      items: cart.items,
      totalPrice: totalPrice,
    };
    return response;
  }

  @Post('add')
  @ApiOperation({ summary: 'Menambahkan item ke keranjang' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, type: CartItem })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 404 })
  addItem(
    @Request() req,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<CartItem> {
    const user = req.user as JwtPayload;
    return this.cartService.addItem(user.sub, addToCartDto);
  }

  @Patch('item/:itemId')
  @ApiOperation({ summary: 'Mengupdate jumlah item spesifik di keranjang' })
  @ApiParam({ name: 'itemId', type: Number })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, type: CartItem })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 404 })
  updateItemQuantity(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const user = req.user as JwtPayload;
    return this.cartService.updateItemQuantity(
      user.sub,
      itemId,
      updateCartItemDto,
    );
  }

  @Delete('item/:itemId')
  @ApiOperation({ summary: 'Menghapus item spesifik dari keranjang' })
  @ApiParam({ name: 'itemId', type: Number })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 404 })
  removeItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<{ message: string }> {
    const user = req.user as JwtPayload;
    return this.cartService.removeItem(user.sub, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Mengosongkan seluruh keranjang pengguna' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  clearCart(@Request() req): Promise<{ message: string }> {
    const user = req.user as JwtPayload;
    return this.cartService.clearCart(user.sub);
  }
}
