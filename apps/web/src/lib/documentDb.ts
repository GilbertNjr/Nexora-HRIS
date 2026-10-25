import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

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
  employeeName?: string;
  employeeRole?: string;
  department?: string;
  avatarUrl?: string;
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
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
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

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_Jv7SzD1PgcQl@ep-shiny-silence-azkjdzr3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL;

function getDb() {
  return neon(DATABASE_URL);
}

// Fallback JSON file storage in apps/web/.data/nexora_documents.json
const STORAGE_DIR = path.join(process.cwd(), '.data');
const DOCUMENTS_FILE = path.join(STORAGE_DIR, 'nexora_documents.json');

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {}
}

function getStoredFileDocuments(): DocumentsDatabase {
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
    eMeteraiQuota: { used: 3, total: 5, year: 2026 },
    documents: [],
    requests: [],
  };
}

function saveStoredFileDocuments(data: DocumentsDatabase): void {
  try {
    ensureStorage();
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

/**
 * Idempotently creates tables in Neon PostgreSQL if they do not exist
 */
let tablesInitialized = false;
export async function ensureDocumentTables(): Promise<void> {
  if (tablesInitialized) return;
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS document_requests (
        id VARCHAR(100) PRIMARY KEY,
        nik VARCHAR(50) NOT NULL,
        employee_name VARCHAR(150),
        employee_role VARCHAR(150),
        department VARCHAR(100),
        ticket_no VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        target_purpose TEXT NOT NULL,
        target_org VARCHAR(255),
        urgency VARCHAR(100) DEFAULT 'Standar (1-2 Hari Kerja)',
        submitted_at VARCHAR(100) NOT NULL,
        status_label VARCHAR(100) NOT NULL,
        current_step INT DEFAULT 1,
        total_steps INT DEFAULT 3,
        estimated_completion VARCHAR(100),
        steps JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS official_documents (
        id VARCHAR(100) PRIMARY KEY,
        nik VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        doc_number VARCHAR(100) NOT NULL,
        updated_date VARCHAR(50) NOT NULL,
        file_size VARCHAR(50) NOT NULL,
        format_badge VARCHAR(50) NOT NULL,
        signature_status VARCHAR(100) NOT NULL,
        security_badge VARCHAR(100) NOT NULL,
        official_content JSONB,
        download_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    tablesInitialized = true;
  } catch (err) {
    console.warn('[documentDb] Error initializing Neon DB tables, using fallback:', err);
  }
}

/**
 * Fetch all document requests from Neon PostgreSQL with fallback
 */
export async function getDocumentRequestsFromDb(nik?: string): Promise<RequestTrackingItem[]> {
  await ensureDocumentTables();

  try {
    const sql = getDb();
    let rows: any[] = [];
    if (nik) {
      rows = await sql`
        SELECT * FROM document_requests 
        WHERE LOWER(nik) = LOWER(${nik}) 
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM document_requests 
        ORDER BY created_at DESC
      `;
    }

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        nik: r.nik,
        employeeName: r.employee_name || 'Rian Pratama, S.Kom',
        employeeRole: r.employee_role || 'Lead Backend Architect',
        department: r.department || 'Teknologi Informasi',
        ticketNo: r.ticket_no,
        title: r.title,
        targetPurpose: r.target_purpose,
        targetOrg: r.target_org || '',
        submittedAt: r.submitted_at,
        statusLabel: r.status_label,
        currentStep: Number(r.current_step),
        totalSteps: Number(r.total_steps),
        estimatedCompletion: r.estimated_completion || '',
        urgency: r.urgency,
        steps: Array.isArray(r.steps) ? r.steps : JSON.parse(r.steps || '[]'),
        status: r.status || 'PENDING',
      }));
    }
  } catch (err) {
    console.warn('[documentDb] Error fetching requests from Neon DB, using fallback:', err);
  }

  // Fallback to JSON file storage
  const fileDb = getStoredFileDocuments();
  let reqs = fileDb.requests || [];
  if (nik) {
    reqs = reqs.filter((r) => !r.nik || r.nik.toLowerCase() === nik.toLowerCase());
  }
  return reqs;
}

