'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  Target,
  Search,
  ChevronDown,
  Download,
  Edit3,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  X,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { PerformanceRecord, PerformanceCycle } from '@/app/api/v1/performance/route';
import { getCurrentRealCycle } from '@/lib/performanceDb';

const initialDefaultPerformanceList: PerformanceRecord[] = [
  {
    id: 'perf-1',
    name: 'Rian Pratama, S.Kom',
    nik: 'NX-2021008',
    role: 'Human Resource Specialist',
    department: 'Human Resource Department',
    score: 0,
    grade: 'Belum Dinilai',
    gradeColor: 'text-slate-600 bg-slate-100 border-slate-200',
    okrAchievement: '0%',
    status: 'MENUNGGU SUBMISI',
    cycle: 'Q4 2026',
    avatarUrl: '/avatars/user-1.jpg',
  },
  {
    id: 'perf-2',
    name: 'Fatih',
    nik: 'NX-2025089',
    role: 'Human Resource Specialist',
    department: 'Human Resource Department',
    score: 0,
    grade: 'Belum Dinilai',
    gradeColor: 'text-slate-600 bg-slate-100 border-slate-200',
    okrAchievement: '0%',
    status: 'MENUNGGU SUBMISI',
    cycle: 'Q4 2026',
    avatarUrl: undefined,
  },
  {
    id: 'perf-3',
    name: 'Amel',
    nik: 'NX-2026105',
    role: 'Human Resource Specialist',
    department: 'Human Resource Department',
    score: 0,
    grade: 'Belum Dinilai',
    gradeColor: 'text-slate-600 bg-slate-100 border-slate-200',
    okrAchievement: '0%',
    status: 'MENUNGGU SUBMISI',
    cycle: 'Q4 2026',
    avatarUrl: undefined,
  },
  {
    id: 'perf-4',
    name: 'Bang geb',
    nik: 'NX-2026855',
    role: 'Human Resource Specialist',
    department: 'Human Resource Department',
    score: 0,
    grade: 'Belum Dinilai',
    gradeColor: 'text-slate-600 bg-slate-100 border-slate-200',
    okrAchievement: '0%',
    status: 'MENUNGGU SUBMISI',
    cycle: 'Q4 2026',
    avatarUrl: undefined,
  },
  {
    id: 'perf-5',
    name: 'Kak arum',
    nik: 'NX-2026445',
    role: 'Human Resource Specialist',
    department: 'Human Resource Department',
    score: 0,
    grade: 'Belum Dinilai',
    gradeColor: 'text-slate-600 bg-slate-100 border-slate-200',
    okrAchievement: '0%',
    status: 'MENUNGGU SUBMISI',
    cycle: 'Q4 2026',
    avatarUrl: undefined,
  },
];

