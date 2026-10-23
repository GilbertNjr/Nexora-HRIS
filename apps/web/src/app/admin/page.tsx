'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import { downloadExecutiveRecapPDF } from '@/utils/generateExecutiveRecapPDF';
import { useApprovalsRealtime } from '@/hooks/useApprovalsRealtime';
import { useEmployeesRealtime } from '@/hooks/useEmployeesRealtime';
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
  Megaphone,
  Loader2,
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
  // Dynamic current date calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthShort = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(now);
  const currentMonthLong = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(now);
  const currentMonthYear = `${currentMonthLong} ${currentYear}`;
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  // Month selector options (Last 4 months)
  const monthOptions = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(d);
    return `${mName} ${d.getFullYear()}`;
  });

  // State for interactive features
  const [activeFilter, setActiveFilter] = useState<'all' | 'cuti' | 'lembur'>('all');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthYear);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null);
  const [isDownloadingRecap, setIsDownloadingRecap] = useState(false);

  // Broadcast HR Announcement State
  const [isBroadcastAnnouncementModalOpen, setIsBroadcastAnnouncementModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBadge, setBroadcastBadge] = useState('PENGUMUMAN HRD');
  const [broadcastDocNumber, setBroadcastDocNumber] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'IMPORTANT' | 'URGENT' | 'INFO'>('IMPORTANT');
  const [broadcastSummary, setBroadcastSummary] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastButtonText, setBroadcastButtonText] = useState('Lihat SE Direksi');
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastSummary.trim()) {
      showToast('⚠️ Judul dan ringkasan pengumuman wajib diisi!');
      return;
    }

    setIsSubmittingBroadcast(true);
    try {
      const payload = {
        title: broadcastTitle.trim(),
        badge: broadcastBadge,
        docNumber: broadcastDocNumber.trim() || undefined,
        priority: broadcastPriority,
        summary: broadcastSummary.trim(),
        content: broadcastContent.trim() || broadcastSummary.trim(),
        buttonText: broadcastButtonText.trim() || 'Lihat Pengumuman',
        author: 'Dewi Lestari, S.Psi (HR Operations Manager)',
      };

      const res = await fetch('/api/v1/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        // Post to local BroadcastChannel for zero-latency multi-tab sync
        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({
            type: 'ANNOUNCEMENT_PUBLISHED',
            payload: data.data,
          });
          bc.postMessage({
            type: 'NEW_NOTIFICATION',
          });
          bc.close();
        } catch {}

        showToast('🎉 Pengumuman HR berhasil disiarkan secara real-time ke semua dashboard karyawan!');
        setIsBroadcastAnnouncementModalOpen(false);
        setBroadcastTitle('');
        setBroadcastSummary('');
        setBroadcastContent('');
        setBroadcastDocNumber('');
      } else {
        showToast('⚠️ Gagal menyiarkan pengumuman. Silakan coba kembali.');
      }
    } catch {
      showToast('⚠️ Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

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
          estimatedPayroll: `${metrics.estimatedPayroll}`,
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

  // Dynamic approval list state synchronized with employee data and current date
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  // Dynamic Metrics State
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    permanentCount: 0,
    contractCount: 0,
    probationCount: 0,
    attendanceRate: 100,
    onTimeCount: 0,
    lateCount: 0,
    leaveCount: 0,
    pendingApprovals: 0,
    pendingLeave: 0,
    pendingOvertime: 0,
    estimatedPayroll: 'Rp 0',
  });

  // Department distribution dataset (Dynamic from database)
  const [departments, setDepartments] = useState<any[]>([]);

  // System audit activities (Dynamic from employee directory)
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Fetch live metrics from unified APIs
  const fetchLiveMetrics = React.useCallback(async () => {
    try {
      // 1. Employee headcount, breakdown, payroll & department distribution
      const empRes = await fetch('/api/v1/employees?limit=200');
      if (empRes.ok) {
        const json = await empRes.json();
        const items: any[] = json.data?.items || [];
        const total = json.data?.meta?.total !== undefined ? json.data.meta.total : items.length;

        const permanent = items.filter((e) => e.employmentType === 'PERMANENT').length;
        const contract = items.filter(
          (e) => e.employmentType === 'CONTRACT_PKWT' || e.employmentType === 'CONTRACT'
        ).length;
        const probation = items.filter((e) => e.employmentType === 'PROBATION').length;

        // Estimated Payroll: sum basicSalary + transportAllowance + mealAllowance
        const totalPayroll = items.reduce((acc, emp) => {
          const basic = Number(emp.basicSalary) || 0;
          const transport = Number(emp.transportAllowance) || 0;
          const meal = Number(emp.mealAllowance) || 0;
          return acc + basic + transport + meal;
        }, 0);

        const payrollFormatted =
          totalPayroll > 0
            ? new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(totalPayroll)
            : 'Rp 0';

        // Dynamic Department distribution
        const deptMap: Record<string, number> = {};
        items.forEach((emp) => {
          const dept = emp.department || 'Operasional';
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });

        const barColors = [
          'bg-blue-600',
          'bg-indigo-600',
          'bg-purple-600',
          'bg-emerald-600',
          'bg-amber-500',
          'bg-teal-500',
        ];

        const deptList = Object.entries(deptMap).map(([name, count], idx) => ({
          name,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          barColor: barColors[idx % barColors.length],
        }));

        setDepartments(deptList);

        setMetrics((prev) => ({
          ...prev,
          totalEmployees: total,
          activeEmployees: total,
          permanentCount: permanent,
          contractCount: contract,
          probationCount: probation,
          estimatedPayroll: payrollFormatted,
        }));
      }

      // 2. Attendance stats (Dynamic today)
      const attRes = await fetch('/api/v1/attendance');
      if (attRes.ok) {
        const json = await attRes.json();
        if (json.data) {
          setMetrics((prev) => ({
            ...prev,
            onTimeCount: json.data.onTimeCount ?? prev.onTimeCount,
            lateCount: json.data.lateCount ?? prev.lateCount,
            leaveCount: json.data.leaveCount ?? prev.leaveCount,
            attendanceRate: json.data.attendanceRate ?? prev.attendanceRate,
          }));
        }
      }

      // 3. Approvals list (Real-time sync)
      const appRes = await fetch('/api/v1/approvals');
      if (appRes.ok) {
        const json = await appRes.json();
        if (Array.isArray(json.data)) {
          setRequests(json.data);
          setMetrics((prev) => ({
            ...prev,
            pendingApprovals: json.data.length,
            pendingLeave: json.data.filter((r: any) => r.type === 'cuti').length,
            pendingOvertime: json.data.filter((r: any) => r.type === 'lembur').length,
          }));
        }
      }

      // 4. System Audit Activities (Live feed)
      const auditRes = await fetch('/api/v1/audit?limit=5');
      if (auditRes.ok) {
        const json = await auditRes.json();
        if (Array.isArray(json.data)) {
          const mapped = json.data.slice(0, 5).map((log: any) => {
            let dotColor = 'bg-blue-500';
            if (log.module === 'LEAVE') dotColor = 'bg-amber-500';
            else if (log.module === 'ATTENDANCE') dotColor = 'bg-emerald-500';
            else if (log.module === 'PAYROLL') dotColor = 'bg-indigo-500';
            else if (log.module === 'AUTH') dotColor = 'bg-rose-500';

            return {
              id: log.id,
              title: (log.action || 'Aktivitas Sistem').replace(/_/g, ' '),
              desc: `${log.userName || 'Pegawai'} • ${log.module || 'SDM'}`,
              time: log.timestamp || 'Baru saja',
              dotColor,
            };
          });
          setRecentActivities(mapped);
        }
      }
    } catch {
      // Keep resilient fallback
    }
  }, []);

  // Multi-device real-time SSE stream hook
  useApprovalsRealtime({
    playAudioAlert: true,
    onLeaveSubmitted: (newItem) => {
      setRequests((prev) => [newItem, ...prev.filter((r) => r.id !== newItem.id)]);
      setMetrics((prev) => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals + 1,
        pendingLeave: newItem.type === 'cuti' ? prev.pendingLeave + 1 : prev.pendingLeave,
        pendingOvertime: newItem.type === 'lembur' ? prev.pendingOvertime + 1 : prev.pendingOvertime,
      }));
      showToast(
        `🔔 Pengajuan Real-Time Baru: ${newItem.name} (${newItem.role?.split('•')[0]?.trim() || 'Karyawan'}) mengajukan ${
          newItem.highlightType || newItem.title
        }!`
      );
    },
    onLeaveActioned: ({ id }) => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setMetrics((prev) => ({
        ...prev,
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
      }));
    },
    onRefresh: () => {
      fetchLiveMetrics();
    },
  });

  // Multi-device real-time employee directory stream hook
  useEmployeesRealtime({
    onEmployeeCreated: (newEmp) => {
      showToast(
        `⚡ Karyawan Baru Terdaftar (Real-Time): ${newEmp.fullName} (${newEmp.department})`
      );
      fetchLiveMetrics();
    },
    onEmployeeUpdated: () => {
      fetchLiveMetrics();
    },
    onEmployeeDeleted: () => {
      fetchLiveMetrics();
    },
    onRefresh: () => {
      fetchLiveMetrics();
    },
  });

  // Live real-time sync with Employee Dashboard & REST APIs
  useEffect(() => {
    fetchLiveMetrics();
    const interval = setInterval(fetchLiveMetrics, 6000);

    // BroadcastChannel for instant (<5ms) cross-tab live synchronization
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        // When employee directory is modified (added, edited, deleted)
        if (msg.type === 'EMPLOYEES_UPDATED') {
          fetchLiveMetrics();
          showToast('⚡ Sinkronisasi: Perubahan data karyawan berhasil disinkronkan ke dashboard!');
        }

        // When employee clocks in from ESS portal
        if (msg.type === 'EMPLOYEE_CLOCKED_IN') {
          fetchLiveMetrics();
          showToast(
            `⚡ Presensi Baru Real-Time: ${msg.employeeName} baru saja Clock-In pukul ${msg.time} (${
              msg.status === 'TEPAT_WAKTU' ? 'Tepat Waktu' : 'Terlambat'
            })!`
          );
        }

        // When employee submits leave or attendance is recorded/reset
        if (
          msg.type === 'NEW_APPROVAL_REQUEST' ||
          msg.type === 'APPROVAL_SUBMITTED' ||
          msg.type === 'LEAVE_SUBMITTED'
        ) {
          fetchLiveMetrics();
          showToast(
            `🔔 Pengajuan Real-Time Baru: ${msg.request?.name || msg.item?.name || 'Karyawan'} baru saja mengajukan permohonan!`
          );
        }

        if (
          msg.type === 'APPROVAL_STATUS_CHANGED' ||
          msg.type === 'LEAVE_ACTIONED' ||
          msg.type === 'ATTENDANCE_RECORDED' ||
          msg.type === 'ATTENDANCE_LOGGED' ||
          msg.type === 'ATTENDANCE_RESET'
        ) {
          fetchLiveMetrics();
        }
      };
    } catch {
      // ignore
    }

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [fetchLiveMetrics]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handle Approve Action (Syncs back to Employee in Real-Time)
  const handleApprove = async (id: string, name: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setMetrics((prev) => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
    }));

    // 1. Notify employee via BroadcastChannel
    try {
      const bc = new BroadcastChannel('nexora_live_sync');
      bc.postMessage({ type: 'APPROVAL_UPDATED', id, status: 'APPROVED' });
      bc.close();
    } catch {
      // ignore
    }

    // 2. Persist to API
    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' }),
      });
    } catch {
      // ignore
    }

    showToast(`✓ Permohonan ${name} telah disetujui & disinkronkan ke karyawan secara real-time.`);
  };

  // Handle Reject Action (Syncs back to Employee in Real-Time)
  const handleReject = async (id: string, name: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setMetrics((prev) => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
    }));

    // 1. Notify employee via BroadcastChannel
    try {
      const bc = new BroadcastChannel('nexora_live_sync');
      bc.postMessage({ type: 'APPROVAL_UPDATED', id, status: 'REJECTED' });
      bc.close();
    } catch {
      // ignore
    }

    // 2. Persist to API
    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'REJECTED' }),
      });
    } catch {
      // ignore
    }

    showToast(`✕ Permohonan ${name} telah ditolak & status diperbarui ke karyawan.`);
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
              Berikut ringkasan aktivitas tenaga kerja dan permohonan yang memerlukan persetujuan hari ini, {todayFormatted}.
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
                  {monthOptions.map((m) => (
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

            {/* Live HR Broadcast Button */}
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const autoDoc = `No. ${Math.floor(Math.random() * 900) + 100}/HR-NOTIF/${new Intl.DateTimeFormat('id-ID', { month: 'numeric' }).format(now)}/${now.getFullYear()}`;
                setBroadcastDocNumber(autoDoc);
                setIsBroadcastAnnouncementModalOpen(true);
              }}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer border border-amber-400"
              title="Siarkan pengumuman penting HR ke seluruh dashboard karyawan secara live"
            >
              <Megaphone className="w-3.5 h-3.5 text-slate-950" />
              <span>Siarkan Pengumuman HRD</span>
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
                  {metrics.permanentCount || 0} Tetap
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {metrics.contractCount || 0} Kontrak • {metrics.probationCount || 0} Probation
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
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    metrics.attendanceRate >= 90
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : metrics.attendanceRate >= 70
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : metrics.attendanceRate > 0
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {metrics.attendanceRate >= 90
                    ? 'Optimal'
                    : metrics.attendanceRate >= 70
                    ? 'Normal'
                    : metrics.attendanceRate > 0
                    ? 'Perhatian'
                    : 'Belum Absen'}
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
                  {metrics.leaveCount || 0} Izin
                </span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 flex overflow-hidden gap-0.5">
              <div
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                style={{ width: `${metrics.attendanceRate}%` }}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{
                  width: `${
                    metrics.totalEmployees > 0
                      ? Math.round((metrics.lateCount / metrics.totalEmployees) * 100)
                      : 0
                  }%`,
                }}
              />
              <div
                className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                style={{
                  width: `${
                    metrics.totalEmployees > 0
                      ? Math.round(((metrics.leaveCount || 0) / metrics.totalEmployees) * 100)
                      : 0
                  }%`,
                }}
              />
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
                  ESTIMASI PAYROLL {selectedMonth.toUpperCase()}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {metrics.estimatedPayroll}
                </span>
                <span className="text-xs font-medium text-slate-400">/ Periode</span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  <Clock className="w-3 h-3 text-blue-600" />
                  Cut-off: 25 {currentMonthShort} {currentYear}
                </span>
                <span>Pkl 23:59 WIB</span>
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
                <span>Lihat Semua {requests.length} Permohonan Menunggu</span>
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
                  {departments.length} Departemen
                </span>
              </div>

              {/* Progress Bars */}
              <div className="mt-4 space-y-3.5">
                {departments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Belum ada data distribusi departemen.
                  </p>
                ) : (
                  departments.map((dept, idx) => (
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
                )))}
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
                {recentActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Belum ada riwayat aktivitas pegawai.
                  </p>
                ) : (
                  recentActivities.map((act) => (
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
                )))}
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

      {/* ========================================================= */}
      {/* BROADCAST HR ANNOUNCEMENT MODAL (REAL-TIME SINKRONISASI) */}
      {/* ========================================================= */}
      {isBroadcastAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Siarkan Pengumuman HRD Live
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Otomatis muncul seketika di dashboard seluruh karyawan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastAnnouncementModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 pt-3 text-xs">
              {/* Prioritas & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Label Kategori
                  </label>
                  <select
                    value={broadcastBadge}
                    onChange={(e) => setBroadcastBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-blue-600"
                  >
                    <option value="PENGUMUMAN HRD">PENGUMUMAN HRD</option>
                    <option value="SURAT EDARAN">SURAT EDARAN</option>
                    <option value="KEBIJAKAN KANTOR">KEBIJAKAN KANTOR</option>
                    <option value="URGENT BROADCAST">URGENT BROADCAST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tingkat Urgensi
                  </label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-blue-600"
                  >
                    <option value="IMPORTANT">Penting (Biru Indigo)</option>
                    <option value="URGENT">Mendesak / Urgent (Merah)</option>
                    <option value="INFO">Informasi Biasa</option>
                  </select>
                </div>
              </div>

              {/* No Dokumen */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Dokumen / SK
                </label>
                <input
                  type="text"
                  value={broadcastDocNumber}
                  onChange={(e) => setBroadcastDocNumber(e.target.value)}
                  placeholder="Contoh: No. 019/HR-NOTIF/III/2025"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-600"
                />
              </div>

              {/* Judul Pengumuman */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Judul Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="Contoh: Penyesuaian Jam Operasional Libur Nasional"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              {/* Ringkasan Singkat (Muncul di banner utama) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ringkasan Banner Utama (Maksimal 2 Kalimat) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={broadcastSummary}
                  onChange={(e) => setBroadcastSummary(e.target.value)}
                  placeholder="Kalimat ringkas yang langsung terbaca karyawan di banner dashboard utama..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-600"
                />
              </div>

              {/* Ketentuan Lengkap (Muncul saat tombol diklik) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Detail Ketentuan & Isi Lengkap (Surat Edaran)
                </label>
                <textarea
                  rows={4}
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Isi lengkap ketetapan manajemen, poin-poin aturan, atau lampiran operasional..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-600"
                />
              </div>

              {/* Teks Tombol */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Teks Tombol Aksi Karyawan
                </label>
                <input
                  type="text"
                  value={broadcastButtonText}
                  onChange={(e) => setBroadcastButtonText(e.target.value)}
                  placeholder="Lihat SE Direksi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-600"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBroadcastAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBroadcast}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmittingBroadcast ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyiarkan...</span>
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Siarkan Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
