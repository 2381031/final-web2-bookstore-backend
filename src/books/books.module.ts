// src/books/books.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './entities/book.entity';
import { AuthModule } from '../auth/auth.module'; // <-- Impor ini sekarang seharusnya valid

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    AuthModule, // Pastikan AuthModule sudah dibuat
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
