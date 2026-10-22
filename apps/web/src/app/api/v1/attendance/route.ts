import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { broadcastEmployeeEvent } from '@/lib/employeesSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry } from '@/lib/auditDb';
import { getEmployeesFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const ATTENDANCE_FILE = path.join(STORAGE_DIR, 'nexora_attendance.json');

export interface AttendanceItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  time: string;
  checkInTime?: string;
  checkOutTime?: string;
  date: string;
  status: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'WFH' | 'DINAS_LUAR';
  location: string;
  coordinates: string;
  device: string;
  photoUrl?: string;
  avatarUrl?: string;
  workLocation?: string;
  notes?: string;
  shiftName?: string;
  shiftHours?: string;
  shiftNote?: string;
  checkInNote?: string;
  checkInSourceIcon?: 'globe' | 'building' | 'cog' | 'pin';
}

interface AttendanceData {
  totalEmployees: number;
  presentCount: number;
  onTimeCount: number;
  lateCount: number;
  leaveCount: number;
  records: AttendanceItem[];
}

const defaultAttendance: AttendanceData = {
  totalEmployees: 1248,
  presentCount: 1210,
  onTimeCount: 1182,
  lateCount: 28,
  leaveCount: 26,
  records: [
    {
      id: 'att-1',
      employeeId: 'NX-201844',
      employeeName: 'Raden Bagus Prakoso, S.Kom',
      department: 'Divisi Rekayasa Cloud',
      type: 'CLOCK_IN',
      time: '07:51:20',
      checkInTime: '07:51:20',
      checkOutTime: '17:08:15',
      date: new Date().toISOString().split('T')[0],
      status: 'TEPAT_WAKTU',
      location: 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)',
      coordinates: '-6.2255, 106.8089',
      device: 'Portal Karyawan ESS (Web)',
      shiftName: 'Reguler HQ (08:00 - 17:00)',
      shiftHours: '08:00 - 17:00',
      shiftNote: 'Toleransi 15 Menit',
      checkInNote: '+9 menit lbh cepat',
      checkInSourceIcon: 'globe',
    },
    {
      id: 'att-2',
      employeeId: 'NX-201992',
      employeeName: 'Siti Nurhaliza, M.M.',
      department: 'People & Talent Dev',
      type: 'CLOCK_IN',
      time: '08:24:11',
      checkInTime: '08:24:11',
      checkOutTime: '—',
      date: new Date().toISOString().split('T')[0],
      status: 'TERLAMBAT',
      location: 'Kantor Pusat Jakarta',
      coordinates: '-6.2255, 106.8089',
      device: 'Mesin Absensi Biometrik Kantor',
      shiftName: 'Reguler HQ (08:00 - 17:00)',
      shiftHours: '08:00 - 17:00',
      shiftNote: 'Toleransi 15 Menit',
      checkInNote: 'Terlambat 24 Menit',
      checkInSourceIcon: 'building',
    },
    {
      id: 'att-3',
      employeeId: 'NX-202105',
      employeeName: 'Dimas Arya Pamungkas',
      department: 'DevOps & Security',
      type: 'CLOCK_IN',
      time: '08:02:40',
      checkInTime: '08:02:40',
      checkOutTime: '—',
      date: new Date().toISOString().split('T')[0],
      status: 'WFH',
      location: 'Remote Residence (Tangerang Selatan)',
      coordinates: '-6.2891, 106.7123',
      device: 'Selfie Liveness Camera (NX-Biometric v4.2)',
      shiftName: 'Fleksibel Remote (WFH)',
      shiftHours: 'Fleksibel',
      shiftNote: 'Jadwal Rotasi Mingguan',
      checkInNote: 'Selfie Validated',
      workLocation: 'WFH',
      checkInSourceIcon: 'globe',
    },
    {
      id: 'att-4',
      employeeId: 'NX-201633',
      employeeName: 'Hendro Wibowo, S.T.',
      department: 'Operasional Pabrik Cikarang',
      type: 'CLOCK_IN',
      time: '06:48:10',
      checkInTime: '06:48:10',
      checkOutTime: '—',
      date: new Date().toISOString().split('T')[0],
      status: 'TEPAT_WAKTU',
      location: 'Gate Masuk Barat Kawasan Industri',
      coordinates: '-6.3211, 107.1352',
      device: 'Gate RFID Biometric Turnstile',
      shiftName: 'Shift 1 Pagi (07:00 - 15:30)',
      shiftHours: '07:00 - 15:30',
      shiftNote: 'Standar Pabrik',
      checkInNote: 'Gate Masuk Barat',
      workLocation: 'WFO',
      checkInSourceIcon: 'cog',
    },
    {
      id: 'att-5',
      employeeId: 'NX-202289',
      employeeName: 'Anindya Kusuma, S.E.',
      department: 'Business Development & Sales',
      type: 'CLOCK_IN',
      time: '08:10:02',
      checkInTime: '08:10:02',
      checkOutTime: '—',
      date: new Date().toISOString().split('T')[0],
      status: 'DINAS_LUAR',
      location: 'Surabaya Client Site (Pakuwon Tower)',
      coordinates: '-7.2612, 112.7481',
      device: 'Mobile GPS Biometric Verification',
      shiftName: 'Dinas Luar (Surabaya)',
      shiftHours: 'Full Day',
      shiftNote: 'Surat Tugas #ST-442',
      checkInNote: 'Check-In Client Site',
      workLocation: 'Dinas',
      checkInSourceIcon: 'pin',
    },
  ],
};

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
}

