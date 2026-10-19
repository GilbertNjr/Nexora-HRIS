import { NextResponse } from 'next/server';
import { getEmployeeMetricsFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/v1/employees/metrics
 * Mengambil ringkasan metrik personalia (Headcount Overview) untuk dashboard & badge admin
 */
export async function GET() {
  try {
    const metrics = await getEmployeeMetricsFromDb();

    return NextResponse.json(
      {
        success: true,
        data: metrics,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'METRICS_ERROR',
          message: error.message || 'Gagal mengambil metrik karyawan',
        },
      },
      { status: 500 }
    );
  }
}
