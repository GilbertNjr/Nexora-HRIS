import { NextRequest, NextResponse } from 'next/server';
import { getPayrollPeriod, getEmployeePayslip } from '@/lib/payrollDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get('nik');
    const period = searchParams.get('period') || '2025-03';

    if (!nik) {
      return NextResponse.json(
        { success: false, error: 'Parameter NIK / employeeNumber diperlukan' },
        { status: 400 }
      );
    }

    // Try target period
    let result = await getEmployeePayslip(nik, period);

    // If not found in target period, fallback to 2025-03 or generate
    if (!result) {
      result = await getEmployeePayslip(nik, '2025-03');
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Data slip gaji untuk NIK ini belum tersedia' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        period: {
          periodKey: result.period.periodKey,
          periodLabel: result.period.periodLabel,
          status: result.period.status,
          cutoffDateStr: result.period.cutoffDateStr,
          releaseDateStr: result.period.releaseDateStr,
        },
        record: result.record,
      },
    });
  } catch (err: any) {
    console.error('Error in GET /api/v1/payroll/my-slip:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
