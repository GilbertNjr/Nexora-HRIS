import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const COMPANY_FILE = path.join(STORAGE_DIR, 'nexora_company_settings.json');

const defaultCompanyData = {
  legalName: 'PT Nexora Teknologi Nusantara Tbk',
  commercialName: 'Nexora Group & HR Solutions',
  nib: '0220108920194001',
  npwp: '01.345.678.9-012.000',
  kbli: '62019 - Aktivitas Pemrograman Komputer & Solusi Cloud Korporasi Terintegrasi',
  entityType: 'Perseroan Terbuka (Tbk)',
  address: 'SCBD Treasury Tower Lt. 32, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan, DKI Jakarta 12190',
  logoUrl: '',
};

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
}

export async function GET() {
  try {
    ensureStorage();
    if (fs.existsSync(COMPANY_FILE)) {
      const data = JSON.parse(fs.readFileSync(COMPANY_FILE, 'utf-8'));
      return NextResponse.json({ success: true, data }, { status: 200 });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ success: true, data: defaultCompanyData }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    ensureStorage();

    let current = defaultCompanyData;
    if (fs.existsSync(COMPANY_FILE)) {
      try {
        current = JSON.parse(fs.readFileSync(COMPANY_FILE, 'utf-8'));
      } catch {
        // ignore
      }
    }

    const updated = { ...current, ...body, updatedAt: new Date().toISOString() };
    fs.writeFileSync(COMPANY_FILE, JSON.stringify(updated, null, 2), 'utf-8');

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Data legalitas dan logo perusahaan berhasil disimpan ke database',
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UPDATE_ERROR', message: err.message },
      },
      { status: 500 }
    );
  }
}
