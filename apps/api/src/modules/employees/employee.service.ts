import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil daftar karyawan dengan pagination, pencarian, dan filter
   */
  async findAll(query: QueryEmployeeDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.status) {
      where.employmentStatus = query.status;
    }

    if (query.employmentType) {
      where.employmentType = query.employmentType;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { employeeNumber: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [total, rawEmployees] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
        },
        include: {
          user: { select: { email: true, status: true, lastLoginAt: true } },
          department: { select: { id: true, name: true, code: true } },
          designation: { select: { id: true, title: true, code: true } },
          jobGrade: { select: { level: true, name: true } },
          manager: {
            select: { id: true, firstName: true, lastName: true, employeeNumber: true },
          },
        },
      }),
    ]);

    const items = rawEmployees.map((emp) => ({
      id: emp.id,
      employeeNumber: emp.employeeNumber,
      fullName: `${emp.firstName} ${emp.lastName || ''}`.trim(),
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.user?.email || null,
      phone: emp.phone,
      department: emp.department?.name,
      departmentId: emp.departmentId,
      designation: emp.designation?.title,
      designationId: emp.designationId,
      jobGrade: emp.jobGrade?.name,
      employmentType: emp.employmentType,
      employmentStatus: emp.employmentStatus,
      joinDate: emp.joinDate,
      managerName: emp.manager
        ? `${emp.manager.firstName} ${emp.manager.lastName || ''}`.trim()
        : null,
      createdAt: emp.createdAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Detail satu karyawan berdasarkan ID
   */
  async findById(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            lastLoginAt: true,
            userRoles: { include: { role: true } },
          },
        },
        company: true,
        department: true,
        designation: true,
        jobGrade: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            designation: { select: { title: true } },
          },
        },
        subordinates: {
          where: { deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            designation: { select: { title: true } },
          },
        },
        bankAccount: true,
      },
    });

    if (!emp || emp.deletedAt) {
      throw new NotFoundException(`Karyawan dengan ID '${id}' tidak ditemukan`);
    }

    // Mask nomor rekening bank untuk privasi
    let maskedBank = null;
    if (emp.bankAccount) {
      const plainAcc = this.decryptText(emp.bankAccount.accountNumberEnc);
      const masked =
        plainAcc.length > 4
          ? '*'.repeat(plainAcc.length - 4) + plainAcc.slice(-4)
          : '****';
      maskedBank = {
        bankName: emp.bankAccount.bankName,
        accountNumberMasked: masked,
        accountHolder: this.decryptText(emp.bankAccount.accountHolderEnc),
      };
    }

    return {
      id: emp.id,
      employeeNumber: emp.employeeNumber,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName || ''}`.trim(),
      email: emp.user?.email || null,
      phone: emp.phone,
      company: emp.company,
      department: emp.department,
      designation: emp.designation,
      jobGrade: emp.jobGrade,
      employmentType: emp.employmentType,
      employmentStatus: emp.employmentStatus,
      joinDate: emp.joinDate,
      endDate: emp.endDate,
      manager: emp.manager,
      subordinates: emp.subordinates,
      bankAccount: maskedBank,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
    };
  }

  /**
   * Membuat profil karyawan baru sekaligus akun login user bawaan
   */
  async create(dto: CreateEmployeeDto, creatorUserId?: string) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Cek apakah email sudah dipakai
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException(`Email '${dto.email}' sudah terdaftar dalam sistem`);
    }

    // 2. Generate Nomor Induk Karyawan (NIK) Otomatis: NX-YYYY-XXXX
    const year = new Date(dto.joinDate).getFullYear() || new Date().getFullYear();
    const countThisYear = await this.prisma.employee.count();
    const sequence = String(countThisYear + 1).padStart(4, '0');
    const employeeNumber = `NX-${year}-${sequence}`;

    // 3. Hash password bawaan karyawan (Default: NexoraEmp2026!)
    const salt = await bcrypt.genSalt(12);
    const defaultPasswordHash = await bcrypt.hash('NexoraEmp2026!', salt);

    // 4. Cari role EMPLOYEE
    const empRole = await this.prisma.role.findUnique({
      where: { name: 'EMPLOYEE' },
    });

    // 5. Enkripsi data rekening bank (jika ada)
    let bankAccountCreate: any = undefined;
    if (dto.bankName && dto.accountNumber) {
      bankAccountCreate = {
        bankName: dto.bankName,
        accountNumberEnc: this.encryptText(dto.accountNumber),
        accountHolderEnc: this.encryptText(dto.accountHolder || dto.firstName),
      };
    }

    // 6. Jalankan Transaksi Database (ACID)
    const newEmployee = await this.prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: defaultPasswordHash,
          userRoles: {
            create: {
              roleId: empRole!.id,
            },
          },
        },
      });

      // Create Employee
      const emp = await tx.employee.create({
        data: {
          userId: user.id,
          employeeNumber,
          firstName: dto.firstName,
          lastName: dto.lastName || null,
          phone: dto.phone || null,
          companyId: dto.companyId,
          departmentId: dto.departmentId,
          designationId: dto.designationId,
          jobGradeId: dto.jobGradeId || null,
          managerId: dto.managerId || null,
          employmentType: dto.employmentType,
          joinDate: new Date(dto.joinDate),
          bankAccount: bankAccountCreate ? { create: bankAccountCreate } : undefined,
        },
        include: {
          department: true,
          designation: true,
        },
      });

      // Berikan kuota saldo cuti tahunan otomatis (12 hari)
      const annualLeaveType = await tx.leaveType.findUnique({
        where: { code: 'ANNUAL' },
      });
      if (annualLeaveType) {
        await tx.leaveBalance.create({
          data: {
            employeeId: emp.id,
            leaveTypeId: annualLeaveType.id,
            year: new Date().getFullYear(),
            totalDays: 12,
            usedDays: 0,
            pendingDays: 0,
          },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: creatorUserId || null,
          module: 'EMPLOYEE',
          action: 'EMPLOYEE_CREATED',
          recordId: emp.id,
          ipAddress: '127.0.0.1',
          newData: {
            employeeNumber,
            fullName: `${dto.firstName} ${dto.lastName || ''}`.trim(),
            department: emp.department.name,
            designation: emp.designation.title,
          },
        },
      });

      return emp;
    });

    return {
      message: 'Karyawan berhasil didaftarkan.',
      employee: {
        id: newEmployee.id,
        employeeNumber: newEmployee.employeeNumber,
        fullName: `${newEmployee.firstName} ${newEmployee.lastName || ''}`.trim(),
        email: normalizedEmail,
        department: newEmployee.department.name,
        designation: newEmployee.designation.title,
        defaultPasswordNote: 'Kata sandi awal pengguna adalah: NexoraEmp2026!',
      },
    };
  }

  /**
   * Memperbarui profil karyawan
   */
  async update(id: string, dto: UpdateEmployeeDto, updaterUserId?: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: { bankAccount: true },
    });

    if (!emp || emp.deletedAt) {
      throw new NotFoundException(`Karyawan dengan ID '${id}' tidak ditemukan`);
    }

    // Pengecekan Kebijakan Cut-off Bank [REQ-DEC-03]: Batas tanggal 20 pukul 23:59 WIB
    let bankWarning: string | null = null;
    if (dto.accountNumber || dto.bankName) {
      const today = new Date().getDate();
      if (today > 20) {
        bankWarning =
          'Perubahan nomor rekening setelah tanggal cut-off (20) akan berlaku efektif pada periode payroll bulan berikutnya sesuai kebijakan [REQ-DEC-03].';
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Update employee fields
      const updatedEmp = await tx.employee.update({
        where: { id },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          departmentId: dto.departmentId,
          designationId: dto.designationId,
          jobGradeId: dto.jobGradeId,
          managerId: dto.managerId,
          employmentType: dto.employmentType,
          employmentStatus: dto.employmentStatus,
          joinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
        },
      });

      // Update bank account if provided
      if (dto.bankName && dto.accountNumber) {
        await tx.employeeBankAccount.upsert({
          where: { employeeId: id },
          create: {
            employeeId: id,
            bankName: dto.bankName,
            accountNumberEnc: this.encryptText(dto.accountNumber),
            accountHolderEnc: this.encryptText(dto.accountHolder || dto.firstName || emp.firstName),
          },
          update: {
            bankName: dto.bankName,
            accountNumberEnc: this.encryptText(dto.accountNumber),
            accountHolderEnc: dto.accountHolder
              ? this.encryptText(dto.accountHolder)
              : undefined,
          },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: updaterUserId || null,
          module: 'EMPLOYEE',
          action: 'EMPLOYEE_UPDATED',
          recordId: id,
          ipAddress: '127.0.0.1',
          oldData: { status: emp.employmentStatus },
          newData: { status: dto.employmentStatus, bankWarning },
        },
      });

      return updatedEmp;
    });

    return {
      message: 'Data karyawan berhasil diperbarui.',
      bankWarning,
      employee: updated,
    };
  }

  /**
   * Menghapus karyawan (Soft Delete)
   */
  async delete(id: string, deleterUserId?: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!emp || emp.deletedAt) {
      throw new NotFoundException(`Karyawan dengan ID '${id}' tidak ditemukan`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Soft-delete employee
      await tx.employee.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          employmentStatus: 'TERMINATED',
        },
      });

      // Nonaktifkan user account
      if (emp.userId) {
        await tx.user.update({
          where: { id: emp.userId },
          data: {
            status: 'INACTIVE',
            deletedAt: new Date(),
          },
        });
      }

      // Log audit
      await tx.auditLog.create({
        data: {
          userId: deleterUserId || null,
          module: 'EMPLOYEE',
          action: 'EMPLOYEE_DELETED',
          recordId: id,
          ipAddress: '127.0.0.1',
        },
      });
    });

    return { message: `Karyawan ${emp.employeeNumber} berhasil dinonaktifkan.` };
  }

  /**
   * Ringkasan analitik personalia (Headcount metrics)
   */
  async getMetrics() {
    const [total, active, probation, contract, intern, departments] =
      await Promise.all([
        this.prisma.employee.count({ where: { deletedAt: null } }),
        this.prisma.employee.count({
          where: { deletedAt: null, employmentStatus: 'ACTIVE' },
        }),
        this.prisma.employee.count({
          where: { deletedAt: null, employmentType: 'PROBATION' },
        }),
        this.prisma.employee.count({
          where: { deletedAt: null, employmentType: 'CONTRACT_PKWT' },
        }),
        this.prisma.employee.count({
          where: { deletedAt: null, employmentType: 'INTERNSHIP' },
        }),
        this.prisma.department.findMany({
          select: {
            name: true,
            _count: {
              select: {
                employees: { where: { deletedAt: null } },
              },
            },
          },
        }),
      ]);

    return {
      totalEmployees: total,
      activeEmployees: active,
      probationEmployees: probation,
      contractEmployees: contract,
      internEmployees: intern,
      departmentDistribution: departments.map((d) => ({
        department: d.name,
        count: d._count.employees,
      })),
    };
  }

  // --- Encryption Helpers (AES-256) ---
  private encryptText(plainText: string): string {
    const key = Buffer.from(
      '01234567890123456789012345678901', // 32 bytes
    );
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decryptText(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) return encryptedText;
      const iv = Buffer.from(parts[0], 'hex');
      const key = Buffer.from('01234567890123456789012345678901');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(parts[1], 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return '****';
    }
  }
}
