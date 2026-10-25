import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { broadcastEmployeeEvent } from '@/lib/employeesSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry, recordAuditLog } from '@/lib/auditDb';
import { getEmployeesFromDb, updateEmployeeInDb, saveEmployeeToDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const EMPLOYEE_PROFILE_FILE = path.join(STORAGE_DIR, 'nexora_employee_profile.json');
const ADMIN_PROFILE_FILE = path.join(STORAGE_DIR, 'nexora_admin_profile.json');

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
  role?: 'EMPLOYEE' | 'ADMIN';
}

const defaultEmployeeProfile: UserProfile = {
  fullName: 'Rian Pratama, S.Kom',
  employeeNumber: 'NX-2021008',
  email: 'rian.pratama@nexora.co.id',
  phone: '+62 812-9845-1120',
  department: 'Technology & Core Engineering',
  designation: 'Lead Backend Architect',
  manager: 'Arya Wibowo, M.Sc (VP Eng.)',
  location: 'HQ Pacific Tower SCBD Lt. 7',
  joinDate: '2021-01-12',
  avatarUrl: '',
  role: 'EMPLOYEE',
};

const defaultAdminProfile: UserProfile = {
  fullName: 'Dewi Lestari, S.Psi',
  employeeNumber: 'NX-ADMIN-001',
  email: 'admin@nexora.co.id',
  phone: '+62 811-9988-7766',
  department: 'Human Capital & People Operations',
  designation: 'HR Administrator',
  manager: 'Direktur SDM & Operasional',
  location: 'SCBD Headquarter, Lantai 32',
  joinDate: '2020-03-01',
  avatarUrl: '',
  role: 'ADMIN',
};

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {}
}

