import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { QueryPayrollDto } from './dto/query-payroll.dto';
import { SetSalaryStructureDto } from './dto/set-salary-structure.dto';
import { PayrollService } from './payroll.service';

@ApiTags('Payroll & Taxation (Penggajian, PPh 21 TER, & BPJS)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('periods')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Membuat Periode Penggajian Baru (Admin / HR)',
    description:
      'Membuat draf periode penggajian bulanan baru dengan mendefinisikan rentang tanggal cut-off.',
  })
  @ApiResponse({ status: 201, description: 'Periode berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Kode periode sudah pernah dibuat' })
  async createPeriod(@Body() dto: CreatePayrollPeriodDto) {
    return this.payrollService.createPeriod(dto);
  }

  @Get('periods')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({
    summary: 'Daftar Seluruh Periode Penggajian (Admin / HR)',
    description:
      'Mengambil riwayat seluruh periode penggajian lengkap dengan status dan jumlah karyawan terproses.',
  })
  @ApiResponse({ status: 200, description: 'Daftar periode berhasil diambil' })
  async getPeriods() {
    return this.payrollService.getPeriods();
  }

  @Get('periods/:id')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({
    summary: 'Detail Periode Penggajian (Admin / HR)',
    description:
      'Mengambil detail spesifik satu periode penggajian beserta ringkasan finansial gross dan net.',
  })
  @ApiResponse({ status: 200, description: 'Detail periode berhasil diambil' })
  async getPeriodById(@Param('id') periodId: string) {
    return this.payrollService.getPeriodById(periodId);
  }

  @Post('salary-structures')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Menetapkan Struktur Gaji & Tunjangan Karyawan (Admin / HR)',
    description:
      'Menyimpan atau memperbarui gaji pokok, komponen tunjangan, potongan kustom, dan status PTKP pajak.',
  })
  @ApiResponse({ status: 200, description: 'Struktur gaji berhasil disimpan' })
  async setSalaryStructure(@Body() dto: SetSalaryStructureDto) {
    return this.payrollService.setSalaryStructure(dto);
  }

  @Post('periods/:id/calculate')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eksekusi Kalkulasi Payroll Batch (Engine PPh 21 TER & BPJS)',
    description:
      'Menjalankan mesin kalkulasi penggajian otomatis: menghitung gaji prorata [REQ-DEC-08], lembur PP 35/2021 [REQ-DEC-05], tarif efektif PPh 21 TER 2024, BPJS TK & Kes, serta menyimpan snapshot data historis kebal mutasi.',
  })
  @ApiResponse({ status: 200, description: 'Batch kalkulasi berhasil diselesaikan' })
  @ApiResponse({ status: 400, description: 'Periode sudah dikunci (LOCKED) sehingga tidak boleh dikalkulasi ulang' })
  async calculatePeriod(
    @Param('id') periodId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.payrollService.calculatePeriod(periodId, userId);
  }

  @Post('periods/:id/lock')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kunci Periode Penggajian (LOCKED - Immutable) [REQ-DEC-09]',
    description:
      'Mengunci periode penggajian secara permanen. Setelah dikunci, data finansial dan presensi terkait tidak dapat dimodifikasi lagi.',
  })
  @ApiResponse({ status: 200, description: 'Periode berhasil dikunci' })
  async lockPeriod(
    @Param('id') periodId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.payrollService.lockPeriod(periodId, userId);
  }

  @Post('periods/:id/publish')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publikasikan Slip Gaji ke ESS (PUBLISHED)',
    description:
      'Merilis slip gaji sehingga karyawan dapat melihat dan mengunduh slip gaji mereka secara mandiri.',
  })
  @ApiResponse({ status: 200, description: 'Slip gaji berhasil dirilis ke ESS' })
  async publishPeriod(
    @Param('id') periodId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.payrollService.publishPeriod(periodId, userId);
  }

  @Get('periods/:id/records')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({
    summary: 'Daftar Slip Gaji Karyawan pada Suatu Periode (Admin / HR)',
    description:
      'Mengambil daftar seluruh slip gaji karyawan dalam suatu periode dengan paginasi dan filter departemen.',
  })
  @ApiResponse({ status: 200, description: 'Daftar slip gaji berhasil diambil' })
  async getPeriodRecords(
    @Param('id') periodId: string,
    @Query() query: QueryPayrollDto,
  ) {
    return this.payrollService.getPeriodRecords(periodId, query);
  }

  @Get('my-payslips')
  @ApiOperation({
    summary: 'Daftar Slip Gaji Pribadi Karyawan (ESS Portal)',
    description:
      'Mengambil riwayat slip gaji bulanan yang sudah berstatus PUBLISHED untuk karyawan yang sedang login.',
  })
  @ApiResponse({ status: 200, description: 'Riwayat slip gaji pribadi berhasil diambil' })
  async getMyPayslips(@CurrentUser('id') userId: string) {
    return this.payrollService.getMyPayslips(userId);
  }

  @Get('my-payslips/:recordId')
  @ApiOperation({
    summary: 'Rincian Detail Slip Gaji Pribadi (ESS Portal)',
    description:
      'Mengambil rincian breakdown lengkap komponen penghasilan, potongan pajak PPh 21, iuran BPJS, dan take home pay.',
  })
  @ApiResponse({ status: 200, description: 'Detail slip gaji berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Slip gaji tidak ditemukan' })
  async getMyPayslipDetail(
    @CurrentUser('id') userId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.payrollService.getMyPayslipDetail(userId, recordId);
  }
}
