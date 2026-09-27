import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports & Executive Analytics (Laporan Eksekutif & Perpajakan)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'HR_ADMIN')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('executive-dashboard')
  @ApiOperation({
    summary: 'Dashboard Metrik Eksekutif HR (Headcount, Presensi, Payroll)',
    description:
      'Menampilkan agregasi metrik kunci seluruh perusahaan: jumlah karyawan aktif, tingkat ketepatan waktu kehadiran, beban payroll bulanan, dan antrean approval.',
  })
  @ApiResponse({ status: 200, description: 'Metrik eksekutif berhasil diambil' })
  async getExecutiveDashboard() {
    return this.reportsService.getExecutiveDashboard();
  }

  @Get('tax-recap')
  @ApiOperation({
    summary: 'Rekapitulasi SPT Masa Pajak PPh 21 TER (DJP Compliance)',
    description:
      'Menghasilkan rekapitulasi pelaporan pajak penghasilan bulanan yang dikelompokkan berdasarkan kategori TER A, TER B, dan TER C.',
  })
  @ApiQuery({ name: 'periodId', required: false, description: 'UUID Periode Penggajian' })
  @ApiResponse({ status: 200, description: 'Rekapitulasi pajak berhasil diambil' })
  async getTaxRecap(@Query('periodId') periodId?: string) {
    return this.reportsService.getTaxRecap(periodId);
  }
}
