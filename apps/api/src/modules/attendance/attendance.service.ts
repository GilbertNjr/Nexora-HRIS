import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';

// Default Koordinat Kantor Pusat (Nexora Tower, SCBD Jakarta)
export const OFFICE_COORDINATES = {
  latitude: -6.2255,
  longitude: 106.8095,
  radiusMeters: 100, // Toleransi radius 100 meter
  officeName: 'Nexora Tower SCBD Jakarta',
};

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Clock-In Karyawan dengan validasi GPS Geofencing & deteksi keterlambatan
   */
  async clockIn(userId: string, dto: ClockInDto, ipAddress: string = '127.0.0.1') {
    const employee = await this.getEmployeeByUserId(userId);
    const today = this.getTodayDate();

    // 1. Validasi GPS Geofence (Radius Kantor)
    const distanceMeters = this.calculateDistance(
      dto.latitude,
      dto.longitude,
      OFFICE_COORDINATES.latitude,
      OFFICE_COORDINATES.longitude,
    );

    if (distanceMeters > OFFICE_COORDINATES.radiusMeters) {
      throw new BadRequestException(
        `Presensi ditolak: Anda berada di luar radius kantor! Jarak Anda saat ini: ${Math.round(
          distanceMeters,
        )} meter (Maksimal: ${OFFICE_COORDINATES.radiusMeters} meter). Sesuai kebijakan [REQ-DEC-04], pastikan Anda berada di area kantor atau ajukan dinas luar.`,
      );
    }

    // 2. Cek apakah sudah pernah clock-in hari ini
    const existing = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
      include: { shift: true },
    });

    if (existing && existing.clockInTime) {
      throw new ConflictException(
        `Anda sudah melakukan Clock-In pada pukul ${this.formatTime(
          existing.clockInTime,
        )} WIB.`,
      );
    }

    // 3. Tentukan Jadwal Shift (Bawaan: REG-01 09:00 - 18:00)
    let shift = existing?.shift;
    if (!shift) {
      shift = await this.prisma.workShift.findFirst({
        where: { code: 'REG-01' },
      });
      if (!shift) {
        shift = await this.prisma.workShift.findFirst();
      }
    }

    // 4. Hitung Keterlambatan (Late Minutes)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let lateMinutes = 0;
    let status: AttendanceStatus = AttendanceStatus.PRESENT;

    if (shift) {
      const [shiftHour, shiftMin] = shift.startTime.split(':').map(Number);
      const shiftStartMinutes = shiftHour * 60 + shiftMin;
      const gracePeriodMinutes = shift.graceMinutes || 15;

      if (currentMinutes > shiftStartMinutes + gracePeriodMinutes) {
        lateMinutes = currentMinutes - shiftStartMinutes;
        status = AttendanceStatus.LATE;
      }
    }

    // 5. Simpan / Upsert Data Presensi
    const attendance = await this.prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
      create: {
        employeeId: employee.id,
        shiftId: shift?.id,
        date: today,
        clockInTime: now,
        clockInLat: dto.latitude,
        clockInLng: dto.longitude,
        clockInIp: ipAddress,
        clockInPhoto: dto.photoUrl,
        status,
        lateMinutes,
        notes: dto.notes,
      },
      update: {
        shiftId: shift?.id,
        clockInTime: now,
        clockInLat: dto.latitude,
        clockInLng: dto.longitude,
        clockInIp: ipAddress,
        clockInPhoto: dto.photoUrl,
        status,
        lateMinutes,
        notes: dto.notes,
      },
      include: { shift: true },
    });

    // 6. Catat Audit Log
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          module: 'ATTENDANCE',
          action: 'CLOCK_IN',
          recordId: attendance.id,
          ipAddress,
          newData: {
            distanceMeters: Math.round(distanceMeters),
            status,
            lateMinutes,
          },
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to log clock-in audit: ${(e as Error).message}`);
    }

    return {
      message:
        status === AttendanceStatus.LATE
          ? `Clock-In berhasil tercatat (Terlambat ${lateMinutes} menit).`
          : 'Clock-In tepat waktu berhasil tercatat. Selamat bekerja!',
      attendance: {
        id: attendance.id,
        date: attendance.date,
        clockInTime: attendance.clockInTime,
        status: attendance.status,
        lateMinutes: attendance.lateMinutes,
        distanceFromOffice: `${Math.round(distanceMeters)} meter`,
        shiftName: attendance.shift?.name || 'Regular Shift',
      },
    };
  }

  /**
   * Clock-Out Karyawan dengan validasi pulang lebih awal (Early Leave)
   */
  async clockOut(userId: string, dto: ClockOutDto, ipAddress: string = '127.0.0.1') {
    const employee = await this.getEmployeeByUserId(userId);
    const today = this.getTodayDate();

    // 1. Cari riwayat presensi hari ini
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
      include: { shift: true },
    });

    if (!attendance || !attendance.clockInTime) {
      throw new BadRequestException(
        'Anda belum melakukan Clock-In masuk untuk hari ini. Silakan Clock-In terlebih dahulu.',
      );
    }

    if (attendance.clockOutTime) {
      throw new ConflictException(
        `Anda sudah melakukan Clock-Out pada pukul ${this.formatTime(
          attendance.clockOutTime,
        )} WIB.`,
      );
    }

    // 2. Validasi Geofencing Pulang
    const distanceMeters = this.calculateDistance(
      dto.latitude,
      dto.longitude,
      OFFICE_COORDINATES.latitude,
      OFFICE_COORDINATES.longitude,
    );

    // 3. Cek Pulang Lebih Awal (Early Leave)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let earlyMinutes = 0;
    let newStatus = attendance.status;

    if (attendance.shift) {
      const [endHour, endMin] = attendance.shift.endTime.split(':').map(Number);
      const shiftEndMinutes = endHour * 60 + endMin;

      if (currentMinutes < shiftEndMinutes) {
        earlyMinutes = shiftEndMinutes - currentMinutes;
        if (newStatus === AttendanceStatus.PRESENT) {
          newStatus = AttendanceStatus.EARLY_LEAVE;
        }
      }
    }

    // 4. Update data Clock-Out
    const updated = await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOutTime: now,
        clockOutLat: dto.latitude,
        clockOutLng: dto.longitude,
        clockOutIp: ipAddress,
        clockOutPhoto: dto.photoUrl,
        earlyMinutes,
        status: newStatus,
      },
    });

    // 5. Catat Audit Log
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          module: 'ATTENDANCE',
          action: 'CLOCK_OUT',
          recordId: updated.id,
          ipAddress,
          newData: {
            distanceMeters: Math.round(distanceMeters),
            status: newStatus,
            earlyMinutes,
          },
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to log clock-out audit: ${(e as Error).message}`);
    }

    return {
      message:
        earlyMinutes > 0
          ? `Clock-Out berhasil tercatat (Pulang lebih awal ${earlyMinutes} menit).`
          : 'Clock-Out selesai. Terima kasih atas dedikasi Anda hari ini!',
      attendance: {
        id: updated.id,
        date: updated.date,
        clockInTime: updated.clockInTime,
        clockOutTime: updated.clockOutTime,
        status: updated.status,
        lateMinutes: updated.lateMinutes,
        earlyMinutes: updated.earlyMinutes,
      },
    };
  }

  /**
   * Mengambil status presensi karyawan hari ini
   */
  async getTodayStatus(userId: string) {
    const employee = await this.getEmployeeByUserId(userId);
    const today = this.getTodayDate();

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
      include: {
        shift: true,
      },
    });

    return {
      date: today,
      isClockedIn: !!attendance?.clockInTime,
      isClockedOut: !!attendance?.clockOutTime,
      attendance: attendance || null,
      officeGeofence: OFFICE_COORDINATES,
    };
  }

  /**
   * Mengambil riwayat presensi mandiri karyawan (ESS)
   */
  async getMyHistory(userId: string, limit: number = 30) {
    const employee = await this.getEmployeeByUserId(userId);

    const attendances = await this.prisma.attendance.findMany({
      where: { employeeId: employee.id },
      orderBy: { date: 'desc' },
      take: limit,
      include: { shift: true },
    });

    return attendances;
  }

  /**
   * Rekapitulasi Presensi untuk HR Admin & Laporan
   */
  async getRecap(query: QueryAttendanceDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.date) {
      where.date = new Date(query.date);
    } else if (query.startDate && query.endDate) {
      where.date = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.departmentId) {
      where.employee = { departmentId: query.departmentId };
    }

    if (query.search) {
      const term = query.search.trim();
      where.employee = {
        ...where.employee,
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { employeeNumber: { contains: term, mode: 'insensitive' } },
        ],
      };
    }

    const [total, items] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          shift: true,
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true,
              department: { select: { id: true, name: true } },
              designation: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

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
   * Daftar Master Shift Kerja
   */
  async getShifts() {
    return this.prisma.workShift.findMany({
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Menambah shift kerja baru
   */
  async createShift(dto: CreateShiftDto) {
    const existing = await this.prisma.workShift.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Kode shift '${dto.code}' sudah terdaftar.`);
    }

    return this.prisma.workShift.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        startTime: dto.startTime,
        endTime: dto.endTime,
        graceMinutes: dto.graceMinutes || 15,
      },
    });
  }

  // --- Helper Methods ---

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

  private getTodayDate(): Date {
    const now = new Date();
    // Normalisasi ke jam 00:00:00 UTC
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * Haversine Formula untuk menghitung jarak antara 2 koordinat GPS dalam meter
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Radius bumi dalam meter
    const toRad = (angle: number) => (angle * Math.PI) / 180;

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaPhi = toRad(lat2 - lat1);
    const deltaLambda = toRad(lon2 - lon1);

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Hasil dalam meter
  }
}
