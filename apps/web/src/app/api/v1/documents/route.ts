import { NextRequest, NextResponse } from 'next/server';
import {
  getDocumentRequestsFromDb,
  saveDocumentRequestToDb,
  updateDocumentRequestStepInDb,
  getOfficialDocumentsFromDb,
  RequestTrackingItem,
  DocumentItem,
  DocumentOfficialContent,
  RequestTrackingStep,
  EMeteraiQuota,
} from '@/lib/documentDb';
import { broadcastApprovalEvent } from '@/lib/approvalsSSE';
import { recordAuditLog } from '@/lib/auditDb';

export type {
  DocumentOfficialContent,
  DocumentItem,
  RequestTrackingStep,
  RequestTrackingItem,
  EMeteraiQuota,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get('nik') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search')?.toLowerCase() || undefined;

    const [docs, reqs] = await Promise.all([
      getOfficialDocumentsFromDb(nik, category, search),
      getDocumentRequestsFromDb(nik),
    ]);

    const counts = {
      activeDocs: docs.length,
      pendingRequests: reqs.filter((r) => r.currentStep < r.totalSteps && r.status !== 'REJECTED').length,
      legal: docs.filter((d) => d.category === 'legal').length,
      letter: docs.filter((d) => d.category === 'letter').length,
      tax: docs.filter((d) => d.category === 'tax').length,
      template: docs.filter((d) => d.category === 'template').length,
      totalRequests: reqs.length,
    };

    const eMeteraiQuota: EMeteraiQuota = {
      used: 3,
      total: 5,
      year: new Date().getFullYear(),
    };

    return NextResponse.json({
      success: true,
      documents: docs,
      requests: reqs,
      eMeteraiQuota,
      counts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nik = 'NX-2021008',
      employeeName = 'Rian Pratama, S.Kom',
      employeeRole = 'Lead Backend Architect',
      department = 'Teknologi Informasi',
      title,
      targetPurpose,
      targetOrg,
      urgency,
    } = body;

    const currentYear = new Date().getFullYear();
    const existingReqs = await getDocumentRequestsFromDb();
    const ticketSeq = String(existingReqs.length + 83).padStart(3, '0');
    const ticketNo = `REQ-DOC-${currentYear}-${ticketSeq}`;

    const now = new Date();
    const submittedAtFormatted =
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now) +
      ' • ' +
      now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB';

    const newRequest: RequestTrackingItem = {
      id: `req-${Date.now()}`,
      nik,
      employeeName,
      employeeRole,
      department,
      ticketNo,
      title: title || 'Surat Keterangan Penghasilan (Salary Slip)',
      targetPurpose: targetPurpose || 'Keperluan pengajuan administrasi',
      targetOrg: targetOrg || 'Instansi Terkait',
      submittedAt: submittedAtFormatted,
      statusLabel: 'Verifikasi Awal HR Operations',
      currentStep: 1,
      totalSteps: 3,
      estimatedCompletion:
        urgency === 'Penting (Hari yang Sama)'
          ? 'Est. Hari Ini, 17:00 WIB'
          : 'Est. 1-2 Hari Kerja',
      urgency: urgency || 'Standar (1-2 Hari Kerja)',
      status: 'PENDING',
      steps: [
        {
          title: '1. Verifikasi HR',
          status: 'active',
          timestamp: 'Sedang diverifikasi oleh tim HR Operations',
          approver: 'HR Operations Duty Officer',
        },
        {
          title: '2. TTD CHRO',
          status: 'pending',
          timestamp: 'Menunggu antrean otorisasi',
          approver: 'Citra Lestari (CHRO)',
        },
        {
          title: '3. Selesai & Terbit',
          status: 'pending',
          timestamp: 'Penerbitan E-Meterai Peruri',
          approver: 'Sistem Otomasi Nexora HRIS',
        },
      ],
    };

    await saveDocumentRequestToDb(newRequest);

    // Broadcast SSE to all connected admin and employee clients
    broadcastApprovalEvent('DOCUMENT_REQUEST_CREATED', {
      id: newRequest.id,
      ticketNo,
      name: employeeName,
      title: newRequest.title,
      request: newRequest,
    });

    // Record audit log
    try {
      await recordAuditLog({
        module: 'LEAVE',
        action: 'DOCUMENT_REQUEST_SUBMITTED',
        recordId: newRequest.id,
        userName: employeeName,
        userEmail: 'rian.pratama@nexora.co.id',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Portal Karyawan ESS',
        oldData: null,
        newData: {
          ticketNo,
          title: newRequest.title,
          purpose: targetPurpose,
          targetOrg,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Permohonan ${newRequest.title} berhasil diajukan dengan nomor tiket ${ticketNo}.`,
      data: newRequest,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action = 'APPROVE_STEP', approverName = 'Dewi Lestari, S.Psi (HR Admin)', notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID permohonan wajib disertakan' }, { status: 400 });
    }

    const result = await updateDocumentRequestStepInDb(id, action, approverName, notes);
    if (!result.success || !result.item) {
      return NextResponse.json({ success: false, message: 'Permohonan dokumen tidak ditemukan' }, { status: 404 });
    }

    // Broadcast SSE
    broadcastApprovalEvent('DOCUMENT_REQUEST_UPDATED', {
      id,
      status: result.item.status,
      currentStep: result.item.currentStep,
      statusLabel: result.item.statusLabel,
      item: result.item,
    });

    // Record audit log
    try {
      await recordAuditLog({
        module: 'LEAVE',
        action: action === 'REJECT' ? 'DOCUMENT_REQUEST_REJECTED' : 'DOCUMENT_REQUEST_ADVANCED',
        recordId: id,
        userName: approverName,
        userEmail: 'admin@nexora.local',
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Admin HR Console',
        oldData: null,
        newData: {
          id,
          statusLabel: result.item.statusLabel,
          currentStep: result.item.currentStep,
          notes,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Status permohonan berhasil diperbarui menjadi ${result.item.statusLabel}.`,
      data: result.item,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
