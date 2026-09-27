import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanies() {
    return this.prisma.company.findMany({
      include: {
        _count: {
          select: {
            departments: true,
            employees: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getDepartments(companyId?: string) {
    const where = companyId ? { companyId } : {};
    return this.prisma.department.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, code: true } },
        parent: { select: { id: true, name: true } },
        _count: {
          select: {
            employees: true,
            positions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: {
        companyId_code: {
          companyId: dto.companyId,
          code: dto.code.toUpperCase(),
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Kode departemen '${dto.code}' sudah digunakan.`);
    }

    return this.prisma.department.create({
      data: {
        companyId: dto.companyId,
        code: dto.code.toUpperCase(),
        name: dto.name,
        parentId: dto.parentId || null,
      },
    });
  }

  async getDesignations(departmentId?: string) {
    const where = departmentId ? { departmentId } : {};
    return this.prisma.designation.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { employees: true } },
      },
      orderBy: { title: 'asc' },
    });
  }

  async createDesignation(dto: CreateDesignationDto) {
    const existing = await this.prisma.designation.findUnique({
      where: {
        departmentId_code: {
          departmentId: dto.departmentId,
          code: dto.code.toUpperCase(),
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Kode jabatan '${dto.code}' sudah ada di departemen ini.`);
    }

    return this.prisma.designation.create({
      data: {
        departmentId: dto.departmentId,
        code: dto.code.toUpperCase(),
        title: dto.title,
      },
    });
  }

  async getJobGrades() {
    return this.prisma.jobGrade.findMany({
      orderBy: { level: 'asc' },
    });
  }
}
