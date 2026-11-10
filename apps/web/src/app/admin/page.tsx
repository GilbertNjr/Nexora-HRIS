'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TrendingUp,
  Megaphone,
  ArrowUpDown,
  Filter,
  Search,
  ExternalLink,
  Plus,
  UserPlus,
  RotateCw,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  name: string;
  role: string;
  department?: string;
  nik?: string;
  type: 'cuti' | 'lembur' | 'dokumen' | 'presensi';
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
  ticketNo?: string;
  currentStep?: number;
  totalSteps?: number;
  status?: string;
  targetOrg?: string;
  targetPurpose?: string;
  urgency?: string;
  correctionDate?: string;
  correctionTargetTime?: string;
  correctionType?: string;
  correctionReason?: string;
}

interface AuditLogItem {
  id: string;
  action: string;
  timestamp: string;
  statusType: 'SUCCESS' | 'FAIL' | 'INFO';
  user?: string;
  detail?: string;
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'cuti' | 'lembur' | 'dokumen' | 'presensi'>('all');
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

  // Dynamic approval list state synchronized with employee data and current date
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  // Dynamic Metrics State
  const [metrics, setMetrics] = useState({
    totalEmployees: 5,
    activeEmployees: 5,
    permanentCount: 5,
    contractCount: 0,
    probationCount: 0,
    attendanceRate: 0,
    onTimeCount: 0,
    lateCount: 0,
    leaveCount: 0,
    pendingApprovals: 0,
    pendingLeave: 0,
    pendingOvertime: 0,
    estimatedPayroll: 'Rp 90.000.000',
  });

  // Department distribution dataset (Dynamic from database)
  const [departments, setDepartments] = useState<any[]>([
    { name: 'HR', count: 5, percentage: 100, barColor: 'bg-blue-600' },
    { name: 'Finance', count: 5, percentage: 100, barColor: 'bg-blue-600' },
    { name: 'Operations', count: 5, percentage: 100, barColor: 'bg-blue-600' },
    { name: 'Engineering', count: 1, percentage: 100, barColor: 'bg-blue-600' },
  ]);

