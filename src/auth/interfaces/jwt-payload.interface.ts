// src/auth/interfaces/jwt-payload.interface.ts
// Hapus ekstensi .ts dan pastikan path benar
import { UserRole } from '../../shared/enums/user-role.enum';

export interface JwtPayload {
  sub: number; // Subject (User ID)
  email: string;
  role: UserRole; // Role pengguna
}
