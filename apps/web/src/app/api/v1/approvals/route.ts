import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { broadcastApprovalEvent } from '@/lib/approvalsSSE';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const APPROVALS_FILE = path.join(STORAGE_DIR, 'nexora_approvals.json');

export interface ApprovalItem {
  id: string;
  name: string;
  nik?: string;
  role: string;
  department?: string;
  avatarUrl?: string;
  type: 'cuti' | 'lembur';
  leaveType?: string;
  typeCategory?: 'tahunan' | 'sakit' | 'khusus';
  title: string;
  highlightType: string;
  detail: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  remainingQuota?: number;
  totalQuota?: number;
  reason?: string;
  quotaMeta?: string;
  timestamp: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  documentName?: string;
  documentUrl?: string;
  verifiedBy?: string;
  estimatedCost?: string;
  avatarColor: string;
  initials: string;
  verifiedBadge: 'check' | 'alert' | 'bolt';
  status: 'PENDING' | 'PENDING_SPV' | 'PENDING_HRD' | 'APPROVED' | 'REJECTED';
  submittedDate?: string;
}

const defaultApprovals: ApprovalItem[] = [
  {
    id: 'req-01',
    name: 'Budi Santoso, M.T.',
    nik: 'NX-201944',
    role: 'Staff DevOps & Security Engineer • Departemen Sistem Inti',
    department: 'Departemen Sistem Inti',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    type: 'cuti',
    leaveType: 'Cuti Tahunan',
    typeCategory: 'tahunan',
    title: 'Pengajuan Cuti Tahunan (3 Hari: 21 - 23 Okt 2026)',
    highlightType: 'Cuti Tahunan',
    detail: '3 Hari: 21 - 23 Okt 2026',
    startDate: '21 Okt 2026',
    endDate: '23 Okt 2026',
    durationDays: 3,
    remainingQuota: 9,
    totalQuota: 12,
    reason: 'Acara keluarga di kampung halaman & refreshing tahunan',
    quotaMeta: 'Sisa Kuota: 9 Hari',
    timestamp: 'Diajukan: 2 jam lalu',
    avatarColor: 'from-blue-600 to-indigo-600',
    initials: 'BS',
    verifiedBadge: 'check',
    status: 'PENDING',
    submittedDate: 'Hari ini, 08:30 WIB',
  },
  {
    id: 'req-02',
    name: 'Siti Rahma, S.Psi',
    nik: 'NX-202105',
    role: 'HR Talent & People Partner • Human Resource',
    department: 'Human Resource',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    type: 'cuti',
    leaveType: 'Cuti Sakit',
    typeCategory: 'sakit',
    title: 'Pengajuan Cuti Sakit (1 Hari (19 Okt 2026))',
    highlightType: 'Cuti Sakit',
    detail: '1 Hari (19 Okt 2026)',
    startDate: '19 Okt 2026',
    endDate: '19 Okt 2026',
    durationDays: 1,
    remainingQuota: 12,
    totalQuota: 12,
    reason: 'Demam tinggi dan istirahat dokter klinik medika',
    hasAttachment: true,
    attachmentName: 'Surat_Dokter_Klinik.pdf (Terlampir)',
    documentName: 'Surat_Dokter_Klinik.pdf',
    documentUrl: '#',
    timestamp: 'Diajukan: 08:30 WIB',
    avatarColor: 'from-amber-500 to-rose-500',
    initials: 'SR',
    verifiedBadge: 'alert',
    status: 'PENDING',
    submittedDate: 'Hari ini, 08:30 WIB',
  },
  {
    id: 'req-03',
    name: 'Maya Anggraini, S.Ds',
    nik: 'NX-202219',
    role: 'UI/UX Product Designer • Technology & Product',
    department: 'Technology & Product',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    type: 'lembur',
    highlightType: 'Lembur Akhir Pekan',
    title: 'Pengajuan Lembur Akhir Pekan (4 Jam • Deployment Server Core (18 Okt 2026))',
    detail: '4 Jam • Deployment Server Core (18 Okt 2026)',
    durationDays: 1,
    estimatedCost: 'Total Taksiran: Rp 360.000',
    verifiedBy: 'Disetujui Tech Lead: Ya',
    timestamp: 'Diajukan: Kemarin',
    avatarColor: 'from-emerald-500 to-teal-700',
    initials: 'MA',
    verifiedBadge: 'bolt',
    status: 'PENDING',
    submittedDate: 'Kemarin, 17:00 WIB',
  },
  {
    id: 'req-04',
    name: 'Dewi Lestari, S.Psi',
    nik: 'NX-201804',
    role: 'HR Operations Manager • Human Resource',
    department: 'Human Resource',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    type: 'cuti',
    leaveType: 'Cuti Tahunan',
    typeCategory: 'tahunan',
    title: 'Pengajuan Cuti Tahunan (3 Hari)',
    highlightType: 'Cuti Tahunan',
    detail: '3 Hari: 14 - 16 Apr 2025',
    startDate: '14 Apr 2025',
    endDate: '16 Apr 2025',
    durationDays: 3,
    remainingQuota: 8,
    totalQuota: 12,
    reason: 'Istirahat cuti tahunan pertengahan tahun',
    quotaMeta: 'Sisa Kuota: 8 Hari',
    timestamp: 'Diajukan: 3 hari lalu',
    avatarColor: 'from-purple-600 to-pink-600',
    initials: 'DL',
    verifiedBadge: 'check',
    status: 'APPROVED',
    submittedDate: '10 Apr 2025, 14:20 WIB',
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

function getStoredApprovals(): ApprovalItem[] {
  try {
    ensureStorage();
    if (fs.existsSync(APPROVALS_FILE)) {
      const data = JSON.parse(fs.readFileSync(APPROVALS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // fallback
  }
  // Initialize file with default data if empty
  saveStoredApprovals(defaultApprovals);
  return defaultApprovals;
}

function saveStoredApprovals(data: ApprovalItem[]): void {
  try {
    ensureStorage();
    fs.writeFileSync(APPROVALS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get('all') === 'true';
  const approvals = getStoredApprovals();

  if (includeAll) {
    return NextResponse.json({ success: true, data: approvals }, { status: 200 });
  }

  const pending = approvals.filter(
    (a) => a.status === 'PENDING' || a.status === 'PENDING_HRD' || a.status === 'PENDING_SPV'
  );
  return NextResponse.json({ success: true, data: pending }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const approvals = getStoredApprovals();

    const name = body.name || 'Rian Pratama, S.Kom';
    const initials = name
      .replace(/[^a-zA-Z\s]/g, '')
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'RP';

    const newItem: ApprovalItem = {
      id: body.id || `req-${Date.now()}`,
      name,
      nik: body.nik || 'NX-2021008',
      role: body.role || 'Lead Backend Architect • Technology',
      department: body.department || 'Technology & Engineering',
      avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      type: body.type || 'cuti',
      leaveType: body.leaveType || body.highlightType || 'Cuti Tahunan',
      typeCategory: body.typeCategory || (body.leaveType?.toLowerCase().includes('sakit') ? 'sakit' : 'tahunan'),
      title: body.title || `Pengajuan ${body.leaveType || 'Cuti Tahunan'}`,
      highlightType: body.highlightType || body.leaveType || 'Cuti Tahunan',
      detail: body.detail || 'Pengajuan permohonan mandiri via ESS',
      startDate: body.startDate || new Date().toISOString().slice(0, 10),
      endDate: body.endDate || new Date().toISOString().slice(0, 10),
      durationDays: body.durationDays || 1,
      remainingQuota: typeof body.remainingQuota === 'number' ? body.remainingQuota : 8,
      totalQuota: body.totalQuota || 12,
      reason: body.reason || 'Keperluan Pribadi & Urusan Keluarga',
      quotaMeta: body.quotaMeta || `Sisa Kuota: ${body.remainingQuota ?? 8} Hari`,
      hasAttachment: Boolean(body.hasAttachment || body.documentName),
      attachmentName: body.attachmentName || body.documentName,
      documentName: body.documentName || body.attachmentName,
      documentUrl: body.documentUrl || '#',
      estimatedCost: body.estimatedCost,
      verifiedBy: body.verifiedBy,
      timestamp: 'Baru saja',
      avatarColor: body.type === 'lembur' ? 'from-emerald-500 to-teal-700' : 'from-blue-600 to-indigo-600',
      initials,
      verifiedBadge: body.type === 'lembur' ? 'bolt' : body.hasAttachment ? 'alert' : 'check',
      status: 'PENDING',
      submittedDate: 'Hari ini, Baru saja',
    };

    const updated = [newItem, ...approvals];
    saveStoredApprovals(updated);

    // 1. Broadcast real-time SSE event to all connected devices / browsers
    broadcastApprovalEvent('LEAVE_SUBMITTED', newItem);

    // 2. Automatically generate real-time notification for Admin
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

    // Broadcast SSE update event to all connected devices
    broadcastApprovalEvent('LEAVE_ACTIONED', {
      id,
      status,
      item: approvals[index],
    });

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
