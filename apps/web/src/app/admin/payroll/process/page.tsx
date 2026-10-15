'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Lock,
  Download,
  Check,
  CheckCheck,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  X,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  User,
  Users,
  Eye,
  FileText,
  Upload,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers,
  KeyRound,
  Send,
  Flag,
} from 'lucide-react';

interface AnomalyItem {
  id: number;
  name: string;
  nik: string;
  type: string;
  typeVariant: 'warning' | 'info' | 'purple' | 'emerald';
  description: string;
  statusBadge: string;
  statusVariant: 'warning' | 'emerald' | 'blue' | 'slate';
  secondaryActionText: string;
  isResolved: boolean;
}

interface EmployeePayrollPreview {
  id: string;
  name: string;
  nik: string;
  department: string;
  designation: string;
  bank: string;
  accountNumber: string;
  grossSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  netSalary: number;
  status: 'READY' | 'DISPENSATION_APPROVED' | 'PRORATA_ADJUSTED';
}

export default function PayrollExecutionPage() {
  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Modals state
  const [isAuthorizeModalOpen, setIsAuthorizeModalOpen] = useState(false);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [isProrataModalOpen, setIsProrataModalOpen] = useState(false);
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<EmployeePayrollPreview | null>(null);

  // Security authorization states
  const [authPin, setAuthPin] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSuccess, setExecutionSuccess] = useState(false);

  // Filter state for employee preview table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('Semua Departemen');

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 3 (+ 1 bonus) Anomalies Dataset matching screenshot & continuing cut-off portion
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([
    {
      id: 1,
      name: 'Hendro Wibowo',
      nik: 'NX-2018-0924',
      type: 'Lembur Ekstrem: 24 Jam',
      typeVariant: 'warning',
      description:
        'Akumulasi jam lembur mencapai 24 jam/minggu (melebihi batas PP 35/2021 tanpa memo izin Direktur Operasional).',
      statusBadge: 'Perlu Dispensasi',
      statusVariant: 'warning',
      secondaryActionText: 'Unggah Memo',
      isResolved: false,
    },
    {
      id: 2,
      name: 'Budi Santoso',
      nik: 'NX-2022-1140',
      type: 'Unpaid Leave 2 Hari',
      typeVariant: 'info',
      description:
        'Pengajuan unpaid leave disetujui H-3 cutoff. Telah disesuaikan otomatis dengan pemotongan proporsional (-Rp 1.450.000).',
      statusBadge: 'Terselesaikan Otomatis',
      statusVariant: 'emerald',
      secondaryActionText: 'Cek Log',
      isResolved: true,
    },
    {
      id: 3,
      name: 'Kevin Sanjaya',
      nik: 'NX-2025-0301',
      type: 'Prorata Karyawan Baru (Mulai 10 Mar)',
      typeVariant: 'purple',
      description:
        'Karyawan baru bergabung per 10 Maret 2025. Perhitungan gaji pokok & tunjangan dihitung prorata 15 hari kerja kalender penggajian (-Rp 3.850.000) dan penyesuaian tier TER PPh 21 masa kerja perdana.',
      statusBadge: 'Tervalidasi Prorata',
      statusVariant: 'emerald',
      secondaryActionText: 'Lihat Rincian Prorata',
      isResolved: true,
    },
    {
      id: 4,
      name: 'Siti Nurhaliza',
      nik: 'NX-2023-0412',
      type: 'Perubahan Rekening Bank Payroll',
      typeVariant: 'emerald',
      description:
        'Penggantian nomor rekening payroll ke Bank Mandiri 1370-0294-118. Validasi nama rekening telah terverifikasi sinkron 100% dengan database NIK KTP.',
      statusBadge: 'Rekening Terverifikasi',
      statusVariant: 'emerald',
      secondaryActionText: 'Cek Buku Rekening',
      isResolved: true,
    },
  ]);

  // Employee Preview Records
  const [employeePreviews] = useState<EmployeePayrollPreview[]>([
    {
      id: 'emp-1',
      name: 'Ir. Andi Wijaya, M.Kom',
      nik: 'NX-2018-0102',
      department: 'Technology & IT',
      designation: 'Chief Technology Officer (CTO)',
      bank: 'BCA (Host-to-Host)',
      accountNumber: '8220-192-481',
      grossSalary: 32750000,
      allowances: 4250000,
      overtime: 0,
      deductions: 3120000,
      netSalary: 29630000,
      status: 'READY',
    },
    {
      id: 'emp-2',
      name: 'Dewi Lestari, S.Psi',
      nik: 'NX-2020-0012',
      department: 'Human Resources',
      designation: 'HR Operations Manager',
      bank: 'Bank Mandiri (MCM)',
      accountNumber: '122-00-984128-0',
      grossSalary: 27500000,
      allowances: 3500000,
      overtime: 0,
      deductions: 2480000,
      netSalary: 25020000,
      status: 'READY',
    },
    {
      id: 'emp-3',
      name: 'Hendro Wibowo',
      nik: 'NX-2018-0924',
      department: 'Operasional',
      designation: 'Senior Fleet Dispatcher',
      bank: 'Bank Mandiri (MCM)',
      accountNumber: '137-00-847291-5',
      grossSalary: 14500000,
      allowances: 1800000,
      overtime: 2100000,
      deductions: 1480000,
      netSalary: 15120000,
      status: 'DISPENSATION_APPROVED',
    },
    {
      id: 'emp-4',
      name: 'Budi Santoso',
      nik: 'NX-2022-1140',
      department: 'Product & Design',
      designation: 'Senior UI/UX Designer',
      bank: 'BCA (Host-to-Host)',
      accountNumber: '731-002-9411',
      grossSalary: 16000000,
      allowances: 2200000,
      overtime: 0,
      deductions: 2650000, // Includes 1.45M unpaid leave
      netSalary: 13350000,
      status: 'READY',
    },
    {
      id: 'emp-5',
      name: 'Kevin Sanjaya',
      nik: 'NX-2025-0301',
      department: 'Technology & IT',
      designation: 'Junior Frontend Developer',
      bank: 'BCA (Host-to-Host)',
      accountNumber: '527-119-3820',
      grossSalary: 8250000, // Prorated 15 days
      allowances: 1000000,
      overtime: 0,
      deductions: 700000,
      netSalary: 7550000,
      status: 'PRORATA_ADJUSTED',
    },
    {
      id: 'emp-6',
      name: 'Siti Nurhaliza',
      nik: 'NX-2023-0412',
      department: 'Finance & Accounting',
      designation: 'Tax & Compliance Specialist',
      bank: 'Bank Mandiri (MCM)',
      accountNumber: '137-00-294118-2',
      grossSalary: 15500000,
      allowances: 2000000,
      overtime: 650000,
      deductions: 1620000,
      netSalary: 14530000,
      status: 'READY',
    },
  ]);

  // Filtered employees
  const filteredEmployees = employeePreviews.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'Semua Departemen' || emp.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Approve all adjustments handler
  const handleApproveAllAdjustments = () => {
    setAnomalies(
      anomalies.map((a) => ({
        ...a,
        isResolved: true,
        statusBadge: 'Tervalidasi & Disetujui',
        statusVariant: 'emerald',
      }))
    );
    showToast('Seluruh 3 anomali & penyesuaian payroll berhasil disetujui resmi oleh HR Ops!');
  };

  // Download reconciliation spreadsheet
  const handleDownloadReconciliation = () => {
    showToast('Mengunduh Lembar Rekonsiliasi Anomali & Rekap (.xlsx)...', 'info');
    setTimeout(() => {
      const csvHeader = 'NIK,NAMA KARYAWAN,JENIS PENYESUAIAN,DESKRIPSI FORMULA,STATUS TINDAKAN\n';
      const csvRows = anomalies
        .map((a) => `"${a.nik}","${a.name}","${a.type}","${a.description}","${a.statusBadge}"`)
        .join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lembar_Rekonsiliasi_Payroll_Maret2025_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Lembar rekonsiliasi anomali payroll berhasil diunduh!');
    }, 600);
  };

  // Final Execution Authorization
  const handleConfirmExecution = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPin.length < 6) {
      showToast('Masukkan 6 digit Security PIN Otorisasi Direksi/HRD!', 'info');
      return;
    }

    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionSuccess(true);
      showToast('Batch Transfer Payroll Rp 3.423.730.000 sukses diotorisasi dan dikirim ke Kliring Perbankan!');
    }, 1500);
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
        {/* Breadcrumb Navigation matching screenshot */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Operasional</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin/payroll" className="hover:text-blue-600 transition-colors">
            Payroll &amp; Gaji
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 font-semibold">Eksekusi Proses Payroll (Maret 2025)</span>
        </nav>

        {/* Top Header Section matching screenshot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Pusat Pemrosesan &amp; Eksekusi Payroll Bulanan
            </h1>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Periode Payroll: 26 Feb - 25 Mar 2025
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Verifikasi rekonsiliasi presensi, kalkulasi otomatis PPh 21 TER &amp; BPJS
              Ketenagakerjaan/Kesehatan, review anomali, hingga transfer batch perbankan secara aman dan
              terintegrasi.
            </p>
          </div>

          {/* Action Buttons Top Right matching screenshot */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Kembali ke Ikhtisar */}
            <Link
              href="/admin/payroll"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Kembali ke Ikhtisar</span>
            </Link>

            {/* Simpan Draf Sesi */}
            <button
              type="button"
              onClick={() => showToast('Draf sesi proses payroll berhasil disimpan di server.')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Simpan Draf Sesi</span>
            </button>

            {/* Otorisasi & Eksekusi Payroll */}
            <button
              type="button"
              onClick={() => setIsAuthorizeModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Otorisasi &amp; Eksekusi Payroll</span>
            </button>
          </div>
        </div>

        {/* 4 Step Cards Progress Wizard matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Langkah 1: Selesai */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  LANGKAH 1 • SELESAI
                </span>
                <h3 className="text-xs font-bold text-slate-900 truncate">
                  Kunci Presensi &amp; Rekap
                </h3>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  1.248 Karyawan Terkunci Otomatis
                </p>
              </div>
            </div>
          </div>

          {/* Langkah 2: Aktif (100% Selesai) */}
          <div className="bg-blue-50/70 rounded-2xl p-4 border-2 border-blue-600 shadow-sm relative overflow-hidden ring-2 ring-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    LANGKAH 2 • AKTIF
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-800">
                    100% Selesai
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 truncate">
                  Kalkulasi Gaji, Pajak &amp; BPJS
                </h3>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  Aturan TER PP 58/2023 &amp; BPJS
                </p>
              </div>
            </div>
          </div>

          {/* Langkah 3: Perlu Tindakan */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Flag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  LANGKAH 3 • PERLU TINDAKAN
                </span>
                <h3 className="text-xs font-bold text-slate-900 truncate">
                  Uji Kelayakan &amp; Rekonsiliasi
                </h3>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  3 Catatan Perlu Review Manual
                </p>
              </div>
            </div>
          </div>

          {/* Langkah 4: Antrean */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm relative overflow-hidden opacity-80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  LANGKAH 4 • ANTREAN
                </span>
                <h3 className="text-xs font-bold text-slate-900 truncate">
                  Otorisasi Pembayaran &amp; Batch
                </h3>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Menunggu Dual-Approval Direksi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Section: Left Column (8 cols) & Right Column (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Data Presensi, Anomalies & Full Preview Table */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Data Presensi Dikunci Resmi Card */}
            <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-200/80 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Data Presensi Periode 26 Feb - 25 Mar 2025 Telah Dikunci Resmi
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Seluruh data absensi biometrik, potongan ketidakhadiran (unpaid leave &amp; mangkir),
                    serta insentif lembur terverifikasi telah dikonversikan ke dalam formula nominal
                    payroll. Modul absensi ditutup untuk permohonan tanggal mundur.
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 sm:self-start">
                <span className="text-[11px] text-slate-500 font-medium block">Kunci Otomatis:</span>
                <span className="text-xs font-bold text-slate-800">25 Mar 2025, 23:59 WIB</span>
              </div>
            </div>

            {/* 2. Anomali & Rekonsiliasi Card matching screenshot & CONTINUING CUT-OFF PART */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      3 Pengecualian &amp; Anomali Terdeteksi
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sistem mendeteksi 3 berkas memerlukan konfirmasi manual sebelum rilis akhir batch.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadReconciliation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unduh Lembar Rekonsiliasi (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveAllAdjustments}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-white" />
                    <span>Setujui Seluruh Penyesuaian</span>
                  </button>
                </div>
              </div>

              {/* Anomaly Items List */}
              <div className="space-y-3">
                {anomalies.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isResolved
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Number Badge */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                            item.id === 1
                              ? 'bg-amber-100 text-amber-800'
                              : item.id === 2
                              ? 'bg-blue-100 text-blue-800'
                              : item.id === 3
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.id}
                        </div>

                        {/* Content */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{item.name}</span>
                            <span className="text-[11px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
                              {item.nik}
                            </span>
                          </div>

                          {/* Pill Tag */}
                          <div>
                            <span
                              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                item.typeVariant === 'warning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.typeVariant === 'info'
                                  ? 'bg-blue-100 text-blue-800'
                                  : item.typeVariant === 'purple'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl pt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons for Anomaly */}
                      <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                        {/* Status Badge Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (item.id === 1) setIsMemoModalOpen(true);
                            if (item.id === 3) setIsProrataModalOpen(true);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                            item.isResolved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {item.statusBadge}
                        </button>

                        {/* Secondary Outline Action */}
                        <button
                          type="button"
                          onClick={() => {
                            if (item.id === 1) setIsMemoModalOpen(true);
                            else if (item.id === 3) setIsProrataModalOpen(true);
                            else {
                              showToast(`Menampilkan audit log untuk ${item.name}`);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-all"
                        >
                          {item.secondaryActionText}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. CONTINUATION: Full Payroll Breakdown & Reconciliation Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Pratinjau Lembar Kompensasi Gaji Bersih Karyawan (1.248 Staf)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rincian nominal sebelum perintah transfer batch disalurkan ke host-to-host kliring
                    perbankan.
                  </p>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIK..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 w-44 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      className="appearance-none px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white pr-7 cursor-pointer"
                    >
                      <option value="Semua Departemen">Semua Departemen</option>
                      <option value="Technology & IT">Technology &amp; IT</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Product & Design">Product &amp; Design</option>
                      <option value="Finance & Accounting">Finance &amp; Accounting</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">KARYAWAN &amp; NIK</th>
                      <th className="py-2.5 px-3">DEPARTEMEN</th>
                      <th className="py-2.5 px-3">GAJI KOTOR</th>
                      <th className="py-2.5 px-3">POTONGAN TOTAL</th>
                      <th className="py-2.5 px-3">TAKE HOME PAY</th>
                      <th className="py-2.5 px-3">SALURAN BANK</th>
                      <th className="py-2.5 px-3 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{emp.nik} • {emp.designation}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                          {emp.department}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-800">
                          {formatRupiah(emp.grossSalary)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-rose-600 font-semibold">
                          -{formatRupiah(emp.deductions)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {formatRupiah(emp.netSalary)}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                          <span className="font-semibold text-slate-800 block">{emp.bank}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{emp.accountNumber}</span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedEmployeeDetail(emp)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                          >
                            Slip Gaji
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Summary Card & CONTINUATION OF CUT OFF CARD */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Rekapitulasi Dana Penggajian Card matching screenshot */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      Rekapitulasi Dana Penggajian
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Maret 2025
                </span>
              </div>

              {/* Figures Breakdown matching screenshot */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Total Gross Payroll</span>
                  <span className="font-bold text-slate-900">Rp 3.842.650.000</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <span>Potongan PPh 21 (TER PP 58)</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="font-bold text-slate-900">-Rp 268.420.000</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <span>Iuran Total BPJS TK &amp; Kes</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="font-bold text-slate-900">-Rp 150.500.000</span>
                </div>
              </div>

              {/* Total Net Disbursement Box matching screenshot */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  TOTAL NET DISBURSEMENT (GAJI BERSIH)
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight">
                  Rp 3.423.730.000
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 pt-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>+1.8% vs Februari (Kenaikan lembur operasional kuartal 1)</span>
                </div>
              </div>

              {/* Komposisi Pengeluaran Dana ProgressBar matching screenshot */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Komposisi Pengeluaran Dana</span>
                  <span className="font-bold text-slate-800">100% Teralokasi</span>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-[#1D4ED8] h-full" style={{ width: '89.1%' }} title="Gaji Bersih 89.1%" />
                  <div className="bg-amber-500 h-full" style={{ width: '7.0%' }} title="Pajak PPh21 7.0%" />
                  <div className="bg-purple-600 h-full" style={{ width: '3.9%' }} title="BPJS Total 3.9%" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                    <span>Gaji Bersih</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Pajak (PPh21)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>BPJS Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CONTINUATION: Saluran Kliring Perbankan Card (Cut off in screenshot) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      Saluran Kliring Perbankan
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  API Aktif
                </span>
              </div>

              {/* Continuation Details for Banks */}
              <div className="space-y-3 text-xs">
                {/* Bank Mandiri MCM */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Bank Mandiri (MCM 2.0 H2H)</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      612 Rekening
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Nominal Batch:</span>
                    <span className="font-bold text-slate-800">Rp 1.840.500.000</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Status Host-to-Host:</span>
                    <span className="font-bold text-emerald-600">Siap Eksekusi (Ready)</span>
                  </div>
                </div>

                {/* Bank BCA */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">BCA KlikBCA Bisnis (API)</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      488 Rekening
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Nominal Batch:</span>
                    <span className="font-bold text-slate-800">Rp 1.250.230.000</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Status Host-to-Host:</span>
                    <span className="font-bold text-emerald-600">Siap Eksekusi (Ready)</span>
                  </div>
                </div>

                {/* Bank Lainnya */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">BNI &amp; BI-FAST Kliring</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      148 Rekening
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Nominal Batch:</span>
                    <span className="font-bold text-slate-800">Rp 333.000.000</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Jalur Kliring:</span>
                    <span className="font-bold text-emerald-600">Real-Time BI-FAST Aktif</span>
                  </div>
                </div>
              </div>

              {/* Schedule Info Box */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2 text-[11px] text-slate-700">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Batas cut-off kliring BI-FAST perbankan: <strong>25 Mar 2025 pukul 23:00 WIB</strong>.
                  Dana akan efektif masuk ke rekening payroll karyawan pada tanggal 26 pagi.
                </p>
              </div>
            </div>

            {/* 3. CONTINUATION: Dual-Approval Status Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Status Dual-Approval Otorisasi
                </h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  1/2 Disetujui
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Checker 1 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Dewi Lestari, S.Psi</span>
                      <span className="text-[10px] font-bold text-emerald-700">Disetujui</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Head of People &amp; HR Operations</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Otorisasi: 25 Mar 2025, 14:20 WIB</p>
                  </div>
                </div>

                {/* Checker 2 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Ir. Hendra Tanujaya, M.B.A</span>
                      <span className="text-[10px] font-bold text-amber-700">Menunggu Rilis</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Chief Financial Officer (CFO)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Menunggu konfirmasi tombol eksekusi</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAuthorizeModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Form Otorisasi Akhir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: Otorisasi & Eksekusi Payroll (Dual Approval)     */}
      {/* ========================================================= */}
      {isAuthorizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Otorisasi &amp; Rilis Eksekusi Payroll
                  </h3>
                  <p className="text-xs text-slate-500">Dual-Approval Penggajian Periode Maret 2025</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthorizeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {executionSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">Batch Transfer Berhasil Dikirim!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    Dana sebesar <strong>Rp 3.423.730.000</strong> telah berhasil disalurkan ke host-to-host
                    Bank Mandiri &amp; BCA. Notifikasi slip gaji digital via email/WhatsApp telah dijadwalkan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthorizeModalOpen(false);
                    setExecutionSuccess(false);
                  }}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  Tutup Konfirmasi
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmExecution} className="p-6 space-y-4">
                {/* Summary Box */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Karyawan Penerima:</span>
                    <span className="font-bold text-slate-900">1.248 Staf Aktif</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Nominal Transfer Bersih:</span>
                    <span className="font-extrabold text-blue-700">Rp 3.423.730.000</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Kanal Kliring:</span>
                    <span className="font-semibold text-slate-800">Mandiri MCM &amp; BCA H2H</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Masukkan 6-Digit Security Token / PIN Direksi *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={authPin}
                    onChange={(e) => setAuthPin(e.target.value)}
                    placeholder="••••••"
                    className="w-full text-center tracking-widest text-lg font-bold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 text-center">
                    Gunakan kode token HSM atau OTP autentikator CFO yang terdaftar.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAuthorizeModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isExecuting}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {isExecuting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memproses Kliring...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Konfirmasi &amp; Rilis Batch Transfer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Unggah Memo Dispensasi Hendro Wibowo             */}
      {/* ========================================================= */}
      {isMemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900">
                Persetujuan Dispensasi Lembur Ekstrem
              </h3>
              <button
                type="button"
                onClick={() => setIsMemoModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-900">Hendro Wibowo (NX-2018-0924)</span>
                <p className="text-amber-800 text-[11px]">
                  Akumulasi lembur: 24 jam/minggu untuk proyek operasional darurat logistik. Batas regulasi
                  PP 35/2021 adalah 18 jam/minggu.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Unggah Memo Otorisasi Direktur Operasional (.pdf / .jpg)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-blue-600 font-semibold">Klik untuk memilih berkas</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Memo_Dispensasi_Ops_Hendro.pdf (Tersedia)</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMemoModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnomalies(
                      anomalies.map((a) =>
                        a.id === 1
                          ? {
                              ...a,
                              isResolved: true,
                              statusBadge: 'Dispensasi Disetujui',
                              statusVariant: 'emerald',
                            }
                          : a
                      )
                    );
                    setIsMemoModalOpen(false);
                    showToast('Dispensasi lembur Hendro Wibowo berhasil diverifikasi dan disetujui!');
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Setujui Dispensasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Detail Prorata Kevin Sanjaya (Cut-off Item)       */}
      {/* ========================================================= */}
      {isProrataModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900">
                Detail Kalkulasi Prorata Karyawan Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsProrataModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                <span className="font-bold text-purple-900">Kevin Sanjaya (Junior Frontend Dev)</span>
                <p className="text-purple-800 text-[11px]">
                  Tanggal Mulai Bekerja: <strong>10 Maret 2025</strong>
                </p>
              </div>

              <div className="space-y-2 border-y border-slate-100 py-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gaji Pokok Full Month:</span>
                  <span className="font-semibold text-slate-800">Rp 12.000.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hari Kerja Kalender Periode:</span>
                  <span className="font-semibold text-slate-800">22 Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hari Masuk Aktif:</span>
                  <span className="font-semibold text-blue-700">15 Hari Kerja</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Gaji Pokok Prorata (15/22):</span>
                  <span className="text-blue-700">Rp 8.181.818</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsProrataModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Detail Slip Gaji Karyawan                         */}
      {/* ========================================================= */}
      {selectedEmployeeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Slip Gaji — {selectedEmployeeDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployeeDetail(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">NIK &amp; Departemen</span>
                  <p className="font-bold text-slate-900">{selectedEmployeeDetail.nik}</p>
                  <p className="text-slate-600">{selectedEmployeeDetail.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Rekening Bank</span>
                  <p className="font-bold text-slate-900">{selectedEmployeeDetail.bank}</p>
                  <p className="text-slate-600 font-mono">{selectedEmployeeDetail.accountNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rincian Penerimaan &amp; Potongan
                </span>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Gaji Pokok &amp; Tunjangan:</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(selectedEmployeeDetail.grossSalary)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Total Potongan (PPh21 + BPJS):</span>
                  <span className="font-semibold text-rose-600">
                    -{formatRupiah(selectedEmployeeDetail.deductions)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-200 text-sm font-bold">
                  <span className="text-slate-900">Gaji Bersih (Take Home Pay):</span>
                  <span className="text-blue-700 font-extrabold">
                    {formatRupiah(selectedEmployeeDetail.netSalary)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmployeeDetail(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Slip gaji ${selectedEmployeeDetail.name} berhasil diunduh format PDF!`);
                    setSelectedEmployeeDetail(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
