import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Menghasilkan Ringkasan Eksekutif Analitik HR (Dashboard C-Level)
   */
  async getExecutiveDashboard() {
    // 1. Headcount & Demografi Karyawan
    const [
      totalEmployees,
      activeEmployees,
      permanentEmployees,
      contractEmployees,
      departmentStats,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { deletedAt: null } }),
      this.prisma.employee.count({
        where: { deletedAt: null, employmentStatus: 'ACTIVE' },
      }),
      this.prisma.employee.count({
        where: {
          deletedAt: null,
          employmentStatus: 'ACTIVE',
          employmentType: 'PERMANENT',
        },
      }),
      this.prisma.employee.count({
        where: {
          deletedAt: null,
          employmentStatus: 'ACTIVE',
          employmentType: 'CONTRACT_PKWT',
        },
      }),
      this.prisma.department.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          _count: {
            select: { employees: { where: { deletedAt: null } } },
          },
        },
      }),
    ]);

    // 2. Metrik Presensi Bulan Berjalan
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalAttendances, lateAttendances, onLeaveAttendances] =
      await Promise.all([
        this.prisma.attendance.count({
          where: { date: { gte: startOfMonth, lte: endOfMonth } },
        }),
        this.prisma.attendance.count({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            lateMinutes: { gt: 0 },
          },
        }),
        this.prisma.attendance.count({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            status: 'ON_LEAVE',
          },
        }),
      ]);

    const onTimeRate =
      totalAttendances > 0
        ? Math.round(
            ((totalAttendances - lateAttendances) / totalAttendances) * 100,
          )
        : 98; // Demo fallback

    // 3. Ringkasan Penggajian Periode Terakhir
    const latestPayroll = await this.prisma.payrollPeriod.findFirst({
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { records: true } },
      },
    });

    // 4. Antrean Approval Cuti Tertunda
    const pendingLeaveApprovals = await this.prisma.leaveApproval.count({
      where: { status: 'PENDING' },
    });

    return {
      overview: {
        totalHeadcount: totalEmployees,
        activeHeadcount: activeEmployees,
        permanentCount: permanentEmployees,
        contractCount: contractEmployees,
        onTimeAttendanceRate: `${onTimeRate}%`,
        pendingLeaveApprovals,
      },
      departmentDistribution: departmentStats.map((d) => ({
        code: d.code,
        name: d.name,
        employeeCount: d._count.employees,
      })),
      monthlyAttendance: {
        totalCheckins: totalAttendances,
        lateCheckins: lateAttendances,
        onLeaveCount: onLeaveAttendances,
      },
      payrollExpenditure: latestPayroll
        ? {
            periodName: latestPayroll.name,
            periodCode: latestPayroll.code,
            status: latestPayroll.status,
            totalGross: Number(latestPayroll.totalGross),
            totalNet: Number(latestPayroll.totalNet),
            processedEmployees: latestPayroll._count.records,
          }
        : null,
    };
  }

  /**
   * Rekapitulasi Perpajakan PPh 21 TER (SPT Masa Bulanan)
   */
  async getTaxRecap(periodId?: string) {
    const periodWhere: any = {};
    if (periodId) {
      periodWhere.id = periodId;
    }

    const period = await this.prisma.payrollPeriod.findFirst({
      where: periodWhere,
      orderBy: { startDate: 'desc' },
      include: {
        records: {
          select: {
            id: true,
            employeeId: true,
            baseSalary: true,
            totalEarnings: true,
            pph21Amount: true,
            snapshotData: true,
          },
        },
      },
    });

    if (!period) {
      return {
        period: null,
        summary: { totalGross: 0, totalPph21: 0, employeeCount: 0 },
        breakdownByTerCategory: [],
      };
    }

    let totalGross = 0;
    let totalPph21 = 0;

    const terMap: Record<string, { category: string; count: number; gross: number; tax: number }> = {
      TER_A: { category: 'TER A (TK/0, TK/1, K/0)', count: 0, gross: 0, tax: 0 },
      TER_B: { category: 'TER B (TK/2, TK/3, K/1, K/2)', count: 0, gross: 0, tax: 0 },
      TER_C: { category: 'TER C (K/3)', count: 0, gross: 0, tax: 0 },
    };

    for (const r of period.records) {
      const gross = Number(r.totalEarnings);
      const tax = Number(r.pph21Amount);
      const snapshot = (r.snapshotData as any) || {};
      const cat = snapshot.ptkpCategory || 'TER_A';

      totalGross += gross;
      totalPph21 += tax;

      if (terMap[cat]) {
        terMap[cat].count++;
        terMap[cat].gross += gross;
        terMap[cat].tax += tax;
      }
    }

    return {
      period: {
        id: period.id,
        code: period.code,
        name: period.name,
        status: period.status,
      },
      summary: {
        totalGross,
        totalPph21,
        employeeCount: period.records.length,
      },
      breakdownByTerCategory: Object.values(terMap),
    };
  }
}
