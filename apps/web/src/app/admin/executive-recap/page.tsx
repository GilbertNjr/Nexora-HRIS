'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  ArrowLeft,
  Send,
  Download,
  SlidersHorizontal,
  ChevronDown,
  Users,
  Clock,
  CreditCard,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  FileText,
  Mail,
  Check,
  X,
  Building2,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function ExecutiveRecapExportPage() {
  // Configuration States
  const [selectedPeriod, setSelectedPeriod] = useState('Bulan Ini: Maret 2025 (Aktif)');
  const [analysisDepth, setAnalysisDepth] = useState<'summary' | 'comprehensive'>('summary');
  const [pageLayout, setPageLayout] = useState<'portrait' | 'landscape'>('portrait');

  // Selected Modules Checklist
  const [selectedModules, setSelectedModules] = useState({
    headcount: true,
    attendance: true,
    payroll: true,
    performance: true,
    recruitment: true,
    compliance: true,
  });

  // Preview States
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = analysisDepth === 'summary' ? 3 : 6;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [directorEmail, setDirectorEmail] = useState('direksi@nexora.co.id; ceo@nexora.co.id');
  const [emailNotes, setEmailNotes] = useState('Terlampir Ringkasan Eksekutif Kinerja SDM & Realisasi Anggaran Periode Kuartal I / Maret 2025 untuk tinjauan rapat dewan direksi.');

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Module Selection
  const toggleModule = (key: keyof typeof selectedModules) => {
    setSelectedModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const activeModulesCount = Object.values(selectedModules).filter(Boolean).length;

  // Print / Download PDF
  const handleDownloadPDF = () => {
    showToast('Menyiapkan file PDF resolusi tinggi siap cetak...', 'info');
    setTimeout(() => {
      window.print();
      showToast('Dokumen Rekap Eksekutif PDF siap dicetak/diunduh!');
    }, 600);
  };

  // Send to Board of Directors
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailModalOpen(false);
    showToast(`Dokumen rekap eksekutif berhasil dikirimkan ke: ${directorEmail}`);
  };

  // Refresh Preview
  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast('Menyinkronkan data pratinjau dokumen...', 'info');
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Pratinjau dokumen berhasil diperbarui!');
    }, 500);
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Ekspor Rekap Eksekutif SDM</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Generator &amp; Konfigurasi Rekap Eksekutif SDM
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Sesuaikan komponen data, periode analisis, metrik strategis, dan pratinjau dokumen
              laporan sebelum diekspor ke format PDF resolusi tinggi atau didistribusikan langsung ke
              jajaran direksi.
            </p>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Back to Dashboard */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Kembali ke Dashboard</span>
            </Link>

            {/* Send to Board */}
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700 shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5 text-slate-600" />
              <span>Kirim Langsung ke Direksi (Email)</span>
            </button>

            {/* Primary Action: Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Unduh Dokumen PDF (.pdf)</span>
              <span className="text-[9px] font-extrabold uppercase tracking-wider bg-blue-700/80 text-white px-1.5 py-0.5 rounded ml-1">
                SIAP CETAK
              </span>
            </button>
          </div>
        </div>

        {/* Two Column Layout: Configuration & Live Document Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Controls & Module Selection (5 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card 1: Periode & Format Laporan */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Periode &amp; Format Laporan
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-lg">
                  Step 1
                </span>
              </div>

              {/* Field 1: Periode Pelaporan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Periode Pelaporan Data
                </label>
                <div className="relative">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => {
                      setSelectedPeriod(e.target.value);
                      showToast(`Periode data diubah ke ${e.target.value}`);
                    }}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Bulan Ini: Maret 2025 (Aktif)">
                      Bulan Ini: Maret 2025 (Aktif)
                    </option>
                    <option value="Kuartal I 2025 (Jan - Mar)">
                      Kuartal I 2025 (Jan - Mar)
                    </option>
                    <option value="Februari 2025">Februari 2025</option>
                    <option value="Tahun 2024 Penuh (Tahunan)">
                      Tahun 2024 Penuh (Tahunan)
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Tingkat Kedalaman Analisis */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tingkat Kedalaman Analisis
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Ringkasan Eksekutif */}
                  <div
                    onClick={() => setAnalysisDepth('summary')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      analysisDepth === 'summary'
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          analysisDepth === 'summary' ? 'border-blue-600' : 'border-slate-400'
                        }`}
                      >
                        {analysisDepth === 'summary' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">Ringkasan Eksekutif</p>
                      <p className="text-[11px] text-slate-500">1 - 3 Halaman A4 ringkas</p>
                    </div>
                  </div>

                  {/* Option 2: Laporan Komprehensif */}
                  <div
                    onClick={() => setAnalysisDepth('comprehensive')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      analysisDepth === 'comprehensive'
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          analysisDepth === 'comprehensive' ? 'border-blue-600' : 'border-slate-400'
                        }`}
                      >
                        {analysisDepth === 'comprehensive' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">Laporan Komprehensif</p>
                      <p className="text-[11px] text-slate-500">5 - 8 Halaman rinci divisi</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 3: Format Halaman & Tata Letak */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Format Halaman &amp; Tata Letak
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPageLayout('portrait')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      pageLayout === 'portrait'
                        ? 'bg-[#1D4ED8] text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Portrait (A4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageLayout('landscape')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      pageLayout === 'landscape'
                        ? 'bg-[#1D4ED8] text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Landscape (A4)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Komponen Modul Terpilih */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">Komponen Modul Terpilih</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {activeModulesCount} dari 6 Modul Aktif
                </span>
              </div>

              <div className="space-y-2">
                {/* 1. Metrik Kunci Headcount & Demografi */}
                <div
                  onClick={() => toggleModule('headcount')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModules.headcount
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selectedModules.headcount
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedModules.headcount && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        Metrik Kunci Headcount &amp; Demografi
                      </p>
                      <p className="text-[11px] text-slate-500">Total staf, rasio gender, komposisi unit</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 2. Tingkat Kehadiran & Beban Lembur */}
                <div
                  onClick={() => toggleModule('attendance')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModules.attendance
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selectedModules.attendance
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedModules.attendance && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        Tingkat Kehadiran &amp; Beban Lembur
                      </p>
                      <p className="text-[11px] text-slate-500">Persentase hadir, durasi lembur per divisi</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 3. Realisasi Biaya Gaji & Payroll */}
                <div
                  onClick={() => toggleModule('payroll')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModules.payroll
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selectedModules.payroll
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedModules.payroll && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        Realisasi Biaya Gaji &amp; Payroll
                      </p>
                      <p className="text-[11px] text-slate-500">Perbandingan pagu anggaran vs realisasi</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 4. Evaluasi Kinerja (Skor KPI & OKR) */}
                <div
                  onClick={() => toggleModule('performance')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModules.performance
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selectedModules.performance
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedModules.performance && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        Evaluasi Kinerja (Skor KPI &amp; OKR)
                      </p>
                      <p className="text-[11px] text-slate-500">Pencapaian target operasional q1</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 5. Pipeline Rekrutmen & Time-to-Hire */}
                <div
                  onClick={() => toggleModule('recruitment')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModules.recruitment
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selectedModules.recruitment
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedModules.recruitment && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        Pipeline Rekrutmen &amp; Time-to-Hire
                      </p>
                      <p className="text-[11px] text-slate-500">Kandidat berproses, efisiensi waktu hire</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 6. Kepatuhan BPJS & Audit HR */}
                <div
                  onClick={() => toggleModule('compliance')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModules.compliance
                      ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selectedModules.compliance
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedModules.compliance && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        Kepatuhan BPJS &amp; Audit HR
                      </p>
                      <p className="text-[11px] text-slate-500">Iuran regulasi dan kesiapan audit</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Live PDF Document Preview Canvas (7 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-3">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
              {/* Left Sync Status & Pagination */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Pratinjau Sinkron
                </span>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  <span>
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>

              {/* Right Tools: Zoom, Fullscreen, Refresh */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                    className="p-0.5 hover:text-slate-900"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-semibold px-1 text-[11px]">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                    className="p-0.5 hover:text-slate-900"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Segarkan</span>
                </button>
              </div>
            </div>

            {/* Document Preview Canvas */}
            <div className="bg-slate-100/80 rounded-2xl p-4 sm:p-6 border border-slate-200/90 overflow-x-auto flex justify-center">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  width: pageLayout === 'portrait' ? '100%' : '100%',
                  maxWidth: pageLayout === 'portrait' ? '650px' : '780px',
                }}
                className="bg-white shadow-2xl rounded-sm p-8 sm:p-10 border border-slate-200/80 relative overflow-hidden transition-all duration-300 font-sans print:shadow-none print:border-none print:m-0 print:p-0"
              >
                {/* Diagonal Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                  <span className="text-slate-100 font-black tracking-widest text-6xl sm:text-7xl -rotate-45 uppercase opacity-90">
                    CONFIDENTIAL
                  </span>
                </div>

                {/* PDF Header */}
                <div className="relative z-10 flex items-start justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0F172A] flex items-center justify-center text-white font-extrabold text-sm">
                      NX
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        Nexora HRIS Enterprise
                      </h4>
                      <p className="text-[9px] font-bold text-slate-500 tracking-wider">
                        PEOPLE ANALYTICS &amp; STRATEGIC OPERATIONS
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold text-rose-600 tracking-wider uppercase">
                      STRICTLY CONFIDENTIAL
                    </p>
                    <p className="text-[9px] font-mono text-slate-500">
                      DOC/NX-HR/2025/03-EKSEKUTIF
                    </p>
                    <p className="text-[9px] text-slate-400">Diterbitkan: 24 Maret 2025</p>
                  </div>
                </div>

                {/* Report Title */}
                <div className="relative z-10 py-5 space-y-1">
                  <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight uppercase">
                    REKAPITULASI KINERJA &amp; ANGGARAN SDM
                  </h2>
                  <h3 className="text-xs font-bold text-blue-700">
                    Laporan Eksekutif Sumber Daya Manusia — Kuartal I / Maret 2025
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                    Ikhtisar komprehensif metrik kepegawaian, serapan anggaran kompensasi, evaluasi
                    kehadiran, serta tren performa divisi korporasi.
                  </p>
                </div>

                {/* Section 1: METRIK KUNCI KINERJA ORGANISASI */}
                {selectedModules.headcount && (
                  <div className="relative z-10 py-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                        1. METRIK KUNCI KINERJA ORGANISASI
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded">
                        Target Q1 Terpenuhi
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Metric 1 */}
                      <div className="p-2.5 rounded-lg border-l-2 border-blue-600 bg-slate-50/70 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-medium">Total Staf Aktif</p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                          1,248
                        </p>
                        <p className="text-[10px] font-semibold text-blue-700 mt-0.5">↗ +3.8% YoY</p>
                      </div>

                      {/* Metric 2 */}
                      <div className="p-2.5 rounded-lg border-l-2 border-emerald-500 bg-slate-50/70 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-medium">Tingkat Kehadiran</p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                          96.4%
                        </p>
                        <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">✓ Tepat Waktu</p>
                      </div>

                      {/* Metric 3 */}
                      <div className="p-2.5 rounded-lg border-l-2 border-sky-500 bg-slate-50/70 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-medium">Realisasi Payroll</p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                          Rp 3.84 M
                        </p>
                        <p className="text-[10px] font-semibold text-sky-700 mt-0.5">98.2% Pagu Anggaran</p>
                      </div>

                      {/* Metric 4 */}
                      <div className="p-2.5 rounded-lg border-l-2 border-purple-500 bg-slate-50/70 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-medium">Skor Rata-rata KPI</p>
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                          4.12 <span className="text-[10px] font-normal text-slate-500">/ 5.0</span>
                        </p>
                        <p className="text-[10px] font-semibold text-purple-700 mt-0.5 truncate">
                          Melampaui Ekspektasi
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: DISTRIBUSI KARYAWAN PER DIVISI UTAMA */}
                <div className="relative z-10 py-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                      2. DISTRIBUSI KARYAWAN PER DIVISI UTAMA
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Kapasitas Maksimal: 1,350 Staf
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                        <span>Teknologi &amp; Rekayasa Perangkat Lunak (IT)</span>
                        <span className="font-bold">412 Staf (33%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '33%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                        <span>Operasional Pabrik &amp; Logistik Terpadu</span>
                        <span className="font-bold">310 Staf (25%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '25%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                        <span>Pemasaran, Sales &amp; Pengembangan Bisnis</span>
                        <span className="font-bold">285 Staf (23%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '23%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                        <span>Keuangan, SDM &amp; Corporate Governance</span>
                        <span className="font-bold">241 Staf (19%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '19%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: RINGKASAN REKOMENDASI STRATEGIS */}
                <div className="relative z-10 pt-3 border-t border-slate-100 space-y-1.5">
                  <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                    3. KESIMPULAN &amp; TINDAKAN STRATEGIS HR
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Efisiensi serapan payroll berada dalam batas deviasi aman (&plusmn;1.8%). Prioritas kuartal depan difokuskan pada pemenuhan lowongan rekayasa cloud dan percepatan sertifikasi kepatuhan keselamatan kerja di hub operasional.
                  </p>
                </div>

                {/* Document Footer & Signatures */}
                <div className="relative z-10 mt-6 pt-4 border-t border-slate-200 flex items-end justify-between text-[10px] text-slate-400">
                  <div>
                    <p className="font-semibold text-slate-700">Disiapkan Oleh:</p>
                    <p className="font-bold text-slate-900 mt-1">Dewi Lestari, S.Psi</p>
                    <p className="text-slate-500">HR Operations Manager</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-700">Diverifikasi &amp; Disetujui:</p>
                    <p className="font-bold text-slate-900 mt-1">Board of Directors</p>
                    <p className="text-slate-500">Nexora Enterprise Portal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Kirim Langsung ke Direksi (Email) */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Kirim Rekap Eksekutif ke Jajaran Direksi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dokumen PDF akan di-generate dan dilampirkan secara otomatis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Penerima (Direksi &amp; Pemangku Kepentingan) *
                </label>
                <input
                  type="text"
                  required
                  value={directorEmail}
                  onChange={(e) => setDirectorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lampiran Berkas Terpilih
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-800">
                      Rekap_Eksekutif_SDM_Maret_2025.pdf
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">1.8 MB (High-Res)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan Pengantar Email
                </label>
                <textarea
                  rows={3}
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Laporan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
