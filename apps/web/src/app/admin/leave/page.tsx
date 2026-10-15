'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  CalendarCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Building2,
  FileText,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
  Download,
  Plus,
  Plane,
  PieChart,
  RefreshCw,
  Grid,
  ChevronDown,
  Paperclip,
  MoreVertical,
  Info,
  ShieldCheck,
  FileSpreadsheet,
  HeartPulse,
  Heart,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  name: string;
  nik: string;
  role: string;
  department: string;
  avatarUrl: string;
  leaveType: 'Cuti Tahunan' | 'Cuti Sakit (Rawat Jalan)' | 'Cuti Khusus (Menikah)' | 'Cuti Melahirkan' | 'Dispensasi Khusus';
  typeCategory: 'tahunan' | 'sakit' | 'khusus';
  startDate: string;
  endDate: string;
  durationDays: number;
  remainingQuota: number;
  totalQuota: number;
  reason: string;
  documentName?: string;
  documentUrl?: string;
  status: 'PENDING_SPV' | 'PENDING_HRD' | 'APPROVED' | 'REJECTED';
  submittedDate: string;
}

export default function AdminLeavePage() {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [filterStatusPill, setFilterStatusPill] = useState<string>('ALL');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Bulan Ini: Mar');
  const [selectedDept, setSelectedDept] = useState('Semua Departemen');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mock Dataset matching screenshot
  const [requests, setRequests] = useState<LeaveRequest[]>([
    {
      id: 'req-01',
      name: 'Budi Santoso',
      nik: 'NX-201944',
      role: 'Senior UI Designer',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      leaveType: 'Cuti Tahunan',
      typeCategory: 'tahunan',
      startDate: '26 Mar 2025',
      endDate: '28 Mar 2025',
      durationDays: 3,
      remainingQuota: 9,
      totalQuota: 12,
      reason: 'Acara keluarga di kampung halaman',
      status: 'PENDING_HRD',
      submittedDate: '24 Mar 2025, 08:30',
    },
    {
      id: 'req-02',
      name: 'Siti Rahmawati',
      nik: 'NX-202105',
      role: 'Talent Acquisition',
      department: 'People Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      leaveType: 'Cuti Sakit (Rawat Jalan)',
      typeCategory: 'sakit',
      startDate: '24 Mar 2025',
      endDate: '25 Mar 2025',
      durationDays: 2,
      remainingQuota: 12,
      totalQuota: 12,
      reason: 'Demam berdarah tahap awal - istirahat klinik',
      documentName: 'SKD_Klinik_Medika.pdf',
      documentUrl: '#',
      status: 'PENDING_HRD',
      submittedDate: '24 Mar 2025, 07:15',
    },
    {
      id: 'req-03',
      name: 'Dimas Aditya',
      nik: 'NX-202219',
      role: 'Backend Engineer',
      department: 'Technology & IT',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      leaveType: 'Cuti Khusus (Menikah)',
      typeCategory: 'khusus',
      startDate: '07 Apr 2025',
      endDate: '09 Apr 2025',
      durationDays: 3,
      remainingQuota: 12,
      totalQuota: 12,
      reason: 'Pernikahan pribadi di Bandung (Hak Cuti Khusus PKB)',
      documentName: 'Undangan_Pernikahan.pdf',
      documentUrl: '#',
      status: 'PENDING_SPV',
      submittedDate: '23 Mar 2025, 16:40',
    },
    {
      id: 'req-04',
      name: 'Dewi Lestari, S.Psi',
      nik: 'NX-201804',
      role: 'HR Operations Manager',
      department: 'People Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      leaveType: 'Cuti Tahunan',
      typeCategory: 'tahunan',
      startDate: '14 Apr 2025',
      endDate: '16 Apr 2025',
      durationDays: 3,
      remainingQuota: 8,
      totalQuota: 12,
      reason: 'Istirahat cuti tahunan pertengahan tahun',
      status: 'APPROVED',
      submittedDate: '20 Mar 2025, 11:20',
    },
    {
      id: 'req-05',
      name: 'Ahmad Rizki',
      nik: 'NX-202302',
      role: 'Field Logistics Officer',
      department: 'Logistik & Hub',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      leaveType: 'Cuti Sakit (Rawat Jalan)',
      typeCategory: 'sakit',
      startDate: '24 Mar 2025',
      endDate: '24 Mar 2025',
      durationDays: 1,
      remainingQuota: 10,
      totalQuota: 12,
      reason: 'Flu berat & radang tenggorokan',
      documentName: 'Surat_Dokter_Puskesmas.pdf',
      documentUrl: '#',
      status: 'APPROVED',
      submittedDate: '24 Mar 2025, 06:45',
    },
  ]);

  // Form State for Manual Submission Modal
  const [manualForm, setManualForm] = useState({
    employeeName: 'Budi Santoso (NX-201944)',
    leaveType: 'Cuti Tahunan',
    startDate: '2025-04-02',
    endDate: '2025-04-04',
    reason: '',
  });

  // Filtered Requests Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Tab filter
      if (activeTab === 'PENDING' && !r.status.startsWith('PENDING')) return false;
      if (activeTab === 'APPROVED' && r.status !== 'APPROVED') return false;
      if (activeTab === 'REJECTED' && r.status !== 'REJECTED') return false;

      // Status pill filter
      if (filterStatusPill === 'PENDING_SPV' && r.status !== 'PENDING_SPV') return false;
      if (filterStatusPill === 'PENDING_HRD' && r.status !== 'PENDING_HRD') return false;
      if (filterStatusPill === 'APPROVED' && r.status !== 'APPROVED') return false;
      if (filterStatusPill === 'HAS_DOC' && !r.documentName) return false;

      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = r.name.toLowerCase().includes(query);
        const matchNik = r.nik.toLowerCase().includes(query);
        const matchDept = r.department.toLowerCase().includes(query);
        if (!matchName && !matchNik && !matchDept) return false;
      }

      return true;
    });
  }, [requests, activeTab, filterStatusPill, searchTerm]);

  // Approval Handlers
  const handleApprove = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
    );
    showToast(`Permohonan cuti ${name} telah berhasil disetujui!`, 'success');
  };

  const handleReject = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
    );
    showToast(`Permohonan cuti ${name} telah ditolak.`, 'info');
  };

  // Export to Excel handler
  const handleExportExcel = () => {
    showToast('Mengunduh Laporan Rekapitulasi Cuti & Izin (.xlsx)...', 'info');
    setTimeout(() => {
      const csvHeader = 'NIK,NAMA KARYAWAN,DEPARTEMEN,JENIS CUTI,TANGGAL MULAI,TANGGAL SELESAI,DURASI HARI,SISA KUOTA,STATUS\n';
      const csvRows = requests
        .map(
          (r) =>
            `"${r.nik}","${r.name}","${r.department}","${r.leaveType}","${r.startDate}","${r.endDate}",${r.durationDays},${r.remainingQuota},"${r.status}"`
        )
        .join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rekap_Cuti_Karyawan_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Laporan cuti & izin berhasil diunduh!');
    }, 600);
  };

  // Submit Manual Leave
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: LeaveRequest = {
      id: `req-${Date.now()}`,
      name: manualForm.employeeName.split(' (')[0],
      nik: manualForm.employeeName.match(/\((.*?)\)/)?.[1] || 'NX-202500',
      role: 'Staff Anggota',
      department: 'Operasional',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      leaveType: manualForm.leaveType as any,
      typeCategory: manualForm.leaveType.includes('Sakit') ? 'sakit' : 'tahunan',
      startDate: manualForm.startDate,
      endDate: manualForm.endDate,
      durationDays: 3,
      remainingQuota: 9,
      totalQuota: 12,
      reason: manualForm.reason || 'Pengajuan manual oleh HR Operations',
      status: 'APPROVED',
      submittedDate: 'Hari Ini, Barusan',
    };

    setRequests([newReq, ...requests]);
    setIsManualModalOpen(false);
    showToast(`Pengajuan cuti manual untuk ${newReq.name} berhasil disimpan dan disetujui!`);
  };

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb with Integrated Workflow Badge */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors uppercase tracking-wider text-[11px]">
            UTAMA
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">
            MANAJEMEN CUTI &amp; IZIN
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>SISTEM WORKFLOW TERPADU</span>
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Manajemen Cuti &amp; Izin
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Kelola permohonan cuti tahunan, izin sakit, dispensasi khusus, serta pantau sisa kuota hak
              cuti karyawan secara akurat dan transparan.
            </p>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Kebijakan & Kuota Cuti */}
            <Link
              href="/admin/leave/policy"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all hover:border-blue-400 hover:text-blue-600"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Kebijakan &amp; Kuota Cuti</span>
            </Link>

            {/* Ekspor Rekap (.xlsx) */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor Rekap (.xlsx)</span>
            </button>

            {/* Ajukan Cuti Manual */}
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Ajukan Cuti Manual</span>
            </button>
          </div>
        </div>

        {/* 4 Core Metric Cards (Exact match to screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: PERMOHONAN MENUNGGU */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PERMOHONAN MENUNGGU
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">14</span>
              <span className="text-sm font-semibold text-slate-700">Pengajuan</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('PENDING');
                  setFilterStatusPill('PENDING_HRD');
                }}
                className="w-full flex items-center justify-between text-xs font-semibold text-amber-800 bg-amber-50/70 hover:bg-amber-100/70 px-3 py-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>8 Perlu Tindakan Segera</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: SEDANG CUTI HARI INI */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                SEDANG CUTI HARI INI
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">26</span>
              <span className="text-sm font-semibold text-slate-700">Karyawan</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <span>16 Tahunan • 7 Sakit • 3 Dispensasi</span>
            </div>
          </div>

          {/* Card 3: TINGKAT UTILISASI KUOTA */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TINGKAT UTILISASI KUOTA
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">42.8%</span>
              <span className="text-xs text-slate-500 font-medium">(Rata-rata 5.1/12 hari)</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Kuartal 1 2025 Normal</span>
              </div>
              <span className="text-slate-500 text-[11px]">Sisa: 6.9 Hari/Karyawan</span>
            </div>
          </div>

          {/* Card 4: KLAIM IZIN SAKIT BULAN INI */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                KLAIM IZIN SAKIT BULAN INI
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">18</span>
              <span className="text-sm font-semibold text-slate-700">Kasus Tercatat</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>100% Terverifikasi SKD</span>
              </div>
              <span className="text-slate-400 text-[11px]">0 Kasus Tanpa Bukti</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Filter (Under Top Metrics) */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Daftar Pengajuan (Semua)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
                148
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'PENDING'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Menunggu Persetujuan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                14
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('APPROVED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Telah Disetujui</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200 text-emerald-800 font-bold">
                122
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REJECTED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'REJECTED'
                  ? 'bg-rose-100 text-rose-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Ditolak / Batal</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-600 font-bold">
                12
              </span>
            </button>
          </div>

          {/* Quick Icons Right */}
          <div className="flex items-center gap-1.5 px-2">
            <button
              onClick={() => showToast('Memuat ulang antrean cuti...')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Segarkan Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast('Mengganti mode tampilan tabel')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Pengaturan Kolom"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Quick Filter Pills */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3.5">
          {/* Top Inputs row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Nama Karyawan, NIK..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Bulan Dropdown */}
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white cursor-pointer"
              >
                <option value="Bulan Ini: Mar">Bulan Ini: Mar</option>
                <option value="Bulan Lalu: Feb">Bulan Lalu: Feb</option>
                <option value="Januari 2025">Januari 2025</option>
                <option value="Semua Periode">Semua Periode</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Departemen Dropdown */}
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white cursor-pointer"
              >
                <option value="Semua Departemen">Semua Departemen</option>
                <option value="Product Design">Product Design</option>
                <option value="Technology & IT">Technology &amp; IT</option>
                <option value="People Operations">People Operations</option>
                <option value="Logistik & Hub">Logistik &amp; Hub</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Lainnya */}
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select className="w-full appearance-none pl-9 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white cursor-pointer">
                <option value="Semua Tipe">Semua Tipe Cuti</option>
                <option value="Tahunan">Cuti Tahunan</option>
                <option value="Sakit">Izin Sakit (SKD)</option>
                <option value="Khusus">Cuti Khusus</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Filter Pills Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                FILTER CEPAT:
              </span>

              <button
                type="button"
                onClick={() => setFilterStatusPill('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterStatusPill === 'ALL'
                    ? 'bg-[#1D4ED8] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Semua Status
              </button>

              <button
                type="button"
                onClick={() => setFilterStatusPill('PENDING_SPV')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatusPill === 'PENDING_SPV'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pending SPV
              </button>

              <button
                type="button"
                onClick={() => setFilterStatusPill('PENDING_HRD')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatusPill === 'PENDING_HRD'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pending HRD
              </button>

              <button
                type="button"
                onClick={() => setFilterStatusPill('APPROVED')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatusPill === 'APPROVED'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Disetujui HRD
              </button>

              <button
                type="button"
                onClick={() => setFilterStatusPill('HAS_DOC')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatusPill === 'HAS_DOC'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Perlu Dokumen
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterStatusPill('ALL');
                setActiveTab('ALL');
                showToast('Filter berhasil direset');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        {/* Main Two-Column Layout: Table Left, Calendar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Table of Leave Requests (8 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                          onChange={() => {
                            if (selectedIds.length === filteredRequests.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filteredRequests.map((r) => r.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="py-3 px-3">KARYAWAN &amp; DIVISI</th>
                      <th className="py-3 px-3">JENIS CUTI &amp; PERIODE</th>
                      <th className="py-3 px-3 text-center">DURASI</th>
                      <th className="py-3 px-3">SISA KUOTA</th>
                      <th className="py-3 px-3">DOKUMEN / ALASAN</th>
                      <th className="py-3 px-3 text-right">AKSI</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Tidak ada pengajuan cuti yang sesuai dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Checkbox */}
                          <td className="py-3.5 px-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(req.id)}
                              onChange={() =>
                                setSelectedIds((prev) =>
                                  prev.includes(req.id)
                                    ? prev.filter((i) => i !== req.id)
                                    : [...prev, req.id]
                                )
                              }
                              className="rounded border-slate-300 text-blue-600"
                            />
                          </td>

                          {/* Karyawan & Divisi */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5 min-w-[170px]">
                              <img
                                src={req.avatarUrl}
                                alt={req.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 leading-tight truncate">
                                  {req.name}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {req.role} • <span className="font-mono text-slate-500">{req.nik}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Jenis Cuti & Periode */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5 min-w-[150px]">
                              <span
                                className={`font-bold block text-xs ${
                                  req.typeCategory === 'sakit'
                                    ? 'text-amber-700'
                                    : req.typeCategory === 'khusus'
                                    ? 'text-purple-700'
                                    : 'text-blue-700'
                                }`}
                              >
                                {req.leaveType}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{req.startDate} - {req.endDate}</span>
                              </div>
                            </div>
                          </td>

                          {/* Durasi */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                              {req.durationDays} Hari
                            </span>
                          </td>

                          {/* Sisa Kuota */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div>
                              <p className="font-bold text-slate-900">{req.remainingQuota} Hari</p>
                              <p className="text-[10px] text-slate-400">
                                {req.typeCategory === 'sakit' ? 'Tidak potong saldo' : `dari ${req.totalQuota} hari`}
                              </p>
                            </div>
                          </td>

                          {/* Dokumen & Alasan */}
                          <td className="py-3.5 px-3 max-w-[200px]">
                            <p className="text-[11px] text-slate-600 truncate italic">
                              "{req.reason}"
                            </p>
                            {req.documentName && (
                              <button
                                type="button"
                                onClick={() => setSelectedDocPreview(req.documentName || null)}
                                className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/70 px-1.5 py-0.5 rounded hover:bg-rose-100 transition-colors"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[130px]">{req.documentName}</span>
                              </button>
                            )}
                          </td>

                          {/* Aksi Setujui / Tolak */}
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            {req.status === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                <Check className="w-3 h-3" />
                                Disetujui
                              </span>
                            ) : req.status === 'REJECTED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                                <X className="w-3 h-3" />
                                Ditolak
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(req.id, req.name)}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95"
                                  title="Setujui Cuti"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(req.id, req.name)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-xs transition-transform active:scale-95"
                                  title="Tolak Cuti"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Kalender Cuti & Absen Hari Ini (4 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: Kalender Cuti Departemen */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Kalender Cuti Departemen
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-lg">
                  Maret 2025
                </span>
              </div>

              {/* Mini Calendar Grid (Matching screenshot days: Sen, Sel, Rab, Kam, Jum, Sab, Min) */}
              <div className="space-y-2 text-center text-xs">
                <div className="grid grid-cols-7 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span className="text-rose-500">Sab</span>
                  <span className="text-rose-500">Min</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold text-slate-700">
                  <span className="p-1.5 text-slate-300">24</span>
                  <span className="p-1.5 text-slate-300">25</span>
                  <span className="p-1.5 text-slate-300">26</span>
                  <span className="p-1.5 text-slate-300">27</span>
                  <span className="p-1.5 text-slate-300">28</span>
                  <span className="p-1.5 text-rose-300">1</span>
                  <span className="p-1.5 text-rose-300">2</span>

                  <span className="p-1.5">3</span>
                  <span className="p-1.5">4</span>
                  <span className="p-1.5">5</span>
                  <span className="p-1.5">6</span>
                  <span className="p-1.5">7</span>
                  <span className="p-1.5 text-rose-500">8</span>
                  <span className="p-1.5 text-rose-500">9</span>

                  <span className="p-1.5">10</span>
                  <span className="p-1.5">11</span>
                  <span className="p-1.5">12</span>
                  <span className="p-1.5">13</span>
                  <span className="p-1.5">14</span>
                  <span className="p-1.5 text-rose-500">15</span>
                  <span className="p-1.5 text-rose-500">16</span>

                  <span className="p-1.5">17</span>
                  <span className="p-1.5">18</span>
                  <span className="p-1.5">19</span>
                  <span className="p-1.5">20</span>
                  <span className="p-1.5">21</span>
                  <span className="p-1.5 text-rose-500">22</span>
                  <span className="p-1.5 text-rose-500">23</span>

                  {/* Highlighted Row (24 - 28 Mar) */}
                  <span className="p-1.5 rounded-full bg-[#1D4ED8] text-white font-bold shadow-xs">
                    24
                  </span>
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold">25</span>
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold">26</span>
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold">27</span>
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700 font-bold">28</span>
                  <span className="p-1.5 text-rose-500 font-bold">29</span>
                  <span className="p-1.5 text-rose-500 font-bold">30</span>
                </div>
              </div>

              {/* Sub-section: ABSEN HARI INI (4 DARI 26) */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                    ABSEN HARI INI (4 DARI 26)
                  </span>
                  <button
                    onClick={() => showToast('Membuka daftar 26 karyawan cuti hari ini')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Rina Utami */}
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                        alt="Rina"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">Rina Utami</p>
                        <p className="text-[10px] text-slate-400">Marketing Growth</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Sakit
                      </span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Balik: 26 Mar</p>
                    </div>
                  </div>

                  {/* Fajar Nugraha */}
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150"
                        alt="Fajar"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">Fajar Nugraha</p>
                        <p className="text-[10px] text-slate-400">Backend Eng.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Tahunan
                      </span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Balik: 27 Mar</p>
                    </div>
                  </div>

                  {/* Kevin Pratama */}
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150"
                        alt="Kevin"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">Kevin Pratama</p>
                        <p className="text-[10px] text-slate-400">Logistik Hub</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        Dispensasi
                      </span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Balik: Besok</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Aturan Kebijakan Cuti */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">Aturan Kebijakan Cuti</h4>
                </div>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sistem otomatis memvalidasi pengajuan sesuai UU Ketenagakerjaan &amp; PKB Perusahaan.
                Cuti &gt; 2 hari kerja wajib persetujuan 2 tingkat (SPV + HRD).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Ajukan Cuti Manual (HR Direct Entry) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Formulir Input Cuti Manual (Mandat HR)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Input darurat untuk karyawan lapangan atau cuti dispensasi khusus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Karyawan *
                </label>
                <select
                  value={manualForm.employeeName}
                  onChange={(e) => setManualForm({ ...manualForm, employeeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Budi Santoso (NX-201944)">Budi Santoso — Product Design (NX-201944)</option>
                  <option value="Siti Rahmawati (NX-202105)">Siti Rahmawati — HR (NX-202105)</option>
                  <option value="Dimas Aditya (NX-202219)">Dimas Aditya — IT (NX-202219)</option>
                  <option value="Ahmad Rizki (NX-202302)">Ahmad Rizki — Logistik (NX-202302)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jenis Cuti / Izin *
                </label>
                <select
                  value={manualForm.leaveType}
                  onChange={(e) => setManualForm({ ...manualForm, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Potong Saldo Kuota)</option>
                  <option value="Cuti Sakit (Rawat Jalan)">Cuti Sakit Rawat Jalan (Wajib SKD)</option>
                  <option value="Cuti Khusus (Menikah)">Cuti Khusus Menikah (3 Hari Bebas Kuota)</option>
                  <option value="Dispensasi Khusus">Dispensasi Khusus Kantor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={manualForm.startDate}
                    onChange={(e) => setManualForm({ ...manualForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={manualForm.endDate}
                    onChange={(e) => setManualForm({ ...manualForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alasan &amp; Keterangan Pendukung
                </label>
                <textarea
                  rows={3}
                  value={manualForm.reason}
                  onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })}
                  placeholder="Tuliskan keterangan keperluan cuti / izin..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Simpan &amp; Sahkan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Kebijakan & Kuota Cuti */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Parameter Kebijakan &amp; Batas Kuota Cuti Perusahaan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800">Hak Cuti Tahunan Standar</span>
                <p className="text-slate-500">
                  12 hari kerja per tahun kalender untuk setiap karyawan tetap (PKWTT) dan PKWT setelah masa kerja 12 bulan.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Ketentuan Surat Dokter (SKD)</span>
                <p className="text-slate-500">
                  Izin sakit tanpa pemotongan saldo kuota wajib melampirkan file SKD resmi dari klinik atau rumah sakit berlisensi maksimal 2x24 jam sejak hari pertama absen.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Aturan Persetujuan Berjenjang</span>
                <p className="text-slate-500">
                  Cuti 1-2 hari cukup disetujui atasan divisi (SPV). Cuti 3 hari atau lebih otomatis memerlukan verifikasi ganda dari tim HR Operations.
                </p>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Tutup Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Dokumen Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pratinjau Dokumen Lampiran
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">{selectedDocPreview}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <p><strong>Status:</strong> Terverifikasi &amp; Sah</p>
              <p><strong>Diterbitkan oleh:</strong> Klinik Medika Pratama SCBD</p>
              <p><strong>Keterangan:</strong> Istirahat rawat jalan 2 hari</p>
            </div>
            <button
              onClick={() => setSelectedDocPreview(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
