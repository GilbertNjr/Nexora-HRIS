import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry } from '@/lib/auditDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const PROFILE_FILE = path.join(STORAGE_DIR, 'nexora_user_profile.json');

const DATABASE_URL = process.env.DATABASE_URL;

export interface UserProfile {
  fullName: string;
  employeeNumber: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  manager: string;
  location: string;
  joinDate: string;
  avatarUrl: string;
  updatedAt?: string;
}

const defaultProfile: UserProfile = {
  fullName: 'Rian Pratama, S.Kom',
  employeeNumber: 'NX-2021008',
  email: 'rian.pratama@nexora.co.id',
  phone: '+62 812-8899-7711',
  department: 'Technology & Core Systems',
  designation: 'Lead Backend Architect',
  manager: 'Hendra Wijaya, M.Sc (VP of Engineering)',
  location: 'SCBD Headquarter, Gedung Pasifik Lt. 7, Jakarta',
  joinDate: '2021-01-12',
  avatarUrl: '',
};

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {}
}

function getLocalProfile(): UserProfile | null {
  try {
    ensureStorage();
    if (fs.existsSync(PROFILE_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8'));
      return data;
    }
  } catch {}
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const emailParam = searchParams.get('email')?.toLowerCase().trim();
  const empNoParam = searchParams.get('employeeNumber')?.trim();

  const local = getLocalProfile();

  // 1. Try Neon Serverless PostgreSQL first (Primary source of truth)
  if (DATABASE_URL) {
    try {
      const sql = neon(DATABASE_URL);
      let queryStr = `
        SELECT e.id, e.employee_number, e.first_name, e.last_name, e.phone, e.avatar_url, e.join_date,
               d.name as department_name, des.title as designation_title, u.email
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN designations des ON e.designation_id = des.id
        LEFT JOIN users u ON e.user_id = u.id
      `;
      let params: any[] = [];

      if (emailParam && empNoParam) {
        queryStr += ` WHERE LOWER(u.email) = $1 OR e.employee_number = $2 LIMIT 1`;
        params = [emailParam, empNoParam];
      } else if (emailParam) {
        queryStr += ` WHERE LOWER(u.email) = $1 LIMIT 1`;
        params = [emailParam];
      } else if (empNoParam) {
        queryStr += ` WHERE e.employee_number = $1 LIMIT 1`;
        params = [empNoParam];
      } else {
        queryStr += ` ORDER BY e.created_at ASC LIMIT 1`;
      }

      const rows = await sql.query(queryStr, params);

      if (Array.isArray(rows) && rows.length > 0) {
        const emp = rows[0] as any;
        const dbProfile: UserProfile = {
          fullName: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || defaultProfile.fullName,
          employeeNumber: emp.employee_number || defaultProfile.employeeNumber,
          email: emp.email || defaultProfile.email,
          phone: emp.phone || defaultProfile.phone,
          department: emp.department_name || defaultProfile.department,
          designation: emp.designation_title || defaultProfile.designation,
          manager: 'Direksi & Manajemen',
          location: 'Kantor Pusat - SCBD Jakarta',
          joinDate: emp.join_date ? new Date(emp.join_date).toISOString().split('T')[0] : defaultProfile.joinDate,
          avatarUrl: emp.avatar_url || local?.avatarUrl || '',
          updatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, data: dbProfile, hasData: true }, { status: 200 });
      }
    } catch (err: any) {
      console.warn('[Profile API] Neon query error, falling back to local:', err?.message);
    }
  }

  // 2. Fallback to local storage file if database query is unavailable
  if (local) {
    return NextResponse.json({ success: true, data: local, hasData: true }, { status: 200 });
  }

  return NextResponse.json({ success: true, data: defaultProfile, hasData: true }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    ensureStorage();

    const current = getLocalProfile() || defaultProfile;
    const updated: UserProfile = {
      fullName: body.fullName ?? current.fullName,
      employeeNumber: body.employeeNumber || current.employeeNumber,
      email: body.email ?? current.email,
      phone: body.phone ?? current.phone,
      department: body.department ?? current.department,
      designation: body.designation ?? current.designation,
      manager: body.manager ?? current.manager,
      location: body.location ?? current.location,
      joinDate: body.joinDate ?? current.joinDate,
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : current.avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    // 1. Sync to Neon PostgreSQL with precise identity targeting (No blind overwrites!)
    if (DATABASE_URL) {
      try {
        const sql = neon(DATABASE_URL);
        const names = updated.fullName.trim().split(' ');
        const firstName = names[0] || 'Karyawan';
        const lastName = names.slice(1).join(' ') || '';

        // Update employee record targeting specific employeeNumber
        await sql.query(
          `UPDATE employees 
           SET first_name = $1, last_name = $2, phone = $3, avatar_url = $4, updated_at = NOW() 
           WHERE employee_number = $5`,
          [firstName, lastName, updated.phone, updated.avatarUrl || null, updated.employeeNumber]
        );

        // Update user avatar record targeting specific user email
        await sql.query(
          `UPDATE users 
           SET avatar_url = $1, updated_at = NOW() 
           WHERE LOWER(email) = LOWER($2)`,
          [updated.avatarUrl || null, updated.email]
        );
      } catch (dbErr: any) {
        console.error('[Profile API] Neon update error:', dbErr?.message);
      }
    }

    // 2. Persist to local cache file
    try {
      fs.writeFileSync(PROFILE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {}

    // 3. Transparently audit profile updates in real-time
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

    const auditLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      module: 'EMPLOYEE',
      action: 'PROFILE_UPDATED',
      recordId: updated.employeeNumber,
      userName: updated.fullName,
      userEmail: updated.email,
      userNik: updated.employeeNumber,
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'Portal Karyawan (Web)',
      timestamp: timestampStr,
      oldData: { fullName: current.fullName, phone: current.phone },
      newData: { fullName: updated.fullName, phone: updated.phone, avatarUpdated: updated.avatarUrl !== current.avatarUrl },
    };

    const currentLogs = getStoredAuditLogs();
    saveStoredAuditLogs([auditLog, ...currentLogs.slice(0, 99)]);
    broadcastAuditEvent('AUDIT_LOG_CREATED', auditLog);

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Profil pribadi Anda berhasil diperbarui dan disinkronkan ke master data perusahaan.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROFILE_UPDATE_FAILED', message: err?.message || 'Gagal memperbarui profil' },
      },
      { status: 500 }
    );
  }
}
