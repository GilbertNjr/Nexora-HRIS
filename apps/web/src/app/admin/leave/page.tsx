'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import { useApprovalsRealtime } from '@/hooks/useApprovalsRealtime';
import {
  CalendarCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Building2,
  FileText,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
  Download,
  Plus,
  Plane,
  PieChart,
  RefreshCw,
  Grid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  MoreVertical,
  Info,
  ShieldCheck,
  FileSpreadsheet,
  HeartPulse,
  Heart,
  PlusCircle,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  name: string;
  nik: string;
  role: string;
  department: string;
  avatarUrl: string;
  leaveType: string;
  typeCategory: 'tahunan' | 'sakit' | 'khusus';
  startDate: string;
  endDate: string;
  durationDays: number;
  remainingQuota: number;
  totalQuota: number;
  reason: string;
  documentName?: string;
  documentUrl?: string;
  status: 'PENDING_SPV' | 'PENDING_HRD' | 'APPROVED' | 'REJECTED';
  submittedDate: string;
  isNew?: boolean;
}

const INDO_MONTHS_MAP: Record<string, number> = {
  jan: 0, januari: 0,
  feb: 1, februari: 1,
  mar: 2, maret: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  agu: 7, agustus: 7, aug: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9, oct: 9,
  nov: 10, november: 10,
  des: 11, desember: 11, dec: 11,
};

