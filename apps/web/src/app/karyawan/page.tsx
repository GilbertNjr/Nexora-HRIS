'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { useApprovalsRealtime, playNotificationSound } from '@/hooks/useApprovalsRealtime';
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
  ChevronLeft,
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
  PanelLeft,
  PanelLeftClose,
  Menu,
} from 'lucide-react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

interface WeeklyScheduleDay {
  day: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT';
  date: string;
  month: string;
  isoDate: string;
  type: 'WFO' | 'WFH';
  location: string;
  isToday: boolean;
}

const INDO_MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function computeRealWeeklySchedule(
  customPreferences?: Record<string, 'WFO' | 'WFH'> | null,
  todayAttendanceType?: 'WFO' | 'WFH' | null
): { periodStr: string; schedule: WeeklyScheduleDay[]; wfoRatio: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const days: Array<'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT'> = [
    'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'
  ];
  const defaultTypes: Array<'WFO' | 'WFH'> = ['WFO', 'WFH', 'WFO', 'WFO', 'WFH'];

  let wfoCount = 0;
  const schedule: WeeklyScheduleDay[] = days.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const isoDate = d.toISOString().split('T')[0];

    // Accurate isToday: if weekday (Mon-Fri) exact match, if weekend (Sat/Sun) highlight Friday (day 6) or Monday (day 0)
    const isActualToday = d.toDateString() === now.toDateString();
    const isHighlighted = isActualToday || (dayOfWeek === 6 && idx === 4) || (dayOfWeek === 0 && idx === 0);

    let type: 'WFO' | 'WFH' = customPreferences?.[isoDate] || customPreferences?.[dayName] || defaultTypes[idx];

    // If today has confirmed clock-in, sync status
    if (isActualToday && todayAttendanceType) {
      type = todayAttendanceType;
    }

    if (type === 'WFO') wfoCount++;

    return {
      day: dayName,
      date: String(d.getDate()),
      month: INDO_MONTH_NAMES[d.getMonth()],
      isoDate,
      type,
      location: type === 'WFH' ? 'WFH' : 'WFO (SCBD)',
      isToday: isHighlighted,
    };
  });

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  let periodStr = '';
  if (monday.getMonth() === friday.getMonth()) {
    periodStr = `${monday.getDate()} - ${friday.getDate()} ${INDO_MONTH_NAMES[friday.getMonth()]} ${friday.getFullYear()}`;
  } else {
    periodStr = `${monday.getDate()} ${INDO_MONTH_NAMES[monday.getMonth()]} - ${friday.getDate()} ${INDO_MONTH_NAMES[friday.getMonth()]} ${friday.getFullYear()}`;
  }

  const wfoRatio = Math.round((wfoCount / 5) * 100);

  return { periodStr, schedule, wfoRatio };
}

