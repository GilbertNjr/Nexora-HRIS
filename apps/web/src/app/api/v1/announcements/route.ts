import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { broadcastEmployeeEvent } from '@/lib/employeesSSE';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry } from '@/lib/auditDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const ANNOUNCEMENTS_FILE = path.join(STORAGE_DIR, 'nexora_announcements.json');

export interface HrAnnouncement {
  id: string;
  badge: string;
  docNumber: string;
  title: string;
  summary: string;
  content: string;
  buttonText: string;
  priority: 'URGENT' | 'IMPORTANT' | 'INFO';
  publishedAt: string;
  author: string;
  isEmergency?: boolean;
  attachmentUrl?: string;
}

const defaultAnnouncements: HrAnnouncement[] = [
  {
    id: 'ann-1',
    badge: 'PENGUMUMAN HRD',
    docNumber: 'No. 018/HR-NOTIF/III/2025',
    title: 'Penyesuaian Jam Operasional Ramadhan 1446 H',
    summary:
      'Selama bulan suci Ramadhan, jam kepulangan karyawan dimajukan menjadi pukul 16:30 WIB. Jam istirahat dipadatkan menjadi 30 menit demi efisiensi bersama.',
    content:
      'Berdasarkan Keputusan Direksi Nomor SE/018/DIR-HR/III/2025 mengenai Penyesuaian Jam Kerja Bulan Ramadhan 1446 H:\n\n1. Jam Kerja Reguler: 08:30 WIB s/d 16:30 WIB (Senin s/d Kamis), 08:30 WIB s/d 17:00 WIB (Jumat).\n2. Waktu Istirahat: 12:00 s/d 12:30 WIB (Senin - Kamis), 11:45 s/d 13:00 WIB (Jumat Sholat Jumat).\n3. Presensi tetap wajib melalui Liveness Biometric Face Scan pada Portal ESS.\n4. Karyawan yang bertugas WFH wajib standby pada jam kerja efektif dan mengikuti daily standup pukul 08:45 WIB.',
    buttonText: 'Lihat SE Direksi',
    priority: 'IMPORTANT',
    publishedAt: '24 Maret 2025, 08:00 WIB',
    author: 'Direktur SDM & Operasional',
    isEmergency: false,
  },
  {
    id: 'ann-2',
    badge: 'SURAT EDARAN',
    docNumber: 'No. 015/SE-DIR/II/2025',
    title: 'Kebijakan Skema Hybrid Working WFO & WFH 2025',
    summary:
      'Penegasan kuota WFH maksimal 2 hari per pekan dengan rasio kehadiran kantor minimal 60% per hari untuk mendukung sinergi antar departemen.',
    content:
      'Mengingat pentingnya kolaborasi tatap muka pada kuartal berjalan, manajemen menetapkan bahwa:\n\n1. Setiap anggota tim berhak mengajukan preferensi WFH maksimal 2 hari kerja dalam sepekan.\n2. Roster kerja wajib dikoordinasikan bersama Team Lead / Head of Department.\n3. Presensi WFO diverifikasi melalui Geofencing SCBD Tower Lt. 7.',
    buttonText: 'Lihat Kebijakan',
    priority: 'INFO',
    publishedAt: '15 Februari 2025, 09:30 WIB',
    author: 'HR Operations Lead',
    isEmergency: false,
  },
];

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {}
}

