// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
// Hapus ekstensi .ts dan pastikan path benar
import { UserRole } from '../../shared/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
