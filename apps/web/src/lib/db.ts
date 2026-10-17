import fs from 'fs';
import path from 'path';

export interface EmployeeRecord {
  id: string;
  employeeNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  department: string;
  designation: string;
  employmentType: 'PERMANENT' | 'CONTRACT_PKWT' | 'PROBATION' | 'INTERNSHIP';
  employmentStatus: 'ACTIVE' | 'RESIGNED' | 'TERMINATED' | 'SUSPENDED';
  joinDate: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  createdAt: string;
}

// Supabase Direct REST API (Zero external npm packages needed by Webpack)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vpusbeqevsgivsgaahat.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server-side persistent file storage (fallback)
const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'nexora_employees.json');

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORAGE_FILE)) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify([]), 'utf-8');
    }
  } catch {
    // ignore
  }
}

export async function getEmployeesFromDb(): Promise<EmployeeRecord[]> {
  // 1. Try Supabase REST API directly if key is available
  if (SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=*&order=created_at.desc`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: 'no-store',
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            employeeNumber: r.employee_number || `NIK-${String(r.id).slice(0, 6)}`,
            fullName: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Karyawan',
            firstName: r.first_name || '',
            lastName: r.last_name || '',
            email: r.email || null,
            phone: r.phone || null,
            department: r.department || 'Teknologi Informasi',
            designation: r.designation || 'Staff',
            employmentType: r.employment_type || 'PERMANENT',
            employmentStatus: r.employment_status || 'ACTIVE',
            joinDate: r.join_date ? r.join_date.split('T')[0] : new Date().toISOString().split('T')[0],
            bankName: r.bank_name,
            accountNumber: r.account_number,
            accountHolder: r.account_holder,
            createdAt: r.created_at || new Date().toISOString(),
          }));
        }
      }
    } catch {
      // fallback
    }
  }

  // 2. Fallback to server file storage
  try {
    ensureStorage();
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch {
    // ignore
  }

  return [];
}

export async function saveEmployeeToDb(data: Partial<EmployeeRecord>): Promise<EmployeeRecord> {
  const newId = `emp-${Date.now()}`;
  const now = new Date();
  const year = now.getFullYear();

  ensureStorage();
  const existing = await getEmployeesFromDb();
  const generatedNik = data.employeeNumber || `NIK-${year}${String(existing.length + 1).padStart(3, '0')}`;

  const record: EmployeeRecord = {
    id: data.id || newId,
    employeeNumber: generatedNik,
    fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Karyawan Baru',
    firstName: data.firstName || 'Karyawan',
    lastName: data.lastName || '',
    email: data.email || null,
    phone: data.phone || null,
    department: data.department || 'Teknologi Informasi',
    designation: data.designation || 'Staff',
    employmentType: data.employmentType || 'PERMANENT',
    employmentStatus: 'ACTIVE',
    joinDate: data.joinDate || now.toISOString().split('T')[0],
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    accountHolder: data.accountHolder,
    createdAt: now.toISOString(),
  };

  // Try Supabase REST API
  if (SUPABASE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          employee_number: record.employeeNumber,
          first_name: record.firstName,
          last_name: record.lastName,
          email: record.email,
          phone: record.phone,
          department: record.department,
          designation: record.designation,
          employment_type: record.employmentType,
          employment_status: record.employmentStatus,
          join_date: record.joinDate,
          bank_name: record.bankName,
          account_number: record.accountNumber,
          account_holder: record.accountHolder,
        }),
      });
    } catch {
      // fallback
    }
  }

  // Save to persistent file storage
  const updated = [record, ...existing.filter((e) => e.id !== record.id)];
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch {
    // ignore
  }

  return record;
}

export async function updateEmployeeInDb(id: string, data: Partial<EmployeeRecord>): Promise<EmployeeRecord | null> {
  ensureStorage();
  const existing = await getEmployeesFromDb();
  const index = existing.findIndex((e) => e.id === id);
  if (index === -1) return null;

  existing[index] = { ...existing[index], ...data };
  if (data.firstName !== undefined || data.lastName !== undefined) {
    const fn = data.firstName !== undefined ? data.firstName : existing[index].firstName;
    const ln = data.lastName !== undefined ? data.lastName : existing[index].lastName;
    existing[index].fullName = `${fn} ${ln}`.trim();
  }

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch {
    // ignore
  }

  return existing[index];
}

export async function deleteEmployeeFromDb(id: string): Promise<boolean> {
  ensureStorage();
  const existing = await getEmployeesFromDb();
  const filtered = existing.filter((e) => e.id !== id);
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {
    // ignore
  }
  return true;
}
