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

interface SquadMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: 'WFO' | 'WFH' | 'SAKIT' | 'CUTI' | 'OFF';
  statusLabel: string;
  badgeClass: string;
  location?: string;
  checkInTime?: string;
  notes?: string;
}

const initialSquadMembers: SquadMember[] = [
  {
    id: 'squad-1',
    name: 'Nadia Wijaya',
    role: 'Senior Backend Go',
    initials: 'NW',
    status: 'WFO',
    statusLabel: 'WFO (Pusat)',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    location: 'SCBD Treasury Tower Lt. 32',
  },
  {
    id: 'squad-2',
    name: 'Dimas Surya',
    role: 'DevOps Specialist',
    initials: 'DS',
    status: 'WFH',
    statusLabel: 'WFH (Remote)',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    location: 'Remote Residence (Tangerang Selatan)',
  },
  {
    id: 'squad-3',
    name: 'Farhan Harahap',
    role: 'Database Admin',
    initials: 'FH',
    status: 'SAKIT',
    statusLabel: 'Sakit (1 Hari)',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    notes: 'Istirahat Surat Dokter Terverifikasi',
  },
  {
    id: 'squad-4',
    name: 'Raden Bagus Prakoso, S.Kom',
    role: 'Cloud Architect Lead',
    initials: 'RB',
    status: 'WFO',
    statusLabel: 'WFO (Pusat)',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    location: 'SCBD Treasury Tower Lt. 32',
  },
];

