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

// Fallback file path for persistent server-side storage
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
  } catch (err) {
    console.warn('Storage directory warning:', err);
  }
}

export async function getEmployeesFromDb(): Promise<EmployeeRecord[]> {
  // 1. Try Prisma if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const rows = await prisma.employee.findMany({
        where: { deletedAt: null },
        include: {
          user: true,
          department: true,
          designation: true,
          bankAccount: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      await prisma.$disconnect();

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          employeeNumber: r.employeeNumber,
          fullName: `${r.firstName} ${r.lastName || ''}`.trim() || 'Karyawan',
          firstName: r.firstName,
          lastName: r.lastName || '',
          email: r.user?.email || null,
          phone: r.phone || null,
          department: r.department?.name || 'Teknologi Informasi',
          designation: r.designation?.title || 'Staff',
          employmentType: r.employmentType,
          employmentStatus: r.employmentStatus,
          joinDate: r.joinDate ? r.joinDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          bankName: r.bankAccount?.bankName || undefined,
          accountNumber: r.bankAccount?.accountNumberEnc || undefined,
          createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        }));
      }
    } catch (dbErr) {
      console.warn('Prisma DB query fallback to file storage:', (dbErr as Error).message);
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
  } catch (fileErr) {
    console.error('File storage read error:', fileErr);
  }

  return [];
}

export async function saveEmployeeToDb(data: Partial<EmployeeRecord>): Promise<EmployeeRecord> {
  const newId = `emp-${Date.now()}`;
  const now = new Date();
  const year = now.getFullYear();

  // Try Prisma first if available
  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Find or create company & department
      let company = await prisma.company.findFirst();
      if (!company) {
        company = await prisma.company.create({
          data: {
            code: 'NX-HQ',
            name: 'PT Nexora Solusi Indonesia',
            legalName: 'PT Nexora Solusi Indonesia Tbk.',
          },
        });
      }

      let department = await prisma.department.findFirst({
        where: { name: data.department || 'Teknologi Informasi' },
      });
      if (!department) {
        department = await prisma.department.create({
          data: {
            companyId: company.id,
            code: (data.department || 'TI').slice(0, 4).toUpperCase(),
            name: data.department || 'Teknologi Informasi',
          },
        });
      }

      let designation = await prisma.designation.findFirst({
        where: { title: data.designation || 'Staff' },
      });
      if (!designation) {
        designation = await prisma.designation.create({
          data: {
            departmentId: department.id,
            code: (data.designation || 'STF').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'STF',
            title: data.designation || 'Staff',
          },
        });
      }

      const totalCount = await prisma.employee.count();
      const generatedNik = data.employeeNumber || `NIK-${year}${String(totalCount + 1).padStart(3, '0')}`;

      const created = await prisma.employee.create({
        data: {
          companyId: company.id,
          departmentId: department.id,
          designationId: designation.id,
          employeeNumber: generatedNik,
          firstName: data.firstName || 'Karyawan',
          lastName: data.lastName || '',
          phone: data.phone || null,
          employmentType: (data.employmentType as any) || 'PERMANENT',
          employmentStatus: 'ACTIVE',
          joinDate: data.joinDate ? new Date(data.joinDate) : now,
        },
      });

      if (data.bankName && data.accountNumber) {
        await prisma.employeeBankAccount.create({
          data: {
            employeeId: created.id,
            bankName: data.bankName,
            accountNumberEnc: data.accountNumber,
            accountHolderEnc: data.accountHolder || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          },
        });
      }

      await prisma.$disconnect();

      const result: EmployeeRecord = {
        id: created.id,
        employeeNumber: created.employeeNumber,
        fullName: `${created.firstName} ${created.lastName || ''}`.trim() || 'Karyawan',
        firstName: created.firstName,
        lastName: created.lastName || '',
        email: data.email || null,
        phone: created.phone,
        department: data.department || 'Teknologi Informasi',
        designation: data.designation || 'Staff',
        employmentType: created.employmentType,
        employmentStatus: 'ACTIVE',
        joinDate: data.joinDate || now.toISOString().split('T')[0],
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolder: data.accountHolder,
        createdAt: created.createdAt.toISOString(),
      };

      // Also mirror to file cache
      try {
        ensureStorage();
        const existing = await getEmployeesFromDb();
        const updated = [result, ...existing.filter((e) => e.id !== result.id)];
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      } catch {
        // ignore
      }

      return result;
    } catch (prismaErr) {
      console.warn('Prisma create failed, falling back to file storage:', prismaErr);
    }
  }

  // Fallback file storage create
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

  const updated = [record, ...existing.filter((e) => e.id !== record.id)];
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return record;
}

export async function updateEmployeeInDb(id: string, data: Partial<EmployeeRecord>): Promise<EmployeeRecord | null> {
  // Update Prisma if possible
  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.employee.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          employmentType: data.employmentType as any,
        },
      });
      await prisma.$disconnect();
    } catch {
      // fallback
    }
  }

  // Update file storage
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
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  return existing[index];
}

export async function deleteEmployeeFromDb(id: string): Promise<boolean> {
  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.employee.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      await prisma.$disconnect();
    } catch {
      // fallback
    }
  }

  ensureStorage();
  const existing = await getEmployeesFromDb();
  const filtered = existing.filter((e) => e.id !== id);
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}
