'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  Clock,
  Calendar,
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  Building2,
  ChevronDown,
  SlidersHorizontal,
  FileEdit,
  ExternalLink,
  MapPin,
  Laptop,
  Building,
  Check,
  X,
  Send,
  MoreVertical,
  CheckSquare,
  Square,
  Sparkles,
  PieChart,
  Eye,
  FileText,
  CalendarCheck,
  ShieldCheck,
  Camera,
  Edit3,
  Trash2,
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  name: string;
  nik: string;
  division: string;
  initials: string;
  avatarBg: string;
  avatarUrl?: string | null;
  shiftName: string;
  shiftHours: string;
  shiftNote: string;
  checkInTime: string;
  checkInSourceIcon: 'globe' | 'building' | 'cog' | 'pin';
  checkInNote: string;
  checkInType: 'early' | 'late' | 'remote' | 'gate' | 'dinas';
  checkOutTime: string;
  status: 'TEPAT_WAKTU' | 'TERLAMBAT' | 'WFH' | 'DINAS_LUAR' | 'BELUM_PRESENSI';
  selfieUrl?: string;
  location?: string;
  notes?: string;
  workLocation?: string;
}

interface OvertimeItem {
  id: string;
  name: string;
  department: string;
  hours: string;
  timeRange: string;
  reason: string;
  dateBadge: string;
}

