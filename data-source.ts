// data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Load environment variables dari .env
ConfigModule.forRoot({
  envFilePath: '.env',
});

const configService = new ConfigService();

// Validasi variabel environment yang penting
const requiredEnvVars = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
];
requiredEnvVars.forEach((envVar) => {
  if (!configService.get<string>(envVar)) {
    throw new Error(`Environment variable ${envVar} belum diatur!`);
  }
});

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST'),
  port: configService.get<number>('POSTGRES_PORT'),
  username: configService.get<string>('POSTGRES_USER'),
  password: configService.get<string>('POSTGRES_PASSWORD'),
  database: configService.get<string>('POSTGRES_DATABASE'),
  ssl: {
    // Pastikan SSL konsisten dengan app.module.ts
    rejectUnauthorized: false,
  },
  // Tentukan path ke entitas Anda (relatif terhadap root proyek saat pakai ts-node)
  // atau relatif terhadap folder 'dist' jika dijalankan setelah build
  entities: ['src/**/*.entity{.ts,.js}'], // <-- Path untuk ts-node / development
  // entities: ['dist/**/*.entity{.js}'], // <-- Path jika dijalankan dari JS hasil build
  // Tentukan path ke file migrasi Anda
  migrations: ['src/database/migrations/*{.ts,.js}'], // <-- Path untuk ts-node / development
  // migrations: ['dist/database/migrations/*{.js}'], // <-- Path jika dijalankan dari JS hasil build
  migrationsTableName: 'typeorm_migrations', // Nama tabel untuk mencatat migrasi (opsional, default: migrations)
  synchronize: false, // <--- PENTING: Migrasi menggantikan synchronize
  logging: true, // Tetap aktifkan logging untuk CLI jika perlu
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
