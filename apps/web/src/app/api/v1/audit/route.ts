import { NextRequest, NextResponse } from 'next/server';
import {
  AuditLogEntry,
  getAuditLogsFromDb,
  recordAuditLog,
  pruneExpiredAuditLogs,
} from '@/lib/auditDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module') || 'ALL';
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    // Fetch real-time audit logs strictly within the 7-day retention window
    const { logs, total, retention } = await getAuditLogsFromDb({
      module: moduleFilter,
      search,
      limit: 200,
    });

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        total,
        filteredCount: logs.length,
        retention,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Gagal mengambil log audit' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newLog = await recordAuditLog({
      id: body.id,
      module: body.module || 'AUTH',
      action: body.action || 'ACTIVITY',
      recordId: body.recordId || `rec-${Date.now()}`,
      userName: body.userName || 'Karyawan',
      userEmail: body.userEmail || 'user@nexora.local',
      userNik: body.userNik,
      ipAddress: body.ipAddress || request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: body.userAgent || request.headers.get('user-agent') || 'Browser Web Client',
      timestamp: body.timestamp,
      oldData: body.oldData || null,
      newData: body.newData || null,
    });

    return NextResponse.json({
      success: true,
      data: newLog,
      message: 'Log audit berhasil dicatat ke database dan disiarkan secara real-time.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Gagal menyimpan log audit' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'PRUNE_EXPIRED') {
      const deletedCount = await pruneExpiredAuditLogs();
      return NextResponse.json({
        success: true,
        message: `Pembersihan otomatis berhasil: ${deletedCount} log audit yang melewati masa retensi 7 hari telah dibersihkan.`,
        deletedCount,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Aksi penghapusan tidak valid. Hanya pembersihan 7 hari yang diizinkan.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal menjalankan pembersihan audit' },
      { status: 500 }
    );
  }
}
