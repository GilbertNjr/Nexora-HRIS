'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import { downloadExecutiveRecapPDF } from '@/utils/generateExecutiveRecapPDF';
import {
  Users,
  CalendarCheck,
  CreditCard,
  Bell,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Check,
  X,
  Download,
  Calendar,
  ChevronDown,
  History,
  FileCheck,
  ExternalLink,
  Plus,
  TrendingUp,
  UserPlus,
  Send,
  Building2,
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  name: string;
  role: string;
  type: 'cuti' | 'lembur';
  title: string;
  highlightType: string;
  detail: string;
  quotaMeta?: string;
  timestamp: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  verifiedBy?: string;
  estimatedCost?: string;
  avatarColor: string;
  initials: string;
  verifiedBadge: 'check' | 'alert' | 'bolt';
}

export default function AdminDashboardPage() {
  // State for interactive features
  const [activeFilter, setActiveFilter] = useState<'all' | 'cuti' | 'lembur'>('all');
  const [selectedMonth, setSelectedMonth] = useState('Maret 2025');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null);
  const [isDownloadingRecap, setIsDownloadingRecap] = useState(false);

  // Direct Executive PDF Download Handler
  const handleDownloadExecutiveRecap = () => {
    setIsDownloadingRecap(true);
    setToastMessage(`Menyiapkan Rekap Eksekutif SDM (${selectedMonth})...`);

    setTimeout(() => {
      try {
        downloadExecutiveRecapPDF({
          period: selectedMonth,
          totalEmployees: metrics.totalEmployees,
          attendanceRate: metrics.attendanceRate,
          onTimeCount: metrics.onTimeCount,
          lateCount: metrics.lateCount,
          leaveCount: metrics.leaveCount,
          estimatedPayroll: `${metrics.estimatedPayroll} Miliar`,
          departments: departments,
          preparedBy: 'Dewi Lestari, S.Psi (HR Operations Manager)',
          printedAt: `${new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}, ${new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })} WIB`,
        });
        setToastMessage(`Laporan Rekap Eksekutif (${selectedMonth}) berhasil diunduh!`);
      } catch (err) {
        console.error('Failed to download executive PDF:', err);
        setToastMessage('Gagal mengunduh dokumen PDF. Silakan coba kembali.');
      } finally {
        setIsDownloadingRecap(false);
      }
    }, 450);
  };

  // Dynamic approval list state
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: 'req-01',
      name: 'Budi Santoso',
      role: 'Senior UI Designer • Product',
      type: 'cuti',
      title: 'Pengajuan Cuti Tahunan (3 Hari: 26 - 28 Mar 2025)',
      highlightType: 'Cuti Tahunan',
      detail: '3 Hari: 26 - 28 Mar 2025',
      quotaMeta: 'Sisa Kuota: 9 Hari',
      timestamp: 'Diajukan: 2 jam lalu',
      avatarColor: 'from-blue-600 to-indigo-600',
      initials: 'BS',
      verifiedBadge: 'check',
    },
    {
      id: 'req-02',
      name: 'Siti Rahmawati',
      role: 'Talent Acquisition Specialist',
      type: 'cuti',
      title: 'Pengajuan Cuti Sakit — 1 Hari (24 Mar 2025)',
      highlightType: 'Cuti Sakit',
      detail: '1 Hari (24 Mar 2025)',
      hasAttachment: true,
      attachmentName: 'Surat_Dokter_Klinik.pdf (Terlampir)',
      timestamp: 'Diajukan: 07:45 WIB',
      avatarColor: 'from-amber-500 to-rose-500',
      initials: 'SR',
      verifiedBadge: 'alert',
    },
    {
      id: 'req-03',
      name: 'Dimas Aditya',
      role: 'Backend Engineer • Tech',
      type: 'lembur',
      title: 'Klaim Lembur Akhir Pekan (4 Jam • Deployment Server Core)',
      highlightType: 'Lembur Akhir Pekan',
      detail: '4 Jam • Deployment Server Core',
      estimatedCost: 'Total Taksiran: Rp 320.000',
      verifiedBy: 'Disetujui Tech Lead: Ya',
      timestamp: 'Diajukan: Kemarin',
      avatarColor: 'from-emerald-500 to-teal-700',
      initials: 'DA',
      verifiedBadge: 'bolt',
    },
  ]);

  // Dynamic Metrics State
  const [metrics, setMetrics] = useState({
    totalEmployees: 1248,
    attendanceRate: 96.4,
    onTimeCount: 1203,
    lateCount: 28,
    leaveCount: 17,
    pendingApprovals: 12,
    pendingLeave: 8,
    pendingOvertime: 4,
    estimatedPayroll: 'Rp 3.84',
  });

  // Department distribution dataset
  const departments = [
    { name: 'Teknologi & Produk', count: 412, percentage: 33, barColor: 'bg-blue-600' },
    { name: 'Operasional & Logistik', count: 310, percentage: 25, barColor: 'bg-indigo-600' },
    { name: 'Pemasaran & Penjualan', count: 285, percentage: 23, barColor: 'bg-sky-500' },
    { name: 'Keuangan & HR', count: 141, percentage: 11, barColor: 'bg-blue-400' },
    { name: 'Legal & Kepatuhan', count: 100, percentage: 8, barColor: 'bg-slate-700' },
  ];

  // System audit activities
  const recentActivities = [
    {
      id: 'act-01',
      title: 'Perpanjangan Kontrak Karyawan',
      description: 'Kontrak kerja Ahmad Rizki diperpanjang 1 tahun oleh Bu Dewi Lestari.',
      time: '18 menit yang lalu',
      dotColor: 'bg-blue-600',
    },
    {
      id: 'act-02',
      title: 'Onboarding Magang Gelombang I',
      description: '3 akun karyawan magang divisi Desain berhasil diaktivasi dan mendapat kredensial SSO.',
      time: '1 jam yang lalu',
      dotColor: 'bg-emerald-500',
    },
    {
      id: 'act-03',
      title: 'Sinkronisasi Mesin Presensi',
      description: 'Log 1.203 data tap-in pagi berhasil disinkronkan ke database server tanpa anomali.',
      time: '2 jam yang lalu',
      dotColor: 'bg-purple-600',
    },
  ];

  // Try live fetch on mount (with silent mock fallback)
  useEffect(() => {
    const fetchLiveMetrics = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/v1/employees?limit=1', {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.meta?.total) {
            setMetrics((prev) => ({
              ...prev,
              totalEmployees: json.data.meta.total,
            }));
          }
        }
      } catch (err) {
        // Keep resilient fallback
      }
    };
    fetchLiveMetrics();
  }, []);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handle Approve Action
  const handleApprove = (id: string, name: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setMetrics((prev) => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
    }));
    showToast(`✓ Permohonan ${name} telah berhasil disetujui.`);
  };

  // Handle Reject Action
  const handleReject = (id: string, name: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setMetrics((prev) => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
    }));
    showToast(`✕ Permohonan ${name} telah ditolak.`);
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'cuti') return r.type === 'cuti';
    if (activeFilter === 'lembur') return r.type === 'lembur';
    return true;
  });

  return (
    <AdminLayoutSkeleton onQuickAction={() => setIsQuickActionModalOpen(true)}>
      {/* Toast Notification Notification Box */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* ========================================================= */}
        {/* TOP WELCOME BANNER & DATE FILTER CONTROLS */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-[11px] font-semibold text-indigo-700 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Sistem Sinkronisasi Real-Time • v2.4 Enterprise</span>
            </div>

            {/* Greeting Headline */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-2">
              <span>Selamat Pagi, Bu Dewi!</span>
              <span className="inline-block transform hover:rotate-12 transition-transform cursor-default">
                👋
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Berikut ringkasan aktivitas tenaga kerja dan permohonan yang memerlukan persetujuan hari ini, 24 Maret 2025.
            </p>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Month Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-sm transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Bulan Ini: {selectedMonth}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {isMonthDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                  {['Maret 2025', 'Februari 2025', 'Januari 2025'].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setIsMonthDropdownOpen(false);
                        showToast(`Menampilkan ringkasan data periode ${m}`);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${
                        selectedMonth === m ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Executive PDF Direct Download Button */}
            <button
              type="button"
              onClick={handleDownloadExecutiveRecap}
              disabled={isDownloadingRecap}
              className="h-10 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all transform active:scale-95 disabled:opacity-75 cursor-pointer"
              title="Klik untuk langsung mengunduh Rekap Eksekutif PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingRecap ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingRecap ? 'Mengunduh PDF...' : 'Unduh Rekap Eksekutif (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4 CORE KPI SUMMARY CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Karyawan Aktif */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  TOTAL KARYAWAN AKTIF
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {metrics.totalEmployees.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-medium text-slate-400">Orang</span>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <TrendingUp className="w-3 h-3" />
                  +14 Baru
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Retensi 98.2%
                </span>
              </div>
            </div>

            {/* Bottom Color Indicator Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-full" />
            </div>
          </div>

          {/* Card 2: Tingkat Kehadiran Hari Ini */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  TINGKAT KEHADIRAN HARI INI
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {metrics.attendanceRate}%
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Optimal
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2.5 text-[10px] font-medium text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 text-slate-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {metrics.onTimeCount} Tepat Waktu
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {metrics.lateCount} Telat
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {metrics.leaveCount} Izin
                </span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 flex overflow-hidden gap-0.5">
              <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '92%' }} />
              <div className="h-full bg-amber-500" style={{ width: '5%' }} />
              <div className="h-full bg-rose-500 rounded-r-full" style={{ width: '3%' }} />
            </div>
          </div>

          {/* Card 3: Perlu Persetujuan */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  PERLU PERSETUJUAN
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {metrics.pendingApprovals}
                </span>
                <span className="text-xs font-semibold text-amber-600">
                  Pengajuan Tertunda
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  {metrics.pendingLeave} Cuti
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  {metrics.pendingOvertime} Klaim Lembur
                </span>
              </div>
            </div>

            {/* Bottom Color Indicator Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-full" />
            </div>
          </div>

          {/* Card 4: Estimasi Payroll */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  ESTIMASI PAYROLL MARET
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {metrics.estimatedPayroll}
                </span>
                <span className="text-xs font-medium text-slate-400">Miliar</span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  <Clock className="w-3 h-3 text-blue-600" />
                  Cut-off: 25 Mar
                </span>
                <span>Besok pkl 23:59</span>
              </div>
            </div>

            {/* Progress Bar towards cut-off */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-[88%]" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LOWER SECTION: TWO-COLUMN MAIN WORKSPACE */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ======================================================= */}
          {/* LEFT COLUMN: PERSETUJUAN TERTUNDA (7 OF 12 COLS) */}
          {/* ======================================================= */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] leading-tight">
                    Persetujuan Tertunda
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aksi peninjauan mandat HRD hari ini
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeFilter === 'all'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Semua ({requests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('cuti')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeFilter === 'cuti'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Cuti ({requests.filter((r) => r.type === 'cuti').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('lembur')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeFilter === 'lembur'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Klaim Lembur ({requests.filter((r) => r.type === 'lembur').length})
                  </button>
                </div>
              </div>

              {/* Approval List Cards */}
              <div className="divide-y divide-slate-100">
                {filteredRequests.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-bold text-slate-700">Semua Pengajuan Telah Ditinjau</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tidak ada permohonan tertunda pada kategori ini.
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-2.5 rounded-xl transition-colors"
                    >
                      {/* Left: Avatar & Meta */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Avatar with status badge */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${req.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                          >
                            {req.initials}
                          </div>
                          {req.verifiedBadge === 'check' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] border-2 border-white">
                              ✓
                            </div>
                          )}
                          {req.verifiedBadge === 'alert' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] border-2 border-white font-bold">
                              !
                            </div>
                          )}
                          {req.verifiedBadge === 'bolt' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] border-2 border-white font-bold">
                              ⚡
                            </div>
                          )}
                        </div>

                        {/* Text Information */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#0F172A] truncate">
                              {req.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium truncate">
                            {req.role}
                          </p>

                          {/* Request Title */}
                          <p className="text-xs text-slate-700 mt-1 font-medium">
                            Pengajuan{' '}
                            <strong className="font-bold text-[#0F172A]">
                              {req.highlightType}
                            </strong>{' '}
                            ({req.detail})
                          </p>

                          {/* Contextual Badges */}
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-slate-500">
                            {req.quotaMeta && (
                              <span className="flex items-center gap-1 font-medium text-slate-600">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {req.quotaMeta}
                              </span>
                            )}
                            {req.hasAttachment && (
                              <button
                                type="button"
                                onClick={() => setPreviewAttachment(req.attachmentName || 'Surat_Dokter_Klinik.pdf')}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 underline font-semibold"
                              >
                                <FileText className="w-3 h-3" />
                                {req.attachmentName}
                              </button>
                            )}
                            {req.estimatedCost && (
                              <span className="font-semibold text-slate-700">
                                {req.estimatedCost}
                              </span>
                            )}
                            {req.verifiedBy && (
                              <span className="text-emerald-700 font-semibold">
                                • {req.verifiedBy}
                              </span>
                            )}
                            <span className="text-slate-400">• {req.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Decision Buttons */}
                      <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApprove(req.id, req.name)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>

                        {req.hasAttachment ? (
                          <button
                            type="button"
                            onClick={() => setPreviewAttachment(req.attachmentName || 'Surat_Dokter_Klinik.pdf')}
                            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Tinjau</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReject(req.id, req.name)}
                            className="px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5 text-rose-500" />
                            <span>Tolak</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Link to Full Leave Approval Page */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                href="/admin/leave"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>Lihat Semua 12 Permohonan Menunggu</span>
                <span className="text-sm">→</span>
              </Link>
            </div>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN: DISTRIBUTION & RECENT AUDIT (5 OF 12 COLS)*/}
          {/* ======================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Widget 1: Distribusi Karyawan per Divisi */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
                    Distribusi Karyawan
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Alokasi headcount per divisi
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                  5 Divisi
                </span>
              </div>

              {/* Progress Bars */}
              <div className="mt-4 space-y-3.5">
                {departments.map((dept, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span className="text-slate-800">{dept.name}</span>
                      <span className="text-slate-600 font-mono">
                        {dept.count}{' '}
                        <span className="text-slate-400 font-normal">({dept.percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${dept.barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Aktivitas Terbaru Sistem (Audit Log Mini) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
                    Aktivitas Terbaru Sistem
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Log audit pergerakan HR & sinkronisasi
                  </p>
                </div>
                <History className="w-4 h-4 text-slate-400" />
              </div>

              {/* Activity Timeline List */}
              <div className="mt-4 space-y-4">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full ${act.dotColor} mt-1.5 flex-shrink-0`} />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        {act.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* QUICK ACTION MODAL (+ Tambah Baru) */}
      {/* ========================================================= */}
      {isQuickActionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Aksi Cepat Manajemen HR</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickActionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Pilih tindakan administratif yang ingin Anda lakukan segera:
            </p>

            <div className="mt-4 space-y-2.5">
              <Link
                href="/admin/employees"
                onClick={() => setIsQuickActionModalOpen(false)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                    Tambah Pegawai Baru
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Input data master karyawan, departemen, dan gaji pokok.
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/admin/leave"
                onClick={() => setIsQuickActionModalOpen(false)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center gap-3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    Tinjau Antrean Cuti
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Verifikasi permohonan libur, izin, dan surat dokter.
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </Link>

              <Link
                href="/admin/payroll"
                onClick={() => setIsQuickActionModalOpen(false)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center gap-3 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                    Proses Penggajian Periode Ini
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Hitung potongan alpa & terbitkan slip gaji resmi.
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ATTACHMENT PREVIEW MODAL (Tinjau Berkas Dokter) */}
      {/* ========================================================= */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 truncate">
                  {previewAttachment}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Medical Certificate Container */}
            <div className="my-5 p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                PDF
              </div>
              <p className="text-xs font-bold text-slate-800">Surat Keterangan Sakit Klinik Sehat</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Pasien: <strong>Siti Rahmawati</strong> • Dokter Pemeriksa: Dr. Hendra Gunawan, Sp.PD
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Diagnosis: Febris H-1 • Rekomendasi Istirahat: 24 Maret 2025 (1 Hari)
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                Dokumen Asli Terverifikasi (Digital Signature Valid)
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApprove('req-02', 'Siti Rahmawati');
                  setPreviewAttachment(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                ✓ Setujui Permohonan Cuti
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
