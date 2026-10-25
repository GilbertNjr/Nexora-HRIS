import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { broadcastEmployeeEvent } from '@/lib/employeesSSE';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_Jv7SzD1PgcQl@ep-shiny-silence-azkjdzr3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL;

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
  logoUrl: '/company-logo-saved.jpg',
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

function getLocalData() {
  try {
    ensureStorage();
    if (fs.existsSync(COMPANY_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(COMPANY_FILE, 'utf-8'));
      return { ...defaultCompanyData, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultCompanyData;
}

export async function GET() {
  let current = getLocalData();

  // 1. Fetch from official Neon PostgreSQL Database for 100% global multi-device sync
  if (DATABASE_URL) {
    try {
      const sql = neon(DATABASE_URL);
      const rows = await sql`
        SELECT id, name, legal_name, tax_id, address, logo_url, updated_at 
        FROM companies 
        LIMIT 1
      `;

      if (Array.isArray(rows) && rows.length > 0) {
        const comp = rows[0] as any;
        current = {
          ...current,
          legalName: comp.legal_name || current.legalName,
          commercialName: comp.name || current.commercialName,
          npwp: comp.tax_id || current.npwp,
          address: comp.address || current.address,
          // If database has logo_url, use it; otherwise fallback to local/default logo
          logoUrl: comp.logo_url || current.logoUrl || '/company-logo-saved.jpg',
        };
      }
    } catch (dbErr) {
      console.warn('[Company API] Neon DB read warning:', dbErr);
    }
  }

  return NextResponse.json({ success: true, data: current }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    ensureStorage();

    const current = getLocalData();
    const updated = {
      ...current,
      ...body,
      // If client didn't specify logoUrl, preserve existing logo
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : current.logoUrl,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to Neon PostgreSQL Database for real-time global availability on all devices
    if (DATABASE_URL) {
      try {
        const sql = neon(DATABASE_URL);
        const updatedRows = await sql`
          UPDATE companies 
          SET legal_name = ${updated.legalName},
              name = ${updated.commercialName},
              tax_id = ${updated.npwp},
              address = ${updated.address},
              logo_url = ${updated.logoUrl},
              updated_at = NOW()
          RETURNING id
        `;

        if (Array.isArray(updatedRows) && updatedRows.length === 0) {
          await sql`
            INSERT INTO companies (id, code, name, legal_name, tax_id, address, logo_url, created_at, updated_at)
            VALUES (gen_random_uuid(), 'NX-HQ', ${updated.commercialName}, ${updated.legalName}, ${updated.npwp}, ${updated.address}, ${updated.logoUrl}, NOW(), NOW())
          `;
        }
      } catch (dbErr) {
        console.warn('[Company API] Neon DB update warning:', dbErr);
      }
    }

    // 2. Persist to server-side file storage as fallback
    try {
      fs.writeFileSync(COMPANY_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // ignore
    }

    // 3. Broadcast real-time SSE event to all connected devices (mobile, tablet, desktop)
    try {
      broadcastEmployeeEvent('COMPANY_UPDATED', updated);
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Data legalitas dan logo perusahaan berhasil disimpan permanen ke database global.',
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