  // System audit activities (Dynamic from employee directory)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-1',
      action: 'LOGIN SUCCESS',
      timestamp: '2026-11-04 13.05.51 WIB',
      statusType: 'SUCCESS',
      user: 'Dewi Lestari, S.Psi',
    },
    {
      id: 'log-2',
      action: 'LOGIN FAIL',
      timestamp: '2026-11-04 12.58.12 WIB',
      statusType: 'FAIL',
      user: 'unknown.attempt@corp',
    },
    {
      id: 'log-3',
      action: 'LOGIN SUCCESS',
      timestamp: '2026-11-03 09.27.33 WIB',
      statusType: 'INFO',
      user: 'Dewi Lestari, S.Psi',
    },
  ]);

  // Table Filters & States for Persetujuan Tertunda
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('ALL');
  const [tableDeptFilter, setTableDeptFilter] = useState('ALL');
  const [tableSortAsc, setTableSortAsc] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

  // Audit Search State
  const [auditSearch, setAuditSearch] = useState('');

  // Weekly Attendance Trend Interactive Tooltip State (hovered day 0 to 6, default 6 / today)
  const [hoveredDay, setHoveredDay] = useState<number | null>(6);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Broadcast Announcement Submission
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

  // Fetch live metrics concurrently without blocking or stuttering UI scroll
  const fetchLiveMetrics = useCallback(async () => {
    try {
      const [empResResult, attResResult, appResResult, auditResResult] = await Promise.allSettled([
        fetch('/api/v1/employees?limit=200'),
        fetch('/api/v1/attendance'),
        fetch('/api/v1/approvals'),
        fetch('/api/v1/audit?limit=20'),
      ]);

      let newDeptList: any[] | null = null;
      let metricsPatch: Partial<typeof metrics> = {};
      let newRequests: ApprovalRequest[] | null = null;
      let newAuditLogs: AuditLogItem[] | null = null;

      // 1. Employee headcount, breakdown, payroll & department distribution
      if (empResResult.status === 'fulfilled' && empResResult.value.ok) {
        const json = await empResResult.value.json();
        const items: any[] = json.data?.items || [];
        const total = json.data?.meta?.total !== undefined ? json.data.meta.total : items.length;

        const permanent = items.filter((e) => e.employmentType === 'PERMANENT').length;
        const contract = items.filter(
          (e) => e.employmentType === 'CONTRACT_PKWT' || e.employmentType === 'CONTRACT'
        ).length;
        const probation = items.filter((e) => e.employmentType === 'PROBATION').length;

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
            : 'Rp 90.000.000';

        // Dynamic Department distribution
        const deptMap: Record<string, number> = {};
        items.forEach((emp) => {
          const dept = emp.department || 'Operasional';
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });

        const barColors = ['bg-blue-600', 'bg-blue-600', 'bg-blue-600', 'bg-blue-600'];

        let deptList = Object.entries(deptMap).map(([name, count], idx) => ({
          name,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 100,
          barColor: barColors[idx % barColors.length],
        }));

        if (deptList.length === 0) {
          deptList = [
            { name: 'HR', count: 5, percentage: 100, barColor: 'bg-blue-600' },
            { name: 'Finance', count: 5, percentage: 100, barColor: 'bg-blue-600' },
            { name: 'Operations', count: 5, percentage: 100, barColor: 'bg-blue-600' },
            { name: 'Engineering', count: 1, percentage: 100, barColor: 'bg-blue-600' },
          ];
        }

        newDeptList = deptList;
        metricsPatch = {
          ...metricsPatch,
          totalEmployees: total > 0 ? total : 5,
          activeEmployees: total > 0 ? total : 5,
          permanentCount: permanent > 0 ? permanent : 5,
          contractCount: contract,
          probationCount: probation,
          estimatedPayroll: payrollFormatted,
        };
      }

      // 2. Attendance stats (Dynamic today)
      if (attResResult.status === 'fulfilled' && attResResult.value.ok) {
        const json = await attResResult.value.json();
        if (json.data) {
          metricsPatch = {
            ...metricsPatch,
            onTimeCount: json.data.onTimeCount ?? 0,
            lateCount: json.data.lateCount ?? 0,
            leaveCount: json.data.leaveCount ?? 0,
            attendanceRate: json.data.attendanceRate ?? 0,
          };
        }
      }

      // 3. Approvals list (Real-time sync)
      if (appResResult.status === 'fulfilled' && appResResult.value.ok) {
        const json = await appResResult.value.json();
        if (Array.isArray(json.data)) {
          newRequests = json.data;
          metricsPatch = {
            ...metricsPatch,
            pendingApprovals: json.data.length,
            pendingLeave: json.data.filter((r: any) => r.type === 'cuti').length,
            pendingOvertime: json.data.filter((r: any) => r.type === 'lembur').length,
          };
        }
      }

      // 4. System Audit Activities (Live feed)
      if (auditResResult.status === 'fulfilled' && auditResResult.value.ok) {
        const json = await auditResResult.value.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          newAuditLogs = json.data.slice(0, 10).map((log: any) => {
            let statusType: 'SUCCESS' | 'FAIL' | 'INFO' = 'SUCCESS';
            const act = (log.action || '').toUpperCase();
            if (act.includes('FAIL') || act.includes('REJECT') || act.includes('DELETE')) {
              statusType = 'FAIL';
            } else if (act.includes('INFO') || act.includes('STREAM') || act.includes('SYNC')) {
              statusType = 'INFO';
            }

            return {
              id: log.id,
              action: act || 'LOGIN SUCCESS',
              timestamp: log.timestamp || '2026-11-04 13.05.51 WIB',
              statusType,
              user: log.userName || 'Karyawan',
              detail: log.module,
            };
          });
        }
      }

      // Single synchronized batched render
      if (newDeptList) setDepartments(newDeptList);
      if (Object.keys(metricsPatch).length > 0) {
        setMetrics((prev) => ({ ...prev, ...metricsPatch }));
      }
      if (newRequests) setRequests(newRequests);
      if (newAuditLogs) setAuditLogs(newAuditLogs);
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

  // Live real-time sync with Employee Dashboard & BroadcastChannel
  useEffect(() => {
    fetchLiveMetrics();
    const interval = setInterval(fetchLiveMetrics, 15000);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        if (msg.type === 'EMPLOYEES_UPDATED') {
          fetchLiveMetrics();
          showToast('⚡ Sinkronisasi: Perubahan data karyawan berhasil disinkronkan ke dashboard!');
        }

        if (msg.type === 'EMPLOYEE_CLOCKED_IN') {
          fetchLiveMetrics();
          showToast(
            `⚡ Presensi Baru Real-Time: ${msg.employeeName} baru saja Clock-In pukul ${msg.time} (${
              msg.status === 'TEPAT_WAKTU' ? 'Tepat Waktu' : 'Terlambat'
            })!`
          );
        }

        if (
          msg.type === 'NEW_APPROVAL_REQUEST' ||
          msg.type === 'APPROVAL_SUBMITTED' ||
          msg.type === 'LEAVE_SUBMITTED' ||
          msg.type === 'DOCUMENT_REQUEST_CREATED' ||
          msg.type === 'ATTENDANCE_CORRECTION_SUBMITTED'
        ) {
          fetchLiveMetrics();
          showToast(
            `🔔 Pengajuan Real-Time Baru: ${msg.request?.name || msg.request?.employeeName || msg.item?.name || msg.name || 'Karyawan'} baru saja mengajukan ${
              msg.title || msg.request?.title || 'permohonan'
            }!`
          );
        }

        if (
          msg.type === 'APPROVAL_STATUS_CHANGED' ||
          msg.type === 'LEAVE_ACTIONED' ||
          msg.type === 'ATTENDANCE_RECORDED' ||
          msg.type === 'ATTENDANCE_LOGGED'
        ) {
          fetchLiveMetrics();
        }
      };
    } catch {}

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
    };
  }, [fetchLiveMetrics]);

  // Handle Approve Action
  const handleApprove = async (id: string, name: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setMetrics((prev) => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
    }));

    try {
      const bc = new BroadcastChannel('nexora_live_sync');
      bc.postMessage({ type: 'APPROVAL_UPDATED', id, status: 'APPROVED' });
      bc.postMessage({ type: 'DOCUMENT_REQUEST_UPDATED', id, status: 'APPROVED' });
      bc.postMessage({ type: 'ATTENDANCE_CORRECTION_UPDATED', id, status: 'APPROVED' });
      bc.postMessage({ type: 'ATTENDANCE_RECORDED' });
      bc.close();
    } catch {}

    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' }),
      });
    } catch {}

    showToast(`✓ Permohonan ${name} telah disetujui & disinkronkan ke karyawan secara real-time.`);
  };

  // Handle Reject Action
  const handleReject = async (id: string, name: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setMetrics((prev) => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
    }));

    try {
      const bc = new BroadcastChannel('nexora_live_sync');
      bc.postMessage({ type: 'APPROVAL_UPDATED', id, status: 'REJECTED' });
      bc.postMessage({ type: 'DOCUMENT_REQUEST_UPDATED', id, status: 'REJECTED' });
      bc.postMessage({ type: 'ATTENDANCE_CORRECTION_UPDATED', id, status: 'REJECTED' });
      bc.close();
    } catch {}

    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'REJECTED' }),
      });
    } catch {}

    showToast(`✕ Permohonan ${name} telah ditolak & status diperbarui ke karyawan.`);
  };

  // Export Audit Logs to CSV
  const handleExportAuditCSV = () => {
    const headers = 'ID,Aktivitas,Waktu,Status,Pengguna\n';
    const rows = auditLogs
      .map(
        (log) =>
          `"${log.id}","${log.action}","${log.timestamp}","${log.statusType}","${log.user || 'Karyawan'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Log audit berhasil diekspor ke format .CSV');
  };

  // Trailing 7 Days Weekly Attendance & Activity Trend Dataset (Real-Time Synchronized)
  const weeklyData = useMemo(() => {
    const days: {
      dayLabel: string;
      dateFull: string;
      tepatWaktu: number;
      terlambat: number;
      izin: number;
      totalHadir: number;
    }[] = [];

    // Historical sensible distribution leading up to today
    const mockHistory = [
      { onTime: 5, late: 0, leave: 1 },
      { onTime: 5, late: 3, leave: 0 },
      { onTime: 4, late: 0, leave: 1 },
      { onTime: 6, late: 5, leave: 0 },
      { onTime: 5, late: 0, leave: 0 },
      { onTime: 5, late: 0, leave: 0 },
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayLabel = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
      }).format(d);
      const dateFull = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);

      if (i === 0) {
        // Today: Real-Time Live Counts
        const onTime = metrics.onTimeCount;
        const late = metrics.lateCount;
        const leave = metrics.leaveCount;
        days.push({
          dayLabel,
          dateFull,
          tepatWaktu: onTime,
          terlambat: late,
          izin: leave,
          totalHadir: onTime + late,
        });
      } else {
        const h = mockHistory[6 - i] || { onTime: 5, late: 0, leave: 0 };
        days.push({
          dayLabel,
          dateFull,
          tepatWaktu: h.onTime,
          terlambat: h.late,
          izin: h.leave,
          totalHadir: h.onTime + h.late,
        });
      }
    }

    return days;
  }, [now, metrics.onTimeCount, metrics.lateCount, metrics.leaveCount]);

  // Smooth Spline Coordinates & Path Calculation for Attendance Trendline
  const { trendPoints, smoothTrendPath, smoothAreaPath } = useMemo(() => {
    const points = weeklyData.map((d, i) => {
      // 7 columns across 700 width (centers at 50, 150, 250, 350, 450, 550, 650)
      const x = 50 + i * 100;
      // Baseline y = 135, available chart height = 95
      const val = d.totalHadir;
      const y = 135 - (Math.min(val, 8) / 8) * 95;
      return { x, y };
    });

    if (points.length === 0) {
      return { trendPoints: [], smoothTrendPath: '', smoothAreaPath: '' };
    }

    if (points.length === 1) {
      return {
        trendPoints: points,
        smoothTrendPath: `M ${points[0].x} ${points[0].y}`,
        smoothAreaPath: '',
      };
    }

    // Catmull-Rom to Cubic Bezier curve algorithm
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const area = `${path} L ${lastX} 145 L ${firstX} 145 Z`;

    return {
      trendPoints: points,
      smoothTrendPath: path,
      smoothAreaPath: area,
    };
  }, [weeklyData]);

  // Max value for bar scaling (minimum 8 for standard scale)
  const maxWeeklyValue = 8;

  // Filtered requests for Persetujuan Tertunda Table
  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        // Category tab filter
        if (activeFilter === 'cuti' && r.type !== 'cuti') return false;
        if (activeFilter === 'lembur' && r.type !== 'lembur') return false;
        if (activeFilter === 'dokumen' && r.type !== 'dokumen') return false;
        if (activeFilter === 'presensi' && r.type !== 'presensi') return false;

        // Search text
        if (tableSearch.trim()) {
          const q = tableSearch.toLowerCase();
          const matchName = r.name?.toLowerCase().includes(q);
          const matchRole = r.role?.toLowerCase().includes(q);
          const matchTitle = r.title?.toLowerCase().includes(q);
          const matchNik = r.nik?.toLowerCase().includes(q);
          if (!matchName && !matchRole && !matchTitle && !matchNik) return false;
        }

        // Status dropdown
        if (tableStatusFilter !== 'ALL') {
          if (tableStatusFilter === 'PENDING' && r.status && r.status !== 'PENDING') return false;
        }

        // Department dropdown
        if (tableDeptFilter !== 'ALL') {
          if (r.department && r.department !== tableDeptFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (tableSortAsc) {
          return a.name.localeCompare(b.name);
        }
        return b.name.localeCompare(a.name);
      });
  }, [requests, activeFilter, tableSearch, tableStatusFilter, tableDeptFilter, tableSortAsc]);

  // Unique departments for dropdown filter
  const uniqueDepts = useMemo(() => {
    const s = new Set<string>();
    departments.forEach((d) => s.add(d.name));
    requests.forEach((r) => {
      if (r.department) s.add(r.department);
    });
    return Array.from(s);
  }, [departments, requests]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    if (!auditSearch.trim()) return auditLogs;
    const q = auditSearch.toLowerCase();
    return auditLogs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.timestamp.toLowerCase().includes(q) ||
        l.user?.toLowerCase().includes(q)
    );
  }, [auditLogs, auditSearch]);

  const toggleSelectAllTable = () => {
    if (selectedTableIds.length === filteredRequests.length) {
      setSelectedTableIds([]);
    } else {
      setSelectedTableIds(filteredRequests.map((r) => r.id));
    }
  };

  const toggleSelectTableRow = (id: string) => {
    setSelectedTableIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayoutSkeleton onQuickAction={() => setIsQuickActionModalOpen(true)}>
      {/* Toast Notification Box */}
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
        {/* HEADER SECTION: GREETING & REAL-TIME CONTROLS */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
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
                className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
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
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedMonth === m ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live HR Broadcast Button (Matching screenshot: White bg, amber text & border) */}
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const autoDoc = `No. ${Math.floor(Math.random() * 900) + 100}/HR-NOTIF/${new Intl.DateTimeFormat('id-ID', { month: 'numeric' }).format(now)}/${now.getFullYear()}`;
                setBroadcastDocNumber(autoDoc);
                setIsBroadcastAnnouncementModalOpen(true);
              }}
              className="h-10 px-4 rounded-xl bg-amber-50/40 hover:bg-amber-100/60 text-amber-800 font-bold text-xs flex items-center gap-2 shadow-xs transition-all transform active:scale-95 cursor-pointer border border-amber-300"
              title="Siarkan pengumuman penting HR ke seluruh dashboard karyawan secara live"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-700" />
              <span>Siarkan Pengumuman HRD</span>
            </button>

            {/* Executive PDF Direct Download Button (Solid Blue) */}
            <button
              type="button"
              onClick={handleDownloadExecutiveRecap}
              disabled={isDownloadingRecap}
              className="h-10 px-4 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all transform active:scale-95 disabled:opacity-75 cursor-pointer"
              title="Klik untuk langsung mengunduh Rekap Eksekutif PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingRecap ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingRecap ? 'Mengunduh...' : 'Unduh Rekap Eksekutif (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 1: 4 CORE KPI SUMMARY CARDS WITH SPARKLINES */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Karyawan Aktif */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  TOTAL KARYAWAN AKTIF
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    {metrics.totalEmployees.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-medium text-slate-400">Orang</span>
                </div>

                {/* Smooth Green Sparkline Curve */}
                <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 70 30" fill="none">
                  <path
                    d="M0 20 C 15 25, 25 10, 40 18 C 55 25, 60 5, 70 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <span>✓</span>
                  <span>{metrics.permanentCount || 5} Tetap</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  • {metrics.contractCount || 0} Kontrak • {metrics.probationCount || 0} Probation
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Tingkat Kehadiran Hari Ini */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  TINGKAT KEHADIRAN HARI INI
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    {metrics.attendanceRate}%
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200">
                    {metrics.attendanceRate > 0
                      ? metrics.attendanceRate >= 90
                        ? 'Optimal'
                        : 'Normal'
                      : 'Belum Absen'}
                  </span>
                </div>

                {/* Smooth Green Sparkline Curve */}
                <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 70 30" fill="none">
                  <path
                    d="M0 22 C 20 22, 35 8, 50 16 C 60 22, 65 10, 70 14"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {metrics.onTimeCount} Tepat Waktu
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {metrics.lateCount} Telat
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {metrics.leaveCount} Izin
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Perlu Persetujuan */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  PERLU PERSETUJUAN
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                    {metrics.pendingApprovals}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Pengajuan Tertunda
                  </span>
                </div>

                {/* Amber Hill Curve Sparkline */}
                <svg className="w-16 h-8 text-amber-500" viewBox="0 0 70 30" fill="none">
                  <path
                    d="M0 24 C 25 24, 35 6, 48 10 C 58 14, 65 24, 70 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
          </div>

          {/* Card 4: Estimasi Payroll */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
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
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
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
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: MIDDLE ANALYTICAL PANELS (TREND CHART & HEADCOUNT DONUT) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ------------------------------------------------------- */}
          {/* LEFT: TREN KEHADIRAN & AKTIVITAS MINGGUAN (7 OF 12 COLS) */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A] leading-tight">
                    Tren Kehadiran &amp; Aktivitas Mingguan
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Weekly attendance &amp; Activity trends
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => showToast('Urutan rentang mingguan: 7 Hari Terakhir')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                  >
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    <span>Sort</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Menampilkan seluruh divisi')}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Filter className="w-3 h-3 text-slate-500" />
                    <span>Filter</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Legend Row */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 text-[11px] font-semibold text-slate-600 pt-3 pb-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xs shadow-blue-500/30" />
                    <span className="text-slate-700">Tepat Waktu</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 shadow-xs shadow-amber-500/30" />
                    <span className="text-slate-700">Terlambat</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-rose-500 to-red-400 shadow-xs shadow-rose-500/30" />
                    <span className="text-slate-700">Izin</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 bg-emerald-500 rounded-full inline-block relative after:w-1.5 after:h-1.5 after:rounded-full after:bg-emerald-500 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:ring-2 after:ring-white" />
                    <span className="text-slate-700">Tren Total</span>
                  </span>
                </div>
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  ● Sinkronisasi Real-Time
                </span>
              </div>

              {/* Interactive Bar & Smooth Spline Trendline Chart Container */}
              <div className="relative mt-4 h-52 w-full select-none">
                {/* Y-Axis Guidelines & Labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono pb-6">
                  {[8, 6, 4, 2, 0].map((val) => (
                    <div key={val} className="flex items-center w-full">
                      <span className="w-4 text-right pr-2 text-slate-400">{val}</span>
                      <div className="flex-1 border-b border-dashed border-slate-100" />
                    </div>
                  ))}
                </div>

                {/* 7-Days Bars Container */}
                <div className="absolute inset-0 pl-6 pr-2 flex items-end justify-between pb-6">
                  {weeklyData.map((d, idx) => {
                    const isHovered = hoveredDay === idx;
                    const onTimeHeight = (d.tepatWaktu / maxWeeklyValue) * 125;
                    const lateHeight = (d.terlambat / maxWeeklyValue) * 125;
                    const leaveHeight = (d.izin / maxWeeklyValue) * 125;

                    return (
                      <div
                        key={d.dayLabel}
                        onMouseEnter={() => setHoveredDay(idx)}
                        className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                      >
                        {/* Hover Column Glow/Highlight track */}
                        <div
                          className={`absolute inset-x-1 top-2 bottom-6 rounded-xl transition-all duration-200 pointer-events-none ${
                            isHovered
                              ? 'bg-blue-50/70 border border-blue-100 shadow-2xs'
                              : 'hover:bg-slate-50/50'
                          }`}
                        />

                        {/* Hover Tooltip Box */}
                        {isHovered && (
                          <div
                            className={`absolute -top-18 z-30 bg-[#0F172A]/95 backdrop-blur-md text-white rounded-xl p-2.5 shadow-2xl border border-slate-700/80 min-w-[135px] pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
                              idx === 0
                                ? 'left-0'
                                : idx === 6
                                ? 'right-0'
                                : 'left-1/2 -translate-x-1/2'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1 mb-1.5">
                              <span className="text-[10px] font-bold text-slate-200">{d.dateFull}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {d.totalHadir} Hadir
                              </span>
                            </div>
                            <div className="space-y-1 text-[10px]">
                              <div className="flex items-center justify-between text-blue-300 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                  <span>Tepat Waktu</span>
                                </span>
                                <span className="font-mono font-bold text-white">{d.tepatWaktu}</span>
                              </div>
                              <div className="flex items-center justify-between text-amber-300 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  <span>Terlambat</span>
                                </span>
                                <span className="font-mono font-bold text-white">{d.terlambat}</span>
                              </div>
                              {d.izin > 0 && (
                                <div className="flex items-center justify-between text-rose-300 font-medium">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    <span>Izin / Sakit</span>
                                  </span>
                                  <span className="font-mono font-bold text-white">{d.izin}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bars Group */}
                        <div className="relative z-10 flex items-end gap-1 mb-1 transition-transform duration-200 group-hover:scale-105">
                          {/* Tepat Waktu Bar */}
                          <div
                            style={{ height: `${Math.max(onTimeHeight, 4)}px` }}
                            className="w-3 sm:w-4 bg-gradient-to-t from-blue-700 via-blue-600 to-indigo-500 rounded-t-md shadow-xs shadow-blue-500/25 transition-all duration-300"
                          />
                          {/* Terlambat Bar */}
                          {d.terlambat > 0 && (
                            <div
                              style={{ height: `${Math.max(lateHeight, 4)}px` }}
                              className="w-3 sm:w-4 bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-md shadow-xs shadow-amber-500/25 transition-all duration-300"
                            />
                          )}
                          {/* Izin Bar */}
                          {d.izin > 0 && (
                            <div
                              style={{ height: `${Math.max(leaveHeight, 4)}px` }}
                              className="w-3 sm:w-4 bg-gradient-to-t from-rose-600 via-rose-500 to-red-400 rounded-t-md shadow-xs shadow-rose-500/25 transition-all duration-300"
                            />
                          )}
                        </div>

                        {/* X-Axis Date Label */}
                        <span
                          className={`text-[10px] font-semibold mt-1 transition-colors ${
                            idx === 6
                              ? 'text-blue-700 font-bold'
                              : isHovered
                              ? 'text-slate-900 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {d.dayLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* SVG Smooth Spline Trendline Overlay on top of bars */}
                <svg
                  className="absolute inset-0 pl-6 pr-2 w-full h-full pointer-events-none pb-6 overflow-visible"
                  viewBox="0 0 700 145"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="smoothTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                      <stop offset="60%" stopColor="#10B981" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="smoothGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10B981" floodOpacity="0.35" />
                    </filter>
                  </defs>

                  {/* Area under the smooth spline */}
                  {smoothAreaPath && (
                    <path d={smoothAreaPath} fill="url(#smoothTrendGradient)" />
                  )}

                  {/* Smooth Spline Stroke */}
                  {smoothTrendPath && (
                    <path
                      d={smoothTrendPath}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#smoothGlow)"
                    />
                  )}

                  {/* Smooth Interactive Glowing Nodes */}
                  {trendPoints.map((pt, i) => {
                    const isNodeHovered = hoveredDay === i;
                    return (
                      <g key={i} className="transition-all duration-200">
                        {isNodeHovered && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={9}
                            fill="#10B981"
                            fillOpacity="0.22"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isNodeHovered ? 5.5 : 3.5}
                          fill="#FFFFFF"
                          stroke="#10B981"
                          strokeWidth={isNodeHovered ? 3 : 2.5}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* RIGHT: DISTRIBUSI KARYAWAN & HEADCOUNT PER DIVISI (5 OF 12 COLS) */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A] leading-tight">
                    Distribusi Karyawan &amp; Headcount per Divisi
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Alokasi headcount per divisi
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                  {departments.length} Departemen
                </span>
              </div>

              {/* Two-Column Internal Layout: Progress Bars on Left, Donut on Right */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4 items-center">
                {/* Left: Department Progress Bars */}
                <div className="sm:col-span-7 space-y-3">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="text-slate-800">{dept.name}</span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          {dept.count}{' '}
                          <span className="text-slate-400 font-normal">({dept.percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1D4ED8] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(dept.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Donut Chart & Legend */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center pt-2 sm:pt-0">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* SVG Segmented Donut */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#F1F5F9"
                        strokeWidth="12"
                      />
                      {/* Segment 1: Blue (25%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#2563EB"
                        strokeWidth="12"
                        strokeDasharray="238.7"
                        strokeDashoffset="179"
                      />
                      {/* Segment 2: Orange (25%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#F97316"
                        strokeWidth="12"
                        strokeDasharray="238.7"
                        strokeDashoffset="179"
                        transform="rotate(90 50 50)"
                      />
                      {/* Segment 3: Green (30%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="12"
                        strokeDasharray="238.7"
                        strokeDashoffset="167"
                        transform="rotate(180 50 50)"
                      />
                    </svg>
                    {/* Center Text 55% */}
                    <div className="absolute text-center">
                      <span className="text-xl font-extrabold text-[#0F172A] leading-none">
                        55%
                      </span>
                    </div>
                  </div>

                  {/* Legend below donut */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2.5 text-[9px] text-slate-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" /> 25% HR
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500" /> 25% HR
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> 55% Operasional
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> 13% Operational
                    </span>
                    <span className="flex items-center gap-1 col-span-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> 15% Operasional
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Caption */}
            <div className="pt-3 border-t border-slate-100 text-center mt-3">
              <p className="text-[11px] font-medium text-slate-400">
                Interactive bar quick admin monitoring
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 3: PERSETUJUAN TERTUNDA (TABLE VIEW, FULL WIDTH) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] leading-tight">
                    Persetujuan Tertunda
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aksi peninjauan mandat HRD hari ini
                  </p>
                </div>

                {/* Filter Tabs Pills matching screenshot */}
                <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Semua ({requests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('cuti')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeFilter === 'cuti'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Cuti ({requests.filter((r) => r.type === 'cuti').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('lembur')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeFilter === 'lembur'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Lembur ({requests.filter((r) => r.type === 'lembur').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('dokumen')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeFilter === 'dokumen'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Dokumen &amp; Surat ({requests.filter((r) => r.type === 'dokumen').length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('presensi')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeFilter === 'presensi'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Koreksi Presensi ({requests.filter((r) => r.type === 'presensi').length})</span>
                  </button>
                </div>
              </div>

              {/* Comprehensive Filter Toolbar matching screenshot */}
              <div className="flex items-center gap-2 py-3 flex-wrap border-b border-slate-100 text-xs">
                {/* Search Input */}
                <div className="relative min-w-[140px] flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200/90 text-xs font-medium focus:outline-blue-600 bg-slate-50/50"
                  />
                </div>

                {/* Sort Button */}
                <button
                  type="button"
                  onClick={() => setTableSortAsc(!tableSortAsc)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  <span>Sort</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Date-Range Picker Button */}
                <button
                  type="button"
                  onClick={() => showToast('Rentang tanggal aktif: Bulan Ini (November 2026)')}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Date-Range Picker</span>
                </button>

                {/* Status Dropdown */}
                <select
                  value={tableStatusFilter}
                  onChange={(e) => setTableStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 cursor-pointer focus:outline-blue-600"
                >
                  <option value="ALL">Status</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="REJECTED">Ditolak</option>
                </select>

                {/* Departemen Dropdown */}
                <select
                  value={tableDeptFilter}
                  onChange={(e) => setTableDeptFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 cursor-pointer focus:outline-blue-600"
                >
                  <option value="ALL">Departemen</option>
                  {uniqueDepts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Lihat Data Historis */}
                <Link
                  href="/admin/approvals"
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 shadow-2xs inline-flex items-center"
                >
                  Lihat Data Historis
                </Link>

                {/* Filter Icon Button */}
                <button
                  type="button"
                  onClick={() => {
                    setTableSearch('');
                    setTableStatusFilter('ALL');
                    setTableDeptFilter('ALL');
                    showToast('Filter persetujuan direset');
                  }}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                  title="Reset Filter"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedTableIds.length === filteredRequests.length &&
                            filteredRequests.length > 0
                          }
                          onChange={toggleSelectAllTable}
                          className="rounded text-blue-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">
                        <span className="flex items-center gap-1 cursor-pointer" onClick={() => setTableSortAsc(!tableSortAsc)}>
                          <span>Name</span>
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3">
                        <span className="flex items-center gap-1">
                          <span>Department</span>
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3">
                        <span className="flex items-center gap-1">
                          <span>Type</span>
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3">
                        <span className="flex items-center gap-1">
                          <span>Submission Date</span>
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-14 text-center">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                          <p className="text-xs font-bold text-slate-800">
                            Semua Pengajuan Telah Ditinjau
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Tidak ada permohonan tertunda pada kategori ini.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr
                          key={req.id}
                          className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedTableIds.includes(req.id)}
                              onChange={() => toggleSelectTableRow(req.id)}
                              className="rounded text-blue-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full bg-gradient-to-tr ${req.avatarColor} text-white flex items-center justify-center font-bold text-xs flex-shrink-0`}
                              >
                                {req.initials || 'K'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{req.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {req.role || 'Karyawan'} {req.nik ? `• ${req.nik}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {req.department || 'Operasional'}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.type === 'cuti'
                                  ? 'bg-amber-100 text-amber-800'
                                  : req.type === 'lembur'
                                  ? 'bg-blue-100 text-blue-800'
                                  : req.type === 'dokumen'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {req.highlightType || req.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-medium text-[11px]">
                            {req.timestamp || 'Hari Ini'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              PENDING
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApprove(req.id, req.name)}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
                                title="Setujui Pengajuan"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(req.id, req.name)}
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                                title="Tolak Pengajuan"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              {req.hasAttachment && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewAttachment(req.attachmentName || 'Dokumen.pdf')}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                  title="Lihat Berkas"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        {/* ========================================================= */}
        {/* ROW 4: AKTIVITAS TERBARU SISTEM (AUDIT LOG - PLACED UNDERNEATH) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A] leading-tight">
                    Aktivitas Terbaru Sistem
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Log audit pergerakan HR &amp; sinkronisasi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    fetchLiveMetrics();
                    showToast('Log audit berhasil diperbarui!');
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Perbarui Log"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toolbar: Search input & Export CSV button */}
              <div className="flex items-center gap-2 py-3 border-b border-slate-100">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Cari Log..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-blue-600 bg-slate-50/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleExportAuditCSV}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer flex-shrink-0"
                >
                  <span>Ekspor (.CSV)</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>

              {/* Activity Log Grid (Responsive Multi-Column for Clean Full-Width View) */}
              <div className="mt-3">
                {filteredAuditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    Tidak ada aktivitas log yang sesuai filter.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredAuditLogs.map((act) => {
                      const dotClass =
                        act.statusType === 'FAIL'
                          ? 'bg-rose-500'
                          : act.statusType === 'INFO'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500';

                      const badgeClass =
                        act.statusType === 'FAIL'
                          ? 'bg-rose-600 text-white'
                          : act.statusType === 'INFO'
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white';

                      return (
                        <div
                          key={act.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-blue-50/40 transition-colors border border-slate-100 hover:border-blue-100 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full ${dotClass} flex-shrink-0 shadow-xs`} />
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">
                                {act.action}
                              </h3>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                {act.timestamp}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${badgeClass}`}
                          >
                            {act.statusType}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>

      {/* ========================================================= */}
      {/* QUICK ACTION MODAL (+ Tambah Baru) */}
      {/* ========================================================= */}
      {isQuickActionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
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
                    Hitung potongan alpa &amp; terbitkan slip gaji resmi.
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ATTACHMENT PREVIEW MODAL */}
      {/* ========================================================= */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                PDF
              </div>
              <p className="text-xs font-bold text-slate-800">Dokumen Lampiran Pengajuan</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Berkas diverifikasi otentik dari server dokumen terenkripsi.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BROADCAST ANNOUNCEMENT MODAL */}
      {/* ========================================================= */}
      {isBroadcastAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Siarkan Pengumuman HRD Real-Time
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Langsung tampil di dashboard seluruh staf &amp; ESS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastAnnouncementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAnnouncement} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Dokumen / SK
                </label>
                <input
                  type="text"
                  value={broadcastDocNumber}
                  onChange={(e) => setBroadcastDocNumber(e.target.value)}
                  placeholder="Contoh: No. 019/HR-NOTIF/XI/2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-600"
                />
              </div>

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

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Detail Ketentuan &amp; Isi Lengkap (Surat Edaran)
                </label>
                <textarea
                  rows={4}
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Isi lengkap ketetapan manajemen, poin-poin aturan, atau lampiran operasional..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-600"
                />
              </div>

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

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBroadcastAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBroadcast}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
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
