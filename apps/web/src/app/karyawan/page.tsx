'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { useApprovalsRealtime } from '@/hooks/useApprovalsRealtime';
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
  CalendarPlus,
  Receipt,
  Umbrella,
  Award,
  Megaphone,
  SlidersHorizontal,
  Users,
  FileText,
  Download,
  Eye,
  Check,
  X,
  Building2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Laptop,
  Briefcase,
  Loader2,
  FileCheck,
} from 'lucide-react';

export default function EmployeeDashboardOverhaulPage() {
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Popups
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isWfhPreferenceModalOpen, setIsWfhPreferenceModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloadingDoc, setIsDownloadingDoc] = useState<string | null>(null);

  // Live Date & Greeting
  const [currentDateStr, setCurrentDateStr] = useState('Senin, 24 Maret 2025');
  const [liveGreeting, setLiveGreeting] = useState('Selamat Pagi');

  // Weekly Schedule State (WFO / WFH)
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'SENIN', date: '24', month: 'Maret', type: 'WFO', location: 'WFO (SCBD)', isToday: true },
    { day: 'SELASA', date: '25', month: 'Maret', type: 'WFH', location: 'WFH', isToday: false },
    { day: 'RABU', date: '26', month: 'Maret', type: 'WFO', location: 'WFO (SCBD)', isToday: false },
    { day: 'KAMIS', date: '27', month: 'Maret', type: 'WFO', location: 'WFO (SCBD)', isToday: false },
    { day: 'JUMAT', date: '28', month: 'Maret', type: 'WFH', location: 'WFH', isToday: false },
  ]);

  // Leave Form State
  const [leaveCategory, setLeaveCategory] = useState('Cuti Tahunan');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Overtime Form State
  const [overtimeDate, setOvertimeDate] = useState('2025-03-24');
  const [overtimeHours, setOvertimeHours] = useState('3');
  const [overtimeReason, setOvertimeReason] = useState('Maintenance Database Core & Deployment Hotfix');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [activeQuota, setActiveQuota] = useState(8);

  // Backend Team Attendance
  const [teamMembers] = useState([
    { id: '1', initials: 'RP', name: 'Rian Pratama (Anda)', role: 'Lead Backend', status: 'WFO Lt. 7', color: 'blue' },
    { id: '2', initials: 'NW', name: 'Nadia Wijaya', role: 'Senior Go Developer', status: 'WFO Lt. 7', color: 'blue' },
    { id: '3', initials: 'DS', name: 'Dimas Surya', role: 'Database Engineer', status: 'WFH', color: 'purple' },
    { id: '4', initials: 'FH', name: 'Farhan Harahap', role: 'Backend Engineer', status: 'Cuti Sakit', color: 'amber' },
    { id: '5', initials: 'AN', name: 'Ahmad Nur', role: 'DevOps Specialist', status: 'WFO Lt. 7', color: 'blue' },
    { id: '6', initials: 'SL', name: 'Siti Lestari', role: 'QA Automation', status: 'WFH', color: 'purple' },
    { id: '7', initials: 'BK', name: 'Bambang Kurnia', role: 'API Security', status: 'WFO Lt. 7', color: 'blue' },
    { id: '8', initials: 'RT', name: 'Riko Tan', role: 'Junior Backend', status: 'WFO Lt. 7', color: 'blue' },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    if (hours >= 4 && hours < 11) setLiveGreeting('Selamat Pagi');
    else if (hours >= 11 && hours < 15) setLiveGreeting('Selamat Siang');
    else if (hours >= 15 && hours < 18) setLiveGreeting('Selamat Sore');
    else setLiveGreeting('Selamat Malam');

    setCurrentDateStr(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
  }, []);

  // Multi-device real-time SSE stream hook for employee dashboard
  useApprovalsRealtime({
    playAudioAlert: true,
    onLeaveActioned: ({ status, item }) => {
      if (status === 'APPROVED') {
        showToast(`🎉 Pengajuan cuti Anda telah DISETUJUI oleh HR Admin!`);
        if (item?.typeCategory === 'tahunan' && item?.durationDays) {
          setActiveQuota((prev) => Math.max(0, prev - item.durationDays));
        }
      } else if (status === 'REJECTED') {
        showToast(`ℹ️ Pengajuan cuti Anda telah DITOLAK oleh HR Admin.`);
      }
    },
  });

  // Handle Leave Submit (Rich real-time payload)
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveStartDate || !leaveEndDate) {
      showToast('⚠️ Silakan tentukan tanggal mulai dan tanggal selesai cuti!');
      return;
    }

    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);

    if (end < start) {
      showToast('⚠️ Tanggal selesai cuti tidak boleh mendahului tanggal mulai!');
      return;
    }

    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    if (leaveCategory.includes('Tahunan') && diffDays > activeQuota) {
      showToast(`⚠️ Saldo kuota tidak mencukupi! Anda meminta ${diffDays} hari, sisa kuota: ${activeQuota} hari.`);
      return;
    }

    setIsSubmittingLeave(true);

    try {
      const remainingAfter = leaveCategory.includes('Tahunan') ? Math.max(0, activeQuota - diffDays) : activeQuota;

      const payload = {
        name: 'Rian Pratama, S.Kom',
        nik: 'NX-2021008',
        role: 'Lead Backend Architect • Technology',
        department: 'Technology & Engineering',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        type: 'cuti',
        leaveType: leaveCategory,
        typeCategory: leaveCategory.toLowerCase().includes('sakit')
          ? 'sakit'
          : leaveCategory.toLowerCase().includes('khusus') || leaveCategory.toLowerCase().includes('menikah')
          ? 'khusus'
          : 'tahunan',
        title: `Pengajuan ${leaveCategory} (${diffDays} Hari: ${leaveStartDate} s/d ${leaveEndDate})`,
        highlightType: leaveCategory,
        detail: `${diffDays} Hari: ${leaveStartDate} s/d ${leaveEndDate}`,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        durationDays: diffDays,
        remainingQuota: remainingAfter,
        totalQuota: 12,
        reason: leaveReason || 'Keperluan Pribadi & Urusan Keluarga',
        quotaMeta: `Sisa Kuota: ${remainingAfter} Hari`,
        hasAttachment: leaveCategory.toLowerCase().includes('sakit'),
        attachmentName: leaveCategory.toLowerCase().includes('sakit') ? 'Surat_Keterangan_Sakit.pdf' : undefined,
        documentName: leaveCategory.toLowerCase().includes('sakit') ? 'Surat_Keterangan_Sakit.pdf' : undefined,
      };

      const res = await fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      const createdItem = resData?.data || payload;

      if (leaveCategory.includes('Tahunan')) {
        setActiveQuota(remainingAfter);
      }

      // Instant local tab sync
      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'NEW_APPROVAL_REQUEST', request: createdItem });
        ch.close();
      } catch {}

      setIsLeaveModalOpen(false);
      setLeaveReason('');
      showToast('✓ Pengajuan Cuti berhasil dikirim ke HRD dan terhubung secara real-time!');
    } catch {
      showToast('❌ Terjadi gangguan saat mengirim pengajuan cuti.');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Handle Overtime Submit
  const handleOvertimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOvertimeModalOpen(false);
    showToast(`✓ Pengajuan Lembur SPL (${overtimeHours} Jam) berhasil diajukan ke Tech Lead!`);

    try {
      fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Rian Pratama, S.Kom',
          role: 'Lead Backend Architect',
          type: 'lembur',
          title: `Surat Perintah Lembur (${overtimeHours} Jam)`,
          highlightType: 'Lembur Operasional (SPL)',
          detail: `${overtimeHours} Jam • ${overtimeReason}`,
          estimatedCost: 'Taksiran: Sesuai Regulasi Depnaker',
        }),
      }).catch(() => {});

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({ type: 'APPROVAL_SUBMITTED' });
      ch.close();
    } catch {}
  };

  // Document Download Simulation
  const handleDownloadDoc = (docName: string) => {
    setIsDownloadingDoc(docName);
    showToast(`Menyiapkan unduhan ${docName}...`);
    setTimeout(() => {
      setIsDownloadingDoc(null);
      showToast(`✓ Dokumen ${docName} berhasil diunduh (PDF Resmi Ber-QR Code)!`);
    }, 900);
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
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 justify-between p-4 sm:p-5 sticky top-0 md:h-screen z-30 shadow-2xs">
        <div className="space-y-5">
          {/* Logo Brand matching screenshot */}
          <Link href="/karyawan" className="flex items-center gap-3 group">
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

          {/* Active Session Pill matching screenshot */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sesi Aktif: NX-2021008</span>
          </div>

          {/* SECTION 1: UTAMA */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              UTAMA
            </p>

            {/* Beranda Saya (ACTIVE matching screenshot) */}
            <Link
              href="/karyawan"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-white" />
              <span>Beranda Saya</span>
            </Link>

            {/* Profil Saya */}
            <Link
              href="/karyawan/profile"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profil Saya</span>
            </Link>

            {/* Presensi & Absensi */}
            <Link
              href="/karyawan/attendance"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Presensi & Absensi</span>
            </Link>

            {/* Cuti & Izin Saya */}
            <Link
              href="/karyawan/leave"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span>Cuti & Izin Saya</span>
            </Link>

            {/* Slip Gaji & Kompensasi */}
            <Link
              href="/karyawan/payroll"
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
              href="/karyawan/performance"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span>Kinerja & KPI Pribadi</span>
            </Link>

            <Link
              href="/karyawan/training"
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
              href="/karyawan/documents"
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

        {/* BOTTOM CARD: PUSAT DUKUNGAN matching screenshot */}
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
                showToast('Membuka SOP Kepegawaian & Panduan ESS Nexora...');
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
                showToast('Membuka Form Tiket Helpdesk HR...');
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
          {/* Search Input Box matching screenshot */}
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

          {/* Right Header Controls matching screenshot */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Live Date display */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDateStr}</span>
            </div>

            {/* Real-time Notification Bell */}
            <NotificationBellDropdown portal="ess" />

            {/* User Profile Pill matching screenshot */}
            <Link
              href="/karyawan/profile"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
              title="Profil Pengguna Saya"
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

        {/* DASHBOARD CONTENT CONTAINER (With generous bottom padding to avoid any clipping) */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto pb-20">
          {/* BANNER: GREETING & QUICK ACTION BUTTONS matching screenshot */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
            <div className="space-y-1">
              {/* Top Tagline */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-[10px] uppercase tracking-wider">
                  PORTAL MANDIRI KARYAWAN
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-semibold text-xs">Tahun Anggaran 2025</span>
              </div>

              {/* Title with Emoji */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {liveGreeting}, Mas Rian! 👋
              </h1>

              {/* Subtitle details matching screenshot */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentDateStr}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jadwal: <strong>WFO (HQ SCBD Tower Lt. 7)</strong></span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Status Presensi: Tercatat</span>
                </span>
              </div>
            </div>

            {/* Quick Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Ajukan Cuti/Izin (Solid Blue) */}
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Ajukan Cuti/Izin</span>
              </button>

              {/* Ajukan Lembur (SPL) */}
              <button
                type="button"
                onClick={() => setIsOvertimeModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Ajukan Lembur (SPL)</span>
              </button>

              {/* Slip Gaji Maret */}
              <button
                type="button"
                onClick={() => setIsPayslipModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Slip Gaji Maret</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Presensi Hari Ini */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  PRESENSI HARI INI
                </span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">07:51</span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">WIB</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  ((•)) Terminal Lt. 7 (Biometrik)
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tepat Waktu
                </span>
              </div>
            </div>

            {/* Card 2: Saldo Cuti Tahunan */}
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
                <span className="text-3xl font-black text-slate-900 tracking-tight">8</span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">/ 12 Hari</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[66%]" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Terpakai: 4 Hari</span>
                <span>Hangus: Des 2025</span>
              </div>
            </div>

            {/* Card 3: Siklus Penggajian */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  SIKLUS PENGGAJIAN
                </span>
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  28 Maret 2025
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>T-4 Hari Pembayaran</span>
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Data Terkunci
                </span>
              </div>
            </div>

            {/* Card 4: Kinerja Q1 (Berjalan) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  KINERJA Q1 (BERJALAN)
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">4.85</span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">/ 5.0</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  <span>Predikat Sangat Baik</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  +0.15 YoY
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              {/* CARD 1: PENGUMUMAN HRD (Ramadhan Working Hours) matching screenshot */}
              <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
                  <Building2 className="w-44 h-44 text-white" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-white/10 text-white inline-flex items-center justify-center">
                        <Megaphone className="w-4 h-4" />
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/30 text-blue-100 border border-white/20 uppercase tracking-wider">
                        PENGUMUMAN HRD
                      </span>
                      <span className="text-[11px] text-blue-200 font-medium">
                        No. 018/HR-NOTIF/III/2025
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white pt-1">
                      Penyesuaian Jam Operasional Ramadhan 1446 H
                    </h3>

                    <p className="text-xs text-blue-100/90 leading-relaxed">
                      Selama bulan suci Ramadhan, jam kepulangan karyawan dimajukan menjadi pukul <strong>16:30 WIB</strong>. Jam istirahat dipadatkan menjadi 30 menit demi efisiensi bersama.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs shadow-md transition-all active:scale-95 flex-shrink-0 self-start sm:self-center"
                  >
                    <span>Lihat SE Direksi</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: JADWAL & KOMITMEN KERJA PEKAN INI matching screenshot */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Jadwal & Komitmen Kerja Pekan Ini
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Periode 24 - 28 Maret 2025 • Shift Reguler Core Hours (08:30 - 16:30 WIB)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsWfhPreferenceModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 self-start sm:self-auto"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ubah Preferensi WFH</span>
                  </button>
                </div>

                {/* 5 Day Schedule Cards Grid matching screenshot */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {weeklySchedule.map((item) => (
                    <div
                      key={item.day}
                      className={`rounded-2xl p-4 text-center transition-all ${
                        item.isToday
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white border border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <p
                        className={`text-[10px] font-extrabold tracking-wider uppercase ${
                          item.isToday ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {item.day}
                      </p>
                      <p
                        className={`text-2xl font-black mt-1 ${
                          item.isToday ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.date}
                      </p>
                      <p
                        className={`text-[10px] font-medium mb-3 ${
                          item.isToday ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.month}
                      </p>

                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          item.isToday
                            ? 'bg-white/20 text-white border border-white/30'
                            : item.type === 'WFO'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.location}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer of Weekly Schedule matching screenshot */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-500 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rasio kehadiran tim minimum WFO: <strong>60%</strong> per hari kerja.</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Sync Google Calendar aktif</span>
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (4 COLS) matching screenshot with full unclipped content */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* CARD 1: KEHADIRAN TIM BACKEND matching screenshot */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Kehadiran Tim Backend
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      6 dari 8 Anggota Aktif Hari Ini
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-3">
                  {teamMembers.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-2.5 py-1"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {member.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex-shrink-0 ${
                          member.color === 'blue'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : member.color === 'purple'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* View Roster Button matching screenshot */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRosterModalOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors text-center"
                  >
                    Lihat Roster Tim Lengkap
                  </button>
                </div>
              </div>

              {/* CARD 2: PINTASAN DOKUMEN MANDIRI (Fully unclipped with generous container & complete items!) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Pintasan Dokumen Mandiri
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Akses cepat surat resmi & slip gaji personal
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                {/* Complete Unclipped Document List */}
                <div className="space-y-3">
                  {/* Doc 1: Surat Keterangan Kerja (SKK) */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        Surat Keterangan Kerja (SKK)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Keperluan KPR / Bank / Visa
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isDownloadingDoc === 'SKK'}
                      onClick={() => handleDownloadDoc('SKK')}
                      className="p-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-600 shadow-2xs transition-all flex-shrink-0"
                      title="Unduh SKK Resmi"
                    >
                      {isDownloadingDoc === 'SKK' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Doc 2: Slip Gaji Digital Maret 2025 */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        Slip Gaji Digital (Maret 2025)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tervalidasi e-Sign HR Operations
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isDownloadingDoc === 'Payslip'}
                      onClick={() => handleDownloadDoc('Payslip')}
                      className="p-2 rounded-xl bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 text-slate-600 shadow-2xs transition-all flex-shrink-0"
                      title="Unduh Slip Gaji PDF"
                    >
                      {isDownloadingDoc === 'Payslip' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Doc 3: Formulir Klaim Medis */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        Formulir Klaim Medis / Resep
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Plafon Rawat Jalan & Kacamata
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isDownloadingDoc === 'Klaim'}
                      onClick={() => handleDownloadDoc('Klaim')}
                      className="p-2 rounded-xl bg-white hover:bg-purple-600 hover:text-white border border-slate-200 text-slate-600 shadow-2xs transition-all flex-shrink-0"
                      title="Unduh Form Klaim"
                    >
                      {isDownloadingDoc === 'Klaim' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Doc 4: E-Card BPJS */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        E-Card BPJS Ketenagakerjaan
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        No: 00291882190 (JHT & JP)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Membuka E-Card BPJS Ketenagakerjaan digital...')}
                      className="p-2 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-600 shadow-2xs transition-all flex-shrink-0"
                      title="Lihat Kartu BPJS"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer link to full archive */}
                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href="/karyawan/payroll"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                  >
                    <span>Buka Arsip Lengkap</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                  <span className="text-[10px] text-slate-400 font-medium">Auto-Archive</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: AJUKAN CUTI / IZIN */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pengajuan Izin / Cuti Karyawan
                  </h3>
                  <p className="text-[11px] text-slate-400">Sisa Hak Cuti: {activeQuota} Hari Aktif</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Cuti</label>
                <select
                  value={leaveCategory}
                  onChange={(e) => setLeaveCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Potong Hak 12 Hari)</option>
                  <option value="Izin Sakit">Izin Sakit (Medical Leave)</option>
                  <option value="Cuti Alasan Penting">Cuti Alasan Penting (Keluarga)</option>
                  <option value="Cuti Menikah">Cuti Menikah (3 Hari Resmi)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan / Keterangan Pengajuan
                </label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Jelaskan rencana izin dan delegasi tugas pekerjaan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmittingLeave && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingLeave ? 'Mengirim...' : 'Kirim Pengajuan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUKAN LEMBUR (SPL) */}
      {isOvertimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pengajuan Surat Perintah Lembur (SPL)
                  </h3>
                  <p className="text-[11px] text-slate-400">Verifikasi otomatis ke Tech Lead</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOvertimeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOvertimeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Lembur</label>
                <input
                  type="date"
                  required
                  value={overtimeDate}
                  onChange={(e) => setOvertimeDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimasi Durasi Jam</label>
                <select
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="1">1 Jam</option>
                  <option value="2">2 Jam</option>
                  <option value="3">3 Jam</option>
                  <option value="4">4 Jam (Maksimal Hari Kerja)</option>
                  <option value="6">6 Jam (Akhir Pekan / Hari Libur)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Uraian Tugas &amp; Deliverables
                </label>
                <textarea
                  rows={3}
                  required
                  value={overtimeReason}
                  onChange={(e) => setOvertimeReason(e.target.value)}
                  placeholder="Jelaskan kebutuhan operasional teknis..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOvertimeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Kirim SPL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LIHAT SE DIREKSI (Ramadhan Hours) */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Surat Edaran Direksi: Ramadhan 1446 H
                  </h3>
                  <p className="text-[11px] text-slate-400">Nomor: 018/HR-NOTIF/III/2025</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900">
                Ketentuan Jam Kerja Selama Bulan Suci Ramadhan:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Hari Senin - Kamis: Pukul 08:30 - 16:30 WIB (Istirahat: 12:00 - 12:30 WIB)</li>
                <li>Hari Jumat: Pukul 08:30 - 16:30 WIB (Istirahat Shalat Jumat: 11:45 - 12:45 WIB)</li>
                <li>Kebijakan Hybrid Working: Tetap berlaku 3 hari WFO dan 2 hari WFH per pekan.</li>
                <li>Ketepatan Waktu: Presensi tap-in tetap dibuka mulai pukul 07:00 WIB.</li>
              </ul>
              <p className="text-[11px] text-slate-500 pt-1">
                Ditetapkan di Jakarta oleh Dewan Direksi PT Nexora Solusi Nusantara.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: UBAH PREFERENSI WFH */}
      {isWfhPreferenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Ubah Preferensi Lokasi Kerja
                  </h3>
                  <p className="text-[11px] text-slate-400">Atur komitmen hari WFO / WFH pekan ini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWfhPreferenceModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {weeklySchedule.map((item, index) => (
                <div
                  key={item.day}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <span className="font-bold text-slate-800">
                    {item.day}, {item.date} {item.month}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...weeklySchedule];
                        copy[index].type = 'WFO';
                        copy[index].location = 'WFO (SCBD)';
                        setWeeklySchedule(copy);
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        item.type === 'WFO'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      WFO
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...weeklySchedule];
                        copy[index].type = 'WFH';
                        copy[index].location = 'WFH';
                        setWeeklySchedule(copy);
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        item.type === 'WFH'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      WFH
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsWfhPreferenceModalOpen(false);
                  showToast('✓ Preferensi jadwal WFH berhasil diperbarui & disinkronkan ke tim!');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Simpan Komitmen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: LIHAT ROSTER TIM LENGKAP */}
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
                    Roster Kehadiran Tim Backend
                  </h3>
                  <p className="text-[11px] text-slate-400">Total 8 Anggota Divisi Engineering</p>
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

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100 text-xs">
              {teamMembers.map((member) => (
                <div key={member.id} className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                      {member.initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{member.name}</p>
                      <p className="text-[10px] text-slate-400">{member.role}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                      member.color === 'blue'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : member.color === 'purple'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Tutup Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: SLIP GAJI DIGITAL MARET */}
      {isPayslipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Rincian Slip Gaji — Maret 2025
                  </h3>
                  <p className="text-[11px] text-slate-400">Periode Kerja: 01 - 31 Maret 2025</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayslipModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Gaji Pokok (Basic Salary)</span>
                <span className="font-mono font-bold text-slate-900">Rp 18.500.000</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Tunjangan Posisi &amp; Komunikasi</span>
                <span className="font-mono font-bold text-slate-900">Rp 3.500.000</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Uang Makan &amp; Kehadiran (WFO)</span>
                <span className="font-mono font-bold text-slate-900">Rp 1.800.000</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 text-rose-600">
                <span>Potongan BPJS &amp; PPh 21</span>
                <span className="font-mono font-bold">- Rp 1.150.000</span>
              </div>
              <div className="flex justify-between items-center pt-2 font-bold text-sm text-blue-700">
                <span>Total Penghasilan Bersih (THP)</span>
                <span className="font-mono text-base">Rp 22.650.000</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleDownloadDoc('Slip Gaji Maret 2025')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Dokumen PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
