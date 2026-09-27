import { PrismaClient, UserStatus, EmploymentType, EmploymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for NEXORA HRIS...');

  // 1. Seed Roles
  const rolesData = [
    { name: 'SUPER_ADMIN', displayName: 'Super Administrator', isSystem: true, description: 'Akses teknis penuh sistem' },
    { name: 'HR_ADMIN', displayName: 'HR Administrator', isSystem: true, description: 'Akses penuh manajemen SDM & data personalia' },
    { name: 'HR_STAFF', displayName: 'HR Staff', isSystem: true, description: 'Operasional presensi dan cuti harian' },
    { name: 'MANAGER', displayName: 'Line Manager / Atasan', isSystem: true, description: 'Persetujuan cuti dan penilaian bawahan' },
    { name: 'EMPLOYEE', displayName: 'Employee (ESS)', isSystem: true, description: 'Karyawan pengguna portal mandiri' },
  ];

  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }
  console.log('✅ Roles seeded');

  // 2. Seed Permissions
  const permissionsData = [
    { name: 'auth:manage_users', module: 'AUTH', description: 'Mengelola akun pengguna' },
    { name: 'employee:view', module: 'EMPLOYEE', description: 'Melihat profil karyawan' },
    { name: 'employee:edit', module: 'EMPLOYEE', description: 'Mengubah data karyawan' },
    { name: 'attendance:view_all', module: 'ATTENDANCE', description: 'Melihat seluruh presensi karyawan' },
    { name: 'attendance:clock_in', module: 'ATTENDANCE', description: 'Melakukan clock-in mandiri' },
    { name: 'leave:request', module: 'LEAVE', description: 'Mengajukan permohonan cuti' },
    { name: 'leave:approve', module: 'LEAVE', description: 'Menyetujui permohonan cuti' },
    { name: 'payroll:calculate', module: 'PAYROLL', description: 'Menghitung payroll bulanan' },
    { name: 'payroll:view_own', module: 'PAYROLL', description: 'Melihat slip gaji pribadi' },
    { name: 'audit:view', module: 'AUDIT', description: 'Melihat log audit sistem' },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  console.log('✅ Permissions seeded');

  // 3. Seed Company
  const company = await prisma.company.upsert({
    where: { code: 'NX-HQ' },
    update: {},
    create: {
      code: 'NX-HQ',
      name: 'PT Nexora Solusi Indonesia',
      legalName: 'PT Nexora Solusi Indonesia Tbk.',
      taxId: '01.234.567.8-901.000',
      address: 'Nexora Tower Lt. 18, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190',
    },
  });
  console.log('✅ Company seeded');

  // 4. Seed Departments
  const deptHr = await prisma.department.upsert({
    where: {
      companyId_code: {
        companyId: company.id,
        code: 'HRD',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      code: 'HRD',
      name: 'Human Resource Department',
    },
  });

  const deptTech = await prisma.department.upsert({
    where: {
      companyId_code: {
        companyId: company.id,
        code: 'TECH',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      code: 'TECH',
      name: 'Technology & Product',
    },
  });
  console.log('✅ Departments seeded');

  // 5. Seed Designations (Job Titles)
  const desigHrAdmin = await prisma.designation.upsert({
    where: {
      departmentId_code: {
        departmentId: deptHr.id,
        code: 'HR-ADM',
      },
    },
    update: {},
    create: {
      departmentId: deptHr.id,
      code: 'HR-ADM',
      title: 'Human Resource Specialist',
    },
  });

  const desigSoftwareEng = await prisma.designation.upsert({
    where: {
      departmentId_code: {
        departmentId: deptTech.id,
        code: 'SWE',
      },
    },
    update: {},
    create: {
      departmentId: deptTech.id,
      code: 'SWE',
      title: 'Senior Software Engineer',
    },
  });
  console.log('✅ Designations seeded');

  // 6. Seed Work Shift
  await prisma.workShift.upsert({
    where: { code: 'REG-01' },
    update: {},
    create: {
      code: 'REG-01',
      name: 'Regular Office Hours',
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 15,
    },
  });
  console.log('✅ Work Shifts seeded');

  // 7. Seed Leave Types
  await prisma.leaveType.upsert({
    where: { code: 'ANNUAL' },
    update: {},
    create: {
      code: 'ANNUAL',
      name: 'Cuti Tahunan',
      defaultDays: 12,
      isPaid: true,
      requiresDocument: false,
    },
  });

  await prisma.leaveType.upsert({
    where: { code: 'SICK' },
    update: {},
    create: {
      code: 'SICK',
      name: 'Cuti Sakit',
      defaultDays: 14,
      isPaid: true,
      requiresDocument: true,
    },
  });
  console.log('✅ Leave Types seeded');

  // 8. Seed Default Users
  const salt = await bcrypt.genSalt(12);

  // Admin User
  const adminPassHash = await bcrypt.hash('Admin@Nexora2026!', salt);
  const adminRole = await prisma.role.findUnique({ where: { name: 'HR_ADMIN' } });
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexora.local' },
    update: { passwordHash: adminPassHash },
    create: {
      email: 'admin@nexora.local',
      passwordHash: adminPassHash,
      status: UserStatus.ACTIVE,
      userRoles: {
        create: [
          { roleId: adminRole!.id },
          { roleId: superAdminRole!.id },
        ],
      },
      employee: {
        create: {
          companyId: company.id,
          departmentId: deptHr.id,
          designationId: desigHrAdmin.id,
          employeeNumber: 'NX-2026-0001',
          firstName: 'Admin',
          lastName: 'HR Nexora',
          employmentType: EmploymentType.PERMANENT,
          employmentStatus: EmploymentStatus.ACTIVE,
          joinDate: new Date('2024-01-01'),
          phone: '+6281234567890',
        },
      },
    },
  });
  console.log('✅ Admin User seeded: admin@nexora.local (Pass: Admin@Nexora2026!)');

  // Employee User (ESS)
  const empPassHash = await bcrypt.hash('Employee@Nexora2026!', salt);
  const employeeRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } });

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@nexora.local' },
    update: { passwordHash: empPassHash },
    create: {
      email: 'employee@nexora.local',
      passwordHash: empPassHash,
      status: UserStatus.ACTIVE,
      userRoles: {
        create: [{ roleId: employeeRole!.id }],
      },
      employee: {
        create: {
          companyId: company.id,
          departmentId: deptTech.id,
          designationId: desigSoftwareEng.id,
          employeeNumber: 'NX-2026-0042',
          firstName: 'Ahmat',
          lastName: 'Gebyar',
          employmentType: EmploymentType.PERMANENT,
          employmentStatus: EmploymentStatus.ACTIVE,
          joinDate: new Date('2024-06-01'),
          phone: '+6289876543210',
        },
      },
    },
  });
  console.log('✅ Employee User seeded: employee@nexora.local (Pass: Employee@Nexora2026!)');

  console.log('✨ All seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
