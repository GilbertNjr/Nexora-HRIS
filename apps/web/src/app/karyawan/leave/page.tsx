'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { useApprovalsRealtime } from '@/hooks/useApprovalsRealtime';
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
  Plus,
  Copy,
  CheckCheck,
  RotateCw,
  HeartPulse,
  MessageSquareQuote,
  Zap,
  PanelLeft,
  PanelLeftClose,
  Menu,
  ChevronDown,
  ChevronUp,
  Eye,
  Table2,
  LayoutGrid,
} from 'lucide-react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

interface LeaveRequestItem {
  id: string;
  refNo: string;
  type: string;
  title: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  handover: string;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusBadge: string;
  submittedAt: string;
  completedAt?: string;
  documentUrl?: string;
  documentName?: string;
  steps: {
    title: string;
    person: string;
    time?: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED';
  }[];
}

// Historical default leave records (Starts empty for real-time ESS behavior)
const defaultHistoricalLeaves: LeaveRequestItem[] = [];

function mapApprovalToEssItem(item: any): LeaveRequestItem {
  const isApproved = item.status === 'APPROVED';
  const isRejected = item.status === 'REJECTED';
  const isPending = !isApproved && !isRejected;

  const refNo = item.refNo || `LV-${new Date().getFullYear()}-${String(item.id).slice(-4).toUpperCase()}`;
  const leaveType = item.leaveType || item.highlightType || 'Cuti Tahunan';
  const title = item.title || `${leaveType}: Permohonan Pribadi`;
  const durationDays = item.durationDays || 1;
  const submittedAt = item.submittedDate || 'Hari ini';

  return {
    id: item.id,
    refNo,
    type: leaveType,
    title,
    startDate: item.startDate || 'Hari ini',
    endDate: item.endDate || 'Hari ini',
    durationDays,
    handover: item.handover || 'Nadia Wijaya (Handover)',
    notes: item.reason || item.detail || 'Pengajuan permohonan mandiri via ESS.',
    status: isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING',
    statusBadge: isApproved ? 'Disetujui HR & Atasan' : isRejected ? 'Ditolak oleh HRD' : 'Menunggu Verifikasi HRD',
    submittedAt,
    completedAt: isApproved ? 'Hari ini, Selesai' : isRejected ? 'Hari ini, Ditolak' : undefined,
    documentName: item.documentName || item.attachmentName,
    documentUrl: item.documentUrl || '#',
    steps: [
      {
        title: 'Pengajuan Mandiri',
        person: item.name || 'Rian Pratama',
        time: submittedAt,
        status: 'COMPLETED',
      },
      {
        title: 'Atasan Langsung',
        person: 'Arya Wibowo (VP Eng)',
        time: 'Terverifikasi',
        status: 'COMPLETED',
      },
      {
        title: 'HR Operations',
        person: 'Dewi Lestari, S.Psi',
        time: isApproved ? 'Disetujui HRD' : isRejected ? 'Ditolak HRD' : 'Menunggu Verifikasi HRD',
        status: isApproved ? 'COMPLETED' : isRejected ? 'REJECTED' : isPending ? 'IN_PROGRESS' : 'PENDING',
      },
    ],
  };
}

