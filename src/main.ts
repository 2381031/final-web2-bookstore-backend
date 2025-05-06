// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Mengambil PORT dari environment variable, default 3001
  const port = configService.get<number>('PORT', 3001);

  // Menambahkan prefix global '/api' untuk semua rute
  app.setGlobalPrefix('api');

  // Mengaktifkan CORS (Cross-Origin Resource Sharing)
  // Sesuaikan origin saat deploy ke production
  app.enableCors({
    origin: '*', // Izinkan semua origin (untuk development), ganti dengan URL frontend di Vercel saat production
    // origin: ['http://localhost:3000', 'https://frontend-vercel-url.com'], // Contoh production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Mengaktifkan validasi input global menggunakan class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hanya properti yang ada di DTO yang akan diterima
      transform: true, // Otomatis transformasi tipe data (misal: string dari query param ke number)
      forbidNonWhitelisted: true, // Menolak request jika ada properti tak dikenal
      transformOptions: {
        enableImplicitConversion: true, // Membantu konversi tipe otomatis
      },
    }),
  );

  // Konfigurasi Swagger (OpenAPI Documentation)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bookstore API')
    .setDescription('Dokumentasi API untuk Aplikasi Toko Buku Online')
    .setVersion('1.0')
    .addBearerAuth(
      // Konfigurasi autentikasi Bearer (JWT)
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Masukkan token JWT',
        in: 'header',
      },
      'access-token', // Nama referensi untuk skema keamanan ini
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Menyajikan UI Swagger di endpoint /api
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Menyimpan otorisasi Bearer token di UI Swagger
    },
  });

  await app.listen(port);
  logger.log(`Aplikasi berjalan di: ${await app.getUrl()}`);
  logger.log(`Swagger UI tersedia di: ${await app.getUrl()}/api`);
}
bootstrap();
