import { NextRequest, NextResponse } from 'next/server';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry, recordAuditLog } from '@/lib/auditDb';
import { neon } from '@neondatabase/serverless';
import { getEmployeesFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATABASE_URL = process.env.DATABASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = (body.email || body.identifier || '').toLowerCase().trim();
    const password = body.password || '';

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'ID Karyawan / Email dan Kata Sandi wajib diisi.' } },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser Client';

    // 1. Check if identifier represents Admin or Employee
    const isAdminAccount =
      identifier === 'admin@nexora.local' ||
      identifier === 'admin@nexora.co.id' ||
      identifier === 'dewi.lestari@nexora.co.id' ||
      identifier.startsWith('admin') ||
      identifier === 'nx-admin-001';

    let userRole: 'SUPER_ADMIN' | 'HR_ADMIN' | 'EMPLOYEE' = isAdminAccount ? 'HR_ADMIN' : 'EMPLOYEE';
    let redirectUrl = isAdminAccount ? '/admin' : '/karyawan';
    let fullName = isAdminAccount ? 'HR Administrator (Dewi Lestari)' : '';
    let employeeNumber = isAdminAccount ? 'NX-ADMIN-001' : '';
    let userEmail = identifier.includes('@') ? identifier : `${identifier}@nexora.co.id`;
    let userId = isAdminAccount ? 'usr-admin-unified' : '';
    let department = isAdminAccount ? 'Human Resource Operations' : '';
    let designation = isAdminAccount ? 'HR Operations Lead' : '';
    let avatarUrl = isAdminAccount ? '' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

    let isMatched = isAdminAccount;

    // Normalisasi identifier
    const altEmail = identifier.includes('@')
      ? identifier.replace('@', '.')
      : identifier.includes('.nexora.')
      ? `${identifier.split('.nexora.')[0]}@nexora.co.id`
      : `${identifier}@nexora.co.id`;
    const prefix = identifier.split('@')[0];
    const nameSearch = prefix ? `%${prefix.replace(/[^a-z0-9]/g, '%')}%` : '';
    const nikSearch = identifier.startsWith('nx-')
      ? identifier.toUpperCase()
      : `NX-${identifier.replace(/^nx-?/i, '')}`;

    // Try verifying from Neon DB if available
    if (!isAdminAccount && DATABASE_URL) {
      try {
        const sql = neon(DATABASE_URL);

        // 1. Prioritas Utama: Cari dari entitas Karyawan (EMPLOYEES) terlebih dahulu
        const empRows = await sql.query(
          `SELECT e.id as emp_id, e.employee_number, e.first_name, e.last_name, e.phone, e.avatar_url as emp_avatar,
                  e.user_id, u.id as user_id_from_user, u.email as user_email, u.avatar_url as user_avatar,
                  d.name as department_name, des.title as designation_title, r.name as role_name
           FROM employees e
           LEFT JOIN users u ON e.user_id = u.id
           LEFT JOIN user_roles ur ON u.id = ur.user_id
           LEFT JOIN roles r ON ur.role_id = r.id
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations des ON e.designation_id = des.id
           WHERE e.deleted_at IS NULL
             AND (
               LOWER(TRIM(e.employee_number)) = $1
               OR LOWER(TRIM(e.employee_number)) = LOWER($4)
               OR (u.email IS NOT NULL AND LOWER(TRIM(u.email)) = $1)
               OR ($2 != '' AND u.email IS NOT NULL AND LOWER(TRIM(u.email)) = $2)
               OR LOWER(TRIM(e.first_name)) = $1
               OR ($3 != '' AND LOWER(TRIM(CONCAT(e.first_name, ' ', e.last_name))) ILIKE $3)
             )
           LIMIT 1`,
          [identifier, altEmail, nameSearch, nikSearch]
        );

        if (Array.isArray(empRows) && empRows.length > 0) {
          const row = empRows[0] as any;
          isMatched = true;
          fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Karyawan';
          employeeNumber = row.employee_number || '';
          department = row.department_name || 'Teknologi Informasi';
          designation = row.designation_title || 'Staff';
          avatarUrl = row.emp_avatar || row.user_avatar || avatarUrl;
          userEmail = row.user_email || `${row.first_name.toLowerCase().replace(/[^a-z]/g, '')}@nexora.co.id`;
          userId = row.user_id || row.user_id_from_user || row.emp_id;
          userRole = 'EMPLOYEE';
          redirectUrl = '/karyawan';

          // Self-Healing: Jika karyawan belum memiliki relasi user_id, buat dan tautkan otomatis
          if (!row.user_id) {
            try {
              const uRes = await sql.query(
                `INSERT INTO users (id, email, password_hash, status, created_at, updated_at)
                 VALUES (gen_random_uuid(), $1, '$2b$10$defaultHashPlaceholder', 'ACTIVE'::"UserStatus", NOW(), NOW())
                 ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
                 RETURNING id`,
                [userEmail]
              );
              if (uRes && uRes[0]?.id) {
                const newUid = uRes[0].id;
                userId = newUid;
                await sql.query(
                  `UPDATE employees SET user_id = $1 WHERE id = $2`,
                  [newUid, row.emp_id]
                );
                await sql.query(
                  `INSERT INTO user_roles (user_id, role_id, created_at)
                   VALUES ($1, '51c405bb-8a5f-48cc-9c2a-651063c3c9c9', NOW())
                   ON CONFLICT DO NOTHING`,
                  [newUid]
                );
              }
            } catch {}
          }
        } else {
          // 2. Fallback: Cari dari tabel USERS langsung (misal untuk akun admin murni)
          const userRows = await sql.query(
            `SELECT u.id, u.email, u.password_hash, u.status, u.avatar_url as user_avatar,
                    r.name as role_name,
                    e.first_name, e.last_name, e.employee_number, e.avatar_url as emp_avatar,
                    d.name as department_name, des.title as designation_title
             FROM users u
             LEFT JOIN user_roles ur ON u.id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.id
             LEFT JOIN employees e ON u.id = e.user_id
             LEFT JOIN departments d ON e.department_id = d.id
             LEFT JOIN designations des ON e.designation_id = des.id
             WHERE LOWER(TRIM(u.email)) = $1 OR ($2 != '' AND LOWER(TRIM(u.email)) = $2)
             LIMIT 1`,
            [identifier, altEmail]
          );

          if (Array.isArray(userRows) && userRows.length > 0) {
            const row = userRows[0] as any;
            isMatched = true;
            if (row.id) userId = row.id;
            userEmail = row.email || userEmail;
            fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'HR Operations';
            employeeNumber = row.employee_number || '';
            department = row.department_name || department;
            designation = row.designation_title || designation;
            if (row.emp_avatar || row.user_avatar) {
              avatarUrl = row.emp_avatar || row.user_avatar;
            }
            if (row.role_name) {
              const rName = String(row.role_name).toUpperCase();
              if (rName.includes('ADMIN')) {
                userRole = 'HR_ADMIN';
                redirectUrl = '/admin';
              } else {
                userRole = 'EMPLOYEE';
                redirectUrl = '/karyawan';
              }
            }
          }
        }
      } catch (dbErr) {
        console.warn('[Auth] Database check skipped, using fallback validation:', dbErr);
      }
    }

    // 3. Fallback ke getEmployeesFromDb() (Local File Storage / Resilient Cache)
    if (!isMatched) {
      try {
        const allEmployees = await getEmployeesFromDb();
        const matched = allEmployees.find(
          (e) =>
            (e.email && e.email.toLowerCase().trim() === identifier) ||
            (e.email && altEmail && e.email.toLowerCase().trim() === altEmail) ||
            (e.employeeNumber && e.employeeNumber.toLowerCase().trim() === identifier) ||
            (e.fullName && e.fullName.toLowerCase().trim() === identifier) ||
            (e.id && e.id.toLowerCase().trim() === identifier)
        );

        if (matched) {
          isMatched = true;
          userId = matched.id;
          userEmail = matched.email || `${matched.employeeNumber.toLowerCase()}@nexora.co.id`;
          fullName = matched.fullName;
          employeeNumber = matched.employeeNumber;
          department = matched.department;
          designation = matched.designation;
          avatarUrl =
            matched.avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
          userRole = 'EMPLOYEE';
          redirectUrl = '/karyawan';
        }
      } catch (empErr) {
        console.warn('[Auth] getEmployeesFromDb error:', empErr);
      }
    }

    // If identifier is not found in database or admin whitelist
    if (!isMatched) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: `Akun '${identifier}' belum terdaftar. Pastikan Email Perusahaan atau ID Karyawan (NIP) Anda telah didaftarkan resmi oleh HR Operations.`,
          },
        },
        { status: 401 }
      );
    }

    // Ensure avatarUrl never exceeds browser localStorage quota limits
    let safeAvatar = avatarUrl;
    if (safeAvatar && (safeAvatar.startsWith('data:') || safeAvatar.length > 25000)) {
      safeAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    }

    const userData = {
      id: userId,
      email: userEmail,
      fullName,
      employeeNumber,
      department,
      designation,
      avatarUrl: safeAvatar,
      roles: [userRole],
      primaryRole: userRole,
    };

    const token = `nexora-unified-jwt-${Date.now()}`;

    // 2. Create Audit Log Entry for Real-Time Transparency
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
      module: 'AUTH',
      action: 'LOGIN_SUCCESS',
      recordId: userData.id,
      userName: fullName,
      userEmail: userEmail,
      userNik: employeeNumber,
      ipAddress,
      userAgent,
      timestamp: timestampStr,
      oldData: null,
      newData: {
        role: userRole,
        portalRedirect: redirectUrl,
        authMode: 'UNIFIED_ENTERPRISE_SSO',
      },
    };

    // Save directly to Neon PostgreSQL database and broadcast real-time
    try {
      await recordAuditLog(auditLog);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Otorisasi berhasil. Mengalihkan ke ${redirectUrl === '/admin' ? 'Konsol Admin HR' : 'Portal Karyawan'}...`,
      data: {
        user: userData,
        tokens: {
          accessToken: token,
          tokenType: 'Bearer',
        },
        redirectUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Gagal memproses autentikasi' } },
      { status: 500 }
    );
  }
}
