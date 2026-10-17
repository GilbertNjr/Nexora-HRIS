import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vpusbeqevsgivsgaahat.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const PROFILE_FILE = path.join(STORAGE_DIR, 'nexora_user_profile.json');

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

const emptyProfile: UserProfile = {
  fullName: '',
  employeeNumber: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  manager: '',
  location: '',
  joinDate: '',
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

  // Try Supabase if configured
  if (SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=*&limit=1`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const emp = rows[0];
          const dbProfile: UserProfile = {
            fullName: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            employeeNumber: emp.employee_number || '',
            email: emp.email || '',
            phone: emp.phone || '',
            department: emp.department || '',
            designation: emp.designation || '',
            manager: 'Direksi & Manajemen',
            location: 'Kantor Pusat - SCBD Jakarta',
            joinDate: emp.join_date ? emp.join_date.split('T')[0] : '',
            avatarUrl: local?.avatarUrl || '',
          };
          return NextResponse.json({ success: true, data: dbProfile, hasData: true }, { status: 200 });
        }
      }
    } catch {
      // fallback
    }
  }

  if (local) {
    return NextResponse.json({ success: true, data: local, hasData: true }, { status: 200 });
  }

  // Return empty profile if no data has been saved yet
  return NextResponse.json({ success: true, data: emptyProfile, hasData: false }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    ensureStorage();

    const current = getLocalProfile() || emptyProfile;
    const updated: UserProfile = {
      fullName: body.fullName ?? current.fullName,
      employeeNumber: body.employeeNumber || current.employeeNumber || `NX-${new Date().getFullYear()}001`,
      email: body.email ?? current.email,
      phone: body.phone ?? current.phone,
      department: body.department ?? current.department,
      designation: body.designation ?? current.designation,
      manager: body.manager ?? current.manager,
      location: body.location ?? current.location,
      joinDate: body.joinDate || current.joinDate || new Date().toISOString().split('T')[0],
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : current.avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    // Save to persistent file storage
    try {
      fs.writeFileSync(PROFILE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // ignore
    }

    // Try sync to Supabase
    if (SUPABASE_KEY && updated.email) {
      try {
        const names = updated.fullName.split(' ');
        const firstName = names[0] || 'User';
        const lastName = names.slice(1).join(' ') || '';

        await fetch(`${SUPABASE_URL}/rest/v1/employees?limit=1`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: updated.email,
            phone: updated.phone,
            department: updated.department,
            designation: updated.designation,
          }),
        });
      } catch {
        // ignore
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Informasi data diri dan foto profil berhasil disimpan ke database.',
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