function getStoredAnnouncements(): HrAnnouncement[] {
  try {
    ensureStorage();
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {}
  return defaultAnnouncements;
}

function saveStoredAnnouncements(data: HrAnnouncement[]): void {
  try {
    ensureStorage();
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

// GET /api/v1/announcements
export async function GET() {
  try {
    const list = getStoredAnnouncements();
    return NextResponse.json({
      success: true,
      data: list,
      count: list.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message } },
      { status: 500 }
    );
  }
}

// POST /api/v1/announcements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.summary) {
      return NextResponse.json(
        { success: false, error: { message: 'Judul dan ringkasan pengumuman wajib diisi' } },
        { status: 400 }
      );
    }

    const now = new Date();
    const publishedAtStr = `${now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    const newAnnouncement: HrAnnouncement = {
      id: `ann-${Date.now()}`,
      badge: body.badge || (body.priority === 'URGENT' ? 'URGENT BROADCAST' : 'PENGUMUMAN HRD'),
      docNumber:
        body.docNumber ||
        `No. ${String(Math.floor(Math.random() * 900) + 100)}/HR-NOTIF/${new Intl.DateTimeFormat('id-ID', { month: 'numeric' }).format(now)}/${now.getFullYear()}`,
      title: body.title,
      summary: body.summary,
      content: body.content || body.summary,
      buttonText: body.buttonText || 'Lihat Pengumuman',
      priority: body.priority || 'IMPORTANT',
      publishedAt: publishedAtStr,
      author: body.author || 'Dewi Lestari, S.Psi (HR Operations Manager)',
      isEmergency: body.isEmergency || body.priority === 'URGENT',
      attachmentUrl: body.attachmentUrl || undefined,
    };

    const currentList = getStoredAnnouncements();
    const updatedList = [newAnnouncement, ...currentList.slice(0, 19)];
    saveStoredAnnouncements(updatedList);

    // Multi-device SSE broadcast
    try {
      broadcastEmployeeEvent('ANNOUNCEMENT_PUBLISHED', newAnnouncement);
    } catch {}

    // Synchronize to persistent notifications center so every employee role sees it in the bell dropdown
    try {
      const NOTIFICATIONS_FILE = path.join(STORAGE_DIR, 'nexora_notifications.json');
      let notifs: any[] = [];
      if (fs.existsSync(NOTIFICATIONS_FILE)) {
        try {
          const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
          notifs = JSON.parse(raw);
          if (!Array.isArray(notifs)) notifs = [];
        } catch {}
      }

      const notifItem = {
        id: `notif-ann-${Date.now()}`,
        title: `📢 ${newAnnouncement.badge}: ${newAnnouncement.title}`,
        message: newAnnouncement.summary,
        category: 'system',
        type:
          newAnnouncement.priority === 'URGENT'
            ? 'urgent'
            : newAnnouncement.priority === 'IMPORTANT'
            ? 'warning'
            : 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/karyawan',
        actionLabel: newAnnouncement.buttonText || 'Buka Dokumen',
        actor: {
          name: newAnnouncement.author || 'Dewan Direksi & HR',
          initials: 'HR',
          avatarColor: 'from-amber-600 to-orange-600',
        },
        metadata: {
          announcementId: newAnnouncement.id,
          docNumber: newAnnouncement.docNumber,
          isAnnouncement: true,
          priority: newAnnouncement.priority,
        },
      };

      const updatedNotifs = [notifItem, ...notifs].slice(0, 50);
      ensureStorage();
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(updatedNotifs, null, 2), 'utf-8');

      // Broadcast NEW_NOTIFICATION so bell icons ring and refresh unread counter
      try {
        broadcastEmployeeEvent('NEW_NOTIFICATION', notifItem);
      } catch {}
    } catch (notifErr) {
      console.error('[Announcements] Failed to sync notification:', notifErr);
    }

    // Audit log
    try {
      const auditLog: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        module: 'ANNOUNCEMENTS',
        action: 'ANNOUNCEMENT_BROADCASTED',
        recordId: newAnnouncement.id,
        userName: newAnnouncement.author,
        userEmail: 'hr-operations@nexora.co.id',
        userNik: 'NX-HR001',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: 'Nexora HR Admin Console',
        timestamp: publishedAtStr,
        oldData: null,
        newData: {
          title: newAnnouncement.title,
          badge: newAnnouncement.badge,
          docNumber: newAnnouncement.docNumber,
          priority: newAnnouncement.priority,
        },
      };
      saveStoredAuditLogs([auditLog, ...getStoredAuditLogs().slice(0, 99)]);
      broadcastAuditEvent('AUDIT_LOG_CREATED', auditLog);
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: newAnnouncement,
        message: 'Pengumuman HR berhasil disiarkan secara real-time ke semua dashboard karyawan!',
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message } },
      { status: 500 }
    );
  }
}
