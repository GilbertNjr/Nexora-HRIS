import { NextRequest, NextResponse } from 'next/server';
import { getEmployeesFromDb, saveEmployeeToDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const department = searchParams.get('department') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const all = await getEmployeesFromDb();

    // Filter
    let filtered = all;
    if (search) {
      filtered = filtered.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(search) ||
          emp.employeeNumber.toLowerCase().includes(search) ||
          (emp.email && emp.email.toLowerCase().includes(search)) ||
          emp.designation.toLowerCase().includes(search)
      );
    }

    if (department !== 'ALL') {
      filtered = filtered.filter((emp) => emp.department === department);
    }

    // Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        success: true,
        data: {
          items,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Gagal mengambil data karyawan',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.firstName || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nama depan dan email wajib diisi',
          },
        },
        { status: 400 }
      );
    }

    const saved = await saveEmployeeToDb({
      firstName: body.firstName,
      lastName: body.lastName || '',
      fullName: `${body.firstName} ${body.lastName || ''}`.trim(),
      email: body.email,
      phone: body.phone || null,
      department: body.department || 'Teknologi Informasi',
      designation: body.designation || 'Staff',
      employmentType: body.employmentType || 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: body.joinDate || new Date().toISOString().split('T')[0],
      bankName: body.bankName || undefined,
      accountNumber: body.accountNumber || undefined,
      accountHolder: body.accountHolder || `${body.firstName} ${body.lastName || ''}`.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        data: saved,
        message: 'Karyawan berhasil didaftarkan dan tersimpan di database',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || 'Gagal menyimpan data karyawan',
        },
      },
      { status: 500 }
    );
  }
}
