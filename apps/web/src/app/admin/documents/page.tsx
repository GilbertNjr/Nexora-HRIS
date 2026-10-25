'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Layers,
  ArrowRight,
  Send,
  Sparkles,
} from 'lucide-react';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  RequestTrackingItem,
  DocumentItem,
  EMeteraiQuota,
} from '@/lib/documentDb';
import {
  generateOfficialDocumentHtml,
  downloadOfficialDocument,
  printOfficialDocument,
  OfficialDocParams,
} from '@/lib/officialDocumentGenerator';

export default function AdminDocumentsPage() {
  const [requests, setRequests] = useState<RequestTrackingItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [eMeteraiQuota, setEMeteraiQuota] = useState<EMeteraiQuota>({
    used: 3,
    total: 5,
    year: new Date().getFullYear(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'step1' | 'step2' | 'approved' | 'rejected'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<RequestTrackingItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [previewDocParams, setPreviewDocParams] = useState<OfficialDocParams | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch live documents dataset from API
  const fetchLiveDataset = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/documents', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.requests)) setRequests(json.requests);
        if (Array.isArray(json.documents)) setDocuments(json.documents);
        if (json.eMeteraiQuota) setEMeteraiQuota(json.eMeteraiQuota);
      }
    } catch (err) {
      console.warn('[AdminDocuments] Error fetching live dataset:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real-time synchronization via BroadcastChannel
  useEffect(() => {
    fetchLiveDataset();

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        if (
          msg.type === 'DOCUMENT_REQUEST_CREATED' ||
          msg.type === 'DOCUMENT_REQUEST_UPDATED' ||
          msg.type === 'DOCUMENTS_UPDATED' ||
          msg.type === 'APPROVAL_UPDATED'
        ) {
          fetchLiveDataset();
          if (msg.type === 'DOCUMENT_REQUEST_CREATED') {
            showToast(
              `🔔 Pengajuan Baru Real-Time: ${msg.name || 'Karyawan'} baru saja mengajukan ${
                msg.title || 'dokumen'
              }!`
            );
          }
        }
      };
    } catch {}

    const handleFocus = () => fetchLiveDataset();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchLiveDataset]);

  // Handle Advance / Approve Step
  const handleAdvanceStep = async (req: RequestTrackingItem) => {
    setActionLoadingId(req.id);
    try {
      const nextAction = 'APPROVE_STEP';
      const res = await fetch('/api/v1/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: req.id,
          action: nextAction,
          approverName: 'Dewi Lestari, S.Psi (HR Admin)',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        showToast(`✓ Berhasil: ${json.message || 'Tahap permohonan telah diperbarui.'}`);

        // Broadcast to employee in real-time
        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({
            type: 'DOCUMENT_REQUEST_UPDATED',
            id: req.id,
            status: json.data?.status || 'UPDATED',
            item: json.data,
          });
          bc.close();
        } catch {}

        fetchLiveDataset();
        if (selectedRequest?.id === req.id && json.data) {
          setSelectedRequest(json.data);
        }
      } else {
        showToast('✕ Gagal memperbarui tahapan permohonan.');
      }
    } catch {
      showToast('✕ Terjadi kesalahan koneksi.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (id: string) => {
    setRejectTargetId(id);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  // Confirm Reject
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTargetId) return;

    setActionLoadingId(rejectTargetId);
    try {
      const res = await fetch('/api/v1/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rejectTargetId,
          action: 'REJECT',
          approverName: 'Dewi Lestari, S.Psi (HR Admin)',
          notes: rejectReason || 'Persyaratan administrasi belum terpenuhi',
        }),
      });

      if (res.ok) {
        showToast('✕ Permohonan berkas telah ditolak.');
        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({
            type: 'DOCUMENT_REQUEST_UPDATED',
            id: rejectTargetId,
            status: 'REJECTED',
          });
          bc.close();
        } catch {}

        setIsRejectModalOpen(false);
        fetchLiveDataset();
      }
    } catch {
      showToast('✕ Gagal memproses penolakan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Preview Modal for a Request
  const handleOpenDocPreview = (req: RequestTrackingItem) => {
    const matchedDoc = documents.find((d) => d.title.includes(req.title) || d.docNumber.includes(req.ticketNo));
    if (matchedDoc) {
      setPreviewDocParams({
        title: matchedDoc.title,
        docNumber: matchedDoc.docNumber,
        updatedDate: matchedDoc.updatedDate,
        category: matchedDoc.category,
        formatBadge: matchedDoc.formatBadge,
        signatureStatus: matchedDoc.signatureStatus,
        securityBadge: matchedDoc.securityBadge,
        employeeName: req.employeeName || 'Rian Pratama, S.Kom',
        employeeNik: req.nik,
        employeeRole: req.employeeRole || 'Lead Backend Architect',
        employeeDept: req.department || 'Teknologi Informasi',
        officialContent: matchedDoc.officialContent,
      });
    } else {
      setPreviewDocParams({
        title: req.title,
        docNumber: `SKK-NX/2026/HR-${req.ticketNo.replace(/\D/g, '').slice(-3) || '083'}`,
        updatedDate: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
        category: 'letter',
        formatBadge: 'E-METERAI',
        signatureStatus: 'Ditandatangani Digital (Peruri CA)',
        securityBadge: 'E-Meterai Valid',
        employeeName: req.employeeName || 'Rian Pratama, S.Kom',
        employeeNik: req.nik,
        employeeRole: req.employeeRole || 'Lead Backend Architect',
        employeeDept: req.department || 'Teknologi Informasi',
        officialContent: {
          header: 'SURAT KETERANGAN RESMI KEPEGAWAIAN (EMPLOYMENT CERTIFICATE)',
          subHeader: `KEPERLUAN: ${req.targetPurpose.toUpperCase()}`,
          docRef: `Nomor: SKK-NX/2026/HR-083`,
          legalBasis: 'Standar Operasional Prosedur Penerbitan Surat Keterangan Karyawan SOP-HR-2026-04.',
          clauses: [
            {
              pasal: 'KETERANGAN IDENTITAS PEGAWAI',
              content: `Dengan ini Direktur Human Capital menerangkan bahwa: Nama: ${req.employeeName || 'Rian Pratama, S.Kom'}, NIK: ${req.nik}, Jabatan: ${req.employeeRole || 'Lead Backend Architect'}, Departemen: ${req.department || 'Teknologi Informasi'}, Status: Karyawan Tetap (Permanen).`,
            },
            {
              pasal: 'MAKSUD & PENGESAHAN DOKUMEN',
              content: `Surat ini diterbitkan resmi berdasarkan tiket ${req.ticketNo} untuk keperluan: "${req.targetPurpose}" yang ditujukan kepada ${req.targetOrg || 'Instansi Terkait'}.`,
            },
          ],
        },
      });
    }
    setIsPreviewModalOpen(true);
  };

  // Metrics counts
  const step1Count = useMemo(() => requests.filter((r) => r.currentStep === 1 && r.status !== 'REJECTED').length, [requests]);
  const step2Count = useMemo(() => requests.filter((r) => r.currentStep === 2 && r.status !== 'REJECTED').length, [requests]);
  const approvedCount = useMemo(() => requests.filter((r) => r.currentStep >= 3 || r.status === 'APPROVED').length, [requests]);
  const rejectedCount = useMemo(() => requests.filter((r) => r.status === 'REJECTED').length, [requests]);
  const pendingTotal = useMemo(() => step1Count + step2Count, [step1Count, step2Count]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (activeTab === 'step1' && (req.currentStep !== 1 || req.status === 'REJECTED')) return false;
      if (activeTab === 'step2' && (req.currentStep !== 2 || req.status === 'REJECTED')) return false;
      if (activeTab === 'approved' && req.status !== 'APPROVED' && req.currentStep < 3) return false;
      if (activeTab === 'rejected' && req.status !== 'REJECTED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = req.employeeName?.toLowerCase().includes(q) || false;
        const matchNik = req.nik.toLowerCase().includes(q);
        const matchTicket = req.ticketNo.toLowerCase().includes(q);
        const matchTitle = req.title.toLowerCase().includes(q);
        const matchOrg = req.targetOrg?.toLowerCase().includes(q) || false;
        if (!matchName && !matchNik && !matchTicket && !matchTitle && !matchOrg) return false;
      }

      return true;
    });
  }, [requests, activeTab, searchQuery]);

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link href="/admin" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span>Operasional</span>
              <span>/</span>
              <span className="text-slate-900 font-bold">Manajemen Dokumen &amp; Surat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Pusat Dokumen &amp; Otorisasi Surat Resmi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Verifikasi permohonan surat karyawan, pantau antrean otorisasi TTD digital, terbitkan E-Meterai Peruri,
              dan sinkronkan status ke portal ESS secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={fetchLiveDataset}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Sinkronkan Ulang</span>
            </button>
          </div>
        </div>

        {/* TOP METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Menunggu Verifikasi HR (Tahap 1) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                VERIFIKASI HR (TAHAP 1)
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{step1Count}</span>
              <span className="text-xs font-bold text-slate-400 ml-1.5">Permohonan</span>
            </div>
            <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md inline-block">
              {step1Count > 0 ? '● Perlu Ditinjau Segera' : 'Antrean Bersih'}
            </p>
          </div>

          {/* Card 2: Proses TTD CHRO (Tahap 2) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                ANTREAN TTD CHRO (TAHAP 2)
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{step2Count}</span>
              <span className="text-xs font-bold text-slate-400 ml-1.5">Dalam Proses</span>
            </div>
            <p className="text-[11px] text-slate-500">Menunggu otorisasi pimpinan</p>
          </div>

          {/* Card 3: Selesai Diterbitkan */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                SELESAI &amp; DITERBITKAN
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-emerald-600 tracking-tight">{approvedCount}</span>
              <span className="text-xs font-bold text-slate-400 ml-1.5">Dokumen Sah</span>
            </div>
            <p className="text-[11px] text-slate-500">Tersinkron ke portal ESS</p>
          </div>

          {/* Card 4: Kuota E-Meterai Peruri */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                E-METERAI PERURI AKTIF
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {eMeteraiQuota.total - eMeteraiQuota.used}
              </span>
              <span className="text-xs font-bold text-slate-400 ml-1.5">/ {eMeteraiQuota.total} Tersisa</span>
            </div>
            <p className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md inline-block">
              Lisensi Peruri CA Aktif {eMeteraiQuota.year}
            </p>
          </div>
        </div>

        {/* MAIN DATA TABLE SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
          {/* Header controls: Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua ({requests.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('step1')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'step1' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Verifikasi HR ({step1Count})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('step2')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'step2' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>TTD CHRO ({step2Count})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('approved')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'approved' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Diterbitkan ({approvedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rejected')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'rejected' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Ditolak ({rejectedCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor tiket, nama pegawai, atau surat..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* REQUESTS LIST */}
          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Tidak Ada Permohonan Dokumen</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'Tidak ditemukan permohonan yang sesuai dengan filter pencarian Anda.'
                  : 'Seluruh permohonan surat dari karyawan telah selesai diproses atau antrean sedang kosong.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const isStep1 = req.currentStep === 1 && req.status !== 'REJECTED';
                const isStep2 = req.currentStep === 2 && req.status !== 'REJECTED';
                const isApproved = req.status === 'APPROVED' || req.currentStep >= 3;
                const isRejected = req.status === 'REJECTED';

                return (
                  <div
                    key={req.id}
                    className="py-4.5 px-3 rounded-2xl hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Info & Requester */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        {/* Title & Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{req.title}</h3>
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            #{req.ticketNo}
                          </span>
                          {req.urgency?.includes('Penting') && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              ⚡ {req.urgency}
                            </span>
                          )}
                        </div>

                        {/* Requester details */}
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-900 font-bold">{req.employeeName || 'Rian Pratama, S.Kom'}</strong>{' '}
                          • <span className="font-mono text-slate-500">{req.nik}</span> •{' '}
                          <span className="text-slate-500">{req.employeeRole || 'Lead Backend Architect'}</span>
                        </p>

                        {/* Purpose & Destination */}
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">Keperluan:</span> &ldquo;{req.targetPurpose}&rdquo;{' '}
                          {req.targetOrg && (
                            <span className="text-slate-400">
                              • <Building className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                              {req.targetOrg}
                            </span>
                          )}
                        </p>

                        {/* Submitted time */}
                        <p className="text-[11px] text-slate-400">
                          Diajukan: {req.submittedAt} • {req.estimatedCompletion}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Stepper Indicator */}
                    <div className="lg:px-4 py-2 flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {/* Step 1 Pill */}
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 ${
                            req.currentStep > 1 || isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isStep1
                              ? 'bg-amber-50 text-amber-700 border border-amber-300 font-black animate-pulse'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {req.currentStep > 1 || isApproved ? '✓' : '1'} Verifikasi HR
                        </span>

                        <ChevronRight className="w-3 h-3 text-slate-300" />

                        {/* Step 2 Pill */}
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isStep2
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 font-black animate-pulse'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isApproved ? '✓' : '2'} TTD CHRO
                        </span>

                        <ChevronRight className="w-3 h-3 text-slate-300" />

                        {/* Step 3 Pill */}
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-600 text-white font-black shadow-xs'
                              : isRejected
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isApproved ? '✓ Terbit' : isRejected ? '✕ Ditolak' : '3. Terbit'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:self-center flex-shrink-0 flex-wrap">
                      {/* Step 1 Action: Verify & Forward */}
                      {isStep1 && (
                        <button
                          type="button"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleAdvanceStep(req)}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>✓ Verifikasi &amp; Teruskan ke CHRO</span>
                        </button>
                      )}

                      {/* Step 2 Action: Authorize & Issue */}
                      {isStep2 && (
                        <button
                          type="button"
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleAdvanceStep(req)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>✓ Sahkan &amp; Terbitkan E-Meterai</span>
                        </button>
                      )}

                      {/* Completed Action: Print / View Official Document */}
                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => handleOpenDocPreview(req)}
                          className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Dokumen Terbit</span>
                        </button>
                      )}

                      {/* Tracking / Detail Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsDetailModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Riwayat</span>
                      </button>

                      {/* Reject button (only if not approved yet and not rejected) */}
                      {!isApproved && !isRejected && (
                        <button
                          type="button"
                          onClick={() => openRejectModal(req.id)}
                          className="px-2.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                          title="Tolak Permohonan"
                        >
                          <X className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: DETAIL & RIWAYAT TRACKING */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Detail &amp; Alur Tracking Permohonan
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Tiket: #{selectedRequest.ticketNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content summary */}
            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">JENIS BERKAS</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRequest.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">PEMOHON</p>
                  <p className="font-bold text-slate-800">{selectedRequest.employeeName || 'Rian Pratama'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedRequest.nik}</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">URGENSI</p>
                  <p className="font-bold text-slate-800">{selectedRequest.urgency}</p>
                  <p className="text-[11px] text-slate-500">{selectedRequest.estimatedCompletion}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">KEPERLUAN RESMI</p>
                <p className="font-medium text-slate-700 italic mt-0.5">&ldquo;{selectedRequest.targetPurpose}&rdquo;</p>
              </div>
              {selectedRequest.targetOrg && (
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">INSTANSI TUJUAN</p>
                  <p className="font-bold text-slate-800">{selectedRequest.targetOrg}</p>
                </div>
              )}
            </div>

            {/* Stepper Log */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800">Linimasa Otorisasi Dokumen:</p>
              <div className="space-y-2">
                {selectedRequest.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      step.status === 'completed'
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        : step.status === 'active'
                        ? 'bg-blue-50/50 border-blue-200 text-blue-900 font-semibold'
                        : 'bg-slate-50 border-slate-200/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          step.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : step.status === 'active'
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {step.status === 'completed' ? '✓' : idx + 1}
                      </span>
                      <span>{step.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{step.timestamp || 'Menunggu'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenDocPreview(selectedRequest)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Pratinjau Dokumen
              </button>
              {selectedRequest.currentStep < 3 && selectedRequest.status !== 'REJECTED' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleAdvanceStep(selectedRequest);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {selectedRequest.currentStep === 1 ? '✓ Verifikasi Tahap 1' : '✓ Sahkan Dokumen (Tahap 2)'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRATINJAU DOKUMEN RESMI (OFFICIAL PREVIEW) */}
      {isPreviewModalOpen && previewDocParams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pratinjau Dokumen Resmi Standar Perusahaan
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewDocParams.title} • {previewDocParams.docNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printOfficialDocument(previewDocParams)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cetak A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadOfficialDocument(previewDocParams)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Berkas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Render Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
              <div className="bg-white shadow-lg rounded-xl max-w-2xl w-full border border-slate-200/80 p-8">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: generateOfficialDocumentHtml(previewDocParams)
                      .replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, '')
                      .replace(/<\/body>[\s\S]*?<\/html>/i, ''),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PENOLAKAN PERMOHONAN */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                  Konfirmasi Penolakan Permohonan
                </h3>
                <p className="text-xs text-slate-500">
                  Status penolakan akan disinkronkan ke karyawan di portal ESS.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alasan Penolakan:
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Dokumen pendukung belum lengkap / format permohonan tidak sesuai peruntukan."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === rejectTargetId}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
