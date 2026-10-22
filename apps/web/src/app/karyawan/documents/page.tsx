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
  ShieldAlert,
  BookOpen,
  DollarSign,
  Compass,
  Trophy,
  Laptop,
  Flame,
  BadgeCheck,
  FilePlus,
  Receipt,
  Box,
  Eye,
  MoreVertical,
  FileCode,
  Briefcase,
  Layers,
  Upload,
  PanelLeft,
  PanelLeftClose,
  Menu,
} from 'lucide-react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

interface DocumentItem {
  id: string;
  category: 'legal' | 'letter' | 'tax' | 'template';
  title: string;
  docNumber: string;
  updatedDate: string;
  fileSize: string;
  formatBadge: string;
  signatureStatus: string;
  securityBadge: string;
  downloadUrl?: string;
}

interface RequestTrackingItem {
  id: string;
  ticketNo: string;
  title: string;
  targetPurpose: string;
  submittedAt: string;
  statusLabel: string;
  currentStep: number;
  totalSteps: number;
  estimatedCompletion: string;
  steps: {
    title: string;
    status: 'completed' | 'active' | 'pending';
  }[];
}

export default function EssDocumentsPage() {
  const { user: currentUser } = useCurrentUser();
  const { isCollapsed: isSidebarCollapsed, toggle: toggleSidebar, isMobileOpen, openMobile, closeMobile } = useSidebarCollapse();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'legal' | 'letter' | 'tax' | 'template'>('legal');
  const [yearFilter, setYearFilter] = useState('Semua');
  const [formatFilter, setFormatFilter] = useState('Semua');

  // Modals state
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Request Form State
  const [requestDocType, setRequestDocType] = useState('Surat Keterangan Penghasilan (Income Statement)');
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestTargetOrg, setRequestTargetOrg] = useState('');
  const [requestUrgency, setRequestUrgency] = useState('Standar (1-2 Hari Kerja)');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const documentList: DocumentItem[] = [
    {
      id: 'doc-1',
      category: 'legal',
      title: 'Perjanjian Kerja Waktu Tidak Tertentu (PKWTT) Addendum 2024',
      docNumber: 'PKWTT-NX/2024/ENG-014',
      updatedDate: '10 Jan 2024',
      fileSize: '2.4 MB',
      formatBadge: 'PDF RESMI',
      signatureStatus: 'Ditandatangani Digital (Peruri CA)',
      securityBadge: 'Kerahasiaan: Privat',
    },
    {
      id: 'doc-2',
      category: 'letter',
      title: 'Surat Keterangan Kerja Aktif (SKK) — Pengajuan KPR',
      docNumber: 'SKK-NX/2025/HR-028',
      updatedDate: '14 Feb 2025',
      fileSize: '1.1 MB',
      formatBadge: 'E-METERAI',
      signatureStatus: 'Tervalidasi Bank Rekanan (BCA/Mandiri/BRI)',
      securityBadge: 'E-Meterai Valid',
    },
    {
      id: 'doc-3',
      category: 'tax',
      title: 'Formulir Bukti Potong Pajak Penghasilan Pasal 21 (SPT 1721-A1)',
      docNumber: '1.1-2.1-24-001928',
      updatedDate: '28 Jan 2025',
      fileSize: '850 KB',
      formatBadge: 'DJP RESMI',
      signatureStatus: 'Dilaporkan ke DJP Pajak KPP Pratama',
      securityBadge: 'QR Validasi DJP',
    },
    {
      id: 'doc-4',
      category: 'legal',
      title: 'Surat Keputusan (SK) Pengangkatan Lead Backend Architect',
      docNumber: 'SK-DIR/2023/CORP-088',
      updatedDate: '01 Jun 2023',
      fileSize: '1.8 MB',
      formatBadge: 'LEGALITAS',
      signatureStatus: 'Ditandatangani CEO & CPO',
      securityBadge: 'Permanen',
    },
    {
      id: 'doc-5',
      category: 'legal',
      title: 'Pakta Integritas, Kerahasiaan Informasi & IP Rights (NDA)',
      docNumber: 'NDA-NX/2021/ENG-008',
      updatedDate: '15 Mar 2024',
      fileSize: '1.3 MB',
      formatBadge: 'ISO 27001',
      signatureStatus: 'Kepatuhan Keamanan & UU PDP',
      securityBadge: 'Terenkripsi',
    },
    {
      id: 'doc-6',
      category: 'template',
      title: 'Perjanjian Fasilitas Laptop & Workstation Inventaris Kantor',
      docNumber: 'AST-NX/2024/IT-031',
      updatedDate: '12 Agu 2024',
      fileSize: '950 KB',
      formatBadge: 'LOGISTIK',
      signatureStatus: 'Terdaftar IT Asset Management',
      securityBadge: 'Garansi Aktif',
    },
  ];

  const activeRequest: RequestTrackingItem = {
    id: 'req-1',
    ticketNo: 'REQ-DOC-2025-082',
    title: 'Surat Pengantar Visa Schengen',
    targetPurpose: 'Tujuan: Jerman (Konferensi Tech Berlin)',
    submittedAt: '22 Maret 2025 • 10:14 WIB',
    statusLabel: 'Menunggu Tanda Tangan CHRO',
    currentStep: 2,
    totalSteps: 3,
    estimatedCompletion: 'Est. Besok, 14:00 WIB',
    steps: [
      { title: '1. Verifikasi HR', status: 'completed' },
      { title: '2. TTD CHRO', status: 'active' },
      { title: '3. Selesai', status: 'pending' },
    ],
  };

  const filteredDocs = documentList.filter((doc) => {
    if (activeTab === 'legal' && doc.category !== 'legal') return false;
    if (activeTab === 'letter' && doc.category !== 'letter') return false;
    if (activeTab === 'tax' && doc.category !== 'tax') return false;
    if (activeTab === 'template' && doc.category !== 'template') return false;
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsNewRequestModalOpen(false);
    showToast(`✓ Permohonan "${requestDocType}" berhasil diajukan dengan nomor tiket #REQ-DOC-2025-094.`);
    setRequestPurpose('');
    setRequestTargetOrg('');
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
        activeMenu="documents"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
        onShowToast={showToast}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR matching screenshot */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Left: Mobile & Desktop Toggle Button & Search Input Box */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={openMobile}
              className="flex md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

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
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs overflow-hidden relative">
                {currentUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  currentUser.initials
                )}
                {currentUser.avatarUrl && (
                  <span className="absolute inset-0 flex items-center justify-center -z-10 font-bold text-xs">
                    {currentUser.initials}
                  </span>
                )}
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
                <Link href="/karyawan" className="hover:text-blue-600 transition-colors">
                  Beranda
                </Link>
                <span>&gt;</span>
                <span>Dokumen &amp; Arsip</span>
                <span>&gt;</span>
                <span className="text-slate-800 font-bold">Arsip &amp; Formulir Mandiri</span>
              </div>

              {/* Title & Badge matching screenshot */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Pusat Dokumen &amp; Formulir Mandiri
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ESS Portal
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Akses arsip dokumen legalitas kerja, unduh bukti potong pajak, cetak surat keterangan instan, dan kelola template permohonan kepegawaian resmi yang terikat pada NIK <strong className="text-slate-800 font-mono">NX-2021008</strong>.
              </p>
            </div>

            {/* Top Right Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Riwayat Pengajuan Surat Button */}
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>Riwayat Pengajuan Surat</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                  2 Berkas
                </span>
              </button>

              {/* + Buat Permohonan Dokumen Baru (Solid Blue Button) */}
              <button
                type="button"
                onClick={() => setIsNewRequestModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <FilePlus className="w-4 h-4" />
                <span>+ Buat Permohonan Dokumen Baru</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: DOKUMEN RESMI AKTIF */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  DOKUMEN RESMI AKTIF
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">6</span>
                <span className="text-slate-500 font-bold text-xs">Berkas Tersedia</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Terverifikasi HRD</span>
                </span>
                <span className="text-slate-400 text-[11px]">Semua mutakhir</span>
              </div>

              {/* Solid blue accent bar at bottom matching screenshot */}
              <div className="pt-0.5">
                <div className="w-28 h-1 bg-blue-600 rounded-full" />
              </div>
            </div>

            {/* Card 2: PERMOHONAN SURAT INSTAN */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  PERMOHONAN SURAT INSTAN
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">1</span>
                <span className="text-amber-700 font-bold text-xs">Menunggu Otorisasi</span>
              </div>

              <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimasi selesai 1×24 jam kerja</span>
              </p>
            </div>

            {/* Card 3: DOKUMEN PAJAK & FINANSIAL */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  DOKUMEN PAJAK &amp; FINANSIAL
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  SPT 1721-A1
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-slate-400 text-[11px]">Tahun Pajak 2024 • Final</span>
                <button
                  type="button"
                  onClick={() => {
                    const doc = documentList.find((d) => d.category === 'tax');
                    if (doc) setSelectedDoc(doc);
                    setIsPreviewModalOpen(true);
                  }}
                  className="font-bold text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                >
                  <span>Unduh</span>
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Card 4: METERAI ELEKTRONIK (E-METERAI) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  METERAI ELEKTRONIK (E-METERAI)
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Box className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">3</span>
                <span className="text-slate-400 font-bold text-lg">/ 5 Kuota</span>
              </div>

              <p className="text-[11px] text-slate-500 pt-0.5">
                Tersedia untuk legalisir internal 2025
              </p>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[60%]" />
              </div>
            </div>
          </div>

          {/* SECTION 2: TABS & FILTER TOOLBAR matching screenshot */}
          <div className="space-y-4">
            {/* Tabs matching screenshot */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('legal')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'legal'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Dokumen Legalitas &amp; Kontrak</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  activeTab === 'legal' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  4
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('letter')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'letter'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Surat Keterangan &amp; Visa Kerja</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  activeTab === 'letter' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  3
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tax')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'tax'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Perpajakan &amp; Finansial (SPT/Slip)</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  activeTab === 'tax' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  8
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('template')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'template'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Template Formulir HR</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  activeTab === 'template' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  6
                </span>
              </button>
            </div>

            {/* Filter toolbar matching screenshot */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-72 max-w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama dokumen..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                  >
                    <option value="Semua">Tahun: Semua</option>
                    <option value="2025">Tahun: 2025</option>
                    <option value="2024">Tahun: 2024</option>
                    <option value="2023">Tahun: 2023</option>
                  </select>

                  <select
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                  >
                    <option value="Semua">Format: Semua</option>
                    <option value="PDF">PDF Resmi</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="ZIP">Arsip (.zip)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast('Mempersiapkan berkas arsip (.zip) seluruh dokumen terverifikasi...')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Arsip (.zip)</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS): LIST OF OFFICIAL DOCUMENTS (ALL ITEMS FULLY UNCLIPPED & COMPLETE!) */}
            <div className="lg:col-span-8 space-y-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {doc.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        <span>No: <strong className="font-mono text-slate-700">{doc.docNumber}</strong></span>
                        <span>•</span>
                        <span>Diperbarui {doc.updatedDate}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                        <span>•</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {doc.formatBadge}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{doc.signatureStatus}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>{doc.securityBadge}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions matching screenshot */}
                  <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setIsPreviewModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pratinjau</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        showToast(`✓ Berkas "${doc.title}" berhasil diunduh secara resmi.`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast(`Pilihan tambahan untuk ${doc.docNumber}...`)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN (4 COLS): ACTIVE REQUEST TRACKING & TEMPLATES (NOW FULLY UNCLIPPED!) */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* Card 1: Permohonan Khusus Berjalan matching screenshot */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Permohonan Khusus Berjalan
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    1 Aktif
                  </span>
                </div>

                {/* Active Request Card */}
                <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {activeRequest.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {activeRequest.targetPurpose}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      TAHAP 2/3
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1 text-slate-600 pt-1 border-t border-slate-200/80">
                    <p>No. Pengajuan: <strong className="font-mono text-slate-900">{activeRequest.ticketNo}</strong></p>
                    <p>Diajukan pada: {activeRequest.submittedAt}</p>
                    <p>Status Otorisasi: <strong className="text-blue-700">{activeRequest.statusLabel}</strong></p>
                  </div>

                  {/* 3-Step Progress Indicator */}
                  <div className="flex items-center justify-between text-[10px] font-bold pt-1">
                    <span className="text-emerald-700">1. Verifikasi HR</span>
                    <span className="text-blue-700 font-extrabold">2. TTD CHRO</span>
                    <span className="text-slate-400 font-normal">3. Selesai</span>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full w-[66%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeRequest.estimatedCompletion}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTrackingModalOpen(true)}
                      className="font-bold text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                    >
                      <span>Lihat Detail Alur</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Template Permohonan Cepat (The part that was cut off, now fully unclipped!) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FilePlus className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Template Permohonan Cepat
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Instan 1-Klik</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setRequestDocType('Surat Keterangan Penghasilan (Income Statement)');
                      setIsNewRequestModalOpen(true);
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-left transition-all space-y-0.5 group"
                  >
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Surat Keterangan Penghasilan (Salary Slip)
                    </p>
                    <p className="text-[11px] text-slate-400">Untuk keperluan leasing, aplikasi visa, atau perbankan.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRequestDocType('Surat Sponsor Visa Dinas Luar Negeri');
                      setIsNewRequestModalOpen(true);
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-left transition-all space-y-0.5 group"
                  >
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Surat Pengantar Sponsor Visa Dinas Luar Negeri
                    </p>
                    <p className="text-[11px] text-slate-400">Otorisasi langsung Direksi &amp; HRD Corporate.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRequestDocType('Legalisasi E-Meterai Dokumen Kepegawaian');
                      setIsNewRequestModalOpen(true);
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-left transition-all space-y-0.5 group"
                  >
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Legalisir Dokumen Internal (E-Meterai Peruri)
                    </p>
                    <p className="text-[11px] text-slate-400">Memanfaatkan kuota e-meterai resmi perusahaan.</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: + BUAT PERMOHONAN DOKUMEN BARU */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Formulir Permohonan Dokumen Resmi
                  </h3>
                  <p className="text-[11px] text-slate-400">Pengajuan otomatis terhubung ke antrean HRD</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRequestModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Dokumen Yang Diperlukan</label>
                <select
                  value={requestDocType}
                  onChange={(e) => setRequestDocType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Surat Keterangan Kerja Aktif (SKK)">Surat Keterangan Kerja Aktif (SKK)</option>
                  <option value="Surat Keterangan Penghasilan (Income Statement)">Surat Keterangan Penghasilan (Salary Slip)</option>
                  <option value="Surat Sponsor Visa Dinas Luar Negeri">Surat Pengantar Sponsor Visa Dinas Luar Negeri</option>
                  <option value="Surat Rekomendasi Profesional / Studi">Surat Rekomendasi Profesional / Beasiswa</option>
                  <option value="Legalisasi E-Meterai Dokumen Kepegawaian">Legalisasi E-Meterai Dokumen Kepegawaian</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instansi / Pihak Tujuan Surat</label>
                <input
                  type="text"
                  required
                  value={requestTargetOrg}
                  onChange={(e) => setRequestTargetOrg(e.target.value)}
                  placeholder="Contoh: Kedutaan Besar Jerman di Jakarta / Bank BCA KCU Sudirman"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keperluan &amp; Keterangan Lengkap</label>
                <textarea
                  rows={2}
                  required
                  value={requestPurpose}
                  onChange={(e) => setRequestPurpose(e.target.value)}
                  placeholder="Jelaskan kebutuhan dokumen secara rinci untuk verifikasi otorisasi HR..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Urgensi Permohonan</label>
                  <select
                    value={requestUrgency}
                    onChange={(e) => setRequestUrgency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="Standar (1-2 Hari Kerja)">Standar (1-2 Hari Kerja)</option>
                    <option value="Penting (Hari yang Sama)">Penting (Hari yang Sama)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format Penerbitan</label>
                  <input
                    type="text"
                    disabled
                    value="PDF Ber-Barcode & E-Meterai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Ajukan Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRATINJAU DOKUMEN RESMI */}
      {isPreviewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pratinjau Dokumen Resmi
                  </h3>
                  <p className="text-[11px] text-slate-400">{selectedDoc.docNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="font-extrabold text-slate-900">PT NEXORA DIGITAL NUSANTARA</h4>
                  <p className="text-[10px] text-slate-400">Divisi Legal &amp; Human Capital Management</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  DIGITALLY SIGNED
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-900">{selectedDoc.title}</p>
                <p className="text-[11px] text-slate-500">Pemilik Dokumen: {currentUser.fullName} ({currentUser.employeeNumber})</p>
                <p className="text-[11px] text-slate-500">Status Validitas: {selectedDoc.signatureStatus}</p>
                <p className="text-[11px] text-slate-500">Tingkat Akses: {selectedDoc.securityBadge}</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Dokumen ini dilengkapi QR Code verifikasi keabsahan Peruri CA yang dapat divalidasi publik.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  showToast(`✓ Berkas "${selectedDoc.title}" berhasil diunduh ke perangkat Anda.`);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RIWAYAT PENGAJUAN SURAT (2 BERKAS) */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Riwayat Pengajuan Dokumen Mandiri
                  </h3>
                  <p className="text-[11px] text-slate-400">Total 2 Berkas Diajukan Periode 2025</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Surat Pengantar Visa Schengen</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Menunggu CHRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Tiket: REQ-DOC-2025-082 • Diajukan 22 Maret 2025</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Surat Keterangan Kerja (SKK KPR Bank)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Selesai &amp; Diterbitkan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Tiket: REQ-DOC-2025-014 • Selesai 14 Februari 2025</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL ALUR PELACAKAN PERMOHONAN */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pelacakan Alur Dokumen Real-time
                  </h3>
                  <p className="text-[11px] text-slate-400">{activeRequest.ticketNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                <p className="font-bold text-slate-900">{activeRequest.title}</p>
                <p className="text-[11px] text-slate-600">{activeRequest.targetPurpose}</p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">1. Verifikasi Data oleh HR Operations</p>
                    <p className="text-[11px] text-slate-400">Selesai pada 22 Maret 2025 • 11:30 WIB oleh Sarah N.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">2. Otorisasi &amp; Digital Signature CHRO</p>
                    <p className="text-[11px] text-blue-700 font-medium">Dalam antrean persetujuan Citra Lestari (CHRO)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-400">3. Penerbitan &amp; Pembubuhan E-Meterai Peruri</p>
                    <p className="text-[11px] text-slate-400">Berkas PDF otomatis siap unduh di portal ESS</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
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
