import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';

@ApiTags('Employees (Master Data Karyawan)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'HR_STAFF', 'MANAGER')
  @ApiOperation({
    summary: 'Daftar Karyawan (Tabel Terpaginasi & Pencarian)',
    description:
      'Mengambil daftar seluruh karyawan dengan dukungan pagination, pencarian nama/NIK/telepon, dan filter departemen/status.',
  })
  @ApiResponse({ status: 200, description: 'Daftar karyawan berhasil diambil' })
  async findAll(@Query() query: QueryEmployeeDto) {
    return this.employeeService.findAll(query);
  }

  @Get('metrics')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Metrik Ringkasan Personalia (Headcount Overview)',
    description:
      'Menampilkan total karyawan, jumlah aktif, masa percobaan (probation), kontrak PKWT, dan distribusi departemen.',
  })
  @ApiResponse({ status: 200, description: 'Metrik personalia berhasil diambil' })
  async getMetrics() {
    return this.employeeService.getMetrics();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'HR_STAFF', 'MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Detail Profil Karyawan Berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Profil karyawan ditemukan' })
  @ApiResponse({ status: 404, description: 'Karyawan tidak ditemukan' })
  async findById(@Param('id') id: string) {
    return this.employeeService.findById(id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({
    summary: 'Daftarkan Karyawan Baru',
    description:
      'Membuat profil karyawan baru, otomatis membuat akun login ESS, memberikan kuota cuti tahunan awal, dan mengenkripsi data bank.',
  })
  @ApiResponse({ status: 201, description: 'Karyawan berhasil didaftarkan' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  async create(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser('id') creatorUserId: string,
  ) {
    return this.employeeService.create(dto, creatorUserId);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({
    summary: 'Perbarui Data Karyawan',
    description:
      'Memperbarui data karyawan dengan validasi batas tanggal cut-off perubahan rekening [REQ-DEC-03].',
  })
  @ApiResponse({ status: 200, description: 'Data karyawan berhasil diperbarui' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser('id') updaterUserId: string,
  ) {
    return this.employeeService.update(id, dto, updaterUserId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({
    summary: 'Nonaktifkan Karyawan (Soft Delete)',
    description:
      'Menonaktifkan karyawan dan akun pengguna terkait tanpa menghapus riwayat transaksional historis.',
  })
  @ApiResponse({ status: 200, description: 'Karyawan berhasil dinonaktifkan' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') deleterUserId: string,
  ) {
    return this.employeeService.delete(id, deleterUserId);
  }
}
