import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const APPROVALS_FILE = path.join(STORAGE_DIR, 'nexora_approvals.json');

export interface ApprovalItem {
  id: string;
  name: string;
  role: string;
  type: 'cuti' | 'lembur';
  title: string;
  highlightType: string;
  detail: string;
  quotaMeta?: string;
  timestamp: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  verifiedBy?: string;
  estimatedCost?: string;
  avatarColor: string;
  initials: string;
  verifiedBadge: 'check' | 'alert' | 'bolt';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

function generateDefaultApprovals(): ApprovalItem[] {
  const now = new Date();
  const year = now.getFullYear();
  const monthShort = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(now);
  const day = now.getDate();

  return [
    {
      id: 'req-01',
      name: 'Budi Santoso, M.T.',
      role: 'Staff DevOps & Security Engineer • Departemen Sistem Inti',
      type: 'cuti',
      title: `Pengajuan Cuti Tahunan (3 Hari: ${day + 2} - ${day + 4} ${monthShort} ${year})`,
      highlightType: 'Cuti Tahunan',
      detail: `3 Hari: ${day + 2} - ${day + 4} ${monthShort} ${year}`,
      quotaMeta: 'Sisa Kuota: 9 Hari',
      timestamp: 'Diajukan: 2 jam lalu',
      avatarColor: 'from-blue-600 to-indigo-600',
      initials: 'BS',
      verifiedBadge: 'check',
      status: 'PENDING',
    },
    {
      id: 'req-02',
      name: 'Siti Rahma, S.Psi',
      role: 'HR Talent & People Partner • Human Resource',
      type: 'cuti',
      title: `Pengajuan Cuti Sakit — 1 Hari (${day} ${monthShort} ${year})`,
      highlightType: 'Cuti Sakit',
      detail: `1 Hari (${day} ${monthShort} ${year})`,
      hasAttachment: true,
      attachmentName: 'Surat_Dokter_Klinik.pdf (Terlampir)',
      timestamp: 'Diajukan: 08:30 WIB',
      avatarColor: 'from-amber-500 to-rose-500',
      initials: 'SR',
      verifiedBadge: 'alert',
      status: 'PENDING',
    },
    {
      id: 'req-03',
      name: 'Maya Anggraini, S.Ds',
      role: 'UI/UX Product Designer • Technology & Product',
      type: 'lembur',
      title: `Klaim Lembur Rilis Aplikasi (4 Jam • Deployment Server Core)`,
      highlightType: 'Lembur Akhir Pekan',
      detail: `4 Jam • Deployment Server Core (${Math.max(1, day - 1)} ${monthShort} ${year})`,
      estimatedCost: 'Total Taksiran: Rp 360.000',
      verifiedBy: 'Disetujui Tech Lead: Ya',
      timestamp: 'Diajukan: Kemarin',
      avatarColor: 'from-emerald-500 to-teal-700',
      initials: 'MA',
      verifiedBadge: 'bolt',
      status: 'PENDING',
    },
  ];
}

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
}

function getStoredApprovals(): ApprovalItem[] {
  try {
    ensureStorage();
    if (fs.existsSync(APPROVALS_FILE)) {
      const data = JSON.parse(fs.readFileSync(APPROVALS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        // If data contains outdated 2025 strings, refresh with current dates
        const hasOutdated = data.some((item) => item.detail?.includes('2025') || item.title?.includes('2025'));
        if (!hasOutdated) {
          return data;
        }
      }
    }
  } catch {
    // fallback
  }

  const fresh = generateDefaultApprovals();
  saveStoredApprovals(fresh);
  return fresh;
}

function saveStoredApprovals(data: ApprovalItem[]): void {
  try {
    ensureStorage();
    fs.writeFileSync(APPROVALS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export async function GET() {
  const approvals = getStoredApprovals();
  const pending = approvals.filter((a) => a.status === 'PENDING');
  return NextResponse.json({ success: true, data: pending }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const approvals = getStoredApprovals();

    const name = body.name || 'Gilbert (Karyawan)';
    const initials = name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newItem: ApprovalItem = {
      id: `req-${Date.now()}`,
      name,
      role: body.role || 'Software Engineer • Technology',
      type: body.type || 'cuti',
      title: body.title || 'Pengajuan Cuti Karyawan',
      highlightType: body.highlightType || (body.type === 'lembur' ? 'Lembur Operasional' : 'Cuti Tahunan'),
      detail: body.detail || 'Pengajuan permohonan mandiri via ESS',
      quotaMeta: body.quotaMeta || (body.type === 'cuti' ? 'Sisa Kuota: 9 Hari' : undefined),
      estimatedCost: body.estimatedCost,
      timestamp: 'Baru saja',
      avatarColor: body.type === 'lembur' ? 'from-emerald-500 to-teal-700' : 'from-blue-600 to-indigo-600',
      initials,
      verifiedBadge: body.type === 'lembur' ? 'bolt' : 'check',
      status: 'PENDING',
    };

    const updated = [newItem, ...approvals];
    saveStoredApprovals(updated);

    // Automatically generate real-time notification for Admin
    try {
      const NOTIFICATIONS_FILE = path.join(STORAGE_DIR, 'nexora_notifications.json');
      let notifs: any[] = [];
      if (fs.existsSync(NOTIFICATIONS_FILE)) {
        try {
          notifs = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8'));
        } catch {}
      }
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: `Pengajuan ${newItem.highlightType} Baru`,
        message: `${newItem.name} (${newItem.role.split('•')[0]?.trim() || 'Karyawan'}) mengajukan ${newItem.title}.`,
        category: 'leave',
        type: 'warning',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/admin/leave',
        actionLabel: 'Tinjau Pengajuan',
        actor: {
          name: newItem.name,
          initials: newItem.initials,
          avatarColor: newItem.avatarColor,
        },
        metadata: {
          requestId: newItem.id,
          type: newItem.type,
        },
      };
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([newNotif, ...notifs].slice(0, 50), null, 2), 'utf-8');
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: newItem,
        message: 'Pengajuan berhasil dikirimkan dan menunggu persetujuan HR Admin secara real-time.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SUBMIT_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: { message: 'ID dan status dibutuhkan' } },
        { status: 400 }
      );
    }

    const approvals = getStoredApprovals();
    const index = approvals.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: { message: 'Data pengajuan tidak ditemukan' } },
        { status: 404 }
      );
    }

    approvals[index].status = status;
    saveStoredApprovals(approvals);

    return NextResponse.json(
      {
        success: true,
        data: approvals[index],
        message: `Pengajuan berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'} dan disinkronkan ke karyawan.`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'PATCH_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
