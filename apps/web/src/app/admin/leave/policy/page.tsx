'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  ArrowLeft,
  Download,
  Plus,
  Save,
  ShieldCheck,
  Eye,
  Boxes,
  CalendarCheck,
  Hourglass,
  Award,
  SlidersHorizontal,
  PieChart,
  Clock,
  FileText,
  Check,
  CheckCircle2,
  ChevronDown,
  BarChart2,
  Info,
  X,
  Sparkles,
  Building2,
  Layers,
  AlertCircle,
  Heart,
  User,
  Users,
  Baby,
  FileSpreadsheet,
  PlusCircle,
} from 'lucide-react';

interface LeaveTypePolicy {
  id: string;
  name: string;
  regulation: string;
  allocation: string;
  compensation: string;
  eligibility: string;
  terms: string;
  iconType: 'calendar' | 'maternity' | 'paternity' | 'wedding' | 'bereavement' | 'religion' | 'sabbatical';
  active: boolean;
}

export default function LeavePolicyConfigurationPage() {
  // Navigation Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'prorata' | 'carry_forward' | 'terms'>('matrix');

  // Filter dropdown state
  const [filterCategory, setFilterCategory] = useState('Semua Status (8)');

  // Modals
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [isPKBModalOpen, setIsPKBModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Leave Policy Matrix Dataset matching screenshot
  const [leavePolicies, setLeavePolicies] = useState<LeaveTypePolicy[]>([
    {
      id: 'lp-1',
      name: 'Cuti Tahunan Reguler',
      regulation: 'PKB Ps. 14 / UU Cipta Kerja',
      allocation: '12 Hari / Tahun',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Semua Level Karyawan',
      terms: 'H-3 Kerja • Tanpa Berkas Lampiran',
      iconType: 'calendar',
      active: true,
    },
    {
      id: 'lp-2',
      name: 'Cuti Bersalin (Maternity)',
      regulation: 'UU KIA & Ketenagakerjaan',
      allocation: '90 Hari Kalender (3 Bln)',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Wanita (Semua Level)',
      terms: 'H-14 Hari • Surat Ket. Dokter / Bidan',
      iconType: 'maternity',
      active: true,
    },
    {
      id: 'lp-3',
      name: 'Cuti Ayah (Paternity)',
      regulation: 'UU KIA No. 4/2024',
      allocation: '2 - 5 Hari Kerja',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Pria Menikah',
      terms: 'H-1 Kerja • Surat Keterangan Lahir',
      iconType: 'paternity',
      active: true,
    },
    {
      id: 'lp-4',
      name: 'Cuti Menikah Karyawan',
      regulation: 'PP No. 35/2021',
      allocation: '3 Hari Kerja',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Semua Karyawan (1x per nikah)',
      terms: 'H-7 Hari • Undangan / Akta Nikah',
      iconType: 'wedding',
      active: true,
    },
    {
      id: 'lp-5',
      name: 'Cuti Duka Cita (Keluarga Inti)',
      regulation: 'UU Ketenagakerjaan Ps. 93',
      allocation: '2 Hari Kerja',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Semua Karyawan',
      terms: 'H+1 (Emergency) • Surat Kematian',
      iconType: 'bereavement',
      active: true,
    },
    {
      id: 'lp-6',
      name: 'Cuti Ibadah Keagamaan (Haji/Umrah)',
      regulation: 'Peraturan Pemerintah & PKB',
      allocation: 'Sesuai Jadwal (Maks 40 Hari)',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Masa Kerja ≥ 2 Tahun (1x)',
      terms: 'H-30 Hari • Bukti Pendaftaran Resmi',
      iconType: 'religion',
      active: true,
    },
    {
      id: 'lp-7',
      name: 'Cuti Khitanan / Baptis Anak',
      regulation: 'PKB Nexora Enterprise Ps. 16',
      allocation: '2 Hari Kerja',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Orang Tua Anak Bersangkutan',
      terms: 'H-5 Hari • Surat Keterangan / Undangan',
      iconType: 'calendar',
      active: true,
    },
    {
      id: 'lp-8',
      name: 'Cuti Sabbatical (Loyalty 5+ Thn)',
      regulation: 'Kebijakan Retensi Bakti Internal',
      allocation: '+6 Hari Tambahan',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Masa Kerja ≥ 5 Tahun Penuh',
      terms: 'H-14 Hari • Disetujui Head of Dept',
      iconType: 'sabbatical',
      active: true,
    },
  ]);

  // Form for New Leave Type Modal
  const [newTypeForm, setNewTypeForm] = useState({
    name: '',
    regulation: 'PKB Nexora Enterprise Periode 2024-2026',
    allocation: '2 Hari Kerja',
    compensation: 'Dibayar Penuh (100%)',
    eligibility: 'Semua Level Karyawan',
    terms: 'H-3 Kerja • Lampiran Bukti',
  });

  // Export Matrix
  const handleExportMatrix = () => {
    showToast('Mengunduh Matriks Kebijakan & Kuota Saldo Cuti (.xlsx)...', 'info');
    setTimeout(() => {
      const csvHeader = 'TIPE CUTI,REGULASI ACUAN,ALOKASI KUOTA,KOMPENSASI GAJI,KELAYAKAN STAF,SYARAT & KETENTUAN\n';
      const csvRows = leavePolicies
        .map(
          (p) =>
            `"${p.name}","${p.regulation}","${p.allocation}","${p.compensation}","${p.eligibility}","${p.terms}"`
        )
        .join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Matriks_Kebijakan_Cuti_Nexora_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Matriks kebijakan cuti berhasil diunduh!');
    }, 500);
  };

  // Save All Configuration
  const handleSaveAll = () => {
    showToast('Konfigurasi kebijakan & kuota saldo cuti berhasil disimpan ke sistem pusat!');
  };

  // Submit New Type
  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeForm.name.trim()) return;

    const created: LeaveTypePolicy = {
      id: `lp-${Date.now()}`,
      name: newTypeForm.name,
      regulation: newTypeForm.regulation,
      allocation: newTypeForm.allocation,
      compensation: newTypeForm.compensation,
      eligibility: newTypeForm.eligibility,
      terms: newTypeForm.terms,
      iconType: 'calendar',
      active: true,
    };

    setLeavePolicies([...leavePolicies, created]);
    setIsAddTypeModalOpen(false);
    showToast(`Tipe cuti baru "${created.name}" berhasil ditambahkan ke matriks!`);
    setNewTypeForm({
      name: '',
      regulation: 'PKB Nexora Enterprise Periode 2024-2026',
      allocation: '2 Hari Kerja',
      compensation: 'Dibayar Penuh (100%)',
      eligibility: 'Semua Level Karyawan',
      terms: 'H-3 Kerja • Lampiran Bukti',
    });
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
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Operasional</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin/leave" className="hover:text-blue-600 transition-colors">
            Manajemen Cuti &amp; Izin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Kebijakan &amp; Kuota Cuti</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Konfigurasi Kebijakan &amp; Kuota Saldo Cuti
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Atur matriks perhitungan hak cuti tahunan, skema carry-forward, dispensasi khusus
              berbayar, dan kuota saldo per grade/level jabatan sesuai regulasi PP &amp; PKB perusahaan.
            </p>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Unduh Matriks (.xlsx) */}
            <button
              type="button"
              onClick={handleExportMatrix}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Matriks (.xlsx)</span>
            </button>

            {/* Tambah Tipe Cuti Baru */}
            <button
              type="button"
              onClick={() => setIsAddTypeModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Tambah Tipe Cuti Baru</span>
            </button>

            {/* Simpan Konfigurasi Kebijakan */}
            <button
              type="button"
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Simpan Konfigurasi Kebijakan</span>
            </button>
          </div>
        </div>

        {/* Legal Status Banner Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-l-4 border-l-[#1D4ED8] border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Kebijakan Terkini Tersinkronisasi
                </h3>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-full">
                  Aktif &amp; Terverifikasi Legal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-4xl">
                Sesuai ketentuan <strong className="text-slate-700">UU Cipta Kerja No. 6/2023</strong> dan{' '}
                <strong className="text-slate-700">PKB Nexora Enterprise Periode 2024–2026</strong>.
                Perubahan kuota tahunan akan diberlakukan efektif pada reset siklus periode berikutnya{' '}
                <strong className="text-slate-800">(1 Januari 2026)</strong>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPKBModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-2 flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Tinjau Butir Hukum PKB</span>
          </button>
        </div>

        {/* 4 Summary / KPI Policy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: TOTAL JENIS CUTI AKTIF */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                TOTAL JENIS CUTI AKTIF
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">8</span>{' '}
              <span className="text-base font-bold text-slate-800">Kategori</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Reguler, Khusus, Sakit, &amp; Sabbatical...
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Semua divisi tercakup</span>
              <span className="font-bold text-blue-600">100% Aktif</span>
            </div>
          </div>

          {/* Card 2: STANDAR KUOTA TAHUNAN */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                STANDAR KUOTA TAHUNAN
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">12</span>{' '}
              <span className="text-base font-bold text-slate-800">Hari Kerja</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Prorata bulan ke-1 pasca 1 thn masa kerja</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Maks carry-over: 6 hari</span>
              <span className="font-bold text-slate-700">Reset 31 Des</span>
            </div>
          </div>

          {/* Card 3: KEDALUWARSA CARRY-FORWARD */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                KEDALUWARSA CARRY-FORWARD
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Hourglass className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">31</span>{' '}
              <span className="text-base font-bold text-slate-800">Maret</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Toleransi 3 bulan ekstra tahun berjalan</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Tenggang waktu sistem</span>
              <span className="font-bold text-rose-600">Hangus Otomatis</span>
            </div>
          </div>

          {/* Card 4: HAK CUTI SABBATICAL (LOYALTY) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                HAK CUTI SABBATICAL (LOYALTY)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">142</span>{' '}
              <span className="text-base font-bold text-slate-800">Karyawan</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Masa bakti &ge; 5 tahun (+6 hari ekstra)</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Klaim Q1: 34 karyawan</span>
              <span className="font-bold text-blue-600">11.3% Populasi</span>
            </div>
          </div>
        </div>

        {/* 4 Sub-Tabs for Policy Modules */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('matrix')}
            className={`p-4 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeSubTab === 'matrix'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeSubTab === 'matrix' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                1. Matriks Tipe Cuti &amp; Alokasi Kuota
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Aturan kuota &amp; kompensasi</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('prorata');
              showToast('Menampilkan konfigurasi Skema Prorata & Masa Tunggu');
            }}
            className={`p-4 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeSubTab === 'prorata'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeSubTab === 'prorata' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                2. Skema Prorata &amp; Masa Tunggu
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Akumulasi cuti bulan ke-1</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('carry_forward');
              showToast('Menampilkan konfigurasi Carry-Forward & Batas Kedaluwarsa');
            }}
            className={`p-4 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeSubTab === 'carry_forward'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeSubTab === 'carry_forward' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                3. Carry-Forward &amp; Kedaluwarsa
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Toleransi sisa cuti 31 Maret</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('terms');
              showToast('Menampilkan Syarat Dokumen & Kebijakan Khusus');
            }}
            className={`p-4 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeSubTab === 'terms'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeSubTab === 'terms' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                4. Syarat Dokumen &amp; Kebijakan Khusus
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">SOP verifikasi berkas SKD</p>
            </div>
          </button>
        </div>

        {/* Two-Column Section: Table Left, Simulation Impact Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Table Matriks Jenis Cuti (8 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              {/* Header Table */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Daftar Matriks Jenis Cuti &amp; Hak Normatif
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konfigurasi batasan kuota per tahun, skema remunerasi, dan persyaratan berkas audit
                    pengajuan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    Tampilkan:
                  </span>
                  <div className="relative">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="appearance-none px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white pr-7 cursor-pointer"
                    >
                      <option value="Semua Status (8)">Semua Status (8)</option>
                      <option value="Cuti Reguler">Cuti Reguler</option>
                      <option value="Cuti Khusus">Cuti Khusus PKB</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Matriks Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">TIPE CUTI &amp; REGULASI</th>
                      <th className="py-2.5 px-3">ALOKASI DEFAULT</th>
                      <th className="py-2.5 px-3">KOMPENSASI GAJI</th>
                      <th className="py-2.5 px-3">KELAYAKAN STAF</th>
                      <th className="py-2.5 px-3">KETENTUAN SYARAT &amp; H-MIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {leavePolicies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name & Regulation */}
                        <td className="py-3 px-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {policy.iconType === 'calendar' && <CalendarCheck className="w-3.5 h-3.5" />}
                              {policy.iconType === 'maternity' && <Baby className="w-3.5 h-3.5" />}
                              {policy.iconType === 'paternity' && <Heart className="w-3.5 h-3.5" />}
                              {policy.iconType === 'wedding' && <Sparkles className="w-3.5 h-3.5" />}
                              {policy.iconType === 'bereavement' && <AlertCircle className="w-3.5 h-3.5" />}
                              {policy.iconType === 'religion' && <Building2 className="w-3.5 h-3.5" />}
                              {policy.iconType === 'sabbatical' && <Award className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{policy.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                                {policy.regulation}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Alokasi */}
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-800">
                          {policy.allocation}
                        </td>

                        {/* Kompensasi */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-blue-700 bg-blue-50">
                            {policy.compensation}
                          </span>
                        </td>

                        {/* Kelayakan */}
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {policy.eligibility}
                        </td>

                        {/* Syarat & H-Min */}
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          {policy.terms}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Simulasi Dampak Kebijakan (4 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Simulasi Dampak Kebijakan
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  NEXORA REAL-TIME
                </span>
              </div>

              {/* Metrics Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Total Populasi Karyawan</span>
                  <span className="font-bold text-slate-900">1.248 Staf Aktif</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Potensi Liabilitas Cuti</span>
                  <span className="font-bold text-slate-900">14.976 Hari / Thn</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Rata-rata Utilisasi Q1</span>
                  <span className="font-bold text-slate-900">42.8% Terpakai</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Kesiapan Operasional Shift</span>
                  <span className="font-bold text-emerald-600">94.2% (Tinggi / Stabil)</span>
                </div>
              </div>

              {/* PROYEKSI DISTRIBUSI UTILISASI CUTI (2025) */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PROYEKSI DISTRIBUSI UTILISASI CUTI (2025)
                </span>

                <div className="space-y-2 text-xs">
                  {/* Q1 */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">Q1 (Jan - Mar) Carry-over peak</span>
                      <span className="font-bold text-slate-900">42.8%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '42.8%' }} />
                    </div>
                  </div>

                  {/* Q2 */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">Q2 (Apr - Jun) Idul Fitri Season</span>
                      <span className="font-bold text-blue-700">68.4% (Tinggi)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#1D4ED8] h-1.5 rounded-full" style={{ width: '68.4%' }} />
                    </div>
                  </div>

                  {/* Q3 */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">Q3 (Jul - Sep) Reguler</span>
                      <span className="font-bold text-slate-900">24.1%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '24.1%' }} />
                    </div>
                  </div>

                  {/* Q4 */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 font-medium">Q4 (Okt - Des) Libur Akhir Tahun</span>
                      <span className="font-bold text-rose-600">76.9% (Maksimal)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: '76.9%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Mitigation Callout */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2 text-[11px] text-slate-700">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Matriks kuota saat ini memitigasi risiko kelangkaan staf dengan membatasi
                  carry-forward maksimal 6 hari.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Tambah Tipe Cuti Baru */}
      {isAddTypeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Tipe Cuti &amp; Hak Normatif Baru</h3>
                  <p className="text-xs text-slate-500">Konfigurasi parameter kebijakan cuti baru ke dalam matriks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTypeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateType} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Tipe Cuti *</label>
                <input
                  type="text"
                  required
                  value={newTypeForm.name}
                  onChange={(e) => setNewTypeForm({ ...newTypeForm, name: e.target.value })}
                  placeholder="Contoh: Cuti Khusus Kelulusan Anak (Wisuda)"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Alokasi Default</label>
                  <input
                    type="text"
                    value={newTypeForm.allocation}
                    onChange={(e) => setNewTypeForm({ ...newTypeForm, allocation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kompensasi Gaji</label>
                  <select
                    value={newTypeForm.compensation}
                    onChange={(e) => setNewTypeForm({ ...newTypeForm, compensation: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Dibayar Penuh (100%)">Dibayar Penuh (100%)</option>
                    <option value="Unpaid Leave (Tanpa Gaji)">Unpaid Leave (Tanpa Gaji)</option>
                    <option value="Dibayar Sebagian (50%)">Dibayar Sebagian (50%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kelayakan Staf</label>
                <input
                  type="text"
                  value={newTypeForm.eligibility}
                  onChange={(e) => setNewTypeForm({ ...newTypeForm, eligibility: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Regulasi Acuan / Dasar Hukum</label>
                <input
                  type="text"
                  value={newTypeForm.regulation}
                  onChange={(e) => setNewTypeForm({ ...newTypeForm, regulation: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddTypeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Tambahkan ke Matriks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Tinjau Butir Hukum PKB */}
      {isPKBModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ringkasan Hukum PKB Nexora Periode 2024-2026
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPKBModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Pasal 14: Hak Cuti Tahunan &amp; Carry-Forward</p>
                <p>
                  Karyawan berhak atas cuti tahunan 12 hari kerja setelah 12 bulan masa kerja terus menerus. Hak cuti yang belum terpakai dapat dialihkan ke tahun berikutnya maksimal 6 hari kerja dengan batas kadaluarsa 31 Maret tahun berikutnya.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Pasal 15: Cuti Bersalin &amp; Perlindungan Ibu Anak (UU KIA)</p>
                <p>
                  Karyawan perempuan berhak atas cuti bersalin selama 90 hari kalender dengan gaji dibayar 100%. Suami sah berhak atas cuti pendampingan kelahiran minimal 2 hari hingga 5 hari kerja.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Pasal 18: Hak Cuti Panjang (Sabbatical)</p>
                <p>
                  Karyawan dengan masa bakti 5 tahun berturut-turut tanpa catatan pelanggaran berat berhak atas tambahan 6 hari kerja pada tahun ke-6 sebagai penghargaan loyalitas.
                </p>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsPKBModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