/**
 * Save new document request to Neon PostgreSQL and file storage
 */
export async function saveDocumentRequestToDb(requestItem: RequestTrackingItem): Promise<RequestTrackingItem> {
  await ensureDocumentTables();

  const employeeName = requestItem.employeeName || 'Rian Pratama, S.Kom';
  const employeeRole = requestItem.employeeRole || 'Lead Backend Architect';
  const department = requestItem.department || 'Teknologi Informasi';

  try {
    const sql = getDb();
    await sql`
      INSERT INTO document_requests (
        id, nik, employee_name, employee_role, department,
        ticket_no, title, target_purpose, target_org, urgency,
        submitted_at, status_label, current_step, total_steps,
        estimated_completion, steps, status, created_at, updated_at
      ) VALUES (
        ${requestItem.id},
        ${requestItem.nik},
        ${employeeName},
        ${employeeRole},
        ${department},
        ${requestItem.ticketNo},
        ${requestItem.title},
        ${requestItem.targetPurpose},
        ${requestItem.targetOrg || ''},
        ${requestItem.urgency || 'Standar (1-2 Hari Kerja)'},
        ${requestItem.submittedAt},
        ${requestItem.statusLabel},
        ${requestItem.currentStep},
        ${requestItem.totalSteps},
        ${requestItem.estimatedCompletion},
        ${JSON.stringify(requestItem.steps)},
        ${requestItem.status || 'PENDING'},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        ticket_no = EXCLUDED.ticket_no,
        title = EXCLUDED.title,
        status_label = EXCLUDED.status_label,
        current_step = EXCLUDED.current_step,
        steps = EXCLUDED.steps,
        status = EXCLUDED.status,
        updated_at = NOW();
    `;
  } catch (err) {
    console.warn('[documentDb] Error saving to Neon DB, writing to file fallback:', err);
  }

  // Always mirror to file storage for safety
  const fileDb = getStoredFileDocuments();
  const existingIndex = fileDb.requests.findIndex((r) => r.id === requestItem.id);
  if (existingIndex !== -1) {
    fileDb.requests[existingIndex] = { ...requestItem, employeeName, employeeRole, department };
  } else {
    fileDb.requests.unshift({ ...requestItem, employeeName, employeeRole, department });
  }
  saveStoredFileDocuments(fileDb);

  return requestItem;
}

/**
 * Update document request progress / decision in Neon PostgreSQL
 */
