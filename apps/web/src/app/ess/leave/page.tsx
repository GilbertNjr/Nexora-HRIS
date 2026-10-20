'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FolderArchive,
  Headphones,
  Search,
  Calendar,
  CheckCircle2,
  CalendarPlus,
  Umbrella,
  Award,
  Users,
  FileText,
  Download,
  Paperclip,
  Check,
  X,
  HelpCircle,
  Building2,
  FileCheck,
  BookOpen,
  AlertCircle,
  Clock3,
  UserCheck,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Plus,
} from 'lucide-react';

interface LeaveRequestItem {
  id: string;
  refNo: string;
  type: string;
  title: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  handover: string;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusBadge: string;
  submittedAt: string;
  completedAt?: string;
  documentUrl?: string;
  documentName?: string;
  steps: {
    title: string;
    person: string;
    time?: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  }[];
}

export default function EssLeaveOverhaulPage() {
  // Filter tabs: all, pending, approved
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);
  const [isPkbModalOpen, setIsPkbModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formType, setFormType] = useState('Cuti Tahunan');
  const [formTitle, setFormTitle] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formHandover, setFormHandover] = useState('Nadia Wijaya');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leave Balances
  const [balances, setBalances] = useState({
    annualTotal: 12,
    annualUsed: 4,
    annualRemaining: 8,
    jointHoliday: 2,
    sickUsed: 1,
    pendingCount: 1,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Leave Requests matching screenshot
  const [requests, setRequests] = useState<LeaveRequestItem[]>([
    {
      id: 'req-01',
      refNo: 'LV-2025-0042',
      type: 'Cuti Tahunan',
      title: 'Cuti Tahunan: Mudik Hari Raya Idul Fitri 1446 H',
      startDate: '31 Mar',
      endDate: '04 Apr 2025',
      durationDays: 4,
      handover: 'Nadia Wijaya',
      notes:
        'Perjalanan mudik tahunan ke Klaten, Jawa Tengah bersama keluarga. Seluruh sprint backend release v3.4 telah didelegasikan dan on-call incident standby dikoordinasikan bersama tim.',
      status: 'PENDING',
      statusBadge: 'Menunggu Verifikasi',
      submittedAt: '20 Mar 2025',
      steps: [
        {
          title: 'Pengajuan Mandiri',
          person: 'Rian Pratama',
          time: '20 Mar, 09:15 WIB',
          status: 'COMPLETED',
        },
        {
          title: 'Atasan Langsung',
          person: 'Arya Wibowo (VP Eng)',
          time: 'Menunggu Verifikasi',
          status: 'IN_PROGRESS',
        },
        {
          title: 'HR Operations',
          person: 'Dewi Lestari, S.Psi',
          time: 'Tahap Akhir',
          status: 'PENDING',
        },
      ],
    },
    {
      id: 'req-02',
      refNo: 'SK-2025-0019',
      type: 'Izin Sakit',
      title: 'Izin Sakit: Gejala ISPA & Demam',
      startDate: '14 Feb',
      endDate: '14 Feb 2025',
      durationDays: 1,
      handover: 'Handover Tiket Support',
      notes:
        'Mengalami demam tinggi dan radang tenggorokan setelah dinas luar. Dokter merekomendasikan istirahat penuh 1 hari.',
      status: 'APPROVED',
      statusBadge: 'Disetujui HR & Atasan',
      submittedAt: '14 Feb 2025',
      completedAt: '15 Feb 2025',
      documentUrl: '#',
      documentName: 'Surat_Dokter_Klinik_Mitra.pdf',
      steps: [
        {
          title: 'Pengajuan Mandiri',
          person: 'Rian Pratama',
          time: '14 Feb, 07:30 WIB',
          status: 'COMPLETED',
        },
        {
          title: 'Atasan Langsung',
          person: 'Arya Wibowo (VP Eng)',
          time: '14 Feb, 08:15 WIB',
          status: 'COMPLETED',
        },
        {
          title: 'HR Operations',
          person: 'Dewi Lestari, S.Psi',
          time: '15 Feb, 10:00 WIB',
          status: 'COMPLETED',
        },
      ],
    },
    {
      id: 'req-03',
      refNo: 'LV-2025-0003',
      type: 'Cuti Bersama',
      title: 'Cuti Bersama Tahun Baru 2025',
      startDate: '02 Jan',
      endDate: '02 Jan 2025',
      durationDays: 1,
      handover: 'Sistem Terjadwal Otomatis',
      notes: 'Libur resmi cuti bersama nasional pergantian tahun kalender.',
      status: 'APPROVED',
      statusBadge: 'Otomatis Disetujui',
      submittedAt: '02 Jan 2025',
      completedAt: '02 Jan 2025',
      steps: [
        {
          title: 'Sistem Terjadwal',
          person: 'Master HRIS Nexora',
          time: '02 Jan, 00:00 WIB',
          status: 'COMPLETED',
        },
        {
          title: 'HR Operations',
          person: 'Dewi Lestari, S.Psi',
          time: '02 Jan, 08:00 WIB',
          status: 'COMPLETED',
        },
      ],
    },
  ]);

  // Cancel Pending Request
  const handleCancelPending = (id: string) => {
    const target = requests.find((r) => r.id === id);
    if (!target) return;

    if (window.confirm(`Yakin ingin membatalkan pengajuan "${target.title}"? Kuota cuti akan dikembalikan.`)) {
      setRequests(requests.filter((r) => r.id !== id));
      setBalances((prev) => ({
        ...prev,
        annualRemaining: prev.annualRemaining + target.durationDays,
        annualUsed: Math.max(0, prev.annualUsed - target.durationDays),
        pendingCount: Math.max(0, prev.pendingCount - 1),
      }));
      showToast(`✓ Pengajuan ${target.refNo} berhasil dibatalkan. Kuota ${target.durationDays} hari telah dikembalikan.`);
    }
  };

  // Submit New Leave Request
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStartDate || !formEndDate) {
      showToast('Harap tentukan tanggal mulai dan tanggal selesai.');
      return;
    }

    try {
      setIsSubmitting(true);
      const start = new Date(formStartDate);
      const end = new Date(formEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const newRefNo = `LV-2025-00${Math.floor(50 + Math.random() * 40)}`;
      const title = formTitle || `${formType}: Permohonan Pribadi`;

      const newReq: LeaveRequestItem = {
        id: `req-${Date.now()}`,
        refNo: newRefNo,
        type: formType,
        title,
        startDate: formStartDate,
        endDate: formEndDate,
        durationDays: diffDays,
        handover: formHandover || 'Nadia Wijaya',
        notes: formNotes || 'Pengajuan cuti operasional mandiri.',
        status: 'PENDING',
        statusBadge: 'Menunggu Verifikasi',
        submittedAt: 'Hari ini',
        steps: [
          {
            title: 'Pengajuan Mandiri',
            person: 'Rian Pratama',
            time: 'Hari ini, Baru saja',
            status: 'COMPLETED',
          },
          {
            title: 'Atasan Langsung',
            person: 'Arya Wibowo (VP Eng)',
            time: 'Menunggu Verifikasi',
            status: 'IN_PROGRESS',
          },
          {
            title: 'HR Operations',
            person: 'Dewi Lestari, S.Psi',
            time: 'Tahap Akhir',
            status: 'PENDING',
          },
        ],
      };

      setRequests([newReq, ...requests]);
      setBalances((prev) => ({
        ...prev,
        annualRemaining: Math.max(0, prev.annualRemaining - (formType === 'Cuti Tahunan' ? diffDays : 0)),
        annualUsed: prev.annualUsed + (formType === 'Cuti Tahunan' ? diffDays : 0),
        pendingCount: prev.pendingCount + 1,
      }));

      // Broadcast and notify HR Admin
      const remainingAfter = Math.max(0, balances.annualRemaining - (formType === 'Cuti Tahunan' ? diffDays : 0));
      await fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Rian Pratama, S.Kom',
          nik: 'NX-2021008',
          role: 'Lead Backend Architect • Technology',
          department: 'Technology & Engineering',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          type: 'cuti',
          leaveType: formType,
          typeCategory: formType.toLowerCase().includes('sakit') ? 'sakit' : 'tahunan',
          title: newReq.title,
          highlightType: newReq.type,
          detail: `${diffDays} Hari (${formStartDate} s/d ${formEndDate})`,
          startDate: formStartDate,
          endDate: formEndDate,
          durationDays: diffDays,
          remainingQuota: remainingAfter,
          totalQuota: 12,
          reason: newReq.notes || newReq.title || 'Keperluan Pribadi',
          quotaMeta: `Sisa Kuota: ${remainingAfter} Hari`,
        }),
      }).catch(() => {});

      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'NEW_APPROVAL_REQUEST', request: newReq });
        ch.close();
      } catch {}

      setIsApplyModalOpen(false);
      setFormTitle('');
      setFormStartDate('');
      setFormEndDate('');
      setFormNotes('');
      showToast('✓ Permohonan Cuti/Izin berhasil diajukan dan terhubung ke HR Admin secara real-time!');
    } catch {
      showToast('Gagal mengajukan cuti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items
  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'pending') return r.status === 'PENDING';
    if (activeFilter === 'approved') return r.status === 'APPROVED';
    if (searchQuery.trim()) {
      return (
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR matching screenshot */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 justify-between p-4 sm:p-5 sticky top-0 md:h-screen z-30 shadow-2xs">
        <div className="space-y-5">
          {/* Logo brand */}
          <Link href="/ess" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-blue-500/20 flex-shrink-0">
              <span className="text-white font-black tracking-tight">❖</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                Nexora <span className="text-blue-600 font-bold">HRIS</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 leading-tight">
                Portal Karyawan (ESS)
              </span>
            </div>
          </Link>

          {/* Active Session Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sesi Aktif: NX-2021008</span>
          </div>

          {/* SECTION 1: UTAMA */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              UTAMA
            </p>

            <Link
              href="/ess"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Beranda Saya</span>
            </Link>

            <Link
              href="/ess/attendance"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Presensi & Absensi</span>
            </Link>

            {/* Cuti & Izin Saya (ACTIVE matching screenshot) */}
            <Link
              href="/ess/leave"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-all"
            >
              <CalendarDays className="w-4 h-4 text-white" />
              <span>Cuti & Izin Saya</span>
            </Link>

            <Link
              href="/ess/payroll"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Slip Gaji & Kompensasi</span>
            </Link>
          </div>

          {/* SECTION 2: KARIR & PENGEMBANGAN */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              KARIR & PENGEMBANGAN
            </p>

            <Link
              href="/ess/performance"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span>Kinerja & KPI Pribadi</span>
            </Link>

            <Link
              href="/ess/training"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>Pelatihan & Modul</span>
            </Link>
          </div>

          {/* SECTION 3: DOKUMEN & BANTUAN */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              DOKUMEN & BANTUAN
            </p>

            <Link
              href="/ess/documents"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <FolderArchive className="w-4 h-4 text-slate-400" />
              <span>Arsip & Formulir</span>
            </Link>

            <button
              type="button"
              onClick={() => showToast('Kontak HR Helpdesk: Ext. 402 / helpdesk-hr@nexora.co.id')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <Headphones className="w-4 h-4 text-slate-400" />
              <span>Bantuan & Kontak HR</span>
            </button>
          </div>
        </div>

        {/* BOTTOM CARD: PUSAT DUKUNGAN */}
        <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Pusat Dukungan</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Ada kendala data kehadiran atau klaim?
          </p>
          <div className="pt-1 space-y-1 font-semibold text-[11px]">
            <a
              href="#sop"
              onClick={(e) => {
                e.preventDefault();
                setIsPkbModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>SOP Kepegawaian</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
            <a
              href="#tiket"
              onClick={(e) => {
                e.preventDefault();
                showToast('Membuka Tiket Bantuan HR...');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>Tiket Helpdesk HR</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR matching screenshot */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Search Input Box */}
          <div className="relative w-72 sm:w-96 max-w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu, slip gaji, atau dokumen pribadi..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Senin, 24 Maret 2025</span>
            </div>

            <NotificationBellDropdown portal="ess" />

            <Link
              href="/admin/profile"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                RP
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                    Rian Pratama, S.Kom
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[9px] font-bold text-slate-600">
                    Karyawan (ESS)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  Lead Backend Architect • NX-2021008
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER (Generous padding-bottom pb-28 to avoid ANY clipping!) */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto pb-28">
          {/* HEADER SECTION matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="space-y-1">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Link href="/ess" className="hover:text-blue-600 transition-colors">
                  Beranda Saya
                </Link>
                <span>&gt;</span>
                <span className="text-slate-800 font-bold">Cuti & Izin Saya</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Cuti & Izin Saya
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                Pantau kuota saldo cuti tahunan, ajukan permohonan izin baru, dan lacak status persetujuan atasan secara terpadu.
              </p>
            </div>

            {/* Top Right Action Buttons matching screenshot */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Unduh Riwayat (.pdf) */}
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Unduh Riwayat (.pdf)</span>
              </button>

              {/* + Ajukan Cuti/Izin Baru (Solid Blue) */}
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Ajukan Cuti/Izin Baru</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Saldo Cuti Tahunan */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  SALDO CUTI TAHUNAN
                </span>
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Umbrella className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {balances.annualRemaining}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">
                  / {balances.annualTotal} Hari Kuota
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${(balances.annualRemaining / balances.annualTotal) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Terpakai {balances.annualUsed} hari</span>
                <span className="text-rose-600 font-bold">Hangus 31 Des 2025</span>
              </div>
            </div>

            {/* Card 2: Cuti Bersama 2025 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  CUTI BERSAMA 2025
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {balances.jointHoliday}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">Hari Terjadwal</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full" />

              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">Kalender SKB 3 Menteri (Idul Fitri 1446 H)</span>
              </div>
            </div>

            {/* Card 3: Izin Sakit Terpakai */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  IZIN SAKIT TERPAKAI
                </span>
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {balances.sickUsed}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">Hari Terverifikasi</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full" />

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Surat Dokter Klinik Mitra divalidasi</span>
              </div>
            </div>

            {/* Card 4: Sedang Berjalan */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  SEDANG BERJALAN
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {balances.pendingCount}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">Permohonan Aktif</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full" />

              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                <span className="truncate">Menunggu Persetujuan Atasan Langsung</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: FILTER PILLS & SEARCH BAR matching screenshot */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Pengajuan
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === 'pending'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Menunggu Persetujuan
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('approved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === 'approved'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Disetujui
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari catatan..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* SECTION 3: 2-COLUMN CONTENT (LEFT 8 COLS, RIGHT 4 COLS) matching screenshot with full unclipped elements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS): LEAVE CARDS WITH STEPPER */}
            <div className="lg:col-span-8 space-y-5">
              {filteredRequests.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-slate-200/90 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Tidak ada pengajuan ditemukan</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Tidak ada riwayat cuti atau izin yang sesuai dengan filter yang dipilih saat ini.
                  </p>
                </div>
              ) : (
                filteredRequests.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5 relative overflow-hidden transition-all ${
                      item.status === 'PENDING'
                        ? 'border-l-4 border-l-amber-500'
                        : 'border-l-4 border-l-emerald-500'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                            item.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          }`}
                        >
                          {item.statusBadge}
                        </span>

                        <span className="font-semibold text-slate-500">
                          No. Ref: <strong className="text-slate-700 font-mono">{item.refNo}</strong>
                        </span>

                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium">
                          Diajukan: {item.submittedAt}
                        </span>
                        {item.completedAt && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700 font-medium">
                              Selesai: {item.completedAt}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Right Action: Batalkan or Attachment link */}
                      <div className="flex items-center gap-2">
                        {item.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleCancelPending(item.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
                          >
                            Batalkan Pengajuan
                          </button>
                        )}

                        {item.documentName && (
                          <button
                            type="button"
                            onClick={() => setPreviewDocName(item.documentName || null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
                            title="Buka lampiran surat dokter"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{item.documentName}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title & Details */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {item.startDate} - {item.endDate} ({item.durationDays} Hari Kerja)
                          </span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>
                          Pengganti Tugas: <strong className="text-slate-800">{item.handover}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Catatan Pemohon Box matching screenshot */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                      <p className="text-[11px] font-bold text-slate-700">Catatan Pemohon:</p>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{item.notes}"
                      </p>
                    </div>

                    {/* ALUR VERIFIKASI BERTINGKAT (Horizontal Stepper matching screenshot) */}
                    <div className="space-y-2.5 pt-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        ALUR VERIFIKASI BERTINGKAT
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {item.steps.map((st, idx) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                              st.status === 'COMPLETED'
                                ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900'
                                : st.status === 'IN_PROGRESS'
                                ? 'bg-amber-50/50 border-amber-200/80 text-amber-900'
                                : 'bg-slate-50/50 border-slate-200/80 text-slate-500'
                            }`}
                          >
                            {/* Step Icon */}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                                st.status === 'COMPLETED'
                                  ? 'bg-emerald-600 text-white'
                                  : st.status === 'IN_PROGRESS'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {st.status === 'COMPLETED' ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : st.status === 'IN_PROGRESS' ? (
                                <Clock3 className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </div>

                            {/* Step Text */}
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight truncate text-slate-900">
                                {st.title}
                              </p>
                              <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                                {st.person}
                              </p>
                              {st.time && (
                                <p
                                  className={`text-[10px] mt-0.5 font-semibold ${
                                    st.status === 'IN_PROGRESS'
                                      ? 'text-amber-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {st.time}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* RIGHT COLUMN (4 COLS): ROSTER TIM & PANDUAN PKB (Full unclipped content!) */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* CARD 1: ROSTER TIM ENGINEERING matching screenshot */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Roster Tim Engineering
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Hari Ini</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Status kehadiran rekan squad Core Architecture untuk sinkronisasi beban kerja.
                    </p>
                  </div>
                </div>

                {/* Squad Members List matching screenshot */}
                <div className="space-y-3">
                  {/* Nadia Wijaya */}
                  <div className="flex items-center justify-between gap-2.5 py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        NW
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Nadia Wijaya</p>
                        <p className="text-[10px] text-slate-400 truncate">Senior Backend Go</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                      WFO (Pusat)
                    </span>
                  </div>

                  {/* Dimas Surya */}
                  <div className="flex items-center justify-between gap-2.5 py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        DS
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Dimas Surya</p>
                        <p className="text-[10px] text-slate-400 truncate">DevOps Specialist</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                      WFH (Remote)
                    </span>
                  </div>

                  {/* Farhan Harahap */}
                  <div className="flex items-center justify-between gap-2.5 py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        FH
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Farhan Harahap</p>
                        <p className="text-[10px] text-slate-400 truncate">Database Admin</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                      Sakit (1 Hari)
                    </span>
                  </div>
                </div>

                {/* Footer Coverage & Link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Sprint Backlog Coverage: <strong className="text-slate-800">92%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRosterModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                  >
                    <span>Lihat Kalender Tim</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: PANDUAN HAK CUTI (PKB NEXORA) (Fully unclipped with generous bottom space!) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    @
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Panduan Hak Cuti (PKB Nexora)
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Ketentuan hak istimewa cuti berbayar sesuai Perjanjian Kerja Bersama periode 2024-2026:
                </p>

                {/* Complete Unclipped Checklist Items */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Cuti Tahunan:</strong> 12 hari/tahun kalender, hak timbul setelah 1 tahun masa bakti.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Cuti Khusus Menikah:</strong> 3 hari kerja penuh (melampirkan undangan/akta).
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Cuti Duka Cita:</strong> 2 hari kerja untuk anggota keluarga inti sedarah.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Izin Sakit:</strong> Wajib melampirkan surat dokter klinik resmi maksimal 1x24 jam.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Cuti Melahirkan / Istri Melahirkan:</strong> 3 bulan untuk karyawan wanita, 2 hari untuk karyawan pria.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Delegasi Handover:</strong> Wajib menunjuk rekan selevel sebelum tanggal cuti dimulai.
                    </span>
                  </div>
                </div>

                {/* Footer Download Link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setIsPkbModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                  >
                    <span>Unduh Dokumen PKB Lengkap (PDF)</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-semibold">Versi 2.4</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: FORM PENGAJUAN CUTI / IZIN BARU */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Ajukan Permohonan Cuti / Izin Baru
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sisa Hak Cuti Tahunan: {balances.annualRemaining} Hari Aktif
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Permohonan</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Potong Saldo 12 Hari)</option>
                  <option value="Izin Sakit">Izin Sakit (Lampiran Surat Dokter)</option>
                  <option value="Cuti Menikah">Cuti Menikah (3 Hari Penuh)</option>
                  <option value="Cuti Duka Cita">Cuti Duka Cita (2 Hari Keluarga Inti)</option>
                  <option value="Izin Urusan Pribadi">Izin Urusan Pribadi Mendadak</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul / Keperluan Cuti</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Cuti Tahunan: Mudik Lebaran Idul Fitri"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Penerima Delegasi Pekerjaan (Handover)
                </label>
                <input
                  type="text"
                  required
                  value={formHandover}
                  onChange={(e) => setFormHandover(e.target.value)}
                  placeholder="Nama rekan kerja handover..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / Rencana Pekerjaan Selama Cuti
                </label>
                <textarea
                  rows={3}
                  required
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Jelaskan detail rencana izin, handover tugas, dan kontak darurat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirimkan...</span>
                    </>
                  ) : (
                    <span>Kirim Pengajuan Cuti</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UNDUH RIWAYAT CUTI (.PDF) */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Unduh Riwayat Cuti &amp; Izin
                  </h3>
                  <p className="text-[11px] text-slate-400">Format Resmi HRD Ber-QR Code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
              <p className="font-bold text-slate-800">Ringkasan Dokumen:</p>
              <ul className="space-y-1 text-slate-600">
                <li>• Karyawan: <strong>Rian Pratama, S.Kom (NX-2021008)</strong></li>
                <li>• Periode: <strong>Tahun Anggaran 2025</strong></li>
                <li>• Total Kuota: <strong>12 Hari</strong> (Sisa: 8 Hari)</li>
                <li>• Riwayat Terlampir: <strong>3 Catatan Permohonan</strong></li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDownloadModalOpen(false);
                  showToast('✓ Laporan Riwayat Cuti (.pdf) berhasil diunduh!');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PREVIEW LAMPIRAN SURAT DOKTER */}
      {previewDocName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Lampiran Dokumen Resmi
                  </h3>
                  <p className="text-[11px] text-slate-400">{previewDocName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocName(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{previewDocName}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Surat Keterangan Istirahat Sakit • Klinik Mitra Sehat SCBD (Dr. Hendra Gunawan, Sp.PD)
                </p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  ✓ Tervalidasi Resmi oleh Tim HR Operations Nexora
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewDocName(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DOKUMEN PKB LENGKAP */}
      {isPkbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  @
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Perjanjian Kerja Bersama (PKB) Nexora 2024-2026
                  </h3>
                  <p className="text-[11px] text-slate-400">Regulasi Resmi Hak Kepegawaian &amp; Cuti</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPkbModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 space-y-3">
              <p className="font-bold text-slate-900">Bab IV: Waktu Kerja, Istirahat, dan Cuti Karyawan</p>
              <p>
                1. Setiap karyawan yang telah bekerja terus-menerus selama 12 bulan berhak atas Cuti Tahunan sebanyak 12 (dua belas) hari kerja dengan tetap menerima upah penuh.
              </p>
              <p>
                2. Karyawan yang sakit berhak atas izin sakit berbayar dengan melampirkan surat keterangan dokter dari fasilitas kesehatan resmi.
              </p>
              <p>
                3. Cuti khusus diberikan untuk keperluan penting keluarga: pernikahan karyawan (3 hari), khitanan/baptis anak (2 hari), kematian keluarga inti (2 hari).
              </p>
              <p>
                4. Kuota cuti tahunan yang belum digunakan akan kedaluwarsa pada tanggal 31 Desember tahun berjalan kecuali terdapat persetujuan tertulis dari Direksi.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsPkbModalOpen(false);
                  showToast('✓ Salinan Dokumen PKB Lengkap (.pdf) berhasil diunduh!');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Salinan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ROSTER LENGKAP TIM */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Kalender Roster Tim Engineering
                  </h3>
                  <p className="text-[11px] text-slate-400">Squad Core Architecture &amp; Platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Nadia Wijaya</p>
                  <p className="text-[10px] text-slate-400">Senior Backend Go</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  WFO (SCBD)
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Dimas Surya</p>
                  <p className="text-[10px] text-slate-400">DevOps Specialist</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  WFH (Remote)
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Farhan Harahap</p>
                  <p className="text-[10px] text-slate-400">Database Admin</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Sakit (1 Hari)
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
