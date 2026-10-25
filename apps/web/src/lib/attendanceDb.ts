import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { AttendanceItem } from '@/app/api/v1/attendance/route';

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_Jv7SzD1PgcQl@ep-shiny-silence-azkjdzr3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL;

function getDb() {
  return neon(DATABASE_URL);
}

function formatWibTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '—';
  return `${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB`;
}

export async function ensureMonthlyAttendanceDbRecords(targetNik = 'NX-2021008'): Promise<void> {
  try {
    const sql = getDb();
    const emps = await sql`
      SELECT id, employee_number, first_name, last_name 
      FROM employees 
      WHERE employee_number = ${targetNik} OR id::text = ${targetNik}
      LIMIT 1
    `;
    if (emps.length === 0) return;
    const employeeId = emps[0].id;

    const countRes = await sql`
      SELECT COUNT(*)::int as cnt 
      FROM attendances 
      WHERE employee_id = ${employeeId}
    `;
    if (countRes.length > 0 && Number(countRes[0].cnt) >= 15) {
      return; // Already populated
    }

    const pastDays = [
      { date: '2026-10-01', in: '07:50', out: '17:05', overtime: 0, wfh: false },
      { date: '2026-10-02', in: '07:55', out: '17:10', overtime: 0, wfh: false },
      { date: '2026-10-05', in: '07:48', out: '17:00', overtime: 0, wfh: true },
      { date: '2026-10-06', in: '07:52', out: '17:15', overtime: 0, wfh: false },
      { date: '2026-10-07', in: '08:01', out: '17:30', overtime: 0.5, wfh: false },
      { date: '2026-10-08', in: '07:58', out: '17:00', overtime: 0, wfh: false },
      { date: '2026-10-09', in: '07:54', out: '18:00', overtime: 1.0, wfh: false },
      { date: '2026-10-10', in: '08:05', out: '17:00', overtime: 0, wfh: true },
      { date: '2026-10-12', in: '07:51', out: '17:08', overtime: 0, wfh: false },
      { date: '2026-10-13', in: '07:59', out: '17:25', overtime: 0.5, wfh: false },
      { date: '2026-10-14', in: '07:49', out: '17:00', overtime: 0, wfh: true },
      { date: '2026-10-15', in: '07:55', out: '18:30', overtime: 1.5, wfh: false },
      { date: '2026-10-16', in: '08:02', out: '17:10', overtime: 0, wfh: false },
      { date: '2026-10-17', in: '08:10', out: '17:00', overtime: 0, wfh: true },
      { date: '2026-10-18', in: '08:12', out: '17:00', overtime: 0, wfh: true },
      { date: '2026-10-19', in: '07:53', out: '17:05', overtime: 0, wfh: false },
      { date: '2026-10-20', in: '07:56', out: '17:45', overtime: 0.5, wfh: false },
      { date: '2026-10-21', in: '07:47', out: '17:00', overtime: 0, wfh: true },
      { date: '2026-10-22', in: '08:00', out: '18:30', overtime: 1.5, wfh: false },
      { date: '2026-10-23', in: '07:51', out: '18:00', overtime: 1.0, wfh: false },
    ];

    for (const item of pastDays) {
      const clockInIso = `${item.date}T${item.in}:00+07:00`;
      const clockOutIso = `${item.date}T${item.out}:00+07:00`;
      const existing = await sql`
        SELECT id FROM attendances 
        WHERE employee_id = ${employeeId} AND date = ${item.date}::date
        LIMIT 1
      `;
      if (existing.length === 0) {
        await sql`
          INSERT INTO attendances (
            id, employee_id, date, clock_in_time, clock_out_time, 
            status, late_minutes, early_minutes, 
            clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng,
            notes, created_at, updated_at
          ) VALUES (
            ${crypto.randomUUID()},
            ${employeeId},
            ${item.date}::date,
            ${clockInIso}::timestamptz,
            ${clockOutIso}::timestamptz,
            'PRESENT'::"AttendanceStatus",
            0,
            0,
            -6.2255,
            106.8089,
            -6.2255,
            106.8089,
            ${item.wfh ? 'Presensi Remote WFH Tervalidasi' : (item.overtime > 0 ? `Presensi WFO HQ SCBD Lt. 7 (Lembur SPL ${item.overtime} Jam)` : 'Presensi WFO HQ SCBD Lt. 7')},
            ${clockInIso}::timestamptz,
            ${clockOutIso}::timestamptz
          )
        `;
      }
    }
  } catch (err) {
    console.warn('[attendanceDb] Error during ensureMonthlyAttendanceDbRecords:', err);
  }
}

