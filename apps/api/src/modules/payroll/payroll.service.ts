import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ComponentType, PayrollStatus } from '../../common/enums';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { QueryPayrollDto } from './dto/query-payroll.dto';
import { SetSalaryStructureDto } from './dto/set-salary-structure.dto';
import {
  calculateBpjs,
  calculateOvertimePay,
  calculatePph21Ter,
  calculateProratedSalary,
  determineTerCategory,
} from './engine/pph21-ter.calculator';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Membuat Periode Penggajian Baru (Draft)
   */
  async createPeriod(dto: CreatePayrollPeriodDto) {
    const existing = await this.prisma.payrollPeriod.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Periode penggajian dengan kode '${dto.code}' sudah pernah dibuat.`,
      );
    }

    const period = await this.prisma.payrollPeriod.create({
      data: {
        code: dto.code,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: PayrollStatus.DRAFT as any,
      },
    });

    return {
      message: 'Periode penggajian berhasil dibuat dengan status DRAFT.',
      period,
    };
  }

  /**
   * Mengambil Seluruh Daftar Periode Penggajian
   */
  async getPeriods() {
    return this.prisma.payrollPeriod.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { records: true },
        },
      },
    });
  }

  /**
   * Mengambil Detail Periode Penggajian beserta Ringkasan Finansial
   */
  async getPeriodById(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: {
        _count: {
          select: { records: true },
        },
      },
    });

    if (!period) {
      throw new NotFoundException('Periode penggajian tidak ditemukan.');
    }

    return period;
  }

  /**
   * Menetapkan / Memperbarui Struktur Gaji Karyawan
   */
  async setSalaryStructure(dto: SetSalaryStructureDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      include: { department: true, designation: true },
    });

    if (!employee || employee.deletedAt) {
      throw new NotFoundException('Karyawan aktif tidak ditemukan.');
    }

    const structure = await this.prisma.employeeSalaryStructure.upsert({
      where: { employeeId: dto.employeeId },
      create: {
        employeeId: dto.employeeId,
        baseSalary: dto.baseSalary,
        allowances: (dto.allowances || []) as any,
        deductions: (dto.deductions || []) as any,
      },
      update: {
        baseSalary: dto.baseSalary,
        allowances: (dto.allowances || []) as any,
        deductions: (dto.deductions || []) as any,
      },
    });

    return {
      message: `Struktur gaji untuk karyawan ${employee.firstName} ${employee.lastName || ''} berhasil diperbarui.`,
      structure,
    };
  }

  /**
   * Menjalankan Batch Kalkulasi Payroll untuk Satu Periode
   * Mengimplementasikan:
   * - Validasi Immutability Periode LOCKED [REQ-DEC-09]
   * - Prorata Hari Kerja Riil Kalender [REQ-DEC-08]
   * - Formula Lembur Depnaker RI PP 35/2021 [REQ-DEC-05]
   * - Formula Pajak PPh 21 TER 2024 (PP 58/2023)
   * - BPJS Ketenagakerjaan & BPJS Kesehatan
   * - Snapshot Data Historis Karyawan yang Kebal Mutasi
   */
  async calculatePeriod(periodId: string, executorUserId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException('Periode penggajian tidak ditemukan.');
    }

    // 1. Verifikasi Status Immutability [REQ-DEC-09]
    if (
      period.status === (PayrollStatus.LOCKED as any) ||
      period.status === (PayrollStatus.PUBLISHED as any)
    ) {
      throw new BadRequestException(
        'PAYROLL_PERIOD_LOCKED: Periode penggajian telah dikunci. Modifikasi data finansial dan kehadiran dilarang sesuai ketetapan [REQ-DEC-09].',
      );
    }

    // Update status ke CALCULATING
    await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: PayrollStatus.CALCULATING as any },
    });

    // Ambil seluruh karyawan aktif yang memiliki struktur gaji
    const employees = await this.prisma.employee.findMany({
      where: {
        deletedAt: null,
        employmentStatus: 'ACTIVE' as any,
        salaryStructure: { isNot: null },
      },
      include: {
        department: true,
        designation: true,
        salaryStructure: true,
        bankAccount: true,
        attendances: {
          where: {
            date: {
              gte: period.startDate,
              lte: period.endDate,
            },
          },
        },
      },
    });

    let periodGrossTotal = 0;
    let periodNetTotal = 0;
    let processedEmployees = 0;

    // Hitung hari kerja resmi bulan ini (default 22 hari kerja)
    const officialWorkingDays = 22;

    await this.prisma.$transaction(async (tx) => {
      // Hapus kalkulasi sebelumnya pada periode ini jika ada (Idempotency)
      await tx.payrollRecord.deleteMany({
        where: { periodId },
      });

      for (const emp of employees) {
        const salaryStructure = emp.salaryStructure!;
        const baseSalary = Number(salaryStructure.baseSalary);
        const allowances = (salaryStructure.allowances as any[]) || [];
        const customDeductions = (salaryStructure.deductions as any[]) || [];

        // 2. Cek Prorata jika join date berada di bulan berjalan [REQ-DEC-08]
        let effectiveBaseSalary = baseSalary;
        if (
          emp.joinDate >= period.startDate &&
          emp.joinDate <= period.endDate
        ) {
          // Hitung hari kerja riil sejak tanggal masuk hingga akhir periode
          const remainingDays = Math.ceil(
            (period.endDate.getTime() - emp.joinDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          const actualDays = Math.min(officialWorkingDays, remainingDays);
          effectiveBaseSalary = calculateProratedSalary(
            baseSalary,
            actualDays,
            officialWorkingDays,
          );
        }

        // 3. Hitung Total Tunjangan (Allowances)
        let totalAllowances = 0;
        const payrollItemsToCreate: any[] = [];

        payrollItemsToCreate.push({
          code: 'BASIC_SALARY',
          name: 'Gaji Pokok',
          type: ComponentType.EARNING as any,
          amount: effectiveBaseSalary,
        });

        for (const item of allowances) {
          const amt = Number(item.amount) || 0;
          totalAllowances += amt;
          payrollItemsToCreate.push({
            code: item.code || 'ALLOWANCE',
            name: item.name || 'Tunjangan',
            type: ComponentType.EARNING as any,
            amount: amt,
          });
        }

        // 4. Hitung Lembur (Overtime) Berdasarkan Jam Kehadiran Melebihi 9 Jam Kerja [REQ-DEC-05]
        const overtimeHours = emp.attendances.reduce((acc, att) => {
          if (att.clockInTime && att.clockOutTime) {
            const workHours =
              (new Date(att.clockOutTime).getTime() -
                new Date(att.clockInTime).getTime()) /
              (1000 * 60 * 60);
            if (workHours > 9) {
              return acc + (workHours - 9);
            }
          }
          return acc;
        }, 0);

        const overtimePay = calculateOvertimePay(baseSalary, overtimeHours);
        if (overtimePay > 0) {
          payrollItemsToCreate.push({
            code: 'OVERTIME',
            name: `Upah Lembur (${overtimeHours.toFixed(1)} Jam)`,
            type: ComponentType.EARNING as any,
            amount: overtimePay,
          });
        }

        // Total Penghasilan Bruto (Gross Earnings)
        const totalEarnings = effectiveBaseSalary + totalAllowances + overtimePay;

        // 5. Hitung Pajak PPh 21 TER 2024 (PP 58/2023)
        // Standar PTKP default: TK/0 -> TER A
        const terCategory = determineTerCategory('TK/0');
        const taxResult = calculatePph21Ter(totalEarnings, terCategory);
        const pph21Amount = taxResult.taxAmount;

        payrollItemsToCreate.push({
          code: 'PPH21_TER',
          name: `Pajak PPh 21 (${taxResult.category} - ${taxResult.ratePercentage})`,
          type: ComponentType.DEDUCTION as any,
          amount: pph21Amount,
        });

        // 6. Hitung Iuran BPJS Ketenagakerjaan & BPJS Kesehatan
        const bpjs = calculateBpjs(baseSalary);
        const bpjsTkEmp = bpjs.employeeDeductions.totalTk;
        const bpjsKesEmp = bpjs.employeeDeductions.bpjsKes;

        payrollItemsToCreate.push({
          code: 'BPJS_TK_JHT',
          name: 'BPJS Ketenagakerjaan - JHT (2%)',
          type: ComponentType.DEDUCTION as any,
          amount: bpjs.employeeDeductions.jht,
        });

        payrollItemsToCreate.push({
          code: 'BPJS_TK_JP',
          name: 'BPJS Ketenagakerjaan - JP (1%)',
          type: ComponentType.DEDUCTION as any,
          amount: bpjs.employeeDeductions.jp,
        });

        payrollItemsToCreate.push({
          code: 'BPJS_KES',
          name: 'BPJS Kesehatan (1%)',
          type: ComponentType.DEDUCTION as any,
          amount: bpjsKesEmp,
        });

        // 7. Hitung Potongan Keterlambatan Absensi jika ada
        const totalLateMinutes = emp.attendances.reduce((acc, att) => {
          return acc + (att.lateMinutes || 0);
        }, 0);

        let lateDeduction = 0;
        if (totalLateMinutes > 60) {
          // Penalti keterlambatan jika di atas 60 menit kumulatif per bulan (Rp 1.000 / menit)
          lateDeduction = Math.round((totalLateMinutes - 60) * 1000);
          payrollItemsToCreate.push({
            code: 'LATE_PENALTY',
            name: `Potongan Keterlambatan (${totalLateMinutes} Menit)`,
            type: ComponentType.DEDUCTION as any,
            amount: lateDeduction,
          });
        }

        // Potongan Kustom Lainnya
        let totalCustomDeductions = 0;
        for (const item of customDeductions) {
          const amt = Number(item.amount) || 0;
          totalCustomDeductions += amt;
          payrollItemsToCreate.push({
            code: item.code || 'DEDUCTION',
            name: item.name || 'Potongan Lain',
            type: ComponentType.DEDUCTION as any,
            amount: amt,
          });
        }

        // Total Potongan (Total Deductions)
        const totalDeduction =
          pph21Amount +
          bpjsTkEmp +
          bpjsKesEmp +
          lateDeduction +
          totalCustomDeductions;

        // Penghasilan Bersih (Take Home Pay)
        const takeHomePay = Math.max(0, totalEarnings - totalDeduction);

        // 8. Snapshot Data Historis Karyawan (Kekebalan Mutasi Jabatan)
        const snapshotData = {
          employeeNumber: emp.employeeNumber,
          fullName: `${emp.firstName} ${emp.lastName || ''}`.trim(),
          departmentName: emp.department.name,
          departmentCode: emp.department.code,
          designationTitle: emp.designation.title,
          bankName: emp.bankAccount?.bankName || 'BCA',
          accountNumberMasked: emp.bankAccount ? '••••••••' : null,
          ptkpCategory: terCategory,
          taxRateApplied: taxResult.ratePercentage,
          calculationDate: new Date().toISOString(),
        };

        // Buat Catatan PayrollRecord
        const record = await tx.payrollRecord.create({
          data: {
            periodId,
            employeeId: emp.id,
            baseSalary: effectiveBaseSalary,
            totalEarnings,
            totalDeduction,
            takeHomePay,
            pph21Amount,
            bpjsTkEmp,
            bpjsKesEmp,
            snapshotData,
            pdfUrl: `/api/v1/payroll/records/${period.id}/${emp.id}/payslip.pdf`,
          },
        });

        // Masukkan rincian item slip gaji
        for (const item of payrollItemsToCreate) {
          await tx.payrollItem.create({
            data: {
              recordId: record.id,
              code: item.code,
              name: item.name,
              type: item.type,
              amount: item.amount,
            },
          });
        }

        periodGrossTotal += totalEarnings;
        periodNetTotal += takeHomePay;
        processedEmployees++;
      }

      // Update Periode ke VERIFIED dengan total finansial baru
      await tx.payrollPeriod.update({
        where: { id: periodId },
        data: {
          status: PayrollStatus.VERIFIED as any,
          totalGross: periodGrossTotal,
          totalNet: periodNetTotal,
        },
      });

      // Catat Audit Trail Log
      await tx.auditLog.create({
        data: {
          userId: executorUserId,
          module: 'PAYROLL',
          action: 'PAYROLL_BATCH_CALCULATED',
          recordId: periodId,
          ipAddress: '127.0.0.1',
          newData: {
            periodCode: period.code,
            processedEmployees,
            totalGross: periodGrossTotal,
            totalNet: periodNetTotal,
          },
        },
      });
    });

    return {
      message: `Kalkulasi payroll periode ${period.name} berhasil diselesaikan. Total ${processedEmployees} karyawan diproses.`,
      periodId,
      processedEmployees,
      totalGross: periodGrossTotal,
      totalNet: periodNetTotal,
    };
  }

  /**
   * Mengunci Periode Payroll (LOCKED - Immutable) [REQ-DEC-09]
   */
  async lockPeriod(periodId: string, executorUserId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException('Periode penggajian tidak ditemukan.');
    }

    if (period.status === (PayrollStatus.LOCKED as any)) {
      throw new ConflictException('Periode penggajian sudah berstatus LOCKED.');
    }

    const updated = await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.LOCKED as any,
        lockedAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: executorUserId,
        module: 'PAYROLL',
        action: 'PAYROLL_PERIOD_LOCKED',
        recordId: periodId,
        ipAddress: '127.0.0.1',
      },
    });

    return {
      message: `Periode ${period.name} berhasil DIKUNCI (LOCKED). Data finansial dan kehadiran resmi bersifat kekal (immutable).`,
      period: updated,
    };
  }

  /**
   * Mempublikasikan Slip Gaji ke Portal ESS Karyawan (PUBLISHED)
   */
  async publishPeriod(periodId: string, executorUserId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException('Periode penggajian tidak ditemukan.');
    }

    const updated = await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: {
        status: PayrollStatus.PUBLISHED as any,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: executorUserId,
        module: 'PAYROLL',
        action: 'PAYROLL_PERIOD_PUBLISHED',
        recordId: periodId,
        ipAddress: '127.0.0.1',
      },
    });

    return {
      message: `Slip gaji periode ${period.name} berhasil DIPUBLIKASIKAN ke seluruh portal ESS karyawan.`,
      period: updated,
    };
  }

  /**
   * Mengambil Rincian Record Penggajian dalam Satu Periode (Admin)
   */
  async getPeriodRecords(periodId: string, query: QueryPayrollDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { periodId };

    if (query.departmentId) {
      where.employee = { departmentId: query.departmentId };
    }

    const [data, total] = await Promise.all([
      this.prisma.payrollRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { takeHomePay: 'desc' },
        include: {
          employee: {
            include: { department: true, designation: true },
          },
          items: true,
        },
      }),
      this.prisma.payrollRecord.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mengambil Riwayat Slip Gaji Pribadi Karyawan (ESS Portal)
   */
  async getMyPayslips(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee || employee.deletedAt) {
      throw new NotFoundException('Data profil karyawan tidak ditemukan.');
    }

    return this.prisma.payrollRecord.findMany({
      where: {
        employeeId: employee.id,
        period: {
          status: PayrollStatus.PUBLISHED as any,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        period: true,
      },
    });
  }

  /**
   * Mengambil Rincian Detail Slip Gaji Pribadi Lengkap dengan Komponen Item (ESS Portal)
   */
  async getMyPayslipDetail(userId: string, recordId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee || employee.deletedAt) {
      throw new NotFoundException('Data profil karyawan tidak ditemukan.');
    }

    const record = await this.prisma.payrollRecord.findUnique({
      where: { id: recordId },
      include: {
        period: true,
        items: true,
      },
    });

    if (!record || record.employeeId !== employee.id) {
      throw new NotFoundException('Dokumen slip gaji tidak ditemukan.');
    }

    return record;
  }
}
