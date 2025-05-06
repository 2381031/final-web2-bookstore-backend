import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
// Decorator untuk menandai endpoint yang tidak memerlukan autentikasi JWT
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
