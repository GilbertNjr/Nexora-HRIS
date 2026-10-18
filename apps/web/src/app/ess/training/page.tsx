'use client';

import React, { useState } from 'react';
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
  ShieldAlert,
  BookOpen,
  DollarSign,
  Compass,
  Trophy,
  Laptop,
  Flame,
  BadgeCheck,
} from 'lucide-react';

interface CourseItem {
  id: string;
  badgeCategory: string;
  badgeTopic: string;
  badgeLevel: string;
  deadline: string;
  title: string;
  description: string;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  thumbnailTag: string;
  category: 'my_courses' | 'compliance' | 'recommended' | 'history';
}

interface WebinarItem {
  id: string;
  type: string;
  typeBadgeColor: string;
  slotBadge: string;
  slotBadgeColor: string;
  title: string;
  datetime: string;
  speaker: string;
  registered?: boolean;
}

export default function EssTrainingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my_courses' | 'compliance' | 'recommended' | 'history'>('my_courses');
  const [sortOrder, setSortOrder] = useState('Tenggat Terdekat');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Modals state
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState<WebinarItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Claim budget form state
  const [claimCourseName, setClaimCourseName] = useState('');
  const [claimProvider, setClaimProvider] = useState('Coursera');
  const [claimAmount, setClaimAmount] = useState('1500000');
  const [remainingBudget, setRemainingBudget] = useState(6250000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const courses: CourseItem[] = [
    {
      id: 'course-1',
      badgeCategory: 'Backend',
      badgeTopic: 'Kafka & Events',
      badgeLevel: 'Intermediate',
      deadline: '15 Apr 2025',
      title: 'Advanced Distributed Systems & Event-Driven Microservices with Kafka',
      description:
        'Membahas orkestrasi event stream konsistensi tinggi, idempotency pattern, failover recovery, serta implementasi saga pattern pada arsitektur data payroll.',
      progressPercent: 80,
      completedModules: 4,
      totalModules: 5,
      thumbnailTag: 'Nexora Tech Academy',
      category: 'my_courses',
    },
    {
      id: 'course-2',
      badgeCategory: 'Cloud Architecture',
      badgeTopic: 'Kubernetes GKE',
      badgeLevel: 'Advanced',
      deadline: '30 Mei 2025',
      title: 'Google Cloud Certified Professional Cloud Architect Deep Dive',
      description:
        'Persiapan kurikulum sertifikasi resmi Google Cloud, multi-cluster networking, VPC peering, load balancing global, dan arsitektur disaster recovery.',
      progressPercent: 45,
      completedModules: 5,
      totalModules: 12,
      thumbnailTag: 'Google Cloud Partner',
      category: 'my_courses',
    },
    {
      id: 'course-3',
      badgeCategory: 'Leadership',
      badgeTopic: 'People Management',
      badgeLevel: 'Essential',
      deadline: '20 Jun 2025',
      title: 'Executive Engineering Leadership & Squad Mentorship Mastery',
      description:
        'Teknik membimbing squad junior, manajemen konflik engineering, delegasi arsitektur efektif, serta fasilitasi retrospektif agile berkualitas tinggi.',
      progressPercent: 25,
      completedModules: 2,
      totalModules: 8,
      thumbnailTag: 'Nexora Leadership Lab',
      category: 'my_courses',
    },
  ];

  const webinars: WebinarItem[] = [
    {
      id: 'webinar-1',
      type: 'Webinar Eksternal',
      typeBadgeColor: 'bg-blue-100 text-blue-800',
      slotBadge: 'Tersisa 14 Slot',
      slotBadgeColor: 'text-rose-600 font-bold',
      title: 'GenAI & LLM Integration in Enterprise Backend',
      datetime: '28 Mar 2025 • 15:30 WIB',
      speaker: 'Pembicara: Pratama Kusuma (Principal ML Architect, Global Cloud Partner).',
    },
    {
      id: 'webinar-2',
      type: 'Townhall Internal',
      typeBadgeColor: 'bg-purple-100 text-purple-800',
      slotBadge: 'Wajib Lead',
      slotBadgeColor: 'text-indigo-600 font-bold',
      title: 'Townhall HR: Kebijakan Baru Pagu Pelatihan & Sertifikasi Mandiri 2025',
      datetime: '04 Apr 2025 • 10:00 WIB',
      speaker: 'Pembicara: Citra Lestari (Chief People Officer).',
    },
    {
      id: 'webinar-3',
      type: 'Hands-on Workshop',
      typeBadgeColor: 'bg-emerald-100 text-emerald-800',
      slotBadge: 'Tersisa 8 Slot',
      slotBadgeColor: 'text-amber-700 font-bold',
      title: 'High-Throughput Postgres Indexing & Query Tuning',
      datetime: '18 Apr 2025 • 14:00 WIB',
      speaker: 'Pembicara: Arya Wibowo, M.Sc (VP of Engineering).',
    },
  ];

  const filteredCourses = courses.filter((c) => {
    if (activeTab === 'my_courses') return true;
    if (activeTab === 'compliance') return c.badgeCategory === 'Compliance' || c.id === 'course-1';
    return true;
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(claimAmount, 10) || 0;
    if (amountNum > remainingBudget) {
      alert('Nominal klaim melebihi sisa pagu tahunan yang tersedia.');
      return;
    }
    setRemainingBudget((prev) => prev - amountNum);
    setIsClaimModalOpen(false);
    showToast(`✓ Klaim anggaran belajar sebesar Rp ${amountNum.toLocaleString('id-ID')} berhasil diajukan untuk verifikasi HR!`);
    setClaimCourseName('');
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

      {/* LEFT SIDEBAR matching screenshot */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 justify-between p-4 sm:p-5 sticky top-0 md:h-screen z-30 shadow-2xs overflow-y-auto">
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
          <div className="px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-700 text-[11px] font-semibold flex items-center gap-2">
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
              <Fingerprint className="w-4 h-4 text-slate-400" />
              <span>Presensi &amp; Absensi</span>
            </Link>

            <Link
              href="/ess/leave"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span>Cuti &amp; Izin Saya</span>
            </Link>

            <Link
              href="/ess/payroll"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Slip Gaji &amp; Kompensasi</span>
            </Link>
          </div>

          {/* SECTION 2: KARIR & PENGEMBANGAN */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              KARIR &amp; PENGEMBANGAN
            </p>

            <Link
              href="/ess/performance"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span>Kinerja &amp; KPI Pribadi</span>
            </Link>

            {/* Pelatihan & Modul (ACTIVE matching screenshot: Solid Blue Pill) */}
            <Link
              href="/ess/training"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-all text-left"
            >
              <GraduationCap className="w-4 h-4 text-white" />
              <span>Pelatihan &amp; Modul</span>
            </Link>
          </div>

          {/* SECTION 3: DOKUMEN & BANTUAN */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              DOKUMEN &amp; BANTUAN
            </p>

            <Link
              href="/ess/documents"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <FolderArchive className="w-4 h-4 text-slate-400" />
              <span>Arsip &amp; Formulir</span>
            </Link>

            <button
              type="button"
              onClick={() => showToast('Menghubungi Helpdesk HR Operations...')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <Headphones className="w-4 h-4 text-slate-400" />
              <span>Bantuan &amp; Kontak HR</span>
            </button>
          </div>
        </div>

        {/* BOTTOM SUPPORT CARD matching screenshot */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/80 space-y-2 mt-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Pusat Dukungan</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Ada kendala data kehadiran atau klaim?
          </p>
          <div className="space-y-1 text-[11px] font-bold pt-0.5">
            <a
              href="#sop"
              onClick={(e) => {
                e.preventDefault();
                showToast('Membuka SOP Pagu Belajar & Standar Sertifikasi L&D...');
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
                showToast('Membuka Tiket Bantuan HR Operations...');
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
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col text-[11px] leading-tight text-left">
                <span className="font-bold text-slate-800">Senin, 24</span>
                <span className="text-slate-500 font-medium">Maret 2025</span>
              </div>
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

        {/* PAGE CONTENT CONTAINER (Generous bottom padding pb-36 to prevent ANY cut-off!) */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto pb-36">
          {/* HEADER SECTION matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="space-y-1.5">
              {/* Breadcrumb matching screenshot */}
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Link href="/ess" className="hover:text-blue-600 transition-colors">
                    Portal Karyawan
                  </Link>
                  <span>&gt;</span>
                  <span>Karir &amp; Pengembangan</span>
                  <span>&gt;</span>
                  <span className="text-blue-600 font-bold">Pelatihan &amp; Modul</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Semester I / TA 2025</span>
                </span>
              </div>

              {/* Title matching screenshot */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Pusat Pelatihan &amp; Pengembangan Mandiri (L&amp;D)
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Akses modul wajib kepatuhan korporat, sertifikasi kompetensi cloud &amp; engineering, serta jelajahi katalog pelatihan profesional untuk mengakselerasi lintasan karir Anda.
              </p>
            </div>

            {/* Top Right Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Jelajahi Katalog Button */}
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Jelajahi Katalog</span>
              </button>

              {/* Klaim Anggaran Belajar (Solid Blue Button) */}
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Klaim Anggaran Belajar</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: MODUL SELESAI TAHUN INI */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  MODUL SELESAI TAHUN INI
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>On Track</span>
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">4</span>
                <span className="text-slate-400 font-bold text-lg">/ 6 Modul Wajib</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-0.5">
                <span>Tingkat Kepatuhan</span>
                <span className="font-bold text-blue-700">67%</span>
              </div>

              {/* Solid blue accent bar at bottom matching screenshot */}
              <div className="pt-0.5">
                <div className="w-28 h-1 bg-blue-600 rounded-full" />
              </div>
            </div>

            {/* Card 2: SERTIFIKASI AKTIF */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  SERTIFIKASI AKTIF
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Terakreditasi
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">3</span>
                <span className="text-slate-500 font-bold text-xs">Lisensi Valid</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-semibold text-slate-600">
                <span className="px-2 py-0.5 rounded bg-slate-100 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  <span>AWS SA</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  <span>GCP Pro</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  <span>ISO</span>
                </span>
              </div>
            </div>

            {/* Card 3: SISA PAGU BELAJAR */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  SISA PAGU BELAJAR
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Thn 2025
                </span>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  Rp {remainingBudget.toLocaleString('id-ID')}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dari total pagu tahunan Rp 10.000.000
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold pt-0.5">
                <span className="text-blue-700">Tersisa 62.5%</span>
                <span className="text-slate-400 font-normal">Hangus 31 Des 2025</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[62.5%]" />
              </div>
            </div>

            {/* Card 4: TOTAL JAM BELAJAR (CPE) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  TOTAL JAM BELAJAR (CPE)
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  96% Target
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">38.5</span>
                <span className="text-slate-400 font-bold text-lg">/ 40.0 Jam</span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 pt-0.5">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tinggal 1.5 Jam untuk target KPI</span>
                </span>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              </div>
            </div>
          </div>

          {/* SECTION 2: MANDATORY COMPLIANCE HERO BANNER matching screenshot */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border-l-4 border-l-rose-500 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 uppercase tracking-wider">
                    TINDAKAN KEPATUHAN DIPERLUKAN
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Batas Akhir: 31 Maret 2025 (Tersisa 7 Hari)</span>
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  Kepatuhan Wajib Tahunan: Refreshment Keamanan Informasi ISO 27001 &amp; UU Perlindungan Data Pribadi (UU PDP)
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                  Sesuai regulasi kepatuhan audit sistem Nexora Q1-2025, seluruh tim Backend Architecture diwajibkan menyelesaikan studi kasus mitigasi kebocoran kredensial dan penanganan data sensitif PII.
                </p>

                {/* Progress bar and details */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <span className="font-bold text-slate-800">
                    Status: <strong className="text-rose-600">3 dari 4 Kuis Lulus (75%)</strong>
                  </span>
                  <div className="w-36 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full w-[75%]" />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    • Estimasi durasi: 15 menit tersisa
                  </span>
                </div>
              </div>
            </div>

            <div className="self-start lg:self-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsComplianceModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Lanjutkan Modul Terakhir</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS): PELATIHAN SAYA & KATALOG */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                {/* Filter Tabs matching screenshot */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('my_courses')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'my_courses'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      Pelatihan Saya (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('compliance')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        activeTab === 'compliance'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>Wajib Kepatuhan</span>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCatalogModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                    >
                      Katalog Rekomendasi (8)
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Membuka tab Riwayat & Sertifikat Kelulusan...')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                    >
                      Riwayat &amp; Sertifikat (4)
                    </button>
                  </div>

                  {/* Sort selector matching screenshot */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/90"
                    >
                      <span>Urutkan: <strong>{sortOrder}</strong></span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isSortDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30 animate-in fade-in">
                        {['Tenggat Terdekat', 'Progres Tertinggi', 'Baru Ditambahkan'].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setSortOrder(item);
                              setIsSortDropdownOpen(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 font-medium text-slate-700"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* COURSES LIST — ALL 3 COURSES FULLY UNCLIPPED & COMPLETE! */}
                <div className="space-y-4">
                  {filteredCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row gap-4 items-start"
                    >
                      {/* Left Thumbnail Banner matching screenshot */}
                      <div className="w-full sm:w-44 h-28 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white flex flex-col justify-between p-3 flex-shrink-0 relative overflow-hidden shadow-2xs">
                        <span className="text-[10px] font-black tracking-wider uppercase text-blue-300">
                          {c.thumbnailTag}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Laptop className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <span>{c.completedModules}/{c.totalModules} Modul</span>
                          <span className="font-bold text-emerald-400">{c.progressPercent}%</span>
                        </div>
                      </div>

                      {/* Content details matching screenshot */}
                      <div className="flex-1 space-y-2 min-w-0 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                              {c.badgeCategory}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                              {c.badgeTopic}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/80 text-slate-700">
                              {c.badgeLevel}
                            </span>
                          </div>

                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Batas Waktu: {c.deadline}</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {c.title}
                        </h4>

                        <p className="text-xs text-slate-500 leading-relaxed">
                          {c.description}
                        </p>

                        {/* Progress bar and Action Buttons */}
                        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1 max-w-xs">
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${c.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              {c.progressPercent}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => showToast(`Membuka silabus dan kurikulum ${c.title}...`)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
                            >
                              Silabus
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`Memulai modul lanjutan: ${c.title}...`)}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Lanjutkan Belajar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (4 COLS): WEBINAR & WORKSHOP — FULLY UNCLIPPED & COMPLETE! */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Webinar &amp; Workshop
                    </h3>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* All Webinars Listed Without Any Clipping */}
                <div className="space-y-3.5">
                  {webinars.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-2 hover:bg-white hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${w.typeBadgeColor}`}>
                          {w.type}
                        </span>
                        <span className={`text-[10px] ${w.slotBadgeColor}`}>
                          {w.slotBadge}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {w.title}
                      </h4>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.datetime}</span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {w.speaker}
                      </p>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedWebinar(w)}
                          className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-all active:scale-95 text-center"
                        >
                          Daftar Kursi Sekarang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Badges / Kompetensi Showcase */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Lencana &amp; Sertifikat Terverifikasi
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">AWS Solutions Architect</p>
                      <p className="text-[10px] text-slate-400">ID: AWS-2024-8842 • Berlaku s.d 2027</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Aktif
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">ISO 27001 Security Practitioner</p>
                      <p className="text-[10px] text-slate-400">Internal Audit Compliance 2024</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: KLAIM ANGGARAN BELAJAR */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pengajuan Klaim Anggaran Belajar
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sisa Pagu 2025: Rp {remainingBudget.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kursus / Sertifikasi
                </label>
                <input
                  type="text"
                  required
                  value={claimCourseName}
                  onChange={(e) => setClaimCourseName(e.target.value)}
                  placeholder="Contoh: Official GCP Professional Cloud Architect Exam"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penyelenggara</label>
                  <select
                    value={claimProvider}
                    onChange={(e) => setClaimProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="Coursera">Coursera / Partner</option>
                    <option value="Google Cloud">Google Cloud Official</option>
                    <option value="AWS Training">AWS Official</option>
                    <option value="Udemy Business">Udemy Business</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimasi Biaya (IDR)</label>
                  <input
                    type="number"
                    required
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold">Ketentuan Reimbursement L&amp;D:</p>
                <p>Klaim akan diverifikasi HRD dan dicairkan bersamaan dengan payroll bulanan setelah melampirkan invoice resmi dan sertifikat kelulusan.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Ajukan Klaim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: JELAJAHI KATALOG PELATIHAN */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Katalog Pelatihan Rekomendasi Karir
                  </h3>
                  <p className="text-[11px] text-slate-400">Kurikulum khusus peran Lead Backend Architect</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Domain-Driven Design (DDD) in Practice</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">18 Jam</span>
                </div>
                <p className="text-[11px] text-slate-500">Mempelajari bounded contexts, aggregate root, dan dekomposisi monolitik ke modular design.</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCatalogModalOpen(false);
                    showToast('✓ Berhasil menambahkan kursus DDD ke daftar pelatihan aktif Anda!');
                  }}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  + Tambahkan ke Pelatihan Saya
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Zero-Trust Network Architecture &amp; Service Mesh</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">12 Jam</span>
                </div>
                <p className="text-[11px] text-slate-500">Implementasi mTLS Istio, enkripsi sidecar proxy, dan identitas beban kerja SPIFFE.</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCatalogModalOpen(false);
                    showToast('✓ Berhasil menambahkan kursus Service Mesh ke daftar pelatihan aktif Anda!');
                  }}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  + Tambahkan ke Pelatihan Saya
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Tutup Katalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MODUL KEPATUHAN WAJIB ISO 27001 */}
      {isComplianceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Modul Terakhir: Kuis Kepatuhan UU PDP
                  </h3>
                  <p className="text-[11px] text-slate-400">Bagian 4 dari 4: Incident Response Drill</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComplianceModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-slate-900">Pertanyaan Studi Kasus:</p>
              <p className="leading-relaxed">
                Apabila terdeteksi anomali akses database payroll dari IP publik yang tidak terdaftar, tindakan protokol pertama apa yang wajib dilakukan oleh Lead Engineer?
              </p>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="quiz" defaultChecked className="text-blue-600" />
                  <span>Isolasi kredensial, putuskan sesi aktif, dan eskalasi ke Tim CSIRT dalam 3x24 jam</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-blue-50">
                  <input type="radio" name="quiz" className="text-blue-600" />
                  <span>Menghapus log server untuk mencegah jejak penyerang</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsComplianceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsComplianceModalOpen(false);
                  showToast('✓ Selamat! Anda telah menyelesaikan 100% Modul Kepatuhan Tahunan ISO 27001 & UU PDP.');
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all"
              >
                Kirim Jawaban Kuis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: KONFIRMASI WEBINAR */}
      {selectedWebinar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pendaftaran Kursi Sesi
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedWebinar.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWebinar(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">{selectedWebinar.title}</h4>
              <p className="text-[11px] text-slate-500">{selectedWebinar.datetime}</p>
              <p className="text-[11px] text-slate-600">{selectedWebinar.speaker}</p>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                Tersedia 2 Jam CPE yang akan otomatis dikreditkan ke KPI pembelajaran Anda setelah sesi berakhir.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedWebinar(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = selectedWebinar.title;
                  setSelectedWebinar(null);
                  showToast(`✓ Anda telah terdaftar pada sesi "${title}". Undangan kalender telah dikirimkan.`);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
              >
                Konfirmasi Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