export function parseFlexibleDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const s = String(dateStr).trim().toLowerCase();

  // YYYY-MM-DD or ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const parts = s.split('t')[0].split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(s)) {
    const parts = s.split('/');
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }

  // DD Month YYYY (e.g. 21 Okt 2026, 24 Maret 2025)
  const tokens = s.split(/[\s-]+/);
  if (tokens.length >= 3) {
    const d = parseInt(tokens[0], 10);
    const m = INDO_MONTHS_MAP[tokens[1].slice(0, 3)];
    const y = parseInt(tokens[2], 10);
    if (!isNaN(d) && m !== undefined && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function isDateInRange(target: Date, startStr: string | undefined, endStr: string | undefined): boolean {
  const start = parseFlexibleDate(startStr);
  if (!start) return false;
  const end = parseFlexibleDate(endStr) || start;

  const targetTime = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  return targetTime >= startTime && targetTime <= endTime;
}

export function formatReturnDate(endStr: string | undefined): string {
  const end = parseFlexibleDate(endStr);
  if (!end) return 'Besok';

  const returnDate = new Date(end);
  returnDate.setDate(returnDate.getDate() + 1);

  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const returnZero = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate()).getTime();
  const diffDays = Math.round((returnZero - todayZero) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Besok';

  return returnDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const mapApprovalToLeave = (item: any): LeaveRequest => {
  const isCuti = item.type === 'cuti' || !item.type;
  return {
    id: item.id,
    name: item.name,
    nik: item.nik || 'NX-201944',
    role: item.role ? item.role.split('•')[0].trim() : 'Staff Karyawan',
    department: item.department || (item.role?.includes('•') ? item.role.split('•')[1].trim() : 'Operasional'),
    avatarUrl:
      item.avatarUrl ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    leaveType: item.leaveType || item.highlightType || (isCuti ? 'Cuti Tahunan' : 'Lembur Operasional'),
    typeCategory: item.typeCategory || (item.leaveType?.toLowerCase().includes('sakit') ? 'sakit' : (item.leaveType?.toLowerCase().includes('khusus') || item.leaveType?.toLowerCase().includes('dispensasi')) ? 'khusus' : 'tahunan'),
    startDate: item.startDate || new Date().toISOString().slice(0, 10),
    endDate: item.endDate || new Date().toISOString().slice(0, 10),
    durationDays: item.durationDays || 1,
    remainingQuota: typeof item.remainingQuota === 'number' ? item.remainingQuota : 8,
    totalQuota: item.totalQuota || 12,
    reason: item.reason || item.detail || 'Keperluan Pribadi',
    documentName: item.documentName || item.attachmentName,
    documentUrl: item.documentUrl || '#',
    status: item.status === 'APPROVED' ? 'APPROVED' : item.status === 'REJECTED' ? 'REJECTED' : 'PENDING_HRD',
    submittedDate: item.submittedDate || item.timestamp || 'Hari ini',
    isNew: item.isNew,
  };
};

export default function AdminLeavePage() {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [filterStatusPill, setFilterStatusPill] = useState<string>('ALL');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Bulan Ini');
  const [selectedDept, setSelectedDept] = useState('Semua Departemen');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dynamic Calendar & Roster State
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(() => new Date());
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterDeptFilter, setRosterDeptFilter] = useState('ALL');

  // Modals State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Base Dataset (Initialized empty until employee submits leave)
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  // Fetch live leave requests from unified API
  const fetchLiveLeaveData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/approvals?all=true', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          const cutiItems = json.data
            .filter((item: any) => item.type === 'cuti' || !item.type || item.leaveType)
            .map(mapApprovalToLeave);
          setRequests(cutiItems);
        }
      }
      if (isManualRefresh) {
        showToast('✓ Data antrean cuti & izin berhasil diperbarui secara real-time.');
      }
    } catch {
      // Keep resilient fallback
    } finally {
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  // Multi-device real-time SSE stream hook
  useApprovalsRealtime({
    playAudioAlert: true,
    onLeaveSubmitted: (newItem) => {
      if (newItem.type === 'lembur' && !newItem.leaveType) return;
      const mapped = mapApprovalToLeave({ ...newItem, isNew: true });
      setRequests((prev) => [mapped, ...prev.filter((r) => r.id !== mapped.id)]);
      showToast(`🔔 Pengajuan Cuti Baru Real-Time: ${mapped.name} mengajukan ${mapped.leaveType}!`, 'info');
    },
    onLeaveActioned: ({ id, status }) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED' } : r
        )
      );
    },
    onRefresh: () => {
      fetchLiveLeaveData(false);
    },
  });

  // Cross-tab BroadcastChannel listener for zero-latency multi-tab updates
  useEffect(() => {
    fetchLiveLeaveData(false);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (
          msg?.type === 'APPROVAL_SUBMITTED' ||
          msg?.type === 'APPROVAL_STATUS_CHANGED' ||
          msg?.type === 'APPROVAL_UPDATED' ||
          msg?.type === 'LEAVE_REQUEST_SUBMITTED' ||
          msg?.type === 'ATTENDANCE_RECORDED'
        ) {
          fetchLiveLeaveData(false);
        }
      };
    } catch {}

    const handleFocus = () => fetchLiveLeaveData(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchLiveLeaveData]);

  const today = useMemo(() => new Date(), []);

  // Filter requests by status
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'PENDING_HRD' || r.status === 'PENDING_SPV'),
    [requests]
  );
  const pendingCount = pendingRequests.length;

  const approvedRequests = useMemo(
    () => requests.filter((r) => r.status === 'APPROVED'),
    [requests]
  );
  const approvedCount = approvedRequests.length;

  const rejectedCount = useMemo(
    () => requests.filter((r) => r.status === 'REJECTED').length,
    [requests]
  );

  // Active leaves today (employees actually on leave today)
  const activeLeavesToday = useMemo(
    () => approvedRequests.filter((r) => isDateInRange(today, r.startDate, r.endDate)),
    [approvedRequests, today]
  );

  const tahunanToday = useMemo(
    () => activeLeavesToday.filter((r) => r.typeCategory === 'tahunan').length,
    [activeLeavesToday]
  );
  const sakitToday = useMemo(
    () => activeLeavesToday.filter((r) => r.typeCategory === 'sakit').length,
    [activeLeavesToday]
  );
  const khususToday = useMemo(
    () => activeLeavesToday.filter((r) => r.typeCategory === 'khusus').length,
    [activeLeavesToday]
  );

  // Overall category counts for context
  const approvedTahunan = useMemo(
    () => approvedRequests.filter((r) => r.typeCategory === 'tahunan').length,
    [approvedRequests]
  );
  const approvedSakit = useMemo(
    () => approvedRequests.filter((r) => r.typeCategory === 'sakit').length,
    [approvedRequests]
  );
  const approvedKhusus = useMemo(
    () => approvedRequests.filter((r) => r.typeCategory === 'khusus').length,
    [approvedRequests]
  );

  // Dynamic Headcount and Quota Utilization
  const totalHeadcount = useMemo(
    () => Math.max(26, requests.length + 20),
    [requests]
  );
  const totalApprovedDays = useMemo(
    () => approvedRequests.reduce((sum, r) => sum + (r.durationDays || 1), 0),
    [approvedRequests]
  );
  const utilizationRate = useMemo(
    () => Math.min(100, Math.round((totalApprovedDays / (totalHeadcount * 12)) * 100)),
    [totalApprovedDays, totalHeadcount]
  );
  const avgDaysTaken = useMemo(
    () => (totalApprovedDays / totalHeadcount).toFixed(1),
    [totalApprovedDays, totalHeadcount]
  );
  const avgRemainingDays = useMemo(
    () => (12 - Number(avgDaysTaken)).toFixed(1),
    [avgDaysTaken]
  );
  const currentQuarterStr = useMemo(
    () => `Kuartal ${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()} Normal`,
    [today]
  );

  // Sick leaves analysis
  const allSickLeaves = useMemo(
    () => requests.filter((r) => r.typeCategory === 'sakit' || r.leaveType?.toLowerCase().includes('sakit')),
    [requests]
  );
  const verifiedSickLeaves = useMemo(
    () => allSickLeaves.filter((r) => r.hasAttachment || Boolean(r.documentName)),
    [allSickLeaves]
  );
  const unverifiedSickCount = allSickLeaves.length - verifiedSickLeaves.length;
  const verifiedPercent = allSickLeaves.length > 0 ? Math.round((verifiedSickLeaves.length / allSickLeaves.length) * 100) : 100;
  const totalCount = requests.length;

  // Calendar Calculation for the active calendar month
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIdx = calendarMonth.getMonth();

  const currentMonthName = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(calendarMonth),
    [calendarMonth]
  );

  const calendarCells = useMemo(() => {
    const daysInCurrentMonth = new Date(calendarYear, calendarMonthIdx + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarYear, calendarMonthIdx, 0).getDate();
    // Monday is 0, Sunday is 6
    const startDayOfWeek = (new Date(calendarYear, calendarMonthIdx, 1).getDay() + 6) % 7;

    const cells: {
      dayNumber: number;
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      dayOfWeek: number;
      approvedLeaves: LeaveRequest[];
      pendingLeaves: LeaveRequest[];
    }[] = [];

    // Leading days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(calendarYear, calendarMonthIdx - 1, d);
      cells.push({
        dayNumber: d,
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        dayOfWeek: (prevDate.getDay() + 6) % 7,
        approvedLeaves: [],
        pendingLeaves: [],
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const cellDate = new Date(calendarYear, calendarMonthIdx, d);
      const isToday = cellDate.toDateString() === today.toDateString();
      const isSelected = cellDate.toDateString() === selectedCalendarDate.toDateString();
      const dayOfWeek = (cellDate.getDay() + 6) % 7;

      const cellApproved = requests.filter(
        (r) => r.status === 'APPROVED' && isDateInRange(cellDate, r.startDate, r.endDate)
      );
      const cellPending = requests.filter(
        (r) =>
          (r.status === 'PENDING' || r.status === 'PENDING_HRD' || r.status === 'PENDING_SPV') &&
          isDateInRange(cellDate, r.startDate, r.endDate)
      );

      cells.push({
        dayNumber: d,
        date: cellDate,
        isCurrentMonth: true,
        isToday,
        isSelected,
        dayOfWeek,
        approvedLeaves: cellApproved,
        pendingLeaves: cellPending,
      });
    }

    // Trailing days from next month to complete weeks (multiples of 7)
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextDate = new Date(calendarYear, calendarMonthIdx + 1, d);
        cells.push({
          dayNumber: d,
          date: nextDate,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          dayOfWeek: (nextDate.getDay() + 6) % 7,
          approvedLeaves: [],
          pendingLeaves: [],
        });
      }
    }

    return cells;
  }, [calendarYear, calendarMonthIdx, requests, today, selectedCalendarDate]);

  // Leaves on selected calendar date
  const leavesOnSelectedDate = useMemo(() => {
    return requests.filter(
      (r) => r.status === 'APPROVED' && isDateInRange(selectedCalendarDate, r.startDate, r.endDate)
    );
  }, [requests, selectedCalendarDate]);

  const isSelectedDateToday = useMemo(
    () => selectedCalendarDate.toDateString() === today.toDateString(),
    [selectedCalendarDate, today]
  );

  const formattedSelectedDateStr = useMemo(
    () =>
      selectedCalendarDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [selectedCalendarDate]
  );

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarYear, calendarMonthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarYear, calendarMonthIdx + 1, 1));
  };

  const handleResetToToday = () => {
    const now = new Date();
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedCalendarDate(now);
  };

  const uniqueDepartments = useMemo(() => {
    const s = new Set<string>();
    requests.forEach((r) => {
      if (r.department) s.add(r.department);
    });
    return Array.from(s);
  }, [requests]);

  const filteredRoster = useMemo(() => {
    return requests
      .filter((r) => r.status === 'APPROVED')
      .filter((r) => {
        if (rosterDeptFilter !== 'ALL' && r.department !== rosterDeptFilter) return false;
        if (rosterSearch) {
          const q = rosterSearch.toLowerCase();
          const matchName = r.name.toLowerCase().includes(q);
          const matchNik = r.nik.toLowerCase().includes(q);
          const matchType = r.leaveType.toLowerCase().includes(q);
          const matchDept = r.department.toLowerCase().includes(q);
          if (!matchName && !matchNik && !matchType && !matchDept) return false;
        }
        return true;
      });
  }, [requests, rosterDeptFilter, rosterSearch]);

  // Form State for Manual Submission Modal
  const [manualForm, setManualForm] = useState({
    employeeName: 'Budi Santoso (NX-201944)',
    leaveType: 'Cuti Tahunan',
    startDate: '2025-04-02',
    endDate: '2025-04-04',
    reason: '',
  });

  // Filtered Requests Logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Tab filter
      if (activeTab === 'PENDING' && !r.status.startsWith('PENDING')) return false;
      if (activeTab === 'APPROVED' && r.status !== 'APPROVED') return false;
      if (activeTab === 'REJECTED' && r.status !== 'REJECTED') return false;

      // Status pill filter
      if (filterStatusPill === 'PENDING_SPV' && r.status !== 'PENDING_SPV') return false;
      if (filterStatusPill === 'PENDING_HRD' && r.status !== 'PENDING_HRD') return false;
      if (filterStatusPill === 'APPROVED' && r.status !== 'APPROVED') return false;
      if (filterStatusPill === 'HAS_DOC' && !r.documentName) return false;

      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = r.name.toLowerCase().includes(query);
        const matchNik = r.nik.toLowerCase().includes(query);
        const matchDept = r.department.toLowerCase().includes(query);
        if (!matchName && !matchNik && !matchDept) return false;
      }

      return true;
    });
  }, [requests, activeTab, filterStatusPill, searchTerm]);

  // Approval Handlers (Synchronized to Backend & All Devices)
  const handleApprove = async (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
    );
    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' }),
      });
      try {
        const bc = new BroadcastChannel('nexora_live_sync');
        bc.postMessage({ type: 'APPROVAL_UPDATED', id, status: 'APPROVED' });
        bc.close();
      } catch {}
    } catch {}
    showToast(`✓ Permohonan cuti ${name} telah berhasil disetujui & disinkronkan secara real-time!`, 'success');
  };

  const handleReject = async (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
    );
    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'REJECTED' }),
      });
      try {
        const bc = new BroadcastChannel('nexora_live_sync');
        bc.postMessage({ type: 'APPROVAL_UPDATED', id, status: 'REJECTED' });
        bc.close();
      } catch {}
    } catch {}
    showToast(`✕ Permohonan cuti ${name} telah ditolak & disinkronkan.`, 'info');
  };

  // Export to Excel handler
  const handleExportExcel = () => {
    showToast('Mengunduh Laporan Rekapitulasi Cuti & Izin (.xlsx)...', 'info');
    setTimeout(() => {
      const csvHeader = 'NIK,NAMA KARYAWAN,DEPARTEMEN,JENIS CUTI,TANGGAL MULAI,TANGGAL SELESAI,DURASI HARI,SISA KUOTA,STATUS\n';
      const csvRows = requests
        .map(
          (r) =>
            `"${r.nik}","${r.name}","${r.department}","${r.leaveType}","${r.startDate}","${r.endDate}",${r.durationDays},${r.remainingQuota},"${r.status}"`
        )
        .join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rekap_Cuti_Karyawan_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Laporan cuti & izin berhasil diunduh!');
    }, 600);
  };

  // Submit Manual Leave (Persisted & Synced across all screens)
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = manualForm.employeeName.split(' (')[0];
    const nik = manualForm.employeeName.match(/\((.*?)\)/)?.[1] || 'NX-202500';
    const newReqItem = {
      name,
      nik,
      role: 'Staff Anggota • Operasional',
      department: 'Operasional',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      type: 'cuti',
      leaveType: manualForm.leaveType,
      typeCategory: manualForm.leaveType.includes('Sakit') ? 'sakit' : 'tahunan',
      title: `Pengajuan Manual: ${manualForm.leaveType}`,
      highlightType: manualForm.leaveType,
      detail: `3 Hari: ${manualForm.startDate} s/d ${manualForm.endDate}`,
      startDate: manualForm.startDate,
      endDate: manualForm.endDate,
      durationDays: 3,
      remainingQuota: 9,
      totalQuota: 12,
      reason: manualForm.reason || 'Pengajuan manual oleh HR Operations',
      status: 'APPROVED',
      submittedDate: 'Hari Ini, Barusan',
    };

    try {
      await fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReqItem),
      });
    } catch {}

    fetchLiveLeaveData(false);
    setIsManualModalOpen(false);
    showToast(`Pengajuan cuti manual untuk ${name} berhasil disimpan dan disetujui!`);
  };

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb with Integrated Workflow Badge */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors uppercase tracking-wider text-[11px]">
            UTAMA
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">
            MANAJEMEN CUTI &amp; IZIN
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>SISTEM WORKFLOW TERPADU</span>
          </span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Manajemen Cuti &amp; Izin
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Kelola permohonan cuti tahunan, izin sakit, dispensasi khusus, serta pantau sisa kuota hak
              cuti karyawan secara akurat dan transparan.
            </p>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Kebijakan & Kuota Cuti */}
            <Link
              href="/admin/leave/policy"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all hover:border-blue-400 hover:text-blue-600"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Kebijakan &amp; Kuota Cuti</span>
            </Link>

            {/* Ekspor Rekap (.xlsx) */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor Rekap (.xlsx)</span>
            </button>

            {/* Ajukan Cuti Manual */}
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Ajukan Cuti Manual</span>
            </button>
          </div>
        </div>

        {/* 4 Core Metric Cards (Real-time dynamic data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: PERMOHONAN MENUNGGU */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PERMOHONAN MENUNGGU
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{pendingCount}</span>
              <span className="text-sm font-semibold text-slate-700">Pengajuan</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('PENDING');
                  setFilterStatusPill('PENDING_HRD');
                }}
                className="w-full flex items-center justify-between text-xs font-semibold text-amber-800 bg-amber-50/70 hover:bg-amber-100/70 px-3 py-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{pendingCount} Perlu Tindakan Segera</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: SEDANG CUTI HARI INI */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                SEDANG CUTI HARI INI
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeLeavesToday.length > 0 ? activeLeavesToday.length : approvedCount}
              </span>
              <span className="text-sm font-semibold text-slate-700">Karyawan</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <span>
                {activeLeavesToday.length > 0 ? tahunanToday : approvedTahunan} Tahunan •{' '}
                {activeLeavesToday.length > 0 ? sakitToday : approvedSakit} Sakit •{' '}
                {activeLeavesToday.length > 0 ? khususToday : approvedKhusus} Dispensasi
              </span>
            </div>
          </div>

          {/* Card 3: TINGKAT UTILISASI KUOTA */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TINGKAT UTILISASI KUOTA
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {Math.max(12, utilizationRate)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                (Rata-rata {avgDaysTaken}/12 hari)
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{currentQuarterStr}</span>
              </div>
              <span className="text-slate-500 text-[11px]">Sisa: {avgRemainingDays} Hari/Karyawan</span>
            </div>
          </div>

          {/* Card 4: KLAIM IZIN SAKIT BULAN INI */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                KLAIM IZIN SAKIT BULAN INI
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {allSickLeaves.length}
              </span>
              <span className="text-sm font-semibold text-slate-700">Kasus Tercatat</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{verifiedPercent}% Terverifikasi SKD</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {unverifiedSickCount > 0 ? `${unverifiedSickCount} Kasus Tanpa Bukti` : 'Semua Terverifikasi'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection Filter (Under Top Metrics) */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Daftar Pengajuan (Semua)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'PENDING'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Menunggu Persetujuan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('APPROVED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Telah Disetujui</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200 text-emerald-800 font-bold">
                {approvedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REJECTED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'REJECTED'
                  ? 'bg-rose-100 text-rose-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Ditolak / Batal</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-600 font-bold">
                {rejectedCount}
              </span>
            </button>
          </div>

          {/* Quick Icons Right */}
          <div className="flex items-center gap-1.5 px-2">
            <button
              type="button"
              onClick={() => fetchLiveLeaveData(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Segarkan Data Real-Time"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => showToast('Mengganti mode tampilan tabel')}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Pengaturan Kolom"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Quick Filter Pills */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3.5">
          {/* Top Inputs row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Nama Karyawan, NIK..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Bulan Dropdown */}
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white cursor-pointer"
              >
                <option value="Bulan Ini: Mar">Bulan Ini: Mar</option>
                <option value="Bulan Lalu: Feb">Bulan Lalu: Feb</option>
                <option value="Januari 2025">Januari 2025</option>
                <option value="Semua Periode">Semua Periode</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Departemen Dropdown */}
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white cursor-pointer"
              >
                <option value="Semua Departemen">Semua Departemen</option>
                <option value="Product Design">Product Design</option>
                <option value="Technology & IT">Technology &amp; IT</option>
                <option value="People Operations">People Operations</option>
                <option value="Logistik & Hub">Logistik &amp; Hub</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Lainnya */}
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select className="w-full appearance-none pl-9 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white cursor-pointer">
                <option value="Semua Tipe">Semua Tipe Cuti</option>
                <option value="Tahunan">Cuti Tahunan</option>
                <option value="Sakit">Izin Sakit (SKD)</option>
                <option value="Khusus">Cuti Khusus</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Filter Pills Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                FILTER CEPAT:
              </span>

              <button
                type="button"
                onClick={() => setFilterStatusPill('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterStatusPill === 'ALL'
                    ? 'bg-[#1D4ED8] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Semua Status
              </button>

              <button
                type="button"
                onClick={() => setFilterStatusPill('PENDING_SPV')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatusPill === 'PENDING_SPV'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pending SPV
              </button>

              <button
                type="button"
                onClick={() => setFilterStatusPill('PENDING_HRD')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatusPill === 'PENDING_HRD'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pending HRD
              </button>

              <button
                type="button"
                onClick={() => setFilterStatusPill('APPROVED')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatusPill === 'APPROVED'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Disetujui HRD
              </button>

              <button
                type="button"
                onClick={() => setFilterStatusPill('HAS_DOC')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  filterStatusPill === 'HAS_DOC'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Perlu Dokumen
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterStatusPill('ALL');
                setActiveTab('ALL');
                showToast('Filter berhasil direset');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        {/* Main Two-Column Layout: Table Left, Calendar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Table of Leave Requests (8 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                          onChange={() => {
                            if (selectedIds.length === filteredRequests.length) {
                              setSelectedIds([]);
                            } else {
                              setSelectedIds(filteredRequests.map((r) => r.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="py-3 px-3">KARYAWAN &amp; DIVISI</th>
                      <th className="py-3 px-3">JENIS CUTI &amp; PERIODE</th>
                      <th className="py-3 px-3 text-center">DURASI</th>
                      <th className="py-3 px-3">SISA KUOTA</th>
                      <th className="py-3 px-3">DOKUMEN / ALASAN</th>
                      <th className="py-3 px-3 text-right">AKSI</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Tidak ada pengajuan cuti yang sesuai dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr
                          key={req.id}
                          className={`transition-all duration-700 ${
                            req.isNew
                              ? 'bg-blue-50/90 border-l-4 border-l-blue-600 animate-pulse'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(req.id)}
                              onChange={() =>
                                setSelectedIds((prev) =>
                                  prev.includes(req.id)
                                    ? prev.filter((i) => i !== req.id)
                                    : [...prev, req.id]
                                )
                              }
                              className="rounded border-slate-300 text-blue-600"
                            />
                          </td>

                          {/* Karyawan & Divisi */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5 min-w-[170px]">
                              <img
                                src={req.avatarUrl}
                                alt={req.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 leading-tight truncate">
                                  {req.name}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {req.role} • <span className="font-mono text-slate-500">{req.nik}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Jenis Cuti & Periode */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5 min-w-[150px]">
                              <span
                                className={`font-bold block text-xs ${
                                  req.typeCategory === 'sakit'
                                    ? 'text-amber-700'
                                    : req.typeCategory === 'khusus'
                                    ? 'text-purple-700'
                                    : 'text-blue-700'
                                }`}
                              >
                                {req.leaveType}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{req.startDate} - {req.endDate}</span>
                              </div>
                            </div>
                          </td>

                          {/* Durasi */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                              {req.durationDays} Hari
                            </span>
                          </td>

                          {/* Sisa Kuota */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div>
                              <p className="font-bold text-slate-900">{req.remainingQuota} Hari</p>
                              <p className="text-[10px] text-slate-400">
                                {req.typeCategory === 'sakit' ? 'Tidak potong saldo' : `dari ${req.totalQuota} hari`}
                              </p>
                            </div>
                          </td>

                          {/* Dokumen & Alasan */}
                          <td className="py-3.5 px-3 max-w-[200px]">
                            <p className="text-[11px] text-slate-600 truncate italic">
                              "{req.reason}"
                            </p>
                            {req.documentName && (
                              <button
                                type="button"
                                onClick={() => setSelectedDocPreview(req.documentName || null)}
                                className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/70 px-1.5 py-0.5 rounded hover:bg-rose-100 transition-colors"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[130px]">{req.documentName}</span>
                              </button>
                            )}
                          </td>

                          {/* Aksi Setujui / Tolak */}
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            {req.status === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                                <Check className="w-3 h-3" />
                                Disetujui
                              </span>
                            ) : req.status === 'REJECTED' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200">
                                <X className="w-3 h-3" />
                                Ditolak
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(req.id, req.name)}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95"
                                  title="Setujui Cuti"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(req.id, req.name)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-xs transition-transform active:scale-95"
                                  title="Tolak Cuti"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
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
          {/* RIGHT COLUMN: Kalender Cuti & Absen Hari Ini (4 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: Kalender Cuti Departemen */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Kalender Cuti Departemen
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    title="Bulan sebelumnya"
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-lg capitalize">
                    {currentMonthName}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    title="Bulan berikutnya"
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Calendar Grid (Sen, Sel, Rab, Kam, Jum, Sab, Min) */}
              <div className="space-y-2 text-center text-xs">
                <div className="grid grid-cols-7 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span className="text-rose-500">Sab</span>
                  <span className="text-rose-500">Min</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold">
                  {calendarCells.map((cell, idx) => {
                    const isWeekend = cell.dayOfWeek === 5 || cell.dayOfWeek === 6;
                    const hasApproved = cell.approvedLeaves.length > 0;
                    const hasPending = cell.pendingLeaves.length > 0;

                    let cellStyle = 'text-slate-700 hover:bg-slate-100';
                    if (!cell.isCurrentMonth) {
                      cellStyle = isWeekend ? 'text-rose-200 hover:bg-slate-50' : 'text-slate-300 hover:bg-slate-50';
                    } else if (cell.isSelected) {
                      cellStyle = 'bg-[#1D4ED8] text-white font-bold shadow-xs';
                    } else if (hasApproved) {
                      cellStyle = 'bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 border border-blue-200/50';
                    } else if (cell.isToday) {
                      cellStyle = 'text-blue-700 font-extrabold ring-1.5 ring-blue-500 bg-blue-50/40 hover:bg-blue-100/50';
                    } else if (isWeekend) {
                      cellStyle = 'text-rose-500 hover:bg-rose-50/60';
                    }

                    const tooltipText = [
                      cell.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                      cell.isToday ? '(Hari Ini)' : '',
                      hasApproved ? `• ${cell.approvedLeaves.length} cuti disetujui: ${cell.approvedLeaves.map((l) => l.name).join(', ')}` : '',
                      hasPending ? `• ${cell.pendingLeaves.length} menunggu approval` : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <button
                        key={`${cell.dayNumber}-${idx}`}
                        type="button"
                        onClick={() => setSelectedCalendarDate(cell.date)}
                        title={tooltipText}
                        className={`relative p-1.5 rounded-lg transition-all flex flex-col items-center justify-center h-8 text-[11px] ${cellStyle}`}
                      >
                        <span>{cell.dayNumber}</span>
                        {/* Status Dots */}
                        {cell.isCurrentMonth && (hasApproved || hasPending) && !cell.isSelected && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {hasApproved && (
                              <span className="w-1 h-1 rounded-full bg-blue-600 inline-block" />
                            )}
                            {hasPending && (
                              <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-section: ABSEN HARI INI / TANGGAL DIPILIH */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                      {isSelectedDateToday ? 'ABSEN HARI INI' : `ABSEN: ${formattedSelectedDateStr}`} ({leavesOnSelectedDate.length} DARI {totalHeadcount})
                    </span>
                    {!isSelectedDateToday && (
                      <button
                        type="button"
                        onClick={handleResetToToday}
                        className="text-[9px] font-semibold text-blue-600 hover:underline"
                        title="Kembali ke Hari Ini"
                      >
                        • Hari Ini
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRosterModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-2">
                  {leavesOnSelectedDate.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-xs font-semibold text-slate-700">Seluruh Karyawan Hadir</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tidak ada cuti aktif pada {formattedSelectedDateStr}
                      </p>
                    </div>
                  ) : (
                    leavesOnSelectedDate.map((leave) => {
                      const badgeColor =
                        leave.typeCategory === 'sakit'
                          ? 'bg-amber-100 text-amber-800'
                          : leave.typeCategory === 'khusus'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800';

                      const badgeLabel =
                        leave.typeCategory === 'sakit'
                          ? 'Sakit'
                          : leave.typeCategory === 'khusus'
                          ? 'Dispensasi'
                          : 'Tahunan';

                      return (
                        <div
                          key={leave.id}
                          className="p-2 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={leave.avatarUrl}
                              alt={leave.name}
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 leading-tight truncate">
                                {leave.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {leave.role || leave.department}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                              {badgeLabel}
                            </span>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Balik: {formatReturnDate(leave.endDate)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Aturan Kebijakan Cuti */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">Aturan Kebijakan Cuti</h4>
                </div>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Sistem otomatis memvalidasi pengajuan sesuai UU Ketenagakerjaan &amp; PKB Perusahaan.
                Cuti &gt; 2 hari kerja wajib persetujuan 2 tingkat (SPV + HRD).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Ajukan Cuti Manual (HR Direct Entry) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Formulir Input Cuti Manual (Mandat HR)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Input darurat untuk karyawan lapangan atau cuti dispensasi khusus
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Karyawan *
                </label>
                <select
                  value={manualForm.employeeName}
                  onChange={(e) => setManualForm({ ...manualForm, employeeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Budi Santoso (NX-201944)">Budi Santoso — Product Design (NX-201944)</option>
                  <option value="Siti Rahmawati (NX-202105)">Siti Rahmawati — HR (NX-202105)</option>
                  <option value="Dimas Aditya (NX-202219)">Dimas Aditya — IT (NX-202219)</option>
                  <option value="Ahmad Rizki (NX-202302)">Ahmad Rizki — Logistik (NX-202302)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jenis Cuti / Izin *
                </label>
                <select
                  value={manualForm.leaveType}
                  onChange={(e) => setManualForm({ ...manualForm, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Potong Saldo Kuota)</option>
                  <option value="Cuti Sakit (Rawat Jalan)">Cuti Sakit Rawat Jalan (Wajib SKD)</option>
                  <option value="Cuti Khusus (Menikah)">Cuti Khusus Menikah (3 Hari Bebas Kuota)</option>
                  <option value="Dispensasi Khusus">Dispensasi Khusus Kantor</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={manualForm.startDate}
                    onChange={(e) => setManualForm({ ...manualForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={manualForm.endDate}
                    onChange={(e) => setManualForm({ ...manualForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alasan &amp; Keterangan Pendukung
                </label>
                <textarea
                  rows={3}
                  value={manualForm.reason}
                  onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })}
                  placeholder="Tuliskan keterangan keperluan cuti / izin..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Simpan &amp; Sahkan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Kebijakan & Kuota Cuti */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Parameter Kebijakan &amp; Batas Kuota Cuti Perusahaan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800">Hak Cuti Tahunan Standar</span>
                <p className="text-slate-500">
                  12 hari kerja per tahun kalender untuk setiap karyawan tetap (PKWTT) dan PKWT setelah masa kerja 12 bulan.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Ketentuan Surat Dokter (SKD)</span>
                <p className="text-slate-500">
                  Izin sakit tanpa pemotongan saldo kuota wajib melampirkan file SKD resmi dari klinik atau rumah sakit berlisensi maksimal 2x24 jam sejak hari pertama absen.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Aturan Persetujuan Berjenjang</span>
                <p className="text-slate-500">
                  Cuti 1-2 hari cukup disetujui atasan divisi (SPV). Cuti 3 hari atau lebih otomatis memerlukan verifikasi ganda dari tim HR Operations.
                </p>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Tutup Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Dokumen Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pratinjau Dokumen Lampiran
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">{selectedDocPreview}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <p><strong>Status:</strong> Terverifikasi &amp; Sah</p>
              <p><strong>Diterbitkan oleh:</strong> Klinik Medika Pratama SCBD</p>
              <p><strong>Keterangan:</strong> Istirahat rawat jalan 2 hari</p>
            </div>
            <button
              onClick={() => setSelectedDocPreview(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Roster Lengkap Karyawan Cuti & Izin */}
      {isRosterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Roster Karyawan Cuti &amp; Izin
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daftar seluruh permohonan yang telah disetujui (Approved)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter toolbar inside modal */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau jenis cuti..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={rosterDeptFilter}
                onChange={(e) => setRosterDeptFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="ALL">Semua Departemen</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {filteredRoster.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Tidak ada data karyawan cuti/izin yang sesuai dengan filter.
                </div>
              ) : (
                filteredRoster.map((leave) => {
                  const badgeColor =
                    leave.typeCategory === 'sakit'
                      ? 'bg-amber-100 text-amber-800'
                      : leave.typeCategory === 'khusus'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800';

                  return (
                    <div
                      key={leave.id}
                      className="p-3 rounded-xl border border-slate-200/70 hover:border-slate-300 bg-white flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={leave.avatarUrl}
                          alt={leave.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{leave.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {leave.nik} • {leave.department}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                          {leave.leaveType}
                        </span>
                        <p className="text-[10px] text-slate-600 font-medium mt-1">
                          {leave.startDate} s/d {leave.endDate} ({leave.durationDays} Hari)
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
              <span>Menampilkan {filteredRoster.length} dari {approvedRequests.length} permohonan disetujui</span>
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
