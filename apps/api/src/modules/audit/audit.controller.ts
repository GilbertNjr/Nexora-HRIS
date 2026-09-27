import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditService } from './audit.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@ApiTags('Audit Trail & Compliance (ISO 27001 Tamper-Proof Logs)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'HR_ADMIN')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({
    summary: 'Daftar Log Audit Append-Only (Super Admin & HR Admin Only)',
    description:
      'Mengambil jejak audit digital seluruh peristiwa sistem (mutasi data karyawan, persetujuan cuti, payroll run, dan aktivitas otentikasi) sesuai kepatuhan ISO 27001.',
  })
  @ApiResponse({ status: 200, description: 'Log audit berhasil diambil' })
  async getLogs(@Query() query: QueryAuditLogDto) {
    return this.auditService.getLogs(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistik Keamanan & Distribusi Log Audit',
    description:
      'Mengambil metrik ringkasan jumlah log hari ini, total peristiwa per modul, dan status compliance sistem.',
  })
  @ApiResponse({ status: 200, description: 'Statistik log berhasil diambil' })
  async getStats() {
    return this.auditService.getStats();
  }

  @Get('logs/:id')
  @ApiOperation({
    summary: 'Detail Record Audit Log Terperinci',
    description:
      'Mengambil rincian JSON oldData vs newData, IP address, dan identitas pengguna pengeksekusi.',
  })
  @ApiResponse({ status: 200, description: 'Detail audit log berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Audit log tidak ditemukan' })
  async getLogById(@Param('id') id: string) {
    return this.auditService.getLogById(id);
  }
}
