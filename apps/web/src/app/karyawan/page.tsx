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
  ArrowRight,
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
): { periodStr: string; schedule: WeeklyScheduleDay[]; wfoRatio: number; hasCustomPrefs: boolean } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const days: Array<'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT'> = [
    'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'
  ];

  const hasCustomPrefs = Boolean(customPreferences && Object.keys(customPreferences).length > 0);

  let wfoCount = 0;
  const schedule: WeeklyScheduleDay[] = days.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const isoDate = d.toISOString().split('T')[0];

    // Accurate isToday: ONLY true if the schedule card date strictly matches actual real-time date
    const isActualToday = d.toDateString() === now.toDateString();

    // Default on fresh accounts is 100% WFO (Company Standard HQ SCBD Schedule)
    let type: 'WFO' | 'WFH' = 'WFO';
    if (customPreferences) {
      if (customPreferences[isoDate]) {
        type = customPreferences[isoDate];
      } else if (customPreferences[dayName]) {
        type = customPreferences[dayName];
      }
    }

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
      isToday: isActualToday,
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

  return { periodStr, schedule, wfoRatio, hasCustomPrefs };
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
      title: 'Ketentuan Core Hours & Fleksibilitas Hybrid Kerja Q4 2026',
      summary:
        'Penyesuaian core hours 08:30 - 16:30 WIB dengan integrasi otomatis Google Calendar dan kepatuhan kuota minimal WFO 60% pekanan.',
      content:
        'Berdasarkan Keputusan Direksi Nomor SE/018/DIR-HR/X/2026 mengenai Penyesuaian Jam Kerja & Hybrid Working Q4 2026:\n\n1. Jam Kerja Reguler: 08:30 WIB s/d 16:30 WIB (Senin s/d Kamis), 08:30 WIB s/d 17:00 WIB (Jumat).\n2. Waktu Istirahat: 12:00 s/d 13:00 WIB (Senin - Kamis), 11:30 s/d 13:00 WIB (Jumat Sholat Jumat).\n3. Presensi tetap wajib melalui Liveness Biometric Face Scan pada Portal ESS.\n4. Karyawan yang bertugas WFH wajib standby pada jam kerja efektif dan mengikuti daily standup pukul 08:45 WIB.',
      buttonText: 'Lihat SE Direksi',
      priority: 'IMPORTANT',
      publishedAt: '20 Oktober 2026, 08:00 WIB',
      author: 'Direktur SDM & Operasional',
      isEmergency: false,
    },
    {
      id: 'ann-2',
      badge: 'PAYROLL & KOMPENSASI',
      docNumber: 'No. 024/HR-PAY/X/2026',
      title: 'Penyaluran Batch Payroll Periode Maret 2025 Sukses 100%',
      summary:
        'Perintah transfer penggajian batch periode berjalan telah sukses disalurkan ke host-to-host kliring perbankan. Slip gaji digital telah terbit dan dapat diunduh.',
      content:
        'Pemberitahuan kepada seluruh staf aktif PT Nexora Solusi Nusantara:\n\n1. Pemrosesan lembar kompensasi periode 26 Februari - 25 Maret 2025 telah selesai diotorisasi.\n2. Seluruh hak gaji pokok, tunjangan operasional, dan lembur telah ditransfer ke rekening payroll karyawan.\n3. Rincian pemotongan PPh 21 TER (PP 58/2023) dan iuran BPJS Ketenagakerjaan/Kesehatan tercantum lengkap di slip gaji digital.',
      buttonText: 'Cek Rincian Payroll',
      priority: 'INFO',
      publishedAt: '25 Maret 2025, 14:30 WIB',
      author: 'Finance & HR Operations Manager',
      isEmergency: false,
    },
    {
      id: 'ann-3',
      badge: 'BENEFIT & ASURANSI',
      docNumber: 'No. 012/HR-BENEFIT/X/2026',
      title: 'Pembaruan Skema Manfaat Asuransi Kesehatan & Medical Reimbursement',
      summary:
        'Peningkatan fasilitas rawat jalan dan integrasi klaim digital cashless melalui portal ESS Karyawan dengan jaringan rumah sakit rekanan tier-1.',
      content:
        'Manajemen HR dengan bangga mengumumkan pembaruan fasilitas asuransi kesehatan karyawan:\n\n1. Plafon rawat jalan ditingkatkan sebesar 15% untuk seluruh staf tetap.\n2. Klaim rawat inap dan obat resep dapat diproses secara cashless via kartu digital ESS.\n3. Buku panduan klaim reimbursement dapat diakses di Pusat Dokumen & Surat.',
      buttonText: 'Rincian Polis Asuransi',
      priority: 'INFO',
      publishedAt: '12 Oktober 2026, 10:00 WIB',
      author: 'Benefit & People Development Lead',
      isEmergency: false,
    },
  ]);
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);
  const [isAnnouncementGlowing, setIsAnnouncementGlowing] = useState(false);
  const [isAnnouncementLiveConnected, setIsAnnouncementLiveConnected] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [carouselProgress, setCarouselProgress] = useState(0);

  // Auto-advance announcement carousel every 8 seconds, pausing on mouse hover
  useEffect(() => {
    if (announcements.length <= 1 || isCarouselPaused) return;

    const intervalTime = 8000;
    const tickRate = 50;
    const step = (tickRate / intervalTime) * 100;

    const timer = setInterval(() => {
      setCarouselProgress((prev) => {
        if (prev >= 100) {
          setActiveAnnouncementIdx((curr) => (curr + 1) % announcements.length);
          return 0;
        }
        return prev + step;
      });
    }, tickRate);

    return () => clearInterval(timer);
  }, [announcements.length, isCarouselPaused]);

  const handleSelectAnnouncement = (idx: number) => {
    setActiveAnnouncementIdx(idx);
    setCarouselProgress(0);
  };

  const handlePrevAnnouncement = () => {
    setActiveAnnouncementIdx((curr) =>
      curr === 0 ? announcements.length - 1 : curr - 1
    );
    setCarouselProgress(0);
  };

  const handleNextAnnouncement = () => {
    setActiveAnnouncementIdx((curr) => (curr + 1) % announcements.length);
    setCarouselProgress(0);
  };

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
    statusLabel: 'Cutoff Payroll Aktif',
    monthName: 'Oktober',
    daysInMonth: 31,
  });

  const [performanceKpi, setPerformanceKpi] = useState({
    cycleCode: `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`,
    quarterName: `Q${Math.floor(new Date().getMonth() / 3) + 1}`,
    score: '—',
    grade: 'Belum Dinilai',
    yoyChange: '—',
    okrAchievement: '0%',
    status: 'MENUNGGU SUBMISI',
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
  const [hasCustomWfoPrefs, setHasCustomWfoPrefs] = useState<boolean>(() => {
    return computeRealWeeklySchedule().hasCustomPrefs;
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real-time synchronization fetcher across attendance, leave, and performance
  const fetchRealtimeDashboardData = React.useCallback(async () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const userEmpNum = currentUser.employeeNumber || '';
    const userFullName = (currentUser.fullName || '').toLowerCase().trim();

    // 1. Fetch real-time attendance
    try {
      if (userEmpNum) {
        const attRes = await fetch(`/api/v1/attendance?employeeId=${encodeURIComponent(userEmpNum)}`);
        if (attRes.ok) {
          const attJson = await attRes.json();
          const records = attJson.data?.records || [];
          const todayRec = records.find(
            (r: any) =>
              r.date === todayStr &&
              ((r.employeeId && r.employeeId.toLowerCase() === userEmpNum.toLowerCase()) ||
                (userFullName && r.employeeName && r.employeeName.toLowerCase().includes(userFullName)))
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
      }
    } catch {}

    // 2. Fetch real-time leave quota from approvals (including approved records)
    try {
      const appRes = await fetch('/api/v1/approvals?all=true');
      if (appRes.ok) {
        const appJson = await appRes.json();
        const approvals = appJson.data || [];
        const myApproved = approvals.filter(
          (a: any) =>
            a.status === 'APPROVED' &&
            ((userEmpNum && a.nik && a.nik.toLowerCase() === userEmpNum.toLowerCase()) ||
              (userFullName && a.name && a.name.toLowerCase().includes(userFullName)))
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
      if (userEmpNum) {
        const perfRes = await fetch(`/api/v1/performance?nik=${encodeURIComponent(userEmpNum)}`);
        if (perfRes.ok) {
          const perfJson = await perfRes.json();
          const quarter = Math.floor(now.getMonth() / 3) + 1;
          if (perfJson.success && perfJson.data) {
            const p = perfJson.data;
            const scoreNum = Number(p.score) || 0;
            const isEvaluated = scoreNum > 0 && p.status !== 'MENUNGGU SUBMISI';
            setPerformanceKpi({
              cycleCode: p.cycle || `Q${quarter} ${now.getFullYear()}`,
              quarterName: `Q${quarter}`,
              score: isEvaluated ? scoreNum.toFixed(2) : '—',
              grade: isEvaluated ? (p.grade || 'Grade B (Meets)') : 'Belum Dinilai',
              yoyChange: isEvaluated ? '+0.15 YoY' : '—',
              okrAchievement: isEvaluated ? (p.okrAchievement || '100%') : '0%',
              status: p.status || 'MENUNGGU SUBMISI',
            });
          }
        }
      }
    } catch {}
  }, [currentUser.employeeNumber, currentUser.fullName]);

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
    const todayDateNum = now.getDate();
    let statusLabel = 'Sinkronisasi Presensi Aktif';
    if (diffDays === 0) {
      statusLabel = 'Hari Ini Pembayaran';
    } else if (todayDateNum > 20 && todayDateNum < 28) {
      statusLabel = 'Cutoff Payroll Aktif';
    } else if (todayDateNum > 28) {
      statusLabel = 'Periode Baru Aktif';
    }

    setPayrollCycle({
      paydayDateStr: `28 ${monthNames[targetPayday.getMonth()]} ${targetPayday.getFullYear()}`,
      daysLeft: Math.max(0, diffDays),
      statusLabel,
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

    const { schedule: realSchedule, periodStr: realPeriodStr, wfoRatio: realWfoRatio, hasCustomPrefs: realHasCustom } = computeRealWeeklySchedule(storedPrefs);
    setWeeklySchedule(realSchedule);
    setWeeklyPeriodStr(realPeriodStr);
    setWfoRatio(realWfoRatio);
    setHasCustomWfoPrefs(realHasCustom);

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
          type === 'APPROVAL_STATUS_CHANGED' ||
          type === 'NEW_APPROVAL_REQUEST' ||
          type === 'PERFORMANCE_UPDATED' ||
          type === 'PERFORMANCE_CALIBRATED' ||
          type === 'PROFILE_UPDATED'
        ) {
          fetchRealtimeDashboardData();
        }

        if (type === 'SCHEDULE_PREFERENCE_UPDATED') {
          const { schedule: syncSched, periodStr: syncPeriod, wfoRatio: syncRatio, hasCustomPrefs: syncHasCustom } = computeRealWeeklySchedule(event.data?.payload || null);
          setWeeklySchedule(syncSched);
          setWeeklyPeriodStr(syncPeriod);
          setWfoRatio(syncRatio);
          setHasCustomWfoPrefs(syncHasCustom);
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
                {liveGreeting},{' '}
                {(() => {
                  const raw = (currentUser.firstName || currentUser.fullName?.split(' ')[0] || 'Karyawan').trim();
                  return raw.charAt(0).toUpperCase() + raw.slice(1);
                })()}! 👋
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
                    Jadwal:{' '}
                    <strong>
                      {(() => {
                        const now = new Date();
                        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
                        if (isWeekend) return 'Libur Akhir Pekan (Weekend)';
                        const todaySched = weeklySchedule.find((s) => s.isToday);
                        return todaySched ? todaySched.location : 'WFO (HQ SCBD Tower Lt. 7)';
                      })()}
                    </strong>
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
            <Link
              href="/karyawan/leave"
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                  SALDO CUTI TAHUNAN
                </span>
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
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
            </Link>

            {/* Card 3: Siklus Penggajian */}
            <Link
              href="/karyawan/payroll"
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                  SIKLUS PENGGAJIAN
                </span>
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
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
            </Link>

            {/* Card 4: Kinerja (Berjalan) */}
            <Link
              href="/karyawan/performance"
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3 hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">
                  KINERJA {performanceKpi.quarterName} (BERJALAN)
                </span>
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                  <span className={performanceKpi.score === '—' ? 'text-slate-400' : 'text-amber-500'}>★</span>
                  <span>{performanceKpi.grade}</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  performanceKpi.score === '—'
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {performanceKpi.okrAchievement}
                </span>
              </div>
            </Link>
          </div>

          {/* SECTION 2: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) matching screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              {/* CARD 1: PENGUMUMAN HRD - Clean Premium & Dynamic Executive Bulletin */}
              {(() => {
                const currentAnnouncement =
                  announcements[activeAnnouncementIdx] || announcements[0];
                const isUrgent = currentAnnouncement?.priority === 'URGENT';
                return (
                  <div
                    onMouseEnter={() => setIsCarouselPaused(true)}
                    onMouseLeave={() => setIsCarouselPaused(false)}
                    className={`group relative rounded-3xl p-6 sm:p-7 text-white shadow-xl transition-all duration-500 overflow-hidden ${
                      isAnnouncementGlowing
                        ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_35px_rgba(251,191,36,0.5)] scale-[1.01]'
                        : ''
                    } ${
                      isUrgent
                        ? 'bg-gradient-to-br from-slate-950 via-rose-950/80 to-slate-900 border border-rose-800/50 shadow-rose-950/20'
                        : 'bg-gradient-to-br from-[#0F172A] via-[#111C38] to-[#0A1128] border border-slate-700/60 shadow-slate-950/20'
                    }`}
                  >
                    {/* Top ambient progress bar */}
                    {announcements.length > 1 && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-300 transition-all duration-75"
                          style={{ width: `${carouselProgress}%` }}
                        />
                      </div>
                    )}

                    {/* Subtle luxury ambient glows */}
                    <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute -left-12 -bottom-12 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-between gap-5 min-h-[160px]">
                      {/* Top Row: Category badge, Doc number, Live HR Sync, and Direct Slide Switcher */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-blue-500/15 border border-blue-400/25 text-blue-300 inline-flex items-center justify-center shadow-xs">
                            <Megaphone className="w-3.5 h-3.5" />
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
                            isUrgent
                              ? 'bg-rose-500/20 text-rose-200 border-rose-400/30'
                              : 'bg-blue-500/15 text-blue-200 border-blue-400/25'
                          }`}>
                            {currentAnnouncement?.badge || 'PENGUMUMAN HRD'}
                          </span>

                          <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                            {currentAnnouncement?.docNumber || 'No. 018/HR-NOTIF/X/2026'}
                          </span>

                          {/* Live SSE / Broadcast Indicator */}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Live HR Sync</span>
                          </span>

                          {isAnnouncementGlowing && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider animate-bounce shadow-md shadow-amber-400/30">
                              ✨ Pengumuman Baru
                            </span>
                          )}
                        </div>

                        {/* Interactive Slide Switcher Pills (Top-Right) */}
                        {announcements.length > 1 && (
                          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 backdrop-blur-md">
                            {announcements.map((item, idx) => (
                              <button
                                key={item.id || idx}
                                type="button"
                                onClick={() => handleSelectAnnouncement(idx)}
                                title={`Beralih ke: ${item.title}`}
                                className={`transition-all duration-300 rounded-full ${
                                  idx === activeAnnouncementIdx
                                    ? 'w-6 h-2 bg-gradient-to-r from-blue-400 to-indigo-300 shadow-xs'
                                    : 'w-2 h-2 bg-white/20 hover:bg-white/50'
                                }`}
                              />
                            ))}
                            {isCarouselPaused && (
                              <span className="text-[9px] font-semibold text-slate-400 pl-1 uppercase tracking-wider">
                                Jeda
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Middle: Title & Summary */}
                      <div className="space-y-1.5 max-w-3xl">
                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                          {currentAnnouncement?.title || 'Ketentuan Core Hours & Fleksibilitas Hybrid Q4 2026'}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
                          {currentAnnouncement?.summary ||
                            'Penyesuaian core hours 08:30 - 16:30 WIB dengan integrasi otomatis Google Calendar dan kepatuhan kuota minimal WFO 60% pekanan.'}
                        </p>
                      </div>

                      {/* Bottom Row: Metadata, Pagination Controls, and Luxury Action Button */}
                      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span>
                            Diterbitkan: <strong className="text-slate-300 font-medium">{currentAnnouncement?.publishedAt}</strong>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span>
                            Otorisasi: <strong className="text-slate-300 font-medium">{currentAnnouncement?.author}</strong>
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          {/* Navigation Controls: Arrows and Indicator */}
                          {announcements.length > 1 && (
                            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                              <button
                                type="button"
                                onClick={handlePrevAnnouncement}
                                className="p-1 hover:bg-white/15 rounded-lg text-slate-300 hover:text-white transition-colors"
                                title="Pengumuman sebelumnya"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span className="text-[11px] font-mono text-slate-300 px-1 font-medium">
                                {activeAnnouncementIdx + 1} / {announcements.length}
                              </span>
                              <button
                                type="button"
                                onClick={handleNextAnnouncement}
                                className="p-1 hover:bg-white/15 rounded-lg text-slate-300 hover:text-white transition-colors"
                                title="Pengumuman berikutnya"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Executive CTA Button */}
                          <button
                            type="button"
                            onClick={() => setIsAnnouncementModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 border border-blue-400/30 transition-all hover:scale-[1.02] active:scale-95 flex-shrink-0 group"
                          >
                            <span>{currentAnnouncement?.buttonText || 'Lihat SE Direksi'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
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
                        (Komitmen Anda: {wfoRatio}%{hasCustomWfoPrefs ? '' : ' • Standar Shift Reguler'})
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

            {/* RIGHT COLUMN (4 COLS) - Private Individual Documents & Tools */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* PINTASAN DOKUMEN MANDIRI (Akses Cepat Dokumen Personal Karyawan) */}
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

      {/* MODAL 3: LIHAT SE DIREKSI (Dynamic Content & Executive Official Format) */}
      {isAnnouncementModalOpen && (() => {
        const currentAnnouncement =
          announcements[activeAnnouncementIdx] || announcements[0];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              {/* Official Document Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      PT NEXORA SOLUSI NUSANTARA • SURAT RESMI
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug pt-1">
                      {currentAnnouncement?.title || 'Surat Edaran Direksi'}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Nomor: {currentAnnouncement?.docNumber || 'No. 018/HR-NOTIF/X/2026'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Meta Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Kategori Klasifikasi</span>
                  <span className="font-bold text-slate-800">{currentAnnouncement?.badge || 'PENGUMUMAN HRD'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Tanggal Efektif</span>
                  <span className="font-bold text-slate-800">{currentAnnouncement?.publishedAt}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block font-medium">Prioritas Regulasi</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    currentAnnouncement?.priority === 'URGENT'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {currentAnnouncement?.priority || 'IMPORTANT'}
                  </span>
                </div>
              </div>

              {/* Document Body */}
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-1">
                  <p className="font-bold text-blue-950 text-[11px] uppercase tracking-wide">Ringkasan Eksekutif:</p>
                  <p className="text-slate-700 leading-relaxed">{currentAnnouncement?.summary}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">Ketentuan & Butir Instruksi Resmi:</p>
                  <div className="whitespace-pre-line text-slate-600 leading-relaxed font-sans">
                    {currentAnnouncement?.content}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Dokumen ini disahkan & diotorisasi oleh <strong>{currentAnnouncement?.author || 'Dewan Direksi'}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600">ID: {currentAnnouncement?.id}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(`Dokumen_${currentAnnouncement?.docNumber?.replace(/[^a-zA-Z0-9]/g, '_') || 'SE_Direksi'}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Unduh Salinan Resmi (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
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
                onClick={() => {
                  try {
                    localStorage.removeItem('nexora_weekly_wfh_preferences');
                  } catch {}
                  const { schedule: resetSched, periodStr: resetPeriod, wfoRatio: resetRatio } = computeRealWeeklySchedule(null);
                  setWeeklySchedule(resetSched);
                  setWeeklyPeriodStr(resetPeriod);
                  setWfoRatio(resetRatio);
                  setHasCustomWfoPrefs(false);
                  try {
                    const bc = new BroadcastChannel('nexora_live_sync');
                    bc.postMessage({ type: 'SCHEDULE_PREFERENCE_UPDATED', payload: null });
                    bc.close();
                  } catch {}
                  setIsWfhPreferenceModalOpen(false);
                  showToast('✓ Preferensi WFH berhasil direset ke standar operasional (100% WFO).');
                }}
                className="mr-auto px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs active:scale-95 transition-all"
              >
                Reset Default WFO
              </button>
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
                  setHasCustomWfoPrefs(true);

                  // Persist to localStorage
                  const prefMap: Record<string, 'WFO' | 'WFH'> = {};
                  weeklySchedule.forEach((item) => {
                    prefMap[item.day] = item.type;
                    if (item.isoDate) prefMap[item.isoDate] = item.type;
                  });
                  try {
                    localStorage.setItem('nexora_weekly_wfh_preferences', JSON.stringify(prefMap));
                  } catch {}

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

      {/* MODAL 5: SLIP GAJI DIGITAL */}
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
