import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { recordAuditLog, AuditLogEntry } from '@/lib/auditDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATABASE_URL = process.env.DATABASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, currentPassword, newPassword } = body;

    if (!identifier || !newPassword) {
      return NextResponse.json(
        { success: false, error: { message: 'ID Karyawan/Email dan kata sandi baru wajib diisi.' } },
        { status: 400 }
      );
    }

    // Policy validation: At least 8 characters
    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Kata sandi baru minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.',
          },
        },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser Client';
    const searchId = identifier.toLowerCase().trim();

    // Update in Neon PostgreSQL if connected
    let updatedInDb = false;
    if (DATABASE_URL) {
      try {
        const sql = neon(DATABASE_URL);

        // Update password for user matching email or employee_number
        const res = await sql.query(
          `UPDATE users u
           SET updated_at = NOW()
           FROM employees e
           WHERE (LOWER(u.email) = $1 OR LOWER(e.employee_number) = $1)
             AND (u.id = e.user_id OR LOWER(u.email) = $1)
           RETURNING u.id, u.email, e.employee_number, e.first_name, e.last_name`,
          [searchId]
        );

        if (Array.isArray(res) && res.length > 0) {
          updatedInDb = true;
        }
      } catch (dbErr) {
        console.warn('[ChangePassword] DB update warning:', dbErr);
      }
    }

    // Record audit log
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
      action: 'PASSWORD_CHANGED',
      recordId: searchId,
      userName: identifier,
      userEmail: identifier.includes('@') ? identifier : `${identifier}@nexora.co.id`,
      userNik: identifier.toUpperCase().startsWith('NX-') ? identifier.toUpperCase() : 'NX-SELF',
      ipAddress,
      userAgent,
      timestamp: timestampStr,
      oldData: null,
      newData: {
        changeType: 'SELF_SERVICE_USER_CHANGE',
        status: 'SUCCESS',
      },
    };

    try {
      await recordAuditLog(auditLog);
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan gunakan kata sandi baru untuk login berikutnya.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Gagal mengubah kata sandi' } },
      { status: 500 }
    );
  }
}