function getStoredAttendance(): AttendanceData {
  try {
    ensureStorage();
    if (fs.existsSync(ATTENDANCE_FILE)) {
      const data = JSON.parse(fs.readFileSync(ATTENDANCE_FILE, 'utf-8'));
      return { ...defaultAttendance, ...data };
    }
  } catch {
    // fallback
  }
  return defaultAttendance;
}

function saveStoredAttendance(data: AttendanceData): void {
  try {
    ensureStorage();
    fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

function computeEmployeeMonthlyStats(
  employeeId: string,
  employeeName: string,
  records: AttendanceItem[]
) {
  const todayStr = new Date().toISOString().split('T')[0];
  const userRecords = records.filter(
    (r) =>
      (r.employeeId && r.employeeId.toLowerCase() === employeeId.toLowerCase()) ||
      (r.employeeName && r.employeeName.toLowerCase() === employeeName.toLowerCase())
  );

  const todayRecord = userRecords.find((r) => r.date === todayStr) || null;
  const isCheckedIn = Boolean(todayRecord && todayRecord.checkInTime && todayRecord.checkInTime !== '—');
  const hasClockedOut = Boolean(todayRecord && todayRecord.checkOutTime && todayRecord.checkOutTime !== '—');
  const checkInTimeStr = todayRecord?.checkInTime || todayRecord?.time || '07:51 WIB';
  const clockOutTimeStr = todayRecord?.checkOutTime || '-- : -- : -- WIB';

  // Base past working days in month: 20 days completed
  // If checked in today: 21 days
  const basePastDays = 20;
  const totalWorkDays = 21;
  const presentDays = isCheckedIn ? basePastDays + 1 : basePastDays;
  const attendancePercentage = Math.round((presentDays / totalWorkDays) * 100);

  // Base effective hours: 161.0 hours (plus overtime 8.5 hr)
  // If checked in today: +7.5 hr standard shift = 168.5 hr total effective
  const basePastEffectiveHours = 161.0;
  const todayEffectiveHours = isCheckedIn ? 7.5 : 0;
  const totalEffectiveHours = Number((basePastEffectiveHours + todayEffectiveHours).toFixed(1));
  const overtimeHours = 8.5;

  const isTodayLate = todayRecord?.status === 'TERLAMBAT';
  const todayLateMinutes = isTodayLate ? 144 : 0;
  const totalLateMinutes = todayLateMinutes;
  const lateCount = isTodayLate ? 1 : 0;
  const alphaCount = 0;
  const avgCheckInTime = isTodayLate ? '08:10 WIB' : '08:02 WIB';

  let todayStatus: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'BELUM_CHECK_IN' | 'SELESAI_BEKERJA' = 'BELUM_CHECK_IN';
  if (hasClockedOut) {
    todayStatus = 'SELESAI_BEKERJA';
  } else if (isCheckedIn) {
    todayStatus = isTodayLate ? 'TERLAMBAT' : 'TEPAT_WAKTU';
  }

  // Generate historical daily ledger for table & Excel export
  const history = [
    ...(isCheckedIn && todayRecord
      ? [
          {
            id: todayRecord.id || `att-today`,
            date: todayStr,
            dayName: 'Hari Ini',
            shiftName: todayRecord.shiftName || 'Reguler Ramadhan (08:30 - 16:30)',
            checkIn: checkInTimeStr,
            checkOut: hasClockedOut ? clockOutTimeStr : '— (Aktif Bekerja)',
            status: todayRecord.status,
            statusLabel: todayRecord.status === 'TERLAMBAT' ? 'Terlambat Masuk' : 'Tepat Waktu',
            workLocation:
              todayRecord.location ||
              (todayRecord.workLocation === 'WFH' ? 'Remote Residence (WFH)' : 'HQ Pacific SCBD Lt. 7'),
            duration: hasClockedOut ? '7.5 Jam' : 'Berjalan',
            effectiveHours: 7.5,
            overtimeHours: 0,
            lateMinutes: todayLateMinutes,
            verificationMethod: 'Biometrik Face Scan + GPS',
            isToday: true,
          },
        ]
      : []),
    {
      id: 'att-hist-1',
      date: '2025-03-24',
      dayName: 'Senin',
      shiftName: 'Reguler Ramadhan (08:30 - 16:30)',
      checkIn: '07:51 WIB',
      checkOut: '16:35 WIB',
      status: 'TEPAT_WAKTU',
      statusLabel: 'Tepat Waktu',
      workLocation: 'HQ Pacific SCBD Lt. 7',
      duration: '7.5 Jam',
      effectiveHours: 7.5,
      overtimeHours: 0,
      lateMinutes: 0,
      verificationMethod: 'Biometrik Face Scan + GPS',
    },
    {
      id: 'att-hist-2',
      date: '2025-03-23',
      dayName: 'Minggu',
      shiftName: 'Reguler Ramadhan (08:30 - 16:30)',
      checkIn: '07:55 WIB',
      checkOut: '16:40 WIB',
      status: 'TEPAT_WAKTU',
      statusLabel: 'Tepat Waktu',
      workLocation: 'HQ Pacific SCBD Lt. 7',
      duration: '7.5 Jam',
      effectiveHours: 7.5,
      overtimeHours: 0,
      lateMinutes: 0,
      verificationMethod: 'Biometrik Face Scan + GPS',
    },
    {
      id: 'att-hist-3',
      date: '2025-03-22',
      dayName: 'Sabtu',
      shiftName: 'Reguler Ramadhan (08:30 - 16:30)',
      checkIn: '08:02 WIB',
      checkOut: '17:00 WIB',
      status: 'TEPAT_WAKTU',
      statusLabel: 'Tepat Waktu',
      workLocation: 'HQ Pacific SCBD Lt. 7',
      duration: '8.0 Jam',
      effectiveHours: 8.0,
      overtimeHours: 0.5,
      lateMinutes: 0,
      verificationMethod: 'Biometrik Face Scan + GPS',
    },
    {
      id: 'att-hist-4',
      date: '2025-03-21',
      dayName: 'Jumat',
      shiftName: 'Reguler Ramadhan (08:30 - 16:30)',
      checkIn: '07:48 WIB',
      checkOut: '16:30 WIB',
      status: 'TEPAT_WAKTU',
      statusLabel: 'Tepat Waktu',
      workLocation: 'HQ Pacific SCBD Lt. 7',
      duration: '7.5 Jam',
      effectiveHours: 7.5,
      overtimeHours: 0,
      lateMinutes: 0,
      verificationMethod: 'Biometrik Face Scan + GPS',
    },
    {
      id: 'att-hist-5',
      date: '2025-03-20',
      dayName: 'Kamis',
      shiftName: 'Reguler Ramadhan (08:30 - 16:30)',
      checkIn: '08:10 WIB',
      checkOut: '18:30 WIB',
      status: 'TEPAT_WAKTU',
      statusLabel: 'Lembur SPL (+2.0 Jam)',
      workLocation: 'HQ Pacific SCBD Lt. 7',
      duration: '9.5 Jam',
      effectiveHours: 9.5,
      overtimeHours: 2.0,
      lateMinutes: 0,
      verificationMethod: 'Biometrik Face Scan + GPS',
    },
    {
      id: 'att-hist-6',
      date: '2025-03-19',
      dayName: 'Rabu',
      shiftName: 'Reguler Ramadhan (08:30 - 16:30)',
      checkIn: '07:50 WIB',
      checkOut: '16:30 WIB',
      status: 'TEPAT_WAKTU',
      statusLabel: 'Tepat Waktu',
      workLocation: 'Remote Residence (WFH)',
      duration: '7.5 Jam',
      effectiveHours: 7.5,
      overtimeHours: 0,
      lateMinutes: 0,
      verificationMethod: 'Biometrik Face Scan + GPS',
    },
    {
      id: 'att-hist-7',
      date: '2025-03-18',
      dayName: 'Selasa',
      shiftName: 'Reguler Ramadhan (08:30 - 16:30)',
      checkIn: '08:05 WIB',
      checkOut: '16:45 WIB',
      status: 'TEPAT_WAKTU',
      statusLabel: 'Tepat Waktu',
      workLocation: 'HQ Pacific SCBD Lt. 7',
      duration: '7.5 Jam',
      effectiveHours: 7.5,
      overtimeHours: 0,
      lateMinutes: 0,
      verificationMethod: 'Biometrik Face Scan + GPS',
    },
    {
      id: 'att-hist-8',
      date: '2025-03-17',
      dayName: 'Senin',
      shiftName: 'Reguler Ramadhan (08:30 - 16:30)',
      checkIn: '07:52 WIB',
      checkOut: '17:00 WIB',
      status: 'TEPAT_WAKTU',
      statusLabel: 'Tepat Waktu',
      workLocation: 'HQ Pacific SCBD Lt. 7',
      duration: '8.0 Jam',
      effectiveHours: 8.0,
      overtimeHours: 0.5,
      lateMinutes: 0,
      verificationMethod: 'Biometrik Face Scan + GPS',
    },
  ];

  return {
    presentDays,
    totalWorkDays,
    attendancePercentage,
    totalEffectiveHours,
    overtimeHours,
    totalLateMinutes,
    lateCount,
    alphaCount,
    avgCheckInTime,
    remainingCorrectionQuota: 2,
    maxCorrectionQuota: 3,
    isCheckedIn,
    checkInTimeStr,
    hasClockedOut,
    clockOutTimeStr,
    todayStatus,
    todayRecord,
    history,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId') || searchParams.get('nik');
  const employeeName = searchParams.get('employeeName') || searchParams.get('name');

  const data = getStoredAttendance();
  try {
    const emps = await getEmployeesFromDb();
    if (Array.isArray(emps) && emps.length > 0) {
      data.totalEmployees = Math.max(1248, emps.length);
    }
  } catch {}

  const absentCount = Math.max(0, data.totalEmployees - data.presentCount - (data.leaveCount || 26));
  const attendanceRate = data.totalEmployees > 0
    ? Number(((data.onTimeCount / data.totalEmployees) * 100).toFixed(1))
    : 94.7;

  let employeeStats = null;
  if (employeeId || employeeName) {
    employeeStats = computeEmployeeMonthlyStats(
      employeeId || 'NX-2021008',
      employeeName || 'Rian Pratama',
      data.records
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        ...data,
        absentCount,
        attendanceRate,
        employeeStats,
      },
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = getStoredAttendance();

    try {
      const emps = await getEmployeesFromDb();
      if (Array.isArray(emps) && emps.length > 0) {
        data.totalEmployees = Math.max(1248, emps.length);
      }
    } catch {}

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeStr =
      body.time ||
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} WIB`;
    const dateStr = body.date || now.toISOString().split('T')[0];

    const isClockOut = body.type === 'CLOCK_OUT';

    // Standard clock-in limit is 08:15 WIB (15-min tolerance from 08:00)
    const isLate = hours > 8 || (hours === 8 && minutes > 15);
    const calculatedStatus: 'TEPAT_WAKTU' | 'TERLAMBAT' = isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU';
    const finalStatus: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'WFH' | 'DINAS_LUAR' =
      body.status || (body.workLocation === 'WFH' ? 'WFH' : body.workLocation === 'Dinas' ? 'DINAS_LUAR' : calculatedStatus);

    const employeeId = body.employeeId || 'NX-2021008';
    const employeeName = body.employeeName || 'Rian Pratama, S.Kom';

    if (body.type === 'RESET_TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      data.records = data.records.filter((r) => {
        const isMatch =
          (r.employeeId && r.employeeId.toLowerCase() === employeeId.toLowerCase()) ||
          (r.employeeName && r.employeeName.toLowerCase() === employeeName.toLowerCase());
        return !isMatch || (r.date !== todayStr && r.date !== (body.date || ''));
      });
      saveStoredAttendance(data);
      const resetStats = computeEmployeeMonthlyStats(employeeId, employeeName, data.records);
      return NextResponse.json({
        success: true,
        message: 'Status presensi hari ini berhasil direset.',
        data: {
          employeeStats: resetStats,
        },
      });
    }

    const existingIndex = data.records.findIndex(
      (r) =>
        (r.employeeId && r.employeeId.toLowerCase() === employeeId.toLowerCase()) ||
        (r.employeeName && r.employeeName.toLowerCase() === employeeName.toLowerCase())
    );

    let targetRecord: AttendanceItem;

    if (isClockOut) {
      if (existingIndex !== -1) {
        data.records[existingIndex].checkOutTime = timeStr;
        data.records[existingIndex].type = 'CLOCK_OUT';
        targetRecord = data.records[existingIndex];
      } else {
        targetRecord = {
          id: `att-${Date.now()}`,
          employeeId,
          employeeName,
          department: body.department || 'Teknologi Informasi',
          type: 'CLOCK_OUT',
          time: timeStr,
          checkInTime: '—',
          checkOutTime: timeStr,
          date: dateStr,
          status: 'TEPAT_WAKTU',
          location: body.location || 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)',
          coordinates: body.coordinates || '-6.2255, 106.8089',
          device: body.device || 'Portal Karyawan ESS (Web)',
          photoUrl: body.photoUrl || body.selfieUrl || undefined,
          avatarUrl: body.avatarUrl || undefined,
          workLocation: body.workLocation || 'WFO',
          notes: body.notes || undefined,
          checkInSourceIcon: 'globe',
        };
        data.records.unshift(targetRecord);
      }
    } else {
      // CLOCK_IN
      if (existingIndex !== -1) {
        data.records[existingIndex] = {
          ...data.records[existingIndex],
          time: timeStr,
          checkInTime: timeStr,
          status: finalStatus,
          location: body.location || data.records[existingIndex].location,
          photoUrl: body.photoUrl || body.selfieUrl || data.records[existingIndex].photoUrl,
          avatarUrl: body.avatarUrl || data.records[existingIndex].avatarUrl,
          notes: body.notes || data.records[existingIndex].notes,
          workLocation: body.workLocation || data.records[existingIndex].workLocation,
        };
        targetRecord = data.records[existingIndex];
      } else {
        targetRecord = {
          id: `att-${Date.now()}`,
          employeeId,
          employeeName,
          department: body.department || 'Teknologi Informasi',
          type: 'CLOCK_IN',
          time: timeStr,
          checkInTime: timeStr,
          checkOutTime: '—',
          date: dateStr,
          status: finalStatus,
          location: body.location || 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)',
          coordinates: body.coordinates || '-6.2255, 106.8089',
          device: body.device || 'Selfie Liveness Camera (NX-Biometric v4.2)',
          photoUrl: body.photoUrl || body.selfieUrl || undefined,
          avatarUrl: body.avatarUrl || undefined,
          workLocation: body.workLocation || 'WFO',
          notes: body.notes || undefined,
          checkInNote: finalStatus === 'TERLAMBAT' ? 'Terlambat Masuk' : 'Liveness Selfie Validated (99.4%)',
          shiftName: 'Reguler HQ (08:00 - 17:00)',
          shiftHours: '08:00 - 17:00',
          shiftNote: body.location || 'Presensi Mandiri ESS (Real-Time)',
          checkInSourceIcon: body.workLocation === 'WFH' ? 'globe' : body.workLocation === 'Dinas' ? 'pin' : 'globe',
        };
        data.records.unshift(targetRecord);

        data.presentCount += 1;
        if (finalStatus === 'TERLAMBAT') {
          data.lateCount += 1;
        } else {
          data.onTimeCount += 1;
        }
      }
    }

    data.records = data.records.slice(0, 60);

    const absentCount = Math.max(0, data.totalEmployees - data.presentCount - (data.leaveCount || 26));
    const attendanceRate = Number(((data.onTimeCount / data.totalEmployees) * 100).toFixed(1));

    saveStoredAttendance(data);

    const summaryPayload = {
      totalEmployees: data.totalEmployees,
      presentCount: data.presentCount,
      onTimeCount: data.onTimeCount,
      lateCount: data.lateCount,
      leaveCount: data.leaveCount,
      absentCount,
      attendanceRate,
    };

    const updatedEmployeeStats = computeEmployeeMonthlyStats(
      employeeId,
      employeeName,
      data.records
    );

    // Broadcast audit log
    try {
      const auditLog: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        module: 'ATTENDANCE',
        action: isClockOut ? 'CLOCK_OUT_RECORDED' : 'CLOCK_IN_GEOFENCE_VERIFIED',
        recordId: targetRecord.id,
        userName: targetRecord.employeeName,
        userEmail: body.userEmail || `${targetRecord.employeeId}@nexora.co.id`,
        userNik: targetRecord.employeeId,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: targetRecord.device,
        timestamp: `${dateStr} ${timeStr} WIB`,
        oldData: null,
        newData: {
          type: targetRecord.type,
          status: targetRecord.status,
          location: targetRecord.location,
          time: targetRecord.time,
        },
      };
      saveStoredAuditLogs([auditLog, ...getStoredAuditLogs().slice(0, 99)]);
      broadcastAuditEvent('AUDIT_LOG_CREATED', auditLog);
      broadcastEmployeeEvent('ATTENDANCE_RECORDED', {
        record: targetRecord,
        summary: summaryPayload,
        employeeStats: updatedEmployeeStats,
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: {
          record: targetRecord,
          summary: summaryPayload,
          employeeStats: updatedEmployeeStats,
        },
        message: `Presensi ${isClockOut ? 'Pulang' : 'Masuk'} berhasil dicatat dan disinkronkan ke HR Admin.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'ATTENDANCE_ERROR', message: err.message },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || searchParams.get('nik') || 'NX-2021008';
    const employeeName = searchParams.get('employeeName') || searchParams.get('name') || 'Rian Pratama';
    const todayStr = new Date().toISOString().split('T')[0];

    const data = getStoredAttendance();
    data.records = data.records.filter((r) => {
      const isMatch =
        (r.employeeId && r.employeeId.toLowerCase() === employeeId.toLowerCase()) ||
        (r.employeeName && r.employeeName.toLowerCase() === employeeName.toLowerCase());
      return !(isMatch && r.date === todayStr);
    });
    saveStoredAttendance(data);

    const resetStats = computeEmployeeMonthlyStats(employeeId, employeeName, data.records);
    return NextResponse.json({
      success: true,
      message: 'Status presensi hari ini berhasil direset.',
      data: {
        employeeStats: resetStats,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

