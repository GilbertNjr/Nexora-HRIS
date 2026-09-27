import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AttendanceService } from './attendance.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';

@ApiTags('Attendance & Shifts (Presensi Geofencing & Shift)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Presensi Masuk (Clock-In) dengan GPS Geofencing',
    description:
      'Mencatat kehadiran masuk karyawan dengan validasi radius kantor (maks 100 meter dari HQ) menggunakan formula Haversine dan perhitungan otomatis keterlambatan menit.',
  })
  @ApiResponse({ status: 200, description: 'Clock-In berhasil dicatat' })
  @ApiResponse({ status: 400, description: 'Di luar radius geofence kantor' })
  @ApiResponse({ status: 409, description: 'Sudah melakukan Clock-In hari ini' })
  async clockIn(
    @CurrentUser('id') userId: string,
    @Body() dto: ClockInDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    return this.attendanceService.clockIn(userId, dto, ipAddress);
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Presensi Pulang (Clock-Out)',
    description:
      'Mencatat jam pulang karyawan dan menghitung apakah pulang lebih awal (early leave) dibandingkan jam selesai shift.',
  })
  @ApiResponse({ status: 200, description: 'Clock-Out berhasil dicatat' })
  @ApiResponse({ status: 400, description: 'Belum melakukan Clock-In hari ini' })
  @ApiResponse({ status: 409, description: 'Sudah melakukan Clock-Out hari ini' })
  async clockOut(
    @CurrentUser('id') userId: string,
    @Body() dto: ClockOutDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    return this.attendanceService.clockOut(userId, dto, ipAddress);
  }

  @Get('today')
  @ApiOperation({
    summary: 'Status Kehadiran Hari Ini (ESS Portal)',
    description:
      'Mengambil status apakah karyawan yang login sudah Clock-In/Clock-Out hari ini serta informasi koordinat kantor.',
  })
  async getTodayStatus(@CurrentUser('id') userId: string) {
    return this.attendanceService.getTodayStatus(userId);
  }

  @Get('my-history')
  @ApiOperation({
    summary: 'Riwayat Presensi Mandiri (ESS Portal)',
    description: 'Mengambil riwayat presensi pribadi karyawan untuk 30 hari terakhir.',
  })
  async getMyHistory(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.attendanceService.getMyHistory(userId, limit ? Number(limit) : 30);
  }

  @Get('recap')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Rekapitulasi Presensi (Admin Monitoring & Rekap Bulanan)',
    description:
      'Mengambil daftar seluruh presensi karyawan dengan filter rentang tanggal, departemen, dan status kehadiran.',
  })
  async getRecap(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.getRecap(query);
  }

  @Get('shifts')
  @ApiOperation({ summary: 'Daftar Master Shift Kerja' })
  async getShifts() {
    return this.attendanceService.getShifts();
  }

  @Post('shifts')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Tambah Shift Kerja Baru (Admin)' })
  async createShift(@Body() dto: CreateShiftDto) {
    return this.attendanceService.createShift(dto);
  }
}
