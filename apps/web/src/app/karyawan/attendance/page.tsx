'use client';

import React, { useState, useEffect } from 'react';
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
  MapPin,
  RefreshCw,
  Sliders,
  Utensils,
  Navigation,
  LogOut,
  SlidersHorizontal,
  Plus,
  Edit3,
  ArrowRight,
  Sparkles,
  Fingerprint,
  LogIn,
  Hourglass,
  Ticket,
  Timer,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

interface OvertimeItem {
  ticketNo: string;
  title: string;
  date: string;
  hours: number;
  approver: string;
  status: 'APPROVED' | 'PENDING';
  statusLabel: string;
}

interface CorrectionItem {
  ticketNo: string;
  type: string;
  date: string;
  revisedTime: string;
  reason: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  statusLabel: string;
}

export default function EssAttendanceOverhaulPage() {
  const { user: currentUser } = useCurrentUser();
  const { isSidebarCollapsed, toggleSidebar } = useSidebarCollapse();
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Live Digital Clock state
  const [liveTime, setLiveTime] = useState('09:57:44 WIB');
  const [liveDate, setLiveDate] = useState('Senin, 24 Maret 2025');

  // Modals state
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isExternalVisitModalOpen, setIsExternalVisitModalOpen] = useState(false);
  const [isCalibratingGps, setIsCalibratingGps] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check-out Status State
  const [hasClockedOut, setHasClockedOut] = useState(false);
  const [clockOutTimeStr, setClockOutTimeStr] = useState('-- : -- : -- WIB');

  // Break Time Status
  const [isBreakTaken, setIsBreakTaken] = useState(false);

  // Correction Form State
  const [correctionDate, setCorrectionDate] = useState('2025-03-24');
  const [correctionType, setCorrectionType] = useState('Lupa Tap-Out');
  const [correctionTargetTime, setCorrectionTargetTime] = useState('16:30');
  const [correctionReason, setCorrectionReason] = useState('');
  const [remainingCorrectionQuota, setRemainingCorrectionQuota] = useState(2);

  // Overtime Form State
  const [overtimeTitle, setOvertimeTitle] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('3.0');
  const [overtimeDate, setOvertimeDate] = useState('2025-03-24');

  // Overtime list
  const [overtimeList, setOvertimeList] = useState<OvertimeItem[]>([
    {
      ticketNo: '#OT-202503-021',
      title: 'Pemeliharaan Basis Data Core V2 & Migrasi Klaster DB',
      date: 'Kamis, 20 Mar 2025',
      hours: 3.0,
      approver: 'Arya Wibowo',
      status: 'APPROVED',
      statusLabel: 'Disetujui Manager',
    },
  ]);

  // Correction history list
  const [correctionList, setCorrectionList] = useState<CorrectionItem[]>([
    {
      ticketNo: '#ADJ-2025-001',
      type: 'Lupa Tap-Out (Dinas Luar Meeting SCBD)',
      date: '12 Mar 2025',
      revisedTime: '18:00 WIB',
      reason: 'Meeting koordinasi klien hingga malam di SCBD Tower 2',
      status: 'APPROVED',
      statusLabel: 'Disetujui HR & Manager',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clock ticker
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveTime(
        `${now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })} WIB`
      );
      setLiveDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // GPS Calibration simulation
  const handleCalibrateGps = () => {
    setIsCalibratingGps(true);
    showToast('Mengalibrasi titik koordinat GPS dan akurasi biometrik...');
    setTimeout(() => {
      setIsCalibratingGps(false);
      showToast('✓ Kalibrasi berhasil! Koordinat akurat (-6.2253°, 106.8091°), radius 18m valid.');
    }, 800);
  };

  // Handle Check-out
  const handlePerformCheckOut = () => {
    const timeStr = `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
    setHasClockedOut(true);
    setClockOutTimeStr(timeStr);
    setIsCheckOutModalOpen(false);
    showToast(`✓ Check-Out Berhasil dicatat (${timeStr})! Terima kasih atas dedikasi Anda hari ini.`);

    try {
      fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.employeeNumber,
          employeeName: currentUser.fullName,
          type: 'CLOCK_OUT',
          time: timeStr,
          location: 'HQ Jakarta — Pacific Tower SCBD Lt. 7',
        }),
      }).catch(() => {});

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({ type: 'ATTENDANCE_RECORDED', employeeName: currentUser.fullName, time: timeStr });
      ch.close();
    } catch {}
  };

  // Handle Correction Submit
  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingCorrectionQuota <= 0) {
      showToast('Batas kuota koreksi mandiri bulan ini telah habis.');
      return;
    }

    const newTicket: CorrectionItem = {
      ticketNo: `#ADJ-2025-00${Math.floor(2 + Math.random() * 8)}`,
      type: `${correctionType} (${correctionTargetTime} WIB)`,
      date: correctionDate,
      revisedTime: `${correctionTargetTime} WIB`,
      reason: correctionReason || 'Pengajuan koreksi presensi mandiri',
      status: 'PENDING',
      statusLabel: 'Menunggu Review Atasan',
    };

    setCorrectionList([newTicket, ...correctionList]);
    setRemainingCorrectionQuota((prev) => Math.max(0, prev - 1));
    setIsCorrectionModalOpen(false);
    setCorrectionReason('');
    showToast(`✓ Permohonan ${newTicket.ticketNo} berhasil diajukan ke HR Operations & Arya Wibowo.`);
  };

  // Handle Overtime Submit
  const handleOvertimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOT: OvertimeItem = {
      ticketNo: `#OT-202503-0${Math.floor(22 + Math.random() * 30)}`,
      title: overtimeTitle || 'Lembur Operasional Backend Release',
      date: overtimeDate,
      hours: parseFloat(overtimeHours),
      approver: 'Arya Wibowo',
      status: 'PENDING',
      statusLabel: 'Menunggu Verifikasi',
    };

    setOvertimeList([newOT, ...overtimeList]);
    setIsOvertimeModalOpen(false);
    setOvertimeTitle('');
    showToast(`✓ Pengajuan lembur ${newOT.ticketNo} (${newOT.hours} Jam) berhasil diajukan!`);

    try {
      fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser.fullName,
          nik: currentUser.employeeNumber,
          role: currentUser.designation,
          department: currentUser.department,
          type: 'lembur',
          title: newOT.title,
          highlightType: 'Lembur Operasional',
          detail: `${newOT.hours} Jam • ${newOT.date}`,
        }),
      }).catch(() => {});

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({ type: 'APPROVAL_SUBMITTED' });
      ch.close();
    } catch {}
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
        activeMenu="attendance"
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
                <span>/</span>
                <span className="text-slate-800 font-bold">Presensi &amp; Absensi Mandiri</span>
              </div>

              {/* Title matching screenshot */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Presensi &amp; Waktu Kerja Mandiri
              </h1>

              {/* Status Pill on its own line matching screenshot */}
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Status: Aktif Bekerja (Tercatat 07:51 WIB)</span>
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Kelola catatan jam kerja, verifikasi check-in/out biometrik &amp; geofencing kantor, klaim lembur (SPL), serta ajukan dispensasi koreksi kehadiran secara mandiri.
              </p>
            </div>

            {/* Top Right Action Buttons matching screenshot */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Ajukan Koreksi Presensi (White Button) */}
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span>Ajukan Koreksi Presensi</span>
              </button>

              {/* Catat Presensi (Check-Out) (Solid Blue Button) */}
              <button
                type="button"
                onClick={() => setIsCheckOutModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Clock className="w-4 h-4" />
                <span>Catat Presensi (Check-Out)</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Kehadiran Bulan Ini */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Kehadiran Bulan Ini</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">21</span>
                  <span className="text-slate-400 font-bold text-2xl mx-1">/</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">21</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Sempurna
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>0 Terlambat • 0 Alpha</span>
              </div>

              {/* Solid blue accent bar at bottom matching screenshot */}
              <div className="pt-0.5">
                <div className="w-28 h-1 bg-blue-600 rounded-full" />
              </div>
            </div>

            {/* Card 2: Jam Kerja Akumulasi */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Jam Kerja Akumulasi</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">168.5</span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">Jam</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <span className="font-bold">↑ +8.5 Jam</span>
                <span className="text-slate-500 font-normal">Waktu Produktif / Lembur</span>
              </div>

              {/* Solid blue accent bar at bottom matching screenshot */}
              <div className="pt-0.5">
                <div className="w-28 h-1 bg-blue-600 rounded-full" />
              </div>
            </div>

            {/* Card 3: Status Check-In Hari Ini */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Status Check-In Hari Ini</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <LogIn className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">07:51</span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">WIB</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium truncate">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Biometrik Mesin Lt. 7 HQ SCBD</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-slate-500 font-medium">Target: 08:30 WIB</span>
                <span className="text-emerald-700 font-bold text-[11px]">39 Menit Lebih Awal</span>
              </div>
            </div>

            {/* Card 4: Sisa Kuota Koreksi Mandiri */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Sisa Kuota Koreksi Mandiri</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {remainingCorrectionQuota}
                  </span>
                  <span className="text-slate-400 font-bold text-2xl mx-1">/</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">3</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Kuota Tersedia
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                @ Sesuai PKB HR Pasal 14
              </div>

              {/* Segmented bar matching screenshot (2/3 blue, 1/3 gray) */}
              <div className="pt-0.5">
                <div className="w-28 grid grid-cols-3 gap-1 h-1">
                  <div className="bg-blue-600 rounded-full h-full" />
                  <div className="bg-blue-600 rounded-full h-full" />
                  <div className="bg-slate-200 rounded-full h-full" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS): LIVE ATTENDANCE & GEOLOCATION CARD */}
            <div className="lg:col-span-8 space-y-6">
              {/* MAIN CARD: Presensi Biometrik & Geofence SCBD matching screenshot */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
                {/* Header Row: Live Clock, Status, and Work Model */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                        {liveTime}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Sinkronisasi GPS Server Aktif</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {liveDate} • Waktu Indonesia Barat (UTC+7)
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 self-start sm:self-auto">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>WFO (Work From Office)</span>
                  </div>
                </div>

                {/* Geolocation Radius Box matching screenshot */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          HQ Jakarta — Pacific Tower SCBD Lt. 7
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Area Valid (Radius 18m)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Presensi biometrik &amp; geofence terverifikasi pada titik koordinat{' '}
                        <strong className="text-slate-800 font-mono">-6.2253°, 106.8091°</strong>{' '}
                        (Akurasi Tinggi ±3m).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isCalibratingGps}
                    onClick={handleCalibrateGps}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 flex-shrink-0 disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isCalibratingGps ? 'animate-spin' : ''}`} />
                    <span>Kalibrasi Lokasi</span>
                  </button>
                </div>

                {/* 3-Grid Shift Details matching screenshot */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Shift Ditugaskan */}
                  <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                      <span>Shift Ditugaskan</span>
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-snug">
                      Reguler Ramadhan 1446H
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      08:30 - 16:30 WIB (7 Jam Efektif)
                    </p>
                  </div>

                  {/* Waktu Masuk (Check-In) */}
                  <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                      <span>Waktu Masuk (Check-In)</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black font-mono text-emerald-600">
                        07:51:20 WIB
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">(Tepat Waktu)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Terminal ID: BIO-SCBD-07A
                    </p>
                  </div>

                  {/* Waktu Pulang (Check-Out) */}
                  <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                      <span>Waktu Pulang (Check-Out)</span>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-base font-black font-mono text-slate-900">
                      {hasClockedOut ? clockOutTimeStr : '-- : -- : -- WIB'}
                    </p>
                    <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{hasClockedOut ? 'Selesai Bekerja' : 'Buka mulai pukul 16:30 WIB'}</span>
                    </p>
                  </div>
                </div>

                {/* Additional Action Pills matching screenshot */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBreakTaken(true);
                      showToast('✓ Jam istirahat (12:00 - 13:00 WIB) berhasil dicatat ke sistem.');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isBreakTaken
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5 text-slate-500" />
                    <span>Catat Jam Istirahat (12:00 - 13:00)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExternalVisitModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5 text-slate-500" />
                    <span>Kunjungan Kantor Eksternal</span>
                  </button>
                </div>

                {/* Bottom Status Bar matching screenshot */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <span className="font-medium">
                    {hasClockedOut
                      ? '✓ Anda telah menyelesaikan seluruh sesi kerja hari ini.'
                      : 'Check-out mandiri dinonaktifkan hingga shift berakhir.'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsCheckOutModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition-all active:scale-95 self-start sm:self-auto"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check-Out Mandiri</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (4 COLS): LEMBUR SPL & PENGAJUAN KOREKSI ABSENSI (Full unclipped content!) */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* CARD 1: LEMBUR (SPL) TERKINI matching screenshot */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Lembur (SPL) Terkini
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Maret 2025
                  </span>
                </div>

                {/* Recent Overtime List */}
                <div className="space-y-3">
                  {overtimeList.map((ot) => (
                    <div key={ot.ticketNo} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {ot.ticketNo}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ot.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {ot.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {ot.date} • {ot.hours} Jam • Penyetuju: {ot.approver}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ESTIMASI LEMBUR PAYROLL Blue Box matching screenshot */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-sm flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                      ESTIMASI LEMBUR PAYROLL
                    </p>
                    <p className="text-2xl font-black font-mono tracking-tight text-white">
                      Rp 1.150.000
                    </p>
                    <p className="text-[10px] text-blue-100/80">
                      Dicairkan pada Payroll 28 Mar 2025
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>

                {/* Ajukan Form Lembur Baru Link Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsOvertimeModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-blue-200 text-xs font-bold text-blue-600 hover:bg-blue-50/60 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajukan Form Lembur Baru</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: PENGAJUAN KOREKSI ABSENSI (THE ONE THAT WAS CLIPPED IN SCREENSHOT, NOW FULLY UNCLIPPED!) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Pengajuan Koreksi Absensi
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Sisa {remainingCorrectionQuota} Kuota
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Ajukan permohonan revisi kehadiran jika terdapat kendala mesin biometrik, lupa tap-in/out, atau tugas dinas luar.
                </p>

                {/* Complete History List of Adjustments */}
                <div className="space-y-3">
                  {correctionList.map((adj) => (
                    <div
                      key={adj.ticketNo}
                      className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {adj.ticketNo}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            adj.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {adj.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{adj.type}</p>
                      <p className="text-[11px] text-slate-500">
                        Tanggal: {adj.date} • Waktu Revisi: {adj.revisedTime} WIB
                      </p>
                    </div>
                  ))}
                </div>

                {/* Policy Rules */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Ketentuan Koreksi Absensi:</p>
                  <p>• Maksimal 3 kali koreksi per periode bulan berjalan.</p>
                  <p>• Wajib disertai alasan objektif dan persetujuan atasan langsung.</p>
                </div>

                {/* Trigger Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCorrectionModalOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ajukan Koreksi Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: CHECK-OUT MANDIRI */}
      {isCheckOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Catat Presensi Pulang (Check-Out)
                  </h3>
                  <p className="text-[11px] text-slate-400">HQ Jakarta SCBD Lt. 7</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckOutModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center shadow-md">
              <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">{liveDate}</p>
              <h2 className="text-3xl font-black font-mono tracking-tight mt-1">{liveTime}</h2>
              <p className="text-[11px] text-blue-100/80 mt-1">Status Geofencing: Valid (Radius 18m)</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed text-center">
              Apakah Anda yakin ingin menyelesaikan sesi kerja dan mencatat waktu kepulangan hari ini?
            </p>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsCheckOutModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handlePerformCheckOut}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                Konfirmasi Check-Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PENGAJUAN KOREKSI PRESENSI */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pengajuan Koreksi Presensi Mandiri
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sisa Kuota Koreksi: {remainingCorrectionQuota} Kali Bulan Ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenis Anomali / Kesalahan
                </label>
                <select
                  value={correctionType}
                  onChange={(e) => setCorrectionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Lupa Tap-Out">Lupa Tap-Out (Pulang)</option>
                  <option value="Lupa Tap-In">Lupa Tap-In (Masuk)</option>
                  <option value="Dinas Luar Kota">Dinas Luar Kantor (Klien / Eksternal)</option>
                  <option value="Anomali Mesin Biometrik">Kegagalan Mesin Biometrik / Face ID</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Kejadian</label>
                  <input
                    type="date"
                    required
                    value={correctionDate}
                    onChange={(e) => setCorrectionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam yang Seharusnya</label>
                  <input
                    type="time"
                    required
                    value={correctionTargetTime}
                    onChange={(e) => setCorrectionTargetTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan &amp; Penjelasan Objektif
                </label>
                <textarea
                  rows={3}
                  required
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Jelaskan alasan kendala presensi secara jelas untuk verifikasi atasan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Kirim Pengajuan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AJUKAN FORM LEMBUR (SPL) */}
      {isOvertimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Formulir Surat Perintah Lembur (SPL)
                  </h3>
                  <p className="text-[11px] text-slate-400">Verifikasi otomatis ke Arya Wibowo</p>
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
                <label className="block font-semibold text-slate-700 mb-1">Judul / Tugas Lembur</label>
                <input
                  type="text"
                  required
                  value={overtimeTitle}
                  onChange={(e) => setOvertimeTitle(e.target.value)}
                  placeholder="Contoh: Deployment Release Sprint v3.4 Core"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={overtimeDate}
                    onChange={(e) => setOvertimeDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi (Jam)</label>
                  <select
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="1.0">1.0 Jam</option>
                    <option value="2.0">2.0 Jam</option>
                    <option value="3.0">3.0 Jam</option>
                    <option value="4.0">4.0 Jam</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 space-y-0.5">
                <p className="font-bold">Estimasi Kompensasi Payroll:</p>
                <p>Upah lembur dihitung otomatis sesuai UU Cipta Kerja No. 11/2020.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOvertimeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Ajukan SPL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: KUNJUNGAN KANTOR EKSTERNAL */}
      {isExternalVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Kunjungan Kantor Eksternal (Client Visit)
                  </h3>
                  <p className="text-[11px] text-slate-400">Pencatatan lokasi tugas luar kantor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExternalVisitModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Instansi / Klien</label>
                <input
                  type="text"
                  placeholder="Contoh: Bank Mandiri Plaza SCBD"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tujuan Penugasan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: UAT Integrasi Payment Gateway API"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsExternalVisitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExternalVisitModalOpen(false);
                  showToast('✓ Penugasan kunjungan eksternal berhasil dicatat dengan GPS koordinat valid.');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
              >
                Catat Kunjungan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
