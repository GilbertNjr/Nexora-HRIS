import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { broadcastAuditEvent } from '@/lib/auditSSE';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface AuditLogEntry {
  id: string;
  module: 'AUTH' | 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL';
  action: string;
  recordId: string;
  userName: string;
  userEmail: string;
  userNik?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  oldData: any | null;
  newData: any | null;
}

const DATABASE_URL = process.env.DATABASE_URL;
const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const AUDIT_FILE = path.join(STORAGE_DIR, 'nexora_audit_logs.json');

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    module: 'PAYROLL',
    action: 'PAYROLL_PERIOD_LOCKED',
    recordId: 'per-03',
    userName: 'HR Administrator',
    userEmail: 'admin@nexora.local',
    userNik: 'NX-2026-0000',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
    timestamp: '2026-09-27 10:45:12 WIB',
    oldData: { status: 'VERIFIED' },
    newData: { status: 'LOCKED', lockedAt: '2026-09-27T10:45:12Z', invariant: 'REQ-DEC-09' },
  },
  {
    id: 'aud-002',
    module: 'LEAVE',
    action: 'LEAVE_APPROVAL_DECIDED',
    recordId: 'app-101',
    userName: 'Rina Wijaya (Head of Tech)',
    userEmail: 'rina.wijaya@nexora.local',
    userNik: 'NX-2026-0005',
    ipAddress: '10.0.4.15',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: '2026-09-27 09:30:00 WIB',
    oldData: { status: 'PENDING' },
    newData: {
      status: 'APPROVED',
      employee: 'Budi Santoso',
      totalDays: 2,
      tierLevel: 1,
      attendanceMarked: 'ON_LEAVE',
    },
  },
  {
    id: 'aud-003',
    module: 'ATTENDANCE',
    action: 'CLOCK_IN_GEOFENCE_VERIFIED',
    recordId: 'att-502',
    userName: 'Budi Santoso',
    userEmail: 'employee@nexora.local',
    userNik: 'NX-2026-0001',
    ipAddress: '114.122.35.88',
    userAgent: 'Nexora Mobile ESS / Android 14',
    timestamp: '2026-09-27 08:52:19 WIB',
    oldData: null,
    newData: {
      distanceMeters: 25.4,
      officeRadiusLimit: 100,
      lateMinutes: 0,
      status: 'PRESENT',
      gpsCoordinates: '-6.2255, 106.8095',
    },
  },
  {
    id: 'aud-004',
    module: 'AUTH',
    action: 'LOGIN_SUCCESS',
    recordId: 'usr-admin',
    userName: 'HR Administrator',
    userEmail: 'admin@nexora.local',
    userNik: 'NX-2026-0000',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: '2026-09-27 08:00:22 WIB',
    oldData: null,
    newData: { role: 'HR_ADMIN', portal: 'ADMIN', mfaVerified: true },
  },
  {
    id: 'aud-005',
    module: 'EMPLOYEE',
    action: 'EMPLOYEE_CREATED_WITH_PROVISION',
    recordId: 'emp-04',
    userName: 'HR Administrator',
    userEmail: 'admin@nexora.local',
    userNik: 'NX-2026-0000',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: '2026-09-26 16:15:40 WIB',
    oldData: null,
    newData: {
      employeeNumber: 'NX-2026-0004',
      fullName: 'Dewi Lestari',
      department: 'Marketing & Growth',
      designation: 'Digital Marketing Lead',
      bankAccountEncrypted: true,
    },
  },
];

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(AUDIT_FILE)) {
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(INITIAL_LOGS, null, 2), 'utf-8');
    }
  } catch {}
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    ensureStorage();
    if (fs.existsSync(AUDIT_FILE)) {
      const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {}
  return INITIAL_LOGS;
}

export function saveStoredAuditLogs(logs: AuditLogEntry[]): void {
  try {
    ensureStorage();
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch {}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module') || 'ALL';
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    let logs = getStoredAuditLogs();

    // If Neon DB is available, attempt to query database
    if (DATABASE_URL) {
      try {
        const sql = neon(DATABASE_URL);
        const rows = await sql.query(
          `SELECT a.id, a.module, a.action, a.record_id, a.ip_address, a.user_agent, 
                  a.old_data, a.new_data, a.created_at,
                  u.email as user_email, e.first_name, e.last_name, e.employee_number
           FROM audit_logs a
           LEFT JOIN users u ON a.user_id = u.id
           LEFT JOIN employees e ON e.user_id = u.id
           ORDER BY a.created_at DESC
           LIMIT 100`
        );

        if (Array.isArray(rows) && rows.length > 0) {
          const dbLogs: AuditLogEntry[] = rows.map((r: any) => ({
            id: r.id,
            module: (r.module || 'AUTH') as any,
            action: r.action || 'ACTIVITY',
            recordId: r.record_id || '-',
            userName: `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.user_email || 'Sistem',
            userEmail: r.user_email || 'system@nexora.local',
            userNik: r.employee_number || undefined,
            ipAddress: r.ip_address || '127.0.0.1',
            userAgent: r.user_agent || 'Unknown Client',
            timestamp: new Date(r.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
            oldData: r.old_data,
            newData: r.new_data,
          }));

          // Merge dbLogs and local logs, unique by id
          const idMap = new Set(dbLogs.map((l) => l.id));
          logs = [...dbLogs, ...logs.filter((l) => !idMap.has(l.id))];
        }
      } catch {}
    }

    // Filter
    let filtered = logs.filter((log) => {
      const matchModule = moduleFilter === 'ALL' || log.module === moduleFilter;
      const matchSearch =
        !search ||
        log.action.toLowerCase().includes(search) ||
        log.userName.toLowerCase().includes(search) ||
        log.userEmail.toLowerCase().includes(search) ||
        log.ipAddress.includes(search);
      return matchModule && matchSearch;
    });

    return NextResponse.json({
      success: true,
      data: filtered,
      meta: { total: filtered.length },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Gagal mengambil log audit' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).split('/').reverse().join('-') +
      ' ' +
      now.toLocaleTimeString('id-ID') +
      ' WIB';

    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      module: body.module || 'AUTH',
      action: body.action || 'ACTIVITY',
      recordId: body.recordId || `rec-${Date.now()}`,
      userName: body.userName || 'Karyawan',
      userEmail: body.userEmail || 'user@nexora.local',
      userNik: body.userNik || undefined,
      ipAddress: body.ipAddress || request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: body.userAgent || request.headers.get('user-agent') || 'Browser Web Client',
      timestamp: timestampStr,
      oldData: body.oldData || null,
      newData: body.newData || null,
    };

    // 1. Save to local storage
    const currentLogs = getStoredAuditLogs();
    const updatedLogs = [newLog, ...currentLogs.slice(0, 99)];
    saveStoredAuditLogs(updatedLogs);

    // 2. Persist to Neon DB if available
    if (DATABASE_URL) {
      try {
        const sql = neon(DATABASE_URL);
        await sql.query(
          `INSERT INTO audit_logs (id, module, action, record_id, ip_address, user_agent, old_data, new_data, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            newLog.id,
            newLog.module,
            newLog.action,
            newLog.recordId,
            newLog.ipAddress,
            newLog.userAgent,
            JSON.stringify(newLog.oldData),
            JSON.stringify(newLog.newData),
          ]
        );
      } catch {}
    }

    // 3. Broadcast real-time SSE event to all connected admin listeners
    broadcastAuditEvent('AUDIT_LOG_CREATED', newLog);

    return NextResponse.json({
      success: true,
      data: newLog,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Gagal menyimpan log audit' } },
      { status: 500 }
    );
  }
}
