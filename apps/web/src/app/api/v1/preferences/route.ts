import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { recordAuditLog, AuditLogEntry } from '@/lib/auditDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const PREFS_FILE = path.join(STORAGE_DIR, 'nexora_system_preferences.json');

const DEFAULT_PREFERENCES = {
  themeMode: 'light',
  tableDensity: 'normal',
  fontSize: 'standard',
  microAnimations: true,
  highContrast: false,
  screenReaderSupport: false,
  audioFeedback: true,
  language: 'id',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Jakarta',
  updatedAt: new Date().toISOString(),
};

function readStoredPreferences() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (fs.existsSync(PREFS_FILE)) {
      const content = fs.readFileSync(PREFS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {}
  return DEFAULT_PREFERENCES;
}

function writeStoredPreferences(data: any) {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(PREFS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Preferences API] Write error:', err);
  }
}

// GET: Retrieve system preferences
export async function GET() {
  try {
    const prefs = readStoredPreferences();
    return NextResponse.json({
      success: true,
      data: prefs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Gagal memuat preferensi sistem' } },
      { status: 500 }
    );
  }
}

// POST: Save system preferences and log audit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const oldPrefs = readStoredPreferences();
    const newPrefs = {
      ...oldPrefs,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    writeStoredPreferences(newPrefs);

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser Client';

    // Record audit log entry
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).split('/').reverse().join('-') +
      ' ' +
      now.toLocaleTimeString('id-ID') +
      ' WIB';

    const auditLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      module: 'AUTH',
      action: 'SYSTEM_PREFERENCES_UPDATED',
      recordId: 'global-system-preferences',
      userName: body.savedBy || 'HR Admin System',
      userEmail: body.userEmail || 'admin@nexora.co.id',
      userNik: body.userNik || 'GLOBAL',
      ipAddress,
      userAgent,
      timestamp: timestampStr,
      oldData: {
        themeMode: oldPrefs.themeMode,
        tableDensity: oldPrefs.tableDensity,
        fontSize: oldPrefs.fontSize,
      },
      newData: {
        themeMode: newPrefs.themeMode,
        tableDensity: newPrefs.tableDensity,
        fontSize: newPrefs.fontSize,
        language: newPrefs.language,
        timezone: newPrefs.timezone,
      },
    };

    try {
      await recordAuditLog(auditLog);
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Preferensi sistem & matriks notifikasi global berhasil disimpan dan disinkronkan.',
      data: newPrefs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Gagal menyimpan preferensi' } },
      { status: 500 }
    );
  }
}
