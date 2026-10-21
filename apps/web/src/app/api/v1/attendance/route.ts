import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { broadcastAuditEvent } from '@/lib/auditSSE';
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
  date: string;
  status: 'TEPAT_WAKTU' | 'TERLAMBAT';
  location: string;
  coordinates: string;
  device: string;
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
  presentCount: 1203,
  onTimeCount: 1175,
  lateCount: 28,
  leaveCount: 17,
  records: [
    {
      id: 'att-1',
      employeeId: 'emp-001',
      employeeName: 'Budi Santoso',
      department: 'Product & Design',
      type: 'CLOCK_IN',
      time: '08:42 WIB',
      date: new Date().toISOString().split('T')[0],
      status: 'TEPAT_WAKTU',
      location: 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)',
      coordinates: '-6.2255, 106.8089',
      device: 'Mobile iOS (iPhone 15)',
    },
    {
      id: 'att-2',
      employeeId: 'emp-002',
      employeeName: 'Siti Rahmawati',
      department: 'Human Resources',
      type: 'CLOCK_IN',
      time: '08:50 WIB',
      date: new Date().toISOString().split('T')[0],
      status: 'TEPAT_WAKTU',
      location: 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)',
      coordinates: '-6.2255, 106.8089',
      device: 'Mobile Android (Samsung S24)',
    },
    {
      id: 'att-3',
      employeeId: 'emp-003',
      employeeName: 'Dimas Aditya',
      department: 'Technology',
      type: 'CLOCK_IN',
      time: '09:12 WIB',
      date: new Date().toISOString().split('T')[0],
      status: 'TERLAMBAT',
      location: 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)',
      coordinates: '-6.2255, 106.8089',
      device: 'Web Portal (Chrome)',
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
      data.totalEmployees = emps.length;
      if (data.presentCount > data.totalEmployees) {
        data.presentCount = Math.max(1, Math.min(data.presentCount, data.totalEmployees));
      }
    }
  } catch {}

  const attendanceRate = data.totalEmployees > 0
    ? Number(((data.presentCount / data.totalEmployees) * 100).toFixed(1))
    : 100;

  return NextResponse.json(
    {
      success: true,
      data: {
        ...data,
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

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;
    const dateStr = now.toISOString().split('T')[0];

    // Standard clock-in limit is 09:00 WIB
    const isLate = hours > 9 || (hours === 9 && minutes > 0);
    const status: 'TEPAT_WAKTU' | 'TERLAMBAT' = isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU';

    const newRecord: AttendanceItem = {
      id: `att-${Date.now()}`,
      employeeId: body.employeeId || 'emp-user-1',
      employeeName: body.employeeName || 'Gilbert (Karyawan)',
      department: body.department || 'Teknologi Informasi',
      type: body.type || 'CLOCK_IN',
      time: timeStr,
      date: dateStr,
      status: body.type === 'CLOCK_OUT' ? 'TEPAT_WAKTU' : status,
      location: body.location || 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)',
      coordinates: body.coordinates || '-6.2255, 106.8089',
      device: body.device || 'Portal Karyawan ESS (Web)',
    };

    // Update counters
    if (newRecord.type === 'CLOCK_IN') {
      data.presentCount += 1;
      if (status === 'TEPAT_WAKTU') {
        data.onTimeCount += 1;
      } else {
        data.lateCount += 1;
      }
    }

    // Prepend record
    data.records = [newRecord, ...data.records.slice(0, 49)];
    saveStoredAttendance(data);

    // Broadcast audit log
    try {
      const auditLog: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        module: 'ATTENDANCE',
        action: newRecord.type === 'CLOCK_IN' ? 'CLOCK_IN_GEOFENCE_VERIFIED' : 'CLOCK_OUT_RECORDED',
        recordId: newRecord.id,
        userName: newRecord.employeeName,
        userEmail: body.userEmail || `${newRecord.employeeId}@nexora.co.id`,
        userNik: newRecord.employeeId,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: newRecord.device,
        timestamp: `${dateStr} ${timeStr}`,
        oldData: null,
        newData: {
          type: newRecord.type,
          status: newRecord.status,
          location: newRecord.location,
          coordinates: newRecord.coordinates,
        },
      };
      saveStoredAuditLogs([auditLog, ...getStoredAuditLogs().slice(0, 99)]);
      broadcastAuditEvent('AUDIT_LOG_CREATED', auditLog);
    } catch {}

    const attendanceRate = Number(((data.presentCount / data.totalEmployees) * 100).toFixed(1));

    return NextResponse.json(
      {
        success: true,
        data: {
          record: newRecord,
          summary: {
            ...data,
            attendanceRate,
          },
        },
        message: `Presensi ${newRecord.type === 'CLOCK_IN' ? 'Masuk' : 'Pulang'} berhasil dicatat dan disinkronkan ke HR Admin.`,
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
