import { PartialType } from '@nestjs/swagger'; // Bisa pakai PartialType dari swagger atau mapped-types
// import { PartialType } from '@nestjs/mapped-types'; // Alternatif
import { CreateBookDto } from './create-book.dto';

// Membuat semua properti dari CreateBookDto menjadi opsional
export class UpdateBookDto extends PartialType(CreateBookDto) {}
