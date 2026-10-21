'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  LayoutDashboard,
  User,
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
  Lock,
  Mail,
  Download,
  ShieldCheck,
  Building2,
  TrendingDown,
  Sparkles,
  HelpCircle,
  ChevronDown,
  X,
  FileText,
  Printer,
  Check,
  AlertCircle,
  ExternalLink,
  Share2,
  KeyRound,
  MinusCircle,
  Fingerprint,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

interface PayrollPeriodData {
  periodKey: string;
  periodLabel: string;
  isLatest: boolean;
  takeHomePay: number;
  grossSalary: number;
  totalDeductions: number;
  allowancesAndOvertime: number;
  transferBank: string;
  accountNumberMasked: string;
  transferDate: string;
  earnings: {
    title: string;
    description: string;
    amount: number;
    badge?: string;
  }[];
  deductions: {
    title: string;
    description: string;
    amount: number;
    badge?: string;
    isZero?: boolean;
  }[];
}

const PAYROLL_PERIODS: Record<string, PayrollPeriodData> = {
  '2025-02': {
    periodKey: '2025-02',
    periodLabel: 'Februari 2025 (Terbaru)',
    isLatest: true,
    takeHomePay: 27842500,
    grossSalary: 31250000,
    totalDeductions: 3407500,
    allowancesAndOvertime: 2750000,
    transferBank: 'Bank Central Asia (BCA)',
    accountNumberMasked: '8820****823',
    transferDate: '28 Februari 2025, 08:30 WIB',
    earnings: [
      {
        title: 'Gaji Pokok (Base Salary)',
        description: 'Tingkat Jabatan: Senior Specialist / Lead Band 4',
        amount: 28500000,
      },
      {
        title: 'Tunjangan Jabatan & Keahlian',
        description: 'Lead Backend Architecture Specialist Allowance',
        amount: 1500000,
      },
      {
        title: 'Tunjangan Komunikasi & Fasilitas Kerja',
        description: 'Subsidi Internet & Paket Mobilitas WFH / WFO Hybrid',
        amount: 750000,
      },
      {
        title: 'Kompensasi On-Call Standby & Lembur',
        description: 'Maintenance Core Switch Migrasi Cloud (8 Jam Terverifikasi)',
        amount: 500000,
        badge: 'SPL: #SPL-0225-88',
      },
    ],
    deductions: [
      {
        title: 'PPh 21 (Skema Tarif Efektif Rata-rata / TER)',
        description: 'Sesuai PP No. 58/2023 & PMK-168/2023 (Status: Kawin 1 Tanggungan)',
        amount: 1845000,
        badge: 'Kategori TER A • PTKP K/1',
      },
      {
        title: 'BPJS Ketenagakerjaan - JHT (2,0%)',
        description: 'Jaminan Hari Tua porsi karyawan dari Gaji Pokok',
        amount: 570000,
      },
      {
        title: 'BPJS Ketenagakerjaan - Jaminan Pensiun (1,0%)',
        description: 'Sesuai batas pagu maksimal upah JP nasional',
        amount: 100423,
      },
      {
        title: 'BPJS Kesehatan (1,0%)',
        description: 'Iuran perlindungan jaminan kesehatan nasional batas atas',
        amount: 120000,
      },
      {
        title: 'Potongan Kehadiran / Unpaid Leave',
        description: 'Tingkat Disiplin Presensi 100% (Tanpa pemotongan)',
        amount: 0,
        isZero: true,
      },
      {
        title: 'Iuran Koperasi Karyawan & Simpanan Wajib',
        description: 'Simpanan wajib bulanan & dana program gotong-royong kesejahteraan',
        amount: 772077,
      },
    ],
  },
  '2025-01': {
    periodKey: '2025-01',
    periodLabel: 'Januari 2025',
    isLatest: false,
    takeHomePay: 27542500,
    grossSalary: 30950000,
    totalDeductions: 3407500,
    allowancesAndOvertime: 2450000,
    transferBank: 'Bank Central Asia (BCA)',
    accountNumberMasked: '8820****823',
    transferDate: '28 Januari 2025, 08:30 WIB',
    earnings: [
      {
        title: 'Gaji Pokok (Base Salary)',
        description: 'Tingkat Jabatan: Senior Specialist / Lead Band 4',
        amount: 28500000,
      },
      {
        title: 'Tunjangan Jabatan & Keahlian',
        description: 'Lead Backend Architecture Specialist Allowance',
        amount: 1500000,
      },
      {
        title: 'Tunjangan Komunikasi & Fasilitas Kerja',
        description: 'Subsidi Internet & Paket Mobilitas WFH / WFO Hybrid',
        amount: 750000,
      },
      {
        title: 'Kompensasi On-Call Standby & Lembur',
        description: 'Security Patching Cluster DB V1',
        amount: 200000,
        badge: 'SPL: #SPL-0125-14',
      },
    ],
    deductions: [
      {
        title: 'PPh 21 (Skema Tarif Efektif Rata-rata / TER)',
        description: 'Sesuai PP No. 58/2023 & PMK-168/2023 (Status: Kawin 1 Tanggungan)',
        amount: 1845000,
        badge: 'Kategori TER A • PTKP K/1',
      },
      {
        title: 'BPJS Ketenagakerjaan - JHT (2,0%)',
        description: 'Jaminan Hari Tua porsi karyawan dari Gaji Pokok',
        amount: 570000,
      },
      {
        title: 'BPJS Ketenagakerjaan - Jaminan Pensiun (1,0%)',
        description: 'Sesuai batas pagu maksimal upah JP nasional',
        amount: 100423,
      },
      {
        title: 'BPJS Kesehatan (1,0%)',
        description: 'Iuran perlindungan jaminan kesehatan nasional batas atas',
        amount: 120000,
      },
      {
        title: 'Potongan Kehadiran / Unpaid Leave',
        description: 'Tingkat Disiplin Presensi 100% (Tanpa pemotongan)',
        amount: 0,
        isZero: true,
      },
      {
        title: 'Iuran Koperasi Karyawan & Simpanan Wajib',
        description: 'Simpanan wajib bulanan & dana program gotong-royong kesejahteraan',
        amount: 772077,
      },
    ],
  },
};

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function EssPayrollPage() {
  const { user: currentUser } = useCurrentUser();
  const { isSidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2025-02');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  // Modals state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentData = PAYROLL_PERIODS[selectedPeriod] || PAYROLL_PERIODS['2025-02'];

  const handlePrintSlip = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR with Collapse/Expand (Matching HR Admin) */}
      <EmployeeSidebar
        activeMenu="payroll"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onShowToast={showToast}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR matching screenshot */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Left: Desktop Toggle Button & Search Input Box */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
            {/* Desktop Sidebar Toggle Button (Matching HR Admin) */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
              title={isSidebarCollapsed ? 'Buka Sidebar' : 'Ciutkan Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5 text-slate-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-600" />
              )}
            </button>

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
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col text-[11px] leading-tight text-left">
                <span className="font-bold text-slate-800">Senin, 24</span>
                <span className="text-slate-500 font-medium">Maret 2025</span>
              </div>
            </div>

            <NotificationBellDropdown portal="ess" />

            <Link
              href="/karyawan/profile"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                {currentUser.initials}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                    {currentUser.fullName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[9px] font-bold text-slate-600">
                    Karyawan (ESS)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  {currentUser.designation} • {currentUser.employeeNumber}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER (Generous bottom padding pb-36 to prevent ANY cut-off!) */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto pb-36">
          {/* HEADER SECTION matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="space-y-1.5">
              {/* Breadcrumb matching screenshot */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Link href="/karyawan" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Portal Karyawan (ESS)</span>
                </Link>
                <span>&gt;</span>
                <span className="text-blue-600 font-bold">Slip Gaji &amp; Kompensasi</span>
              </div>

              {/* Title & Encryption Pill matching screenshot */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Slip Gaji &amp; Rincian Kompensasi
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/90">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>Terenkripsi AES-256</span>
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Akses riwayat penggajian terenkripsi, rincian take-home pay, bukti potong PPh 21 (TER), dan benefit korporat Anda secara transparan dan aman.
              </p>
            </div>

            {/* Top Right Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Period Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all"
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{currentData.periodLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {isPeriodDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95">
                    {Object.values(PAYROLL_PERIODS).map((item) => (
                      <button
                        key={item.periodKey}
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(item.periodKey);
                          setIsPeriodDropdownOpen(false);
                          showToast(`Memuat data slip gaji periode ${item.periodLabel}`);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          selectedPeriod === item.periodKey
                            ? 'font-bold text-blue-600 bg-blue-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>{item.periodLabel}</span>
                        {selectedPeriod === item.periodKey && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Kirim ke Email Button */}
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Kirim ke Email</span>
              </button>

              {/* Unduh PDF Resmi (Solid Blue Button) */}
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF Resmi</span>
              </button>
            </div>
          </div>

          {/* PRIVACY & COMPLIANCE BANNER matching screenshot */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Kepatuhan Privasi &amp; Standar Perlindungan Data
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    ISO/IEC 27001 • UU PDP No. 27/2022
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                  Dokumen ini bersifat <strong className="text-slate-900 font-bold">SANGAT RAHASIA (Strictly Confidential)</strong>. Kata sandi default pembuka berkas PDF resmi adalah <strong className="text-slate-900 font-bold">6 digit tanggal lahir (DDMMYY)</strong> digabung dengan <strong className="text-slate-900 font-bold">4 digit terakhir NIK</strong> Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0 text-xs">
              <span className="text-slate-500 font-medium">PIN Master: <strong className="text-slate-800 font-bold">Aktif</strong></span>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className="font-bold text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2"
              >
                Ganti Kata Sandi
              </button>
            </div>
          </div>

          {/* SUMMARY ROW: 4 CARDS (TAKE HOME PAY HERO + 3 STAT CARDS) matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Card 1: GAJI BERSIH DITERIMA HERO CARD (~5 cols on lg) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    GAJI BERSIH DITERIMA (TAKE-HOME PAY)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Lunas &amp; Terverifikasi HR Operations</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-blue-700 tracking-tight">
                    {formatRupiah(currentData.takeHomePay)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  / Siklus {currentData.periodKey === '2025-02' ? 'Februari 2025' : 'Januari 2025'}
                </p>
              </div>

              {/* Transfer Details Bottom */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Ditransfer via <strong className="text-slate-900 font-bold">{currentData.transferBank}</strong> • No. Rek. <strong className="text-slate-900 font-bold">{currentData.accountNumberMasked}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentData.transferDate}
                </span>
              </div>
            </div>

            {/* Card 2: Penerimaan Kotor (~2.3 cols on lg) */}
            <div className="lg:col-span-2 sm:col-span-1 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Penerimaan Kotor</span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {formatRupiah(currentData.grossSalary)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Termasuk tunjangan &amp; lembur
              </p>
            </div>

            {/* Card 3: Total Potongan (~2.3 cols on lg) */}
            <div className="lg:col-span-2 sm:col-span-1 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Potongan</span>
                <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                  <MinusCircle className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-xl font-black text-rose-600 tracking-tight">
                  -{formatRupiah(currentData.totalDeductions)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                PPh 21, BPJS &amp; Koperasi
              </p>
            </div>

            {/* Card 4: Tunjangan & Lembur (~2.4 cols on lg) */}
            <div className="lg:col-span-3 sm:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Tunjangan &amp; Lembur</span>
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  +{formatRupiah(currentData.allowancesAndOvertime)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Kehadiran &amp; On-Call 8 jam
              </p>
            </div>
          </div>

          {/* TWO-COLUMN DETAILED BREAKDOWN: PENERIMAAN (LEFT) vs POTONGAN (RIGHT) matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* LEFT COLUMN: PENERIMAAN & PENDAPATAN (4 Komponen) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Penerimaan &amp; Pendapatan
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rincian Komponen Gaji Bruto (Earnings)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                  {currentData.earnings.length} Komponen
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {currentData.earnings.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{item.description}</p>
                    </div>

                    <div className="text-right sm:self-center flex-shrink-0">
                      <span className="text-sm font-black font-mono text-slate-900">
                        {formatRupiah(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Total Penerimaan Kotor (Gross):</span>
                <span className="text-base font-black font-mono text-slate-900">
                  {formatRupiah(currentData.grossSalary)}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: POTONGAN RESMI & KEWAJIBAN PAJAK (6 Komponen, FULLY UNCLIPPED!) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Potongan Resmi &amp; Kewajiban Pajak
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rincian Penahanan Pajak &amp; Asuransi (Deductions)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                  {currentData.deductions.length} Komponen
                </span>
              </div>

              {/* Items List (All 6 items fully unclipped!) */}
              <div className="space-y-4">
                {currentData.deductions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{item.description}</p>
                    </div>

                    <div className="text-right sm:self-center flex-shrink-0">
                      <span
                        className={`text-sm font-black font-mono ${
                          item.isZero ? 'text-slate-900' : 'text-rose-600'
                        }`}
                      >
                        {item.isZero ? 'Rp 0' : formatRupiah(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">Total Potongan Resmi (Deductions):</span>
                <span className="text-base font-black font-mono text-rose-600">
                  -{formatRupiah(currentData.totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* NET SALARY EQUATION & SECURITY VALIDATION CARD */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Formula Perhitungan Penggajian (Nett Calculation)
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base font-mono">
                <span className="text-slate-300">Penerimaan Kotor ({formatRupiah(currentData.grossSalary)})</span>
                <span className="text-rose-400 font-bold">-</span>
                <span className="text-rose-300">Potongan ({formatRupiah(currentData.totalDeductions)})</span>
                <span className="text-emerald-400 font-bold">=</span>
                <span className="text-emerald-400 font-black text-lg sm:text-xl">
                  Take-Home Pay ({formatRupiah(currentData.takeHomePay)})
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Dokumen ini sah, dicetak secara elektronik dan terdaftar pada sistem Payroll Engine Nexora HRIS.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Unduh Bukti Potong</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: UNDUH PDF RESMI */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Berkas Slip Gaji Digital Resmi (PDF)
                  </h3>
                  <p className="text-[11px] text-slate-400">Periode {currentData.periodLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official PDF Document Preview Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">PT NEXORA DIGITAL NUSANTARA</h4>
                  <p className="text-[10px] text-slate-500">Pacific Century Tower Lt. 7, SCBD Jakarta Selatan</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  TERVERIFIKASI
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Nama Karyawan:</span>
                  <p className="font-bold text-slate-900">{currentUser.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">NIK / Employee ID:</span>
                  <p className="font-bold text-slate-900">{currentUser.employeeNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Jabatan / Divisi:</span>
                  <p className="font-bold text-slate-900">{currentUser.designation}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Take-Home Pay:</span>
                  <p className="font-black text-blue-700 font-mono">{formatRupiah(currentData.takeHomePay)}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Berkas ini dilindungi enkripsi sandi PDF (Tanggal Lahir DDMMYY + 4 digit NIK).</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPdfModalOpen(false);
                  showToast('✓ Berkas PDF Slip Gaji resmi berhasil diunduh ke perangkat Anda.');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: KIRIM KE EMAIL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Kirim Slip Gaji ke Email Terdaftar
                  </h3>
                  <p className="text-[11px] text-slate-400">Pengiriman dokumen aman berenkripsi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Karyawan Penerima</label>
                <input
                  type="email"
                  disabled
                  value="rian.pratama@nexora.co.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Periode Slip Gaji</label>
                <input
                  type="text"
                  disabled
                  value={currentData.periodLabel}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Catatan Keamanan:</p>
                <p>Dokumen PDF terenkripsi AES-256 akan dikirimkan otomatis sebagai lampiran terlindungi kata sandi.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  showToast('✓ Berkas slip gaji resmi telah dikirim ke rian.pratama@nexora.co.id');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>Kirim Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GANTI KATA SANDI / PIN MASTER */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pengaturan Sandi Berkas Slip Gaji
                  </h3>
                  <p className="text-[11px] text-slate-400">Kepatuhan UU PDP No. 27/2022</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sandi Default Sistem</label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[11px]">
                  [DDMMYY Tanggal Lahir] + [4 Digit Terakhir NIK]
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kustomisasi PIN Baru (Opsional 6 Digit)</label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Masukkan 6 angka PIN kustom..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPinModalOpen(false);
                  showToast('✓ Pengaturan kata sandi slip gaji berhasil diperbarui.');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Simpan PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
