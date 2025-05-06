import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Daftarkan User entity
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // <-- PENTING: Export UsersService agar bisa dipakai AuthModule
})
export class UsersModule {}