function getStoredProfile(filePath: string, fallback: UserProfile): UserProfile {
  try {
    ensureStorage();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return { ...fallback, ...data };
    }
  } catch {}
  return fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get('role')?.toLowerCase().trim();
  const emailParam = searchParams.get('email')?.toLowerCase().trim();
  const empNoParam = searchParams.get('employeeNumber')?.trim();

  const isAdmin =
    roleParam === 'admin' ||
    roleParam === 'hr_admin' ||
    emailParam === 'admin@nexora.local' ||
    emailParam === 'admin@nexora.co.id' ||
    (empNoParam && empNoParam.toLowerCase().includes('admin'));

  if (isAdmin) {
    const adminData = getStoredProfile(ADMIN_PROFILE_FILE, defaultAdminProfile);
    return NextResponse.json({ success: true, data: adminData, hasData: true }, { status: 200 });
  }

  // Employee Profile: check master employee database first for 100% data consistency!
  try {
    const targetIdOrNik = (empNoParam || '').trim();
    const allEmps = await getEmployeesFromDb();
    const matched = allEmps.find(
      (e) =>
        (targetIdOrNik && e.employeeNumber && e.employeeNumber.toLowerCase().trim() === targetIdOrNik.toLowerCase()) ||
        (targetIdOrNik && e.id && e.id.toLowerCase().trim() === targetIdOrNik.toLowerCase()) ||
        (emailParam && e.email && e.email.toLowerCase().trim() === emailParam.toLowerCase()) ||
        (emailParam && e.fullName && e.fullName.toLowerCase().trim() === emailParam.toLowerCase())
    );

    if (matched) {
      const merged: UserProfile = {
        fullName: matched.fullName || 'Karyawan',
        employeeNumber: matched.employeeNumber,
        email: matched.email || (emailParam || `${matched.employeeNumber.toLowerCase()}@nexora.co.id`),
        phone: matched.phone || '+62 812-8899-7766',
        department: matched.department || 'Technology & Core Engineering',
        designation: matched.designation || 'Specialist',
        manager: matched.managerName || 'HR Operations Lead',
        location: matched.office || 'HQ Pacific Tower SCBD',
        joinDate: matched.joinDate || '2026-10-24',
        avatarUrl: matched.avatarUrl || '',
        updatedAt: matched.updatedAt || new Date().toISOString(),
        role: 'EMPLOYEE',
      };
      return NextResponse.json({ success: true, data: merged, hasData: true }, { status: 200 });
    }
  } catch (err) {
    console.error('[Profile API GET error]:', err);
  }

  // Fallback to local stored employee profile
  const empData = getStoredProfile(EMPLOYEE_PROFILE_FILE, defaultEmployeeProfile);
  return NextResponse.json({ success: true, data: empData, hasData: true }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    ensureStorage();

    const roleParam = body.role?.toLowerCase?.();
    const isAdmin =
      roleParam === 'admin' ||
      roleParam === 'hr_admin' ||
      body.email?.includes('admin') ||
      body.employeeNumber?.toLowerCase()?.includes('admin');

    if (isAdmin) {
      // 1. Save Admin Profile separately
      const current = getStoredProfile(ADMIN_PROFILE_FILE, defaultAdminProfile);
      const updatedAdmin: UserProfile = {
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
        role: 'ADMIN',
      };

      try {
        fs.writeFileSync(ADMIN_PROFILE_FILE, JSON.stringify(updatedAdmin, null, 2), 'utf-8');
      } catch {}

      return NextResponse.json(
        { success: true, data: updatedAdmin, message: 'Profil Admin HR berhasil diperbarui.' },
        { status: 200 }
      );
    }

    // 2. Save Employee Profile without touching Admin profile!
    const current = getStoredProfile(EMPLOYEE_PROFILE_FILE, defaultEmployeeProfile);
    const updatedEmployee: UserProfile = {
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
      role: 'EMPLOYEE',
    };

    // A. Persist to employee cache file
    try {
      fs.writeFileSync(EMPLOYEE_PROFILE_FILE, JSON.stringify(updatedEmployee, null, 2), 'utf-8');
    } catch {}

    // B. Persist directly into master Employee Database so HR Admin sees it!
    const names = updatedEmployee.fullName.trim().split(' ');
    const firstName = names[0] || 'Karyawan';
    const lastName = names.slice(1).join(' ') || '';

    let savedRecord = await updateEmployeeInDb(updatedEmployee.employeeNumber, {
      fullName: updatedEmployee.fullName,
      firstName,
      lastName,
      email: updatedEmployee.email,
      phone: updatedEmployee.phone,
      department: updatedEmployee.department,
      designation: updatedEmployee.designation,
      avatarUrl: updatedEmployee.avatarUrl,
    });

    if (!savedRecord) {
      // Create record if not found in db so it permanently appears in admin directory
      savedRecord = await saveEmployeeToDb({
        id: updatedEmployee.employeeNumber,
        employeeNumber: updatedEmployee.employeeNumber,
        fullName: updatedEmployee.fullName,
        firstName,
        lastName,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        department: updatedEmployee.department,
        designation: updatedEmployee.designation,
        employmentType: 'PERMANENT',
        employmentStatus: 'ACTIVE',
        joinDate: updatedEmployee.joinDate,
        avatarUrl: updatedEmployee.avatarUrl,
      });
    }

    // C. Sync to PostgreSQL Neon if configured
    if (DATABASE_URL) {
      try {
        const sql = neon(DATABASE_URL);
        const av = updatedEmployee.avatarUrl || null;
        const ph = updatedEmployee.phone || null;
        const empNum = updatedEmployee.employeeNumber;
        await sql`UPDATE employees 
                  SET first_name = ${firstName}, 
                      last_name = ${lastName}, 
                      phone = ${ph}, 
                      avatar_url = ${av}, 
                      updated_at = NOW() 
                  WHERE employee_number = ${empNum}`;
      } catch (err: any) {
        console.warn('[Profile PUT] Neon update error:', err?.message);
      }
    }

    // D. Log to Neon PostgreSQL Database Audit System
    try {
      await recordAuditLog({
        module: 'EMPLOYEE',
        action: 'PROFILE_UPDATED',
        recordId: updatedEmployee.employeeNumber,
        userName: updatedEmployee.fullName,
        userEmail: updatedEmployee.email,
        userNik: updatedEmployee.employeeNumber,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Portal Karyawan (Web)',
        oldData: { fullName: current.fullName, phone: current.phone },
        newData: {
          fullName: updatedEmployee.fullName,
          phone: updatedEmployee.phone,
          department: updatedEmployee.department,
          designation: updatedEmployee.designation,
        },
      });
    } catch {}

    // E. Broadcast Real-Time Employee Event so HR Admin screen updates live!
    const recordToBroadcast = savedRecord || {
      ...updatedEmployee,
      id: updatedEmployee.employeeNumber,
    };
    broadcastEmployeeEvent('EMPLOYEE_UPDATED', recordToBroadcast);

    return NextResponse.json(
      {
        success: true,
        data: updatedEmployee,
        message: 'Profil karyawan berhasil diperbarui, tersimpan ke basis data & dicatat dalam audit HR.',
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
