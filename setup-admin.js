// setup-admin.js
const bcrypt = require('bcrypt');
const { Client } = require('pg');
// Muat variabel environment dari file .env di root folder
require('dotenv').config();

// --- Konfigurasi Admin ---
// Ambil dari environment variable atau gunakan default (HINDARI HARDCODE PASSWORD DI SINI UNTUK PRODUKSI)
const adminEmail = process.env.ADMIN_EMAIL || 'admin@bookstore.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminP@ssw0rd!'; // Ganti dengan password kuat!
const adminFirstName = 'Admin';
const adminLastName = 'Bookstore';
const saltRounds = 10; // Samakan dengan yang digunakan di User Entity Anda jika ada
// --- Akhir Konfigurasi Admin ---

// --- Konfigurasi Database (diambil dari .env) ---
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    // Konfigurasi SSL harus sama dengan di app.module.ts
    // rejectUnauthorized: false sering dibutuhkan untuk NeonDB free tier
    rejectUnauthorized: false,
  },
};
// --- Akhir Konfigurasi Database ---

// Validasi konfigurasi DB
if (
  !dbConfig.host ||
  !dbConfig.user ||
  !dbConfig.password ||
  !dbConfig.database
) {
  console.error(
    'Error: Konfigurasi database (POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE) tidak lengkap di file .env',
  );
  process.exit(1); // Keluar jika konfigurasi tidak lengkap
}

// Fungsi utama async
async function setupAdmin() {
  const client = new Client(dbConfig); // Buat koneksi baru

  try {
    await client.connect(); // Hubungkan ke database
    console.log(`Terhubung ke database ${dbConfig.database}...`);

    // 1. Cek apakah admin dengan email ini sudah ada
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkResult = await client.query(checkQuery, [adminEmail]);

    if (checkResult.rowCount > 0) {
      console.log(
        `Admin dengan email ${adminEmail} sudah terdaftar (ID: ${checkResult.rows[0].id}). Tidak ada tindakan.`,
      );
      return; // Keluar jika sudah ada
    }

    // 2. Jika belum ada, hash password admin
    console.log(`Admin ${adminEmail} belum ada. Membuat password hash...`);
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    console.log('Password berhasil di-hash.');

    // 3. Insert data admin baru
    const insertQuery = `
      INSERT INTO users (email, password_hash, role, first_name, last_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id;
    `;
    const values = [
      adminEmail,
      hashedPassword,
      'admin', // Set role sebagai 'admin'
      adminFirstName,
      adminLastName,
    ];

    const insertResult = await client.query(insertQuery, values);
    console.log(
      `\n === Admin Berhasil Dibuat ===\n Email: ${adminEmail}\n Password: ${adminPassword} (Password asli, simpan di tempat aman!)\n ID User: ${insertResult.rows[0].id}\n ==============================\n`,
    );
  } catch (err) {
    console.error('\nTerjadi Error saat setup admin:');
    console.error('Pesan Error:', err.message);
    if (err.code) {
      console.error('Kode Error DB:', err.code); // Kode error Postgres bisa membantu debug
    }
    // console.error(err); // Uncomment untuk melihat stack trace lengkap
  } finally {
    await client.end(); // Selalu tutup koneksi
    console.log('Koneksi database ditutup.');
  }
}

// Jalankan fungsi setup
setupAdmin();
