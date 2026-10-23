import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { broadcastAuditEvent } from './auditSSE';

export interface AuditLogEntry {
  id: string;
  module: 'AUTH' | 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'PERFORMANCE' | 'ANNOUNCEMENTS';
  action: string;
  recordId: string;
  userName: string;
  userEmail: string;
  userNik?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  createdAt?: string;
  oldData: any | null;
  newData: any | null;
}

export interface AuditRetentionMeta {
  policy: '7_DAYS_ROLLING';
  retentionDays: number;
  retentionHours: number;
  totalActiveLogs: number;
  safetyGuarantee: string;
  lastPrunedAt?: string;
}

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const AUDIT_FILE = path.join(STORAGE_DIR, 'nexora_audit_logs.json');

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_Jv7SzD1PgcQl@ep-shiny-silence-azkjdzr3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL;

// Zero dummy/mock data: strictly empty initial array
export const INITIAL_LOGS: AuditLogEntry[] = [];

function getDb() {
  return neon(DATABASE_URL);
}

export function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(AUDIT_FILE)) {
      fs.writeFileSync(AUDIT_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch {}
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    ensureStorage();
    if (fs.existsSync(AUDIT_FILE)) {
      const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

export function saveStoredAuditLogs(logs: AuditLogEntry[]): void {
  try {
    ensureStorage();
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch {}
}

// Track last pruning time to throttle automatic cleanup (max once every 5 minutes)
let lastPruneTimestamp = 0;
const PRUNE_THROTTLE_MS = 5 * 60 * 1000;

/**
 * 7-Day Rolling Retention Auto-Prune Engine
 * Deletes audit logs strictly older than 7 full days (168 hours).
 * 
 * Safety Guarantee (Weekend & New Log Immunity):
 * Uses precise timestamp evaluation (`created_at < NOW() - INTERVAL '7 days'`).
 * A log created on Saturday (or any other day/hour) will NEVER be purged on that
 * Saturday or weekend because its age is far less than 168 hours.
 */
export async function pruneExpiredAuditLogs(): Promise<number> {
  const now = Date.now();
  if (now - lastPruneTimestamp < PRUNE_THROTTLE_MS) {
    return 0; // Throttled to preserve database throughput
  }
  lastPruneTimestamp = now;

  try {
    const sql = getDb();
    const result = await sql.query(
      `DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '7 days'`
    );
    return Array.isArray(result) ? result.length : 0;
  } catch (err: any) {
    console.warn('[AuditRetention] Auto-prune warning:', err?.message);
    return 0;
  }
}

/**
 * Format date to standard Indonesian WIB string
 */
export function formatWibTimestamp(date: Date = new Date()): string {
  const d = date.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).split('/').reverse().join('-');

  const t = date.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
  });

  return `${d} ${t} WIB`;
}

/**
 * Record a real-time audit log directly into Neon PostgreSQL
 * Automatically enforces 7-day retention and broadcasts via SSE.
 */
export async function recordAuditLog(payload: {
  id?: string;
  module: 'AUTH' | 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'PERFORMANCE' | 'ANNOUNCEMENTS';
  action: string;
  recordId: string;
  userName: string;
  userEmail: string;
  userNik?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
  oldData?: any;
  newData?: any;
}): Promise<AuditLogEntry> {
  // Enforce valid UUID for primary key
  const validId = payload.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id)
    ? payload.id
    : crypto.randomUUID();

  const now = new Date();
  const timestampStr = payload.timestamp || formatWibTimestamp(now);
  const ip = payload.ipAddress || '127.0.0.1';
  const ua = payload.userAgent || 'Nexora Internal Engine';
  const oldJson = JSON.stringify(payload.oldData ?? null);
  const newJson = JSON.stringify(payload.newData ?? null);

  const entry: AuditLogEntry = {
    id: validId,
    module: payload.module,
    action: payload.action,
    recordId: payload.recordId,
    userName: payload.userName,
    userEmail: payload.userEmail,
    userNik: payload.userNik || undefined,
    ipAddress: ip,
    userAgent: ua,
    timestamp: timestampStr,
    createdAt: now.toISOString(),
    oldData: payload.oldData ?? null,
    newData: payload.newData ?? null,
  };

  // 1. Persist directly to Neon PostgreSQL database
  try {
    const sql = getDb();
    await sql.query(
      `INSERT INTO audit_logs (
        id, module, action, record_id, user_name, user_email, user_nik, 
        ip_address, user_agent, old_data, new_data, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, NOW()
      )`,
      [
        entry.id,
        entry.module,
        entry.action,
        entry.recordId,
        entry.userName,
        entry.userEmail,
        entry.userNik || null,
        entry.ipAddress,
        entry.userAgent,
        oldJson,
        newJson,
      ]
    );

    // Run non-blocking auto-prune for records older than 7 days
    pruneExpiredAuditLogs().catch(() => {});
  } catch (dbErr: any) {
    console.error('[recordAuditLog] Neon DB insert error:', dbErr?.message);
  }

  // 2. Update local mirror cache (capped at 100 recent entries)
  try {
    const current = getStoredAuditLogs();
    const updated = [entry, ...current.filter((c) => c.id !== entry.id)].slice(0, 100);
    saveStoredAuditLogs(updated);
  } catch {}

  // 3. Broadcast real-time SSE event to all connected admin listeners
  try {
    broadcastAuditEvent('AUDIT_LOG_CREATED', entry);
  } catch {}

  return entry;
}

