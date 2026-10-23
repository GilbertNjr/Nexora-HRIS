import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { ApprovalItem } from '@/app/api/v1/approvals/route';

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_Jv7SzD1PgcQl@ep-shiny-silence-azkjdzr3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL;

function getDb() {
  return neon(DATABASE_URL);
}

export async function getLeaveRequestsFromDb(): Promise<ApprovalItem[]> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT 
        lr.id,
        lr.employee_id,
        lr.leave_type_id,
        TO_CHAR(lr.start_date, 'YYYY-MM-DD') as start_date_str,
        TO_CHAR(lr.end_date, 'YYYY-MM-DD') as end_date_str,
        lr.total_days,
        lr.reason,
        lr.document_url,
        lr.status,
        TO_CHAR(lr.created_at, 'YYYY-MM-DD HH24:MI') as created_at_str,
        e.employee_number,
        e.first_name,
        e.last_name,
        e.avatar_url,
        d.name as department_name,
        lt.name as leave_type_name,
        lt.code as leave_type_code
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      ORDER BY lr.created_at DESC
    `;

    return rows.map((r: any) => {
      const isSick = r.leave_type_code === 'SICK' || r.leave_type_name?.toLowerCase().includes('sakit');
      const isKhusus = r.leave_type_name?.toLowerCase().includes('khusus') || r.leave_type_name?.toLowerCase().includes('dispensasi');
      const typeCategory: 'tahunan' | 'sakit' | 'khusus' = isSick ? 'sakit' : isKhusus ? 'khusus' : 'tahunan';

      const employeeFullName = `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Rian Pratama';
      const initials = employeeFullName
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'RP';

      const durationDays = Number(r.total_days) || 1;
      const statusMap: Record<string, 'PENDING' | 'PENDING_SPV' | 'PENDING_HRD' | 'APPROVED' | 'REJECTED'> = {
        PENDING: 'PENDING',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        CANCELLED: 'REJECTED',
      };

      return {
        id: r.id,
        name: employeeFullName,
        nik: r.employee_number || 'NX-2021008',
        role: `Karyawan • ${r.department_name || 'Operasional'}`,
        department: r.department_name || 'Teknologi Informasi',
        avatarUrl: r.avatar_url || undefined,
        type: 'cuti',
        leaveType: r.leave_type_name || 'Cuti Tahunan',
        typeCategory,
        title: `Permohonan ${r.leave_type_name}: ${r.reason || 'Urusan Pribadi'}`,
        highlightType: r.leave_type_name || 'Cuti Tahunan',
        detail: `${durationDays} Hari (${r.start_date_str} s/d ${r.end_date_str})`,
        startDate: r.start_date_str,
        endDate: r.end_date_str,
        durationDays,
        remainingQuota: 12 - durationDays,
        totalQuota: 12,
        reason: r.reason || 'Pengajuan via ESS',
        quotaMeta: isSick ? 'Izin Sakit Berbayar' : `Sisa Kuota: ${12 - durationDays} Hari`,
        timestamp: r.created_at_str || 'Hari ini',
        hasAttachment: Boolean(r.document_url),
        documentName: r.document_url ? r.document_url.split('/').pop() : undefined,
        documentUrl: r.document_url || '#',
        avatarColor: isSick ? 'from-amber-500 to-rose-500' : 'from-blue-600 to-indigo-600',
        initials,
        verifiedBadge: isSick ? 'alert' : 'check',
        status: statusMap[r.status] || 'PENDING',
        submittedDate: r.start_date_str,
      };
    });
  } catch (err) {
    console.warn('[leaveDb] Error fetching leave_requests from Neon DB:', err);
    return [];
  }
}

export async function saveLeaveRequestToDb(item: Partial<ApprovalItem>): Promise<string | null> {
  try {
    const sql = getDb();
    const employeeIdOrNik = item.nik || 'NX-2021008';

    // 1. Find employee
    const emps = await sql`
      SELECT id FROM employees 
      WHERE employee_number = ${employeeIdOrNik} OR id::text = ${employeeIdOrNik}
      LIMIT 1
    `;
    let employeeUuid: string | null = null;
    if (emps.length > 0) {
      employeeUuid = emps[0].id;
    } else {
      const fallback = await sql`SELECT id FROM employees LIMIT 1`;
      if (fallback.length > 0) employeeUuid = fallback[0].id;
    }

    if (!employeeUuid) {
      console.warn('[leaveDb] No employee found for leave request');
      return null;
    }

    // 2. Find matching leave type
    const isSick = item.typeCategory === 'sakit' || item.leaveType?.toLowerCase().includes('sakit');
    const targetCode = isSick ? 'SICK' : 'ANNUAL';
    const types = await sql`SELECT id FROM leave_types WHERE code = ${targetCode} LIMIT 1`;
    let leaveTypeId: string | null = null;
    if (types.length > 0) {
      leaveTypeId = types[0].id;
    } else {
      const anyType = await sql`SELECT id FROM leave_types LIMIT 1`;
      if (anyType.length > 0) leaveTypeId = anyType[0].id;
    }

    if (!leaveTypeId) {
      console.warn('[leaveDb] No leave type found in database');
      return null;
    }

    const reqId = item.id && item.id.includes('-') && item.id.length === 36 ? item.id : crypto.randomUUID();
    const startDate = item.startDate || new Date().toISOString().split('T')[0];
    const endDate = item.endDate || startDate;
    const totalDays = item.durationDays || 1;
    const reason = item.reason || item.title || 'Keperluan Pribadi';
    const documentUrl = item.documentName || item.attachmentName || item.documentUrl || null;
    const status = item.status === 'APPROVED' ? 'APPROVED' : item.status === 'REJECTED' ? 'REJECTED' : 'PENDING';

    await sql`
      INSERT INTO leave_requests (
        id, employee_id, leave_type_id, start_date, end_date, total_days, reason, document_url, status, created_at, updated_at
      ) VALUES (
        ${reqId}, 
        ${employeeUuid}, 
        ${leaveTypeId}, 
        ${startDate}::date, 
        ${endDate}::date, 
        ${totalDays}, 
        ${reason}, 
        ${documentUrl}, 
        ${status}::"LeaveStatus", 
        NOW(), 
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW()
    `;

    return reqId;
  } catch (err) {
    console.error('[leaveDb] Error saving leave_request to Neon DB:', err);
    return null;
  }
}

export async function updateLeaveRequestStatusInDb(
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED'
): Promise<boolean> {
  try {
    const sql = getDb();
    await sql`
      UPDATE leave_requests
      SET status = ${status}::"LeaveStatus", updated_at = NOW()
      WHERE id = ${id} OR id::text = ${id}
    `;
    return true;
  } catch (err) {
    console.error('[leaveDb] Error updating leave_request status in Neon DB:', err);
    return false;
  }
}
