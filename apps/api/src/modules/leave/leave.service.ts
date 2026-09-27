import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalStatus,
  AttendanceStatus,
  LeaveStatus,
} from '../../common/enums';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ActionLeaveApprovalDto } from './dto/action-leave-approval.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { QueryLeaveDto } from './dto/query-leave.dto';

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengajukan Permohonan Cuti Baru (ESS Portal)
   */
  async createRequest(userId: string, dto: CreateLeaveRequestDto) {
    const employee = await this.getEmployeeByUserId(userId);
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const today = new Date();

    if (endDate < startDate) {
      throw new BadRequestException(
        'Tanggal selesai cuti tidak boleh lebih awal dari tanggal mulai cuti.',
      );
    }

    // 1. Validasi Master Jenis Cuti
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: dto.leaveTypeId },
    });
    if (!leaveType) {
      throw new NotFoundException('Jenis cuti yang dipilih tidak valid.');
    }

    // 2. Validasi Cuti Lampau (Backdated Request) & Dokumen Bukti Sakit [REQ-DEC-06]
    if (leaveType.requiresDocument) {
      if (!dto.documentUrl) {
        throw new BadRequestException(
          `Untuk jenis cuti '${leaveType.name}', Anda wajib melampirkan foto Surat Keterangan Dokter atau dokumen pendukung.`,
        );
      }

      // Hitung selisih hari jika tanggal mulai di masa lalu
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 2) {
        throw new BadRequestException(
          'Pengajuan izin sakit di masa lampau melebihi batas maksimal toleransi H+2 hari kerja sesuai kebijakan perusahaan [REQ-DEC-06].',
        );
      }
    }

    // 3. Pengecekan Kuota Saldo Cuti
    const currentYear = startDate.getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
        },
      },
    });

    if (balance) {
      const totalDays = Number(balance.totalDays);
      const usedDays = Number(balance.usedDays);
      const pendingDays = Number(balance.pendingDays);
      const availableDays = totalDays - usedDays - pendingDays;

      if (availableDays < dto.totalDays) {
        throw new BadRequestException(
          `Sisa kuota saldo cuti '${leaveType.name}' Anda tidak mencukupi. Kuota tersedia: ${availableDays} hari (Permohonan Anda: ${dto.totalDays} hari).`,
        );
      }
    }

    // 4. Penentuan Tingkat Persetujuan [REQ-DEC-07]
    // Cuti tahunan <= 2 hari cukup 1 level (Line Manager). Cuti > 2 hari butuh 2 level (Manager + HR).
    const requiresTwoTiers =
      dto.totalDays > 2 || leaveType.code !== 'ANNUAL';

    // Cari atasan (Manager) atau HR Admin default
    let approverId = employee.managerId;
    if (!approverId) {
      // Jika belum punya manager langsung, assign ke HR Admin pertama
      const hrAdmin = await this.prisma.employee.findFirst({
        where: {
          user: {
            userRoles: {
              some: { role: { name: { in: ['HR_ADMIN', 'SUPER_ADMIN'] } } },
            },
          },
        },
      });
      approverId = hrAdmin?.id || employee.id;
    }

    // 5. Jalankan Transaksi Database (ACID)
    const result = await this.prisma.$transaction(async (tx) => {
      // Buat pengajuan cuti
      const leaveRequest = await tx.leaveRequest.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          startDate,
          endDate,
          totalDays: dto.totalDays,
          reason: dto.reason,
          documentUrl: dto.documentUrl || null,
          status: LeaveStatus.PENDING as any,
        },
      });

      // Kunci kuota cuti dengan menambahkan pending_days
      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            pendingDays: {
              increment: dto.totalDays,
            },
          },
        });
      }

      // Buat alur approval Tingkat 1 (Line Manager)
      await tx.leaveApproval.create({
        data: {
          requestId: leaveRequest.id,
          approverId: approverId!,
          level: 1,
          status: ApprovalStatus.PENDING as any,
        },
      });

      // Catat Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          module: 'LEAVE',
          action: 'LEAVE_REQUESTED',
          recordId: leaveRequest.id,
          ipAddress: '127.0.0.1',
          newData: {
            leaveType: leaveType.name,
            totalDays: dto.totalDays,
            startDate: dto.startDate,
            endDate: dto.endDate,
            requiresTwoTiers,
          },
        },
      });

      return leaveRequest;
    });

    return {
      message: 'Permohonan cuti berhasil diajukan dan sedang menunggu persetujuan atasan.',
      leaveRequest: {
        id: result.id,
        leaveTypeName: leaveType.name,
        startDate: result.startDate,
        endDate: result.endDate,
        totalDays: result.totalDays,
        status: result.status,
      },
    };
  }

  /**
   * Membatalkan Permohonan Cuti (Hanya jika status masih PENDING)
   */
  async cancelRequest(userId: string, requestId: string) {
    const employee = await this.getEmployeeByUserId(userId);

    const leaveRequest = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: { leaveType: true },
    });

    if (!leaveRequest || leaveRequest.employeeId !== employee.id) {
      throw new NotFoundException('Data permohonan cuti tidak ditemukan.');
    }

    if (leaveRequest.status !== (LeaveStatus.PENDING as any)) {
      throw new ConflictException(
        `Permohonan cuti berstatus ${leaveRequest.status} tidak dapat dibatalkan secara sepihak.`,
      );
    }

    const year = new Date(leaveRequest.startDate).getFullYear();

    await this.prisma.$transaction(async (tx) => {
      // Update status ke CANCELLED
      await tx.leaveRequest.update({
        where: { id: requestId },
        data: { status: LeaveStatus.CANCELLED as any },
      });

      // Kembalikan pending_days pada saldo cuti
      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: employee.id,
            leaveTypeId: leaveRequest.leaveTypeId,
            year,
          },
        },
      });

      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            pendingDays: {
              decrement: leaveRequest.totalDays,
            },
          },
        });
      }

      // Catat log
      await tx.auditLog.create({
        data: {
          userId,
          module: 'LEAVE',
          action: 'LEAVE_CANCELLED',
          recordId: requestId,
          ipAddress: '127.0.0.1',
        },
      });
    });

    return { message: 'Permohonan cuti berhasil dibatalkan.' };
  }

  /**
   * Menyetujui atau Menolak Permohonan Cuti (Approval by Manager / HR)
   */
  async actionApproval(
    userId: string,
    approvalId: string,
    dto: ActionLeaveApprovalDto,
  ) {
    const employee = await this.getEmployeeByUserId(userId);

    const approval = await this.prisma.leaveApproval.findUnique({
      where: { id: approvalId },
      include: {
        request: {
          include: {
            employee: true,
            leaveType: true,
          },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException('Data persetujuan cuti tidak ditemukan.');
    }

    // Pastikan yang menyetujui adalah approver yang ditugaskan atau role HR/Super Admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    const roles = user?.userRoles.map((r) => r.role.name) || [];
    const isHrOrAdmin = roles.includes('HR_ADMIN') || roles.includes('SUPER_ADMIN');

    if (approval.approverId !== employee.id && !isHrOrAdmin) {
      throw new ForbiddenException(
        'Akses ditolak: Anda bukan atasan penilai yang berwenang untuk permohonan ini.',
      );
    }

    if (approval.status !== (ApprovalStatus.PENDING as any)) {
      throw new ConflictException(
        `Persetujuan ini sudah diproses sebelumnya dengan status ${approval.status}.`,
      );
    }

    const leaveRequest = approval.request;
    const year = new Date(leaveRequest.startDate).getFullYear();

    await this.prisma.$transaction(async (tx) => {
      // 1. Update Approval record
      await tx.leaveApproval.update({
        where: { id: approvalId },
        data: {
          status: dto.status as any,
          notes: dto.notes,
          actionAt: new Date(),
        },
      });

      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: leaveRequest.employeeId,
            leaveTypeId: leaveRequest.leaveTypeId,
            year,
          },
        },
      });

      if (dto.status === ApprovalStatus.REJECTED) {
        // Jika Ditolak: Batalkan pending_days dan update status request ke REJECTED
        await tx.leaveRequest.update({
          where: { id: leaveRequest.id },
          data: { status: LeaveStatus.REJECTED as any },
        });

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              pendingDays: {
                decrement: leaveRequest.totalDays,
              },
            },
          });
        }
      } else if (dto.status === ApprovalStatus.APPROVED) {
        // Jika Disetujui:
        // Cek apakah ini persetujuan final (Tingkat 1 cukup jika <= 2 hari, atau jika ini sudah tingkat 2)
        const isFinalApproval =
          approval.level === 2 ||
          (Number(leaveRequest.totalDays) <= 2 && leaveRequest.leaveType.code === 'ANNUAL') ||
          isHrOrAdmin;

        if (isFinalApproval) {
          // Final: Update request ke APPROVED
          await tx.leaveRequest.update({
            where: { id: leaveRequest.id },
            data: { status: LeaveStatus.APPROVED as any },
          });

          // Pindahkan pending_days ke used_days (Pemotongan Kuota Cuti Otomatis)
          if (balance) {
            await tx.leaveBalance.update({
              where: { id: balance.id },
              data: {
                pendingDays: {
                  decrement: leaveRequest.totalDays,
                },
                usedDays: {
                  increment: leaveRequest.totalDays,
                },
              },
            });
          }

          // Tandai kalender absensi tanggal terkait sebagai ON_LEAVE
          await tx.attendance.upsert({
            where: {
              employeeId_date: {
                employeeId: leaveRequest.employeeId,
                date: leaveRequest.startDate,
              },
            },
            create: {
              employeeId: leaveRequest.employeeId,
              date: leaveRequest.startDate,
              status: AttendanceStatus.ON_LEAVE as any,
              notes: `Cuti Disetujui: ${leaveRequest.leaveType.name} (${leaveRequest.reason})`,
            },
            update: {
              status: AttendanceStatus.ON_LEAVE as any,
              notes: `Cuti Disetujui: ${leaveRequest.leaveType.name}`,
            },
          });
        } else {
          // Buat alur tingkat 2 ke HR Admin
          const hrAdmin = await tx.employee.findFirst({
            where: {
              user: {
                userRoles: {
                  some: { role: { name: 'HR_ADMIN' } },
                },
              },
            },
          });

          if (hrAdmin) {
            await tx.leaveApproval.create({
              data: {
                requestId: leaveRequest.id,
                approverId: hrAdmin.id,
                level: 2,
                status: ApprovalStatus.PENDING as any,
              },
            });
          }
        }
      }

      // Catat Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          module: 'LEAVE',
          action: 'LEAVE_APPROVAL_DECIDED',
          recordId: approvalId,
          ipAddress: '127.0.0.1',
          newData: {
            decision: dto.status,
            notes: dto.notes,
            employeeName: `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName || ''}`.trim(),
          },
        },
      });
    });

    return {
      message: `Permohonan cuti berhasil ${
        dto.status === ApprovalStatus.APPROVED ? 'disetujui' : 'ditolak'
      }.`,
    };
  }

  /**
   * Mengambil riwayat pengajuan cuti pribadi (ESS)
   */
  async getMyRequests(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);

    return this.prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      include: {
        leaveType: true,
        approvals: {
          include: {
            approver: {
              select: { firstName: true, lastName: true, employeeNumber: true },
            },
          },
        },
      },
    });
  }

  /**
   * Mengambil saldo kuota cuti tahun berjalan (ESS)
   */
  async getMyBalances(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);
    const currentYear = new Date().getFullYear();

    const balances = await this.prisma.leaveBalance.findMany({
      where: {
        employeeId: employee.id,
        year: currentYear,
      },
      include: {
        leaveType: true,
      },
    });

    return balances.map((b) => {
      const total = Number(b.totalDays);
      const used = Number(b.usedDays);
      const pending = Number(b.pendingDays);
      return {
        id: b.id,
        leaveTypeName: b.leaveType.name,
        leaveTypeCode: b.leaveType.code,
        year: b.year,
        totalDays: total,
        usedDays: used,
        pendingDays: pending,
        remainingDays: Math.max(0, total - used - pending),
      };
    });
  }

  /**
   * Mengambil daftar persetujuan cuti yang sedang menunggu aksi (Manager / HR)
   */
  async getPendingApprovals(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    const roles = user?.userRoles.map((r) => r.role.name) || [];
    const isHrOrAdmin = roles.includes('HR_ADMIN') || roles.includes('SUPER_ADMIN');

    const where: any = {
      status: ApprovalStatus.PENDING as any,
    };

    if (!isHrOrAdmin) {
      where.approverId = employee.id;
    }

    return this.prisma.leaveApproval.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          include: {
            leaveType: true,
            employee: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Master Jenis Cuti
   */
  async getLeaveTypes() {
    return this.prisma.leaveType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  private async getEmployeeByUserId(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee || employee.deletedAt) {
      throw new NotFoundException(
        'Akun Anda belum terhubung dengan data profil karyawan aktif.',
      );
    }

    return employee;
  }
}
