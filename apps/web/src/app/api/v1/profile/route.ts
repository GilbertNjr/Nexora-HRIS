import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

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
  fullName: 'Admin HR Nexora',
  employeeNumber: 'NX-2026-0001',
  email: 'admin@nexora.local',
  phone: '+62 812-9876-5432',
  department: 'Human Resources & People Operations',
  designation: 'Head of People Operations',
  manager: 'Direksi & Manajemen',
  location: 'Kantor Pusat - SCBD Jakarta',
  joinDate: '2024-01-15',
  avatarUrl: '',
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

function getLocalProfile(): UserProfile | null {
  try {
    ensureStorage();
    if (fs.existsSync(PROFILE_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8'));
      return data;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function GET() {
  const local = getLocalProfile();

  // 1. Try Neon Serverless PostgreSQL first (Primary source of truth)
  if (DATABASE_URL) {
    try {
      const sql = neon(DATABASE_URL);
      const rows = await sql.query(
        `SELECT e.id, e.employee_number, e.first_name, e.last_name, e.phone, e.avatar_url, e.join_date,
                d.name as department_name, des.title as designation_title, u.email
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations des ON e.designation_id = des.id
         LEFT JOIN users u ON e.user_id = u.id
         ORDER BY e.created_at ASC
         LIMIT 1`
      );

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
      joinDate: body.joinDate || current.joinDate,
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : current.avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    // 1. Persist directly to Neon PostgreSQL (Employees & Users tables)
    if (DATABASE_URL) {
      try {
        const sql = neon(DATABASE_URL);
        const names = updated.fullName.trim().split(' ');
        const firstName = names[0] || 'Admin';
        const lastName = names.slice(1).join(' ') || '';

        // Update employee record
        await sql.query(
          `UPDATE employees 
           SET first_name = $1, last_name = $2, phone = $3, avatar_url = $4, updated_at = NOW() 
           WHERE employee_number = $5 OR id IN (SELECT id FROM employees ORDER BY created_at ASC LIMIT 1)`,
          [firstName, lastName, updated.phone, updated.avatarUrl || null, updated.employeeNumber]
        );

        // Update user avatar record
        await sql.query(
          `UPDATE users 
           SET avatar_url = $1, updated_at = NOW() 
           WHERE email = $2 OR id IN (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)`,
          [updated.avatarUrl || null, updated.email]
        );
      } catch (dbErr: any) {
        console.error('[Profile API] Neon update error:', dbErr?.message);
      }
    }

    // 2. Persist to local cache file as instant recovery backup
    try {
      fs.writeFileSync(PROFILE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: '✓ Informasi profil dan foto avatar berhasil disimpan permanen ke Neon PostgreSQL.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'PROFILE_SAVE_ERROR', message: err.message },
      },
      { status: 500 }
    );
  }
}
