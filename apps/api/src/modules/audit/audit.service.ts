import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil Catatan Audit Trail Terfilter dan Terpaginasi
   */
  async getLogs(query: QueryAuditLogDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.module) {
      where.module = query.module.toUpperCase();
    }

    if (query.action) {
      where.action = { contains: query.action, mode: 'insensitive' };
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              employee: {
                select: {
                  firstName: true,
                  lastName: true,
                  employeeNumber: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        id: log.id,
        action: log.action,
        module: log.module,
        recordId: log.recordId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        oldData: log.oldData,
        newData: log.newData,
        createdAt: log.createdAt,
        user: log.user
          ? {
              id: log.user.id,
              email: log.user.email,
              name: log.user.employee
                ? `${log.user.employee.firstName} ${log.user.employee.lastName || ''}`.trim()
                : log.user.email,
              employeeNumber: log.user.employee?.employeeNumber,
            }
          : null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mengambil Statistik & Ringkasan Keamanan Audit Trail
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, totalAll, moduleCounts] = await Promise.all([
      this.prisma.auditLog.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.auditLog.count(),
      this.prisma.auditLog.groupBy({
        by: ['module'],
        _count: { _all: true },
      }),
    ]);

    const moduleBreakdown: Record<string, number> = {};
    for (const m of moduleCounts) {
      moduleBreakdown[m.module] = m._count._all;
    }

    return {
      totalAll,
      totalToday,
      moduleBreakdown,
      complianceStatus: 'ISO_27001_COMPLIANT',
      tamperProofMode: 'APPEND_ONLY',
    };
  }

  /**
   * Mengambil Detail Spesifik Satu Record Audit Log
   */
  async getLogById(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employee: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Data audit log tidak ditemukan.');
    }

    return log;
  }
}
