// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { CartModule } from './cart/cart.module';
import { TransactionsModule } from './transactions/transactions.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Pastikan path guard ini benar

// Import semua entitas Anda di sini
import { User } from './users/entities/user.entity';
import { Book } from './books/entities/book.entity';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { TransactionItem } from './transactions/entities/transaction-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        entities: [User, Book, Cart, CartItem, Transaction, TransactionItem], // Daftar entitas tetap sama
        ssl: {
          // Konfigurasi SSL tetap ada
          rejectUnauthorized: false,
        },
        logging: configService.get<string>('NODE_ENV') !== 'production', // Logging tetap ada

        // === PERUBAHAN DARI SYNCHRONIZE KE MIGRATIONS ===
        synchronize: false, // <-- WAJIB false saat menggunakan migrasi

        // Tentukan path ke file migrasi Anda.
        // Path ini relatif terhadap root project setelah build (biasanya folder 'dist').
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'], // <-- Sesuaikan jika struktur build berbeda
        // Atau path absolut jika perlu: migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')], (perlu impor 'join' dari 'path')

        // Apakah migrasi dijalankan otomatis saat aplikasi start?
        // false: Lebih aman, jalankan manual via CLI (npm run migration:run)
        // true: Otomatis dijalankan (biasanya hanya untuk production)
        migrationsRun: false,
        // migrationsRun: configService.get<string>('NODE_ENV') === 'production', // Opsi: Otomatis di production

        // Nama tabel di database untuk menyimpan history migrasi
        migrationsTableName: 'typeorm_migrations', // (Default: 'migrations')
        // === AKHIR PERUBAHAN ===
      }),
    }),
    // Modul-modul fitur Anda
    AuthModule,
    UsersModule,
    BooksModule,
    CartModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD, // Tetap menggunakan guard global jika diinginkan
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
