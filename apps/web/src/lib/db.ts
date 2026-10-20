import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

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
  avatarUrl?: string | null;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  createdAt: string;
}

const DATABASE_URL = process.env.DATABASE_URL;

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
  // 1. Primary: Neon Serverless PostgreSQL
  if (DATABASE_URL) {
    try {
      const sql = neon(DATABASE_URL);
      const rows = await sql.query(
        `SELECT e.id, e.employee_number, e.first_name, e.last_name, e.phone, e.avatar_url, 
                e.employment_type, e.employment_status, e.join_date, e.created_at,
                d.name as department_name, des.title as designation_title, u.email
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations des ON e.designation_id = des.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE e.deleted_at IS NULL
         ORDER BY e.created_at ASC`
      );

      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          employeeNumber: r.employee_number || `NIK-${String(r.id).slice(0, 6)}`,
          fullName: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Karyawan',
          firstName: r.first_name || '',
          lastName: r.last_name || '',
          email: r.email || null,
          phone: r.phone || null,
          department: r.department_name || 'Teknologi Informasi',
          designation: r.designation_title || 'Staff',
          employmentType: r.employment_type || 'PERMANENT',
          employmentStatus: r.employment_status || 'ACTIVE',
          joinDate: r.join_date ? new Date(r.join_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          avatarUrl: r.avatar_url || '',
          createdAt: r.created_at || new Date().toISOString(),
        }));
      }
    } catch (err: any) {
      console.warn('[DB] Neon getEmployees error, falling back to local storage:', err?.message);
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
    avatarUrl: data.avatarUrl || null,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    accountHolder: data.accountHolder,
    createdAt: now.toISOString(),
  };

  // 1. Save to Neon PostgreSQL if available
  if (DATABASE_URL) {
    try {
      const sql = neon(DATABASE_URL);
      // Get first company, department, designation to link foreign keys
      const depts = await sql.query('SELECT id, company_id FROM departments LIMIT 1');
      const desigs = await sql.query('SELECT id FROM designations LIMIT 1');
      const companyId = depts[0]?.company_id;
      const deptId = depts[0]?.id;
      const desigId = desigs[0]?.id;

      if (companyId && deptId && desigId) {
        await sql.query(
          `INSERT INTO employees 
           (employee_number, first_name, last_name, phone, employment_type, employment_status, join_date, avatar_url, company_id, department_id, designation_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5::"EmploymentType", $6::"EmploymentStatus", $7::date, $8, $9, $10, $11, NOW(), NOW())
           ON CONFLICT (employee_number) DO UPDATE
           SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, phone = EXCLUDED.phone, avatar_url = EXCLUDED.avatar_url`,
          [
            record.employeeNumber,
            record.firstName,
            record.lastName,
            record.phone,
            record.employmentType,
            record.employmentStatus,
            record.joinDate,
            record.avatarUrl,
            companyId,
            deptId,
            desigId,
          ]
        );
      }
    } catch (err: any) {
      console.warn('[DB] Neon insert error:', err?.message);
    }
  }

  // 2. Save to local fallback file storage
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

  // Update in Neon PostgreSQL
  if (DATABASE_URL) {
    try {
      const sql = neon(DATABASE_URL);
      await sql.query(
        `UPDATE employees
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             phone = COALESCE($3, phone),
             avatar_url = COALESCE($4, avatar_url),
             updated_at = NOW()
         WHERE id = $5::uuid OR employee_number = $6`,
        [data.firstName, data.lastName, data.phone, data.avatarUrl, id.includes('-') && id.length === 36 ? id : null, existing[index].employeeNumber]
      );
    } catch (err: any) {
      console.warn('[DB] Neon updateEmployee error:', err?.message);
    }
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

  if (DATABASE_URL) {
    try {
      const sql = neon(DATABASE_URL);
      await sql.query('UPDATE employees SET deleted_at = NOW() WHERE id = $1::uuid', [id]);
    } catch (err: any) {
      console.warn('[DB] Neon soft delete error:', err?.message);
    }
  }

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch {
    // ignore
  }
  return true;
}
