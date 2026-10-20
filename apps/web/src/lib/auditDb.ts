import fs from 'fs';
import path from 'path';

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

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const AUDIT_FILE = path.join(STORAGE_DIR, 'nexora_audit_logs.json');

export const INITIAL_LOGS: AuditLogEntry[] = [
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

export function ensureStorage(): void {
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
