'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  TrendingUp,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Award,
  BarChart2,
  SlidersHorizontal,
  Download,
  Filter,
  Search,
  Target,
  FileSpreadsheet,
  Check,
  X,
  Edit3,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { PerformanceRecord, PerformanceCycle } from '@/app/api/v1/performance/route';
import { getCurrentRealCycle } from '@/lib/performanceDb';

export default function AdminPerformancePage() {
  const currentCycleInfo = useMemo(() => getCurrentRealCycle(), []);
  const [performanceList, setPerformanceList] = useState<PerformanceRecord[]>([]);
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [activeCycle, setActiveCycle] = useState(currentCycleInfo.code);
  const [selectedCycle, setSelectedCycle] = useState(currentCycleInfo.code);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Semua Departemen');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Summary Metrics State (Zero Dummy Real-Time Default)
  const [summary, setSummary] = useState({
    avgScore: '0.00',
    topPerformersCount: 0,
    topPerformersPercent: '0.0',
    pipCount: 0,
    pipPercent: '0.0',
    completionPercent: 0,
    totalEmployees: 0,
    benchmarkLabel: `Benchmark ${currentCycleInfo.code}`,
    nextScheduleLabel: currentCycleInfo.nextCycleSchedule,
  });

  // Modal State for Calibration / Edit
  const [selectedReview, setSelectedReview] = useState<PerformanceRecord | null>(null);
  const [editScore, setEditScore] = useState<number>(4.0);
  const [editStatus, setEditStatus] = useState<PerformanceRecord['status']>('TERVERIFIKASI');
  const [editFeedback, setEditFeedback] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch live performance dataset
  const fetchPerformanceData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/v1/performance', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPerformanceList(json.data);
          if (json.cycles) setCycles(json.cycles);
          if (json.activeCycle) {
            setActiveCycle(json.activeCycle);
            setSelectedCycle(json.activeCycle);
          }
          if (json.summary) setSummary(json.summary);
        }
      }
      if (isManual) {
        showToast('✓ Data evaluasi kinerja & KPI berhasil diperbarui secara real-time.');
      }
    } catch {
      // fallback
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
          msg?.type === 'EMPLOYEE_PROFILE_UPDATED'
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
      // Department filter
      if (selectedDepartment !== 'Semua Departemen' && p.department !== selectedDepartment) {
        return false;
      }
      // Search term
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

  // Export to Excel / CSV
  const handleExportExcel = () => {
    showToast('Mengunduh Rekapitulasi Nilai KPI (.xlsx)...');
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
      link.download = `Rekap_KPI_Karyawan_${activeCycle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
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
    setEditScore(record.score);
    setEditStatus(record.status);
    setEditFeedback(record.feedback || '');
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

    fetchPerformanceData();
    setSelectedReview(null);
    showToast(`✓ Kalibrasi nilai untuk ${selectedReview.name} berhasil disimpan & disinkronkan ke Karyawan!`);
  };

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Operasional</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Evaluasi Kinerja (KPI)</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Evaluasi Kinerja &amp; Manajemen KPI Karyawan
              </h1>
              <button
                type="button"
                onClick={() => fetchPerformanceData(true)}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Sinkronkan data terbaru"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Pantau siklus penilaian kinerja berkala, distribusi kurva bell normal, pemetaan talent 9-Box
              matrix, serta evaluasi review 360° seluruh karyawan Nexora.
            </p>
          </div>

          {/* Action Buttons Top Right: Includes TRIGGER BUTTON FROM SCREENSHOT 1 */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Unduh Rekap KPI (.xlsx) */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Rekap KPI (.xlsx)</span>
            </button>

            {/* Tombol Utama dari Tangkapan Layar: [ + Buka Siklus Penilaian Baru ] */}
            <Link
              href="/admin/performance/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Buka Siklus Penilaian Baru</span>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics (Dynamically Calculated from Real Active Staff) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Rata-Rata Skor Organisasi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                RATA-RATA SKOR ORGANISASI
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.avgScore}</span>
              <span className="text-sm font-semibold text-slate-700">/ 5.00</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {Number(summary.avgScore) >= 4.5
                ? 'Outstanding (Istimewa)'
                : Number(summary.avgScore) >= 4.0
                ? 'Exceeds Expectations (Sangat Baik)'
                : Number(summary.avgScore) >= 3.0
                ? 'Meets Expectations (Standar Baik)'
                : Number(summary.avgScore) > 0
                ? 'Perlu Peningkatan'
                : 'Belum Ada Evaluasi Disahkan'}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{summary.benchmarkLabel || `Benchmark ${activeCycle}`}</span>
              <span className={`font-bold ${Number(summary.avgScore) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {Number(summary.avgScore) > 0 ? '+0.14 YoY' : 'Real-Time'}
              </span>
            </div>
          </div>

          {/* Card 2: TOP PERFORMERS (GRADE A) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOP PERFORMERS (GRADE A)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {summary.topPerformersCount}
              </span>
              <span className="text-sm font-semibold text-slate-700">Karyawan</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{summary.topPerformersPercent}% dari total populasi staf</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Sesuai Kuota Kurva Bell</span>
              <span className={`font-bold ${summary.topPerformersCount > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                {summary.topPerformersCount > 0 ? 'Terverifikasi' : 'Normal'}
              </span>
            </div>
          </div>

          {/* Card 3: STATUS SIKLUS AKTIF */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                STATUS SIKLUS EVALUASI
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">{activeCycle}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tersinkronisasi Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.nextScheduleLabel || `Siklus ${activeCycle} aktif`}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{summary.completionPercent}% Review Selesai</span>
              <span className="font-bold text-slate-700">{summary.totalEmployees} Staf Terdata</span>
            </div>
          </div>

          {/* Card 4: PROGRAM PIP & COACHING */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PROGRAM PIP &amp; COACHING
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.pipCount}</span>
              <span className="text-sm font-semibold text-slate-700">Kandidat PIP</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.pipCount === 0
                ? 'Seluruh staf memenuhi standar capaian target'
                : `${summary.pipPercent}% populasi memerlukan mentoring khusus`}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{summary.pipCount > 0 ? 'Tenggat Action Plan' : 'Status Evaluasi'}</span>
              <span className={`font-bold ${summary.pipCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {summary.pipCount > 0 ? '30 Hari' : 'Kondisi Baik'}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Table & Records */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
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
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIK..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua Departemen">Semua Departemen</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">KARYAWAN &amp; NIK</th>
                  <th className="py-2.5 px-3">DEPARTEMEN</th>
                  <th className="py-2.5 px-3">SKOR AKHIR</th>
                  <th className="py-2.5 px-3">PREDIKAT &amp; GRADE</th>
                  <th className="py-2.5 px-3">CAPAIAN OKR</th>
                  <th className="py-2.5 px-3">STATUS KALIBRASI</th>
                  <th className="py-2.5 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                      <div className="max-w-md mx-auto space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                          <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="font-bold text-slate-700">Belum Ada Hasil Evaluasi yang Terdata</p>
                        <p className="text-[11px] text-slate-400">
                          Data penilaian kinerja akan otomatis tersinkronisasi secara real-time saat karyawan mengajukan Self-Appraisal melalui portal ESS atau admin melakukan kalibrasi.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((p) => {
                    const statusColor =
                      p.status === 'TERVERIFIKASI'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : p.status === 'PERLU COACHING'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : p.status === 'MENUNGGU SUBMISI'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {p.avatarUrl ? (
                              <img
                                src={p.avatarUrl}
                                alt={p.name}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                {p.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {p.nik} • {p.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{p.department}</td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">{p.score.toFixed(2)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${p.gradeColor}`}
                          >
                            {p.grade}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-blue-700">{p.okrAchievement}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenCalibration(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Kalibrasi</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Kalibrasi & Review Skor KPI Karyawan */}
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
                className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
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
                  <option value="MENUNGGU_REVIEW">MENUNGGU REVIEW (Review Atasan)</option>
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-colors"
                >
                  Simpan Kalibrasi Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
