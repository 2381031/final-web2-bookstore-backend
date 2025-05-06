// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import * as bcrypt from 'bcrypt';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { UserRole } from '../shared/enums/user-role.enum'; // Impor UserRole jika belum
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

// DTO Internal untuk representasi User tanpa password dan method internal
type SafeUser = Omit<
  User,
  'password_hash' | 'comparePassword' | 'hashPassword' | 'cart' | 'transactions'
>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  

  // === Fungsi yang Sudah Ada ===
  async create(registerUserDto: RegisterUserDto): Promise<SafeUser> {
    // Kembalikan SafeUser
    const existingUser = await this.findByEmail(registerUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar.');
    }
    const newUser = this.usersRepository.create({
      email: registerUserDto.email,
      password_hash: registerUserDto.password, // Akan di-hash oleh @BeforeInsert
      first_name: registerUserDto.firstName, // Simpan nama
      last_name: registerUserDto.lastName, // Simpan nama
    });
    const savedUser = await this.usersRepository.save(newUser);
    // Gunakan destructuring untuk menghapus password hash
    const { password_hash, ...result } = savedUser;
    return result as SafeUser; // Cast ke SafeUser
  }

  // findByEmail tetap mengembalikan User lengkap karena dibutuhkan untuk comparePassword di AuthService
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // findById untuk profil, kembalikan SafeUser
  async findById(id: number): Promise<SafeUser | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'role',
        'created_at',
        'updated_at',
        'first_name',
        'last_name',
      ], // Pilih kolom aman + nama
    });
    return user as SafeUser | null; // Casting
  }

  async findByIdMinimal(
    id: number,
  ): Promise<Pick<User, 'id' | 'email' | 'role'> | null> {
    return this.usersRepository.findOne({
      select: ['id', 'email', 'role'],
      where: { id },
    });
  }

  // ==============================
  // === Fungsi Baru untuk Admin ===
  // ==============================

  async findAllUsers(queryDto: QueryUserDto): Promise<UserListResponseDto> {
    const { search, role, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};
    if (search) {
      where.email = ILike(`%${search}%`);
    }
    if (role) {
      where.role = role;
    }

    const [data, total] = await this.usersRepository.findAndCount({
      where,
      skip: skip,
      take: limit,
      order: { created_at: 'DESC' },
      select: [
        'id',
        'email',
        'role',
        'created_at',
        'updated_at',
        'first_name',
        'last_name',
      ], // Pilih kolom aman + nama
    });
    const lastPage = Math.ceil(total / limit);
    // Pastikan data sesuai dengan UserAdminView DTO di controller (sudah cocok dengan select)
    return { data: data as any[], total, page, lastPage };
  }

  async findUserByIdAdmin(id: number): Promise<SafeUser | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'role',
        'created_at',
        'updated_at',
        'first_name',
        'last_name',
      ], // Pilih kolom aman + nama
    });
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan.`);
    }
    return user as SafeUser | null; // Casting
  }

  async updateUserByAdmin(
    id: number,
    updateUserDto: UpdateUserAdminDto,
  ): Promise<SafeUser> {
    // Kembalikan SafeUser
    const user = await this.usersRepository.findOneBy({ id }); // Cari user dulu (perlu entitas lengkap untuk merge/save)
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan.`);
    }

    // Cek duplikat email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `Email "${updateUserDto.email}" sudah digunakan oleh user lain.`,
        );
      }
    }

    // Gabungkan data lama dengan data baru
    this.usersRepository.merge(user, updateUserDto);

    // Simpan perubahan
    const savedUser = await this.usersRepository.save(user);

    // Gunakan destructuring untuk menghapus password hash
    const { password_hash, ...result } = savedUser;
    return result as SafeUser; // Kembalikan user tanpa password hash
  }

  async deleteUserByAdmin(id: number): Promise<{ message: string }> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan.`);
    }
    return { message: `User dengan ID ${id} berhasil dihapus.` };
  }
}
