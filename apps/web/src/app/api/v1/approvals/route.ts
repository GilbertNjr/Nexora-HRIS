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
import {
  getDocumentRequestsFromDb,
  updateDocumentRequestStepInDb,
} from '@/lib/documentDb';
import {
  getAttendanceCorrectionsFromDb,
  saveAttendanceCorrectionToDb,
  updateAttendanceCorrectionStatusInDb,
  AttendanceCorrectionItem,
} from '@/lib/attendanceCorrectionDb';

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
  type: 'cuti' | 'lembur' | 'dokumen' | 'presensi';
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
  ticketNo?: string;
  currentStep?: number;
  totalSteps?: number;
  targetOrg?: string;
  targetPurpose?: string;
  urgency?: string;
  correctionDate?: string;
  correctionTargetTime?: string;
  correctionType?: string;
  correctionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
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
  const filterNik = searchParams.get('nik');
  const approvals = getStoredApprovals();

  // 1. Load real persistent leave requests from Neon PostgreSQL
  let dbLeaves: ApprovalItem[] = [];
  try {
    dbLeaves = await getLeaveRequestsFromDb();
  } catch (err) {
    console.warn('[approvals/GET] Could not load leaves from DB:', err);
  }

  // 2. Load real persistent document requests from Neon PostgreSQL / documentDb
  let dbDocs: ApprovalItem[] = [];
  try {
    const docReqs = await getDocumentRequestsFromDb();
    dbDocs = docReqs.map((d) => {
      const name = d.employeeName || 'Rian Pratama, S.Kom';
      const initials = name
        .replace(/[^a-zA-Z\s]/g, '')
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'RP';

      const isCompleted = d.currentStep >= d.totalSteps && d.status === 'APPROVED';
      const isRejected = d.status === 'REJECTED';

      return {
        id: d.id,
        name,
        nik: d.nik,
        role: d.employeeRole || 'Lead Backend Architect',
        department: d.department || 'Teknologi Informasi',
        avatarUrl: d.avatarUrl,
        type: 'dokumen' as const,
        title: d.title,
        highlightType: d.urgency?.includes('Penting') ? 'Sangat Penting' : 'Dokumen Resmi',
        detail: `Keperluan: ${d.targetPurpose} • Tiket: ${d.ticketNo} (${d.statusLabel} - Tahap ${d.currentStep}/${d.totalSteps})`,
        timestamp: d.submittedAt,
        avatarColor: 'from-blue-600 to-indigo-600',
        initials,
        verifiedBadge: 'check' as const,
        status: isCompleted ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING',
        submittedDate: d.submittedAt,
        ticketNo: d.ticketNo,
        currentStep: d.currentStep,
        totalSteps: d.totalSteps,
        targetOrg: d.targetOrg,
        targetPurpose: d.targetPurpose,
        urgency: d.urgency,
        documentName: d.title,
      };
    });
  } catch (err) {
    console.warn('[approvals/GET] Could not load document requests:', err);
  }

  // 3. Load attendance corrections from Neon PostgreSQL / attendanceCorrectionDb
  let dbCorrections: ApprovalItem[] = [];
  try {
    const corrections = await getAttendanceCorrectionsFromDb();
    dbCorrections = corrections.map((c) => {
      const initials = c.employeeName
        .replace(/[^a-zA-Z\s]/g, '')
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'RP';

      return {
        id: c.id,
        name: c.employeeName,
        nik: c.nik,
        role: c.employeeRole,
        department: c.department,
        avatarUrl: c.avatarUrl,
        type: 'presensi' as const,
        title: `Koreksi Presensi: ${c.correctionType}`,
        highlightType: 'Koreksi Kehadiran',
        detail: `Tanggal: ${c.date} • Target: ${c.targetTime} WIB • Alasan: "${c.reason}"`,
        timestamp: c.submittedAt,
        avatarColor: 'from-amber-500 to-orange-600',
        initials,
        verifiedBadge: 'alert' as const,
        status: c.status,
        submittedDate: c.submittedAt,
        correctionDate: c.date,
        correctionTargetTime: c.targetTime,
        correctionType: c.correctionType,
        correctionReason: c.reason,
        reviewedBy: c.reviewedBy,
        reviewedAt: c.reviewedAt,
        adminNotes: c.adminNotes,
      };
    });
  } catch (err) {
    console.warn('[approvals/GET] Could not load attendance corrections:', err);
  }

  let merged = approvals;
  if (Array.isArray(dbLeaves) && dbLeaves.length > 0) {
    const dbIds = new Set(dbLeaves.map((d) => d.id));
    const remaining = approvals.filter((a) => !dbIds.has(a.id));
    merged = [...dbLeaves, ...remaining];
  }

  // Merge document requests
  if (Array.isArray(dbDocs) && dbDocs.length > 0) {
    const existingIds = new Set(merged.map((m) => m.id));
    const remainingDocs = dbDocs.filter((d) => !existingIds.has(d.id));
    merged = [...remainingDocs, ...merged];
  }

  // Merge attendance correction requests
  if (Array.isArray(dbCorrections) && dbCorrections.length > 0) {
    const existingIds = new Set(merged.map((m) => m.id));
    const remainingCorrections = dbCorrections.filter((c) => !existingIds.has(c.id));
    merged = [...remainingCorrections, ...merged];
  }

  if (filterNik) {
    const targetNik = filterNik.toLowerCase();
    merged = merged.filter((item) => item.nik && item.nik.toLowerCase() === targetNik);
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

    // 1. If it's an attendance correction request
    if (body.type === 'presensi' || (body.title && body.title.toLowerCase().includes('koreksi'))) {
      const corId = body.id || `cor-${Date.now()}`;
      const nowStr =
        new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date()) +
        ' • ' +
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
        ' WIB';

      const newCorrection: AttendanceCorrectionItem = {
        id: corId,
        nik: body.nik || 'NX-2021008',
        employeeName: body.name || 'Rian Pratama, S.Kom',
        employeeRole: body.role || 'Lead Backend Architect',
        department: body.department || 'Teknologi Informasi',
        avatarUrl: body.avatarUrl,
        date: body.correctionDate || body.date || new Date().toISOString().slice(0, 10),
        targetTime: body.correctionTargetTime || body.targetTime || '16:30',
        correctionType:
          body.correctionType ||
          body.title?.replace('Koreksi Presensi: ', '') ||
          'Lupa Tap-Out Saat Pulang Kantor',
        reason: body.correctionReason || body.reason || body.detail || 'Koreksi data presensi mandiri',
        status: 'PENDING',
        submittedAt: body.timestamp || nowStr,
      };

      await saveAttendanceCorrectionToDb(newCorrection);

      // Broadcast SSE event
      broadcastApprovalEvent('ATTENDANCE_CORRECTION_SUBMITTED', {
        id: corId,
        request: newCorrection,
      });

      // Record audit log
      try {
        await recordAuditLog({
          module: 'ATTENDANCE',
          action: 'ATTENDANCE_CORRECTION_SUBMITTED',
          recordId: corId,
          userName: newCorrection.employeeName,
          userEmail: 'rian.pratama@nexora.co.id',
          userNik: newCorrection.nik,
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Portal Presensi Karyawan ESS',
          oldData: null,
          newData: {
            date: newCorrection.date,
            targetTime: newCorrection.targetTime,
            correctionType: newCorrection.correctionType,
            reason: newCorrection.reason,
          },
        });
      } catch {}

      return NextResponse.json({ success: true, data: newCorrection }, { status: 201 });
    }

    // 2. Regular approvals
    const approvals = getStoredApprovals();

    const name = body.name || 'Rian Pratama, S.Kom';
    const initials = name
      .replace(/[^a-zA-Z\s]/g, '')
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2);
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
      remainingQuota: body.remainingQuota ?? 12,
      totalQuota: body.totalQuota ?? 12,
      reason: body.reason || body.detail || 'Keperluan Pribadi',
      quotaMeta: body.quotaMeta || 'Sisa Kuota: 12 Hari',
      timestamp:
        body.timestamp ||
        'Hari ini • ' +
          new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date()) +
          ' WIB',
      hasAttachment: !!body.hasAttachment,
      attachmentName: body.attachmentName,
      documentName: body.documentName,
      documentUrl: body.documentUrl,
      verifiedBy: body.verifiedBy,
      estimatedCost: body.estimatedCost,
      avatarColor: body.avatarColor || 'from-blue-600 to-indigo-600',
      initials: initials || 'RP',
      verifiedBadge: body.verifiedBadge || 'check',
      status: 'PENDING',
      submittedDate: body.submittedDate || new Date().toISOString(),
    };

    approvals.unshift(newItem);
    saveStoredApprovals(approvals);

    // Save leave request to Neon PostgreSQL
    if (newItem.type === 'cuti') {
      try {
        await saveLeaveRequestToDb(newItem);
      } catch (dbErr) {
        console.error('[approvals/POST] Error saving leave to Neon DB:', dbErr);
      }
    }

    // Broadcast SSE to all connected clients
    broadcastApprovalEvent('APPROVAL_SUBMITTED', {
      id: newItem.id,
      request: newItem,
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'POST_ERROR', message: err.message } },
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
        { success: false, error: { message: 'ID dan status wajib disertakan' } },
        { status: 400 }
      );
    }

    // 1. If it's an attendance correction request (id starts with 'cor-')
    if (id.startsWith('cor-')) {
      const newStatus = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
      const result = await updateAttendanceCorrectionStatusInDb(
        id,
        newStatus,
        'Dewi Lestari, S.Psi (HR Admin)',
        body.adminNotes || (status === 'APPROVED' ? 'Disetujui oleh HR Operations' : 'Ditolak oleh HR Operations')
      );

      if (!result.success || !result.item) {
        return NextResponse.json(
          { success: false, error: { message: 'Data pengajuan koreksi presensi tidak ditemukan' } },
          { status: 404 }
        );
      }

      broadcastApprovalEvent('ATTENDANCE_CORRECTION_UPDATED', {
        id,
        status: result.item.status,
        item: result.item,
      });

      try {
        await recordAuditLog({
          module: 'ATTENDANCE',
          action: status === 'APPROVED' ? 'ATTENDANCE_CORRECTION_APPROVED' : 'ATTENDANCE_CORRECTION_REJECTED',
          recordId: id,
          userName: 'HR Administrator',
          userEmail: 'admin@nexora.local',
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Konsol HR Admin (Web)',
          oldData: { status: 'PENDING' },
          newData: {
            status: result.item.status,
            date: result.item.date,
            targetTime: result.item.targetTime,
            type: result.item.correctionType,
          },
        });
      } catch {}

      return NextResponse.json(
        {
          success: true,
          data: result.item,
          message: `Pengajuan koreksi presensi tanggal ${result.item.date} berhasil ${
            status === 'APPROVED' ? 'disetujui dan data absensi telah diperbarui' : 'ditolak'
          }.`,
        },
        { status: 200 }
      );
    }

    // 2. If it's a document request (id starts with 'req-')
    if (id.startsWith('req-')) {
      const action = status === 'APPROVED' ? 'APPROVE_STEP' : 'REJECT';
      const result = await updateDocumentRequestStepInDb(id, action, 'Dewi Lestari, S.Psi (HR Admin)');
      if (!result.success || !result.item) {
        return NextResponse.json(
          { success: false, error: { message: 'Data pengajuan dokumen tidak ditemukan' } },
          { status: 404 }
        );
      }

      broadcastApprovalEvent('DOCUMENT_REQUEST_UPDATED', {
        id,
        status: result.item.status,
        item: result.item,
      });

      try {
        await recordAuditLog({
          module: 'LEAVE',
          action: status === 'APPROVED' ? 'DOCUMENT_APPROVAL_DECIDED' : 'DOCUMENT_REJECTED',
          recordId: id,
          userName: 'HR Administrator',
          userEmail: 'admin@nexora.local',
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Konsol HR Admin (Web)',
          oldData: { status: 'PENDING' },
          newData: {
            status: result.item.status,
            title: result.item.title,
            ticketNo: result.item.ticketNo,
            currentStep: result.item.currentStep,
          },
        });
      } catch {}

      return NextResponse.json(
        {
          success: true,
          data: result.item,
          message: `Permohonan dokumen ${result.item.title} berhasil ${
            status === 'APPROVED' ? 'disetujui' : 'ditolak'
          } dan disinkronkan ke karyawan.`,
        },
        { status: 200 }
      );
    }

    // 3. Regular Leave / Overtime request update in Neon PostgreSQL
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
          employee: targetItem?.name || 'Karyawan',
          leaveType: targetItem?.leaveType || 'Cuti',
          durationDays: targetItem?.durationDays || 1,
        },
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        data: targetItem,
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

    // If attendance correction
    if (id.startsWith('cor-')) {
      const result = await updateAttendanceCorrectionStatusInDb(id, 'REJECTED', 'HR Administrator', 'Dibatalkan oleh admin');
      return NextResponse.json({
        success: true,
        message: 'Pengajuan koreksi presensi berhasil dibatalkan.',
        data: result.item,
      });
    }

    // If document request
    if (id.startsWith('req-')) {
      const result = await updateDocumentRequestStepInDb(id, 'REJECT', 'HR Administrator', 'Dibatalkan oleh admin');
      return NextResponse.json({
        success: true,
        message: 'Permohonan dokumen berhasil dibatalkan.',
        data: result.item,
      });
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

    broadcastApprovalEvent('LEAVE_ACTIONED', {
      id,
      status: 'CANCELLED',
      item: deletedItem,
    });

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