export async function updateDocumentRequestStepInDb(
  id: string,
  action: 'APPROVE_STEP' | 'REJECT' | 'ADVANCE',
  approverName: string = 'Dewi Lestari, S.Psi (HR Admin)',
  notes?: string
): Promise<{ success: boolean; item?: RequestTrackingItem }> {
  await ensureDocumentTables();

  const allRequests = await getDocumentRequestsFromDb();
  const item = allRequests.find((r) => r.id === id);

  if (!item) {
    return { success: false };
  }

  const nowStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date()) + ' • ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  if (action === 'REJECT') {
    item.status = 'REJECTED';
    item.statusLabel = 'Ditolak HR Operations';
    const activeStep = item.steps.find((s) => s.status === 'active') || item.steps[item.currentStep - 1];
    if (activeStep) {
      activeStep.status = 'pending';
      activeStep.timestamp = `Ditolak oleh ${approverName}${notes ? `: ${notes}` : ''}`;
    }
  } else {
    // Advance step
    if (item.currentStep === 1) {
      // Step 1 done -> Step 2 active
      item.steps[0].status = 'completed';
      item.steps[0].timestamp = `${nowStr} (Diverifikasi oleh ${approverName})`;
      item.steps[0].approver = approverName;

      item.steps[1].status = 'active';
      item.steps[1].timestamp = 'Sedang dalam antrean otorisasi CHRO';

      item.currentStep = 2;
      item.statusLabel = 'Menunggu Tanda Tangan CHRO';
    } else if (item.currentStep === 2 || action === 'APPROVE_STEP') {
      // Step 2 & 3 completed -> Issued!
      item.steps[1].status = 'completed';
      item.steps[1].timestamp = `${nowStr} (Disahkan oleh Citra Lestari, CHRO)`;

      item.steps[2].status = 'completed';
      item.steps[2].timestamp = `${nowStr} (Diterbitkan E-Meterai Peruri Valid)`;

      item.currentStep = 3;
      item.status = 'APPROVED';
      item.statusLabel = 'Selesai & Diterbitkan';

      // Auto-issue official document into employee's documents table!
      try {
        await issueApprovedOfficialDocument(item);
      } catch (err) {
        console.warn('[documentDb] Auto-issuing document error:', err);
      }
    }
  }

  // Update in Neon PostgreSQL
  try {
    const sql = getDb();
    await sql`
      UPDATE document_requests
      SET 
        status_label = ${item.statusLabel},
        current_step = ${item.currentStep},
        status = ${item.status || 'PENDING'},
        steps = ${JSON.stringify(item.steps)},
        updated_at = NOW()
      WHERE id = ${id}
    `;
  } catch (err) {
    console.warn('[documentDb] Error updating request in Neon DB:', err);
  }

  // Mirror update to file storage
  const fileDb = getStoredFileDocuments();
  const fileIndex = fileDb.requests.findIndex((r) => r.id === id);
  if (fileIndex !== -1) {
    fileDb.requests[fileIndex] = item;
    saveStoredFileDocuments(fileDb);
  }

  return { success: true, item };
}

/**
 * Automatically creates the official legal document when request is approved
 */
async function issueApprovedOfficialDocument(req: RequestTrackingItem): Promise<void> {
  const currentYear = new Date().getFullYear();
  const docSeq = String(Math.floor(100 + Math.random() * 900));
  const docNum = `SKK-NX/${currentYear}/HR-${docSeq}`;
  const nowFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const newDoc: DocumentItem = {
    id: `doc-issued-${Date.now()}`,
    nik: req.nik,
    category: 'letter',
    title: `${req.title} — ${req.targetOrg || 'Resmi'}`,
    docNumber: docNum,
    updatedDate: nowFormatted,
    fileSize: '1.2 MB',
    formatBadge: 'E-METERAI',
    signatureStatus: 'Ditandatangani Digital (Peruri CA)',
    securityBadge: 'E-Meterai Valid',
    officialContent: {
      header: 'SURAT KETERANGAN RESMI KEPEGAWAIAN (EMPLOYMENT CERTIFICATE)',
      subHeader: `DITERBITKAN RESMI UNTUK: ${req.targetPurpose.toUpperCase()}`,
      docRef: `Nomor: ${docNum}`,
      companyName: 'PT NEXORA DIGITAL NUSANTARA',
      companyAddress: 'Menara Nexora Lt. 18-20, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190',
      legalBasis: 'Standar Operasional Prosedur Penerbitan Surat Keterangan Karyawan SOP-HR-2026-04.',
      clauses: [
        {
          pasal: 'KETERANGAN IDENTITAS PEGAWAI',
          content: `Dengan ini Direktur Human Capital PT Nexora Digital Nusantara menerangkan bahwa: Nama: ${req.employeeName || 'Rian Pratama, S.Kom'}, NIK: ${req.nik}, Jabatan: ${req.employeeRole || 'Lead Backend Architect'}, Departemen: ${req.department || 'Teknologi Informasi'}, Status: Karyawan Tetap (Permanen).`,
        },
        {
          pasal: 'KEPERLUAN & PENGESAHAN DOKUMEN',
          content: `Surat ini diterbitkan resmi atas permohonan mandiri pegawai dengan nomor tiket ${req.ticketNo} untuk keperluan: "${req.targetPurpose}" yang ditujukan kepada ${req.targetOrg || 'Instansi Terkait'}.`,
        },
        {
          pasal: 'KEABSAHAN ELEKTRONIK',
          content: 'Dokumen ini sah dan mengikat secara hukum sesuai UU ITE No. 1/2024 dan UU PDP No. 27/2022, dilengkapi E-Meterai Peruri tersertifikasi.',
        },
      ],
      signingDate: `Jakarta, ${nowFormatted}`,
      firstPartySigner: 'Citra Lestari, S.Psi, M.M. (Chief Human Resources Officer)',
      secondPartySigner: `${req.employeeName || 'Rian Pratama, S.Kom'}`,
    },
  };

  await saveOfficialDocumentToDb(newDoc);
}

