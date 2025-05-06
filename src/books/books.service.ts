import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm'; // Import ILike untuk search case-insensitive
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import { BookListResponseDto } from './dto/book-list-response.dto'; // Impor DTO response

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  // Membuat buku baru (Admin)
  async create(createBookDto: CreateBookDto): Promise<Book> {
    const newBook = this.booksRepository.create(createBookDto);
    return this.booksRepository.save(newBook);
  }

  // Mendapatkan semua buku dengan filter, search, dan pagination (Public)
  async findAll(queryDto: QueryBookDto): Promise<BookListResponseDto> {
    const { search, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.booksRepository.createQueryBuilder('book');

    // Tambahkan kondisi search jika ada
    if (search) {
      queryBuilder.where(
        // Cari di title ATAU author (case-insensitive)
        '(LOWER(book.title) LIKE LOWER(:search) OR LOWER(book.author) LIKE LOWER(:search))',
        { search: `%${search}%` }, // Gunakan % untuk wildcard search
      );
    }

    // Hitung total item sebelum pagination
    const total = await queryBuilder.getCount();

    // Terapkan pagination
    queryBuilder.skip((page - 1) * limit).take(limit);
    // Tambahkan sorting jika perlu (misal berdasarkan judul)
    queryBuilder.orderBy('book.title', 'ASC');

    const data = await queryBuilder.getMany();
    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      lastPage,
    };
  }

  // Mendapatkan detail satu buku berdasarkan ID (Public)
  async findOne(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Buku dengan ID ${id} tidak ditemukan`);
    }
    return book;
  }

  // Mengupdate buku berdasarkan ID (Admin)
  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    // Cek dulu apakah buku ada, load data lama
    const book = await this.findOne(id); // findOne sudah handle NotFoundException

    // Gabungkan data lama dengan data baru dari DTO
    this.booksRepository.merge(book, updateBookDto);

    // Simpan perubahan
    return this.booksRepository.save(book);

    // Alternatif (lebih simpel tapi tidak mengembalikan entity yang diupdate):
    // const result = await this.booksRepository.update(id, updateBookDto);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Buku dengan ID ${id} tidak ditemukan`);
    // }
    // return this.findOne(id); // Query lagi untuk mendapatkan data terbaru
  }

  // Menghapus buku berdasarkan ID (Admin)
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.booksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Buku dengan ID ${id} tidak ditemukan`);
    }
    return { message: `Buku dengan ID ${id} berhasil dihapus` };
  }
}
