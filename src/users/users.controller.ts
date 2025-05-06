// src/users/users.controller.ts
import {
  Controller,
  Get,
  Request,
  UseGuards,
  NotFoundException,
  Query,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiProperty, // Pastikan ApiProperty diimpor
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'; // Pastikan path ini benar
// Kita tidak perlu impor 'User' dari entity di sini jika hanya menggunakan DTO/SafeUser
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../shared/enums/user-role.enum'; // Pastikan path ini benar
import { RolesGuard } from '../auth/guards/roles.guard';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';

// DTO untuk response profil (tidak termasuk password)
class UserProfileResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() email: string;
  @ApiProperty({ nullable: true }) // Tandai nullable jika di entity juga nullable
  first_name: string | null;
  @ApiProperty({ nullable: true })
  last_name: string | null;
  @ApiProperty({ enum: UserRole }) // Beri tahu Swagger ini enum
  role: UserRole; // Gunakan tipe enum UserRole
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

// DTO response admin bisa mewarisi atau sama
class AdminUserProfileResponseDto extends UserProfileResponseDto {}

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // === Endpoint untuk User Biasa (Profil Sendiri) ===
  @Get('me')
  @ApiOperation({ summary: 'Mendapatkan profil pengguna yang sedang login' })
  @ApiResponse({
    status: 200,
    description: 'Profil pengguna berhasil diambil.',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req): Promise<UserProfileResponseDto> {
    const userPayload = req.user as JwtPayload;
    // Panggil service findById yang sudah mengembalikan data aman (SafeUser)
    const userProfile = await this.usersService.findById(userPayload.sub);
    if (!userProfile) {
      throw new NotFoundException('User tidak ditemukan.');
    }
    // Langsung return karena sudah SafeUser, cast ke DTO
    return userProfile as UserProfileResponseDto;
  }

  // ==============================
  // === Endpoint Khusus Admin ===
  // ==============================

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary:
      'ADMIN: Mendapatkan daftar semua pengguna (dengan filter & pagination)',
  })
  @ApiQuery({ type: QueryUserDto })
  @ApiResponse({
    status: 200,
    description: 'Daftar pengguna berhasil diambil.',
    type: UserListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Bukan Admin)' })
  findAllUsers(
    @Query() queryUserDto: QueryUserDto,
  ): Promise<UserListResponseDto> {
    return this.usersService.findAllUsers(queryUserDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'ADMIN: Mendapatkan detail satu pengguna berdasarkan ID',
  })
  @ApiParam({ name: 'id', description: 'ID Pengguna', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Detail pengguna berhasil diambil.',
    type: AdminUserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  async findUserByIdAdmin(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminUserProfileResponseDto> {
    const user = await this.usersService.findUserByIdAdmin(id);
    // Service sudah handle not found
    // Service mengembalikan SafeUser, yang cocok dengan DTO
    return user as AdminUserProfileResponseDto;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'ADMIN: Mengupdate data pengguna berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID Pengguna', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Data pengguna berhasil diupdate.',
    type: AdminUserProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Input tidak valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Konflik (misal: email sudah ada)' })
  async updateUserByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserAdminDto,
  ): Promise<AdminUserProfileResponseDto> {
    const updatedUser = await this.usersService.updateUserByAdmin(
      id,
      updateUserDto,
    );
    // Service mengembalikan SafeUser, yang cocok dengan DTO
    return updatedUser as AdminUserProfileResponseDto;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'ADMIN: Menghapus pengguna berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID Pengguna', type: Number })
  @ApiResponse({ status: 200, description: 'Pengguna berhasil dihapus.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  deleteUserByAdmin(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.usersService.deleteUserByAdmin(id);
  }
}