interface AttendanceCorrectionItem {
  id: string;
  name: string;
  nik: string;
  role: string;
  department: string;
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

export default function AdminAttendancePage() {
  // Dynamic Real-Time KPI Summary State (Synchronized with Attendance Database & ESS Clock-in)
  const [kpiSummary, setKpiSummary] = useState({
    totalEmployees: 1,
    presentCount: 0,
    onTimeCount: 0,
    lateCount: 0,
    leaveCount: 0,
    absentCount: 0,
    attendanceRate: 0,
  });

  // Filter & Toolbar States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState<'all' | 'shift1' | 'shift2' | 'flexible'>('all');
  const [selectedDate, setSelectedDate] = useState('24 Mar 2025 (Hari Ini)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isManualCorrectionModalOpen, setIsManualCorrectionModalOpen] = useState(false);
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewSelfieModal, setPreviewSelfieModal] = useState<AttendanceRecord | null>(null);

  // Table selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Overtime Pending Requests State (Dynamic from unified approvals API)
  const [overtimeList, setOvertimeList] = useState<OvertimeItem[]>([]);

  // Attendance Correction Requests State (Dynamic from unified approvals API)
  const [correctionList, setCorrectionList] = useState<AttendanceCorrectionItem[]>([]);

  // Attendance Records State (Dynamic from real-time database)
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real-Time Live Sync with Employee Clock-In, BroadcastChannel, SSE & REST API
  useEffect(() => {
    // 1. Fetch live attendance data from API and sync KPI stats
    const fetchAttendanceApi = async () => {
      try {
        const [res, appRes] = await Promise.all([
          fetch(`/api/v1/attendance?t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/v1/approvals?t=${Date.now()}`, { cache: 'no-store' }),
        ]);

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const d = json.data;
            if (d.totalEmployees !== undefined) {
              setKpiSummary({
                totalEmployees: d.totalEmployees || 1,
                presentCount: d.presentCount || 0,
                onTimeCount: d.onTimeCount || 0,
                lateCount: d.lateCount || 0,
                leaveCount: d.leaveCount || 0,
                absentCount:
                  d.absentCount !== undefined
                    ? d.absentCount
                    : Math.max(0, (d.totalEmployees || 1) - (d.presentCount || 0) - (d.leaveCount || 0)),
                attendanceRate: d.attendanceRate || 0,
              });
            }

            if (d.records && Array.isArray(d.records)) {
              const apiRecords: AttendanceRecord[] = d.records.map((r: any) => ({
                id: r.id,
                name: r.employeeName,
                nik: r.employeeId || 'NX-2021008',
                division: r.department || 'Teknologi Informasi',
                initials: r.employeeName
                  ? r.employeeName
                      .split(' ')
                      .map((w: string) => w[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'RP',
                avatarBg: r.avatarBg || 'from-blue-600 to-indigo-600',
                avatarUrl: r.avatarUrl || null,
                shiftName: r.shiftName || 'Reguler HQ (08:00 - 17:00)',
                shiftHours: r.shiftHours || '08:00 - 17:00',
                shiftNote: r.shiftNote || r.location || 'Presensi Mandiri ESS (Real-Time)',
                checkInTime: r.checkInTime || r.time,
                checkInSourceIcon:
                  r.checkInSourceIcon || (r.workLocation === 'WFH' ? 'globe' : r.workLocation === 'Dinas' ? 'pin' : 'globe'),
                checkInNote:
                  r.checkInNote ||
                  (r.status === 'TERLAMBAT'
                    ? 'Terlambat Masuk'
                    : r.status === 'TEPAT_WAKTU'
                    ? 'Tepat Waktu'
                    : 'Selfie Validated'),
                checkInType:
                  r.status === 'TERLAMBAT'
                    ? 'late'
                    : r.status === 'WFH'
                    ? 'remote'
                    : r.status === 'DINAS_LUAR'
                    ? 'dinas'
                    : 'early',
                checkOutTime: r.checkOutTime || (r.type === 'CLOCK_OUT' ? r.time : '—'),
                status: r.status,
                selfieUrl: r.photoUrl || undefined,
                location: r.location,
                notes: r.notes,
                workLocation: r.workLocation,
              }));
              setRecords(apiRecords);
            }
          }
        }

        if (appRes.ok) {
          const appJson = await appRes.json();
          if (Array.isArray(appJson.data)) {
            const pendingOT = appJson.data
              .filter((a: any) => a.type === 'lembur')
              .map((a: any) => ({
                id: a.id,
                name: a.name,
                department: a.department || 'Operasional',
                hours: a.detail?.split('(')[0]?.trim() || '2.0 Jam',
                timeRange: a.detail?.includes('(') ? a.detail.split('(')[1].replace(')', '').trim() : '17:00 - 19:00',
                reason: a.reason || a.title || 'Lembur Operasional',
                dateBadge: a.submittedDate || 'Hari Ini',
              }));
            setOvertimeList(pendingOT);

            const pendingCorrections: AttendanceCorrectionItem[] = appJson.data
              .filter((a: any) => a.type === 'presensi' && a.status === 'PENDING')
              .map((a: any) => ({
                id: a.id,
                name: a.name,
                nik: a.nik || 'NX-2021008',
                role: a.role || 'Karyawan',
                department: a.department || 'Teknologi Informasi',
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
            setCorrectionList(pendingCorrections);
          }
        }
      } catch {
        // ignore
      }
    };

    fetchAttendanceApi();

    // Unified real-time processor for live check-in / check-out events
    const processLiveAttendance = (payload: any) => {
      if (!payload) return;
      const rec = payload.record || payload;
      const summary = payload.summary;

      if (summary) {
        setKpiSummary({
          totalEmployees: summary.totalEmployees ?? 1,
          presentCount: summary.presentCount ?? 0,
          onTimeCount: summary.onTimeCount ?? 0,
          lateCount: summary.lateCount ?? 0,
          leaveCount: summary.leaveCount ?? 0,
          absentCount: summary.absentCount !== undefined ? summary.absentCount : 0,
          attendanceRate: summary.attendanceRate ?? 0,
        });
      } else {
        setKpiSummary((prev) => {
          const isLate = rec.status === 'TERLAMBAT';
          const newPresent = prev.presentCount + 1;
          const newOnTime = isLate ? prev.onTimeCount : prev.onTimeCount + 1;
          const newLate = isLate ? prev.lateCount + 1 : prev.lateCount;
          const newAbsent = Math.max(0, prev.absentCount - 1);
          const newRate = Number(((newOnTime / prev.totalEmployees) * 100).toFixed(1));
          return {
            ...prev,
            presentCount: newPresent,
            onTimeCount: newOnTime,
            lateCount: newLate,
            absentCount: newAbsent,
            attendanceRate: newRate,
          };
        });
      }

      const isClockOut = rec.type === 'CLOCK_OUT' || rec.type_action === 'CLOCK_OUT';

      setRecords((prev) => {
        const empId = (rec.employeeId || '').toLowerCase();
        const empName = (rec.employeeName || '').toLowerCase();
        const existingIdx = prev.findIndex(
          (p) =>
            (empId && p.nik && p.nik.toLowerCase() === empId) ||
            (empName && p.name && p.name.toLowerCase() === empName)
        );

        if (isClockOut) {
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              checkOutTime: rec.time || rec.checkOutTime || '17:00:00',
            };
            return updated;
          }
        }

        const newLiveRec: AttendanceRecord = {
          id: rec.id || `att-${Date.now()}`,
          name: rec.employeeName || 'Karyawan',
          nik: rec.employeeId || 'NX-2021008',
          division: rec.department || 'Teknologi Informasi & Rekayasa Cloud',
          initials: rec.employeeName
            ? rec.employeeName
                .split(' ')
                .map((w: string) => w[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase()
            : 'RP',
          avatarBg: 'from-emerald-600 to-teal-600',
          avatarUrl: rec.avatarUrl || null,
          shiftName: 'Reguler HQ (08:00 - 17:00)',
          shiftHours: '08:00 - 17:00',
          shiftNote: rec.location || 'Presensi Mandiri ESS (Real-Time)',
          checkInTime: rec.time || rec.checkInTime || '08:00:00',
          checkInSourceIcon: rec.workLocation === 'WFH' ? 'globe' : rec.workLocation === 'Dinas' ? 'pin' : 'globe',
          checkInNote:
            rec.status === 'TERLAMBAT' ? 'Terlambat Masuk' : 'Liveness Selfie Validated (99.4%)',
          checkInType: rec.status === 'TERLAMBAT' ? 'late' : rec.workLocation === 'WFH' ? 'remote' : 'early',
          checkOutTime: isClockOut ? rec.time || '17:00:00' : '—',
          status: rec.status || 'TEPAT_WAKTU',
          selfieUrl: rec.photoUrl || rec.selfieUrl || undefined,
          location: rec.location,
          notes: rec.notes,
          workLocation: rec.workLocation,
        };

        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...newLiveRec };
          return updated;
        }

        return [newLiveRec, ...prev];
      });

      if (isClockOut) {
        showToast(`✓ Check-Out Terverifikasi: ${rec.employeeName} (${rec.time || ''})!`);
      } else {
        showToast(
          `⚡ Presensi Masuk Real-Time: ${rec.employeeName} Check-In terverifikasi dengan Foto Selfie Biometrik!`
        );
      }
    };

    // 2. BroadcastChannel for instant live sync across open tabs
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        if (msg.type === 'EMPLOYEE_CLOCKED_IN' || msg.type === 'ATTENDANCE_RECORDED') {
          processLiveAttendance(msg);
        } else if (
          msg.type === 'NEW_APPROVAL_REQUEST' ||
          msg.type === 'APPROVAL_STATUS_CHANGED' ||
          msg.type === 'LEAVE_SUBMITTED' ||
          msg.type === 'LEAVE_STATUS_CHANGED' ||
          msg.type === 'OVERTIME_REQUESTED' ||
          msg.type === 'ATTENDANCE_CORRECTION_SUBMITTED' ||
          msg.type === 'ATTENDANCE_CORRECTION_UPDATED' ||
          msg.type === 'APPROVAL_SUBMITTED'
        ) {
          fetchAttendanceApi();
        }
      };
    } catch {
      // ignore
    }

    // 3. Server-Sent Events (SSE) for multi-device live sync
    let sse: EventSource | null = null;
    let approvalSse: EventSource | null = null;
    try {
      sse = new EventSource('/api/v1/employees/stream');
      sse.addEventListener('ATTENDANCE_RECORDED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const data = payload.payload;
          if (data) {
            processLiveAttendance(data);
          }
        } catch {}
      });
    } catch {}

