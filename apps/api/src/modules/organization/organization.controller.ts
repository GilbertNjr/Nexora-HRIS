import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Organization & Departments (Struktur Organisasi)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get('companies')
  @ApiOperation({ summary: 'Daftar Perusahaan Terdaftar' })
  async getCompanies() {
    return this.orgService.getCompanies();
  }

  @Get('departments')
  @ApiOperation({ summary: 'Daftar Departemen & Hierarki' })
  @ApiQuery({ name: 'companyId', required: false })
  async getDepartments(@Query('companyId') companyId?: string) {
    return this.orgService.getDepartments(companyId);
  }

  @Post('departments')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Tambah Departemen Baru (HR Admin / Super Admin)' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.orgService.createDepartment(dto);
  }

  @Get('designations')
  @ApiOperation({ summary: 'Daftar Gelar Jabatan (Designations)' })
  @ApiQuery({ name: 'departmentId', required: false })
  async getDesignations(@Query('departmentId') departmentId?: string) {
    return this.orgService.getDesignations(departmentId);
  }

  @Post('designations')
  @Roles('SUPER_ADMIN', 'HR_ADMIN')
  @ApiOperation({ summary: 'Tambah Jabatan Baru (HR Admin / Super Admin)' })
  async createDesignation(@Body() dto: CreateDesignationDto) {
    return this.orgService.createDesignation(dto);
  }

  @Get('job-grades')
  @ApiOperation({ summary: 'Daftar Golongan Gaji / Level Karir (Job Grades)' })
  async getJobGrades() {
    return this.orgService.getJobGrades();
  }
}
