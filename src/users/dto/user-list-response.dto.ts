import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity'; // Impor entitas User

// Kita bisa buat DTO spesifik agar tidak mengembalikan password hash
class UserAdminView {
  @ApiProperty() id: number;
  @ApiProperty() email: string;
  @ApiProperty() role: string; // UserRole
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserAdminView], description: 'Daftar pengguna' })
  data: UserAdminView[];

  @ApiProperty({ example: 50, description: 'Total jumlah pengguna' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 5, description: 'Jumlah halaman total' })
  lastPage: number;
}
