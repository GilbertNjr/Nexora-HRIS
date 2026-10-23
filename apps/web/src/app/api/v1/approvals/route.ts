import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { broadcastApprovalEvent } from '@/lib/approvalsSSE';
import { broadcastAuditEvent } from '@/lib/auditSSE';
import { getStoredAuditLogs, saveStoredAuditLogs, AuditLogEntry, recordAuditLog } from '@/lib/auditDb';
import {
  getLeaveRequestsFromDb,
  saveLeaveRequestToDb,
  updateLeaveRequestStatusInDb,
} from '@/lib/leaveDb';

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

const defaultApprovals: ApprovalItem[] = [];

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
      if (Array.isArray(data)) return data;
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

  // Load real persistent leave requests from Neon PostgreSQL
  let dbLeaves: ApprovalItem[] = [];
  try {
    dbLeaves = await getLeaveRequestsFromDb();
  } catch (err) {
    console.warn('[approvals/GET] Could not load from DB:', err);
  }

  let merged = approvals;
  if (Array.isArray(dbLeaves) && dbLeaves.length > 0) {
    const dbIds = new Set(dbLeaves.map((d) => d.id));
    const remaining = approvals.filter((a) => !dbIds.has(a.id));
    merged = [...dbLeaves, ...remaining];
  }

  if (includeAll) {
    return NextResponse.json({ success: true, data: merged }, { status: 200 });
  }

  const pending = merged.filter(
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
    const generatedId =
      body.id && body.id.includes('-') && body.id.length === 36
        ? body.id
        : crypto.randomUUID();

    const newItem: ApprovalItem = {
      id: generatedId,
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

    // Persist permanently to Neon PostgreSQL
    try {
      await saveLeaveRequestToDb(newItem);
    } catch (dbErr) {
      console.error('[approvals/POST] Error persisting to Neon DB:', dbErr);
    }

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

    // 3. Dispatch real-time audit log to Neon PostgreSQL database & broadcast
    try {
      await recordAuditLog({
        module: 'LEAVE',
        action: 'LEAVE_REQUESTED',
        recordId: newItem.id,
        userName: newItem.name,
        userEmail: `${newItem.nik || 'user'}@nexora.co.id`,
        userNik: newItem.nik,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Portal Karyawan (Web)',
        oldData: null,
        newData: {
          leaveType: newItem.leaveType,
          durationDays: newItem.durationDays,
          startDate: newItem.startDate,
          endDate: newItem.endDate,
          reason: newItem.reason,
        },
      });
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

    // Update in Neon PostgreSQL
    let dbUpdated = false;
    try {
      dbUpdated = await updateLeaveRequestStatusInDb(
        id,
        status === 'APPROVED' ? 'APPROVED' : 'REJECTED'
      );
    } catch (dbErr) {
      console.error('[approvals/PATCH] Error updating Neon DB status:', dbErr);
    }

    const approvals = getStoredApprovals();
    const index = approvals.findIndex((a) => a.id === id);
    let targetItem: ApprovalItem | null = null;
    if (index !== -1) {
      approvals[index].status = status;
      saveStoredApprovals(approvals);
      targetItem = approvals[index];
    } else {
      try {
        const dbLeaves = await getLeaveRequestsFromDb();
        const found = dbLeaves.find((d) => d.id === id);
        if (found) {
          targetItem = { ...found, status };
          saveStoredApprovals([targetItem, ...approvals]);
        }
      } catch {}
    }

    if (!targetItem && !dbUpdated) {
      return NextResponse.json(
        { success: false, error: { message: 'Data pengajuan tidak ditemukan' } },
        { status: 404 }
      );
    }

    // Broadcast SSE update event to all connected devices
    broadcastApprovalEvent('LEAVE_ACTIONED', {
      id,
      status,
      item: targetItem || { id, status },
    });

    // Dispatch audit log for leave decision to database
    try {
      await recordAuditLog({
        module: 'LEAVE',
        action: status === 'APPROVED' ? 'LEAVE_APPROVAL_DECIDED' : 'LEAVE_REJECTED',
        recordId: id,
        userName: 'HR Administrator',
        userEmail: 'admin@nexora.local',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Konsol HR Admin (Web)',
        oldData: { status: 'PENDING' },
        newData: {
          status,
          employee: approvals[index].name,
          leaveType: approvals[index].leaveType,
          durationDays: approvals[index].durationDays,
        },
      });
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'ID permohonan dibutuhkan untuk pembatalan' } },
        { status: 400 }
      );
    }

    const approvals = getStoredApprovals();
    const index = approvals.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: { message: 'Data pengajuan cuti tidak ditemukan' } },
        { status: 404 }
      );
    }

    const [deletedItem] = approvals.splice(index, 1);
    saveStoredApprovals(approvals);

    // Broadcast SSE update event to all connected devices
    broadcastApprovalEvent('LEAVE_ACTIONED', {
      id,
      status: 'CANCELLED',
      item: deletedItem,
    });

    // Record audit log for cancellation to database
    try {
      await recordAuditLog({
        module: 'LEAVE',
        action: 'LEAVE_CANCELLED',
        recordId: id,
        userName: deletedItem.name,
        userEmail: `${deletedItem.nik || 'user'}@nexora.co.id`,
        userNik: deletedItem.nik,
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Portal Karyawan ESS (Web)',
        oldData: { status: deletedItem.status, type: deletedItem.leaveType },
        newData: { status: 'CANCELLED' },
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: 'Pengajuan cuti berhasil dibatalkan dan kuota telah dikembalikan.',
        data: deletedItem,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
