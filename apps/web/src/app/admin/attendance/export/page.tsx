'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  SlidersHorizontal,
  Eye,
  RefreshCw,
  Maximize2,
  Info,
  Check,
  Clock,
  CalendarCheck,
  FileSpreadsheet,
  Send,
  X,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building2,
  Database,
  Sliders,
} from 'lucide-react';

interface AttendanceSampleRecord {
  nik: string;
  name: string;
  initials: string;
  avatarBg: string;
  department: string;
  attendanceDays: number;
  lateMinutes: number;
  overtimeHours: number;
}

export default function AttendanceExportRecapPage() {
  // 1. Filter States
  const [activePreset, setActivePreset] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [startDate, setStartDate] = useState('2025-03-01');
  const [endDate, setEndDate] = useState('2025-03-24');
  const [selectedDepartment, setSelectedDepartment] = useState('Semua Departemen (Operasional, TI, HR, Sales, Legal)');
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi');
  const [selectedContract, setSelectedContract] = useState('Semua Status Kontrak');

  // 2. Checkboxes for Columns
  const [columns, setColumns] = useState({
    biometrics: true,
    lateIn: true,
    overtime: true,
    paidLeave: true,
    alpha: true,
    geofence: true,
  });

  // 3. View & Modal States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Schedule modal state
  const [scheduleCron, setScheduleCron] = useState('Setiap Tanggal 25 (Cut-off Payroll)');
  const [recipientEmail, setRecipientEmail] = useState('hod.all@nexora.co.id; finance-payroll@nexora.co.id');

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sample Preview Data (Matching screenshot table)
  const sampleRecords: AttendanceSampleRecord[] = [
    {
      nik: 'NX-2019-041',
      name: 'Raden Bagus Prakoso',
      initials: 'R',
      avatarBg: 'bg-blue-600 text-white',
      department: 'Teknologi & TI',
      attendanceDays: 22,
      lateMinutes: 0,
      overtimeHours: 18.5,
    },
    {
      nik: 'NX-2021-118',
      name: 'Siti Nurhaliza Putri',
      initials: 'S',
      avatarBg: 'bg-slate-700 text-white',
      department: 'People Operations',
      attendanceDays: 21,
      lateMinutes: 15,
      overtimeHours: 4.0,
    },
    {
      nik: 'NX-2022-089',
      name: 'Dimas Arya Pangestu',
      initials: 'D',
      avatarBg: 'bg-slate-700 text-white',
      department: 'Operasional Lapangan',
      attendanceDays: 20,
      lateMinutes: 0,
      overtimeHours: 24.0,
    },
    {
      nik: 'NX-2018-012',
      name: 'Hendro Wibowo, S.T.',
      initials: 'H',
      avatarBg: 'bg-[#1E3A8A] text-white',
      department: 'Manufaktur Cikarang',
      attendanceDays: 22,
      lateMinutes: 0,
      overtimeHours: 31.5,
    },
    {
      nik: 'NX-2023-305',
      name: 'Anindya Kusuma Wardani',
      initials: 'A',
      avatarBg: 'bg-[#1E3A8A] text-white',
      department: 'Pemasaran & Brand',
      attendanceDays: 19,
      lateMinutes: 45,
      overtimeHours: 0.0,
    },
  ];

  // Toggle all checkboxes
  const handleToggleAllColumns = () => {
    const allChecked = Object.values(columns).every(Boolean);
    setColumns({
      biometrics: !allChecked,
      lateIn: !allChecked,
      overtime: !allChecked,
      paidLeave: !allChecked,
      alpha: !allChecked,
      geofence: !allChecked,
    });
    showToast(allChecked ? 'Semua kolom dinonaktifkan' : 'Semua kolom terpilih');
  };

  // Instant Download Action (.xlsx / .csv)
  const handleDownloadNow = () => {
    showToast('Mengompilasi dan mengunduh berkas Rekapitulasi Presensi (.xlsx)...', 'info');
    setTimeout(() => {
      // Generate CSV download
      const headers = 'NIK,NAMA KARYAWAN,DEPARTEMEN,TOTAL HARI KEHADIRAN,TOTAL TERLAMBAT (MENIT),TOTAL LEMBUR (JAM)\n';
      const rows = sampleRecords
        .map(
          (r) =>
            `"${r.nik}","${r.name}","${r.department}",${r.attendanceDays},${r.lateMinutes},${r.overtimeHours}`
        )
        .join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rekapitulasi_Presensi_Karyawan_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Berkas rekap presensi (1.248 rekaman) berhasil diunduh!');
    }, 600);
  };

  // Refresh Preview
  const handleRefreshPreview = () => {
    setIsRefreshing(true);
    showToast('Menyinkronkan data pratinjau dengan log IoT biometrik...', 'info');
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Pratinjau data rekap berhasil diperbarui!');
    }, 600);
  };

  // Save Schedule Routine
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduleModalOpen(false);
    showToast(`Jadwal pengiriman otomatis berhasil diatur ke ${recipientEmail}`);
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
          <Link href="/admin/attendance" className="hover:text-blue-600 transition-colors">
            Presensi &amp; Waktu
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Ekspor &amp; Rekapitulasi Presensi</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Pusat Unduh &amp; Konfigurasi Rekap Presensi
              </h1>
              {/* Circular Badge: Modul Siap Ekspor */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Modul Siap Ekspor</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Sesuaikan filter periode tanggal, metrik ketidakhadiran, ringkasan lembur (SPL), format
              berkas (.xlsx, .csv, .pdf), dan jadwalkan pengiriman otomatis ke manajer departemen.
            </p>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Kembali ke Presensi */}
            <Link
              href="/admin/attendance"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Kembali ke Presensi</span>
            </Link>

            {/* Jadwalkan Pengiriman Rutin */}
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700 shadow-xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Jadwalkan Pengiriman Rutin</span>
            </button>

            {/* Unduh Rekap Sekarang */}
            <button
              type="button"
              onClick={handleDownloadNow}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Unduh Rekap Sekarang</span>
            </button>
          </div>
        </div>

        {/* Two Column Layout: Configuration Left, Live Preview Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Configuration Controls (5 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* CARD 1: Periode & Rentang Waktu */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      1. Periode &amp; Rentang Waktu
                    </h3>
                    <p className="text-[11px] text-slate-400">Tentukan interval rekapitulasi data</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-lg">
                  Aktif
                </span>
              </div>

              {/* Quick Presets Pills */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActivePreset('today');
                    setStartDate('2025-03-24');
                    setEndDate('2025-03-24');
                  }}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                    activePreset === 'today'
                      ? 'bg-blue-50/80 border-blue-600 text-blue-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Hari Ini
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePreset('week');
                    setStartDate('2025-03-17');
                    setEndDate('2025-03-24');
                  }}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                    activePreset === 'week'
                      ? 'bg-blue-50/80 border-blue-600 text-blue-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Minggu Ini
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePreset('month');
                    setStartDate('2025-03-01');
                    setEndDate('2025-03-24');
                  }}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                    activePreset === 'month'
                      ? 'bg-blue-50/80 border-blue-600 text-blue-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Bulan Ini
                </button>

                <button
                  type="button"
                  onClick={() => setActivePreset('custom')}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all text-center ${
                    activePreset === 'custom'
                      ? 'bg-blue-50/80 border-blue-600 text-blue-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Kustom
                </button>
              </div>

              {/* Date Inputs Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Mulai
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Akhir (Cut-off)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payroll Cycle Alert */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Siklus penutupan payroll berjalan:{' '}
                  <strong className="text-slate-900 font-bold">26 Feb &ndash; 25 Mar 2025</strong>
                </span>
              </div>
            </div>

            {/* CARD 2: Filter Ruang Lingkup */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    2. Filter Ruang Lingkup
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Penyaringan unit kerja &amp; status kepegawaian
                  </p>
                </div>
              </div>

              {/* Departemen / Divisi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Departemen / Divisi
                </label>
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Semua Departemen (Operasional, TI, HR, Sales, Legal)">
                      Semua Departemen (Operasional, TI, HR, Sales, Legal...)
                    </option>
                    <option value="Teknologi & TI">Teknologi &amp; TI</option>
                    <option value="Operasional Lapangan & Logistik">
                      Operasional Lapangan &amp; Logistik
                    </option>
                    <option value="People & Culture (HR)">People &amp; Culture (HR)</option>
                    <option value="Keuangan & Pajak">Keuangan &amp; Pajak</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Lokasi & Status Kontrak */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Lokasi Kerja
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full appearance-none px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Semua Lokasi">Semua Lokasi</option>
                      <option value="HQ SCBD Jakarta">HQ SCBD Jakarta</option>
                      <option value="Pabrik Cikarang">Pabrik Cikarang</option>
                      <option value="Hub Surabaya">Hub Surabaya</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jenis Ikatan Kerja
                  </label>
                  <div className="relative">
                    <select
                      value={selectedContract}
                      onChange={(e) => setSelectedContract(e.target.value)}
                      className="w-full appearance-none px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="Semua Status Kontrak">Semua Status Kontrak</option>
                      <option value="PKWTT (Tetap)">PKWTT (Tetap)</option>
                      <option value="PKWT (Kontrak)">PKWT (Kontrak)</option>
                      <option value="Magang / Internship">Magang / Internship</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Komponen Data Rekap */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      3. Komponen Data Rekap
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Pilih rincian kolom yang masuk ke lembar unduh
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAllColumns}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Centang Semua
                </button>
              </div>

              {/* Checkboxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1 */}
                <div
                  onClick={() => setColumns({ ...columns, biometrics: !columns.biometrics })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    columns.biometrics ? 'bg-blue-50/50 border-blue-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border mt-0.5 ${
                      columns.biometrics ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {columns.biometrics && <Check className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">Log Biometrik Lengkap</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">Jam Masuk, Istirahat, Pulang</p>
                  </div>
                </div>

                {/* 2 */}
                <div
                  onClick={() => setColumns({ ...columns, lateIn: !columns.lateIn })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    columns.lateIn ? 'bg-blue-50/50 border-blue-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border mt-0.5 ${
                      columns.lateIn ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {columns.lateIn && <Check className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">Keterlambatan (Late In)</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">Menit akumulasi &amp; potongan</p>
                  </div>
                </div>

                {/* 3 */}
                <div
                  onClick={() => setColumns({ ...columns, overtime: !columns.overtime })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    columns.overtime ? 'bg-blue-50/50 border-blue-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border mt-0.5 ${
                      columns.overtime ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {columns.overtime && <Check className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">Lembur &amp; SPL Otorisasi</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">Jam lembur hari kerja &amp; libur</p>
                  </div>
                </div>

                {/* 4 */}
                <div
                  onClick={() => setColumns({ ...columns, paidLeave: !columns.paidLeave })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    columns.paidLeave ? 'bg-blue-50/50 border-blue-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border mt-0.5 ${
                      columns.paidLeave ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {columns.paidLeave && <Check className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">Cuti &amp; Izin Berbayar</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">Cuti tahunan, sakit, izin resmi</p>
                  </div>
                </div>

                {/* 5 */}
                <div
                  onClick={() => setColumns({ ...columns, alpha: !columns.alpha })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    columns.alpha ? 'bg-blue-50/50 border-blue-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border mt-0.5 ${
                      columns.alpha ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {columns.alpha && <Check className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">Potongan Absensi / Alpa</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">Hari tidak hadir tanpa kabar</p>
                  </div>
                </div>

                {/* 6 */}
                <div
                  onClick={() => setColumns({ ...columns, geofence: !columns.geofence })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    columns.geofence ? 'bg-blue-50/50 border-blue-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border mt-0.5 ${
                      columns.geofence ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {columns.geofence && <Check className="w-3 h-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">Catatan Geofencing &amp; Foto</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">Validasi GPS &amp; liveness check</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Live Table Preview & Summary (7 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* Table Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        Pratinjau Lembar Data Rekap
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Siap Unduh (1.248 Baris)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Menampilkan sampel 5 dari total 1.248 entri karyawan yang terfilter
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefreshPreview}
                    disabled={isRefreshing}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Segarkan Pratinjau</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Layar Penuh</span>
                  </button>
                </div>
              </div>

              {/* Sample Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">NIK</th>
                      <th className="py-2.5 px-3">NAMA KARYAWAN</th>
                      <th className="py-2.5 px-3">DEPARTEMEN</th>
                      <th className="py-2.5 px-3">KEHADIRAN</th>
                      <th className="py-2.5 px-3">TELAT (MNT)</th>
                      <th className="py-2.5 px-3">LEMBUR (JAM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {sampleRecords.map((record) => (
                      <tr key={record.nik} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {record.nik}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${record.avatarBg}`}
                            >
                              {record.initials}
                            </div>
                            <span className="font-bold text-slate-900 whitespace-nowrap">
                              {record.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {record.department}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600 whitespace-nowrap">
                          {record.attendanceDays} Hari
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {record.lateMinutes > 0 ? (
                            <span className="text-amber-600 font-bold">
                              {record.lateMinutes} mnt
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {record.overtimeHours > 0 ? `${record.overtimeHours} Jam` : '0.0 Jam'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Menampilkan 1-5 dari 1.248 rekaman karyawan</span>
                <div className="flex items-center gap-1 font-semibold">
                  <button className="px-2 py-1 rounded hover:bg-slate-100">&lt;</button>
                  <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">1</button>
                  <button className="px-2 py-1 rounded hover:bg-slate-100">2</button>
                  <button className="px-2 py-1 rounded hover:bg-slate-100">3</button>
                  <span className="px-1 text-slate-400">...</span>
                  <button className="px-2 py-1 rounded hover:bg-slate-100">125</button>
                  <button className="px-2 py-1 rounded hover:bg-slate-100">&gt;</button>
                </div>
              </div>
            </div>

            {/* Bottom 3 Metric Summary Cards (Under Table) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: TOTAL JAM LEMBUR (SPL) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>TOTAL JAM LEMBUR (SPL)</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">1,420 Jam</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">+8.2% vs siklus lalu</p>
                </div>
              </div>

              {/* Card 2: KEPATUHAN KEHADIRAN */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>KEPATUHAN KEHADIRAN</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">96.4%</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Batas aman KPI: &gt;95%</p>
                </div>
              </div>

              {/* Card 3: ESTIMASI BOBOT BERKAS */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>ESTIMASI BOBOT BERKAS</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">~2.4 MB</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Format .xlsx &amp; .csv</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Jadwalkan Pengiriman Rutin */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Otomasi Jadwal Pengiriman Rekap Presensi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kirim laporan rekap kehadiran rutin ke email manajer divisi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Frekuensi Siklus Otomatis
                </label>
                <select
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Setiap Tanggal 25 (Cut-off Payroll)">
                    Setiap Tanggal 25 (Tepat Cut-off Payroll Bulanan)
                  </option>
                  <option value="Setiap Senin Pagi (08:00 WIB)">
                    Setiap Senin Pagi (Mingguan 08:00 WIB)
                  </option>
                  <option value="Akhir Hari Kerja (Harian 18:00 WIB)">
                    Setiap Akhir Hari Kerja (Harian 18:00 WIB)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Daftar Email Penerima (Dipisahkan titik koma)
                </label>
                <input
                  type="text"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Format Lampiran Berkas
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-blue-500 bg-blue-50/50 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">Microsoft Excel (.xlsx)</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span className="font-medium text-slate-700">Dokumen PDF Resmi</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Aktifkan Jadwal Otomatis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Layar Penuh Pratinjau Table */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Maximize2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Layar Penuh — Rekapitulasi Presensi Karyawan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">NIK</th>
                    <th className="py-2.5 px-3">NAMA KARYAWAN</th>
                    <th className="py-2.5 px-3">DEPARTEMEN</th>
                    <th className="py-2.5 px-3">TOTAL HADIR</th>
                    <th className="py-2.5 px-3">TERLAMBAT</th>
                    <th className="py-2.5 px-3">TOTAL LEMBUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {sampleRecords.map((r) => (
                    <tr key={r.nik} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono">{r.nik}</td>
                      <td className="py-3 px-3 font-bold">{r.name}</td>
                      <td className="py-3 px-3 text-slate-600">{r.department}</td>
                      <td className="py-3 px-3 text-emerald-600 font-bold">{r.attendanceDays} Hari</td>
                      <td className="py-3 px-3 text-amber-600 font-bold">{r.lateMinutes} mnt</td>
                      <td className="py-3 px-3 text-slate-900 font-bold">{r.overtimeHours} Jam</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs text-slate-500">Total 1.248 baris data siap diekspor</span>
              <button
                type="button"
                onClick={() => setIsFullscreenModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
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
