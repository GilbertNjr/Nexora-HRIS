import { NextRequest, NextResponse } from 'next/server';
import {
  getPayrollPeriod,
  generatePayrollPeriod,
  disbursePayrollPeriod,
} from '@/lib/payrollDb';
import { broadcastApprovalEvent } from '@/lib/approvalsSSE';
import { recordAuditLog } from '@/lib/auditDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '2025-03';

    const data = await getPayrollPeriod(period);
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('Error in GET /api/v1/payroll:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'generate';
    const periodKey = body.periodKey || '2025-03';
    const targetStep = Number(body.step) || 3;

    let result;

    if (action === 'disburse') {
      result = await disbursePayrollPeriod(periodKey);

      // Record audit log
      try {
        await recordAuditLog({
          action: 'PAYROLL_DISBURSED',
          module: 'PAYROLL',
          recordId: periodKey,
          userName: body.userName || 'Dewi Lestari, S.Psi',
          userEmail: body.userEmail || 'dewi.lestari@nexora.co.id',
          userNik: body.userNik || 'NX-ADMIN-001',
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Internal System',
          oldData: null,
          newData: {
            periodKey,
            totalNet: result.totalNet,
            totalEmployees: result.totalEmployees,
            status: 'DISBURSED',
          },
        });
      } catch {}

      // Broadcast SSE event
      broadcastApprovalEvent('PAYROLL_DISBURSED', {
        periodKey,
        totalNet: result.totalNet,
        totalEmployees: result.totalEmployees,
        status: 'DISBURSED',
        timestamp: new Date().toISOString(),
      });
    } else {
      // Generate or advance step
      result = await generatePayrollPeriod(periodKey, targetStep, false);

      // Record audit log
      try {
        await recordAuditLog({
          action: 'PAYROLL_GENERATED',
          module: 'PAYROLL',
          recordId: periodKey,
          userName: body.userName || 'Dewi Lestari, S.Psi',
          userEmail: body.userEmail || 'dewi.lestari@nexora.co.id',
          userNik: body.userNik || 'NX-ADMIN-001',
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Internal System',
          oldData: null,
          newData: {
            periodKey,
            step: targetStep,
            totalNet: result.totalNet,
            totalEmployees: result.totalEmployees,
          },
        });
      } catch {}

      // Broadcast SSE event
      broadcastApprovalEvent('PAYROLL_UPDATED', {
        periodKey,
        step: targetStep,
        status: result.status,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message:
        action === 'disburse'
          ? `Payroll ${result.periodLabel} sukses dicairkan ke seluruh rekening bank karyawan!`
          : `Payroll ${result.periodLabel} berhasil dikompilasi (Langkah ${targetStep}/5).`,
    });
  } catch (err: any) {
    console.error('Error in POST /api/v1/payroll:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