/**
 * Fetch audit logs strictly within the 7-day retention window from Neon PostgreSQL
 */
export async function getAuditLogsFromDb(params?: {
  module?: string;
  search?: string;
  limit?: number;
}): Promise<{
  logs: AuditLogEntry[];
  total: number;
  retention: AuditRetentionMeta;
}> {
  // Trigger background prune check
  pruneExpiredAuditLogs().catch(() => {});

  const sql = getDb();
  const limit = params?.limit || 200;

  try {
    const rows = await sql.query(
      `SELECT 
        a.id, 
        a.module, 
        a.action, 
        a.record_id, 
        a.ip_address, 
        a.user_agent, 
        a.old_data, 
        a.new_data, 
        a.created_at,
        COALESCE(NULLIF(a.user_name, ''), TRIM(CONCAT(e.first_name, ' ', e.last_name)), u.email, 'Sistem') AS user_name,
        COALESCE(NULLIF(a.user_email, ''), u.email, 'system@nexora.local') AS user_email,
        COALESCE(NULLIF(a.user_nik, ''), e.employee_number, '') AS user_nik
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN employees e ON e.user_id = u.id
      WHERE a.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY a.created_at DESC
      LIMIT $1`,
      [limit]
    );

    const dbLogs: AuditLogEntry[] = (Array.isArray(rows) ? rows : []).map((r: any) => {
      const createdAtDate = r.created_at ? new Date(r.created_at) : new Date();
      return {
        id: String(r.id),
        module: (r.module || 'AUTH') as any,
        action: r.action || 'ACTIVITY',
        recordId: r.record_id || '-',
        userName: r.user_name || 'Karyawan',
        userEmail: r.user_email || 'user@nexora.local',
        userNik: r.user_nik || undefined,
        ipAddress: r.ip_address || '127.0.0.1',
        userAgent: r.user_agent || 'Client Web',
        timestamp: formatWibTimestamp(createdAtDate),
        createdAt: createdAtDate.toISOString(),
        oldData: r.old_data,
        newData: r.new_data,
      };
    });

    let filtered = dbLogs;

    if (params?.module && params.module !== 'ALL') {
      filtered = filtered.filter((l) => l.module === params.module);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.userEmail.toLowerCase().includes(q) ||
          (l.userNik && l.userNik.toLowerCase().includes(q)) ||
          l.ipAddress.includes(q)
      );
    }

    // Mirror to local cache so offline access reflects real DB
    saveStoredAuditLogs(dbLogs.slice(0, 100));

    return {
      logs: filtered,
      total: dbLogs.length,
      retention: {
        policy: '7_DAYS_ROLLING',
        retentionDays: 7,
        retentionHours: 168,
        totalActiveLogs: dbLogs.length,
        safetyGuarantee:
          'Seluruh log audit dijamin tersimpan utuh selama 7 hari (168 jam) sejak timestamp dibuat. Log akhir pekan (Sabtu/Minggu) terproteksi aman dan tidak akan terhapus prematur.',
        lastPrunedAt: new Date(lastPruneTimestamp || Date.now()).toISOString(),
      },
    };
  } catch (err: any) {
    console.error('[getAuditLogsFromDb] Neon DB query error:', err?.message);
    // Fallback to local stored cache if DB is temporarily unreachable
    const cached = getStoredAuditLogs();
    return {
      logs: cached,
      total: cached.length,
      retention: {
        policy: '7_DAYS_ROLLING',
        retentionDays: 7,
        retentionHours: 168,
        totalActiveLogs: cached.length,
        safetyGuarantee: 'Cache lokal aktif dalam masa retensi 7 hari.',
      },
    };
  }
}
