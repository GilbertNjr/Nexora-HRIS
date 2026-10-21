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
  PlusCircle,
  Info,
  Fingerprint,
  Star,
  CheckSquare,
  PieChart,
  Video,
  Play,
  Award,
  Users,
  Target,
  FileCheck,
  MessageSquare,
  Edit3,
  BookmarkCheck,
  ArrowRight,
  Activity,
  UserCheck,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

interface OkrItem {
  id: string;
  category: 'teknikal' | 'operasional' | 'budaya';
  categoryLabel: string;
  weight: number;
  progressPercent: number;
  tag: string;
  selfRating: number;
  title: string;
  targetMetric: string;
  commentary: string;
  isDraft?: boolean;
}

export default function EssPerformancePage() {
  const { user: currentUser } = useCurrentUser();
  const { isCollapsed: isSidebarCollapsed, toggle: toggleSidebar } = useSidebarCollapse();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'teknikal' | 'operasional' | 'budaya'>('all');

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPastCycleModalOpen, setIsPastCycleModalOpen] = useState(false);
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [isRisalahModalOpen, setIsRisalahModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable commentary for Draft OKR 4
  const [draftCommentary, setDraftCommentary] = useState(
    'Telah menyelesaikan 4 dari 6 sesi tech-talk arsitektur backend. 2 junior engineer (Rizky & Amanda) telah berhasil memimpin deployment mandiri tanpa kendala.',
  );
  const [draftRating, setDraftRating] = useState('4.7');
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const okrList: OkrItem[] = [
    {
      id: 'okr-1',
      category: 'teknikal',
      categoryLabel: 'Teknikal & Arsitektur',
      weight: 25,
      progressPercent: 95,
      tag: 'Arsitektur Core',
      selfRating: 4.9,
      title: 'Migrasi Arsitektur Microservices Cloud Core Engine ke Kubernetes GKE',
      targetMetric:
        'Target Metrik: Latency response time < 80ms dan zero downtime saat release payroll bulanan pada jam beban puncak.',
      commentary:
        'Migrasi 14 microservices selesai sesuai roadmap Q1. Latency API turun rata-rata 32%, load test 50.000 concurrent user stabil tanpa packet drop.',
    },
    {
      id: 'okr-2',
      category: 'teknikal',
      categoryLabel: 'Teknikal & Arsitektur',
      weight: 25,
      progressPercent: 100,
      tag: 'Security & Compliance',
      selfRating: 5.0,
      title: 'Implementasi Enkripsi AES-256 & Audit Trail RFC-5424 Keamanan Data Karyawan',
      targetMetric:
        'Target Metrik: Kepatuhan 100% terhadap regulasi UU PDP No. 27/2022 dan lulus security audit ISO 27001.',
      commentary:
        'Modul kriptografi data rest & transit rampung diimplementasikan dengan zero vulnerability pada penetration testing berkala.',
    },
    {
      id: 'okr-3',
      category: 'operasional',
      categoryLabel: 'Efisiensi Operasional',
      weight: 30,
      progressPercent: 90,
      tag: 'FinOps & Database',
      selfRating: 4.8,
      title: 'Optimasi Kueri Payroll Engine & Reduksi Biaya Komputasi Cloud (FinOps)',
      targetMetric:
        'Target Metrik: Mempercepat proses kalkulasi payroll bulanan dari 45 menit menjadi < 15 menit serta efisiensi tagihan server 18%.',
      commentary:
        'Optimasi partisi tabel database dan query indexing berhasil memangkas runtime komputasi payroll hingga 68% lebih cepat.',
    },
    {
      id: 'okr-4',
      category: 'budaya',
      categoryLabel: 'Kepemimpinan & Budaya',
      weight: 20,
      progressPercent: 75,
      tag: 'Mentorship & Talent',
      selfRating: parseFloat(draftRating) || 4.7,
      title: 'Mentoring Rekayasa Perangkat Lunak & Knowledge Sharing Squad Backend',
      targetMetric:
        'Target Metrik: Mengadakan 6 sesi tech-talk arsitektur dan membimbing 3 junior backend engineers menuju kemandirian on-call.',
      commentary: draftCommentary,
      isDraft: !isDraftSaved,
    },
  ];

  const filteredOkrs = okrList.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
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

      {/* LEFT SIDEBAR with Collapse/Expand (Matching HR Admin) */}
      <EmployeeSidebar
        activeMenu="performance"
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
                  <span>Beranda Saya</span>
                </Link>
                <span>/</span>
                <span>Karir &amp; Pengembangan</span>
                <span>/</span>
                <span className="text-slate-800 font-bold">Kinerja &amp; KPI Pribadi</span>
              </div>

              {/* Title matching screenshot */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Evaluasi Kinerja &amp; KPI Pribadi
              </h1>

              {/* Status Pill on its own line matching screenshot */}
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Siklus Aktif: Q1 2025 (Sedang Berjalan — Tahap Self-Appraisal)</span>
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Pantau progres sasaran kuartalan, lengkapi penilaian mandiri, dan kelola rencana pengembangan profesional.
              </p>
            </div>

            {/* Top Right Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Riwayat Siklus Lalu (.pdf) Button */}
              <button
                type="button"
                onClick={() => setIsPastCycleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Riwayat Siklus Lalu (.pdf)</span>
              </button>

              {/* Kirim Self-Appraisal Sekarang (Solid Blue Button) */}
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Kirim Self-Appraisal Sekarang</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: SKOR CAPAIAN SEMENTARA */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  SKOR CAPAIAN SEMENTARA
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-blue-600" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-700 tracking-tight">4.85</span>
                <span className="text-slate-400 font-bold text-lg">/ 5.0</span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Sangat Baik (Exceeds)
                </span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <span>📈 +0.15 YoY</span>
                </span>
              </div>

              {/* Solid blue accent bar at bottom matching design */}
              <div className="pt-0.5">
                <div className="w-28 h-1 bg-blue-600 rounded-full" />
              </div>
            </div>

            {/* Card 2: STATUS EVALUASI DIRI */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  STATUS EVALUASI DIRI
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">75%</span>
                <span className="text-slate-500 font-bold text-xs">Terisi</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                3 dari 4 Sasaran Strategis telah dinilai secara mandiri.
              </p>

              <div className="flex items-center justify-between text-[11px] font-semibold text-rose-600 pt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Tenggat: 31 Maret 2025</span>
                </span>
                <span className="font-bold text-amber-700">1 Draft Tersisa</span>
              </div>
            </div>

            {/* Card 3: BOBOT TERKALIBRASI */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  BOBOT TERKALIBRASI
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">100%</span>
                <span className="text-slate-500 font-bold text-xs">Total Bobot</span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-600 font-medium">
                <span className="truncate">● OKR Tim: 40%</span>
                <span className="truncate">● Operasional: 35%</span>
                <span className="truncate">● Budaya: 15%</span>
                <span className="truncate">● Peer: 10%</span>
              </div>

              {/* Segmented color bar */}
              <div className="pt-0.5">
                <div className="w-full grid grid-cols-4 gap-1 h-1">
                  <div className="bg-blue-600 rounded-full h-full" />
                  <div className="bg-emerald-500 rounded-full h-full" />
                  <div className="bg-amber-500 rounded-full h-full" />
                  <div className="bg-purple-500 rounded-full h-full" />
                </div>
              </div>
            </div>

            {/* Card 4: JADWAL SESI 1-ON-1 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  JADWAL SESI 1-ON-1
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  03 April 2025
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Tatap muka daring bersama Arya Wibowo, M.Sc (VP Engineering).
              </p>

              <div className="flex items-center justify-between pt-0.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Google Meet Terkonfirmasi
                </span>
                <button
                  type="button"
                  onClick={() => setIsMeetModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS): ALUR LINIMASA & RINCIAN SASARAN KINERJA (OKR) */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION A: Alur & Linimasa Penilaian Siklus Q1 2025 matching screenshot */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Alur &amp; Linimasa Penilaian Siklus Q1 2025
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Status Global: <strong className="text-blue-600">Sedang Berlangsung</strong>
                  </span>
                </div>

                {/* 4 Steps Timeline Grid matching screenshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {/* Step 1: Self-Appraisal (Active) */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                        1
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Batas: 31 Mar</span>
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-900">Self-Appraisal</p>
                    <p className="text-[11px] text-slate-500">Pengisian Mandiri</p>
                  </div>

                  {/* Step 2: Review Atasan */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <p className="text-xs font-bold text-slate-900">Review Atasan</p>
                    <p className="text-[11px] text-slate-500">1-on-1 dgn Arya W.</p>
                    <p className="text-[10px] text-slate-400">03 - 07 Apr 2025</p>
                  </div>

                  {/* Step 3: Kalibrasi HR */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <p className="text-xs font-bold text-slate-900">Kalibrasi HR</p>
                    <p className="text-[11px] text-slate-500">Komite &amp; C-Level</p>
                    <p className="text-[10px] text-slate-400">10 - 18 Apr 2025</p>
                  </div>

                  {/* Step 4: Pengesahan */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center">
                      4
                    </div>
                    <p className="text-xs font-bold text-slate-900">Pengesahan</p>
                    <p className="text-[11px] text-slate-500">Hasil &amp; Kompensasi</p>
                    <p className="text-[10px] text-slate-400">25 Apr 2025</p>
                  </div>
                </div>
              </div>

              {/* SECTION B: Rincian Sasaran Kinerja & Key Results (OKR) matching screenshot */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Rincian Sasaran Kinerja &amp; Key Results (OKR)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluasi berkala terhadap objektif teknis, kontribusi arsitektural, dan budaya tim.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 self-start sm:self-auto">
                    Total Bobot: 100%
                  </span>
                </div>

                {/* Filter Tabs matching screenshot */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-100 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'all'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Semua Sasaran (4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('teknikal')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'teknikal'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Teknikal &amp; Arsitektur (2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('operasional')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'operasional'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Efisiensi Operasional (1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('budaya')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'budaya'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Kepemimpinan &amp; Budaya (1)
                  </button>
                </div>

                {/* ALL 4 OKR CARDS - FULLY UNCLIPPED & COMPLETE */}
                <div className="space-y-4 pt-1">
                  {filteredOkrs.map((okr) => (
                    <div
                      key={okr.id}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3 transition-all hover:bg-white hover:shadow-xs"
                    >
                      {/* Badges Row matching screenshot */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                            BOBOT: {okr.weight}%
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              okr.progressPercent >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            ✓ {okr.progressPercent}% Tercapai
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/80 text-slate-700">
                            {okr.tag}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-blue-700">
                          <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                          <span>Self-Rating: {okr.selfRating.toFixed(1)} / 5.0</span>
                        </div>
                      </div>

                      {/* Title & Target Metric matching screenshot */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {okr.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {okr.targetMetric}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            okr.progressPercent >= 95
                              ? 'bg-blue-600'
                              : okr.progressPercent >= 85
                              ? 'bg-emerald-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${okr.progressPercent}%` }}
                        />
                      </div>

                      {/* Commentary Section (The part that was cut off, now fully interactive!) */}
                      {okr.isDraft ? (
                        <div className="space-y-2 pt-1 border-t border-slate-200/80">
                          <div className="flex items-center justify-between text-xs">
                            <label className="font-bold text-slate-700">
                              Catatan Evaluasi Diri (Draft Mandiri):
                            </label>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Belum Disimpan
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            value={draftCommentary}
                            onChange={(e) => setDraftCommentary(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-500">Nilai Diri Sendiri:</span>
                              <select
                                value={draftRating}
                                onChange={(e) => setDraftRating(e.target.value)}
                                className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
                              >
                                <option value="4.5">4.5 - Sangat Baik</option>
                                <option value="4.7">4.7 - Sangat Baik (Rekomendasi)</option>
                                <option value="4.9">4.9 - Istimewa</option>
                                <option value="5.0">5.0 - Sempurna</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDraftSaved(true);
                                showToast('✓ Draft evaluasi diri OKR 4 berhasil disimpan!');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                            >
                              Simpan Draft
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-[11px]">
                              Catatan Evaluasi Mandiri:
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Tersimpan
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed italic">
                            &ldquo;{okr.commentary}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (4 COLS): CATATAN ATASAN, PEER REVIEW 360, & IDP */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* CARD 1: Catatan Atasan Langsung matching screenshot */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Catatan Atasan Langsung
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    1-on-1 Terakhir
                  </span>
                </div>

                {/* Manager Profile Pill */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-2xs flex-shrink-0">
                    AW
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      Arya Wibowo, M.Sc
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      VP of Engineering • NX-2018042
                    </p>
                  </div>
                </div>

                {/* Manager Feedback Quote Box matching screenshot */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;Rian menunjukkan kepemimpinan teknikal yang sangat solid dalam menjaga stabilitas arsitektur core payroll Q1. Pertahankan ritme mentoring tim junior agar kemandirian squad semakin matang di kuartal berikutnya.&rdquo;
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>14 Maret 2025</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRisalahModalOpen(true)}
                    className="font-bold text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Lihat Risalah Lengkap
                  </button>
                </div>
              </div>

              {/* CARD 2: Umpan Balik Rekan (360° Peer Review - FULLY UNCLIPPED & COMPLETE!) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Umpan Balik Rekan (360°)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Lengkap (4/4)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      RATA-RATA PENILAIAN REKAN
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">4.90</span>
                      <span className="text-slate-400 font-bold text-xs">/ 5.0</span>
                    </div>
                  </div>

                  {/* Reviewers Avatar Stack */}
                  <div className="flex items-center -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                      DY
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                      BS
                    </div>
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                      KT
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                      +1
                    </div>
                  </div>
                </div>

                {/* Kata Kunci & Persepsi Tim (Anonim) - THE PART THAT WAS CUT OFF, NOW FULLY VISIBLE! */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-bold text-slate-800">
                    Kata Kunci &amp; Persepsi Tim (Anonim):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      #ArsitekSolutif
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      #HighReliability
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                      #GreatMentor
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      #FastResponse
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                      #CleanCode
                    </span>
                  </div>
                </div>

                {/* Anonymous Peer Quote */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 italic leading-relaxed">
                  &ldquo;Sangat tanggap saat insiden production dan selalu memberikan penjelasan arsitektural yang jelas untuk tim. Bimbingan tech-talk mikroservis sangat membantu percepatan rilis modul integrasi absensi.&rdquo;
                </div>
              </div>

              {/* CARD 3: Individual Development Plan (IDP) matching company policy */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Rencana Pengembangan (IDP Q2)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600">Disetujui VP</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                    <p className="font-bold text-slate-800">Google Cloud Professional Cloud Architect</p>
                    <p className="text-[11px] text-slate-400">Target Sertifikasi: Mei 2025 • Biaya ditanggung PT Nexora</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                    <p className="font-bold text-slate-800">Executive Engineering Leadership Workshop</p>
                    <p className="text-[11px] text-slate-400">Target Modul: Juni 2025 • Persiapan Principal Band</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: KIRIM SELF-APPRAISAL SEKARANG */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-blue-600 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Konfirmasi Pengiriman Self-Appraisal
                  </h3>
                  <p className="text-[11px] text-slate-400">Siklus Q1 2025 • Lead Backend Architect</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-2">
              <p className="font-bold">Ringkasan Evaluasi Diri Anda:</p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-blue-700/80">Skor Rata-Rata:</span>
                  <p className="font-black text-blue-900 font-mono text-sm">4.85 / 5.0</p>
                </div>
                <div>
                  <span className="text-blue-700/80">Sasaran Terisi:</span>
                  <p className="font-black text-blue-900 font-mono text-sm">4 dari 4 OKR (100%)</p>
                </div>
              </div>
              <p className="text-[10px] text-blue-800/80 pt-1 border-t border-blue-200/60">
                Setelah dikirimkan, berkas akan diteruskan secara otomatis ke antrean review 1-on-1 Arya Wibowo, M.Sc.
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin mengirimkan seluruh evaluasi mandiri Q1 2025 ke atasan langsung sekarang?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  showToast('✓ Evaluasi Self-Appraisal Q1 2025 berhasil dikirimkan ke Arya Wibowo, M.Sc.');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RIWAYAT SIKLUS LALU (.PDF) */}
      {isPastCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Arsip Evaluasi Siklus Lalu (Q4 2024)
                  </h3>
                  <p className="text-[11px] text-slate-400">Disahkan HR Committee 20 Januari 2025</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPastCycleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px]">Hasil Skor Final:</span>
                  <p className="text-xl font-black text-slate-900 font-mono">4.70 / 5.0</p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Sangat Baik (Exceeds)
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-600 space-y-1">
                <p><strong>Dampak Kompensasi:</strong> Bonus Kinerja Akhir Tahun 2.5x Gaji Pokok &amp; Kenaikan Grade Band 4.</p>
                <p><strong>Penyetuju:</strong> Arya Wibowo (VP Eng) &amp; Citra Lestari (Chief People Officer).</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPastCycleModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPastCycleModalOpen(false);
                  showToast('✓ Berkas PDF Evaluasi Kinerja Q4 2024 berhasil diunduh.');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF Arsip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DETAIL SESI 1-ON-1 */}
      {isMeetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Detail Jadwal 1-on-1 Review
                  </h3>
                  <p className="text-[11px] text-slate-400">Sinkronisasi Google Calendar Terkonfirmasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMeetModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                <span className="text-blue-600 font-bold text-[10px] uppercase">Waktu &amp; Tanggal</span>
                <p className="font-extrabold text-slate-900 text-sm">Kamis, 03 April 2025 • 14:00 - 15:00 WIB</p>
                <p className="text-[11px] text-slate-600">Google Meet: meet.google.com/nex-perf-rian</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-[11px] text-slate-600">
                <p className="font-bold text-slate-800">Agenda Pembahasan:</p>
                <p>1. Kalibrasi self-appraisal arsitektur microservices core.</p>
                <p>2. Roadmap sertifikasi GCP Cloud Architect Q2 2025.</p>
                <p>3. Rencana suksesi mentoring engineering squad backend.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsMeetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMeetModalOpen(false);
                  showToast('Membuka Google Meet ruangan evaluasi 1-on-1...');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
              >
                Buka Link Meet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LIHAT RISALAH LENGKAP */}
      {isRisalahModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Risalah Sesi 1-on-1 (14 Maret 2025)
                  </h3>
                  <p className="text-[11px] text-slate-400">Pewawancara: Arya Wibowo, M.Sc (VP Eng)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRisalahModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900">Poin Kesepakatan Utama:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                <li>Arsitektur cloud Kubernetes GKE dinilai sangat sukses menjaga SLA 99.99%.</li>
                <li>Penyelesaian modul enkripsi data karyawan diapresiasi penuh oleh HR &amp; Legal.</li>
                <li>Fokus kuartal berikutnya dialokasikan 20% untuk mentoring squad junior.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRisalahModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
