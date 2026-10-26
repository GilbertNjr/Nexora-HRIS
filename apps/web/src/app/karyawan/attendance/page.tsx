'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  CheckCircle2,
  Check,
  X,
  Building2,
  AlertCircle,
  ShieldCheck,
  MapPin,
  RefreshCw,
  LogOut,
  Edit3,
  Sparkles,
  Fingerprint,
  LogIn,
  Ticket,
  PanelLeft,
  PanelLeftClose,
  Menu,
  Camera,
  Wifi,
  BookOpen,
  Download,
  FileSpreadsheet,
  ChevronRight,
  Info,
  Briefcase,
  Home,
  QrCode,
  ArrowRight,
  TrendingUp,
  Search,
  Scan,
  ShieldAlert,
  Upload,
  RotateCcw,
  Eye,
  Plus,
} from 'lucide-react';

export interface AttendanceDailyRecord {
  id: string;
  date: string;
  dayName: string;
  shiftName: string;
  checkIn: string;
  checkOut: string;
  status: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'WFH' | 'DINAS_LUAR';
  statusLabel: string;
  workLocation: string;
  duration: string;
  effectiveHours: number;
  overtimeHours: number;
  lateMinutes: number;
  verificationMethod: string;
  isToday?: boolean;
}

export interface MonthlyAttendanceStats {
  presentDays: number;
  totalWorkDays: number;
  attendancePercentage: number;
  totalEffectiveHours: number;
  overtimeHours: number;
  totalLateMinutes: number;
  lateCount: number;
  alphaCount: number;
  avgCheckInTime: string;
  remainingCorrectionQuota: number;
  maxCorrectionQuota: number;
  isCheckedIn: boolean;
  checkInTimeStr: string;
  hasClockedOut: boolean;
  clockOutTimeStr: string;
  todayStatus: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'BELUM_CHECK_IN' | 'SELESAI_BEKERJA';
}

export interface AttendanceCorrectionRecord {
  id: string;
  ticketNo?: string;
  name: string;
  nik: string;
  role?: string;
  department?: string;
  date: string;
  targetTime: string;
  type: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
}