export default function EssLeaveOverhaulPage() {
  const { user: currentUser } = useCurrentUser();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileOpen,
    openMobile,
    closeMobile,
  } = useSidebarCollapse();
  // Filter tabs: all, pending, approved
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRowExpand = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);
  const [isPkbModalOpen, setIsPkbModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time synchronization states
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Baru saja');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [todayDateString, setTodayDateString] = useState<string>('');

  // Form State
  const [formType, setFormType] = useState('Cuti Tahunan');
  const [formTitle, setFormTitle] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formHandover, setFormHandover] = useState('Nadia Wijaya');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leave Balances
  const [balances, setBalances] = useState({
    annualTotal: 12,
    annualUsed: 0,
    annualRemaining: 12,
    jointHoliday: 2,
    sickUsed: 1,
    pendingCount: 0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyRef = (refNo: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(refNo);
      setCopiedRef(refNo);
      showToast(`✓ No. Referensi ${refNo} berhasil disalin ke clipboard.`);
      setTimeout(() => setCopiedRef(null), 2500);
    }
  };

  // Leave Requests state
  const [requests, setRequests] = useState<LeaveRequestItem[]>(defaultHistoricalLeaves);

  // Set real formatted Indonesian date
  useEffect(() => {
    const now = new Date();
    try {
      const formatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
      setTodayDateString(formatted);
    } catch {
      setTodayDateString('Hari ini');
    }
  }, []);

  // Fetch live approvals & live attendance from API and sync with employee view
  const fetchLiveLeaveData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const [approvalsRes, attendanceRes] = await Promise.all([
        fetch('/api/v1/approvals?all=true'),
        fetch('/api/v1/attendance'),
      ]);

      let backendAllLeaves: any[] = [];
      if (approvalsRes.ok) {
        const json = await approvalsRes.json();
        if (Array.isArray(json.data)) {
          backendAllLeaves = json.data;
          const myNik = (currentUser?.employeeNumber || 'NX-2021008').toLowerCase();
          const myName = (currentUser?.fullName || 'Rian Pratama').toLowerCase();

          // Filter leave requests specifically for this logged-in employee
          const myLeaves = json.data
            .filter((item: any) => {
              if (item.type && item.type !== 'cuti' && !item.leaveType) return false;
              const itemNik = (item.nik || '').toLowerCase();
              const itemName = (item.name || '').toLowerCase();
              const isMine =
                itemNik === myNik ||
                (itemName && myName && itemName.includes(myName.split(' ')[0]));
              return isMine;
            })
            .map(mapApprovalToEssItem);

          setRequests((prev) => {
            const myBackendIds = new Set(myLeaves.map((b: LeaveRequestItem) => b.id));
            const remainingHist = defaultHistoricalLeaves.filter((h) => !myBackendIds.has(h.id));
            return [...myLeaves, ...remainingHist];
          });
        }
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSyncedAt(timeStr);
      if (isManual) {
        showToast('✓ Data permohonan cuti berhasil disinkronkan secara real-time.');
      }
    } catch {
      // ignore
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [currentUser?.employeeNumber, currentUser?.fullName]);

  // Multi-device real-time SSE stream hook for ESS
  useApprovalsRealtime({
    playAudioAlert: true,
    onLeaveSubmitted: (newItem) => {
      if (newItem.type === 'lembur' && !newItem.leaveType) return;
      const myNik = (currentUser?.employeeNumber || 'NX-2021008').toLowerCase();
      const myName = (currentUser?.fullName || 'Rian Pratama').toLowerCase();
      const isMine =
        (newItem.nik && newItem.nik.toLowerCase() === myNik) ||
        (newItem.name && newItem.name.toLowerCase().includes(myName));

      if (isMine) {
        const mapped = mapApprovalToEssItem(newItem);
        setRequests((prev) => [mapped, ...prev.filter((r) => r.id !== mapped.id)]);
        setRecentlyUpdatedId(mapped.id);
        setTimeout(() => setRecentlyUpdatedId(null), 4000);
        showToast(`✓ Pengajuan ${mapped.type} (${mapped.refNo}) terkirim & menunggu persetujuan.`);
      } else {
        // Refresh team attendance in case teammate submitted leave
        fetchLiveLeaveData();
      }
      const now = new Date();
      setLastSyncedAt(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    },
    onLeaveActioned: ({ id, status }) => {
      if ((status as string) === 'CANCELLED') {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        return;
      }
      const isApproved = status === 'APPROVED';
      const isRejected = status === 'REJECTED';
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return {
              ...r,
              status: isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING',
              statusBadge: isApproved ? 'Disetujui HR & Atasan' : isRejected ? 'Ditolak oleh HRD' : 'Menunggu Verifikasi HRD',
              completedAt: isApproved ? 'Hari ini, Selesai' : isRejected ? 'Hari ini, Ditolak' : undefined,
              steps: [
                r.steps[0] || {
                  title: 'Pengajuan Mandiri',
                  person: currentUser.fullName,
                  time: r.submittedAt,
                  status: 'COMPLETED',
                },
                r.steps[1] || {
                  title: 'Atasan Langsung',
                  person: 'Arya Wibowo (VP Eng)',
                  time: 'Terverifikasi',
                  status: 'COMPLETED',
                },
                {
                  title: 'HR Operations',
                  person: 'Dewi Lestari, S.Psi',
                  time: isApproved ? 'Disetujui HRD' : isRejected ? 'Ditolak HRD' : 'Menunggu Verifikasi',
                  status: isApproved ? 'COMPLETED' : isRejected ? 'REJECTED' : 'IN_PROGRESS',
                },
              ],
            };
          }
          return r;
        })
      );

      setRecentlyUpdatedId(id);
      setTimeout(() => setRecentlyUpdatedId(null), 4500);
      const now = new Date();
      setLastSyncedAt(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');

      showToast(
        isApproved
          ? '🎉 Selamat! Pengajuan Cuti Anda telah DISETUJUI oleh HR Admin!'
          : isRejected
            ? 'ℹ️ Pengajuan Cuti Anda telah DITOLAK oleh HR Admin.'
            : 'Status pengajuan cuti Anda telah diperbarui.'
      );
      fetchLiveLeaveData();
    },
    onRefresh: () => {
      fetchLiveLeaveData();
    },
  });

  // Cross-tab real-time synchronization via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'APPROVAL_STATUS_CHANGED' && data.id) {
          const { id, status } = data;
          if (status === 'CANCELLED') {
            setRequests((prev) => prev.filter((r) => r.id !== id));
            return;
          }
          const isApproved = status === 'APPROVED';
          const isRejected = status === 'REJECTED';

          setRequests((prev) =>
            prev.map((r) => {
              if (r.id === id) {
                return {
                  ...r,
                  status: isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING',
                  statusBadge: isApproved ? 'Disetujui HR & Atasan' : isRejected ? 'Ditolak oleh HRD' : 'Menunggu Verifikasi HRD',
                  completedAt: isApproved ? 'Hari ini, Selesai' : isRejected ? 'Hari ini, Ditolak' : undefined,
                  steps: [
                    r.steps[0] || { title: 'Pengajuan Mandiri', person: currentUser.fullName, time: r.submittedAt, status: 'COMPLETED' },
                    r.steps[1] || { title: 'Atasan Langsung', person: 'Arya Wibowo (VP Eng)', time: 'Terverifikasi', status: 'COMPLETED' },
                    {
                      title: 'HR Operations',
                      person: 'Dewi Lestari, S.Psi',
                      time: isApproved ? 'Disetujui HRD' : isRejected ? 'Ditolak HRD' : 'Menunggu Verifikasi',
                      status: isApproved ? 'COMPLETED' : isRejected ? 'REJECTED' : 'IN_PROGRESS',
                    },
                  ],
                };
              }
              return r;
            })
          );
        }

        if (data.type === 'NEW_APPROVAL_REQUEST' && data.request) {
          const req = data.request;
          const myNik = (currentUser?.employeeNumber || 'NX-2021008').toLowerCase();
          const myName = (currentUser?.fullName || 'Rian Pratama').toLowerCase();
          const isMine =
            (req.nik && req.nik.toLowerCase() === myNik) ||
            (req.name && req.name.toLowerCase().includes(myName));

          if (isMine) {
            setRequests((prev) => [req, ...prev.filter((r) => r.id !== req.id)]);
          }
        }

        if (data.type === 'ATTENDANCE_LOGGED' || data.type === 'ATTENDANCE_RESET') {
          fetchLiveLeaveData();
        }
      };
    } catch { }

    return () => {
      channel?.close();
    };
  }, [currentUser.employeeNumber, currentUser.fullName, fetchLiveLeaveData]);

  // Load live approvals on mount
  useEffect(() => {
    fetchLiveLeaveData();
  }, [fetchLiveLeaveData]);

  // Recalculate balances dynamically based on requests
  useEffect(() => {
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const approvedAnnual = requests
      .filter((r) => r.status === 'APPROVED' && (r.type.includes('Tahunan') || r.title.includes('Tahunan')))
      .reduce((sum, r) => sum + (r.durationDays || 0), 0);
    const approvedSick = requests
      .filter((r) => r.status === 'APPROVED' && (r.type.includes('Sakit') || r.title.includes('Sakit')))
      .reduce((sum, r) => sum + (r.durationDays || 0), 0);
    const approvedJoint = requests
      .filter((r) => r.status === 'APPROVED' && (r.type.includes('Bersama') || r.title.includes('Bersama')))
      .reduce((sum, r) => sum + (r.durationDays || 0), 0);

    const annualTotal = 12;
    const annualRemaining = Math.max(0, annualTotal - approvedAnnual);

    setBalances({
      annualTotal,
      annualUsed: approvedAnnual,
      annualRemaining,
      jointHoliday: Math.max(2, approvedJoint),
      sickUsed: Math.max(1, approvedSick),
      pendingCount: pending,
    });
  }, [requests]);

  // Cancel Pending Request
  const handleCancelPending = async (id: string) => {
    const target = requests.find((r) => r.id === id);
    if (!target) return;

    if (window.confirm(`Yakin ingin membatalkan pengajuan "${target.title}"? Kuota cuti akan dikembalikan.`)) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast(`✓ Pengajuan ${target.refNo} berhasil dibatalkan. Kuota ${target.durationDays} hari telah dikembalikan.`);

      // Send DELETE request to API
      try {
        await fetch(`/api/v1/approvals?id=${id}`, {
          method: 'DELETE',
        });
      } catch { }

      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'APPROVAL_STATUS_CHANGED', id, status: 'CANCELLED' });
        ch.close();
      } catch { }
    }
  };

  // Submit New Leave Request
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStartDate || !formEndDate) {
      showToast('Harap tentukan tanggal mulai dan tanggal selesai.');
      return;
    }

    try {
      setIsSubmitting(true);
      const start = new Date(formStartDate);
      const end = new Date(formEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (formType === 'Cuti Tahunan' && diffDays > balances.annualRemaining) {
        showToast(`Permohonan ${diffDays} hari melebihi sisa saldo cuti (${balances.annualRemaining} hari).`);
        setIsSubmitting(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      const newRefNo = `LV-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
      const title = formTitle || `${formType}: Permohonan Pribadi`;

      const newReq: LeaveRequestItem = {
        id: `req-${Date.now()}`,
        refNo: newRefNo,
        type: formType,
        title,
        startDate: formStartDate,
        endDate: formEndDate,
        durationDays: diffDays,
        handover: formHandover || 'Nadia Wijaya',
        notes: formNotes || 'Pengajuan permohonan mandiri via ESS.',
        status: 'PENDING',
        statusBadge: 'Menunggu Verifikasi HRD',
        submittedAt: 'Hari ini, Baru saja',
        steps: [
          {
            title: 'Pengajuan Mandiri',
            person: currentUser.fullName,
            time: 'Hari ini, Baru saja',
            status: 'COMPLETED',
          },
          {
            title: 'Atasan Langsung',
            person: 'Arya Wibowo (VP Eng)',
            time: 'Menunggu Verifikasi',
            status: 'IN_PROGRESS',
          },
          {
            title: 'HR Operations',
            person: 'Dewi Lestari, S.Psi',
            time: 'Tahap Akhir',
            status: 'PENDING',
          },
        ],
      };

      setRequests((prev) => [newReq, ...prev]);

      // Broadcast and notify HR Admin
      const remainingAfter = Math.max(0, balances.annualRemaining - (formType === 'Cuti Tahunan' ? diffDays : 0));
      await fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newReq.id,
          refNo: newReq.refNo,
          name: currentUser.fullName,
          nik: currentUser.employeeNumber,
          role: currentUser.designation,
          department: currentUser.department,
          avatarUrl: currentUser.avatarUrl,
          type: 'cuti',
          leaveType: formType,
          typeCategory: formType.toLowerCase().includes('sakit') ? 'sakit' : 'tahunan',
          title: newReq.title,
          highlightType: newReq.type,
          detail: `${diffDays} Hari (${formStartDate} s/d ${formEndDate})`,
          startDate: formStartDate,
          endDate: formEndDate,
          durationDays: diffDays,
          remainingQuota: remainingAfter,
          totalQuota: 12,
          reason: newReq.notes || newReq.title || 'Keperluan Pribadi',
          quotaMeta: `Sisa Kuota: ${remainingAfter} Hari`,
        }),
      }).catch(() => { });

      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'NEW_APPROVAL_REQUEST', request: newReq });
        ch.close();
      } catch { }

      setIsApplyModalOpen(false);
      setFormTitle('');
      setFormStartDate('');
      setFormEndDate('');
      setFormNotes('');
      showToast('✓ Permohonan Cuti/Izin berhasil diajukan dan terhubung ke HR Admin secara real-time!');
    } catch {
      showToast('Gagal mengajukan cuti.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Filter items
  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'pending') return r.status === 'PENDING';
    if (activeFilter === 'approved') return r.status === 'APPROVED';
    if (searchQuery.trim()) {
      return (
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR with Collapse/Expand & Mobile Drawer */}
      <EmployeeSidebar
        activeMenu="leave"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
        onOpenPkbModal={() => setIsPkbModalOpen(true)}
        onShowToast={showToast}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR matching screenshot */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Left: Mobile Drawer Button, Desktop Toggle Button & Search Input Box */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
            {/* Mobile Menu Drawer Toggle Button */}
            <button
              type="button"
              onClick={openMobile}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
              title="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5 text-slate-600" />
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
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{todayDateString || 'Hari ini'}</span>
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

        {/* PAGE CONTENT CONTAINER (Generous padding-bottom pb-28 to avoid ANY clipping!) */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto pb-28">
          {/* HEADER SECTION matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="space-y-1">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Link href="/karyawan" className="hover:text-blue-600 transition-colors">
                  Beranda Saya
                </Link>
                <span>&gt;</span>
                <span className="text-slate-800 font-bold">Cuti &amp; Izin Saya</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Cuti &amp; Izin Saya
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                Pantau kuota saldo cuti tahunan, ajukan permohonan izin baru, dan lacak status persetujuan atasan secara terpadu.
              </p>
            </div>

            {/* Top Right Action Buttons matching screenshot */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Unduh Riwayat (.pdf) */}
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Unduh Riwayat (.pdf)</span>
              </button>

              {/* + Ajukan Cuti/Izin Baru (Solid Blue) */}
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Ajukan Cuti/Izin Baru</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Saldo Cuti Tahunan */}
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
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {balances.annualRemaining}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">
                  / {balances.annualTotal} Hari Kuota
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${(balances.annualRemaining / balances.annualTotal) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Terpakai {balances.annualUsed} hari</span>
                <span className="text-rose-600 font-bold">Hangus 31 Des {new Date().getFullYear()}</span>
              </div>
            </div>

            {/* Card 2: Cuti Bersama */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  CUTI BERSAMA {new Date().getFullYear()}
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {balances.jointHoliday}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">Hari Terjadwal</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full" />

              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">Kalender SKB 3 Menteri (Idul Fitri 1446 H)</span>
              </div>
            </div>

            {/* Card 3: Izin Sakit Terpakai */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  IZIN SAKIT TERPAKAI
                </span>
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {balances.sickUsed}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">Hari Terverifikasi</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full" />

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Surat Dokter Klinik Mitra divalidasi</span>
              </div>
            </div>

            {/* Card 4: Sedang Berjalan */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  SEDANG BERJALAN
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {balances.pendingCount}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">Permohonan Aktif</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full" />

              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold truncate">
                <span className={`w-1.5 h-1.5 rounded-full ${balances.pendingCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'} flex-shrink-0`} />
                <span className="truncate">
                  {balances.pendingCount > 0 ? 'Menunggu Persetujuan Atasan Langsung' : 'Semua Permohonan Selesai / Terverifikasi'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: FILTER PILLS & SEARCH BAR matching screenshot */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span>Semua Pengajuan</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeFilter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                    }`}
                >
                  {requests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === 'pending'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span>Menunggu Persetujuan</span>
                {balances.pendingCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeFilter === 'pending'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-800'
                      }`}
                  >
                    {balances.pendingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('approved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === 'approved'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <span>Disetujui</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeFilter === 'approved'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                    }`}
                >
                  {requests.filter((r) => r.status === 'APPROVED').length}
                </span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pengajuan / catatan..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* SECTION 3: TABEL PENGAJUAN & RIWAYAT CUTI / IZIN (FULL WIDTH) */}
          <div className="space-y-4 w-full">
            {/* REAL-TIME LIVE STATUS & VIEW CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Sinkronisasi Real-Time ESS Terhubung</span>
                </span>
                <span className="hidden sm:inline-block text-slate-300">•</span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
                  Pembaruan persetujuan dari HR &amp; Atasan diterima seketika
                </span>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                {/* View Mode Switcher: Tabel (Default) vs Kartu */}
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Tampilan Tabel (Lebih ringkas & enak dilihat)"
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>Tabel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Tampilan Kartu Stepper"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kartu</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  Sinkron: <strong className="text-slate-600 font-mono">{lastSyncedAt}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => fetchLiveLeaveData(true)}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                  title="Perbarui sinkronisasi sekarang"
                >
                  <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                  <span>{isRefreshing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
                </button>
              </div>
            </div>

              {/* MAIN CONTENT: TABLE VIEW (DEFAULT) OR CARD VIEW */}
            {viewMode === 'table' ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4 w-44">NO. REF &amp; TANGGAL</th>
                        <th className="py-3.5 px-4 min-w-[200px]">JENIS &amp; KETERANGAN</th>
                        <th className="py-3.5 px-4 w-44">PERIODE</th>
                        <th className="py-3.5 px-3 w-28 text-center">DURASI</th>
                        <th className="py-3.5 px-4 w-44">PENGGANTI (HANDOVER)</th>
                        <th className="py-3.5 px-4 w-48">STATUS &amp; ALUR</th>
                        <th className="py-3.5 px-4 w-36 text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                              <CalendarDays className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">Tidak ada pengajuan ditemukan</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              Tidak ada riwayat cuti atau izin yang sesuai dengan filter yang dipilih saat ini.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((item) => {
                          const isExpanded = expandedRows.includes(item.id);
                          const isApproved = item.status === 'APPROVED';
                          const isPending = item.status === 'PENDING';
                          const isRejected = item.status === 'REJECTED';

                          return (
                            <React.Fragment key={item.id}>
                              <tr
                                className={`hover:bg-slate-50/90 transition-colors group cursor-pointer ${
                                  isExpanded ? 'bg-blue-50/20' : ''
                                } ${recentlyUpdatedId === item.id ? 'bg-emerald-50/30' : ''}`}
                                onClick={() => toggleRowExpand(item.id)}
                              >
                                {/* Column 1: Ref No & Submitted Date */}
                                <td className="py-3.5 px-4 align-top">
                                  <div className="space-y-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyRef(item.refNo);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold transition-colors group/ref"
                                      title="Klik untuk salin No. Referensi"
                                    >
                                      <span>{item.refNo}</span>
                                      {copiedRef === item.refNo ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-slate-400 group-hover/ref:text-slate-700" />
                                      )}
                                    </button>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Clock3 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                      <span>{item.submittedAt}</span>
                                    </div>
                                  </div>
                                </td>

                                {/* Column 2: Leave Type & Title/Notes */}
                                <td className="py-3.5 px-4 align-top">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                          item.type.includes('Sakit') || item.title.includes('Sakit')
                                            ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                            : item.type.includes('Bersama')
                                            ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                                            : 'bg-blue-50 text-blue-700 border-blue-200/80'
                                        }`}
                                      >
                                        {item.type.includes('Sakit') || item.title.includes('Sakit') ? (
                                          <HeartPulse className="w-2.5 h-2.5 text-rose-500" />
                                        ) : item.type.includes('Bersama') ? (
                                          <Building2 className="w-2.5 h-2.5 text-purple-500" />
                                        ) : (
                                          <CalendarDays className="w-2.5 h-2.5 text-blue-500" />
                                        )}
                                        <span>{item.type}</span>
                                      </span>
                                    </div>
                                    <p className="font-bold text-slate-800 text-xs leading-tight">
                                      {item.title}
                                    </p>
                                    {item.notes && (
                                      <p className="text-[11px] text-slate-500 italic line-clamp-1">
                                        &ldquo;{item.notes}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                </td>

                                {/* Column 3: Periode */}
                                <td className="py-3.5 px-4 align-top">
                                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs whitespace-nowrap">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                    <span>{item.startDate}</span>
                                    <span className="text-slate-400">s/d</span>
                                    <span>{item.endDate}</span>
                                  </div>
                                </td>

                                {/* Column 4: Durasi */}
                                <td className="py-3.5 px-3 text-center align-top">
                                  <span className="inline-flex px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200/70 text-blue-800 text-[11px] font-bold whitespace-nowrap">
                                    {item.durationDays} Hari Kerja
                                  </span>
                                </td>

                                {/* Column 5: Pengganti (Handover) */}
                                <td className="py-3.5 px-4 align-top">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                      <UserCheck className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                                      {item.handover}
                                    </span>
                                  </div>
                                </td>

                                {/* Column 6: Status & Stepper Summary */}
                                <td className="py-3.5 px-4 align-top">
                                  <div className="space-y-1">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                        isPending
                                          ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                                          : isRejected
                                          ? 'bg-rose-50 text-rose-800 border border-rose-200/80'
                                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                      }`}
                                    >
                                      {isPending ? (
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                        </span>
                                      ) : isRejected ? (
                                        <X className="w-3 h-3 text-rose-600" />
                                      ) : (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      )}
                                      <span>{item.statusBadge}</span>
                                    </span>

                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {isApproved ? (
                                        <span className="text-emerald-700 font-bold">✓ 3 dari 3 Tahap Disetujui</span>
                                      ) : isPending ? (
                                        <span className="text-amber-700 font-bold">⏳ Tahap 3: Review HRD</span>
                                      ) : (
                                        <span className="text-rose-700 font-bold">✕ Ditolak HRD</span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Column 7: Actions */}
                                <td className="py-3.5 px-4 text-right align-top">
                                  <div
                                    className="flex items-center justify-end gap-1.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Document Attachment Button if present */}
                                    {item.documentName && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewDocName(item.documentName || null)}
                                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                                        title={`Lampiran: ${item.documentName}`}
                                      >
                                        <Paperclip className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Cancel pending button if PENDING */}
                                    {isPending && (
                                      <button
                                        type="button"
                                        onClick={() => handleCancelPending(item.id)}
                                        className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 text-[11px] font-bold transition-all cursor-pointer"
                                        title="Batalkan pengajuan ini"
                                      >
                                        Batalkan
                                      </button>
                                    )}

                                    {/* Toggle Expand Row */}
                                    <button
                                      type="button"
                                      onClick={() => toggleRowExpand(item.id)}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        isExpanded
                                          ? 'bg-blue-600 text-white shadow-xs'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                      }`}
                                      title="Tampilkan / Sembunyikan Alur Verifikasi Bertingkat"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Alur</span>
                                      <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                          isExpanded ? 'rotate-180' : ''
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* EXPANDABLE ACCORDION ROW: Alur Verifikasi Bertingkat 3-Tier & Catatan */}
                              {isExpanded && (
                                <tr className="bg-gradient-to-r from-blue-50/40 via-slate-50/50 to-blue-50/20 border-b border-slate-200">
                                  <td colSpan={7} className="p-4 sm:p-5">
                                    <div className="space-y-4">
                                      {/* Note Box */}
                                      <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 space-y-1">
                                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                          <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400" />
                                          <span>Catatan Lengkap Pemohon</span>
                                        </div>
                                        <p className="text-xs text-slate-700 italic pl-1 border-l-2 border-blue-400">
                                          &ldquo;{item.notes}&rdquo;
                                        </p>
                                      </div>

                                      {/* 3-Tier Pipeline Stepper */}
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-blue-600" />
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                                              Alur Verifikasi Bertingkat (3-Tier Approval Pipeline)
                                            </span>
                                          </div>
                                          <span className="text-[10px] text-slate-400 font-medium">
                                            {item.completedAt ? `Status akhir: ${item.completedAt}` : 'Menunggu tinjauan manajemen'}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                          {item.steps.map((st, sIdx) => {
                                            const stepDone = st.status === 'COMPLETED';
                                            const stepProgress = st.status === 'IN_PROGRESS';
                                            const stepRejected = st.status === 'REJECTED';

                                            return (
                                              <div
                                                key={sIdx}
                                                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                                                  stepDone
                                                    ? 'bg-white border-emerald-200 shadow-2xs'
                                                    : stepProgress
                                                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                                                    : stepRejected
                                                    ? 'bg-rose-50/60 border-rose-200 shadow-2xs'
                                                    : 'bg-white/80 border-slate-200 text-slate-500'
                                                }`}
                                              >
                                                <div className="flex items-start gap-2.5">
                                                  <div
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                                      stepDone
                                                        ? 'bg-emerald-600 text-white'
                                                        : stepProgress
                                                        ? 'bg-amber-500 text-white animate-pulse'
                                                        : stepRejected
                                                        ? 'bg-rose-600 text-white'
                                                        : 'bg-slate-200 text-slate-500'
                                                    }`}
                                                  >
                                                    {stepDone ? (
                                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    ) : stepProgress ? (
                                                      <Clock3 className="w-3.5 h-3.5" />
                                                    ) : stepRejected ? (
                                                      <X className="w-3.5 h-3.5 stroke-[3]" />
                                                    ) : (
                                                      <UserCheck className="w-3.5 h-3.5" />
                                                    )}
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                      <p className="text-xs font-bold text-slate-900 truncate">
                                                        {st.title}
                                                      </p>
                                                      <span
                                                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                          stepDone
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : stepProgress
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : stepRejected
                                                            ? 'bg-rose-100 text-rose-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                      >
                                                        {stepDone ? 'Selesai' : stepProgress ? 'Proses' : stepRejected ? 'Ditolak' : 'Antrean'}
                                                      </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 font-semibold truncate mt-0.5">
                                                      {st.person}
                                                    </p>
                                                  </div>
                                                </div>

                                                {st.time && (
                                                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                                    <span className="text-slate-400">Waktu:</span>
                                                    <span
                                                      className={`font-semibold ${
                                                        stepDone
                                                          ? 'text-emerald-700'
                                                          : stepProgress
                                                          ? 'text-amber-700 font-bold'
                                                          : stepRejected
                                                          ? 'text-rose-700'
                                                          : 'text-slate-400'
                                                      }`}
                                                    >
                                                      {st.time}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Summary */}
                <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    Menampilkan <strong className="text-slate-800">{filteredRequests.length}</strong> pengajuan cuti &amp; izin
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Klik baris atau tombol <strong>Alur</strong> untuk melihat rincian verifikasi 3-tier
                  </span>
                </div>
              </div>
            ) : (
              /* ALTERNATIVE VIEW: CARD VIEW */
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-slate-200/90 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Tidak ada pengajuan ditemukan</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Tidak ada riwayat cuti atau izin yang sesuai dengan filter yang dipilih saat ini.
                  </p>
                </div>
              ) : (
                filteredRequests.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 relative overflow-hidden space-y-5 ${recentlyUpdatedId === item.id
                      ? 'ring-2 ring-emerald-400/80 shadow-lg shadow-emerald-500/10'
                      : 'shadow-2xs hover:shadow-md'
                      } ${item.status === 'PENDING'
                        ? 'border-slate-200/90 hover:border-amber-300/80'
                        : item.status === 'REJECTED'
                          ? 'border-slate-200/90 hover:border-rose-300/80'
                          : 'border-slate-200/90 hover:border-emerald-300/80'
                      }`}
                  >
                    {/* Sleek Inner Status Accent Bar (Preserves rounded corners without glitching) */}
                    <div
                      className={`absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full transition-colors ${item.status === 'PENDING'
                        ? 'bg-amber-500'
                        : item.status === 'REJECTED'
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                        }`}
                    />

                    {/* Header Row: Badges & Right Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pl-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs transition-all ${item.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                            : item.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200/80'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                            }`}
                        >
                          {item.status === 'PENDING' ? (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                            </span>
                          ) : item.status === 'REJECTED' ? (
                            <X className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          )}
                          <span>{item.statusBadge}</span>
                        </span>

                        {/* Leave Type Pill */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${item.type.includes('Sakit') || item.title.includes('Sakit')
                            ? 'bg-rose-50/70 text-rose-700 border-rose-200/80'
                            : item.type.includes('Bersama')
                              ? 'bg-purple-50/70 text-purple-700 border-purple-200/80'
                              : 'bg-blue-50/70 text-blue-700 border-blue-200/80'
                            }`}
                        >
                          {item.type.includes('Sakit') || item.title.includes('Sakit') ? (
                            <HeartPulse className="w-3 h-3 text-rose-500" />
                          ) : item.type.includes('Bersama') ? (
                            <Building2 className="w-3 h-3 text-purple-500" />
                          ) : (
                            <CalendarDays className="w-3 h-3 text-blue-500" />
                          )}
                          <span>{item.type}</span>
                        </span>

                        {/* Reference No Pill with 1-Click Copy */}
                        <button
                          type="button"
                          onClick={() => handleCopyRef(item.refNo)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-colors group/ref"
                          title="Klik untuk salin No. Referensi"
                        >
                          <span className="text-slate-400 font-sans font-medium text-[11px]">Ref:</span>
                          <span>{item.refNo}</span>
                          {copiedRef === item.refNo ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 group-hover/ref:text-slate-700 transition-colors" />
                          )}
                        </button>
                      </div>

                      {/* Right Actions: Batalkan or Attachment */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {item.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleCancelPending(item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/80 transition-all shadow-2xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Batalkan Pengajuan</span>
                          </button>
                        )}

                        {item.documentName && (
                          <button
                            type="button"
                            onClick={() => setPreviewDocName(item.documentName || null)}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50/90 hover:bg-blue-100/90 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs group/doc"
                            title="Buka lampiran dokumen"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-blue-600 group-hover/doc:rotate-12 transition-transform" />
                            <span className="max-w-[200px] truncate">{item.documentName}</span>
                            <ExternalLink className="w-3 h-3 text-blue-400 group-hover/doc:text-blue-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timeline & SLA Row (Clean, perfectly aligned, no dangling lines) */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pl-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-400">Diajukan:</span>
                        <span className="font-semibold text-slate-700">{item.submittedAt}</span>
                      </div>

                      {item.completedAt && (
                        <>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-slate-400">Selesai:</span>
                            <span className="font-semibold text-emerald-700">{item.completedAt}</span>
                          </div>
                        </>
                      )}

                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        <span>Verifikasi Bertingkat 3-Tier</span>
                      </span>
                    </div>

                    {/* Title & Details */}
                    <div className="space-y-3 pl-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Periode & Durasi */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">
                            {item.startDate} – {item.endDate}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100/90 text-blue-800 text-[11px] font-bold">
                            {item.durationDays} Hari Kerja
                          </span>
                        </div>

                        {/* Pengganti Tugas */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span className="text-slate-400">Pengganti Tugas:</span>
                          <strong className="text-slate-800 font-bold">{item.handover}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Pemohon Box with Modern Quote Styling */}
                    <div className="ml-2 relative rounded-2xl bg-gradient-to-r from-slate-50 via-slate-50/70 to-white border border-slate-200/80 p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-slate-400" />
                        <span>Catatan Pemohon</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic pl-1 border-l-2 border-slate-300">
                        "{item.notes}"
                      </p>
                    </div>

                    {/* ALUR VERIFIKASI BERTINGKAT (Horizontal Stepper Pipeline) */}
                    <div className="space-y-3 pt-1 pl-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                            <Zap className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                            ALUR VERIFIKASI BERTINGKAT
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.status === 'APPROVED' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>3 dari 3 Tahap Disetujui</span>
                            </span>
                          ) : item.status === 'PENDING' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Menunggu Review HRD</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
                              <X className="w-3 h-3 text-rose-600" />
                              <span>Ditolak oleh HRD</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Responsive 3-Stage Pipeline */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {item.steps.map((st, idx) => {
                          const isCompleted = st.status === 'COMPLETED';
                          const isInProgress = st.status === 'IN_PROGRESS';
                          const isRejected = st.status === 'REJECTED';

                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between space-y-3 ${isCompleted
                                ? 'bg-gradient-to-br from-emerald-50/40 to-teal-50/20 border-emerald-200/90 shadow-2xs'
                                : isInProgress
                                  ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                                  : isRejected
                                    ? 'bg-rose-50/50 border-rose-200 text-rose-900 shadow-2xs'
                                    : 'bg-slate-50/60 border-slate-200/70 text-slate-500'
                                }`}
                            >
                              {/* Top Step Header */}
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all shadow-2xs ${isCompleted
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                    : isInProgress
                                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                                      : isRejected
                                        ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white'
                                        : 'bg-slate-200 text-slate-400'
                                    }`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : isInProgress ? (
                                    <Clock3 className="w-4 h-4 animate-spin-slow" />
                                  ) : isRejected ? (
                                    <X className="w-4 h-4 stroke-[3]" />
                                  ) : (
                                    <UserCheck className="w-4 h-4" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs font-extrabold text-slate-900 truncate">
                                      {st.title}
                                    </p>
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isCompleted
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isInProgress
                                          ? 'bg-amber-100 text-amber-800'
                                          : isRejected
                                            ? 'bg-rose-100 text-rose-800'
                                            : 'bg-slate-200/80 text-slate-600'
                                        }`}
                                    >
                                      {isCompleted
                                        ? 'Selesai'
                                        : isInProgress
                                          ? 'Proses'
                                          : isRejected
                                            ? 'Ditolak'
                                            : 'Antrean'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-semibold truncate mt-0.5">
                                    {st.person}
                                  </p>
                                </div>
                              </div>

                              {/* Bottom Step Time Footer */}
                              {st.time && (
                                <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px]">
                                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>Waktu:</span>
                                  </span>
                                  <span
                                    className={`font-semibold ${isCompleted
                                      ? 'text-emerald-700'
                                      : isInProgress
                                        ? 'text-amber-700 font-bold'
                                        : isRejected
                                          ? 'text-rose-700'
                                          : 'text-slate-400'
                                      }`}
                                  >
                                    {st.time}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}

              </div>
            )}          </div>
        </main>
      </div>

      {/* MODAL 1: FORM PENGAJUAN CUTI / IZIN BARU */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Ajukan Permohonan Cuti / Izin Baru
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sisa Hak Cuti Tahunan: {balances.annualRemaining} Hari Aktif
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Permohonan</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Potong Saldo 12 Hari)</option>
                  <option value="Izin Sakit">Izin Sakit (Lampiran Surat Dokter)</option>
                  <option value="Cuti Menikah">Cuti Menikah (3 Hari Penuh)</option>
                  <option value="Cuti Duka Cita">Cuti Duka Cita (2 Hari Keluarga Inti)</option>
                  <option value="Izin Urusan Pribadi">Izin Urusan Pribadi Mendadak</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul / Keperluan Cuti</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Cuti Tahunan: Mudik Lebaran Idul Fitri"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
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
                  required
                  value={formHandover}
                  onChange={(e) => setFormHandover(e.target.value)}
                  placeholder="Nama rekan kerja handover..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / Rencana Pekerjaan Selama Cuti
                </label>
                <textarea
                  rows={3}
                  required
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Jelaskan detail rencana izin, handover tugas, dan kontak darurat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirimkan...</span>
                    </>
                  ) : (
                    <span>Kirim Pengajuan Cuti</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UNDUH RIWAYAT CUTI (.PDF) */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Unduh Riwayat Cuti &amp; Izin
                  </h3>
                  <p className="text-[11px] text-slate-400">Format Resmi HRD Ber-QR Code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
              <p className="font-bold text-slate-800">Ringkasan Dokumen:</p>
              <ul className="space-y-1 text-slate-600">
                <li>• Karyawan: <strong>{currentUser.fullName} ({currentUser.employeeNumber})</strong></li>
                <li>• Periode: <strong>Tahun Anggaran {new Date().getFullYear()}</strong></li>
                <li>• Total Kuota: <strong>{balances.annualTotal} Hari</strong> (Sisa: {balances.annualRemaining} Hari)</li>
                <li>• Riwayat Terlampir: <strong>{requests.length} Catatan Permohonan</strong></li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDownloadModalOpen(false);
                  showToast('✓ Laporan Riwayat Cuti (.pdf) berhasil diunduh!');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PREVIEW LAMPIRAN SURAT DOKTER */}
      {previewDocName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Lampiran Dokumen Resmi
                  </h3>
                  <p className="text-[11px] text-slate-400">{previewDocName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocName(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{previewDocName}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Surat Keterangan Istirahat Sakit • Klinik Mitra Sehat SCBD (Dr. Hendra Gunawan, Sp.PD)
                </p>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  ✓ Tervalidasi Resmi oleh Tim HR Operations Nexora
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewDocName(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DOKUMEN PKB LENGKAP */}
      {isPkbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  @
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Perjanjian Kerja Bersama (PKB) Nexora 2024-2026
                  </h3>
                  <p className="text-[11px] text-slate-400">Regulasi Resmi Hak Kepegawaian &amp; Cuti</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPkbModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 space-y-3">
              <p className="font-bold text-slate-900">Bab IV: Waktu Kerja, Istirahat, dan Cuti Karyawan</p>
              <p>
                1. Setiap karyawan yang telah bekerja terus-menerus selama 12 bulan berhak atas Cuti Tahunan sebanyak 12 (dua belas) hari kerja dengan tetap menerima upah penuh.
              </p>
              <p>
                2. Karyawan yang sakit berhak atas izin sakit berbayar dengan melampirkan surat keterangan dokter dari fasilitas kesehatan resmi.
              </p>
              <p>
                3. Cuti khusus diberikan untuk keperluan penting keluarga: pernikahan karyawan (3 hari), khitanan/baptis anak (2 hari), kematian keluarga inti (2 hari).
              </p>
              <p>
                4. Kuota cuti tahunan yang belum digunakan akan kedaluwarsa pada tanggal 31 Desember tahun berjalan kecuali terdapat persetujuan tertulis dari Direksi.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsPkbModalOpen(false);
                  showToast('✓ Salinan Dokumen PKB Lengkap (.pdf) berhasil diunduh!');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Salinan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
