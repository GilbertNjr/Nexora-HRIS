import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@ApiTags('Health & Observability')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('liveness')
  @ApiOperation({
    summary: 'Liveness Probe',
    description: 'Memeriksa apakah server runtime aplikasi aktif dan dapat melayani permintaan.',
  })
  @ApiResponse({ status: 200, description: 'Server aktif (UP)' })
  checkLiveness() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'nexora-api',
      version: '0.1.0',
    };
  }

  @Get('readiness')
  @ApiOperation({
    summary: 'Readiness Probe',
    description: 'Memeriksa kesiapan dependensi sistem (PostgreSQL / Supabase Database) sebelum menerima traffic.',
  })
  @ApiResponse({ status: 200, description: 'Seluruh dependensi siap (READY)' })
  @ApiResponse({ status: 503, description: 'Basis data atau dependensi belum siap' })
  async checkReadiness(@Res({ passthrough: true }) res: Response) {
    let dbStatus = 'UP';
    let isReady = true;

    try {
      // Simple lightweight query to check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = `DOWN: ${(error as Error).message}`;
      isReady = false;
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: isReady ? 'READY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
      },
    };
  }
}