/**
 * Retrieve official documents from Neon PostgreSQL or fallback
 */
export async function getOfficialDocumentsFromDb(
  nik?: string,
  category?: string,
  search?: string
): Promise<DocumentItem[]> {
  await ensureDocumentTables();

  let docs: DocumentItem[] = [];

  try {
    const sql = getDb();
    let rows: any[] = [];
    if (nik) {
      rows = await sql`
        SELECT * FROM official_documents 
        WHERE LOWER(nik) = LOWER(${nik}) 
        ORDER BY created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT * FROM official_documents 
        ORDER BY created_at DESC
      `;
    }

    if (rows && rows.length > 0) {
      docs = rows.map((r) => ({
        id: r.id,
        nik: r.nik,
        category: r.category,
        title: r.title,
        docNumber: r.doc_number,
        updatedDate: r.updated_date,
        fileSize: r.file_size,
        formatBadge: r.format_badge,
        signatureStatus: r.signature_status,
        securityBadge: r.security_badge,
        officialContent: typeof r.official_content === 'string' ? JSON.parse(r.official_content) : r.official_content,
        downloadUrl: r.download_url || undefined,
      }));
    }
  } catch (err) {
    console.warn('[documentDb] Error fetching documents from Neon DB, using fallback:', err);
  }

  // Merge with initial file documents if DB is empty
  if (docs.length === 0) {
    const fileDb = getStoredFileDocuments();
    docs = fileDb.documents || [];
    if (nik) {
      const userNik = nik.toLowerCase();
      docs = docs.filter((d) => !d.nik || d.nik.toLowerCase() === userNik);
    }
  }

  if (category && category !== 'all' && category !== 'Semua') {
    docs = docs.filter((d) => d.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.docNumber.toLowerCase().includes(q) ||
        d.signatureStatus.toLowerCase().includes(q)
    );
  }

  return docs;
}

/**
 * Save official document to Neon PostgreSQL & file storage
 */
export async function saveOfficialDocumentToDb(doc: DocumentItem): Promise<void> {
  await ensureDocumentTables();

  try {
    const sql = getDb();
    await sql`
      INSERT INTO official_documents (
        id, nik, category, title, doc_number,
        updated_date, file_size, format_badge, signature_status,
        security_badge, official_content, download_url, created_at
      ) VALUES (
        ${doc.id},
        ${doc.nik},
        ${doc.category},
        ${doc.title},
        ${doc.docNumber},
        ${doc.updatedDate},
        ${doc.fileSize},
        ${doc.formatBadge},
        ${doc.signatureStatus},
        ${doc.securityBadge},
        ${JSON.stringify(doc.officialContent || null)},
        ${doc.downloadUrl || null},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        doc_number = EXCLUDED.doc_number,
        updated_date = EXCLUDED.updated_date,
        signature_status = EXCLUDED.signature_status,
        official_content = EXCLUDED.official_content;
    `;
  } catch (err) {
    console.warn('[documentDb] Error saving official doc to Neon DB:', err);
  }

  // Mirror to file storage
  const fileDb = getStoredFileDocuments();
  const existingIdx = fileDb.documents.findIndex((d) => d.id === doc.id);
  if (existingIdx !== -1) {
    fileDb.documents[existingIdx] = doc;
  } else {
    fileDb.documents.unshift(doc);
  }
  saveStoredFileDocuments(fileDb);
}
