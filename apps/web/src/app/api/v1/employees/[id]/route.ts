import { NextRequest, NextResponse } from 'next/server';
import { getEmployeesFromDb, updateEmployeeInDb, deleteEmployeeFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const all = await getEmployeesFromDb();
    const found = all.find((e) => e.id === params.id);

    if (!found) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Karyawan tidak ditemukan' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: found }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateEmployeeInDb(params.id, body);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Karyawan tidak ditemukan untuk diperbarui' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Data karyawan berhasil diperbarui',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UPDATE_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteEmployeeFromDb(params.id);

    return NextResponse.json(
      {
        success,
        message: 'Karyawan berhasil dihapus',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DELETE_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