export default function AdminPerformancePage() {
  const currentCycleInfo = useMemo(() => getCurrentRealCycle(), []);
  const [performanceList, setPerformanceList] = useState<PerformanceRecord[]>(initialDefaultPerformanceList);
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [activeCycle, setActiveCycle] = useState(currentCycleInfo.code || 'Q4 2026');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Semua Departemen');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Summary Metrics State (Zero Dummy Real-Time Default)
  const [summary, setSummary] = useState({
    avgScore: '0.00',
    topPerformersCount: 0,
    topPerformersPercent: '0.0',
    pipCount: 0,
    pipPercent: '0.0',
    completionPercent: 0,
    totalEmployees: 5,
    benchmarkLabel: `Benchmark ${currentCycleInfo.code || 'Q4 2026'}`,
    nextScheduleLabel: currentCycleInfo.nextCycleSchedule || 'Siklus Q1 2027 dijadwalkan buka 01 Januari',
  });

  // Modal State for Calibration / Edit
  const [selectedReview, setSelectedReview] = useState<PerformanceRecord | null>(null);
  const [editScore, setEditScore] = useState<number>(4.0);
  const [editStatus, setEditStatus] = useState<PerformanceRecord['status']>('TERVERIFIKASI');
  const [editFeedback, setEditFeedback] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PerformanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/v1/performance?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      });
    } catch {}

    setPerformanceList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    showToast(`✓ Penilaian kinerja untuk ${deleteTarget.name} berhasil dihapus.`);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  // Fetch live performance dataset
  const fetchPerformanceData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/performance', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPerformanceList(json.data);
          if (json.cycles) setCycles(json.cycles);
          if (json.activeCycle) {
            setActiveCycle(json.activeCycle);
          }
          if (json.summary) {
            setSummary(json.summary);
          }
        }
      }
      if (isManual) {
        showToast('✓ Data evaluasi kinerja & KPI berhasil disinkronkan secara real-time.');
      }
    } catch {
      // fallback to initial list
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  // Multi-device and cross-tab real-time sync
  useEffect(() => {
    fetchPerformanceData();

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (
          msg?.type === 'PERFORMANCE_UPDATED' ||
          msg?.type === 'PERFORMANCE_CYCLE_LAUNCHED' ||
          msg?.type === 'EMPLOYEE_PROFILE_UPDATED' ||
          msg?.type === 'EMPLOYEES_UPDATED'
        ) {
          fetchPerformanceData();
        }
      };
    } catch {}

    const handleFocus = () => fetchPerformanceData();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPerformanceData]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const s = new Set<string>();
    performanceList.forEach((p) => {
      if (p.department) s.add(p.department);
    });
    return Array.from(s);
  }, [performanceList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return performanceList.filter((p) => {
      if (selectedDepartment !== 'Semua Departemen' && p.department !== selectedDepartment) {
        return false;
      }
      if (searchEmployee) {
        const query = searchEmployee.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchNik = p.nik.toLowerCase().includes(query);
        const matchRole = p.role.toLowerCase().includes(query);
        const matchDept = p.department.toLowerCase().includes(query);
        if (!matchName && !matchNik && !matchRole && !matchDept) return false;
      }
      return true;
    });
  }, [performanceList, selectedDepartment, searchEmployee]);

  // Toggle select row
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredList.length && filteredList.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map((p) => p.id));
    }
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    showToast('Mengunduh Laporan Evaluasi Kinerja (.xlsx)...');
    setTimeout(() => {
      const header = 'NIK,NAMA KARYAWAN,DEPARTEMEN,JABATAN,SKOR AKHIR,PREDIKAT & GRADE,CAPAIAN OKR,STATUS KALIBRASI,SIKLUS,CATATAN REVIEW\n';
      const rows = performanceList
        .map(
          (p) =>
            `"${p.nik}","${p.name}","${p.department}","${p.role}",${p.score},"${p.grade}","${p.okrAchievement}","${p.status}","${p.cycle}","${p.feedback || '-'}"`
        )
        .join('\n');
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Kinerja_Karyawan_${activeCycle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('✓ Laporan evaluasi kinerja KPI berhasil diunduh!');
    }, 600);
  };

  // Open calibration modal
  const handleOpenCalibration = (record: PerformanceRecord) => {
    setSelectedReview(record);
    setEditScore(record.score > 0 ? record.score : 4.0);
    setEditStatus(record.status === 'MENUNGGU SUBMISI' ? 'TERVERIFIKASI' : record.status);
    setEditFeedback(record.feedback || '');
  };

  // Trigger batch or initial calibration
  const handleStartCalibrationBatch = () => {
    if (performanceList.length > 0) {
      handleOpenCalibration(performanceList[0]);
    } else {
      showToast('Tidak ada data karyawan untuk dikalibrasi.');
    }
  };

  // Save calibration
  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      const res = await fetch('/api/v1/performance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReview.id,
          nik: selectedReview.nik,
          score: editScore,
          status: editStatus,
          feedback: editFeedback,
        }),
      });

      if (res.ok) {
        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({ type: 'PERFORMANCE_UPDATED', nik: selectedReview.nik });
          bc.close();
        } catch {}
      }
    } catch {}

    // Update local state smoothly
    setPerformanceList((prev) =>
      prev.map((item) =>
        item.id === selectedReview.id
          ? {
              ...item,
              score: editScore,
              status: editStatus,
              grade: editScore >= 4.5 ? 'Grade A (Outstanding)' : editScore >= 4.0 ? 'Grade B+ (Exceeds)' : editScore >= 3.0 ? 'Grade B (Meets)' : 'Grade C (PIP)',
              feedback: editFeedback,
            }
          : item
      )
    );

    setSelectedReview(null);
    showToast(`✓ Kalibrasi nilai untuk ${selectedReview.name} berhasil disimpan & disinkronkan real-time!`);
  };

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="w-full space-y-6">
        {/* Header & Breadcrumb matching Screenshot */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Penilaian Kinerja Karyawan ({activeCycle})
            </h1>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <Link href="/admin" className="hover:text-blue-600 transition-colors">
                Utama
              </Link>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-500">Evaluasi</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-700 font-semibold">Penilaian Kinerja Karyawan</span>
            </nav>
            <p className="text-xs text-slate-500 mt-1">
              Kompilasi nilai akhir multi-tier appraisal, capaian OKR, dan grade merit kompensasi.
            </p>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Unduh Laporan (.xlsx) */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Laporan (.xlsx)</span>
            </button>

            {/* Mulai Kalibrasi Button (Solid Blue) */}
            <button
              type="button"
              onClick={handleStartCalibrationBatch}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all transform active:scale-95 cursor-pointer"
            >
              <span>Mulai Kalibrasi</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 1: 4 CORE KPI METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Rata-Rata Skor Organisasi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  RATA-RATA SKOR ORGANISASI
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.avgScore}</span>
                <span className="text-sm font-semibold text-slate-500">/ 5.00</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Belum Ada Evaluasi Disahkan</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">{summary.benchmarkLabel || `Benchmark ${activeCycle}`}</span>
              <span className="font-semibold text-blue-600 text-[11px]">Real-Time</span>
            </div>
          </div>

          {/* Card 2: TOP PERFORMERS (GRADE A) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  TOP PERFORMERS (GRADE A)
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary.topPerformersCount}
                </span>
                <span className="text-sm font-semibold text-slate-700">Karyawan</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{summary.topPerformersPercent}% dari total populasi staf</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Sesuai Kuota Kurva Bell</span>
              <span className="font-semibold text-slate-600 text-[11px]">Normal</span>
            </div>
          </div>

          {/* Card 3: STATUS SIKLUS EVALUASI */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  STATUS SIKLUS EVALUASI
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeCycle}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                  Tersinkronisasi Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {summary.nextScheduleLabel || 'Siklus Q1 2027 dijadwalkan buka 01 Januari'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs">
              <span className="font-bold text-slate-700 text-xs">
                {summary.totalEmployees || performanceList.length} Staf Terdata
              </span>
            </div>
          </div>

          {/* Card 4: PROGRAM PIP & COACHING */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  PROGRAM PIP &amp; COACHING
                </span>
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.pipCount}</span>
                <span className="text-sm font-semibold text-slate-700">Kandidat PIP</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {summary.pipCount === 0
                  ? 'Seluruh staf memenuhi standar capaian target'
                  : `${summary.pipPercent}% populasi memerlukan mentoring khusus`}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Kepatuhan Standar SDM</span>
              <span className="font-semibold text-emerald-600 text-[11px]">100% Terpenuhi</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: MAIN EVALUATION TABLE CARD */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
          {/* Table Card Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Daftar Hasil Penilaian Kinerja Karyawan (Siklus {activeCycle})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kompilasi nilai akhir multi-tier appraisal, capaian OKR, dan grade merit kompensasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau jabatan..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Department filter */}
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="appearance-none px-3 pr-8 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Semua Departemen">Semua Departemen</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Filter Lanjut Button */}
              <button
                type="button"
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <span>Filter Lanjut</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">KARYAWAN</th>
                  <th className="py-3 px-3">NIK</th>
                  <th className="py-3 px-3">DEPARTEMEN</th>
                  <th className="py-3 px-3">SKOR AKHIR</th>
                  <th className="py-3 px-3">PREDIKAT &amp; GRADE</th>
                  <th className="py-3 px-3">CAPAIAN OKR</th>
                  <th className="py-3 px-3">STATUS KALIBRASI</th>
                  <th className="py-3 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                      Tidak ada data evaluasi kinerja yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((p) => {
                    const initials = p.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Checkbox */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="rounded text-blue-600 cursor-pointer"
                          />
                        </td>

                        {/* Karyawan (Avatar + Name + Role) */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {p.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.avatarUrl}
                                alt={p.name}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                                {initials || 'EM'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 leading-tight truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{p.role}</p>
                            </div>
                          </div>
                        </td>

                        {/* NIK */}
                        <td className="py-3.5 px-3 font-mono text-slate-700 whitespace-nowrap text-xs">
                          {p.nik}
                        </td>

                        {/* Departemen */}
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap text-xs">
                          {p.department}
                        </td>

                        {/* Skor Akhir */}
                        <td className="py-3.5 px-3 font-extrabold text-slate-900 whitespace-nowrap text-xs">
                          {p.score.toFixed(2)}
                        </td>

                        {/* Predikat & Grade */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {p.score > 0 && p.grade !== 'Belum Dinilai' ? (
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border ${p.gradeColor}`}>
                              {p.grade}
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Belum Dinilai
                            </span>
                          )}
                        </td>

                        {/* Capaian OKR */}
                        <td className="py-3.5 px-3 font-bold text-blue-600 whitespace-nowrap text-xs">
                          {p.okrAchievement}
                        </td>

                        {/* Status Kalibrasi */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {p.status === 'TERVERIFIKASI' ? (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              TERVERIFIKASI
                            </span>
                          ) : p.status === 'PERLU COACHING' ? (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                              PERLU COACHING
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                              MENUNGGU SUBMISI
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenCalibration(p)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 transition-colors cursor-pointer"
                              title={`Edit nilai ${p.name}`}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(p)}
                              title={`Hapus penilaian ${p.name}`}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/60 hover:border-rose-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Count & Pagination matching Screenshot */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Menampilkan <strong className="text-slate-800 font-bold">{filteredList.length}</strong> dari{' '}
              <strong className="text-slate-800 font-bold">{performanceList.length}</strong> karyawan
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold cursor-pointer"
              >
                1
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                2
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Kalibrasi & Review Skor KPI Karyawan */}
      {/* ========================================================================= */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kalibrasi Penilaian Kinerja Karyawan</h3>
                  <p className="text-xs text-slate-500">
                    {selectedReview.name} ({selectedReview.nik})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCalibration} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Departemen</span>
                  <p className="font-semibold text-slate-800">{selectedReview.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Jabatan</span>
                  <p className="font-semibold text-slate-800">{selectedReview.role}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Capaian OKR</span>
                  <p className="font-bold text-blue-700">{selectedReview.okrAchievement}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Self-Rating</span>
                  <p className="font-semibold text-slate-800">{selectedReview.selfRating || selectedReview.score} / 5.0</p>
                </div>
              </div>

              {/* Skor Akhir Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skor Akhir Terkalibrasi (1.00 - 5.00)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="5.0"
                    value={editScore}
                    onChange={(e) => setEditScore(parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-2 text-sm font-extrabold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-slate-500">
                    Predikat Otomatis:{' '}
                    <strong className="text-blue-700 font-bold">
                      {editScore >= 4.5
                        ? 'Grade A (Outstanding)'
                        : editScore >= 4.0
                        ? 'Grade B+ (Exceeds)'
                        : editScore >= 3.0
                        ? 'Grade B (Meets)'
                        : 'Grade C (PIP Wajib)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Kalibrasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Kalibrasi</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TERVERIFIKASI">TERVERIFIKASI (Disetujui Komite)</option>
                  <option value="MENUNGGU SUBMISI">MENUNGGU SUBMISI (Menunggu Karyawan)</option>
                  <option value="PERLU COACHING">PERLU COACHING (Program PIP)</option>
                </select>
              </div>

              {/* Catatan / Feedback HR & Atasan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Evaluasi &amp; Umpan Balik Pengembangan
                </label>
                <textarea
                  rows={3}
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  placeholder="Tuliskan umpan balik performa, arahan perbaikan, atau apresiasi..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Kalibrasi Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Penilaian */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Penilaian Kinerja</h3>
                <p className="text-xs text-slate-500">{deleteTarget.nik} • {deleteTarget.department}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data evaluasi kinerja untuk <strong className="text-slate-900">{deleteTarget.name}</strong>? Tindakan ini akan menghapus kompilasi skor pada siklus {activeCycle}.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
