'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import {
  LayoutDashboard,
  Clock,
  User,
  Settings,
  Building2,
  Calendar,
  ChevronDown,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Briefcase,
  Umbrella,
  Landmark,
  FileCheck,
  FileText,
  Paperclip,
  Check,
  X,
  HelpCircle,
  MapPin,
  Camera,
  TrendingUp,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface LeaveRequestItem {
  ticketNo: string;
  type: string;
  typeBadge?: string;
  hasAttachment?: boolean;
  dateRange: string;
  duration: string;
  reason: string;
  handover: string;
  status: 'APPROVED_ALL' | 'APPROVED_HR' | 'PENDING' | 'REJECTED';
  statusLabel: string;
}

interface DailyAttendanceLog {
  date: string;
  dayName: string;
  shift: string;
  clockIn: string;
  clockOut: string;
  workHours: string;
  location: string;
  status: 'ON_TIME' | 'LATE' | 'LEAVE' | 'HOLIDAY';
  statusLabel: string;
}

export default function EssAttendanceOverhaulPage() {
  const pathname = usePathname();

  // Active Tab: 1 = Kalender & Log Presensi, 2 = Izin & Cuti Non-Kerja, 3 = Pengajuan Koreksi Presensi
  const [activeTab, setActiveTab] = useState<'calendar' | 'leave' | 'correction'>('calendar');

  // Interactive Period State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Februari 2025');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  // Modals & Feedback
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Digital Clock
  const [currentLiveTime, setCurrentLiveTime] = useState<string>('');
  const [currentLiveDate, setCurrentLiveDate] = useState<string>('');

  // Attendance Check-in State
  const [hasClockedInToday, setHasClockedInToday] = useState(false);
  const [todayClockInTime, setTodayClockInTime] = useState<string>('08:16 WIB');
  const [todayClockOutTime, setTodayClockOutTime] = useState<string>('Belum Tap-Out');

  // New Leave Form State
  const [newLeaveType, setNewLeaveType] = useState('Cuti Tahunan');
  const [newLeaveStartDate, setNewLeaveStartDate] = useState('');
  const [newLeaveEndDate, setNewLeaveEndDate] = useState('');
  const [newLeaveReason, setNewLeaveReason] = useState('');
  const [newLeaveHandover, setNewLeaveHandover] = useState('Rizky Ramadhan');

  // Correction Form State
  const [correctionDate, setCorrectionDate] = useState('');
  const [correctionType, setCorrectionType] = useState('Lupa Tap-Out');
  const [correctionTargetTime, setCorrectionTargetTime] = useState('17:30');
  const [correctionReason, setCorrectionReason] = useState('');

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentLiveTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentLiveDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Leave Requests dataset matching screenshot
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([
    {
      ticketNo: '#LV-2025-014',
      type: 'Cuti Tahunan',
      dateRange: 'Senin, 17 Feb 2025',
      duration: '1 Hari Kerja',
      reason: 'Urusan Keluarga di Luar Kota',
      handover: 'Rizky Ramadhan',
      status: 'APPROVED_ALL',
      statusLabel: 'Disetujui HR & Lead',
    },
    {
      ticketNo: '#LV-2025-009',
      type: 'Izin Sakit (Medical)',
      hasAttachment: true,
      dateRange: 'Rabu, 12 Feb 2025',
      duration: '1 Hari Kerja',
      reason: 'Demam & Flu Berat (RS Siloam, Surat Dokter Valid)',
      handover: 'Handover Tim Support',
      status: 'APPROVED_HR',
      statusLabel: 'Disetujui HR',
    },
    {
      ticketNo: '#LV-2025-004',
      type: 'Cuti Bersama (Imlek)',
      dateRange: 'Rabu, 29 Jan 2025',
      duration: '1 Hari',
      reason: 'Libur Resmi Cuti Bersama Nasional 2025',
      handover: 'Sistem Terjadwal',
      status: 'APPROVED_ALL',
      statusLabel: 'Otomatis Disetujui',
    },
  ]);

  // Daily attendance dataset for Kalender & Log tab
  const [attendanceLogs] = useState<DailyAttendanceLog[]>([
    {
      date: '28 Feb 2025',
      dayName: 'Jumat',
      shift: 'Pagi (08:30 - 17:30)',
      clockIn: '08:16 WIB',
      clockOut: '17:35 WIB',
      workHours: '9j 19m',
      location: 'SCBD Tower Lt. 18 (WiFi Core)',
      status: 'ON_TIME',
      statusLabel: 'Tepat Waktu',
    },
    {
      date: '27 Feb 2025',
      dayName: 'Kamis',
      shift: 'Pagi (08:30 - 17:30)',
      clockIn: '08:22 WIB',
      clockOut: '17:40 WIB',
      workHours: '9j 18m',
      location: 'SCBD Tower Lt. 18 (Face ID)',
      status: 'ON_TIME',
      statusLabel: 'Tepat Waktu',
    },
    {
      date: '26 Feb 2025',
      dayName: 'Rabu',
      shift: 'Pagi (08:30 - 17:30)',
      clockIn: '08:41 WIB',
      clockOut: '17:50 WIB',
      workHours: '9j 09m',
      location: 'SCBD Tower Lt. 18 (GPS Valid)',
      status: 'LATE',
      statusLabel: 'Terlambat (Toleransi)',
    },
    {
      date: '25 Feb 2025',
      dayName: 'Selasa',
      shift: 'Pagi (08:30 - 17:30)',
      clockIn: '08:14 WIB',
      clockOut: '17:32 WIB',
      workHours: '9j 18m',
      location: 'SCBD Tower Lt. 18 (Face ID)',
      status: 'ON_TIME',
      statusLabel: 'Tepat Waktu',
    },
    {
      date: '17 Feb 2025',
      dayName: 'Senin',
      shift: 'Reguler',
      clockIn: '-',
      clockOut: '-',
      workHours: '0j 00m',
      location: 'Pengajuan #LV-2025-014',
      status: 'LEAVE',
      statusLabel: 'Cuti Tahunan',
    },
  ]);

  // Handle Presensi Hari Ini submit
  const handlePerformCheckIn = async (type: 'IN' | 'OUT') => {
    try {
      setIsSubmitting(true);
      const timeStr = `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

      if (type === 'IN') {
        setHasClockedInToday(true);
        setTodayClockInTime(timeStr);
        showToast(`✓ Check-In Berhasil dicatat (${timeStr}) di SCBD Jakarta.`);
      } else {
        setTodayClockOutTime(timeStr);
        showToast(`✓ Check-Out Berhasil dicatat (${timeStr}). Selamat beristirahat!`);
      }

      // Sync with attendance API and broadcast to Admin
      await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'emp-user-1',
          employeeName: 'Budi Pratama',
          type: type === 'IN' ? 'CLOCK_IN' : 'CLOCK_OUT',
          time: timeStr,
          location: 'Nexora Tower SCBD Jakarta',
        }),
      }).catch(() => {});

      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'ATTENDANCE_RECORDED', employeeName: 'Budi Pratama', time: timeStr });
        ch.close();
      } catch {}

      setIsCheckInModalOpen(false);
    } catch {
      showToast('Gagal memproses presensi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Leave Request
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveStartDate) {
      showToast('Harap tentukan tanggal cuti.');
      return;
    }

    const newTicket: LeaveRequestItem = {
      ticketNo: `#LV-2025-${Math.floor(100 + Math.random() * 900)}`,
      type: newLeaveType,
      dateRange: newLeaveStartDate + (newLeaveEndDate ? ` s/d ${newLeaveEndDate}` : ''),
      duration: '1 Hari Kerja',
      reason: newLeaveReason || 'Keperluan Pribadi',
      handover: newLeaveHandover || 'Rizky Ramadhan',
      status: 'PENDING',
      statusLabel: 'Menunggu Review HR',
    };

    setLeaveRequests([newTicket, ...leaveRequests]);
    setIsLeaveModalOpen(false);
    setNewLeaveStartDate('');
    setNewLeaveEndDate('');
    setNewLeaveReason('');

    showToast('✓ Pengajuan Izin/Cuti berhasil dikirim dan tersinkronisasi ke HR Admin.');

    // Broadcast to Notification engine
    try {
      fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Budi Pratama',
          role: 'Software Engineer • Technology',
          type: 'cuti',
          title: `Pengajuan ${newTicket.type}`,
          highlightType: newTicket.type,
          detail: `${newTicket.duration} (${newTicket.dateRange})`,
          quotaMeta: `Alasan: ${newTicket.reason}`,
        }),
      }).catch(() => {});

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({ type: 'APPROVAL_SUBMITTED' });
      ch.close();
    } catch {}
  };

  // Submit Correction
  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCorrectionModalOpen(false);
    setCorrectionDate('');
    setCorrectionReason('');
    showToast('✓ Permohonan koreksi presensi berhasil diajukan ke HR Admin.');
  };

  // Download Rekap simulation
  const handleDownloadRekap = () => {
    showToast(`✓ Menyiapkan unduhan rekap presensi (${selectedPeriod})...`);
    setTimeout(() => {
      showToast(`✓ Rekap Presensi & Kehadiran (${selectedPeriod}) berhasil diunduh!`);
    }, 800);
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
        <div className="space-y-6">
          {/* Logo brand matching screenshot */}
          <Link href="/ess" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20 flex-shrink-0">
              M
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                Nexora ESS
              </span>
              <span className="text-[11px] font-semibold text-slate-400 leading-tight">
                HR Portal Karyawan
              </span>
            </div>
          </Link>

          {/* Navigation Section */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-2">
              MENU UTAMA
            </p>

            {/* Menu Items with subtle rounded border styling */}
            <div className="space-y-1.5 border border-dashed border-blue-200/90 rounded-2xl p-1.5 bg-blue-50/20">
              {/* Beranda / Ringkasan */}
              <Link
                href="/ess"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                <span>Beranda / Ringkasan</span>
              </Link>

              {/* Presensi & Kehadiran (ACTIVE) */}
              <Link
                href="/ess/attendance"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-white text-blue-700 shadow-xs border border-blue-200/80 transition-all"
              >
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Presensi & Kehadiran</span>
              </Link>
            </div>

            <div className="space-y-1.5 border border-dashed border-blue-200/90 rounded-2xl p-1.5 bg-blue-50/20 mt-2">
              {/* Profil Saya */}
              <Link
                href="/admin/profile"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Profil Saya</span>
              </Link>

              {/* Pengaturan Akun */}
              <Link
                href="/admin/profile/preferences"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Pengaturan Akun</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Status Koneksi Box */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Status Koneksi</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-700">Tersinkronisasi</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => showToast('Koneksi WebSocket & Database Master HRIS Aktif.')}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Info Koneksi"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR matching screenshot */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Left Header Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {/* Company Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-700 text-xs font-semibold flex-shrink-0">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>PT Nexora Solusi Nusantara</span>
            </div>

            {/* Shift Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-700 text-xs font-semibold flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Shift Pagi: 08:30 - 17:30 WIB</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Date display */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentLiveDate || 'Rabu, 24 Mei 2024'}</span>
            </div>

            {/* Real-time Notification Bell */}
            <NotificationBellDropdown portal="ess" />

            {/* User Profile Pill matching screenshot */}
            <Link
              href="/admin/profile"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
              title="Profil Pengguna"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs flex-shrink-0 bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                  alt="Budi Pratama"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                  Budi Pratama
                </span>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  Software Engineer
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          {/* HEADER SECTION matching screenshot */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2">
            <div>
              {/* Breadcrumb with Portal ESS pill */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-[11px]">
                  Portal ESS
                </span>
                <span className="text-slate-400">&gt;</span>
                <span className="text-slate-700 font-semibold">Presensi & Kehadiran</span>
              </div>

              {/* Title + Active Employee Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Presensi & Kehadiran
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                  Karyawan Aktif
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Kelola riwayat absensi, tinjau kalender kerja bulanan, rincian jam kerja akumulatif, dan status kepatuhan shift reguler Anda.
              </p>
            </div>

            {/* Top Right Actions matching screenshot */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Periode Kerja Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-98"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Periode Kerja: {selectedPeriod}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isPeriodDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-40 text-xs">
                    {['Februari 2025', 'Januari 2025', 'Maret 2025'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(p);
                          setIsPeriodDropdownOpen(false);
                          showToast(`Menampilkan data presensi periode: ${p}`);
                        }}
                        className={`w-full text-left px-3.5 py-2 font-semibold transition-colors ${
                          selectedPeriod === p
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Unduh Rekap Button */}
              <button
                type="button"
                onClick={handleDownloadRekap}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-98"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Rekap</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Ajukan Izin / Cuti Button */}
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-xs font-bold shadow-2xs transition-all active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajukan Izin / Cuti</span>
              </button>

              {/* Presensi Hari Ini (Primary Solid Blue Button) */}
              <button
                type="button"
                onClick={() => setIsCheckInModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-98"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Presensi Hari Ini</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Hari Kerja Efektif */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Hari Kerja Efektif</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">20</span>
                  <span className="text-xs font-bold text-slate-500">/ 20 Hari Kerja</span>
                </div>
              </div>

              {/* Badges footer */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  18 Hadir
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  1 Cuti
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  1 Izin
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  • 0 Alpa
                </span>
              </div>
            </div>

            {/* Card 2: Akumulasi Jam Kerja */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Akumulasi Jam Kerja</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  168j 30m
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">Target: 160 Jam</span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Efisiensi 105%
                </span>
              </div>
            </div>

            {/* Card 3: Ketepatan Waktu (Punctuality) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Ketepatan Waktu (Punctuality)</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">94.4%</span>
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                  ↗ +1.8%
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                <span>17 Tepat Waktu</span>
                <span>•</span>
                <span>1 Terlambat (Toleransi)</span>
              </div>
            </div>

            {/* Card 4: Rata-rata Punch Time */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Rata-rata Punch Time</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">08:16</span>
                <span className="text-xs text-slate-400 font-semibold mx-1">s/d</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">17:35</span>
                <span className="text-xs font-bold text-slate-500 ml-1">WIB</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">Shift: Regular (08:30)</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>+14m Lebih Cepat</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: INTERACTIVE TABS BAR matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {/* Tab 1: Kalender & Log Presensi */}
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'calendar'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Kalender & Log Presensi</span>
              </button>

              {/* Tab 2: Izin & Cuti Non-Kerja */}
              <button
                type="button"
                onClick={() => setActiveTab('leave')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'leave'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Izin & Cuti Non-Kerja</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'leave'
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  11 Hari Tersisa
                </span>
              </button>

              {/* Tab 3: Pengajuan Koreksi Presensi */}
              <button
                type="button"
                onClick={() => setActiveTab('correction')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'correction'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Pengajuan Koreksi Presensi</span>
              </button>
            </div>

            {/* Right Status Indicator matching screenshot */}
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-200/70 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Sinkronisasi Hak Cuti HRIS Terverifikasi</span>
            </div>
          </div>

          {/* SECTION 3: 4 QUOTA / LEAVE CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Cuti Tahunan 2025 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Cuti Tahunan 2025</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Umbrella className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900">11</span>
                <span className="text-xs font-bold text-slate-500 ml-1">/ 12 Hari</span>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[91%]" />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>1 Hari Terpakai</span>
                <span>Exp: 31 Des 2025</span>
              </div>
            </div>

            {/* Card 2: Cuti Bersama (Nasional) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Cuti Bersama (Nasional)</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900">4</span>
                <span className="text-xs font-bold text-slate-500 ml-1">Hari Otomatis</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full" />

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Kalender SKB 3 Menteri</span>
                <span className="text-emerald-700 font-bold">Terjadwal</span>
              </div>
            </div>

            {/* Card 3: Izin Sakit (Medical Leave) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Izin Sakit (Medical Leave)</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900">1</span>
                <span className="text-xs font-bold text-slate-500 ml-1">Hari Digunakan</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full" />

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Plafon Rawat Jalan</span>
                <span>Lampiran RS/Klinik</span>
              </div>
            </div>

            {/* Card 4: Dispensasi & Izin Khusus */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Dispensasi & Izin Khusus</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900">Tersedia</span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium truncate">
                Nikah (3h), Duka Cita (2h), Istri Lahiran (2h), Ibadah
              </p>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-amber-700 font-bold">Tanpa Potong Cuti</span>
                <span className="text-slate-400">Ajukan Online</span>
              </div>
            </div>
          </div>

          {/* TAB 1 & 2: TABLE "Riwayat Pengajuan Izin & Cuti (Leave Requests)" matching screenshot */}
          {activeTab !== 'correction' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4">
              {/* Table Header Section matching screenshot */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Riwayat Pengajuan Izin & Cuti (Leave Requests)
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                      Tahun 2025
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Daftar permohonan dispensasi kehadiran kerja, status persetujuan berjenjang Atasan & Divisi HR.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Pengajuan Baru</span>
                  </button>
                </div>
              </div>

              {/* Table Grid matching screenshot */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5 whitespace-nowrap">NO. TIKET</th>
                      <th className="py-3 px-4 whitespace-nowrap">TIPE PERMOHONAN</th>
                      <th className="py-3 px-4 whitespace-nowrap">RENTANG TANGGAL</th>
                      <th className="py-3 px-4 whitespace-nowrap">DURASI</th>
                      <th className="py-3 px-4 whitespace-nowrap">ALASAN & DELEGASI HANDOVER</th>
                      <th className="py-3 px-4 whitespace-nowrap">STATUS APPROVAL</th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {leaveRequests.map((item) => (
                      <tr key={item.ticketNo} className="hover:bg-slate-50/60 transition-colors">
                        {/* No Tiket (Blue Monospace) */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-600">
                            {item.ticketNo}
                          </span>
                        </td>

                        {/* Tipe Permohonan */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span>{item.type}</span>
                            {item.hasAttachment && (
                              <span title="Terdapat lampiran dokumen resmi">
                                <Paperclip className="w-3.5 h-3.5 text-blue-500 ml-1" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Rentang Tanggal */}
                        <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-700">
                          {item.dateRange}
                        </td>

                        {/* Durasi (Badge) */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {item.duration}
                          </span>
                        </td>

                        {/* Alasan & Delegasi Handover */}
                        <td className="py-4 px-4 min-w-[220px]">
                          <p className="font-semibold text-slate-800 leading-tight">
                            {item.reason}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Handover: <strong className="text-slate-600">{item.handover}</strong>
                          </p>
                        </td>

                        {/* Status Approval */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {item.status === 'APPROVED_ALL' || item.status === 'APPROVED_HR' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{item.statusLabel}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>{item.statusLabel}</span>
                            </span>
                          )}
                        </td>

                        {/* Aksi (Document Receipt Icon) */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              showToast(`Detail Tiket ${item.ticketNo}: ${item.type} (${item.dateRange}) - ${item.statusLabel}`)
                            }
                            className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Lihat Detail Dokumen"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 1 ADDITIONAL: DETAIL KALENDER & LOG HARIAN PRESENSI */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Log Presensi Harian — {selectedPeriod}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data rekaman kehadiran biometrik, geolocation GPS, dan kepatuhan jam kerja reguler.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total Hari Kerja: <strong>20 Hari</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5 whitespace-nowrap">TANGGAL</th>
                      <th className="py-3 px-4 whitespace-nowrap">SHIFT JADWAL</th>
                      <th className="py-3 px-4 whitespace-nowrap">JAM MASUK</th>
                      <th className="py-3 px-4 whitespace-nowrap">JAM PULANG</th>
                      <th className="py-3 px-4 whitespace-nowrap">TOTAL JAM</th>
                      <th className="py-3 px-4 whitespace-nowrap">LOKASI & VERIFIKASI</th>
                      <th className="py-3 px-4 whitespace-nowrap">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{log.date}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({log.dayName})</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                          {log.shift}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                          {log.clockIn}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                          {log.clockOut}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-blue-700">
                          {log.workHours}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {log.location}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.status === 'ON_TIME' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{log.statusLabel}</span>
                            </span>
                          ) : log.status === 'LATE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>{log.statusLabel}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Umbrella className="w-3 h-3" />
                              <span>{log.statusLabel}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PENGAJUAN KOREKSI PRESENSI */}
          {activeTab === 'correction' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Pengajuan Koreksi Presensi (Attendance Adjustment)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ajukan koreksi jika terdapat kegagalan tap-in/tap-out karena anomali mesin, lupa absen, atau penugasan dinas luar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Koreksi Baru</span>
                </button>
              </div>

              {/* Information Alert */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Kebijakan Koreksi Kehadiran Nexora</span>
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Setiap pengajuan koreksi presensi wajib melampirkan alasan jelas dan akan diteruskan ke Line Manager & HR Operations untuk diverifikasi. Maksimal pengajuan koreksi adalah 3 hari kerja setelah tanggal kejadian.
                </p>
              </div>

              {/* Sample Past Corrections List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Riwayat Pengajuan Koreksi Bulan Ini</h4>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">#ADJ-2025-003</span>
                      <span className="font-bold text-slate-800">Lupa Tap-Out (Dinas Luar Meeting Klien)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tanggal: 14 Feb 2025 • Target Jam Pulang: 18:00 WIB • Atasan: Rina Wijaya
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-center">
                    ✓ Disetujui HR
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: PRESENSI HARI INI (CHECK-IN / CHECK-OUT) */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Presensi Kehadiran Mandiri
                  </h3>
                  <p className="text-[11px] text-slate-400">Shift Pagi (08:30 - 17:30 WIB)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckInModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Clock Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center shadow-md">
              <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                {currentLiveDate}
              </p>
              <h2 className="text-4xl font-black tracking-tight mt-1 font-mono">
                {currentLiveTime || '08:16:00'}
              </h2>
              <p className="text-[11px] text-blue-100/80 mt-1">
                Waktu Indonesia Barat (WIB • GMT+7)
              </p>
            </div>

            {/* Geolocation Radius Status */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-900">
                  Dalam Radius Resmi Kantor (25m)
                </p>
                <p className="text-[11px] text-emerald-700 truncate">
                  Nexora Tower SCBD Jakarta • Geofencing Valid
                </p>
              </div>
            </div>

            {/* Status Record */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Jam Masuk (In)</p>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {hasClockedInToday ? todayClockInTime : 'Belum Tap-In'}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Jam Pulang (Out)</p>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {todayClockOutTime}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handlePerformCheckIn('IN')}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Check-In Pagi</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handlePerformCheckIn('OUT')}
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Check-Out Sore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUKAN IZIN / CUTI */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Pengajuan Izin &amp; Cuti Baru
                  </h3>
                  <p className="text-[11px] text-slate-400">Hak Saldo Cuti Tersedia: 11 Hari</p>
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

            <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Permohonan
                </label>
                <select
                  value={newLeaveType}
                  onChange={(e) => setNewLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Potong Saldo 12 Hari)</option>
                  <option value="Izin Sakit (Medical)">Izin Sakit (Lampiran Surat Dokter)</option>
                  <option value="Cuti Menikah">Cuti Menikah (3 Hari Khusus)</option>
                  <option value="Izin Duka Cita">Izin Duka Cita (2 Hari Khusus)</option>
                  <option value="Izin Kepentingan Pribadi">Izin Kepentingan Pribadi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={newLeaveStartDate}
                    onChange={(e) => setNewLeaveStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={newLeaveEndDate}
                    onChange={(e) => setNewLeaveEndDate(e.target.value)}
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
                  value={newLeaveHandover}
                  onChange={(e) => setNewLeaveHandover(e.target.value)}
                  placeholder="Nama rekan kerja handover..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan / Keterangan Izin
                </label>
                <textarea
                  rows={3}
                  required
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  placeholder="Jelaskan keperluan izin atau cuti secara detail..."
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Kirim Pengajuan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PENGAJUAN KOREKSI PRESENSI */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Koreksi Presensi Mandiri
                  </h3>
                  <p className="text-[11px] text-slate-400">Pengajuan revisi log kehadiran</p>
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

            <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenis Anomali / Kesalahan
                </label>
                <select
                  value={correctionType}
                  onChange={(e) => setCorrectionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
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
                  Alasan & Penjelasan
                </label>
                <textarea
                  rows={3}
                  required
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Jelaskan alasan koreksi kehadiran secara objektif..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Ajukan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
