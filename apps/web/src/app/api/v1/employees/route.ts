import { NextRequest, NextResponse } from 'next/server';
import { getEmployeesFromDb, saveEmployeeToDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/v1/employees
 * Mengambil daftar seluruh karyawan dengan filtering, pencarian, sorting, dan pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const department = searchParams.get('department') || 'ALL';
    const employmentType = searchParams.get('employmentType') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const all = await getEmployeesFromDb();

    // 1. Filtering
    let filtered = all.filter((emp) => {
      // Search by name, NIK, email, phone, or designation
      if (search) {
        const matchesSearch =
          emp.fullName.toLowerCase().includes(search) ||
          emp.employeeNumber.toLowerCase().includes(search) ||
          (emp.email && emp.email.toLowerCase().includes(search)) ||
          (emp.phone && emp.phone.includes(search)) ||
          emp.designation.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Department filter
      if (department !== 'ALL' && emp.department !== department) {
        return false;
      }

      // Employment Type filter
      if (employmentType !== 'ALL' && emp.employmentType !== employmentType) {
        return false;
      }

      // Status filter
      if (status !== 'ALL' && emp.employmentStatus !== status) {
        return false;
      }

      return true;
    });

    // 2. Sorting
    filtered.sort((a: any, b: any) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // 3. Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json(
      {
        success: true,
        data: {
          items,
          meta: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
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

/**
 * POST /api/v1/employees
 * Mendaftarkan karyawan baru oleh Admin HR
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi field wajib
    if (!body.firstName || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nama depan dan email kantor wajib diisi.',
          },
        },
        { status: 400 }
      );
    }

    // Cek duplikasi email
    const existingList = await getEmployeesFromDb();
    const isEmailTaken = existingList.some(
      (e) => e.email && e.email.toLowerCase() === body.email.toLowerCase().trim()
    );
    if (isEmailTaken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: `Email '${body.email}' sudah terdaftar dalam sistem.`,
          },
        },
        { status: 409 }
      );
    }

    const saved = await saveEmployeeToDb({
      firstName: body.firstName.trim(),
      lastName: (body.lastName || '').trim(),
      fullName: `${body.firstName.trim()} ${(body.lastName || '').trim()}`.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim() || null,
      department: body.department || 'Teknologi Informasi',
      designation: body.designation || 'Staff',
      division: body.division || 'Divisi Rekayasa & Arsitektur Cloud',
      grade: body.grade || 'Grade: P3 - Specialist',
      office: body.office || 'Head Office Jakarta',
      deskLocation: body.deskLocation || 'Lantai 5, Node #A-01',
      employmentType: body.employmentType || 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: body.joinDate || new Date().toISOString().split('T')[0],
      nik: body.nik || '3174000000000000',
      npwp: body.npwp || '00.000.000.0-000.000',
      bpjsTk: body.bpjsTk || '00000000000',
      bpjsKes: body.bpjsKes || '0000000000000',
      birthPlaceDate: body.birthPlaceDate || 'Jakarta, 01 Januari 1995 (31 Tahun)',
      genderBlood: body.genderBlood || 'Laki-Laki / O (+)',
      religion: body.religion || 'Islam',
      taxStatus: body.taxStatus || 'Lajang (TK/0)',
      taxDependents: body.taxDependents || 'Tidak Ada',
      bankName: body.bankName || 'BCA',
      accountNumber: body.accountNumber || '',
      accountHolder: body.accountHolder || `${body.firstName.trim()} ${(body.lastName || '').trim()}`.trim(),
      basicSalary: body.basicSalary ? Number(body.basicSalary) : 12000000,
      transportAllowance: body.transportAllowance ? Number(body.transportAllowance) : 1500000,
      mealAllowance: body.mealAllowance ? Number(body.mealAllowance) : 1200000,
    });

    return NextResponse.json(
      {
        success: true,
        data: saved,
        message: `Karyawan ${saved.fullName} (${saved.employeeNumber}) berhasil didaftarkan ke sistem.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || 'Gagal menyimpan data karyawan baru',
        },
      },
      { status: 500 }
    );
  }
}
