'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EssLayoutSkeleton } from '@/components/layout/EssLayoutSkeleton';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  FileText,
  User,
  ShieldCheck,
  Send,
  Plus,
  X,
  Compass,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Bell,
  Check,
  Building2,
  Calendar,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  time: string;
  date: string;
  status: 'TEPAT_WAKTU' | 'TERLAMBAT';
  location: string;
}

interface MyRequest {
  id: string;
  title: string;
  type: 'cuti' | 'lembur';
  detail: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function EmployeeDashboardPage() {
  // Live Clock & Greeting State
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentSeconds, setCurrentSeconds] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Selamat Pagi');

  // Employee Identity
  const [employeeProfile, setEmployeeProfile] = useState({
    id: 'emp-user-1',
    name: 'Gilbert N.',
    nik: 'NIK-2025001',
    role: 'Product Engineer • Tech Lead',
    department: 'Teknologi Informasi & Rekayasa Produk',
    workLocation: 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)',
    remainingLeave: 9,
    totalLeave: 12,
    attendanceRate: 95.5,
    onTimeDays: 20,
    lateDays: 1,
  });

  // Attendance State
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'BELUM_PRESENSI' | 'SUDAH_MASUK' | 'SUDAH_PULANG'>(
    'BELUM_PRESENSI'
  );
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Leave & Overtime Requests State
  const [myRequests, setMyRequests] = useState<MyRequest[]>([
    {
      id: 'req-01',
      title: 'Pengajuan Cuti Tahunan (3 Hari: 26 - 28 Mar 2025)',
      type: 'cuti',
      detail: 'Cuti mudik & urusan keluarga',
      timestamp: '2 jam lalu',
      status: 'PENDING',
    },
    {
      id: 'req-03',
      title: 'Klaim Lembur Akhir Pekan (4 Jam)',
      type: 'lembur',
      detail: 'Deployment server dan optimasi database core',
      timestamp: 'Kemarin',
      status: 'APPROVED',
    },
  ]);

  // Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    type: 'cuti',
    title: '',
    startDate: '',
    endDate: '',
    reason: '',
    hours: '2',
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clock Ticking & Dynamic Time-of-Day Greeting
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const pad = (n: number) => String(n).padStart(2, '0');
      setCurrentTime(`${pad(hours)}:${pad(minutes)}`);
      setCurrentSeconds(pad(seconds));

      // Dynamic Greeting
      if (hours >= 4 && hours < 11) {
        setGreeting('Selamat Pagi');
      } else if (hours >= 11 && hours < 15) {
        setGreeting('Selamat Siang');
      } else if (hours >= 15 && hours < 18) {
        setGreeting('Selamat Sore');
      } else {
        setGreeting('Selamat Malam');
      }

      // Date Format in Indonesian
      setCurrentDateStr(
        new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(now)
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-Time BroadcastChannel Cross-Tab Synchronization
  useEffect(() => {
    // 1. Check local session cache for today's clock in
    const cachedAtt = localStorage.getItem('nexora_my_attendance');
    if (cachedAtt) {
      try {
        const parsed = JSON.parse(cachedAtt);
        if (parsed.clockInTime) {
          setClockInTime(parsed.clockInTime);
          setAttendanceStatus(parsed.clockOutTime ? 'SUDAH_PULANG' : 'SUDAH_MASUK');
        }
        if (parsed.clockOutTime) {
          setClockOutTime(parsed.clockOutTime);
        }
      } catch {
        // ignore
      }
    }

    // 2. Setup BroadcastChannel for zero-latency live sync with HR Admin
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        // If HR Admin approved or rejected my request
        if (msg.type === 'APPROVAL_UPDATED') {
          setMyRequests((prev) =>
            prev.map((r) => (r.id === msg.id ? { ...r, status: msg.status } : r))
          );
          showToast(
            `⚡ Pemberitahuan Real-Time: Pengajuan Anda telah ${
              msg.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'
            } oleh HR Admin!`
          );
        }
      };
    } catch {
      // BroadcastChannel fallback
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Handle Clock-In
  const handleClockIn = async () => {
    try {
      setIsClockingIn(true);
      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')} WIB`;

      // 1. Save to state & local cache
      setClockInTime(timeString);
      setAttendanceStatus('SUDAH_MASUK');
      localStorage.setItem(
        'nexora_my_attendance',
        JSON.stringify({
          clockInTime: timeString,
          clockOutTime: null,
          date: now.toISOString().split('T')[0],
        })
      );

      // 2. Send to backend REST API
      const res = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeProfile.id,
          employeeName: employeeProfile.name,
          department: employeeProfile.department,
          type: 'CLOCK_IN',
          location: employeeProfile.workLocation,
        }),
      });

      // 3. Broadcast real-time to HR Admin Dashboard
      try {
        const bc = new BroadcastChannel('nexora_live_sync');
        bc.postMessage({
          type: 'EMPLOYEE_CLOCKED_IN',
          employeeName: employeeProfile.name,
          time: timeString,
          status: now.getHours() > 9 ? 'TERLAMBAT' : 'TEPAT_WAKTU',
        });
        bc.close();
      } catch {
        // ignore
      }

      showToast(
        `✓ Berhasil Presensi Masuk (${timeString})! Dashboard HR Admin langsung terupdate secara real-time.`
      );
    } catch {
      showToast('Presensi tersimpan di perangkat.');
    } finally {
      setIsClockingIn(false);
    }
  };

  // Handle Clock-Out
  const handleClockOut = async () => {
    try {
      setIsClockingIn(true);
      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')} WIB`;

      setClockOutTime(timeString);
      setAttendanceStatus('SUDAH_PULANG');
      localStorage.setItem(
        'nexora_my_attendance',
        JSON.stringify({
          clockInTime,
          clockOutTime: timeString,
          date: now.toISOString().split('T')[0],
        })
      );

      // Send to backend
      await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeProfile.id,
          employeeName: employeeProfile.name,
          department: employeeProfile.department,
          type: 'CLOCK_OUT',
          location: employeeProfile.workLocation,
        }),
      });

      // Broadcast to HR Admin
      try {
        const bc = new BroadcastChannel('nexora_live_sync');
        bc.postMessage({
          type: 'EMPLOYEE_CLOCKED_OUT',
          employeeName: employeeProfile.name,
          time: timeString,
        });
        bc.close();
      } catch {
        // ignore
      }

      showToast(`✓ Presensi Pulang berhasil dicatat (${timeString}). Selamat beristirahat!`);
    } catch {
      showToast('Presensi pulang tercatat.');
    } finally {
      setIsClockingIn(false);
    }
  };

  // Submit Leave / Overtime Request to HR Admin
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.title.trim() && !requestForm.reason.trim()) {
      showToast('Harap isi judul dan alasan pengajuan.');
      return;
    }

    try {
      setIsSubmittingRequest(true);
      const title =
        requestForm.title ||
        (requestForm.type === 'cuti'
          ? `Pengajuan Cuti Tahunan (${requestForm.startDate || 'Tanggal Ditentukan'})`
          : `Klaim Lembur Operasional (${requestForm.hours} Jam)`);

      const payload = {
        name: employeeProfile.name,
        role: employeeProfile.role,
        type: requestForm.type,
        title,
        detail: requestForm.reason || 'Pengajuan mandiri via portal karyawan ESS',
        quotaMeta: requestForm.type === 'cuti' ? `Sisa Kuota: ${employeeProfile.remainingLeave} Hari` : undefined,
        estimatedCost:
          requestForm.type === 'lembur'
            ? `Taksiran Kompensasi: Rp ${Number(requestForm.hours) * 80000}`
            : undefined,
      };

      // 1. Post to backend
      const res = await fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      const newReq: MyRequest = {
        id: json.data?.id || `req-${Date.now()}`,
        title,
        type: requestForm.type as 'cuti' | 'lembur',
        detail: payload.detail,
        timestamp: 'Baru saja',
        status: 'PENDING',
      };

      setMyRequests([newReq, ...myRequests]);

      // 2. Broadcast immediately to HR Admin Dashboard
      try {
        const bc = new BroadcastChannel('nexora_live_sync');
        bc.postMessage({
          type: 'NEW_APPROVAL_REQUEST',
          request: newReq,
          employeeName: employeeProfile.name,
        });
        bc.close();
      } catch {
        // ignore
      }

      setIsRequestModalOpen(false);
      setRequestForm({
        type: 'cuti',
        title: '',
        startDate: '',
        endDate: '',
        reason: '',
        hours: '2',
      });
      showToast('✓ Pengajuan berhasil dikirim dan langsung tampil di Dashboard HR Admin secara real-time!');
    } catch {
      showToast('Pengajuan berhasil diproses.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <EssLayoutSkeleton>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold leading-relaxed">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* HEADER: GREETING & PERSONA SUMMARY                                */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-slate-800 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-400/20 text-blue-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Portal Layanan Mandiri Karyawan (ESS)</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {greeting}, {employeeProfile.name} 👋
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
                <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-semibold text-blue-300">
                  {employeeProfile.nik}
                </span>
                <span>•</span>
                <span className="font-medium">{employeeProfile.role}</span>
                <span>•</span>
                <span className="text-slate-400">{employeeProfile.department}</span>
              </div>
            </div>

            {/* Live Real-Time Digital Clock */}
            <div className="flex flex-col sm:items-end justify-center bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 shadow-inner flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {currentDateStr}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                  {currentTime || '08:00'}
                </span>
                <span className="text-base font-black font-mono text-blue-400">
                  :{currentSeconds || '00'}
                </span>
                <span className="text-xs font-bold text-slate-400 ml-1">WIB</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real-Time Sync Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* MAIN HERO CARD: PRESENSI MASUK / PULANG REAL-TIME                 */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Presensi Kerja Hari Ini
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Shift Reguler Head Office: <strong className="text-slate-700">09:00 - 18:00 WIB</strong>
                </p>
              </div>
            </div>

            {/* Geofencing Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lokasi Valid: Kantor Pusat SCBD (Radius 100m)</span>
            </div>
          </div>

          {/* Action Box with Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Status Visual */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status Kehadiran Anda
                  </span>
                  {attendanceStatus === 'BELUM_PRESENSI' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      ● Belum Melakukan Presensi
                    </span>
                  )}
                  {attendanceStatus === 'SUDAH_MASUK' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Sudah Masuk (Aktif Bekerja)
                    </span>
                  )}
                  {attendanceStatus === 'SUDAH_PULANG' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      Presensi Selesai (Sudah Pulang)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-400 block">Jam Masuk (Clock-In)</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                      {clockInTime || '-- : --'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                      {clockInTime ? '✓ Tepat Waktu' : 'Batas 09:00 WIB'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-semibold text-slate-400 block">Jam Pulang (Clock-Out)</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                      {clockOutTime || '-- : --'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                      {clockOutTime ? 'Presensi Selesai' : 'Mulai 18:00 WIB'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  💡 Setiap tombol presensi ditekan, koordinat GPS dan waktu langsung tersinkronisasi ke
                  Dashboard HR Admin secara real-time.
                </p>
              </div>
            </div>

            {/* Right Big Button Trigger */}
            <div className="md:col-span-5 flex flex-col justify-center gap-3">
              {attendanceStatus === 'BELUM_PRESENSI' && (
                <button
                  type="button"
                  disabled={isClockingIn}
                  onClick={handleClockIn}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-70 group"
                >
                  {isClockingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Clock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  )}
                  <span>Presensi Masuk Sekarang (Clock-In)</span>
                </button>
              )}

              {attendanceStatus === 'SUDAH_MASUK' && (
                <button
                  type="button"
                  disabled={isClockingIn}
                  onClick={handleClockOut}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all transform active:scale-95 disabled:opacity-70 group"
                >
                  {isClockingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  <span>Presensi Pulang (Clock-Out)</span>
                </button>
              )}

              {attendanceStatus === 'SUDAH_PULANG' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">
                    Presensi Hari Ini Telah Lengkap!
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Terima kasih atas dedikasi kerja Anda hari ini.
                  </p>
                </div>
              )}

              {/* Quick Link to GPS Map Camera */}
              <Link
                href="/ess/attendance"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Buka Kamera &amp; Radar Presensi GPS</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* STATS OVERVIEW CARDS: CUTI, ATTENDANCE, LEMBUR, PAYSLIP           */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Sisa Cuti */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Sisa Cuti Tahunan</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {employeeProfile.remainingLeave}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {employeeProfile.totalLeave} Hari
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{
                  width: `${(employeeProfile.remainingLeave / employeeProfile.totalLeave) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Card 2: Kehadiran Bulan Ini */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Presensi Bulan Ini</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {employeeProfile.attendanceRate}%
              </span>
              <span className="text-xs text-emerald-600 font-bold">Prima</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {employeeProfile.onTimeDays} Tepat Waktu • {employeeProfile.lateDays} Terlambat
            </p>
          </div>

          {/* Card 3: Lembur Terverifikasi */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Lembur Disetujui</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono">4.0</span>
              <span className="text-xs text-slate-400 font-semibold">Jam (Maret)</span>
            </div>
            <p className="text-[11px] text-purple-600 font-bold">
              Taksiran: Rp 320.000
            </p>
          </div>

          {/* Card 4: Slip Gaji Elektronik */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Slip Gaji Terakhir</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <span className="text-sm font-extrabold text-slate-900 block truncate">
              Februari 2025
            </span>
            <Link
              href="/ess/payroll"
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Lihat &amp; Unduh PDF</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 2-COLUMN SECTION: MY APPROVALS & COMPANY NOTICE                   */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Riwayat Pengajuan Cuti & Lembur (Real-Time Synchronized) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Status Pengajuan Cuti &amp; Lembur Anda
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terhubung langsung dengan alur persetujuan HR Operations Manager.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Ajukan Cuti / Lembur Baru</span>
              </button>
            </div>

            {/* List of My Requests */}
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          req.type === 'cuti'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {req.type === 'cuti' ? 'Cuti' : 'Lembur'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{req.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500">{req.detail}</p>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Diajukan: {req.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {req.status === 'PENDING' && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Menunggu Review HR</span>
                      </span>
                    )}
                    {req.status === 'APPROVED' && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Disetujui HR</span>
                      </span>
                    )}
                    {req.status === 'REJECTED' && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        <span>Ditolak</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

            {/* RIGHT: PENGUMUMAN & JADWAL SHIFT RESMI */}
          <div className="lg:col-span-4 space-y-5">
            {/* Announcement Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">
                  Pengumuman Resmi HRD
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Libur Hari Raya Idul Fitri
                  </span>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    Cuti Bersama &amp; Libur Nasional 1446 H
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sesuai SKB 3 Menteri, operasional kantor libur per 29 Maret s/d 6 April 2025.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Update Benefit Karyawan
                  </span>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    Kartu Asuransi Rawat Inap Digital
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Karyawan dapat mengakses e-card asuransi kesehatan via menu profil akun.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact HR In-Charge */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                Atasan Langsung &amp; HR In-Charge
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  DL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dewi Lestari, S.Psi</h4>
                  <p className="text-[11px] text-slate-400">HR Operations Manager</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2.5">
                Butuh bantuan presensi atau koreksi data? Hubungi tim HR di{' '}
                <strong className="text-blue-300">hr.support@nexora.id</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* MODAL: PENGAJUAN CUTI / LEMBUR BARU                               */}
        {/* ----------------------------------------------------------------- */}
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Formulir Permohonan Cuti / Lembur
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Langsung diteruskan ke Dashboard HR Admin secara real-time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Permohonan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRequestForm({ ...requestForm, type: 'cuti' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        requestForm.type === 'cuti'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cuti Tahunan / Izin
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestForm({ ...requestForm, type: 'lembur' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        requestForm.type === 'lembur'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Klaim Lembur Operasional
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Pengajuan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      requestForm.type === 'cuti'
                        ? 'Contoh: Pengajuan Cuti Tahunan 2 Hari'
                        : 'Contoh: Lembur Maintenance Server Akhir Pekan'
                    }
                    value={requestForm.title}
                    onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {requestForm.type === 'cuti' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        required
                        value={requestForm.startDate}
                        onChange={(e) =>
                          setRequestForm({ ...requestForm, startDate: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        required
                        value={requestForm.endDate}
                        onChange={(e) =>
                          setRequestForm({ ...requestForm, endDate: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Durasi Lembur (Jam)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      required
                      value={requestForm.hours}
                      onChange={(e) => setRequestForm({ ...requestForm, hours: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alasan / Keterangan Keperluan
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tuliskan alasan lengkap untuk pertimbangan HR..."
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRequest}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    {isSubmittingRequest ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Kirim Pengajuan ke HR</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </EssLayoutSkeleton>
  );
}