// Historical default leave records
const defaultHistoricalLeaves: LeaveRequestItem[] = [
  {
    id: 'hist-01',
    refNo: 'SK-2025-0019',
    type: 'Izin Sakit',
    title: 'Izin Sakit: Gejala ISPA & Demam',
    startDate: '14 Feb',
    endDate: '14 Feb 2025',
    durationDays: 1,
    handover: 'Handover Tiket Support',
    notes:
      'Mengalami demam tinggi dan radang tenggorokan setelah dinas luar. Dokter merekomendasikan istirahat penuh 1 hari.',
    status: 'APPROVED',
    statusBadge: 'Disetujui HR & Atasan',
    submittedAt: '14 Feb 2025',
    completedAt: '15 Feb 2025',
    documentUrl: '#',
    documentName: 'Surat_Dokter_Klinik_Mitra.pdf',
    steps: [
      {
        title: 'Pengajuan Mandiri',
        person: 'Rian Pratama',
        time: '14 Feb, 07:30 WIB',
        status: 'COMPLETED',
      },
      {
        title: 'Atasan Langsung',
        person: 'Arya Wibowo (VP Eng)',
        time: '14 Feb, 08:15 WIB',
        status: 'COMPLETED',
      },
      {
        title: 'HR Operations',
        person: 'Dewi Lestari, S.Psi',
        time: '15 Feb, 10:00 WIB',
        status: 'COMPLETED',
      },
    ],
  },
  {
    id: 'hist-02',
    refNo: 'LV-2025-0003',
    type: 'Cuti Bersama',
    title: 'Cuti Bersama Tahun Baru 2025',
    startDate: '02 Jan',
    endDate: '02 Jan 2025',
    durationDays: 1,
    handover: 'Sistem Terjadwal Otomatis',
    notes: 'Libur resmi cuti bersama nasional pergantian tahun kalender.',
    status: 'APPROVED',
    statusBadge: 'Otomatis Disetujui',
    submittedAt: '02 Jan 2025',
    completedAt: '02 Jan 2025',
    steps: [
      {
        title: 'Sistem Terjadwal',
        person: 'Master HRIS Nexora',
        time: '02 Jan, 00:00 WIB',
        status: 'COMPLETED',
      },
      {
        title: 'Atasan Langsung',
        person: 'Arya Wibowo (VP Eng)',
        time: '02 Jan, 00:00 WIB (Otomatis)',
        status: 'COMPLETED',
      },
      {
        title: 'HR Operations',
        person: 'Dewi Lestari, S.Psi',
        time: '02 Jan, 08:00 WIB',
        status: 'COMPLETED',
      },
    ],
  },
];

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

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);
  const [isPkbModalOpen, setIsPkbModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time synchronization states
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Baru saja');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [squadRoster, setSquadRoster] = useState<SquadMember[]>(initialSquadMembers);
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
                itemName.includes('rian') ||
                item.id === 'req-cuti-05';
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

      if (attendanceRes.ok) {
        const attJson = await attendanceRes.json();
        const records: any[] = attJson.data?.records || [];

        // Synchronize Squad Core Architecture live attendance dynamically
        setSquadRoster((prev) =>
          prev.map((member) => {
            const mName = member.name.toLowerCase();
            const att = records.find(
              (r: any) =>
                (r.employeeName && r.employeeName.toLowerCase().includes(mName)) ||
                (r.employeeId && r.employeeId.toLowerCase() === member.id.toLowerCase())
            );
            const leave = backendAllLeaves.find(
              (l: any) =>
                l.status === 'APPROVED' &&
                (l.name && l.name.toLowerCase().includes(mName))
            );

            if (leave) {
              const isSick = leave.typeCategory === 'sakit' || leave.leaveType?.toLowerCase().includes('sakit');
              return {
                ...member,
                status: isSick ? 'SAKIT' : 'CUTI',
                statusLabel: isSick ? `Sakit (${leave.durationDays || 1} Hari)` : `Cuti (${leave.durationDays || 1} Hari)`,
                badgeClass: isSick
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200',
                notes: leave.title,
              };
            }

            if (att) {
              const isWfh = att.workLocation === 'WFH' || att.status === 'WFH';
              const isDinas = att.status === 'DINAS_LUAR';
              return {
                ...member,
                status: isWfh ? 'WFH' : isDinas ? 'OFF' : 'WFO',
                statusLabel: isWfh ? 'WFH (Remote)' : isDinas ? 'Dinas Luar' : 'WFO (Pusat)',
                badgeClass: isWfh
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : isDinas
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                checkInTime: att.checkInTime || att.time,
                location: att.location,
              };
            }

            return member;
          })
        );
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSyncedAt(timeStr);
      if (isManual) {
        showToast('✓ Data permohonan & roster tim berhasil disinkronkan secara real-time.');
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
    } catch {}

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
      } catch {}

      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'APPROVAL_STATUS_CHANGED', id, status: 'CANCELLED' });
        ch.close();
      } catch {}
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
      }).catch(() => {});

      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'NEW_APPROVAL_REQUEST', request: newReq });
        ch.close();
      } catch {}

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

  // Dynamic Sprint Backlog Coverage
  const squadActiveCount = squadRoster.filter((m) => m.status === 'WFO' || m.status === 'WFH').length;
  const squadCoverage = Math.round((squadActiveCount / (squadRoster.length || 1)) * 100);

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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Semua Pengajuan</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    activeFilter === 'all'
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === 'pending'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Menunggu Persetujuan</span>
                {balances.pendingCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      activeFilter === 'pending'
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === 'approved'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Disetujui</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    activeFilter === 'approved'
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

          {/* SECTION 3: 2-COLUMN CONTENT (LEFT 8 COLS, RIGHT 4 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS): LEAVE CARDS WITH STEPPER */}
            <div className="lg:col-span-8 space-y-5">
              {/* REAL-TIME LIVE STATUS BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
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
                    Pembaruan persetujuan dari HR & Atasan diterima seketika
                  </span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                  <span className="text-[11px] text-slate-400">
                    Sinkron: <strong className="text-slate-600 font-mono">{lastSyncedAt}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchLiveLeaveData(true)}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-all disabled:opacity-50 active:scale-95"
                    title="Perbarui sinkronisasi sekarang"
                  >
                    <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                    <span>{isRefreshing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
                  </button>
                </div>
              </div>

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
                    className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 relative overflow-hidden space-y-5 ${
                      recentlyUpdatedId === item.id
                        ? 'ring-2 ring-emerald-400/80 shadow-lg shadow-emerald-500/10'
                        : 'shadow-2xs hover:shadow-md'
                    } ${
                      item.status === 'PENDING'
                        ? 'border-slate-200/90 hover:border-amber-300/80'
                        : item.status === 'REJECTED'
                        ? 'border-slate-200/90 hover:border-rose-300/80'
                        : 'border-slate-200/90 hover:border-emerald-300/80'
                    }`}
                  >
                    {/* Sleek Inner Status Accent Bar (Preserves rounded corners without glitching) */}
                    <div
                      className={`absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full transition-colors ${
                        item.status === 'PENDING'
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
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs transition-all ${
                            item.status === 'PENDING'
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            item.type.includes('Sakit') || item.title.includes('Sakit')
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
                              className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between space-y-3 ${
                                isCompleted
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
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all shadow-2xs ${
                                    isCompleted
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
                                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                        isCompleted
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
                                    className={`font-semibold ${
                                      isCompleted
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

            {/* RIGHT COLUMN (4 COLS): ROSTER TIM & PANDUAN PKB (Full unclipped content!) */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* CARD 1: ROSTER TIM ENGINEERING matching screenshot */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Roster Tim Engineering
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Hari Ini</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Status kehadiran rekan squad Core Architecture untuk sinkronisasi beban kerja.
                    </p>
                  </div>
                </div>

                {/* Dynamic Squad Members List synced with live attendance */}
                <div className="space-y-3">
                  {squadRoster.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-2.5 py-1">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {member.role}
                            {member.checkInTime ? ` • ${member.checkInTime}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border flex-shrink-0 ${member.badgeClass}`}>
                        {member.statusLabel}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Coverage & Link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Sprint Backlog Coverage: <strong className="text-slate-800">{squadCoverage}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRosterModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                  >
                    <span>Lihat Kalender Tim</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: PANDUAN HAK CUTI (PKB NEXORA) (Fully unclipped with generous bottom space!) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    @
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Panduan Hak Cuti (PKB Nexora)
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Ketentuan hak istimewa cuti berbayar sesuai Perjanjian Kerja Bersama periode 2024-2026:
                </p>

                {/* Complete Unclipped Checklist Items */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Cuti Tahunan:</strong> 12 hari/tahun kalender, hak timbul setelah 1 tahun masa bakti.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Cuti Khusus Menikah:</strong> 3 hari kerja penuh (melampirkan undangan/akta).
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Cuti Duka Cita:</strong> 2 hari kerja untuk anggota keluarga inti sedarah.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Izin Sakit:</strong> Wajib melampirkan surat dokter klinik resmi maksimal 1x24 jam.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Cuti Melahirkan / Istri Melahirkan:</strong> 3 bulan untuk karyawan wanita, 2 hari untuk karyawan pria.
                    </span>
                  </div>

                  <div className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>
                      <strong>Delegasi Handover:</strong> Wajib menunjuk rekan selevel sebelum tanggal cuti dimulai.
                    </span>
                  </div>
                </div>

                {/* Footer Download Link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setIsPkbModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                  >
                    <span>Unduh Dokumen PKB Lengkap (PDF)</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-semibold">Versi 2.4</span>
                </div>
              </div>
            </div>
          </div>
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

      {/* MODAL 5: ROSTER LENGKAP TIM */}
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
                    Kalender Roster Tim Engineering
                  </h3>
                  <p className="text-[11px] text-slate-400">Squad Core Architecture &amp; Platform</p>
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

            <div className="space-y-2 text-xs divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
              {squadRoster.map((member) => (
                <div key={member.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {member.role} {member.location ? `• ${member.location}` : ''}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border flex-shrink-0 ${member.badgeClass}`}>
                    {member.statusLabel}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
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
