import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { broadcastApprovalEvent } from '@/lib/approvalsSSE';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry } from '@/lib/auditDb';

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
    id: 'req-cuti-01',
    name: 'Rina Utami',
    nik: 'NX-201884',
    role: 'Marketing Growth Specialist',
    department: 'Marketing Growth',
    type: 'cuti',
    leaveType: 'Izin Sakit (SKD)',
    typeCategory: 'sakit',
    title: 'Izin Sakit: Istirahat Medis Terverifikasi',
    highlightType: 'Izin Sakit (SKD)',
    detail: '3 Hari (21 Okt s/d 24 Okt)',
    startDate: '2026-10-21',
    endDate: '2026-10-24',
    durationDays: 3,
    remainingQuota: 12,
    totalQuota: 12,
    reason: 'Pemeriksaan rawat jalan dan istirahat pemulihan sesuai anjuran dokter RS Siloam.',
    quotaMeta: 'Izin Sakit Berbayar',
    timestamp: 'Kemarin, 09:15 WIB',
    hasAttachment: true,
    documentName: 'Surat_Keterangan_Dokter_Siloam.pdf',
    documentUrl: '#',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    avatarColor: 'from-amber-500 to-rose-500',
    initials: 'RU',
    verifiedBadge: 'alert',
    status: 'APPROVED',
    submittedDate: '21 Okt 2026',
  },
  {
    id: 'req-cuti-02',
    name: 'Fajar Nugraha',
    nik: 'NX-202019',
    role: 'Senior Backend Engineer',
    department: 'Backend Eng.',
    type: 'cuti',
    leaveType: 'Cuti Tahunan',
    typeCategory: 'tahunan',
    title: 'Cuti Tahunan: Family Time & Istirahat',
    highlightType: 'Cuti Tahunan',
    detail: '4 Hari (20 Okt s/d 24 Okt)',
    startDate: '2026-10-20',
    endDate: '2026-10-24',
    durationDays: 4,
    remainingQuota: 7,
    totalQuota: 12,
    reason: 'Keperluan liburan keluarga dan urusan pribadi tahunan.',
    quotaMeta: 'Sisa Kuota: 7 Hari',
    timestamp: '2 Hari lalu',
    hasAttachment: false,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    avatarColor: 'from-blue-600 to-indigo-600',
    initials: 'FN',
    verifiedBadge: 'check',
    status: 'APPROVED',
    submittedDate: '20 Okt 2026',
  },
  {
    id: 'req-cuti-03',
    name: 'Kevin Pratama',
    nik: 'NX-202203',
    role: 'Logistics Operations Lead',
    department: 'Logistik Hub',
    type: 'cuti',
    leaveType: 'Cuti Khusus',
    typeCategory: 'khusus',
    title: 'Dispensasi Khusus: Pernikahan Saudara Kandung',
    highlightType: 'Dispensasi Khusus',
    detail: '2 Hari (22 Okt s/d 23 Okt)',
    startDate: '2026-10-22',
    endDate: '2026-10-23',
    durationDays: 2,
    remainingQuota: 11,
    totalQuota: 12,
    reason: 'Pernikahan saudara kandung sesuai ketentuan PKB Pasal 24.',
    quotaMeta: 'Hak Cuti Khusus',
    timestamp: 'Hari ini, 07:45 WIB',
    hasAttachment: true,
    documentName: 'Undangan_Keluarga.pdf',
    documentUrl: '#',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    avatarColor: 'from-purple-600 to-indigo-600',
    initials: 'KP',
    verifiedBadge: 'check',
    status: 'APPROVED',
    submittedDate: 'Hari ini',
  },
  {
    id: 'req-cuti-04',
    name: 'Dewi Anggraeni, S.Ak',
    nik: 'NX-201755',
    role: 'Senior Tax & Financial Analyst',
    department: 'Finance & Tax',
    type: 'cuti',
    leaveType: 'Cuti Tahunan',
    typeCategory: 'tahunan',
    title: 'Permohonan Cuti Tahunan: Istirahat',
    highlightType: 'Cuti Tahunan',
    detail: '3 Hari (22 Okt s/d 25 Okt)',
    startDate: '2026-10-22',
    endDate: '2026-10-25',
    durationDays: 3,
    remainingQuota: 6,
    totalQuota: 12,
    reason: 'Rehat tahunan pasca penutupan audit pajak triwulan.',
    quotaMeta: 'Sisa Kuota: 6 Hari',
    timestamp: 'Kemarin, 14:20 WIB',
    hasAttachment: false,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    avatarColor: 'from-teal-600 to-emerald-600',
    initials: 'DA',
    verifiedBadge: 'check',
    status: 'APPROVED',
    submittedDate: '21 Okt 2026',
  },
  {
    id: 'req-cuti-05',
    name: 'Rian Pratama, S.Kom',
    nik: 'NX-2021008',
    role: 'Lead Backend Architect',
    department: 'Technology & IT',
    type: 'cuti',
    leaveType: 'Cuti Tahunan',
    typeCategory: 'tahunan',
    title: 'Permohonan Cuti Tahunan: Urusan Keluarga',
    highlightType: 'Cuti Tahunan',
    detail: '3 Hari (23 Okt s/d 26 Okt)',
    startDate: '2026-10-23',
    endDate: '2026-10-26',
    durationDays: 3,
    remainingQuota: 9,
    totalQuota: 12,
    reason: 'Menghadiri acara pernikahan keluarga di luar kota dan silaturahmi.',
    quotaMeta: 'Sisa Kuota: 9 Hari',
    timestamp: 'Hari ini, 08:30 WIB',
    hasAttachment: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    avatarColor: 'from-blue-600 to-indigo-600',
    initials: 'RP',
    verifiedBadge: 'check',
    status: 'PENDING_HRD',
    submittedDate: 'Hari ini, 08:30 WIB',
  },
  {
    id: 'req-cuti-06',
    name: 'Siti Nurhaliza, M.M.',
    nik: 'NX-201992',
    role: 'People & Talent Dev Specialist',
    department: 'People Operations',
    type: 'cuti',
    leaveType: 'Izin Sakit (SKD)',
    typeCategory: 'sakit',
    title: 'Izin Sakit: Rawat Inap & Pemulihan Medis',
    highlightType: 'Izin Sakit (SKD)',
    detail: '2 Hari (23 Okt s/d 24 Okt)',
    startDate: '2026-10-23',
    endDate: '2026-10-24',
    durationDays: 2,
    remainingQuota: 12,
    totalQuota: 12,
    reason: 'Demam dan flu berat, disarankan dokter istirahat total.',
    quotaMeta: 'Izin Sakit Berbayar',
    hasAttachment: true,
    documentName: 'Surat_Keterangan_Dokter_RS_Siloam.pdf',
    documentUrl: '#',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    timestamp: 'Hari ini, 07:15 WIB',
    avatarColor: 'from-purple-600 to-pink-600',
    initials: 'SN',
    verifiedBadge: 'alert',
    status: 'PENDING_HRD',
    submittedDate: 'Hari ini, 07:15 WIB',
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

    // 3. Dispatch real-time audit log
    try {
      const auditLog: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        module: 'LEAVE',
        action: 'LEAVE_REQUESTED',
        recordId: newItem.id,
        userName: newItem.name,
        userEmail: `${newItem.nik || 'user'}@nexora.co.id`,
        userNik: newItem.nik,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Portal Karyawan (Web)',
        timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
        oldData: null,
        newData: {
          leaveType: newItem.leaveType,
          durationDays: newItem.durationDays,
          startDate: newItem.startDate,
          endDate: newItem.endDate,
          reason: newItem.reason,
        },
      };
      saveStoredAuditLogs([auditLog, ...getStoredAuditLogs().slice(0, 99)]);
      broadcastAuditEvent('AUDIT_LOG_CREATED', auditLog);
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

    // Dispatch audit log for leave decision
    try {
      const auditLog: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        module: 'LEAVE',
        action: status === 'APPROVED' ? 'LEAVE_APPROVAL_DECIDED' : 'LEAVE_REJECTED',
        recordId: id,
        userName: 'HR Administrator',
        userEmail: 'admin@nexora.local',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Konsol HR Admin (Web)',
        timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
        oldData: { status: 'PENDING' },
        newData: {
          status,
          employee: approvals[index].name,
          leaveType: approvals[index].leaveType,
          durationDays: approvals[index].durationDays,
        },
      };
      saveStoredAuditLogs([auditLog, ...getStoredAuditLogs().slice(0, 99)]);
      broadcastAuditEvent('AUDIT_LOG_CREATED', auditLog);
    } catch {}

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