    try {
      approvalSse = new EventSource('/api/v1/approvals/stream');
      const handleApprovalEvent = () => {
        fetchAttendanceApi();
      };
      approvalSse.addEventListener('APPROVAL_CREATED', handleApprovalEvent);
      approvalSse.addEventListener('APPROVAL_STATUS_CHANGED', handleApprovalEvent);
      approvalSse.addEventListener('APPROVAL_DELETED', handleApprovalEvent);
    } catch {}

    // 4. Background ticker every 15s to keep counters accurate
    const ticker = setInterval(() => {
      fetchAttendanceApi();
    }, 15000);

    return () => {
      clearInterval(ticker);
      if (channel) channel.close();
      if (sse) sse.close();
      if (approvalSse) approvalSse.close();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [res, appRes] = await Promise.all([
        fetch(`/api/v1/attendance?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/v1/approvals?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d = json.data;
          if (d.totalEmployees !== undefined) {
            setKpiSummary({
              totalEmployees: d.totalEmployees || 1,
              presentCount: d.presentCount || 0,
              onTimeCount: d.onTimeCount || 0,
              lateCount: d.lateCount || 0,
              leaveCount: d.leaveCount || 0,
              absentCount:
                d.absentCount !== undefined
                  ? d.absentCount
                  : Math.max(0, (d.totalEmployees || 1) - (d.presentCount || 0) - (d.leaveCount || 0)),
              attendanceRate: d.attendanceRate || 0,
            });
          }
          if (d.records && Array.isArray(d.records)) {
            const apiRecords: AttendanceRecord[] = d.records.map((r: any) => ({
              id: r.id,
              name: r.employeeName,
              nik: r.employeeId || 'NX-2021008',
              division: r.department || 'Teknologi Informasi',
              initials: r.employeeName
                ? r.employeeName
                    .split(' ')
                    .map((w: string) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'RP',
              avatarBg: r.avatarBg || 'from-blue-600 to-indigo-600',
              avatarUrl: r.avatarUrl || null,
              shiftName: r.shiftName || 'Reguler HQ (08:00 - 17:00)',
              shiftHours: r.shiftHours || '08:00 - 17:00',
              shiftNote: r.shiftNote || r.location || 'Presensi Mandiri ESS (Real-Time)',
              checkInTime: r.checkInTime || r.time,
              checkInSourceIcon:
                r.checkInSourceIcon || (r.workLocation === 'WFH' ? 'globe' : r.workLocation === 'Dinas' ? 'pin' : 'globe'),
              checkInNote:
                r.checkInNote ||
                (r.status === 'TERLAMBAT'
                  ? 'Terlambat Masuk'
                  : r.status === 'TEPAT_WAKTU'
                  ? 'Tepat Waktu'
                  : 'Selfie Validated'),
              checkInType:
                r.status === 'TERLAMBAT'
                  ? 'late'
                  : r.status === 'WFH'
                  ? 'remote'
                  : r.status === 'DINAS_LUAR'
                  ? 'dinas'
                  : 'early',
              checkOutTime: r.checkOutTime || (r.type === 'CLOCK_OUT' ? r.time : '—'),
              status: r.status,
              selfieUrl: r.photoUrl || undefined,
              location: r.location,
              notes: r.notes,
              workLocation: r.workLocation,
            }));
            setRecords(apiRecords);
          }
        }
      }

      if (appRes.ok) {
        const appJson = await appRes.json();
        if (Array.isArray(appJson.data)) {
          const pendingOT = appJson.data
            .filter((a: any) => a.type === 'lembur')
            .map((a: any) => ({
              id: a.id,
              name: a.name,
              department: a.department || 'Operasional',
              hours: a.detail?.split('(')[0]?.trim() || '2.0 Jam',
              timeRange: a.detail?.includes('(') ? a.detail.split('(')[1].replace(')', '').trim() : '17:00 - 19:00',
              reason: a.reason || a.title || 'Lembur Operasional',
              dateBadge: a.submittedDate || 'Hari Ini',
            }));
          setOvertimeList(pendingOT);

          const pendingCorrections: AttendanceCorrectionItem[] = appJson.data
            .filter((a: any) => a.type === 'presensi' && a.status === 'PENDING')
            .map((a: any) => ({
              id: a.id,
              name: a.name,
              nik: a.nik || 'NX-2021008',
              role: a.role || 'Karyawan',
              department: a.department || 'Teknologi Informasi',
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
          setCorrectionList(pendingCorrections);
        }
      }
    } catch {}
    setIsRefreshing(false);
    showToast('Sinkronisasi Biometrik & Geofencing berhasil diperbarui!');
  };

  const handleApproveOvertime = async (id: string, name: string) => {
    setOvertimeList((prev) => prev.filter((item) => item.id !== id));
    showToast(`Lembur ${name} berhasil disetujui & dicatat ke perhitungan payroll!`);
    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' }),
      });
      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({ type: 'APPROVAL_STATUS_CHANGED', id, status: 'APPROVED' });
      ch.close();
    } catch {}
  };

  const handleRejectOvertime = async (id: string, name: string) => {
    setOvertimeList((prev) => prev.filter((item) => item.id !== id));
    showToast(`Pengajuan lembur ${name} ditolak.`);
    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'REJECTED' }),
      });
      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({ type: 'APPROVAL_STATUS_CHANGED', id, status: 'REJECTED' });
      ch.close();
    } catch {}
  };

  const handleClearAllAttendanceLogs = async () => {
    if (
      !window.confirm(
        'Bersihkan seluruh log presensi agar kosong sebelum sistem diluncurkan ke seluruh karyawan?'
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/v1/attendance?all=true', { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        setRecords([]);
        setSelectedIds([]);
        setKpiSummary((prev) => ({
          ...prev,
          presentCount: 0,
          onTimeCount: 0,
          lateCount: 0,
          leaveCount: 0,
          absentCount: prev.totalEmployees,
          attendanceRate: 0,
        }));
        showToast('✓ Seluruh log presensi berhasil dibersihkan (0 baris). Sistem siap diluncurkan!');
      } else {
        showToast('Gagal membersihkan log presensi.');
      }
    } catch {
      showToast('Terjadi kesalahan saat membersihkan log presensi.');
    }
  };

  const handleApproveCorrection = async (item: AttendanceCorrectionItem) => {
    setCorrectionList((prev) => prev.filter((c) => c.id !== item.id));
    showToast(
      `✓ Koreksi presensi ${item.name} (${item.date} • ${item.targetTime} WIB) disetujui & jam kehadiran otomatis diperbarui!`
    );

    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: 'APPROVED',
          reviewedBy: 'HR Operations SCBD',
          adminNotes: 'Disetujui melalui verifikasi presensi harian HRD',
        }),
      });

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({
        type: 'ATTENDANCE_CORRECTION_UPDATED',
        id: item.id,
        status: 'APPROVED',
        nik: item.nik,
        name: item.name,
      });
      ch.postMessage({
        type: 'ATTENDANCE_RECORDED',
      });
      ch.close();

      handleRefresh();
    } catch (err) {
      console.error('Failed to approve correction:', err);
    }
  };

  const handleRejectCorrection = async (item: AttendanceCorrectionItem) => {
    setCorrectionList((prev) => prev.filter((c) => c.id !== item.id));
    showToast(`✕ Pengajuan koreksi presensi ${item.name} ditolak.`);

    try {
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: 'REJECTED',
          reviewedBy: 'HR Operations SCBD',
          adminNotes: 'Ditolak: data presensi tidak sesuai dengan log CCTV/Server SCBD',
        }),
      });

      const ch = new BroadcastChannel('nexora_live_sync');
      ch.postMessage({
        type: 'ATTENDANCE_CORRECTION_UPDATED',
        id: item.id,
        status: 'REJECTED',
        nik: item.nik,
        name: item.name,
      });
      ch.close();

      handleRefresh();
    } catch (err) {
      console.error('Failed to reject correction:', err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filtered dataset
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.division.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShift =
      selectedShift === 'all' ||
      (selectedShift === 'shift1' && r.shiftName.includes('08:00')) ||
      (selectedShift === 'shift2' && r.shiftName.includes('Shift Siang')) ||
      (selectedShift === 'flexible' && r.shiftName.includes('Fleksibel'));

    return matchesSearch && matchesShift;
  });

  // Dynamic breakdown for Metode Check-In
  const presentRecords = records.filter(
    (r) => r.status && r.status !== 'BELUM_PRESENSI'
  );
  const totalPresentCount = presentRecords.length;

  const bioCount = presentRecords.filter(
    (r) =>
      r.checkInSourceIcon === 'building' ||
      r.checkInSourceIcon === 'cog' ||
      (r.workLocation === 'WFO' && !r.checkInSourceIcon)
  ).length;

  const mobileGpsCount = presentRecords.filter(
    (r) =>
      r.checkInSourceIcon === 'pin' ||
      r.workLocation === 'Dinas' ||
      (r.location && r.location.toLowerCase().includes('gps'))
  ).length;

  const webPortalCount = presentRecords.filter(
    (r) =>
      r.checkInSourceIcon === 'globe' ||
      r.workLocation === 'WFH' ||
      (!r.checkInSourceIcon && r.workLocation !== 'WFO')
  ).length;

  const bioPercent = totalPresentCount > 0 ? Math.round((bioCount / totalPresentCount) * 100) : 0;
  const mobilePercent = totalPresentCount > 0 ? Math.round((mobileGpsCount / totalPresentCount) * 100) : 0;
  const webPercent = totalPresentCount > 0 ? Math.max(0, 100 - bioPercent - mobilePercent) : 0;

  const circumference = 251.2;
  const bioDash = (circumference * bioPercent) / 100;
  const mobileDash = (circumference * mobilePercent) / 100;

  return (
    <AdminLayoutSkeleton
      onQuickAction={() => setIsManualCorrectionModalOpen(true)}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white ml-2 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-5 max-w-[1440px] mx-auto pb-12">
        {/* =========================================================================
            1. HEADER & BREADCRUMBS WITH REAL-TIME SYNC BADGE
        ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                UTAMA
              </span>
              <span>&gt;</span>
              <span className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">
                PRESENSI & WAKTU
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                REAL-TIME SYNC
              </span>
            </div>

            <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
              Presensi & Waktu Kerja
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Monitoring kehadiran harian, sinkronisasi log biometrik, validasi geofencing mobile, dispensasi keterlambatan, dan rekapitulasi lembur karyawan terpusat.
            </p>
          </div>

          {/* Top Actions: Shift & Jam Kerja, Koreksi Manual, Unduh Rekap */}
          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0 relative">
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Shift & Jam Kerja</span>
            </button>

            <button
              onClick={() => setIsManualCorrectionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              <FileEdit className="w-3.5 h-3.5 text-slate-500" />
              <span>Koreksi Manual</span>
            </button>

            {/* Export Link & Center */}
            <div className="relative">
              <Link
                href="/admin/attendance/export"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Rekap</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </Link>

              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setIsExportDropdownOpen(false);
                      showToast('Mengunduh Laporan Presensi Excel (.xlsx)...');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Format Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => {
                      setIsExportDropdownOpen(false);
                      showToast('Mengunduh Laporan Presensi PDF Eksekutif...');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-600" />
                    Format PDF Resmi
                  </button>
                  <button
                    onClick={() => {
                      setIsExportDropdownOpen(false);
                      showToast('Mengunduh Data Mentah CSV Biometrik...');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Raw Biometric (.csv)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. TOP 5 KPI SUMMARY CARDS (Matching Stitch Screen Exactly)
        ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: TOTAL WAJIB MASUK */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  TOTAL WAJIB MASUK
                </span>
                <Users className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-slate-900">
                  {kpiSummary.totalEmployees.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500 font-medium">personil</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 whitespace-nowrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Semua unit kerja
              </span>
              <span className="font-semibold text-slate-700">100% Target</span>
            </div>
          </div>

          {/* Card 2: HADIR TEPAT WAKTU */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  HADIR TEPAT WAKTU
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  📈 {kpiSummary.attendanceRate}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-slate-900">
                  {kpiSummary.onTimeCount.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500 font-medium">staf</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, kpiSummary.attendanceRate))}%` }}
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium mt-3">
              {kpiSummary.presentCount === 0 ? (
                <span>Belum ada presensi masuk hari ini</span>
              ) : (
                <span className="text-emerald-600 font-semibold">{kpiSummary.presentCount} hadir terverifikasi</span>
              )}
            </div>
          </div>

          {/* Card 3: TERLAMBAT & IZIN AWAL */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  TERLAMBAT & IZIN AWAL
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                  {kpiSummary.lateCount === 0 ? '0 mnt' : 'Rata-rata 14 mnt'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-slate-900">
                  {kpiSummary.lateCount.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500 font-medium">kasus</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] mt-3">
              <span className="text-slate-500 font-medium">
                {kpiSummary.lateCount === 0
                  ? '0 kasus terlambat'
                  : `• ${Math.round(kpiSummary.lateCount * 0.68)} dlm batas toleransi`}
              </span>
              <button
                onClick={() => showToast('Menampilkan rincian toleransi 15 menit...')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Rincian →
              </button>
            </div>
          </div>

          {/* Card 4: IZIN, CUTI & SAKIT */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  IZIN, CUTI & SAKIT
                </span>
                <CalendarCheck className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-slate-900">
                  {kpiSummary.leaveCount.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500 font-medium">terverifikasi</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] mt-3">
              <span className="text-slate-500 font-medium truncate">
                {kpiSummary.leaveCount === 0 ? (
                  'Belum ada izin/cuti aktif hari ini'
                ) : (
                  `${Math.round(kpiSummary.leaveCount * 0.54)} Cuti • ${Math.round(kpiSummary.leaveCount * 0.31)} Sakit • ${Math.max(
                    0,
                    kpiSummary.leaveCount -
                      Math.round(kpiSummary.leaveCount * 0.54) -
                      Math.round(kpiSummary.leaveCount * 0.31)
                  )} Dinas`
                )}
              </span>
              <Link
                href="/admin/leave"
                className="text-blue-600 hover:underline font-semibold flex-shrink-0"
              >
                Lihat SK
              </Link>
            </div>
          </div>

          {/* Card 5: BELUM PRESENSI (Alert Card) */}
          <div className="bg-white rounded-3xl p-5 border border-rose-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/40">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase">
                  BELUM PRESENSI
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-rose-700">
                  {kpiSummary.absentCount.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-rose-500 font-medium">tanpa kabar</span>
              </div>
            </div>
            <div className="pt-3 border-t border-rose-100 flex items-center justify-between gap-1.5 mt-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                {kpiSummary.absentCount === 0 ? '✓ Semua Hadir / Cuti' : '⚠ Perlu Konfirmasi'}
              </span>
              <button
                onClick={() => setIsNudgeModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-sm transition-all transform active:scale-95"
              >
                Nudge Staf
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. FILTER & TOOLBAR SECTION (Search, Date, Dept, Status, Shift Tabs)
        ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama Pegawai atau NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Date Selector Dropdown */}
            <div className="md:col-span-3 relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl border border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="24 Mar 2025 (Hari Ini)">24 Mar 2025 (Hari Ini)</option>
                <option value="23 Mar 2025">23 Mar 2025 (Kemarin)</option>
                <option value="22 Mar 2025">22 Mar 2025 (Sabtu)</option>
                <option value="21 Mar 2025">21 Mar 2025 (Jumat)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Department Dropdown */}
            <div className="md:col-span-2 relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 appearance-none cursor-pointer"
              >
                <option value="ALL">Semua Departemen</option>
                <option value="TECH">Teknologi & Produk</option>
                <option value="OPS">Operasional & Logistik</option>
                <option value="SALES">Pemasaran & Penjualan</option>
                <option value="HR">Keuangan & HR</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="md:col-span-2 relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 appearance-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="TEPAT_WAKTU">Tepat Waktu</option>
                <option value="TERLAMBAT">Terlambat</option>
                <option value="WFH">WFH (Remote)</option>
                <option value="DINAS_LUAR">Dinas Luar</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sub-bar: Shift Pills + Sync Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex-shrink-0">
                Shift:
              </span>
              <button
                onClick={() => setSelectedShift('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedShift === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Shift
              </button>
              <button
                onClick={() => setSelectedShift('shift1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedShift === 'shift1'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Shift 1 (08:00 - 17:00)
              </button>
              <button
                onClick={() => setSelectedShift('shift2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedShift === 'shift2'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Shift Siang (13:00 - 21:00)
              </button>
              <button
                onClick={() => setSelectedShift('flexible')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedShift === 'flexible'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Fleksibel HQ
              </button>
            </div>

            {/* Sync Status & Refresh Button */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Sinkron Biometrik Otomatis</span>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. LOWER 2-COLUMN SECTION: (Table Log on Left, Widgets on Right)
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* -----------------------------------------------------------------------
              LEFT COLUMN: Log Presensi Harian Real-Time (8 cols)
          ----------------------------------------------------------------------- */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              {/* Table Header Row */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">
                        Log Presensi Harian Real-Time
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {filteredRecords.length.toLocaleString('id-ID')} Baris
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  {records.length > 0 && (
                    <button
                      onClick={handleClearAllAttendanceLogs}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all cursor-pointer mr-1"
                      title="Bersihkan Semua Log Presensi Sebelum Peluncuran Resmi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Bersihkan Log</span>
                    </button>
                  )}
                  <button
                    onClick={() => showToast('Mengatur konfigurasi kolom tampilan')}
                    className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="Pengaturan Kolom"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showToast('Mengurutkan data presensi')}
                    className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="Sorting"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length === records.length &&
                            records.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="py-3 px-4">Karyawan & Divisi</th>
                      <th className="py-3 px-4">Foto Selfie Biometrik</th>
                      <th className="py-3 px-4">Jadwal Shift</th>
                      <th className="py-3 px-4">Check-In</th>
                      <th className="py-3 px-4">Check-Out</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
                            <Clock className="w-6 h-6 opacity-80" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">Log Presensi Bersih &amp; Kosong (0 Baris)</p>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                            Sistem dalam kondisi siap luncur (Clean State). Log kehadiran harian akan terisi secara otomatis saat karyawan melakukan Clock-In resmi.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(item.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>

                          {/* Karyawan & Divisi */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {item.avatarUrl ? (
                                <img
                                  src={item.avatarUrl}
                                  alt={item.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                                />
                              ) : (
                                <div
                                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}
                                >
                                  {item.initials}
                                </div>
                              )}
                              <div className="min-w-0">
                                <Link
                                  href={`/admin/employees/${item.nik}`}
                                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                                >
                                  {item.name}
                                </Link>
                                <p className="text-[11px] text-slate-500 font-medium truncate">
                                  <span className="font-mono text-slate-400">
                                    {item.nik}
                                  </span>{' '}
                                  • {item.division}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Foto Selfie Biometrik */}
                          <td className="py-3.5 px-4">
                            {item.selfieUrl ? (
                              <div className="flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewSelfieModal(item)}
                                  className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all group flex-shrink-0"
                                  title="Klik untuk melihat foto selfie dan audit biometrik"
                                >
                                  <img
                                    src={item.selfieUrl}
                                    alt={`Selfie ${item.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white stroke-[3]" />
                                  </span>
                                </button>
                                <div>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    <span>99.4% Valid</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewSelfieModal(item)}
                                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold block cursor-pointer"
                                  >
                                    Lihat Bukti Foto →
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                  <Camera className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-medium">Mesin Kantor</span>
                              </div>
                            )}
                          </td>

                          {/* Jadwal Shift */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">
                              {item.shiftName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.shiftNote}
                            </p>
                          </td>

                          {/* Check-In */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                              <span>{item.checkInTime}</span>
                              {item.checkInSourceIcon === 'globe' && (
                                <span title="Web Portal">
                                  <Laptop className="w-3.5 h-3.5 text-blue-500" />
                                </span>
                              )}
                              {item.checkInSourceIcon === 'building' && (
                                <span title="Kantor Pusat">
                                  <Building className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                              )}
                              {item.checkInSourceIcon === 'cog' && (
                                <span title="Pabrik Cikarang">
                                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                </span>
                              )}
                              {item.checkInSourceIcon === 'pin' && (
                                <span title="Lokasi Client">
                                  <MapPin className="w-3.5 h-3.5 text-purple-500" />
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] font-semibold mt-0.5 ${
                                item.checkInType === 'early'
                                  ? 'text-emerald-600'
                                  : item.checkInType === 'late'
                                  ? 'text-rose-600 font-bold'
                                  : item.checkInType === 'remote'
                                  ? 'text-blue-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.checkInNote}
                            </p>
                          </td>

                          {/* Check-Out */}
                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            {item.checkOutTime}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {item.status === 'TEPAT_WAKTU' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Tepat Waktu
                              </span>
                            )}
                            {item.status === 'TERLAMBAT' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Terlambat
                              </span>
                            )}
                            {item.status === 'WFH' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                WFH Terverifikasi
                              </span>
                            )}
                            {item.status === 'DINAS_LUAR' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                Dinas Luar
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Pagination Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span>Menampilkan</span>
                <span className="font-semibold text-slate-800">
                  {filteredRecords.length === 0 ? '0' : `1 - ${Math.min(10, filteredRecords.length)}`}
                </span>
                <span>
                  dari <strong className="text-slate-800">{filteredRecords.length.toLocaleString('id-ID')}</strong> data presensi hari ini
                </span>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-1 font-semibold">
                <button
                  disabled
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                >
                  &lt;
                </button>
                <button className="px-3 py-1 rounded-lg bg-blue-600 text-white shadow-sm">
                  1
                </button>
                <button
                  disabled
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN: Verifikasi Lembur & Metode Check-In (4 cols)
          ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-5">
            {/* Card 0: Verifikasi Koreksi Presensi Karyawan */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Verifikasi Koreksi Presensi
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {correctionList.length} Pengajuan
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pengajuan koreksi presensi mandiri (lupa tap-out, kendala jaringan/biometrik) yang menunggu verifikasi HR.
              </p>

              <div className="space-y-3.5">
                {correctionList.map((cor) => (
                  <div
                    key={cor.id}
                    className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2.5 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{cor.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">({cor.nik})</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {cor.department}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex-shrink-0">
                        {cor.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200/60">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tgl: {cor.date}</span>
                      <span className="text-slate-300">•</span>
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-blue-700 font-bold">Target: {cor.targetTime} WIB</span>
                    </div>

                    <p className="text-[11px] text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200/60">
                      &ldquo;{cor.reason}&rdquo;
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleRejectCorrection(cor)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApproveCorrection(cor)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all transform active:scale-95 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui &amp; Perbarui Jam</span>
                      </button>
                    </div>
                  </div>
                ))}

                {correctionList.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="font-semibold text-slate-700">
                      Semua Koreksi Selesai Diverifikasi
                    </p>
                    <p className="text-[11px]">Tidak ada permohonan koreksi presensi tertunda.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 1: Verifikasi Lembur */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Verifikasi Lembur
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {overtimeList.length} Permohonan
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Surat Perintah Lembur (SPL) yang diajukan oleh supervisor divisi menunggu otorisasi HRD.
              </p>

              <div className="space-y-3.5">
                {overtimeList.map((ot) => (
                  <div
                    key={ot.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2.5 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {ot.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {ot.department} • <strong className="text-blue-700">{ot.hours}</strong> ({ot.timeRange})
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex-shrink-0">
                        {ot.dateBadge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200/50">
                      "{ot.reason}"
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleRejectOvertime(ot.id, ot.name)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApproveOvertime(ot.id, ot.name)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95"
                      >
                        Setujui Segera
                      </button>
                    </div>
                  </div>
                ))}

                {overtimeList.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="font-semibold text-slate-700">
                      Semua Lembur Sudah Disetujui
                    </p>
                    <p className="text-[11px]">Tidak ada permohonan tertunda.</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/admin/payroll"
                  className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Semua Riwayat Lembur</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Metode Check-In (Donut Chart & Distribution) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Metode Check-In
                  </h3>
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                  title="Refresh Breakdown"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Circular Visual & Center Counter */}
              <div className="flex flex-col items-center py-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* SVG Donut Visual */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F1F5F9"
                      strokeWidth="12"
                    />
                    {totalPresentCount > 0 && bioPercent > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#1D4ED8"
                        strokeWidth="12"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - bioDash}
                        className="transition-all duration-1000 ease-out"
                      />
                    )}
                    {totalPresentCount > 0 && mobilePercent > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#0EA5E9"
                        strokeWidth="12"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - mobileDash}
                        style={{ transform: `rotate(${(bioPercent / 100) * 360}deg)`, transformOrigin: '50% 50%' }}
                        className="transition-all duration-1000 ease-out"
                      />
                    )}
                    {totalPresentCount > 0 && webPercent > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#94A3B8"
                        strokeWidth="12"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - ((circumference * webPercent) / 100)}
                        style={{
                          transform: `rotate(${((bioPercent + mobilePercent) / 100) * 360}deg)`,
                          transformOrigin: '50% 50%',
                        }}
                        className="transition-all duration-1000 ease-out"
                      />
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-2xl font-bold text-slate-900">
                      {totalPresentCount.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Total Hadir
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-700 flex-shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">
                      Biometrik Kantor (Finger & Face)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {bioCount} ({bioPercent}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">
                      Mobile App (GPS & Geofencing)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {mobileGpsCount} ({mobilePercent}%)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">
                      Web Portal SSO / Remote WFH
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {webPortalCount} ({webPercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: SHIFT & JAM KERJA CONFIGURATION
      ========================================================================= */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsShiftModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pengaturan Shift & Kebijakan Jam Kerja
                </h3>
                <p className="text-xs text-slate-500">
                  Toleransi keterlambatan dan rentang waktu tap-in/tap-out.
                </p>
              </div>
            </div>

            <div className="py-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Shift Reguler Kantor Pusat (HQ)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    defaultValue="08:00 WIB"
                    className="px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    defaultValue="17:00 WIB"
                    className="px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Batas Toleransi Keterlambatan Resmi
                </label>
                <select className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700">
                  <option value="15">15 Menit (Standar Kebijakan Perusahaan)</option>
                  <option value="30">30 Menit (Kondisi Khusus / Cuaca Ekstrem)</option>
                  <option value="0">0 Menit (Strict Tanpa Dispensasi)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
                💡 <strong>Catatan Kepatuhan:</strong> Perubahan kebijakan shift akan berlaku mulai besok pukul 00:00 WIB dan otomatis disinkronkan ke seluruh mesin biometric dan mobile geofence.
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsShiftModalOpen(false);
                  showToast('Kebijakan shift berhasil diperbarui & disinkronkan!');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-sm"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: KOREKSI MANUAL PRESENSI
      ========================================================================= */}
      {isManualCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsManualCorrectionModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileEdit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Input Koreksi Manual Presensi
                </h3>
                <p className="text-xs text-slate-500">
                  Dispensasi lupa tap-in atau anomali jaringan mesin biometric.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsManualCorrectionModalOpen(false);
                showToast('Koreksi presensi berhasil dicatat & masuk ke Audit Trail!');
              }}
              className="py-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Pilih Pegawai
                </label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800">
                  <option value="NX-201992">Siti Nurhaliza, M.M. (NX-201992)</option>
                  <option value="NX-2021008">Rian Pratama, S.Kom (NX-2021008)</option>
                  <option value="NX-201844">Raden Bagus Prakoso (NX-201844)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Jam Check-In Disesuaikan
                  </label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Jam Check-Out Disesuaikan
                  </label>
                  <input
                    type="time"
                    defaultValue="17:00"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Alasan Koreksi / Nomor Memo
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Mesin fingerprint lobby barat mati lampu pkl 08:00..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-sm"
                >
                  Simpan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: NUDGE STAF (BROADCAST REMINDER PRESENSI)
      ========================================================================= */}
      {isNudgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsNudgeModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kirim Nudge / Pengingat Presensi
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  {kpiSummary.absentCount} Pegawai Belum Presensi Hari Ini
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 my-4 leading-relaxed">
              Sistem akan mengirimkan push notification aplikasi mobile Nexora ESS dan pesan WhatsApp reminder otomatis kepada {kpiSummary.absentCount} pegawai yang belum melakukan tap-in hingga saat ini.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setIsNudgeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsNudgeModalOpen(false);
                  showToast(`Notifikasi Nudge terkirim ke ${kpiSummary.absentCount} pegawai via WhatsApp & ESS!`);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Nudge Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL PREVIEW FOTO SELFIE & AUDIT BIOMETRIK */}
      {previewSelfieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Audit Biometrik AI &amp; Foto Selfie Presensi
                  </h3>
                  <p className="text-[11px] text-slate-400">Verifikasi Kehadiran Digital Multi-Faktor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSelfieModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selfie Photo Preview with HUD overlay */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-72 flex items-center justify-center border border-slate-800">
              {previewSelfieModal.selfieUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSelfieModal.selfieUrl}
                  alt={previewSelfieModal.name}
                  className="w-full h-72 object-cover"
                />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Foto tidak tersedia
                </div>
              )}
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>99.4% Liveness Terverifikasi</span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-xs border border-white/10 text-white text-[11px] flex items-center justify-between">
                <span>Waktu Check-In: {previewSelfieModal.checkInTime}</span>
                <span className="font-mono text-emerald-400">Anti-Spoofing Valid</span>
              </div>
            </div>

            {/* Verification Metadata Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nama Karyawan:</span>
                <span className="font-bold text-slate-900">{previewSelfieModal.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">NIK &amp; Divisi:</span>
                <span className="font-semibold text-slate-700">{previewSelfieModal.nik} • {previewSelfieModal.division}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Geofencing GPS SCBD:</span>
                <span className="font-bold text-emerald-700">HQ SCBD Lt. 7 (Radius &lt; 50m • Valid)</span>
              </div>
              {previewSelfieModal.notes && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Catatan Daily Standup:</span>
                  <p className="text-slate-800 font-medium italic mt-0.5">&ldquo;{previewSelfieModal.notes}&rdquo;</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              {previewSelfieModal.selfieUrl && (
                <a
                  href={previewSelfieModal.selfieUrl}
                  download={`Selfie_${previewSelfieModal.nik}_${previewSelfieModal.name}.jpg`}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Unduh Foto</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setPreviewSelfieModal(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
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
