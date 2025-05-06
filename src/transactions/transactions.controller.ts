import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException, // Pastikan ini sudah diimpor
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// Pastikan path ini benar sesuai struktur folder Anda
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Transaction } from './entities/transaction.entity';
import { TransactionHistoryDto } from './dto/transaction-history.dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('checkout')
  @ApiOperation({
    summary: 'Checkout keranjang belanja dan membuat transaksi baru',
  })
  @ApiResponse({ status: 201, type: Transaction })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 500 })
  checkout(@Request() req): Promise<Transaction> {
    const user = req.user as JwtPayload;
    return this.transactionsService.createTransactionFromCart(user.sub);
  }

  @Get('history')
  @ApiOperation({ summary: 'Melihat riwayat transaksi pengguna' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: TransactionHistoryDto })
  @ApiResponse({ status: 401 })
  getOrderHistory(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const user = req.user as JwtPayload;
    return this.transactionsService.getOrderHistory(user.sub, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Melihat detail satu transaksi spesifik' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 404 })
  async getTransactionDetails(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Transaction> {
    const user = req.user as JwtPayload;
    const transaction = await this.transactionsService.getTransactionDetails(
      user.sub,
      id,
    );
    if (!transaction) {
      // === PERBAIKAN SINTAKS: Hapus titik koma (;) di dalam string ===
      throw new NotFoundException(
        `Transaksi dengan ID ${id} tidak ditemukan atau Anda tidak berhak mengaksesnya.`, // <-- Hapus ; di sini
      ); // <-- Kurung tutup di sini
    }
    return transaction;
  }
}
