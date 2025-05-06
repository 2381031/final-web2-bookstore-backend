// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator'; // Pastikan path ini benar
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Impor Swagger

@ApiTags('App') // Tag untuk Swagger
@Controller() // Controller tanpa prefix (akan mengikuti prefix global '/api')
export class AppController {
  // Pastikan nama class adalah AppController dan diekspor
  constructor(private readonly appService: AppService) {}

  @Public() // Endpoint ini publik, tidak perlu login
  @Get() // Menangani request GET ke /api/
  @ApiOperation({ summary: 'Endpoint dasar aplikasi' })
  @ApiResponse({ status: 200, description: 'Mengembalikan pesan sambutan.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