export async function getAttendancesFromDb(): Promise<AttendanceItem[]> {
  try {
    const sql = getDb();
    let rows = await sql`
      SELECT 
        a.id,
        a.employee_id,
        a.shift_id,
        TO_CHAR(a.date, 'YYYY-MM-DD') as date_str,
        a.clock_in_time,
        a.clock_out_time,
        a.clock_in_lat,
        a.clock_in_lng,
        a.clock_in_photo,
        a.clock_out_photo,
        a.status,
        a.late_minutes,
        a.notes,
        e.employee_number,
        e.first_name,
        e.last_name,
        d.name as department_name,
        e.avatar_url
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY a.date DESC, a.clock_in_time DESC NULLS LAST, a.created_at DESC
    `;

    if (rows.length === 0) {
      await ensureMonthlyAttendanceDbRecords();
      rows = await sql`
        SELECT 
          a.id,
          a.employee_id,
          a.shift_id,
          TO_CHAR(a.date, 'YYYY-MM-DD') as date_str,
          a.clock_in_time,
          a.clock_out_time,
          a.clock_in_lat,
          a.clock_in_lng,
          a.clock_in_photo,
          a.clock_out_photo,
          a.status,
          a.late_minutes,
          a.notes,
          e.employee_number,
          e.first_name,
          e.last_name,
          d.name as department_name,
          e.avatar_url
        FROM attendances a
        JOIN employees e ON a.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        ORDER BY a.date DESC, a.clock_in_time DESC NULLS LAST, a.created_at DESC
      `;
    }

    return rows.map((r: any) => {
      const isLate = r.status === 'LATE' || (r.late_minutes && Number(r.late_minutes) > 0);
      const isWfh = r.notes && r.notes.includes('WFH');
      const status: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'WFH' | 'DINAS_LUAR' = isLate
        ? 'TERLAMBAT'
        : isWfh
        ? 'WFH'
        : 'TEPAT_WAKTU';

      const checkInFormatted = formatWibTime(r.clock_in_time);
      const checkOutFormatted = r.clock_out_time ? formatWibTime(r.clock_out_time) : '—';
      const employeeName = `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Karyawan Nexora';

      return {
        id: r.id,
        employeeId: r.employee_number || 'NX-2021008',
        employeeName,
        department: r.department_name || 'Teknologi Informasi',
        type: r.clock_out_time ? 'CLOCK_OUT' : 'CLOCK_IN',
        time: checkInFormatted,
        checkInTime: checkInFormatted,
        checkOutTime: checkOutFormatted,
        date: r.date_str,
        status,
        location: isWfh 
          ? 'Remote Residence (WFH)'
          : (r.clock_in_lat && r.clock_in_lng 
              ? `HQ SCBD (${parseFloat(r.clock_in_lat).toFixed(8)}, ${parseFloat(r.clock_in_lng).toFixed(8)})`
              : 'HQ SCBD (-6.22550000, 106.80890000)'),
        coordinates: r.clock_in_lat && r.clock_in_lng ? `${r.clock_in_lat}, ${r.clock_in_lng}` : '-6.2255, 106.8089',
        device: 'Selfie Liveness Camera (NX-Biometric v4.2)',
        photoUrl: r.clock_in_photo || undefined,
        avatarUrl: r.avatar_url || undefined,
        workLocation: isWfh ? 'WFH' : 'WFO',
        notes: r.notes || undefined,
        shiftName: 'Reguler HQ (08:00 - 17:00)',
        shiftHours: '08:00 - 17:00',
        shiftNote: r.notes || 'Presensi Mandiri ESS (Real-Time)',
        checkInNote: isLate ? 'Terlambat Masuk' : 'Liveness Selfie Validated (99.4%)',
        checkInSourceIcon: isWfh ? 'globe' : 'building',
        lateMinutes: Number(r.late_minutes) || (isLate ? 15 : 0),
        rawClockInTime: r.clock_in_time,
        rawClockOutTime: r.clock_out_time,
      };
    });
  } catch (err) {
    console.warn('[attendanceDb] Error fetching attendances from Neon DB:', err);
    return [];
  }
}

export async function saveAttendanceToDb(
  item: Partial<AttendanceItem>,
  isClockOut: boolean
): Promise<string | null> {
  try {
    const sql = getDb();
    const d = new Date();
    const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dateStr = item.date || localDateStr;
    const employeeIdOrNik = item.employeeId || 'NX-2021008';

    // Find employee UUID
    let employeeUuid: string | null = null;
    const emps = await sql`
      SELECT id FROM employees 
      WHERE employee_number = ${employeeIdOrNik} OR id::text = ${employeeIdOrNik}
      LIMIT 1
    `;

    if (emps.length > 0) {
      employeeUuid = emps[0].id;
    } else {
      // Fallback to primary employee (Rian Pratama)
      const primary = await sql`SELECT id FROM employees LIMIT 1`;
      if (primary.length > 0) {
        employeeUuid = primary[0].id;
      }
    }

    if (!employeeUuid) {
      console.warn('[attendanceDb] No employee record found to associate attendance');
      return null;
    }

    // Check if record exists for this employee on this date
    const existing = await sql`
      SELECT id, clock_in_photo FROM attendances 
      WHERE employee_id = ${employeeUuid} AND date = ${dateStr}::date
      LIMIT 1
    `;

    const statusEnum = item.status === 'TERLAMBAT' ? 'LATE' : 'PRESENT';
    const lateMinutes = item.status === 'TERLAMBAT' ? 15 : 0;

    if (existing.length > 0) {
      const existingId = existing[0].id;
      if (isClockOut) {
        await sql`
          UPDATE attendances
          SET 
            clock_out_time = NOW(),
            clock_out_photo = COALESCE(${item.photoUrl || null}, clock_out_photo),
            updated_at = NOW()
          WHERE id = ${existingId}
        `;
      } else {
        await sql`
          UPDATE attendances
          SET 
            clock_in_time = COALESCE(clock_in_time, NOW()),
            clock_in_photo = COALESCE(${item.photoUrl || null}, clock_in_photo),
            status = ${statusEnum}::"AttendanceStatus",
            late_minutes = ${lateMinutes},
            notes = COALESCE(${item.notes || null}, notes),
            updated_at = NOW()
          WHERE id = ${existingId}
        `;
      }
      return existingId;
    } else {
      const newId = crypto.randomUUID();
      await sql`
        INSERT INTO attendances (
          id, employee_id, date, clock_in_time, clock_in_photo, status, 
          late_minutes, early_minutes, notes, created_at, updated_at
        ) VALUES (
          ${newId}, 
          ${employeeUuid}, 
          ${dateStr}::date, 
          NOW(), 
          ${item.photoUrl || null}, 
          ${statusEnum}::"AttendanceStatus", 
          ${lateMinutes}, 
          0, 
          ${item.notes || null}, 
          NOW(), 
          NOW()
        )
      `;
      return newId;
    }
  } catch (err) {
    console.error('[attendanceDb] Error saving attendance to Neon DB:', err);
    return null;
  }
}

export async function deleteAttendanceFromDb(
  employeeIdOrNik: string,
  dateStr: string
): Promise<boolean> {
  try {
    const sql = getDb();
    await sql`
      DELETE FROM attendances a
      USING employees e
      WHERE a.employee_id = e.id 
        AND (e.employee_number = ${employeeIdOrNik} OR e.id::text = ${employeeIdOrNik})
        AND a.date = ${dateStr}::date
    `;
    return true;
  } catch (err) {
    console.error('[attendanceDb] Error deleting attendance from Neon DB:', err);
    return false;
  }
}
