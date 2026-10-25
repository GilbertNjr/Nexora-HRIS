import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { broadcastEmployeeEvent } from '@/lib/employeesSSE';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry } from '@/lib/auditDb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_Jv7SzD1PgcQl@ep-shiny-silence-azkjdzr3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL;

function getDb() {
  return neon(DATABASE_URL);
}

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
    docNumber: 'No. 018/HR-NOTIF/X/2026',
    title: 'Ketentuan Core Hours & Fleksibilitas Hybrid Kerja Q4 2026',
    summary:
      'Penyesuaian core hours 08:30 - 16:30 WIB dengan integrasi otomatis Google Calendar dan kepatuhan kuota minimal WFO 60% pekanan.',
    content:
      'Berdasarkan Keputusan Direksi Nomor SE/018/DIR-HR/X/2026 mengenai Penyesuaian Jam Kerja & Hybrid Working Q4 2026:\n\n1. Jam Kerja Reguler: 08:30 WIB s/d 16:30 WIB (Senin s/d Kamis), 08:30 WIB s/d 17:00 WIB (Jumat).\n2. Waktu Istirahat: 12:00 s/d 13:00 WIB (Senin - Kamis), 11:30 s/d 13:00 WIB (Jumat Sholat Jumat).\n3. Presensi tetap wajib melalui Liveness Biometric Face Scan pada Portal ESS.\n4. Karyawan yang bertugas WFH wajib standby pada jam kerja efektif dan mengikuti daily standup pukul 08:45 WIB.',
    buttonText: 'Lihat SE Direksi',
    priority: 'IMPORTANT',
    publishedAt: '20 Oktober 2026, 08:00 WIB',
    author: 'Direktur SDM & Operasional',
    isEmergency: false,
  },
  {
    id: 'ann-2',
    badge: 'PAYROLL & KOMPENSASI',
    docNumber: 'No. 024/HR-PAY/X/2026',
    title: 'Penyaluran Batch Payroll Periode Maret 2025 Sukses 100%',
    summary:
      'Perintah transfer penggajian batch periode berjalan telah sukses disalurkan ke host-to-host kliring perbankan. Slip gaji digital telah terbit dan dapat diunduh.',
    content:
      'Pemberitahuan kepada seluruh staf aktif PT Nexora Solusi Nusantara:\n\n1. Pemrosesan lembar kompensasi periode 26 Februari - 25 Maret 2025 telah selesai diotorisasi.\n2. Seluruh hak gaji pokok, tunjangan operasional, dan lembur telah ditransfer ke rekening payroll karyawan.\n3. Rincian pemotongan PPh 21 TER (PP 58/2023) dan iuran BPJS Ketenagakerjaan/Kesehatan tercantum lengkap di slip gaji digital.',
    buttonText: 'Cek Rincian Payroll',
    priority: 'INFO',
    publishedAt: '25 Maret 2025, 14:30 WIB',
    author: 'Finance & HR Operations Manager',
    isEmergency: false,
  },
  {
    id: 'ann-3',
    badge: 'BENEFIT & ASURANSI',
    docNumber: 'No. 012/HR-BENEFIT/X/2026',
    title: 'Pembaruan Skema Manfaat Asuransi Kesehatan & Medical Reimbursement',
    summary:
      'Peningkatan fasilitas rawat jalan dan integrasi klaim digital cashless melalui portal ESS Karyawan dengan jaringan rumah sakit rekanan tier-1.',
    content:
      'Manajemen HR dengan bangga mengumumkan pembaruan fasilitas asuransi kesehatan karyawan:\n\n1. Plafon rawat jalan ditingkatkan sebesar 15% untuk seluruh staf tetap.\n2. Klaim rawat inap dan obat resep dapat diproses secara cashless via kartu digital ESS.\n3. Buku panduan klaim reimbursement dapat diakses di Pusat Dokumen & Surat.',
    buttonText: 'Rincian Polis Asuransi',
    priority: 'INFO',
    publishedAt: '12 Oktober 2026, 10:00 WIB',
    author: 'Benefit & People Development Lead',
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

function getStoredFileAnnouncements(): HrAnnouncement[] {
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

function saveStoredFileAnnouncements(data: HrAnnouncement[]): void {
  try {
    ensureStorage();
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

async function getAnnouncementsFromDb(): Promise<HrAnnouncement[]> {
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS hr_announcements (
        id VARCHAR(100) PRIMARY KEY,
        badge VARCHAR(100) NOT NULL,
        doc_number VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        button_text VARCHAR(100) NOT NULL,
        priority VARCHAR(50) NOT NULL,
        published_at VARCHAR(100) NOT NULL,
        author VARCHAR(150) NOT NULL,
        is_emergency BOOLEAN DEFAULT FALSE,
        attachment_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const rows = await sql`
      SELECT id, badge, doc_number AS "docNumber", title, summary, content,
             button_text AS "buttonText", priority, published_at AS "publishedAt",
             author, is_emergency AS "isEmergency", attachment_url AS "attachmentUrl"
      FROM hr_announcements
      ORDER BY created_at DESC
      LIMIT 20;
    `;

    if (rows && rows.length > 0) {
      return rows as unknown as HrAnnouncement[];
    }

    // Seed default announcements if table is empty
    for (const item of defaultAnnouncements) {
      await sql`
        INSERT INTO hr_announcements (
          id, badge, doc_number, title, summary, content, button_text,
          priority, published_at, author, is_emergency, attachment_url
        ) VALUES (
          ${item.id}, ${item.badge}, ${item.docNumber}, ${item.title},
          ${item.summary}, ${item.content}, ${item.buttonText}, ${item.priority},
          ${item.publishedAt}, ${item.author}, ${item.isEmergency || false}, ${item.attachmentUrl || null}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }

    return defaultAnnouncements;
  } catch (err) {
    console.error('Error fetching announcements from DB, using file fallback:', err);
    return getStoredFileAnnouncements();
  }
}

// GET /api/v1/announcements
export async function GET() {
  try {
    const list = await getAnnouncementsFromDb();
    saveStoredFileAnnouncements(list);
    return NextResponse.json({
      success: true,
      data: list,
      count: list.length,
    });
  } catch (err: any) {
    const fallback = getStoredFileAnnouncements();
    return NextResponse.json({
      success: true,
      data: fallback,
      count: fallback.length,
    });
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

    // 1. Insert into Neon PostgreSQL
    try {
      const sql = getDb();
      await sql`
        INSERT INTO hr_announcements (
          id, badge, doc_number, title, summary, content, button_text,
          priority, published_at, author, is_emergency, attachment_url, created_at
        ) VALUES (
          ${newAnnouncement.id}, ${newAnnouncement.badge}, ${newAnnouncement.docNumber},
          ${newAnnouncement.title}, ${newAnnouncement.summary}, ${newAnnouncement.content},
          ${newAnnouncement.buttonText}, ${newAnnouncement.priority}, ${newAnnouncement.publishedAt},
          ${newAnnouncement.author}, ${newAnnouncement.isEmergency || false},
          ${newAnnouncement.attachmentUrl || null}, NOW()
        );
      `;
    } catch (dbErr) {
      console.error('Failed to insert announcement to PostgreSQL:', dbErr);
    }

    // 2. Save to file storage
    const currentList = getStoredFileAnnouncements();
    const updatedList = [newAnnouncement, ...currentList.filter((a) => a.id !== newAnnouncement.id).slice(0, 19)];
    saveStoredFileAnnouncements(updatedList);

    // 3. Multi-device SSE broadcast
    try {
      broadcastEmployeeEvent('ANNOUNCEMENT_PUBLISHED', newAnnouncement);
    } catch {}

    // 4. Synchronize to persistent notifications center
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

      try {
        broadcastEmployeeEvent('NEW_NOTIFICATION', notifItem);
      } catch {}
    } catch (notifErr) {
      console.error('[Announcements] Failed to sync notification:', notifErr);
    }

    // 5. Audit log
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