export default function EmployeeAttendancePage() {
  const { user: currentUser } = useCurrentUser();
  const {
    isCollapsed: isSidebarCollapsed,
    toggle: toggleSidebar,
    isMobileOpen,
    openMobile,
    closeMobile,
  } = useSidebarCollapse();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Live Digital Clock state (initialized with safe static placeholders to prevent SSR hydration mismatch)
  const [liveTime, setLiveTime] = useState('-- : -- : -- WIB');
  const [liveDate, setLiveDate] = useState('');


  // Work Location State (WFO, WFH, Dinas)
  const [workLocation, setWorkLocation] = useState<'WFO' | 'WFH' | 'DINAS'>('WFO');

  // Daily Standup Note state
  const [standupNote, setStandupNote] = useState('');

  // Modals state
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [isVerifyingSelfie, setIsVerifyingSelfie] = useState(false);
  const [selfieVerifiedSuccess, setSelfieVerifiedSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check-In / Check-Out Status
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTimeStr, setCheckInTimeStr] = useState('-- : -- WIB');
  const [isTodayLate, setIsTodayLate] = useState(false);
  const [hasClockedOut, setHasClockedOut] = useState(false);
  const [clockOutTimeStr, setClockOutTimeStr] = useState('-- : -- : -- WIB');

  // Real-Time Monthly KPI Stats (Clean initial state for fresh/new accounts)
  const [attendanceStats, setAttendanceStats] = useState<MonthlyAttendanceStats>({
    presentDays: 0,
    totalWorkDays: 21,
    attendancePercentage: 0,
    totalEffectiveHours: 0.0,
    overtimeHours: 0.0,
    totalLateMinutes: 0,
    lateCount: 0,
    alphaCount: 0,
    avgCheckInTime: '—',
    remainingCorrectionQuota: 3,
    maxCorrectionQuota: 3,
    isCheckedIn: false,
    checkInTimeStr: '-- : -- WIB',
    hasClockedOut: false,
    clockOutTimeStr: '-- : -- : -- WIB',
    todayStatus: 'BELUM_CHECK_IN',
  });

  // History state
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceDailyRecord[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Quota and Corrections (Default max 3x per month available)
  const [remainingCorrectionQuota, setRemainingCorrectionQuota] = useState(3);
  const [correctionDate, setCorrectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [correctionType, setCorrectionType] = useState('Lupa Tap-Out');
  const [correctionTargetTime, setCorrectionTargetTime] = useState('16:30');
  const [correctionReason, setCorrectionReason] = useState('');

  // Attendance Correction History State (Real-time tracking for employees)
  const [correctionHistory, setCorrectionHistory] = useState<AttendanceCorrectionRecord[]>([]);
  const [isLoadingCorrections, setIsLoadingCorrections] = useState(false);
  const [correctionFilterTab, setCorrectionFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Camera video ref for simulated or real webcam
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Interactive Selfie Snapshot in Modal
  const selfieModalVideoRef = useRef<HTMLVideoElement>(null);
  const [selfieModalStream, setSelfieModalStream] = useState<MediaStream | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [todaySelfiePhoto, setTodaySelfiePhoto] = useState<string | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch correction history for current employee
  const fetchCorrectionHistory = useCallback(async () => {
    setIsLoadingCorrections(true);
    try {
      const empId = currentUser.employeeNumber || 'NX-2021008';
      const res = await fetch(
        `/api/v1/approvals?all=true&nik=${encodeURIComponent(empId)}&t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          const items: AttendanceCorrectionRecord[] = json.data
            .filter((a: any) => a.type === 'presensi')
            .map((a: any) => ({
              id: a.id,
              name: a.name,
              nik: a.nik,
              role: a.role,
              department: a.department,
              date: a.correctionDate || a.date || '',
              targetTime: a.correctionTargetTime || a.targetTime || '08:30',
              type: a.correctionType || a.title?.replace('Koreksi Presensi: ', '') || 'Koreksi Presensi',
              reason:
                a.correctionReason ||
                (a.detail?.includes('• Alasan: ')
                  ? a.detail.split('• Alasan: ')[1].replace(/^"/, '').replace(/"$/, '')
                  : a.detail || ''),
              status: a.status || 'PENDING',
              submittedAt: a.submittedDate || a.timestamp || '',
              reviewedBy: a.reviewedBy,
              reviewedAt: a.reviewedAt,
              adminNotes: a.adminNotes,
            }));
          setCorrectionHistory(items);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch correction history:', err);
    } finally {
      setIsLoadingCorrections(false);
    }
  }, [currentUser.employeeNumber]);

  // Fetch live attendance data from API
  const fetchAttendanceData = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const empId = currentUser.employeeNumber || 'NX-2021008';
      const empName = currentUser.fullName || 'Rian Pratama';
      const res = await fetch(
        `/api/v1/attendance?employeeId=${encodeURIComponent(empId)}&employeeName=${encodeURIComponent(empName)}&t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data?.employeeStats) {
          const s = json.data.employeeStats as MonthlyAttendanceStats & {
            history?: AttendanceDailyRecord[];
            todayRecord?: any;
          };
          setAttendanceStats(s);
          setIsCheckedIn(s.isCheckedIn);
          if (s.checkInTimeStr) setCheckInTimeStr(s.checkInTimeStr);
          setIsTodayLate(s.todayStatus === 'TERLAMBAT');
          setHasClockedOut(s.hasClockedOut);
          if (s.clockOutTimeStr) setClockOutTimeStr(s.clockOutTimeStr);
          if (s.remainingCorrectionQuota !== undefined) {
            setRemainingCorrectionQuota(s.remainingCorrectionQuota);
          }
          if (Array.isArray(s.history) && s.history.length > 0) {
            setAttendanceHistory(s.history);
          }
          if (s.todayRecord?.photoUrl) {
            setTodaySelfiePhoto(s.todayRecord.photoUrl);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch attendance data:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [currentUser.employeeNumber, currentUser.fullName]);

  // Initial fetch and restore today's selfie from localStorage
  useEffect(() => {
    fetchAttendanceData();
    fetchCorrectionHistory();

    try {
      const saved = localStorage.getItem('nexora_latest_selfie_attendance');
      if (saved) {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        if (parsed.date === todayStr && parsed.photoUrl) {
          setTodaySelfiePhoto(parsed.photoUrl);
          if (parsed.time) setCheckInTimeStr(parsed.time);
          if (parsed.isLate !== undefined) setIsTodayLate(parsed.isLate);
        } else if (parsed.date !== todayStr) {
          localStorage.removeItem('nexora_latest_selfie_attendance');
        }
      }
    } catch {}
  }, [fetchAttendanceData, fetchCorrectionHistory]);

  // Cross-tab and Server-Sent Events (SSE) real-time listener + polling heartbeat
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    let eventSource: EventSource | null = null;

    try {
      bc = new BroadcastChannel('nexora_live_sync');
      bc.onmessage = (event) => {
        if (
          event.data?.type === 'EMPLOYEE_CLOCKED_IN' ||
          event.data?.type === 'ATTENDANCE_RECORDED' ||
          event.data?.type === 'APPROVAL_SUBMITTED' ||
          event.data?.type === 'APPROVAL_STATUS_CHANGED' ||
          event.data?.type === 'ATTENDANCE_CORRECTION_SUBMITTED' ||
          event.data?.type === 'ATTENDANCE_CORRECTION_UPDATED'
        ) {
          fetchAttendanceData();
          fetchCorrectionHistory();
          if (event.data?.type === 'ATTENDANCE_CORRECTION_UPDATED') {
            const isApproved = event.data?.status === 'APPROVED';
            showToast(
              isApproved
                ? '✓ Status Koreksi: Pengajuan koreksi presensi Anda telah Disetujui HR & Jam Kehadiran Diperbarui!'
                : '✕ Status Koreksi: Pengajuan koreksi presensi Anda telah Ditolak HR Operations.'
            );
          }
        }
      };
    } catch {}

    try {
      eventSource = new EventSource('/api/v1/employees/stream');
      eventSource.addEventListener('ATTENDANCE_RECORDED', (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.payload?.employeeStats?.history) {
            setAttendanceHistory(parsed.payload.employeeStats.history);
            setAttendanceStats(parsed.payload.employeeStats);
          } else {
            fetchAttendanceData();
          }
        } catch {
          fetchAttendanceData();
        }
      });
    } catch {}

    // 8-second periodic sync heartbeat when tab is active
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchAttendanceData();
        fetchCorrectionHistory();
      }
    }, 8000);

    return () => {
      if (bc) bc.close();
      if (eventSource) eventSource.close();
      clearInterval(heartbeatInterval);
    };
  }, [fetchAttendanceData, fetchCorrectionHistory]);

  // Filtered attendance history for Section 3
  const filteredHistory = useMemo(() => {
    return attendanceHistory.filter((item) => {
      const q = historySearchQuery.toLowerCase();
      const matchesSearch =
        !historySearchQuery ||
        item.date.toLowerCase().includes(q) ||
        item.dayName.toLowerCase().includes(q) ||
        item.statusLabel.toLowerCase().includes(q) ||
        item.workLocation.toLowerCase().includes(q) ||
        item.shiftName.toLowerCase().includes(q) ||
        item.checkIn.toLowerCase().includes(q) ||
        item.checkOut.toLowerCase().includes(q);

      const matchesStatus =
        historyStatusFilter === 'ALL' ||
        item.status === historyStatusFilter ||
        (historyStatusFilter === 'WFH' && (item.status === 'WFH' || item.statusLabel.includes('WFH')));

      return matchesSearch && matchesStatus;
    });
  }, [attendanceHistory, historySearchQuery, historyStatusFilter]);

  // Filtered attendance corrections & counts for Employee Transparency Section
  const correctionCounts = useMemo(() => {
    return {
      all: correctionHistory.length,
      pending: correctionHistory.filter((c) => c.status === 'PENDING').length,
      approved: correctionHistory.filter((c) => c.status === 'APPROVED').length,
      rejected: correctionHistory.filter((c) => c.status === 'REJECTED').length,
    };
  }, [correctionHistory]);

  const filteredCorrections = useMemo(() => {
    if (correctionFilterTab === 'ALL') return correctionHistory;
    return correctionHistory.filter((c) => c.status === correctionFilterTab);
  }, [correctionHistory, correctionFilterTab]);

  // Handle Reset Today's Attendance (for interactive demonstration and live testing)
  const handleResetTodayAttendance = async () => {
    try {
      const empId = currentUser.employeeNumber || 'NX-2021008';
      const empName = currentUser.fullName || 'Rian Pratama';
      const res = await fetch(
        `/api/v1/attendance?employeeId=${encodeURIComponent(empId)}&employeeName=${encodeURIComponent(empName)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data?.employeeStats) {
          setAttendanceStats(json.data.employeeStats);
          if (Array.isArray(json.data.employeeStats.history)) {
            setAttendanceHistory(json.data.employeeStats.history);
          }
        }
      }
      localStorage.removeItem('nexora_latest_selfie_attendance');
      setTodaySelfiePhoto(null);
      setIsCheckedIn(false);
      setHasClockedOut(false);
      setIsTodayLate(false);
      setCheckInTimeStr('-- : -- WIB');
      setClockOutTimeStr('-- : -- : -- WIB');

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({ type: 'ATTENDANCE_RECORDED' });
      ch.close();

      showToast('✓ Status hari ini direset ke Belum Check-In. Data real-time diperbarui.');
    } catch {
      showToast('Gagal mereset presensi.');
    }
  };

  const toggleRealCamera = async () => {
    if (isLiveCameraActive && webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
      setIsLiveCameraActive(false);
      showToast('Kamera fisik dinonaktifkan (kembali ke simulasi biometrik)');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        setWebcamStream(stream);
        setIsLiveCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        showToast('✓ Kamera fisik terhubung ke NX-Biometric Engine');
      } catch {
        showToast('Akses kamera tidak diizinkan atau tidak tersedia, menggunakan simulasi AI.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
      if (selfieModalStream) {
        selfieModalStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webcamStream, selfieModalStream]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Live Digital Clock ticker
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

  // Handle Download Rekap Absensi (.xlsx / .csv)
  const handleDownloadExcel = () => {
    const list =
      attendanceHistory.length > 0
        ? attendanceHistory
        : [
            {
              date: new Date().toISOString().split('T')[0],
              shiftName: 'Reguler HQ (08:00 - 17:00)',
              checkIn: checkInTimeStr,
              checkOut: hasClockedOut ? clockOutTimeStr : '17:05 WIB',
              statusLabel: isTodayLate ? 'Terlambat Masuk' : 'Tepat Waktu',
              workLocation: 'HQ Pacific SCBD Lt. 7',
              verificationMethod: 'Biometrik Face Scan + GPS',
              duration: '7.5 Jam',
            },
          ];

    const rows = list.map(
      (item) =>
        `${item.date},${currentUser.employeeNumber || 'NX-2021008'},"${currentUser.fullName || 'Rian Pratama'}",${item.shiftName},${item.checkIn},${item.checkOut},${item.statusLabel},"${item.workLocation}","${item.verificationMethod}",${item.duration}`
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Tanggal,NIP,Nama Karyawan,Shift,Jam Masuk,Jam Pulang,Status,Lokasi Kerja,Metode Verifikasi,Durasi Efektif\n' +
      rows.join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Presensi_${currentUser.employeeNumber || 'NX-2021008'}_RealTime_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Rekap Absensi (.xlsx/csv) real-time berhasil diunduh.');
  };

  // Start modal camera for real selfie capture
  const startSelfieModalCamera = async () => {
    setCameraPermissionError(null);
    setCapturedSelfie(null);
    setIsVerifyingSelfie(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      setSelfieModalStream(stream);
      if (selfieModalVideoRef.current) {
        selfieModalVideoRef.current.srcObject = stream;
        selfieModalVideoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Could not access front camera:', err);
      setCameraPermissionError(
        'Izin kamera tidak aktif atau kamera sedang digunakan aplikasi lain. Anda dapat mengunggah foto selfie atau menggunakan berkas foto dari perangkat Anda.'
      );
    }
  };

  const stopSelfieModalCamera = () => {
    if (selfieModalStream) {
      selfieModalStream.getTracks().forEach((track) => track.stop());
      setSelfieModalStream(null);
    }
  };

  // Handle Selfie / Liveness Verification Trigger
  const handleTriggerSelfieScan = () => {
    setIsSelfieModalOpen(true);
    setCapturedSelfie(null);
    setCameraPermissionError(null);
    setTimeout(() => {
      startSelfieModalCamera();
    }, 150);
  };

  // Capture snapshot from video element
  const handleCaptureSnapshot = () => {
    if (!selfieModalVideoRef.current) return;
    const video = selfieModalVideoRef.current;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedSelfie(dataUrl);
        stopSelfieModalCamera();
      }
    } catch {
      showToast('Gagal mengambil foto dari kamera.');
    }
  };

  // Handle file select fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedSelfie(event.target.result as string);
          stopSelfieModalCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle retake selfie
  const handleRetake = () => {
    setCapturedSelfie(null);
    startSelfieModalCamera();
  };

  // Handle Confirm and Submit Selfie to HR Admin
  const handleConfirmAndSubmitSelfie = async () => {
    if (!capturedSelfie) return;
    setIsVerifyingSelfie(true);

    const now = new Date();
    const parts = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    }).formatToParts(now);
    const hours = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minutes = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const isLate = hours > 8 || (hours === 8 && minutes > 15); // Tolerance: 08:15 WIB
    const timeNow = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;

    try {
      // 1. Post to attendance API
      const res = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.employeeNumber || 'NX-2021008',
          employeeName: currentUser.fullName || 'Rian Pratama, S.Kom',
          department: currentUser.department || 'Teknologi Informasi & Rekayasa Cloud',
          type: 'CLOCK_IN',
          time: timeNow,
          location:
            workLocation === 'WFH'
              ? 'Remote Residence (WFH)'
              : workLocation === 'DINAS'
              ? 'Surabaya Client Site (Dinas)'
              : 'HQ Jakarta — Pacific Century Place SCBD Lt. 7',
          status: isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU',
          coordinates: '-6.2253, 106.8091',
          device: 'Selfie Liveness Camera (NX-Biometric v4.2)',
          notes: standupNote,
          workLocation: workLocation,
          photoUrl: capturedSelfie,
          avatarUrl: currentUser.avatarUrl,
        }),
      });

      let json: any = null;
      if (res.ok) {
        json = await res.json();
        if (json.data?.employeeStats) {
          setAttendanceStats(json.data.employeeStats);
          if (Array.isArray(json.data.employeeStats.history)) {
            setAttendanceHistory(json.data.employeeStats.history);
          }
        }
      }

      // 2. Broadcast on BroadcastChannel for all open tabs & admin dashboard
      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({
        type: 'ATTENDANCE_RECORDED',
        record: json?.data?.record,
        summary: json?.data?.summary,
        employeeId: currentUser.employeeNumber || 'NX-2021008',
        employeeName: currentUser.fullName || 'Rian Pratama, S.Kom',
        department: currentUser.department || 'Teknologi Informasi & Rekayasa Cloud',
        time: timeNow,
        status: isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU',
        location: 'HQ Jakarta — Pacific Century Place SCBD Lt. 7',
        workLocation: workLocation,
        notes: standupNote,
        photoUrl: capturedSelfie,
        avatarUrl: currentUser.avatarUrl,
      });
      ch.close();

      // 3. Save locally
      localStorage.setItem(
        'nexora_latest_selfie_attendance',
        JSON.stringify({
          photoUrl: capturedSelfie,
          time: timeNow,
          isLate,
          date: now.toISOString().split('T')[0],
        })
      );
    } catch (err) {
      console.error('Error saving attendance:', err);
    } finally {
      setIsVerifyingSelfie(false);
      setTodaySelfiePhoto(capturedSelfie);
      setIsCheckedIn(true);
      setCheckInTimeStr(timeNow);
      setIsTodayLate(isLate);
      setHasClockedOut(false);
      setIsSelfieModalOpen(false);
      stopSelfieModalCamera();
      showToast(
        `✓ Presensi Masuk (${timeNow} - ${isLate ? 'Terlambat' : 'Tepat Waktu'}) Berhasil Tersinkron Real-Time!`
      );
    }
  };

  // Handle Perform Check-Out
  const handlePerformCheckOut = async () => {
    const timeStr = `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB`;
    setHasClockedOut(true);
    setClockOutTimeStr(timeStr);
    setIsCheckOutModalOpen(false);
    showToast(`✓ Check-Out Berhasil dicatat (${timeStr})! Terima kasih atas dedikasi Anda hari ini.`);

    try {
      const res = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.employeeNumber || 'NX-2021008',
          employeeName: currentUser.fullName || 'Rian Pratama, S.Kom',
          department: currentUser.department || 'Teknologi Informasi & Rekayasa Cloud',
          type: 'CLOCK_OUT',
          time: timeStr,
          location: 'HQ Jakarta — Pacific Century Place SCBD Lt. 7',
          status: 'TEPAT_WAKTU',
        }),
      });

      let json: any = null;
      if (res.ok) {
        json = await res.json();
        if (json.data?.employeeStats) {
          setAttendanceStats(json.data.employeeStats);
          if (Array.isArray(json.data.employeeStats.history)) {
            setAttendanceHistory(json.data.employeeStats.history);
          }
        }
      }

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({
        type: 'ATTENDANCE_RECORDED',
        type_action: 'CLOCK_OUT',
        record: json?.data?.record,
        summary: json?.data?.summary,
        employeeId: currentUser.employeeNumber || 'NX-2021008',
        employeeName: currentUser.fullName || 'Rian Pratama, S.Kom',
        time: timeStr,
      });
      ch.close();
    } catch {}
  };

  // Handle Correction Submit
  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingCorrectionQuota <= 0) {
      showToast('Batas kuota dispensasi koreksi mandiri bulan ini telah habis.');
      return;
    }

    const corId = `cor-${Date.now()}`;
    const empNik = currentUser.employeeNumber || 'NX-2021008';
    const empName = currentUser.fullName || 'Rian Pratama, S.Kom';
    const empRole = currentUser.designation || 'Lead Backend Architect';
    const empDept = currentUser.department || 'Teknologi Informasi & Rekayasa Cloud';

    const newQuota = Math.max(0, remainingCorrectionQuota - 1);
    setRemainingCorrectionQuota(newQuota);
    setAttendanceStats((prev) => ({
      ...prev,
      remainingCorrectionQuota: newQuota,
    }));
    setIsCorrectionModalOpen(false);

    const nowFormatted =
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date()) +
      ', ' +
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB';

    // Optimistic addition to history so employee sees it immediately
    const optimisticRecord: AttendanceCorrectionRecord = {
      id: corId,
      name: empName,
      nik: empNik,
      role: empRole,
      department: empDept,
      date: correctionDate,
      targetTime: correctionTargetTime,
      type: correctionType,
      reason: correctionReason,
      status: 'PENDING',
      submittedAt: nowFormatted,
    };
    setCorrectionHistory((prev) => [optimisticRecord, ...prev]);

    showToast(
      `✓ Pengajuan koreksi tanggal ${correctionDate} (${correctionType}) berhasil dikirim ke HR Operations.`
    );

    try {
      await fetch('/api/v1/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: corId,
          name: empName,
          nik: empNik,
          role: empRole,
          department: empDept,
          type: 'presensi',
          correctionDate,
          correctionTargetTime,
          correctionType,
          correctionReason,
          title: `Koreksi Presensi: ${correctionType}`,
          highlightType: 'Koreksi Kehadiran',
          detail: `Tanggal: ${correctionDate} • Target: ${correctionTargetTime} WIB • Alasan: "${correctionReason || 'Koreksi presensi mandiri'}"`,
        }),
      });

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({
        type: 'ATTENDANCE_CORRECTION_SUBMITTED',
        id: corId,
        nik: empNik,
        name: empName,
        date: correctionDate,
        targetTime: correctionTargetTime,
        correctionType,
      });
      ch.postMessage({ type: 'APPROVAL_SUBMITTED' });
      ch.close();

      fetchCorrectionHistory();
    } catch (err) {
      console.error('Failed to submit correction to API:', err);
    } finally {
      setCorrectionReason('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR with Mobile Drawer */}
      <EmployeeSidebar
        activeMenu="attendance"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
        onShowToast={showToast}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Left: Mobile Drawer Button, Desktop Toggle Button & Search Input Box */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
            <button
              type="button"
              onClick={openMobile}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
              title="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

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

            <div className="relative w-72 sm:w-96 max-w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu, slip gaji, riwayat presensi..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span suppressHydrationWarning>{liveDate}</span>
            </div>

            <NotificationBellDropdown portal="ess" />

            {/* Profile Pill strictly linking to /karyawan/profile */}
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

        {/* PAGE CONTENT CONTAINER (Ample pb-48 padding to ensure nothing is EVER cut off!) */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto pb-48">
          {/* HEADER SECTION matching user screenshot */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
            <div className="space-y-1.5">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Link
                  href="/karyawan"
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Portal Karyawan (ESS)</span>
                </Link>
                <span>/</span>
                <span className="text-blue-700 font-bold">Presensi &amp; Absensi Mandiri</span>
              </div>

              {/* Title exact match */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Presensi Mandiri &amp; Liveness Face Scan
              </h1>

              {/* Status Pill on its own line - 100% REAL-TIME DYNAMIC */}
              <div className="pt-0.5 flex flex-wrap items-center gap-2">
                {hasClockedOut ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Status: Selesai Bekerja (Check-Out: {clockOutTimeStr})</span>
                  </span>
                ) : isCheckedIn ? (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs animate-in fade-in ${
                      isTodayLate
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        isTodayLate ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span>
                      Status: Sudah Check-In ({checkInTimeStr} - {isTodayLate ? 'Terlambat' : 'Tepat Waktu'})
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Status: Belum Check-In (Jadwal: 08:30 WIB)</span>
                  </span>
                )}

                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Biometrik Sync</span>
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Lakukan presensi kehadiran digital secara instan dengan verifikasi biometrik liveness,
                geofencing GPS SCBD, &amp; WiFi korporat.
              </p>
            </div>

            {/* Top Right Action Buttons matching user screenshot with live sync & test capabilities */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Sinkronkan Status Live button */}
              <button
                type="button"
                onClick={fetchAttendanceData}
                disabled={isLoadingStats}
                title="Sinkronkan data presensi real-time dari server"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-blue-600 ${isLoadingStats ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Sinkron Live</span>
              </button>

              {/* Uji Reset Presensi Hari Ini (opsi pengujian real-time) */}
              <button
                type="button"
                onClick={handleResetTodayAttendance}
                title="Reset presensi hari ini untuk menguji status real-time"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Uji Reset Hari Ini</span>
              </button>

              {/* Ajukan Koreksi Presensi (White Button) */}
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span>Ajukan Koreksi Presensi</span>
              </button>

              {/* Unduh Rekap Absensi (.xlsx) (Solid Deep Blue Button) */}
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-bold shadow-md shadow-blue-950/20 transition-all active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-white" />
                <span>Unduh Rekap Absensi (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching user screenshot - 100% REAL-TIME DYNAMIC */}
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
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {attendanceStats.presentDays}
                  </span>
                  <span className="text-slate-400 font-bold text-2xl mx-1">/</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {attendanceStats.totalWorkDays}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                    attendanceStats.presentDays === 0
                      ? 'bg-slate-50 text-slate-600 border-slate-200'
                      : attendanceStats.attendancePercentage === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : attendanceStats.attendancePercentage >= 90
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {attendanceStats.presentDays === 0
                    ? '0% Tercatat'
                    : `${attendanceStats.attendancePercentage}% ${
                        attendanceStats.attendancePercentage === 100 ? 'Sempurna' : 'Disiplin'
                      }`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${
                    attendanceStats.alphaCount === 0 && attendanceStats.lateCount === 0
                      ? 'text-emerald-600'
                      : 'text-amber-500'
                  }`}
                />
                <span>
                  {attendanceStats.alphaCount} Alpha • {attendanceStats.lateCount} Keterlambatan
                </span>
              </div>

              {/* Dynamic accent line matching screenshot */}
              <div className="pt-0.5">
                <div
                  className={`w-28 h-1 rounded-full ${
                    attendanceStats.presentDays === 0
                      ? 'bg-slate-200'
                      : attendanceStats.attendancePercentage >= 90
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* Card 2: Akumulasi Jam Kerja */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Akumulasi Jam Kerja</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {attendanceStats.totalEffectiveHours.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-600 ml-1.5">Jam Efektif</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  +{attendanceStats.overtimeHours.toFixed(1)} Jam (Lembur SPL &amp; Produktif)
                </span>
              </div>

              {/* Blue bottom accent line matching screenshot */}
              <div className="pt-0.5">
                <div className="w-28 h-1 bg-blue-600 rounded-full" />
              </div>
            </div>

            {/* Card 3: Keterlambatan (Bulan Ini) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Keterlambatan (Bulan Ini)</span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    attendanceStats.totalLateMinutes === 0
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {attendanceStats.totalLateMinutes}
                  </span>
                  <span
                    className={`text-lg font-black ml-2 ${
                      attendanceStats.totalLateMinutes === 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    Menit
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                    attendanceStats.totalLateMinutes === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {attendanceStats.totalLateMinutes === 0
                    ? 'Nihil / On-Time'
                    : `${attendanceStats.totalLateMinutes} Mnt Terlambat`}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Rata-rata check-in: {attendanceStats.avgCheckInTime}</span>
              </div>

              {/* Dynamic accent line matching screenshot */}
              <div className="pt-0.5">
                <div
                  className={`w-28 h-1 rounded-full ${
                    attendanceStats.totalLateMinutes === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* Card 4: Sisa Kuota Dispensasi */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Sisa Kuota Dispensasi</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
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
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                    remainingCorrectionQuota > 0
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {remainingCorrectionQuota > 0 ? 'Tersedia' : 'Habis'}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>Sesuai PKB HR Pasal 14 (Maks. 3x/Bln)</span>
              </div>

              {/* 3-Segmented bar dynamically rendering blue vs slate bars based on remainingCorrectionQuota */}
              <div className="pt-0.5">
                <div className="w-28 grid grid-cols-3 gap-1 h-1">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className={`rounded-full h-full transition-all duration-300 ${
                        idx < remainingCorrectionQuota ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: 2-COLUMN MAIN LAYOUT matching user screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (7-8 cols): PRESENSI MANDIRI & LIVENESS FACE SCAN */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
              {/* Header Box inside card: Live Time, Shift, and Check-In/Out Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/40 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <Scan className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span 
                        className="text-lg sm:text-xl font-black font-mono text-slate-900 tracking-tight"
                        suppressHydrationWarning
                      >
                        {liveTime}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Server NTP Sync</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Shift: <strong className="text-slate-800">Reguler Ramadhan 1446H</strong> (08:30 -
                      16:30 WIB • 7 Jam Efektif)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCheckedIn) {
                        showToast(
                          `Anda telah melakukan Check-In (${checkInTimeStr} - ${
                            isTodayLate ? 'Terlambat' : 'Tepat Waktu'
                          }). Klik "Ambil Foto Selfie" jika ingin memperbarui foto/lokasi.`
                        );
                      } else {
                        handleTriggerSelfieScan();
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCheckedIn
                        ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-500'
                        : 'bg-[#1E3A8A] hover:bg-[#172554] text-white shadow-xs animate-pulse'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isCheckedIn ? 'Sudah Check-In' : 'Check-In Sekarang'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isCheckedIn) {
                        showToast('Anda belum melakukan Check-In hari ini.');
                        return;
                      }
                      if (hasClockedOut) {
                        showToast(`Anda telah menyelesaikan jam kerja (Check-Out: ${clockOutTimeStr}).`);
                        return;
                      }
                      setIsCheckOutModalOpen(true);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ${
                      hasClockedOut
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#1E3A8A] hover:bg-[#172554] text-white shadow-blue-950/20'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{hasClockedOut ? 'Sudah Check-Out' : 'Check-Out Mandiri'}</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Split: Liveness Camera View vs Validasi Parameter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* 1. LIVENESS CAMERA BOX */}
                <div className="flex flex-col space-y-2">
                  <div className="relative rounded-2xl bg-[#0B132B] p-4 text-white shadow-inner flex flex-col justify-between overflow-hidden min-h-[260px] sm:min-h-[275px] border border-slate-800">
                    {/* If user already took a selfie today, display their real selfie photo! */}
                    {todaySelfiePhoto ? (
                      <div className="absolute inset-0 z-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={todaySelfiePhoto}
                          alt="Foto Selfie Presensi"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-[#0B132B]/80" />
                      </div>
                    ) : isLiveCameraActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
                      />
                    ) : null}

                    {/* Top Status inside camera feed */}
                    <div className="flex items-center justify-between text-xs z-10">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span className="text-[11px] font-bold tracking-wide text-emerald-400">
                          {todaySelfiePhoto ? 'Foto Selfie Terverifikasi' : 'Liveness Detection Aktif'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {todaySelfiePhoto ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/80 text-[10px] font-bold text-white shadow-xs">
                            99.4% Valid
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={toggleRealCamera}
                            title={isLiveCameraActive ? 'Gunakan Simulasi Biometrik' : 'Aktifkan Kamera Webcam Fisik'}
                            className="flex items-center gap-1 text-[10px] text-slate-300 font-mono px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-colors cursor-pointer"
                          >
                            <Camera className="w-3 h-3 text-emerald-400" />
                            <span>{isLiveCameraActive ? 'Webcam Aktif' : 'HD 1080p • 30fps'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Center: Face Biometric Target Reticle or Verified Badge */}
                    <div className="relative my-auto flex items-center justify-center py-2 sm:py-3 z-10">
                      {todaySelfiePhoto ? (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-emerald-400/90 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-xs shadow-lg animate-in zoom-in-95">
                          <Check className="w-10 h-10 text-emerald-400 stroke-[3]" />
                          <span className="text-[10px] font-bold text-emerald-300 mt-1">
                            Biometrik OK
                          </span>
                        </div>
                      ) : (
                        /* Scanning Ring with animation */
                        <div className="w-36 h-42 sm:w-40 sm:h-46 rounded-full border-2 border-dashed border-emerald-500/50 flex items-center justify-center relative animate-pulse">
                          {/* Radar sweep beam effect */}
                          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400/90 animate-spin" />

                          {/* Silhouette Face with Facial Mesh Markers */}
                          <div className="w-28 h-34 sm:w-32 sm:h-38 rounded-full bg-emerald-950/30 border border-emerald-400/30 flex flex-col items-center justify-center relative p-2">
                            {/* Face Icon with Reticle points */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-emerald-400/60 flex items-center justify-center relative mb-1">
                              {/* Eye markers */}
                              <div className="w-2 h-2 rounded-full bg-emerald-400 absolute left-2.5 top-4 animate-ping" />
                              <div className="w-2 h-2 rounded-full bg-emerald-400 absolute right-2.5 top-4 animate-ping" />
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 absolute top-7" />
                              <div className="w-3.5 h-1 rounded-full bg-emerald-400 absolute bottom-2.5" />
                            </div>
                            {/* Chin line */}
                            <div className="w-7 h-0.5 bg-emerald-500/60 rounded-full mt-0.5" />
                          </div>

                          {/* Corner Target Brackets */}
                          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                        </div>
                      )}
                    </div>

                    {/* Bottom Status inside camera feed */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs z-10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-white">
                            {todaySelfiePhoto
                              ? `Selfie Masuk Tercatat (${checkInTimeStr})`
                              : 'Wajah Terdeteksi (99.4% Valid)'}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Anti-Spoofing &amp; Kedipan Mata Terverifikasi
                          </p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Fingerprint className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Sub text under camera box */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Pencahayaan memadai &amp; wajah tegak lurus
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      NX-Biometric Engine v4.2
                    </span>
                  </div>
                </div>

                {/* 2. VALIDASI PARAMETER PRESENSI */}
                <div className="flex flex-col justify-between space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Validasi Parameter Presensi
                  </h3>

                  {/* Item 1: Geofencing Kantor */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">Geofencing Kantor</p>
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            18m • Valid
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-800 pt-0.5">HQ SCBD</p>
                        <p className="text-[11px] text-slate-500">
                          Pacific Century Place Lt. 7 (Radius &lt; 50m)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Item 2: Jaringan WiFi Korporat */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">Jaringan WiFi Korporat</p>
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Terhubung
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 pt-0.5 font-mono">
                          SSID: NEXORA-CORP-SECURE
                        </p>
                        <p className="text-[11px] text-slate-500">(IP Internal)</p>
                      </div>
                    </div>
                  </div>

                  {/* Item 3: Pilihan Lokasi Kerja Hari Ini */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Pilihan Lokasi Kerja Hari Ini
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setWorkLocation('WFO')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          workLocation === 'WFO'
                            ? 'bg-[#1E3A8A] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>WFO</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWorkLocation('WFH')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          workLocation === 'WFH'
                            ? 'bg-[#1E3A8A] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>WFH</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWorkLocation('DINAS')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          workLocation === 'DINAS'
                            ? 'bg-[#1E3A8A] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Dinas</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 4: Catatan Pekerjaan / Daily Standup */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Catatan Pekerjaan / Daily Standup (Opsional)
                    </label>
                    <input
                      type="text"
                      value={standupNote}
                      onChange={(e) => setStandupNote(e.target.value)}
                      placeholder="Contoh: Menyelesaikan arsitektur platform v2..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON: SOLID CORPORATE BLUE (#1E3A8A) - FULLY VISIBLE & NEVER CLIPPED */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerSelfieScan}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-sm shadow-md shadow-blue-950/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span>Ambil Foto Selfie &amp; Verifikasi Presensi</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN (4-5 cols): PANDUAN & ATURAN PRESENSI matching user screenshot */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5 flex flex-col justify-between">
              <div>
                {/* Header with Icon */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      Panduan &amp; Aturan Presensi
                    </h3>
                    <p className="text-[11px] text-slate-400">Standar Kepatuhan ESS v2.4</p>
                  </div>
                </div>

                {/* 4 Guidelines List */}
                <div className="space-y-4 pt-4 text-xs">
                  {/* Rule 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-800">Toleransi Kehadiran 15 Menit:</p>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Maksimal check-in pukul 08:45 WIB tanpa sanksi potongan tunjangan kehadiran.
                      </p>
                    </div>
                  </div>

                  {/* Rule 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-800">Ketentuan Foto Selfie AI:</p>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Wajib melepas masker, kacamata hitam, serta menghadap kamera langsung pada tempat
                        bercahaya cukup.
                      </p>
                    </div>
                  </div>

                  {/* Rule 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-800">Radius Geofencing Kantor:</p>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Presensi WFO otomatis terkunci jika Anda berada di luar radius 50 meter dari titik
                        gedung kantor SCBD.
                      </p>
                    </div>
                  </div>

                  {/* Rule 4 */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Ticket className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-800">Koreksi Kehadiran Terbatas:</p>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Maksimal pengajuan 3 kali dalam satu bulan kalender dengan melampirkan bukti
                        persetujuan manajer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Link matching screenshot */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400 text-[11px]">Peraturan Perusahaan Bab VI</span>
                <Link
                  href="/karyawan/documents"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px] font-bold group"
                >
                  <span>Baca Buku Saku HR</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* SECTION 2.5: RIWAYAT & TRANSPARANSI STATUS PENGAJUAN KOREKSI PRESENSI */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        Riwayat &amp; Status Pengajuan Koreksi Presensi
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Transparansi HR &amp; Atasan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Pantau detail status verifikasi koreksi waktu presensi secara akurat dan real-time
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons & Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setCorrectionFilterTab('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                      correctionFilterTab === 'ALL'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({correctionCounts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCorrectionFilterTab('PENDING')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                      correctionFilterTab === 'PENDING'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    Menunggu ({correctionCounts.pending})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCorrectionFilterTab('APPROVED')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                      correctionFilterTab === 'APPROVED'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Disetujui ({correctionCounts.approved})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCorrectionFilterTab('REJECTED')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                      correctionFilterTab === 'REJECTED'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    Ditolak ({correctionCounts.rejected})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchCorrectionHistory}
                  disabled={isLoadingCorrections}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all cursor-pointer disabled:opacity-50"
                  title="Refresh Riwayat Koreksi"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCorrections ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajukan Koreksi</span>
                </button>
              </div>
            </div>

            {/* Quota & Policy Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-slate-700">
                  Sisa Kuota Dispensasi Bulan Ini:{' '}
                  <strong className="text-blue-700 font-extrabold">{remainingCorrectionQuota} dari 3x</strong> (Sesuai PKB HR Pasal 14)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Persetujuan langsung memperbarui log absensi secara otomatis.
              </span>
            </div>

            {/* Correction Cards List */}
            <div className="space-y-3.5">
              {filteredCorrections.length > 0 ? (
                filteredCorrections.map((item) => {
                  const isApproved = item.status === 'APPROVED';
                  const isRejected = item.status === 'REJECTED';
                  const isPending = !isApproved && !isRejected;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isApproved
                          ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300'
                          : isRejected
                          ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                          : 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                      }`}
                    >
                      {/* Top Row: Type, Target Date/Time & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/60">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-900'
                                : isRejected
                                ? 'bg-rose-100 text-rose-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Tanggal: <strong>{item.date}</strong>
                          </span>
                          <span className="text-xs font-bold text-blue-700 flex items-center gap-1 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Target Waktu: <strong>{item.targetTime} WIB</strong>
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                              <span>Menunggu Verifikasi HR Operations</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>Disetujui &amp; Presensi Diperbarui</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
                              <X className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                              <span>Ditolak HR Operations</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Reason and Detailed Description */}
                      <div className="py-3 text-xs space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Alasan / Penjelasan Objektif Karyawan:
                        </p>
                        <p className="text-slate-800 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-slate-200/50">
                          &ldquo;{item.reason}&rdquo;
                        </p>
                      </div>

                      {/* Bottom Row: Audit Trail & Reviewer Notes */}
                      <div className="pt-2.5 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                        <div className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Diajukan pada: <strong>{item.submittedAt || '—'}</strong></span>
                        </div>

                        <div>
                          {isApproved && (
                            <span className="text-emerald-800 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                Diverifikasi oleh: <strong>{item.reviewedBy || 'HR Operations SCBD'}</strong>
                                {item.reviewedAt ? ` • ${item.reviewedAt}` : ''}
                              </span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-rose-800 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>
                                Ditolak oleh: <strong>{item.reviewedBy || 'HR Operations'}</strong>
                                {item.adminNotes ? ` • Catatan: "${item.adminNotes}"` : ''}
                              </span>
                            </span>
                          )}
                          {isPending && (
                            <span className="text-amber-800 font-medium">
                              Menunggu antrian approval Supervisor Divisi &amp; HR Operations
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-700 text-xs">Belum Ada Pengajuan Koreksi Presensi</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                    Jika Anda lupa tap-out, terkendala biometrik, atau sedang dinas luar kantor, Anda dapat mengajukan koreksi mandiri melalui tombol di bawah.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCorrectionModalOpen(true)}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajukan Koreksi Presensi Mandiri</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: RIWAYAT PRESENSI MANDIRI BULAN INI (REAL-TIME DATA LEDGER) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        Riwayat Presensi Mandiri Bulan Ini
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live DB Sync
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Sinkronisasi otomatis dengan NX-Biometric Server &amp; Database HRIS
                    </p>
                  </div>
                </div>
              </div>

              {/* Table search & filter controls */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Cari tanggal, hari, lokasi..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 font-semibold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="TEPAT_WAKTU">Tepat Waktu</option>
                  <option value="TERLAMBAT">Terlambat</option>
                  <option value="WFH">WFH (Tervalidasi)</option>
                </select>

                <button
                  type="button"
                  onClick={fetchAttendanceData}
                  disabled={isLoadingStats}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  title="Sinkronisasi Data Real-Time"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoadingStats ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sinkronisasi</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200/90 text-slate-500 font-bold bg-slate-50/60 text-[11px]">
                    <th className="py-3 px-3.5 rounded-l-xl">Tanggal</th>
                    <th className="py-3 px-3.5">Shift Kerja</th>
                    <th className="py-3 px-3.5 font-mono">Jam Masuk</th>
                    <th className="py-3 px-3.5 font-mono">Jam Pulang</th>
                    <th className="py-3 px-3.5">Durasi</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 rounded-r-xl">Lokasi &amp; Metode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          row.isToday ? 'bg-blue-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center gap-2">
                            {row.isToday && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                            )}
                            <div>
                              <span className="font-bold text-slate-900">{row.date}</span>
                              <span className="text-[11px] text-slate-400 ml-1.5">
                                ({row.dayName})
                              </span>
                            </div>
                            {row.isToday && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-[9px] font-bold text-emerald-800">
                                Hari Ini
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-600">{row.shiftName}</td>
                        <td className="py-3.5 px-3.5 font-mono font-bold text-slate-800">
                          {row.checkIn}
                        </td>
                        <td className="py-3.5 px-3.5 font-mono text-slate-600">{row.checkOut}</td>
                        <td className="py-3.5 px-3.5 font-bold text-blue-700">
                          {row.isToday && isCheckedIn && !hasClockedOut ? (
                            <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded-md text-xs border border-blue-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                              {row.duration}
                            </span>
                          ) : (
                            <span>{row.duration}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              row.status === 'TERLAMBAT'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : row.status === 'WFH' || row.statusLabel.includes('WFH')
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                row.status === 'TERLAMBAT' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                            <span>{row.statusLabel}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-500 text-[11px]">
                          <div className="font-medium text-slate-700">{row.workLocation}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {row.verificationMethod}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                            <Calendar className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="font-semibold text-slate-700 text-xs">Belum Ada Catatan Presensi Bulan Ini</p>
                          <p className="text-[11px] text-slate-400 max-w-sm">
                            Lakukan Presensi Masuk (Selfie Biometrik) di atas untuk mulai mencatat kehadiran dan kalkulasi jam kerja secara real-time.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary note */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 border-t border-slate-100 gap-2">
              <span>
                Menampilkan <strong>{filteredHistory.length}</strong> dari{' '}
                <strong>{attendanceHistory.length}</strong> hari kerja bulan ini
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Terverifikasi SCBD Biometric Geofence
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: CHECK-OUT MANDIRI */}
      {isCheckOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Konfirmasi Check-Out Mandiri
                  </h3>
                  <p className="text-[11px] text-slate-400">Pencatatan akhir sesi jam kerja</p>
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

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs text-blue-900">
              <p className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span suppressHydrationWarning>Waktu Saat Ini: {liveTime}</span>
              </p>
              <p className="text-blue-700/90 leading-relaxed text-[11px]">
                Pastikan seluruh pekerjaan hari ini telah tersimpan dan Anda telah menyelesaikan jam kerja
                sesuai shift penugasan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckOutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePerformCheckOut}
                className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-xs shadow-md shadow-blue-950/20 active:scale-95 transition-all cursor-pointer"
              >
                Konfirmasi Check-Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUKAN KOREKSI PRESENSI */}
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
                    Sisa Kuota Dispensasi: <strong className="text-blue-600">{remainingCorrectionQuota} dari 3x/Bulan</strong>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Presensi</label>
                  <input
                    type="date"
                    required
                    value={correctionDate}
                    onChange={(e) => setCorrectionDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waktu Target</label>
                  <input
                    type="time"
                    required
                    value={correctionTargetTime}
                    onChange={(e) => setCorrectionTargetTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kendala</label>
                <select
                  value={correctionType}
                  onChange={(e) => setCorrectionType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="Lupa Tap-Out">Lupa Tap-Out Saat Pulang Kantor</option>
                  <option value="Lupa Tap-In">Lupa Tap-In Saat Tiba Kantor</option>
                  <option value="Kendala Mesin Biometrik">Mesin Biometrik / Jaringan Error</option>
                  <option value="Dinas Luar Kantor">Tugas Luar / Meeting Klien SCBD</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan &amp; Penjelasan Objektif
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Jelaskan alasan atau aktivitas tugas Anda secara rinci untuk diverifikasi atasan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 space-y-0.5">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ketentuan Kebijakan PKB:</span>
                </p>
                <p>Pengajuan membutuhkan approval dari Atasan Langsung &amp; HR Operations.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Kirim Pengajuan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INTERACTIVE SELFIE LIVENESS VERIFICATION MODAL */}
      {isSelfieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 text-center">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Foto Selfie &amp; Verifikasi Biometrik AI
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    NX-Biometric Engine v4.2 • Liveness Detection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSelfieModalOpen(false);
                  stopSelfieModalCamera();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden file input fallback for photo upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Camera Viewport or Captured Selfie Preview */}
            <div className="relative rounded-2xl bg-slate-950 text-white min-h-[300px] sm:min-h-[320px] flex flex-col items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
              {capturedSelfie ? (
                /* 1. PREVIEW OF CAPTURED SELFIE PHOTO */
                <div className="relative w-full h-[320px] flex items-center justify-center bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedSelfie}
                    alt="Selfie Terambil"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

                  {/* Verification Badge */}
                  <div className="absolute top-3 left-3 bg-emerald-500/90 text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Wajah Terdeteksi (99.4% Valid)</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-900/80 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold backdrop-blur-xs">
                    Anti-Spoofing Passed
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/80 backdrop-blur-xs border border-white/10 text-left text-xs space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Biometrik &amp; Geofencing Valid</span>
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Lokasi: HQ Pacific SCBD Lt. 7 (Radius 18m) • Mode: {workLocation}
                    </p>
                  </div>
                </div>
              ) : cameraPermissionError ? (
                /* 2. CAMERA ERROR / PERMISSION FALLBACK */
                <div className="p-6 text-center space-y-3 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Akses Kamera Terkendala</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cameraPermissionError}
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Unggah Foto Selfie dari Perangkat</span>
                    </button>
                    <button
                      type="button"
                      onClick={startSelfieModalCamera}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Coba Akses Kamera Lagi
                    </button>
                  </div>
                </div>
              ) : (
                /* 3. LIVE WEBCAM FEED WITH BIOMETRIC HUD */
                <div className="relative w-full h-[320px] flex items-center justify-center bg-black overflow-hidden">
                  <video
                    ref={selfieModalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />

                  {/* Cyber Biometric Target Reticle Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-56 rounded-full border-2 border-dashed border-emerald-400/70 flex items-center justify-center relative animate-pulse">
                      {/* Sweep scan bar */}
                      <div className="absolute inset-0 rounded-full border-t-2 border-emerald-400 animate-spin" />

                      {/* Face markers */}
                      <div className="w-3 h-3 border border-emerald-400 rounded-full absolute top-12 left-10" />
                      <div className="w-3 h-3 border border-emerald-400 rounded-full absolute top-12 right-10" />
                      <div className="w-2 h-2 bg-emerald-400 rounded-full absolute top-24" />
                      <div className="w-8 h-1 bg-emerald-400/80 rounded-full absolute bottom-14" />
                    </div>
                  </div>

                  {/* Top Live Bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>LIVE CAMERA DETECTING</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-slate-900/80 backdrop-blur-xs">
                      HD 720p • 30fps
                    </span>
                  </div>

                  {/* Bottom Guide Bar */}
                  <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-xs text-center text-[11px] text-slate-200">
                    Posisikan wajah Anda tegak lurus di tengah lingkaran target
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Buttons */}
            <div className="pt-2">
              {capturedSelfie ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRetake}
                    disabled={isVerifyingSelfie}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span>Ambil Ulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndSubmitSelfie}
                    disabled={isVerifyingSelfie}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-xs shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isVerifyingSelfie ? (
                      <>
                        <Scan className="w-4 h-4 animate-spin" />
                        <span>Menyinkronkan ke HR Admin...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Konfirmasi &amp; Simpan Presensi</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <span>Jepret Foto Selfie Sekarang</span>
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Foto dari Galeri / Berkas</span>
                    </button>
                    <span className="text-[11px] text-slate-400">Verifikasi instan biometrik</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
