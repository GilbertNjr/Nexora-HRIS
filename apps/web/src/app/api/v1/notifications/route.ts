import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vpusbeqevsgivsgaahat.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const NOTIFICATIONS_FILE = path.join(STORAGE_DIR, 'nexora_notifications.json');

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'attendance' | 'leave' | 'payroll' | 'employee' | 'system' | 'security';
  type: 'info' | 'success' | 'warning' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  actor?: {
    name: string;
    initials: string;
    avatarColor?: string;
    avatarUrl?: string;
  };
  metadata?: Record<string, any>;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-01',
    title: 'Pengajuan Cuti Tahunan Baru',
    message: 'Budi Santoso (Senior UI Designer) mengajukan Cuti Tahunan selama 3 hari (26 - 28 Mar 2025).',
    category: 'leave',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    actionUrl: '/admin/leave',
    actionLabel: 'Tinjau Pengajuan',
    actor: {
      name: 'Budi Santoso',
      initials: 'BS',
      avatarColor: 'from-blue-600 to-indigo-600',
    },
    metadata: { requestId: 'req-01', type: 'cuti' },
  },
  {
    id: 'notif-02',
    title: 'Pengajuan Cuti Sakit Dengan Lampiran',
    message: 'Siti Rahmawati melampirkan Surat_Dokter_Klinik.pdf untuk permohonan Cuti Sakit 1 hari.',
    category: 'leave',
    type: 'urgent',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    actionUrl: '/admin/leave',
    actionLabel: 'Periksa Dokumen',
    actor: {
      name: 'Siti Rahmawati',
      initials: 'SR',
      avatarColor: 'from-amber-500 to-rose-500',
    },
    metadata: { requestId: 'req-02', type: 'cuti', hasAttachment: true },
  },
  {
    id: 'notif-03',
    title: 'Klaim Lembur Operasional Server',
    message: 'Dimas Aditya mengajukan lembur 4 jam (Deployment Server Core). Telah diverifikasi Tech Lead.',
    category: 'leave',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    actionUrl: '/admin/leave',
    actionLabel: 'Lihat Detail',
    actor: {
      name: 'Dimas Aditya',
      initials: 'DA',
      avatarColor: 'from-emerald-500 to-teal-700',
    },
    metadata: { requestId: 'req-03', type: 'lembur' },
  },
  {
    id: 'notif-04',
    title: 'Anomali Presensi Check-In Terlambat',
    message: 'Ahmad Rizki melakukan tap-in terlambat 15 menit hari ini pada pukul 09:15 WIB di Gedung SCBD.',
    category: 'attendance',
    type: 'warning',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    actionUrl: '/admin/attendance',
    actionLabel: 'Buka Log Presensi',
    actor: {
      name: 'Ahmad Rizki',
      initials: 'AR',
      avatarColor: 'from-violet-600 to-purple-600',
    },
  },
  {
    id: 'notif-05',
    title: 'Draft Rekapitulasi Payroll Siap',
    message: 'Kalkulasi batch gaji karyawan bulan berjalan telah siap diverifikasi oleh Manajer Keuangan & HR.',
    category: 'payroll',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    actionUrl: '/admin/payroll',
    actionLabel: 'Proses Payroll',
    actor: {
      name: 'Sistem Payroll',
      initials: 'PR',
      avatarColor: 'from-indigo-600 to-blue-600',
    },
  },
  {
    id: 'notif-06',
    title: 'Audit Keamanan Akun Diperbarui',
    message: 'Penerapan standar autentikasi dua faktor (2FA) ISO/IEC 27001 telah aktif untuk seluruh admin.',
    category: 'security',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hours ago
    actionUrl: '/admin/profile/security',
    actionLabel: 'Lihat Status Keamanan',
    actor: {
      name: 'Sistem Nexora',
      initials: 'NX',
      avatarColor: 'from-slate-700 to-slate-900',
    },
  },
];

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
}

function getStoredNotifications(): NotificationItem[] {
  try {
    ensureStorage();
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // ignore
  }
  return defaultNotifications;
}

function saveStoredNotifications(items: NotificationItem[]): void {
  try {
    ensureStorage();
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const unreadOnly = searchParams.get('unread') === 'true';

  let items = getStoredNotifications();

  if (category && category !== 'all') {
    items = items.filter((n) => n.category === category);
  }

  if (unreadOnly) {
    items = items.filter((n) => !n.isRead);
  }

  const unreadCount = getStoredNotifications().filter((n) => !n.isRead).length;

  return NextResponse.json(
    {
      success: true,
      data: items,
      unreadCount,
      totalCount: items.length,
      realtimeStatus: 'CONNECTED',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = getStoredNotifications();

    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: body.title || 'Notifikasi Baru',
      message: body.message || 'Informasi notifikasi kepegawaian HRIS.',
      category: body.category || 'system',
      type: body.type || 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: body.actionUrl || '/admin',
      actionLabel: body.actionLabel || 'Lihat Rincian',
      actor: body.actor || {
        name: 'Sistem Nexora',
        initials: 'NX',
        avatarColor: 'from-blue-600 to-indigo-600',
      },
      metadata: body.metadata || {},
    };

    const updated = [newItem, ...items].slice(0, 50); // limit to 50 items
    saveStoredNotifications(updated);

    return NextResponse.json(
      {
        success: true,
        data: newItem,
        unreadCount: updated.filter((n) => !n.isRead).length,
        message: 'Notifikasi real-time berhasil dibuat.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOTIF_CREATE_ERROR', message: err.message },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const items = getStoredNotifications();

    // Action 1: Mark all as read
    if (body.action === 'mark_all_read') {
      const updated = items.map((n) => ({ ...n, isRead: true }));
      saveStoredNotifications(updated);
      return NextResponse.json(
        {
          success: true,
          data: updated,
          unreadCount: 0,
          message: 'Semua notifikasi telah ditandai sebagai sudah dibaca.',
        },
        { status: 200 }
      );
    }

    // Action 2: Mark single item read/unread
    if (body.id) {
      const updated = items.map((n) => {
        if (n.id === body.id) {
          return { ...n, isRead: body.isRead !== undefined ? body.isRead : true };
        }
        return n;
      });

      saveStoredNotifications(updated);
      return NextResponse.json(
        {
          success: true,
          data: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
          message: 'Status notifikasi berhasil diperbarui.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: { message: 'Aksi atau ID notifikasi dibutuhkan.' } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOTIF_UPDATE_ERROR', message: err.message },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    const items = getStoredNotifications();

    if (action === 'clear_all') {
      saveStoredNotifications([]);
      return NextResponse.json(
        {
          success: true,
          data: [],
          unreadCount: 0,
          message: 'Semua notifikasi berhasil dibersihkan.',
        },
        { status: 200 }
      );
    }

    if (id) {
      const updated = items.filter((n) => n.id !== id);
      saveStoredNotifications(updated);
      return NextResponse.json(
        {
          success: true,
          data: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
          message: 'Notifikasi berhasil dihapus.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: { message: 'Parameter ID atau action dibutuhkan.' } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOTIF_DELETE_ERROR', message: err.message },
      },
      { status: 500 }
    );
  }
}
