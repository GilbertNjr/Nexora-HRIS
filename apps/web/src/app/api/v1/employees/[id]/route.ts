import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeByIdFromDb, updateEmployeeInDb, deleteEmployeeFromDb } from '@/lib/db';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { broadcastEmployeeEvent } from '@/lib/employeesSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry } from '@/lib/auditDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/v1/employees/[id]
 * Mengambil detail profil karyawan lengkap berdasarkan ID atau NIK
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const found = await getEmployeeByIdFromDb(params.id);

    if (!found) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPLOYEE_NOT_FOUND',
            message: `Karyawan dengan identifikasi '${params.id}' tidak ditemukan.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: found,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Terjadi kesalahan saat mengambil detail karyawan',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/employees/[id]
 * Memperbarui data profil karyawan oleh Admin HR
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validasi kebijakan cut-off rekening bank [REQ-DEC-03]
    let bankCutoffWarning: string | null = null;
    if (body.accountNumber || body.bankName) {
      const today = new Date().getDate();
      if (today > 20) {
        bankCutoffWarning =
          'Perubahan rekening setelah tanggal 20 cut-off akan efektif pada siklus penggajian bulan depan.';
      }
    }

    const updated = await updateEmployeeInDb(params.id, body);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPLOYEE_NOT_FOUND',
            message: `Karyawan dengan identifikasi '${params.id}' tidak ditemukan untuk diperbarui.`,
          },
        },
        { status: 404 }
      );
    }

    // Dispatch audit log
    try {
      const auditLog: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        module: 'EMPLOYEE',
        action: 'EMPLOYEE_UPDATED',
        recordId: updated.id,
        userName: 'HR Administrator',
        userEmail: 'admin@nexora.local',
        userNik: updated.employeeNumber,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Konsol HR Admin (Web)',
        timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
        oldData: null,
        newData: {
          fullName: updated.fullName,
          department: updated.department,
          designation: updated.designation,
          employmentStatus: updated.employmentStatus,
        },
      };
      saveStoredAuditLogs([auditLog, ...getStoredAuditLogs().slice(0, 99)]);
      broadcastAuditEvent('AUDIT_LOG_CREATED', auditLog);
      broadcastEmployeeEvent('EMPLOYEE_UPDATED', updated);
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: updated,
        bankCutoffWarning,
        message: `Data karyawan ${updated.fullName} (${updated.employeeNumber}) berhasil diperbarui.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || 'Gagal memperbarui data karyawan',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/employees/[id]
 * Menonaktifkan karyawan (Soft delete) atau menghapus permanen jika query ?permanent=true
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('permanent') === 'true';

    const success = await deleteEmployeeFromDb(params.id, hardDelete);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPLOYEE_NOT_FOUND',
            message: `Karyawan dengan identifikasi '${params.id}' tidak ditemukan.`,
          },
        },
        { status: 404 }
      );
    }

    // Dispatch audit log
    try {
      const auditLog: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        module: 'EMPLOYEE',
        action: hardDelete ? 'EMPLOYEE_PERMANENTLY_DELETED' : 'EMPLOYEE_TERMINATED',
        recordId: params.id,
        userName: 'HR Administrator',
        userEmail: 'admin@nexora.local',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Konsol HR Admin (Web)',
        timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
        oldData: null,
        newData: { idOrNik: params.id, permanent: hardDelete },
      };
      saveStoredAuditLogs([auditLog, ...getStoredAuditLogs().slice(0, 99)]);
      broadcastAuditEvent('AUDIT_LOG_CREATED', auditLog);
      broadcastEmployeeEvent('EMPLOYEE_DELETED', { id: params.id, permanent: hardDelete });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: hardDelete
          ? 'Data karyawan berhasil dihapus permanen dari sistem.'
          : 'Status karyawan berhasil dinonaktifkan (TERMINATED) dan diarsipkan.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || 'Gagal memproses penghapusan karyawan',
        },
      },
      { status: 500 }
    );
  }
}