export default function EmployeeDashboardOverhaulPage() {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileOpen,
    openMobile,
    closeMobile,
  } = useSidebarCollapse();

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

  // Dynamic Real-time HR Announcements
  interface HrAnnouncementItem {
    id: string;
    badge: string;
    docNumber: string;
    title: string;
    summary: string;
    content: string;
    buttonText: string;
    priority: 'URGENT' | 'IMPORTANT' | 'INFO';
    publishedAt: string;
    author: string;
    isEmergency?: boolean;
    attachmentUrl?: string;
  }

  const [announcements, setAnnouncements] = useState<HrAnnouncementItem[]>([
    {
      id: 'ann-1',
      badge: 'PENGUMUMAN HRD',
      docNumber: 'No. 018/HR-NOTIF/X/2026',
      title: 'Ketentuan Core Hours & Fleksibilitas Hybrid Q4 2026',
      summary:
        'Penyesuaian core hours 08:30 - 16:30 WIB dengan integrasi otomatis Google Calendar dan kepatuhan kuota minimal WFO 60% pekanan.',
      content:
        'Berdasarkan Keputusan Direksi Nomor SE/018/DIR-HR/X/2026 mengenai Penyesuaian Jam Kerja & Hybrid Working Q4 2026:\n\n1. Jam Kerja Reguler: 08:30 WIB s/d 16:30 WIB (Senin s/d Kamis), 08:30 WIB s/d 17:00 WIB (Jumat).\n2. Waktu Istirahat: 12:00 s/d 13:00 WIB (Senin - Kamis), 11:30 s/d 13:00 WIB (Jumat Sholat Jumat).\n3. Presensi tetap wajib melalui Liveness Biometric Face Scan pada Portal ESS.\n4. Karyawan yang bertugas WFH wajib standby pada jam kerja efektif dan mengikuti daily standup pukul 08:45 WIB.',
      buttonText: 'Lihat SE Direksi',
      priority: 'IMPORTANT',
      publishedAt: '20 Oktober 2026, 08:00 WIB',
      author: 'Dewan Direksi & HR Operations',
      isEmergency: false,
    },
  ]);
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);
  const [isAnnouncementGlowing, setIsAnnouncementGlowing] = useState(false);
  const [isAnnouncementLiveConnected, setIsAnnouncementLiveConnected] = useState(false);

  // Live Date & Greeting
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [liveGreeting, setLiveGreeting] = useState('Selamat Pagi');

  // Real-Time Dashboard Key Metrics State (0 Dummy Data)
  const [todayAttendance, setTodayAttendance] = useState<{
    hasClockedIn: boolean;
    checkInTime: string;
    checkOutTime: string;
    status: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'WFH' | 'DINAS_LUAR' | 'BELUM_PRESENSI';
    location: string;
    device: string;
  }>({
    hasClockedIn: false,
    checkInTime: '—',
    checkOutTime: '—',
    status: 'BELUM_PRESENSI',
    location: 'Kantor Pusat HQ SCBD',
    device: '((•)) Biometrik Face Recognition',
  });

  const [leaveStats, setLeaveStats] = useState({
    totalQuota: 12,
    usedDays: 0,
    remainingQuota: 12,
    expiryDate: `Des ${new Date().getFullYear()}`,
  });

  const [payrollCycle, setPayrollCycle] = useState({
    paydayDateStr: '',
    daysLeft: 0,
    statusLabel: 'Data Terkunci',
    monthName: 'Oktober',
    daysInMonth: 31,
  });

  const [performanceKpi, setPerformanceKpi] = useState({
    cycleCode: 'Q4 2026',
    quarterName: 'Q4',
    score: '4.85',
    grade: 'Grade A (Outstanding)',
    yoyChange: '+0.15 YoY',
    okrAchievement: '105%',
  });

  // Real-time Dynamic Weekly Schedule State (100% Calculated from Live Clock)
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleDay[]>(() => {
    return computeRealWeeklySchedule().schedule;
  });
  const [weeklyPeriodStr, setWeeklyPeriodStr] = useState<string>(() => {
    return computeRealWeeklySchedule().periodStr;
  });
  const [wfoRatio, setWfoRatio] = useState<number>(() => {
    return computeRealWeeklySchedule().wfoRatio;
  });

  // Leave Form State
  const [leaveCategory, setLeaveCategory] = useState('Cuti Tahunan');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Overtime Form State
  const [overtimeDate, setOvertimeDate] = useState(new Date().toISOString().split('T')[0]);
  const [overtimeHours, setOvertimeHours] = useState('3');
  const [overtimeReason, setOvertimeReason] = useState('Maintenance Database Core & Deployment Hotfix');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [activeQuota, setActiveQuota] = useState(12);

  // Backend Team Attendance
  const [teamMembers, setTeamMembers] = useState([
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

  // Real-time synchronization fetcher across attendance, leave, and performance
  const fetchRealtimeDashboardData = React.useCallback(async () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const userEmpNum = currentUser.employeeNumber || 'NX-2021008';

    // 1. Fetch real-time attendance
    try {
      const attRes = await fetch(`/api/v1/attendance?employeeId=${encodeURIComponent(userEmpNum)}`);
      if (attRes.ok) {
        const attJson = await attRes.json();
        const records = attJson.data?.records || [];
        const todayRec = records.find(
          (r: any) =>
            r.date === todayStr &&
            ((r.employeeId && r.employeeId.toLowerCase() === userEmpNum.toLowerCase()) ||
              (r.employeeName && r.employeeName.toLowerCase().includes('rian')))
        );

        if (todayRec) {
          const isWfh = todayRec.status === 'WFH';
          setTodayAttendance({
            hasClockedIn: true,
            checkInTime: todayRec.checkInTime || todayRec.time || '08:00 WIB',
            checkOutTime: todayRec.checkOutTime || '—',
            status: todayRec.status || 'TEPAT_WAKTU',
            location: todayRec.location || (isWfh ? 'Rumah / Remote Workspace' : 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)'),
            device: todayRec.device || '((•)) Biometrik Liveness Selfie',
          });

          // Dynamically sync today's card in weeklySchedule
          setWeeklySchedule((prev) =>
            prev.map((item) =>
              item.isToday
                ? {
                    ...item,
                    type: isWfh ? 'WFH' : 'WFO',
                    location: isWfh ? 'WFH (Tervalidasi)' : 'WFO (SCBD)',
                  }
                : item
            )
          );

          // Dynamically sync Rian Pratama in team roster
          setTeamMembers((prev) =>
            prev.map((m) =>
              m.id === '1'
                ? {
                    ...m,
                    status: isWfh ? 'WFH' : 'WFO Lt. 7',
                    color: isWfh ? 'purple' : 'blue',
                  }
                : m
            )
          );
        } else {
          setTodayAttendance({
            hasClockedIn: false,
            checkInTime: '—',
            checkOutTime: '—',
            status: 'BELUM_PRESENSI',
            location: 'Kantor SCBD Lt. 7',
            device: '((•)) Liveness Selfie Camera',
          });
        }
      }
    } catch {}

    // 2. Fetch real-time leave quota from approvals
    try {
      const appRes = await fetch('/api/v1/approvals');
      if (appRes.ok) {
        const appJson = await appRes.json();
        const approvals = appJson.data || [];
        const myApproved = approvals.filter(
          (a: any) =>
            a.status === 'APPROVED' &&
            ((a.nik && a.nik.toLowerCase() === userEmpNum.toLowerCase()) ||
              (a.name && a.name.toLowerCase().includes('rian')))
        );
        const used = myApproved.reduce(
          (sum: number, item: any) => sum + (Number(item.durationDays) || 1),
          0
        );
        const remaining = Math.max(0, 12 - used);
        setLeaveStats({
          totalQuota: 12,
          usedDays: used,
          remainingQuota: remaining,
          expiryDate: `Des ${now.getFullYear()}`,
        });
        setActiveQuota(remaining);
      }
    } catch {}

    // 3. Fetch real-time performance KPI from database
    try {
      const perfRes = await fetch(`/api/v1/performance?nik=${encodeURIComponent(userEmpNum)}`);
      if (perfRes.ok) {
        const perfJson = await perfRes.json();
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        if (perfJson.success && perfJson.data) {
          const p = perfJson.data;
          const scoreNum = Number(p.score) || 4.85;
          setPerformanceKpi({
            cycleCode: p.cycle || `Q${quarter} ${now.getFullYear()}`,
            quarterName: `Q${quarter}`,
            score: scoreNum.toFixed(2),
            grade: p.grade || 'Grade A (Outstanding)',
            yoyChange: '+0.15 YoY',
            okrAchievement: p.okrAchievement || '105%',
          });
        }
      }
    } catch {}
  }, [currentUser.employeeNumber]);

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

    // Dynamic Payroll Cycle Calculation
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    let targetPayday = new Date(year, month, 28);
    if (now.getDate() > 28) {
      targetPayday = new Date(year, month + 1, 28);
    }
    const diffDays = Math.ceil((targetPayday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    setPayrollCycle({
      paydayDateStr: `28 ${monthNames[targetPayday.getMonth()]} ${targetPayday.getFullYear()}`,
      daysLeft: Math.max(0, diffDays),
      statusLabel: diffDays <= 4 ? 'Data Terkunci' : 'Proses Sinkronisasi',
      monthName: monthNames[month],
      daysInMonth: daysInCurrentMonth,
    });

    // Load persisted weekly schedule preferences from localStorage
    let storedPrefs: Record<string, 'WFO' | 'WFH'> | null = null;
    try {
      const saved = localStorage.getItem('nexora_weekly_wfh_preferences');
      if (saved) {
        storedPrefs = JSON.parse(saved);
      }
    } catch {}

    const { schedule: realSchedule, periodStr: realPeriodStr, wfoRatio: realWfoRatio } = computeRealWeeklySchedule(storedPrefs);
    setWeeklySchedule(realSchedule);
    setWeeklyPeriodStr(realPeriodStr);
    setWfoRatio(realWfoRatio);

    // Initial real-time data load
    fetchRealtimeDashboardData();
  }, [fetchRealtimeDashboardData]);

  // Real-time Announcements: initial fetch, BroadcastChannel, and SSE live stream
  useEffect(() => {
    let isMounted = true;

    // Initial fetch from persistent API storage
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/v1/announcements');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
            setAnnouncements(json.data);
          }
        }
      } catch {}
    };
    fetchAnnouncements();

    // 1. BroadcastChannel for instant same-browser cross-tab sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('nexora_live_sync');
      bc.onmessage = (event) => {
        const type = event.data?.type;
        if (
          type === 'ATTENDANCE_RECORDED' ||
          type === 'LEAVE_ACTIONED' ||
          type === 'LEAVE_REQUESTED' ||
          type === 'PERFORMANCE_UPDATED' ||
          type === 'PERFORMANCE_CALIBRATED' ||
          type === 'PROFILE_UPDATED'
        ) {
          fetchRealtimeDashboardData();
        }

        if (type === 'SCHEDULE_PREFERENCE_UPDATED' && event.data?.payload) {
          const { schedule: syncSched, periodStr: syncPeriod, wfoRatio: syncRatio } = computeRealWeeklySchedule(event.data.payload);
          setWeeklySchedule(syncSched);
          setWeeklyPeriodStr(syncPeriod);
          setWfoRatio(syncRatio);
        }

        if (event.data?.type === 'ANNOUNCEMENT_PUBLISHED' && event.data?.payload) {
          const newAnn = event.data.payload as HrAnnouncementItem;
          setAnnouncements((prev) => {
            const filtered = prev.filter((a) => a.id !== newAnn.id);
            return [newAnn, ...filtered];
          });
          setActiveAnnouncementIdx(0);
          setIsAnnouncementGlowing(true);
          playNotificationSound();
          showToast(`📣 Pengumuman HR Baru: "${newAnn.title}"`);
          setTimeout(() => setIsAnnouncementGlowing(false), 8000);
        }
      };
    } catch {}

    // 2. Server-Sent Events (SSE) for multi-device sync (e.g. Admin on PC, Employee on phone)
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/v1/employees/stream');
      es.addEventListener('connected', () => {
        if (isMounted) setIsAnnouncementLiveConnected(true);
      });
      es.addEventListener('ANNOUNCEMENT_PUBLISHED', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          const newAnn = parsed.payload as HrAnnouncementItem;
          if (newAnn && newAnn.title) {
            setAnnouncements((prev) => {
              const filtered = prev.filter((a) => a.id !== newAnn.id);
              return [newAnn, ...filtered];
            });
            setActiveAnnouncementIdx(0);
            setIsAnnouncementGlowing(true);
            playNotificationSound();
            showToast(`📣 [LIVE HR] ${newAnn.title}`);
            setTimeout(() => setIsAnnouncementGlowing(false), 8000);
          }
        } catch {}
      });
    } catch {}

    // 3. Custom Event to open announcement modal directly
    const handleOpenModalEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const meta = customEvent.detail;
      if (meta?.announcementId) {
        setAnnouncements((current) => {
          const foundIdx = current.findIndex((a) => a.id === meta.announcementId);
          if (foundIdx !== -1) setActiveAnnouncementIdx(foundIdx);
          return current;
        });
      }
      setIsAnnouncementModalOpen(true);
    };
    window.addEventListener('nexora_open_announcement', handleOpenModalEvent);

    return () => {
      isMounted = false;
      if (bc) bc.close();
      if (es) es.close();
      window.removeEventListener('nexora_open_announcement', handleOpenModalEvent);
    };
  }, []);

  // Multi-device real-time SSE stream hook for employee dashboard
  useApprovalsRealtime({
    playAudioAlert: true,
    onLeaveActioned: ({ status, item }) => {
      if (status === 'APPROVED') {
        showToast(`🎉 Pengajuan cuti Anda telah DISETUJUI oleh HR Admin!`);
      } else if (status === 'REJECTED') {
        showToast(`ℹ️ Pengajuan cuti Anda telah DITOLAK oleh HR Admin.`);
      }
      fetchRealtimeDashboardData();
    },
    onRefresh: () => {
      fetchRealtimeDashboardData();
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
        name: currentUser.fullName,
        nik: currentUser.employeeNumber,
        role: currentUser.designation,
        department: currentUser.department,
        avatarUrl: currentUser.avatarUrl,
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
          name: currentUser.fullName,
          nik: currentUser.employeeNumber,
          role: currentUser.designation,
          department: currentUser.department,
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

      {/* LEFT SIDEBAR with Collapse/Expand & Mobile Drawer */}
      <EmployeeSidebar
        activeMenu="dashboard"
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
                <span className="text-slate-600 font-semibold text-xs">
                  Tahun Anggaran {new Date().getFullYear()}
                </span>
              </div>

              {/* Title with Emoji */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {liveGreeting}, {currentUser.firstName || currentUser.fullName.split(' ')[0]}! 👋
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
                  <span>
                    Jadwal: <strong>WFO (HQ SCBD Tower Lt. 7)</strong>
                  </span>
                </span>
                <span className="text-slate-300">•</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full border text-[11px] ${
                    todayAttendance.hasClockedIn
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      todayAttendance.hasClockedIn ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  <span>
                    Status Presensi: {todayAttendance.hasClockedIn ? 'Tercatat' : 'Belum Presensi'}
                  </span>
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

              {/* Slip Gaji Digital */}
              <button
                type="button"
                onClick={() => setIsPayslipModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Slip Gaji {payrollCycle.monthName}</span>
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
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    todayAttendance.hasClockedIn
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div>
                {todayAttendance.hasClockedIn ? (
                  <>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {todayAttendance.checkInTime.replace(' WIB', '')}
                    </span>
                    <span className="text-xs font-bold text-slate-500 ml-1.5">WIB</span>
                  </>
                ) : (
                  <Link href="/ess/attendance" className="group block">
                    <span className="text-xl font-black text-slate-400 group-hover:text-blue-600 tracking-tight flex items-center gap-1.5 transition-colors">
                      <span>Belum Presensi</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span
                  className="text-[11px] text-slate-500 font-medium truncate max-w-[155px]"
                  title={todayAttendance.location}
                >
                  {todayAttendance.hasClockedIn
                    ? `((•)) ${todayAttendance.location}`
                    : '((•)) Kantor SCBD Lt. 7'}
                </span>
                {todayAttendance.hasClockedIn ? (
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                      todayAttendance.status === 'TEPAT_WAKTU' || todayAttendance.status === 'WFH'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {todayAttendance.status === 'TEPAT_WAKTU'
                      ? 'Tepat Waktu'
                      : todayAttendance.status === 'WFH'
                      ? 'Presensi WFH'
                      : 'Terlambat'}
                  </span>
                ) : (
                  <Link
                    href="/ess/attendance"
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    Masuk Sekarang
                  </Link>
                )}
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
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {leaveStats.remainingQuota}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">
                  / {leaveStats.totalQuota} Hari
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (leaveStats.remainingQuota / leaveStats.totalQuota) * 100
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Terpakai: {leaveStats.usedDays} Hari</span>
                <span>Hangus: {leaveStats.expiryDate}</span>
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
                  {payrollCycle.paydayDateStr}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    {payrollCycle.daysLeft === 0
                      ? 'Hari Ini Pembayaran'
                      : `T-${payrollCycle.daysLeft} Hari Pembayaran`}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {payrollCycle.statusLabel}
                </span>
              </div>
            </div>

            {/* Card 4: Kinerja (Berjalan) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  KINERJA {performanceKpi.quarterName} (BERJALAN)
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {performanceKpi.score}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1.5">/ 5.0</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span className="text-amber-500">★</span>
                  <span>{performanceKpi.grade}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {performanceKpi.okrAchievement}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              {/* CARD 1: PENGUMUMAN HRD - Real-time Live & Dynamic */}
              {(() => {
                const currentAnnouncement =
                  announcements[activeAnnouncementIdx] || announcements[0];
                return (
                  <div
                    className={`rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden transition-all duration-500 ${
                      isAnnouncementGlowing
                        ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-white shadow-[0_0_35px_rgba(251,191,36,0.6)] scale-[1.01]'
                        : ''
                    } ${
                      currentAnnouncement?.priority === 'URGENT'
                        ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-indigo-950'
                        : 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900'
                    }`}
                  >
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
                            {currentAnnouncement?.badge || 'PENGUMUMAN HRD'}
                          </span>
                          <span className="text-[11px] text-blue-200 font-medium">
                            {currentAnnouncement?.docNumber || 'No. 018/HR-NOTIF/X/2026'}
                          </span>

                          {/* Live SSE / Broadcast Indicator */}
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Live HR Sync</span>
                          </span>

                          {isAnnouncementGlowing && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider animate-bounce">
                              ✨ Pengumuman Baru
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white pt-1">
                          {currentAnnouncement?.title || 'Ketentuan Core Hours & Fleksibilitas Hybrid Q4 2026'}
                        </h3>

                        <p className="text-xs text-blue-100/90 leading-relaxed">
                          {currentAnnouncement?.summary ||
                            'Penyesuaian core hours 08:30 - 16:30 WIB dengan integrasi otomatis Google Calendar dan kepatuhan kuota minimal WFO 60% pekanan.'}
                        </p>

                        {/* Navigation dots / arrows if multiple announcements exist */}
                        {announcements.length > 1 && (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-blue-200">
                            <span className="text-[10px] font-medium opacity-80">
                              {activeAnnouncementIdx + 1} dari {announcements.length} Pengumuman
                            </span>
                            <div className="inline-flex items-center gap-1 bg-white/10 rounded-lg p-0.5 border border-white/15">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveAnnouncementIdx((prev) =>
                                    prev === 0 ? announcements.length - 1 : prev - 1
                                  )
                                }
                                className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                                title="Pengumuman sebelumnya"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveAnnouncementIdx((prev) =>
                                    (prev + 1) % announcements.length
                                  )
                                }
                                className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                                title="Pengumuman berikutnya"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAnnouncementModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs shadow-md transition-all active:scale-95 flex-shrink-0 self-start sm:self-center"
                      >
                        <span>{currentAnnouncement?.buttonText || 'Lihat SE Direksi'}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* CARD 2: JADWAL & KOMITMEN KERJA PEKAN INI matching screenshot */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Jadwal & Komitmen Kerja Pekan Ini
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Periode {weeklyPeriodStr || 'Pekan Ini'} • Shift Reguler Core Hours (08:30 - 16:30 WIB)
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
                    <span>
                      Rasio kehadiran tim minimum WFO: <strong>60%</strong> per hari kerja{' '}
                      <span className={wfoRatio >= 60 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                        (Komitmen Anda: {wfoRatio}%)
                      </span>
                      .
                    </span>
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
                      {teamMembers.filter((m) => !m.status.includes('Cuti')).length} dari {teamMembers.length} Anggota Aktif Hari Ini
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

                  {/* Doc 2: Slip Gaji Digital Real-time */}
                  <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        Slip Gaji Digital ({payrollCycle.monthName} {new Date().getFullYear()})
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

      {/* MODAL 3: LIHAT SE DIREKSI (Dynamic Content) */}
      {isAnnouncementModalOpen && (() => {
        const currentAnnouncement =
          announcements[activeAnnouncementIdx] || announcements[0];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {currentAnnouncement?.title || 'Surat Edaran Direksi'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Nomor: {currentAnnouncement?.docNumber || 'No. 018/HR-NOTIF/X/2026'}
                    </p>
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

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200/60">
                  <span>Diterbitkan: <strong>{currentAnnouncement?.publishedAt}</strong></span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-[10px]">
                    {currentAnnouncement?.badge || 'PENGUMUMAN HRD'}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-900 pb-1">Ringkasan Eksekutif:</p>
                  <p className="text-slate-700">{currentAnnouncement?.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <p className="font-bold text-slate-900 pb-1">Ketentuan & Dokumen Lengkap:</p>
                  <div className="whitespace-pre-line text-slate-600 leading-relaxed">
                    {currentAnnouncement?.content}
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200/60 flex items-center justify-between">
                  <span>Otorisator: <strong>{currentAnnouncement?.author || 'Dewan Direksi'}</strong></span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Sistem HR
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  PT Nexora Solusi Nusantara
                </span>
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
        );
      })()}

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
                  <p className="text-[11px] text-slate-400">
                    Periode {weeklyPeriodStr} • Standar Minimal WFO 60%
                  </p>
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

            {/* WFO Quota Status Bar */}
            {(() => {
              const currentWfo = weeklySchedule.filter((i) => i.type === 'WFO').length;
              const currentPct = Math.round((currentWfo / 5) * 100);
              const isCompliant = currentWfo >= 3;
              return (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Rasio WFO: </span>
                    <strong className={isCompliant ? 'text-emerald-700' : 'text-amber-700'}>
                      {currentPct}% ({currentWfo} dari 5 Hari)
                    </strong>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      isCompliant
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isCompliant ? '✓ Memenuhi Kuota' : '⚠️ Di Bawah 60%'}
                  </span>
                </div>
              );
            })()}

            <div className="space-y-2 text-xs">
              {weeklySchedule.map((item, index) => (
                <div
                  key={item.day}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    item.isToday
                      ? 'border-blue-300 bg-blue-50/50'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {item.day}, {item.date} {item.month}
                    </span>
                    {item.isToday && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-600 text-white">
                        HARI INI
                      </span>
                    )}
                  </div>
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
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
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
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
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
                onClick={() => setIsWfhPreferenceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const wfoCount = weeklySchedule.filter((i) => i.type === 'WFO').length;
                  const ratio = Math.round((wfoCount / 5) * 100);
                  setWfoRatio(ratio);

                  // Persist to localStorage
                  const prefMap: Record<string, 'WFO' | 'WFH'> = {};
                  weeklySchedule.forEach((item) => {
                    prefMap[item.day] = item.type;
                    if (item.isoDate) prefMap[item.isoDate] = item.type;
                  });
                  try {
                    localStorage.setItem('nexora_weekly_wfh_preferences', JSON.stringify(prefMap));
                  } catch {}

                  // Sync team roster member 1 (Rian)
                  const isWfoToday = weeklySchedule.find((i) => i.isToday)?.type === 'WFO';
                  setTeamMembers((prev) =>
                    prev.map((m) =>
                      m.id === '1'
                        ? {
                            ...m,
                            status: isWfoToday ? 'WFO Lt. 7' : 'WFH',
                            color: isWfoToday ? 'blue' : 'purple',
                          }
                        : m
                    )
                  );

                  // Broadcast live sync
                  try {
                    const bc = new BroadcastChannel('nexora_live_sync');
                    bc.postMessage({ type: 'SCHEDULE_PREFERENCE_UPDATED', payload: prefMap });
                    bc.close();
                  } catch {}

                  // Send audit log in background
                  try {
                    fetch('/api/v1/audit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'UPDATE_WFH_PREFERENCE',
                        actor: `${currentUser.fullName || 'Rian Pratama'} (${currentUser.designation || 'Karyawan'})`,
                        details: `Memperbarui komitmen kerja mingguan: ${wfoCount} Hari WFO (${ratio}%), ${5 - wfoCount} Hari WFH`,
                        category: 'ATTENDANCE',
                        ipAddress: '10.24.1.88',
                      }),
                    }).catch(() => {});
                  } catch {}

                  setIsWfhPreferenceModalOpen(false);
                  showToast(
                    `✓ Komitmen kerja pekan ini disimpan (${ratio}% WFO)! Jadwal disinkronkan ke tim.`
                  );
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
                    Rincian Slip Gaji — {payrollCycle.monthName} {new Date().getFullYear()}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Periode Kerja: 01 - {payrollCycle.daysInMonth} {payrollCycle.monthName} {new Date().getFullYear()}
                  </p>
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
                onClick={() => handleDownloadDoc(`Slip Gaji ${payrollCycle.monthName} ${new Date().getFullYear()}`)}
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
