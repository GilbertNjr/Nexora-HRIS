import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface DocumentOfficialContent {
  header: string;
  subHeader: string;
  docRef: string;
  companyName: string;
  companyAddress: string;
  legalBasis: string;
  clauses: {
    pasal: string;
    content: string;
  }[];
  signingDate: string;
  firstPartySigner: string;
  secondPartySigner: string;
}

export interface DocumentItem {
  id: string;
  nik: string;
  category: 'legal' | 'letter' | 'tax' | 'template';
  title: string;
  docNumber: string;
  updatedDate: string;
  fileSize: string;
  formatBadge: string;
  signatureStatus: string;
  securityBadge: string;
  officialContent?: DocumentOfficialContent;
  downloadUrl?: string;
}

export interface RequestTrackingStep {
  title: string;
  status: 'completed' | 'active' | 'pending';
  timestamp?: string;
  approver?: string;
}

export interface RequestTrackingItem {
  id: string;
  nik: string;
  ticketNo: string;
  title: string;
  targetPurpose: string;
  targetOrg?: string;
  submittedAt: string;
  statusLabel: string;
  currentStep: number;
  totalSteps: number;
  estimatedCompletion: string;
  urgency?: string;
  steps: RequestTrackingStep[];
}

export interface EMeteraiQuota {
  used: number;
  total: number;
  year: number;
}

interface DocumentsDatabase {
  eMeteraiQuota: EMeteraiQuota;
  documents: DocumentItem[];
  requests: RequestTrackingItem[];
}

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const DOCUMENTS_FILE = path.join(STORAGE_DIR, 'nexora_documents.json');

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {}
}

function getStoredDocuments(): DocumentsDatabase {
  try {
    ensureStorage();
    if (fs.existsSync(DOCUMENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(DOCUMENTS_FILE, 'utf-8'));
      if (data && Array.isArray(data.documents)) {
        return data;
      }
    }
  } catch {}

  return {
    eMeteraiQuota: { used: 3, total: 5, year: 2025 },
    documents: [],
    requests: [],
  };
}

function saveStoredDocuments(data: DocumentsDatabase): void {
  try {
    ensureStorage();
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nik = searchParams.get('nik');
  const category = searchParams.get('category');
  const search = searchParams.get('search')?.toLowerCase();

  const db = getStoredDocuments();
  let docs = db.documents;
  let reqs = db.requests;

  if (nik) {
    const userNik = nik.toLowerCase();
    docs = docs.filter((d) => !d.nik || d.nik.toLowerCase() === userNik);
    reqs = reqs.filter((r) => !r.nik || r.nik.toLowerCase() === userNik);
  }

  if (category && category !== 'all' && category !== 'Semua') {
    docs = docs.filter((d) => d.category === category);
  }

  if (search) {
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(search) ||
        d.docNumber.toLowerCase().includes(search) ||
        d.signatureStatus.toLowerCase().includes(search)
    );
  }

  const counts = {
    activeDocs: docs.length,
    pendingRequests: reqs.filter((r) => r.currentStep < r.totalSteps).length,
    legal: db.documents.filter((d) => d.category === 'legal').length,
    letter: db.documents.filter((d) => d.category === 'letter').length,
    tax: db.documents.filter((d) => d.category === 'tax').length,
    template: db.documents.filter((d) => d.category === 'template').length,
    totalRequests: reqs.length,
  };

  return NextResponse.json({
    success: true,
    documents: docs,
    requests: reqs,
    eMeteraiQuota: db.eMeteraiQuota,
    counts,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getStoredDocuments();

    const { nik, title, targetPurpose, targetOrg, urgency } = body;
    const ticketSeq = String(db.requests.length + 83).padStart(3, '0');
    const ticketNo = `REQ-DOC-2025-${ticketSeq}`;

    const now = new Date();
    const submittedAtFormatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now) + ' • ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const newRequest: RequestTrackingItem = {
      id: `req-${Date.now()}`,
      nik: nik || 'NX-2021008',
      ticketNo,
      title: title || 'Surat Keterangan Penghasilan (Salary Slip)',
      targetPurpose: targetPurpose || 'Keperluan pengajuan administrasi',
      targetOrg: targetOrg || 'Instansi Terkait',
      submittedAt: submittedAtFormatted,
      statusLabel: 'Verifikasi Awal HR Operations',
      currentStep: 1,
      totalSteps: 3,
      estimatedCompletion: urgency === 'Penting (Hari yang Sama)' ? 'Est. Hari Ini, 17:00 WIB' : 'Est. Besok, 14:00 WIB',
      urgency: urgency || 'Standar (1-2 Hari Kerja)',
      steps: [
        {
          title: '1. Verifikasi HR',
          status: 'active',
          timestamp: 'Sedang diverifikasi oleh tim HR',
          approver: 'HR Operations Duty Officer',
        },
        {
          title: '2. TTD CHRO',
          status: 'pending',
          timestamp: 'Menunggu antrean otorisasi',
          approver: 'Citra Lestari (CHRO)',
        },
        {
          title: '3. Selesai',
          status: 'pending',
          timestamp: 'Penerbitan E-Meterai Peruri',
          approver: 'Sistem Otomasi Nexora HRIS',
        },
      ],
    };

    db.requests.unshift(newRequest);
    saveStoredDocuments(db);

    return NextResponse.json({
      success: true,
      message: `Permohonan ${newRequest.title} berhasil diajukan dengan nomor tiket ${ticketNo}.`,
      data: newRequest,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
