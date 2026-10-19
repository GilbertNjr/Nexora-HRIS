import { NextResponse } from 'next/server';
import { getEmployeesFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/v1/employees/export
 * Mengekspor seluruh data direktori karyawan ke dalam format CSV
 */
export async function GET() {
  try {
    const employees = await getEmployeesFromDb();

    // CSV Header
    const headers = [
      'NIK / Employee ID',
      'Nama Lengkap',
      'Email Kantor',
      'Nomor Telepon',
      'Departemen',
      'Jabatan / Posisi',
      'Divisi',
      'Grade',
      'Lokasi Kantor',
      'Tipe Kontrak',
      'Status Kerja',
      'Tanggal Bergabung',
      'Masa Kerja',
      'NIK (KTP)',
      'NPWP',
      'BPJS Ketenagakerjaan',
      'BPJS Kesehatan',
      'Nama Bank',
      'Nomor Rekening',
      'Pemilik Rekening',
      'Gaji Pokok (IDR)',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = employees.map((e) => [
      escapeCsv(e.employeeNumber),
      escapeCsv(e.fullName),
      escapeCsv(e.email),
      escapeCsv(e.phone),
      escapeCsv(e.department),
      escapeCsv(e.designation),
      escapeCsv(e.division),
      escapeCsv(e.grade),
      escapeCsv(e.office),
      escapeCsv(e.employmentType),
      escapeCsv(e.employmentStatus),
      escapeCsv(e.joinDate),
      escapeCsv(e.tenure),
      escapeCsv(e.nik),
      escapeCsv(e.npwp),
      escapeCsv(e.bpjsTk),
      escapeCsv(e.bpjsKes),
      escapeCsv(e.bankName),
      escapeCsv(e.accountNumber),
      escapeCsv(e.accountHolder),
      escapeCsv(e.basicSalary || 0),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nexora_karyawan_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXPORT_ERROR',
          message: error.message || 'Gagal mengekspor data karyawan',
        },
      },
      { status: 500 }
    );
  }
}
