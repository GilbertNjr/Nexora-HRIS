import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { ActionLeaveApprovalDto } from './dto/action-leave-approval.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveService } from './leave.service';

@ApiTags('Leave Management (Manajemen Cuti & Izin Multi-Tier)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('types')
  @ApiOperation({
    summary: 'Master Jenis Cuti & Kebijakan Dokumen',
    description:
      'Mengambil katalog master jenis cuti (Tahunan, Sakit, Melahirkan, Cuti Khusus) beserta kuota default dan aturan bukti dokumen.',
  })
  @ApiResponse({ status: 200, description: 'Daftar jenis cuti berhasil diambil' })
  async getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Pengajuan Cuti / Izin Baru (ESS Portal)',
    description:
      'Mengajukan cuti dengan validasi saldo kuota, toleransi backdated izin sakit maksimal H+2 [REQ-DEC-06], dan penentuan otomatis alur 1-tier vs 2-tier approval [REQ-DEC-07].',
  })
  @ApiResponse({ status: 201, description: 'Permohonan cuti berhasil diajukan' })
  @ApiResponse({ status: 400, description: 'Saldo tidak cukup atau dokumen wajib belum dilampirkan' })
  async createRequest(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.leaveService.createRequest(userId, dto);
  }

  @Post('requests/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pembatalan Permohonan Cuti (ESS Portal)',
    description:
      'Membatalkan permohonan cuti yang masih berstatus PENDING dan secara atomik mengembalikan reservasi pending_days ke kuota saldo.',
  })
  @ApiResponse({ status: 200, description: 'Permohonan cuti berhasil dibatalkan' })
  @ApiResponse({ status: 409, description: 'Permohonan cuti sudah diproses sehingga tidak bisa dibatalkan sepihak' })
  async cancelRequest(
    @CurrentUser('id') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.leaveService.cancelRequest(userId, requestId);
  }

  @Get('my-requests')
  @ApiOperation({
    summary: 'Riwayat Pengajuan Cuti Pribadi (ESS Portal)',
    description:
      'Mengambil seluruh daftar permohonan cuti karyawan saat ini lengkap dengan status alur approval atasan.',
  })
  @ApiResponse({ status: 200, description: 'Riwayat cuti berhasil diambil' })
  async getMyRequests(@CurrentUser('id') userId: string) {
    return this.leaveService.getMyRequests(userId);
  }

  @Get('my-balances')
  @ApiOperation({
    summary: 'Saldo Kuota Cuti Karyawan Tahun Berjalan (ESS Portal)',
    description:
      'Mengambil informasi kuota total, hari yang sudah terpakai, hari yang sedang diajukan (pending), dan sisa hak cuti.',
  })
  @ApiResponse({ status: 200, description: 'Saldo kuota cuti berhasil diambil' })
  async getMyBalances(@CurrentUser('id') userId: string) {
    return this.leaveService.getMyBalances(userId);
  }

  @Get('pending-approvals')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'DEPARTMENT_HEAD', 'LINE_MANAGER')
  @ApiOperation({
    summary: 'Daftar Pengajuan Cuti Menunggu Persetujuan (Manager & HR)',
    description:
      'Mengambil daftar pengajuan cuti bawahan (untuk Manager) atau seluruh antrean perusahaan (untuk HR/Super Admin).',
  })
  @ApiResponse({ status: 200, description: 'Daftar pending approvals berhasil diambil' })
  async getPendingApprovals(@CurrentUser('id') userId: string) {
    return this.leaveService.getPendingApprovals(userId);
  }

  @Post('approvals/:id/action')
  @HttpCode(HttpStatus.OK)
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'DEPARTMENT_HEAD', 'LINE_MANAGER')
  @ApiOperation({
    summary: 'Aksi Persetujuan / Penolakan Cuti (Manager & HR)',
    description:
      'Menyetujui atau menolak cuti. Jika disetujui pada level final, kuota saldo dipotong secara permanen dan status absensi kalender otomatis ditandai ON_LEAVE.',
  })
  @ApiResponse({ status: 200, description: 'Keputusan cuti berhasil disimpan' })
  @ApiResponse({ status: 403, description: 'Bukan atasan penilai yang berwenang' })
  async actionApproval(
    @CurrentUser('id') userId: string,
    @Param('id') approvalId: string,
    @Body() dto: ActionLeaveApprovalDto,
  ) {
    return this.leaveService.actionApproval(userId, approvalId, dto);
  }
}
