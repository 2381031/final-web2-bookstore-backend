import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
// === PERBAIKAN: Hapus .ts dari impor enum ===
import { UserRole } from '../shared/enums/user-role.enum'; // <-- Hapus .ts
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Book } from './entities/book.entity'; // Impor entitas
import { BookListResponseDto } from './dto/book-list-response.dto'; // Impor DTO response

@ApiTags('Books') // Grouping di Swagger
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // ============ ADMIN ROUTES ============

  @Post() // POST /api/books
  @Roles(UserRole.ADMIN) // Hanya ADMIN
  @UseGuards(RolesGuard) // Cek role (asumsi JwtAuthGuard sudah global)
  @ApiBearerAuth('access-token') // Butuh token admin
  @ApiOperation({ summary: 'Membuat buku baru (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Buku berhasil dibuat.',
    type: Book,
  })
  @ApiResponse({ status: 400, description: 'Input tidak valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Bukan Admin)' })
  create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto);
  }

  @Patch(':id') // PATCH /api/books/:id
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mengupdate buku berdasarkan ID (Admin)' })
  @ApiParam({ name: 'id', description: 'ID Buku', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Buku berhasil diupdate.',
    type: Book,
  })
  @ApiResponse({ status: 400, description: 'Input tidak valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  update(
    @Param('id', ParseIntPipe) id: number, // Validasi ID sebagai integer
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id') // DELETE /api/books/:id
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Menghapus buku berdasarkan ID (Admin)' })
  @ApiParam({ name: 'id', description: 'ID Buku', type: Number })
  @ApiResponse({ status: 200, description: 'Buku berhasil dihapus.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.booksService.remove(id);
  }

  // ============ PUBLIC ROUTES ============

  @Public() // Tidak perlu login
  @Get() // GET /api/books?search=...&page=...&limit=...
  @ApiOperation({
    summary: 'Mendapatkan daftar buku (Publik, dengan search & pagination)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title or author',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Daftar buku berhasil diambil.',
    type: BookListResponseDto,
  })
  findAll(@Query() queryBookDto: QueryBookDto): Promise<BookListResponseDto> {
    return this.booksService.findAll(queryBookDto);
  }

  @Public() // Tidak perlu login
  @Get(':id') // GET /api/books/:id
  @ApiOperation({ summary: 'Mendapatkan detail buku berdasarkan ID (Publik)' })
  @ApiParam({ name: 'id', description: 'ID Buku', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Detail buku berhasil diambil.',
    type: Book,
  })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return this.booksService.findOne(id);
  }
}
