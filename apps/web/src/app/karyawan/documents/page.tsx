'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  Download,
  ShieldCheck,
  ChevronDown,
  X,
  FileText,
  Printer,
  AlertCircle,
  Users,
  MessageSquare,
  BookmarkCheck,
  Activity,
  FilePlus,
  Receipt,
  Box,
  Eye,
  MoreVertical,
  FileCode,
  Briefcase,
  PanelLeft,
  PanelLeftClose,
  Menu,
  Search,
} from 'lucide-react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import {
  DocumentItem,
  RequestTrackingItem,
  EMeteraiQuota,
} from '@/app/api/v1/documents/route';
import {
  downloadOfficialDocument,
  printOfficialDocument,
  OfficialDocParams,
} from '@/lib/officialDocumentGenerator';

export default function EssDocumentsPage() {
  const { user: currentUser } = useCurrentUser();
  const {
    isCollapsed: isSidebarCollapsed,
    toggle: toggleSidebar,
    isMobileOpen,
    openMobile,
    closeMobile,
  } = useSidebarCollapse();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'legal' | 'letter' | 'tax' | 'template'>('legal');
  const [yearFilter, setYearFilter] = useState('Semua');
  const [formatFilter, setFormatFilter] = useState('Semua');

  // Dynamic real-time date state
  const [todayDate, setTodayDate] = useState<{ dayName: string; dayNum: string; monthYear: string }>({
    dayName: 'Senin',
    dayNum: '24',
    monthYear: 'Maret 2025',
  });

  // Dynamic state from API
  const [documentList, setDocumentList] = useState<DocumentItem[]>([]);
  const [requestsList, setRequestsList] = useState<RequestTrackingItem[]>([]);
  const [eMeteraiQuota, setEMeteraiQuota] = useState<EMeteraiQuota>({ used: 3, total: 5, year: 2025 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [selectedTrackingItem, setSelectedTrackingItem] = useState<RequestTrackingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Request Form State
  const [requestDocType, setRequestDocType] = useState('Surat Keterangan Penghasilan (Salary Slip)');
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestTargetOrg, setRequestTargetOrg] = useState('');
  const [requestUrgency, setRequestUrgency] = useState('Standar (1-2 Hari Kerja)');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Set real Indonesian date
  useEffect(() => {
    try {
      const now = new Date();
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(now);
      const dayNum = new Intl.DateTimeFormat('id-ID', { day: 'numeric' }).format(now);
      const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);
      setTodayDate({ dayName, dayNum, monthYear });
    } catch {}
  }, []);

  // Fetch live documents & requests dataset
  const fetchLiveDocuments = useCallback(async () => {
    const nik = currentUser.employeeNumber || 'NX-2021008';
    try {
      const res = await fetch(`/api/v1/documents?nik=${encodeURIComponent(nik)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.documents) setDocumentList(json.documents);
        if (json.requests) setRequestsList(json.requests);
        if (json.eMeteraiQuota) setEMeteraiQuota(json.eMeteraiQuota);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.employeeNumber]);

  // Real-time listener for document updates & broadcast channel
  useEffect(() => {
    fetchLiveDocuments();
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('nexora_live_sync');
      bc.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        if (
          msg.type === 'DOCUMENTS_UPDATED' ||
          msg.type === 'DOCUMENT_REQUEST_CREATED' ||
          msg.type === 'DOCUMENT_REQUEST_UPDATED' ||
          msg.type === 'APPROVAL_UPDATED' ||
          msg.type === 'PROFILE_UPDATED'
        ) {
          fetchLiveDocuments();
          if (msg.type === 'DOCUMENT_REQUEST_UPDATED') {
            if (msg.status === 'APPROVED') {
              showToast('✓ Permohonan surat Anda telah disahkan & dokumen resmi telah diterbitkan!');
            } else if (msg.status === 'REJECTED') {
              showToast('✕ Permohonan surat Anda ditolak oleh HR Operations.');
            } else {
              showToast('⚡ Status tahapan verifikasi dokumen Anda telah diperbarui.');
            }
          }
        }
      };
    } catch {}

    const handleFocus = () => fetchLiveDocuments();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchLiveDocuments]);

  // Active / Most recent request for the right sidebar
  const activeRequest: RequestTrackingItem | null = useMemo(() => {
    if (requestsList.length === 0) return null;
    const inProgress = requestsList.find((r) => r.currentStep < r.totalSteps);
    return inProgress || requestsList[0];
  }, [requestsList]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      legal: documentList.filter((d) => d.category === 'legal').length,
      letter: documentList.filter((d) => d.category === 'letter').length,
      tax: documentList.filter((d) => d.category === 'tax').length,
      template: documentList.filter((d) => d.category === 'template').length,
    };
  }, [documentList]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documentList.filter((doc) => {
      if (activeTab === 'legal' && doc.category !== 'legal') return false;
      if (activeTab === 'letter' && doc.category !== 'letter') return false;
      if (activeTab === 'tax' && doc.category !== 'tax') return false;
      if (activeTab === 'template' && doc.category !== 'template') return false;

      if (yearFilter !== 'Semua' && !doc.updatedDate.includes(yearFilter)) return false;
      if (formatFilter !== 'Semua') {
        if (formatFilter === 'PDF' && !doc.formatBadge.includes('PDF')) return false;
        if (formatFilter === 'DOCX' && !doc.formatBadge.includes('DOCX')) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchNumber = doc.docNumber.toLowerCase().includes(q);
        const matchStatus = doc.signatureStatus.toLowerCase().includes(q);
        if (!matchTitle && !matchNumber && !matchStatus) return false;
      }

      return true;
    });
  }, [documentList, activeTab, yearFilter, formatFilter, searchQuery]);

  // Helper to construct official doc params
  const getDocParams = (doc: DocumentItem): OfficialDocParams => {
    return {
      title: doc.title,
      docNumber: doc.docNumber,
      updatedDate: doc.updatedDate,
      category: doc.category,
      formatBadge: doc.formatBadge,
      signatureStatus: doc.signatureStatus,
      securityBadge: doc.securityBadge,
      employeeName: currentUser.fullName,
      employeeNik: currentUser.employeeNumber || 'NX-2021008',
      employeeRole: currentUser.designation,
      employeeDept: currentUser.department,
      officialContent: doc.officialContent,
    };
  };

  // Download official SOP-compliant document
  const handleDownloadDoc = (doc: DocumentItem) => {
    const params = getDocParams(doc);
    downloadOfficialDocument(params);
    showToast(`✓ Berkas resmi "${doc.title}" berhasil diunduh sesuai SOP Perusahaan.`);
  };

  // Print official document
  const handlePrintDoc = (doc: DocumentItem) => {
    const params = getDocParams(doc);
    printOfficialDocument(params);
  };

  // Create new document request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRequest(true);

    const nik = currentUser.employeeNumber || 'NX-2021008';
    try {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik,
          employeeName: currentUser.fullName || 'Rian Pratama, S.Kom',
          employeeRole: currentUser.designation || 'Lead Backend Architect',
          department: currentUser.department || 'Teknologi Informasi',
          title: requestDocType,
          targetPurpose: requestPurpose,
          targetOrg: requestTargetOrg,
          urgency: requestUrgency,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setIsNewRequestModalOpen(false);
        setRequestPurpose('');
        setRequestTargetOrg('');
        fetchLiveDocuments();

        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({
            type: 'DOCUMENT_REQUEST_CREATED',
            nik,
            name: currentUser.fullName || 'Rian Pratama, S.Kom',
            title: requestDocType,
            ticketNo: json.data?.ticketNo,
          });
          bc.close();
        } catch {}

        showToast(
          `✓ Permohonan "${requestDocType}" berhasil diajukan dengan nomor tiket ${
            json.data?.ticketNo || '#REQ-DOC-2026-083'
          }.`
        );
      }
    } catch {}

    setIsSubmittingRequest(false);
  };

  // Download tax document shortcut from Card 3
  const handleDownloadTaxDoc = () => {
    const taxDoc = documentList.find((d) => d.category === 'tax') || documentList[2];
    if (taxDoc) {
      handleDownloadDoc(taxDoc);
    } else {
      showToast('Mengunduh Formulir Bukti Potong Pajak SPT 1721-A1...');
    }
  };

  // Download all verified documents bundle (.zip)
  const handleDownloadAllZip = () => {
    showToast('Mempersiapkan bundel arsip resmi seluruh dokumen terverifikasi (.zip)...');
    setTimeout(() => {
      // Trigger download of primary official doc
      if (documentList.length > 0) {
        handleDownloadDoc(documentList[0]);
      }
      showToast('✓ Berkas arsip digital dokumen kepegawaian berhasil diunduh.');
    }, 600);
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

      {/* LEFT SIDEBAR with Collapse/Expand */}
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
              className="flex md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0 cursor-pointer"
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
                placeholder="Cari nama dokumen, nomor SK, atau jenis permohonan..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Dynamic Real-Time Date */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col text-[11px] leading-tight text-left">
                <span className="font-bold text-slate-800">
                  {todayDate.dayName}, {todayDate.dayNum}
                </span>
                <span className="text-slate-500 font-medium">{todayDate.monthYear}</span>
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

        {/* PAGE CONTENT CONTAINER */}
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

              {/* Subtitle bound dynamically to logged in employee NIK */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Akses arsip dokumen legalitas kerja, unduh bukti potong pajak, cetak surat keterangan instan, dan kelola template permohonan kepegawaian resmi yang terikat pada NIK{' '}
                <strong className="text-slate-800 font-mono">
                  {currentUser.employeeNumber || 'NX-2021008'}
                </strong>.
              </p>
            </div>

            {/* Top Right Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Riwayat Pengajuan Surat Button */}
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>Riwayat Pengajuan Surat</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                  {requestsList.length} Berkas
                </span>
              </button>

              {/* + Buat Permohonan Dokumen Baru (Solid Blue Button) */}
              <button
                type="button"
                onClick={() => setIsNewRequestModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
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
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {documentList.length}
                </span>
                <span className="text-slate-500 font-bold text-xs">Berkas Tersedia</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Terverifikasi HRD</span>
                </span>
                <span className="text-slate-400 text-[11px]">Semua mutakhir</span>
              </div>

              {/* Solid blue accent bar at bottom */}
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
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {requestsList.filter((r) => r.currentStep < r.totalSteps).length}
                </span>
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
                  onClick={handleDownloadTaxDoc}
                  className="font-bold text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 cursor-pointer"
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
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {eMeteraiQuota.used}
                </span>
                <span className="text-slate-400 font-bold text-lg">
                  / {eMeteraiQuota.total} Kuota
                </span>
              </div>

              <p className="text-[11px] text-slate-500 pt-0.5">
                Tersedia untuk legalisir internal {eMeteraiQuota.year}
              </p>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round((eMeteraiQuota.used / eMeteraiQuota.total) * 100)}%`,
                  }}
                />
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
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'legal'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Dokumen Legalitas &amp; Kontrak</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    activeTab === 'legal' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tabCounts.legal}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('letter')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'letter'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Surat Keterangan &amp; Visa Kerja</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    activeTab === 'letter' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tabCounts.letter}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tax')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'tax'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Perpajakan &amp; Finansial (SPT/Slip)</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    activeTab === 'tax' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tabCounts.tax}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('template')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'template'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Template Formulir HR</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    activeTab === 'template' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tabCounts.template}
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
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadAllZip}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Arsip (.zip)</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS): LIST OF OFFICIAL DOCUMENTS */}
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
                        <span>
                          No: <strong className="font-mono text-slate-700">{doc.docNumber}</strong>
                        </span>
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pratinjau</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(doc)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintDoc(doc)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      title="Cetak Langsung Dokumen Resmi Ini"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN (4 COLS): ACTIVE REQUEST TRACKING & TEMPLATES */}
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
                    {requestsList.filter((r) => r.currentStep < r.totalSteps).length} Aktif
                  </span>
                </div>

                {/* Active Request Card */}
                {activeRequest ? (
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
                        TAHAP {activeRequest.currentStep}/{activeRequest.totalSteps}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-600 pt-1 border-t border-slate-200/80">
                      <p>
                        No. Pengajuan:{' '}
                        <strong className="font-mono text-slate-900">{activeRequest.ticketNo}</strong>
                      </p>
                      <p>Diajukan pada: {activeRequest.submittedAt}</p>
                      <p>
                        Status Otorisasi:{' '}
                        <strong className="text-blue-700">{activeRequest.statusLabel}</strong>
                      </p>
                    </div>

                    {/* 3-Step Progress Indicator */}
                    <div className="flex items-center justify-between text-[10px] font-bold pt-1">
                      {activeRequest.steps.map((st, i) => (
                        <span
                          key={i}
                          className={
                            st.status === 'completed'
                              ? 'text-emerald-700'
                              : st.status === 'active'
                              ? 'text-blue-700 font-extrabold'
                              : 'text-slate-400 font-normal'
                          }
                        >
                          {st.title}
                        </span>
                      ))}
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(
                            (activeRequest.currentStep / activeRequest.totalSteps) * 100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeRequest.estimatedCompletion}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTrackingItem(activeRequest);
                          setIsTrackingModalOpen(true);
                        }}
                        className="font-bold text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>Lihat Detail Alur</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Tidak ada permohonan yang sedang berjalan.</p>
                )}
              </div>

              {/* Card 2: Template Permohonan Cepat matching screenshot */}
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
                      setRequestDocType('Surat Keterangan Penghasilan (Salary Slip)');
                      setIsNewRequestModalOpen(true);
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-left transition-all space-y-0.5 group cursor-pointer"
                  >
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Surat Keterangan Penghasilan (Salary Slip)
                    </p>
                    <p className="text-[11px] text-slate-400">Untuk keperluan leasing, aplikasi visa, atau perbankan.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRequestDocType('Surat Pengantar Sponsor Visa Dinas Luar Negeri');
                      setIsNewRequestModalOpen(true);
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-left transition-all space-y-0.5 group cursor-pointer"
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
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 text-left transition-all space-y-0.5 group cursor-pointer"
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
                  <option value="Surat Keterangan Penghasilan (Salary Slip)">Surat Keterangan Penghasilan (Salary Slip)</option>
                  <option value="Surat Pengantar Sponsor Visa Dinas Luar Negeri">Surat Pengantar Sponsor Visa Dinas Luar Negeri</option>
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingRequest && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Ajukan Permohonan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRATINJAU DOKUMEN RESMI (SOP COMPLIANT & CLEAN A4 PREVIEW) */}
      {isPreviewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pratinjau Dokumen Resmi Standar Perusahaan
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedDoc.docNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Document Sheet Preview */}
            <div className="p-6 rounded-2xl bg-white border border-slate-300 shadow-inner text-xs text-slate-800 space-y-4 font-serif">
              {/* Kop Surat */}
              <div className="border-b-2 border-double border-slate-900 pb-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-700 text-white font-sans font-black text-xl flex items-center justify-center rounded-lg flex-shrink-0">
                  NX
                </div>
                <div className="text-center flex-1 font-sans">
                  <h4 className="font-black text-sm tracking-wide text-slate-950 uppercase">
                    PT NEXORA DIGITAL NUSANTARA
                  </h4>
                  <p className="text-[9px] font-bold text-blue-900 tracking-wider">
                    HUMAN CAPITAL &amp; CORPORATE LEGAL AFFAIRS DIVISION
                  </p>
                  <p className="text-[8.5px] text-slate-500 leading-tight mt-0.5">
                    Menara Nexora Lt. 18-20, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190 • SK Kemenkumham AHU-0019284
                  </p>
                </div>
              </div>

              {/* Title & Ref */}
              <div className="text-center space-y-0.5 py-1 font-sans">
                <h5 className="font-extrabold text-xs text-slate-900 underline uppercase tracking-wide">
                  {selectedDoc.officialContent?.header || selectedDoc.title}
                </h5>
                <p className="text-[10px] font-mono text-slate-600 font-bold">
                  {selectedDoc.officialContent?.docRef || `Nomor: ${selectedDoc.docNumber}`}
                </p>
                <p className="text-[9px] text-slate-400 italic">
                  {selectedDoc.officialContent?.legalBasis || 'Standar Operasional Prosedur Manajemen SDM PT Nexora'}
                </p>
              </div>

              {/* Employee Particulars */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-sans text-[11px] space-y-1">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">Nama Karyawan:</span>
                  <span className="col-span-2 font-bold text-slate-900">{currentUser.fullName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">NIK / NIP:</span>
                  <span className="col-span-2 font-mono font-bold text-slate-900">
                    {currentUser.employeeNumber || 'NX-2021008'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500 font-semibold">Jabatan &amp; Unit:</span>
                  <span className="col-span-2 text-slate-900">
                    {currentUser.designation} ({currentUser.department})
                  </span>
                </div>
              </div>

              {/* Clauses */}
              <div className="space-y-2 text-[10.5px] leading-relaxed text-slate-700">
                {(
                  selectedDoc.officialContent?.clauses || [
                    {
                      pasal: 'PASAL 1 - KETENTUAN POKOK',
                      content:
                        'Dokumen ini merupakan arsip legalitas resmi yang mengikat hubungan industrial antara perusahaan dan karyawan bersangkutan sesuai peraturan perundang-undangan Republik Indonesia.',
                    },
                    {
                      pasal: 'PASAL 2 - KEABSAHAN HUKUM',
                      content:
                        'Telah melalui tahapan verifikasi HRD dan dibubuhi tanda tangan elektronik tersertifikasi (Digital Signature Peruri CA) dengan integritas data terlindungi.',
                    },
                  ]
                ).map((c, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="font-bold text-slate-900 font-sans text-[10px]">{c.pasal}</p>
                    <p className="text-justify">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Digital Stamp & Signatures */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-sans">
                <div className="space-y-0.5">
                  <span className="text-slate-400">Pihak Karyawan:</span>
                  <p className="font-bold text-slate-900 underline">{currentUser.fullName}</p>
                  <p className="text-slate-400">Terverifikasi Akun ESS</p>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-slate-400">{selectedDoc.officialContent?.signingDate || 'Jakarta'}</span>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[9px] my-0.5">
                    <span>E-METERAI RESMI PERURI</span>
                  </div>
                  <p className="font-bold text-slate-900 underline">
                    {selectedDoc.officialContent?.firstPartySigner || 'Citra Lestari, S.Psi, M.M.'}
                  </p>
                  <p className="text-slate-400">Chief Human Resources Officer</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dokumen Resmi Sesuai SOP &amp; Ber-Meterai Sah</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintDoc(selectedDoc)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadDoc(selectedDoc);
                    setIsPreviewModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen Resmi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RIWAYAT PENGAJUAN SURAT */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Riwayat Pengajuan Dokumen Mandiri
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Total {requestsList.length} Berkas Diajukan Periode 2025
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {requestsList.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1 hover:bg-blue-50/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{req.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        req.currentStep >= req.totalSteps
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {req.statusLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tiket: <strong className="font-mono text-slate-700">{req.ticketNo}</strong> • Diajukan {req.submittedAt}
                  </p>
                  <p className="text-[11px] text-slate-600 italic">{req.targetPurpose}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL ALUR PELACAKAN PERMOHONAN */}
      {isTrackingModalOpen && selectedTrackingItem && (
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
                  <p className="text-[11px] text-slate-400 font-mono">{selectedTrackingItem.ticketNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                <p className="font-bold text-slate-900">{selectedTrackingItem.title}</p>
                <p className="text-[11px] text-slate-600">{selectedTrackingItem.targetPurpose}</p>
              </div>

              <div className="space-y-2.5 pt-1">
                {selectedTrackingItem.steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        st.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : st.status === 'active'
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {st.status === 'completed' ? '✓' : i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{st.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {st.timestamp} {st.approver ? `• oleh ${st.approver}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
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
