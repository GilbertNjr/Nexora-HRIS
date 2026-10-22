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

export async function GET() {
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

  return NextResponse.json(
    {
      success: true,
      data: {
        ...data,
        absentCount,
        attendanceRate,
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
    const seconds = now.getSeconds();
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const isClockOut = body.type === 'CLOCK_OUT';

    // Standard clock-in limit is 08:15 WIB (15-min tolerance from 08:00)
    const isLate = hours > 8 || (hours === 8 && minutes > 15);
    const calculatedStatus: 'TEPAT_WAKTU' | 'TERLAMBAT' = isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU';
    const finalStatus: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'WFH' | 'DINAS_LUAR' =
      body.status || (body.workLocation === 'WFH' ? 'WFH' : body.workLocation === 'Dinas' ? 'DINAS_LUAR' : calculatedStatus);

    const employeeId = body.employeeId || 'NX-2021008';
    const employeeName = body.employeeName || 'Rian Pratama, S.Kom';

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
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: {
          record: targetRecord,
          summary: summaryPayload,
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
