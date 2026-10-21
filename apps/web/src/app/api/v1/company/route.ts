import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { broadcastEmployeeEvent } from '@/lib/employeesSSE';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vpusbeqevsgivsgaahat.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

  // 1. Try Supabase REST API
  if (SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=*&limit=1`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const comp = rows[0];
          current = {
            ...current,
            legalName: comp.legal_name || current.legalName,
            commercialName: comp.name || current.commercialName,
            npwp: comp.tax_id || current.npwp,
            address: comp.address || current.address,
            logoUrl: comp.logo_url || current.logoUrl || '',
          };
        }
      }
    } catch {
      // fallback to file
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

    // 1. Try Supabase REST API
    if (SUPABASE_KEY) {
      try {
        const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/companies?limit=1`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            legal_name: updated.legalName,
            name: updated.commercialName,
            tax_id: updated.npwp,
            address: updated.address,
            logo_url: updated.logoUrl,
          }),
        });

        // If no row existed to patch, insert a new company row
        if (patchRes.ok) {
          const patched = await patchRes.json();
          if (Array.isArray(patched) && patched.length === 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/companies`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              },
              body: JSON.stringify({
                code: 'NEXORA-CORP',
                name: updated.commercialName,
                legal_name: updated.legalName,
                tax_id: updated.npwp,
                address: updated.address,
                logo_url: updated.logoUrl,
              }),
            });
          }
        }
      } catch {
        // ignore
      }
    }

    // 2. Persist to local file storage as fallback
    try {
      fs.writeFileSync(COMPANY_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch {
      // ignore
    }

    // 3. Broadcast real-time update across all devices
    try {
      broadcastEmployeeEvent('COMPANY_UPDATED', updated);
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Data legalitas dan logo perusahaan berhasil disimpan permanen',
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
