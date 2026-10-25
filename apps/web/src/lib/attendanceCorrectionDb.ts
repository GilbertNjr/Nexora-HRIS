import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

export interface AttendanceCorrectionItem {
  id: string;
  nik: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  avatarUrl?: string;
  date: string; // YYYY-MM-DD
  targetTime: string; // HH:mm
  correctionType: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
}

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_Jv7SzD1PgcQl@ep-shiny-silence-azkjdzr3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL;

function getDb() {
  return neon(DATABASE_URL);
}

// Resilient file storage fallback
const STORAGE_DIR = path.join(process.cwd(), '.data');
const CORRECTIONS_FILE = path.join(STORAGE_DIR, 'nexora_attendance_corrections.json');

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {}
}

function getStoredFileCorrections(): AttendanceCorrectionItem[] {
  try {
    ensureStorage();
    if (fs.existsSync(CORRECTIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CORRECTIONS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

function saveStoredFileCorrections(data: AttendanceCorrectionItem[]): void {
  try {
    ensureStorage();
    fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

/**
 * Idempotently create attendance_corrections table in Neon PostgreSQL
 */
let tablesInitialized = false;
export async function ensureAttendanceCorrectionsTable(): Promise<void> {
  if (tablesInitialized) return;
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS attendance_corrections (
        id VARCHAR(100) PRIMARY KEY,
        nik VARCHAR(50) NOT NULL,
        employee_name VARCHAR(150),
        employee_role VARCHAR(150),
        department VARCHAR(100),
        avatar_url TEXT,
        date VARCHAR(50) NOT NULL,
        target_time VARCHAR(20) NOT NULL,
        correction_type VARCHAR(150) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        submitted_at VARCHAR(100) NOT NULL,
        reviewed_by VARCHAR(150),
        reviewed_at VARCHAR(100),
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    tablesInitialized = true;
  } catch (err) {
    console.warn('[attendanceCorrectionDb] Error creating table in Neon DB, using fallback:', err);
  }
}

/**
 * Fetch all attendance corrections from Neon PostgreSQL with fallback
 */
export async function getAttendanceCorrectionsFromDb(nik?: string): Promise<AttendanceCorrectionItem[]> {
  await ensureAttendanceCorrectionsTable();

  try {
    const sql = getDb();
    let rows: any[] = [];
    if (nik) {
      rows = await sql`
        SELECT * FROM attendance_corrections 
        WHERE LOWER(nik) = LOWER(${nik}) 
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM attendance_corrections 
        ORDER BY created_at DESC
      `;
    }

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        nik: r.nik,
        employeeName: r.employee_name || 'Rian Pratama, S.Kom',
        employeeRole: r.employee_role || 'Lead Backend Architect',
        department: r.department || 'Teknologi Informasi',
        avatarUrl: r.avatar_url || undefined,
        date: r.date,
        targetTime: r.target_time,
        correctionType: r.correction_type,
        reason: r.reason,
        status: r.status || 'PENDING',
        submittedAt: r.submitted_at,
        reviewedBy: r.reviewed_by || undefined,
        reviewedAt: r.reviewed_at || undefined,
        adminNotes: r.admin_notes || undefined,
      }));
    }
  } catch (err) {
    console.warn('[attendanceCorrectionDb] Error querying Neon DB, using file fallback:', err);
  }

  const list = getStoredFileCorrections();
  if (nik) {
    return list.filter((c) => !c.nik || c.nik.toLowerCase() === nik.toLowerCase());
  }
  return list;
}

/**
 * Save new attendance correction request
 */
export async function saveAttendanceCorrectionToDb(
  item: AttendanceCorrectionItem
): Promise<AttendanceCorrectionItem> {
  await ensureAttendanceCorrectionsTable();

  try {
    const sql = getDb();
    await sql`
      INSERT INTO attendance_corrections (
        id, nik, employee_name, employee_role, department, avatar_url,
        date, target_time, correction_type, reason, status, submitted_at,
        reviewed_by, reviewed_at, admin_notes, created_at, updated_at
      ) VALUES (
        ${item.id},
        ${item.nik},
        ${item.employeeName},
        ${item.employeeRole},
        ${item.department},
        ${item.avatarUrl || null},
        ${item.date},
        ${item.targetTime},
        ${item.correctionType},
        ${item.reason},
        ${item.status || 'PENDING'},
        ${item.submittedAt},
        ${item.reviewedBy || null},
        ${item.reviewedAt || null},
        ${item.adminNotes || null},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        date = EXCLUDED.date,
        target_time = EXCLUDED.target_time,
        correction_type = EXCLUDED.correction_type,
        reason = EXCLUDED.reason,
        status = EXCLUDED.status,
        reviewed_by = EXCLUDED.reviewed_by,
        reviewed_at = EXCLUDED.reviewed_at,
        admin_notes = EXCLUDED.admin_notes,
        updated_at = NOW();
    `;
  } catch (err) {
    console.warn('[attendanceCorrectionDb] Error inserting into Neon DB, writing to file:', err);
  }

  // File fallback mirror
  const list = getStoredFileCorrections();
  const existingIdx = list.findIndex((c) => c.id === item.id);
  if (existingIdx !== -1) {
    list[existingIdx] = item;
  } else {
    list.unshift(item);
  }
  saveStoredFileCorrections(list);

  return item;
}

/**
 * Approve or Reject attendance correction and apply to Neon attendances table
 */
export async function updateAttendanceCorrectionStatusInDb(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedBy: string = 'Dewi Lestari, S.Psi (HR Admin)',
  adminNotes?: string
): Promise<{ success: boolean; item?: AttendanceCorrectionItem }> {
  await ensureAttendanceCorrectionsTable();

  const all = await getAttendanceCorrectionsFromDb();
  const item = all.find((c) => c.id === id);

  if (!item) {
    return { success: false };
  }

  const nowStr =
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()) +
    ' • ' +
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
    ' WIB';

  item.status = status;
  item.reviewedBy = reviewedBy;
  item.reviewedAt = nowStr;
  if (adminNotes) item.adminNotes = adminNotes;

  // 1. Update correction record in Neon DB
  try {
    const sql = getDb();
    await sql`
      UPDATE attendance_corrections
      SET 
        status = ${status},
        reviewed_by = ${reviewedBy},
        reviewed_at = ${nowStr},
        admin_notes = COALESCE(${adminNotes || null}, admin_notes),
        updated_at = NOW()
      WHERE id = ${id}
    `;
  } catch (err) {
    console.warn('[attendanceCorrectionDb] Error updating status in Neon DB:', err);
  }

  // 2. Mirror to file
  const list = getStoredFileCorrections();
  const idx = list.findIndex((c) => c.id === id);
  if (idx !== -1) {
    list[idx] = item;
    saveStoredFileCorrections(list);
  }

  // 3. If APPROVED, physically apply the correction to the attendances ledger in Neon DB!
  if (status === 'APPROVED') {
    try {
      await applyCorrectionToAttendanceLedger(item);
    } catch (ledgerErr) {
      console.warn('[attendanceCorrectionDb] Error applying correction to attendance ledger:', ledgerErr);
    }
  }

  return { success: true, item };
}

/**
 * Applies approved correction to the real attendances ledger in Neon PostgreSQL
 */
async function applyCorrectionToAttendanceLedger(correction: AttendanceCorrectionItem): Promise<void> {
  const sql = getDb();
  const dateStr = correction.date; // e.g. "2026-10-25" or "25/10/2026"
  // Normalize date format to YYYY-MM-DD
  let normalizedDate = dateStr;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

  // Find employee UUID
  const emps = await sql`
    SELECT id FROM employees 
    WHERE employee_number = ${correction.nik} OR id::text = ${correction.nik}
    LIMIT 1
  `;
  if (emps.length === 0) return;
  const employeeUuid = emps[0].id;

  // Construct target timestamp
  const targetTimeStr = correction.targetTime || '17:00';
  const targetIsoTime = `${normalizedDate}T${targetTimeStr.padStart(5, '0')}:00+07:00`;

  const isTapOut =
    correction.correctionType.toLowerCase().includes('tap-out') ||
    correction.correctionType.toLowerCase().includes('pulang') ||
    parseInt(targetTimeStr.split(':')[0], 10) >= 13;

  // Check if attendance record exists for this date
  const existing = await sql`
    SELECT id, clock_in_time, clock_out_time FROM attendances
    WHERE employee_id = ${employeeUuid} AND date = ${normalizedDate}::date
    LIMIT 1
  `;

  const noteText = `Terkoreksi Resmi HR Operations: ${correction.correctionType} (${correction.reason || 'Koreksi Disetujui'})`;

  if (existing.length > 0) {
    const existingId = existing[0].id;
    if (isTapOut) {
      await sql`
        UPDATE attendances
        SET 
          clock_out_time = ${targetIsoTime}::timestamptz,
          notes = ${noteText},
          updated_at = NOW()
        WHERE id = ${existingId}
      `;
    } else {
      await sql`
        UPDATE attendances
        SET 
          clock_in_time = ${targetIsoTime}::timestamptz,
          status = 'PRESENT'::"AttendanceStatus",
          late_minutes = 0,
          notes = ${noteText},
          updated_at = NOW()
        WHERE id = ${existingId}
      `;
    }
  } else {
    // Insert new attendance record for that date
    const newId = crypto.randomUUID();
    const clockIn = isTapOut ? `${normalizedDate}T08:30:00+07:00` : targetIsoTime;
    const clockOut = isTapOut ? targetIsoTime : null;

    await sql`
      INSERT INTO attendances (
        id, employee_id, date, clock_in_time, clock_out_time,
        status, late_minutes, early_minutes, notes, created_at, updated_at
      ) VALUES (
        ${newId},
        ${employeeUuid},
        ${normalizedDate}::date,
        ${clockIn}::timestamptz,
        ${clockOut ? sql`${clockOut}::timestamptz` : null},
        'PRESENT'::"AttendanceStatus",
        0,
        0,
        ${noteText},
        NOW(),
        NOW()
      )
    `;
  }
}
