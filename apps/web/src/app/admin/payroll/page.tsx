'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  CreditCard,
  Calendar,
  Clock,
  Building2,
  Play,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Search,
  ArrowLeftRight,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  Landmark,
  Mail,
  Users,
  Printer,
  Loader2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Lock,
  Send,
  Sparkles,
} from 'lucide-react';

interface PayrollEmployeeRecord {
  id: string;
  initials: string;
  avatarBg: string;
  employeeNumber: string;
  employeeName: string;
  department: string;
  designation: string;
  bankName: string;
  bankAccountNumber: string;
  baseSalary: number;
  allowanceTitle: string;
  allowances: number;
  overtimeHours: number;
  overtimePay: number;
  unpaidLeaveDays: number;
  unpaidLeaveDeduction: number;
  grossSalary: number;
  ptkpCategory: 'TER_A' | 'TER_B' | 'TER_C';
  pph21Rate: string;
  pph21Amount: number;
  bpjsTkEmp: number;
  bpjsKesEmp: number;
  otherDeductions: number;
  totalDeductions: number;
  takeHomePay: number;
  verificationStatus: 'VERIFIED' | 'REVIEW_LEMBUR' | 'UNPAID_LEAVE' | 'NEW_EMPLOYEE';
}

export default function AdminPayrollPage() {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'LEMBUR' | 'UNPAID_LEAVE' | 'NEW_HIRE'>('ALL');

  // Modals & Actions States
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEmployeeRecord | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);
  const [processStep, setProcessStep] = useState(3);
  const [periodData, setPeriodData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Employee Payroll Records (Rich & Accurate Mock Data)
  const [records, setRecords] = useState<PayrollEmployeeRecord[]>([
    {
      id: 'rec-1',
      initials: 'RP',
      avatarBg: 'bg-blue-100 text-blue-700',
      employeeNumber: 'NX-2021008',
      employeeName: 'Rian Pratama, S.Kom',
      department: 'Technology & Engineering',
      designation: 'Lead Backend Architect',
      bankName: 'BCA',
      bankAccountNumber: '8820491823',
      baseSalary: 28500000,
      allowanceTitle: 'Tunjangan Posisi & Komunikasi',
      allowances: 4250000,
      overtimeHours: 0,
      overtimePay: 0,
      unpaidLeaveDays: 0,
      unpaidLeaveDeduction: 0,
      grossSalary: 32750000,
      ptkpCategory: 'TER_A',
      pph21Rate: '12.00%',
      pph21Amount: 1950000,
      bpjsTkEmp: 855000,
      bpjsKesEmp: 315000,
      otherDeductions: 0,
      totalDeductions: 3120000,
      takeHomePay: 29630000,
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'rec-2',
      initials: 'DL',
      avatarBg: 'bg-purple-100 text-purple-700',
      employeeNumber: 'NX-2020012',
      employeeName: 'Dewi Lestari, S.Psi',
      department: 'Human Resources',
      designation: 'HR Operations Manager',
      bankName: 'Bank Mandiri',
      bankAccountNumber: '12200984128',
      baseSalary: 24000000,
      allowanceTitle: 'Tunjangan Operasional & Kinerja',
      allowances: 3500000,
      overtimeHours: 0,
      overtimePay: 0,
      unpaidLeaveDays: 0,
      unpaidLeaveDeduction: 0,
      grossSalary: 27500000,
      ptkpCategory: 'TER_B',
      pph21Rate: '9.50%',
      pph21Amount: 1520000,
      bpjsTkEmp: 720000,
      bpjsKesEmp: 240000,
      otherDeductions: 0,
      totalDeductions: 2480000,
      takeHomePay: 25020000,
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'rec-3',
      initials: 'BS',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      employeeNumber: 'NX-2019045',
      employeeName: 'Bambang Sutedjo',
      department: 'Logistics & Supply Chain',
      designation: 'Warehouse Logistics Lead',
      bankName: 'BCA',
      bankAccountNumber: '7310029411',
      baseSalary: 8500000,
      allowanceTitle: 'Lembur 14 Jam (+Rp 1.15M)',
      allowances: 700000,
      overtimeHours: 14,
      overtimePay: 1150000,
      unpaidLeaveDays: 0,
      unpaidLeaveDeduction: 0,
      grossSalary: 10350000,
      ptkpCategory: 'TER_A',
      pph21Rate: '2.50%',
      pph21Amount: 175000,
      bpjsTkEmp: 295000,
      bpjsKesEmp: 115000,
      otherDeductions: 0,
      totalDeductions: 585000,
      takeHomePay: 9765000,
      verificationStatus: 'REVIEW_LEMBUR',
    },
    {
      id: 'rec-4',
      initials: 'SR',
      avatarBg: 'bg-amber-100 text-amber-700',
      employeeNumber: 'NX-2022019',
      employeeName: 'Siti Rahmawati, S.E.',
      department: 'Finance & Accounting',
      designation: 'Senior Financial Analyst',
      bankName: 'BCA',
      bankAccountNumber: '6041189201',
      baseSalary: 15000000,
      allowanceTitle: 'Tunjangan Transport & Makan',
      allowances: 2000000,
      overtimeHours: 0,
      overtimePay: 0,
      unpaidLeaveDays: 0,
      unpaidLeaveDeduction: 0,
      grossSalary: 17000000,
      ptkpCategory: 'TER_A',
      pph21Rate: '7.00%',
      pph21Amount: 820000,
      bpjsTkEmp: 450000,
      bpjsKesEmp: 150000,
      otherDeductions: 0,
      totalDeductions: 1420000,
      takeHomePay: 15580000,
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'rec-5',
      initials: 'FA',
      avatarBg: 'bg-sky-100 text-sky-700',
      employeeNumber: 'NX-2023004',
      employeeName: 'Farhan Al-Ghifari',
      department: 'Technology & Engineering',
      designation: 'DevOps & Cloud Engineer',
      bankName: 'Bank Mandiri',
      bankAccountNumber: '13700192841',
      baseSalary: 19500000,
      allowanceTitle: 'On-Call Standby & Sertifikasi',
      allowances: 2500000,
      overtimeHours: 0,
      overtimePay: 0,
      unpaidLeaveDays: 0,
      unpaidLeaveDeduction: 0,
      grossSalary: 22000000,
      ptkpCategory: 'TER_A',
      pph21Rate: '9.00%',
      pph21Amount: 1200000,
      bpjsTkEmp: 585000,
      bpjsKesEmp: 195000,
      otherDeductions: 0,
      totalDeductions: 1980000,
      takeHomePay: 20020000,
      verificationStatus: 'VERIFIED',
    },
    {
      id: 'rec-6',
      initials: 'AN',
      avatarBg: 'bg-rose-100 text-rose-700',
      employeeNumber: 'NX-2023078',
      employeeName: 'Annisa Nurul Aini',
      department: 'Product & Design',
      designation: 'UI/UX Product Designer',
      bankName: 'BNI',
      bankAccountNumber: '0892147820',
      baseSalary: 12000000,
      allowanceTitle: 'Tunjangan Work-From-Anywhere',
      allowances: 1200000,
      overtimeHours: 0,
      overtimePay: 0,
      unpaidLeaveDays: 2,
      unpaidLeaveDeduction: 450000,
      grossSalary: 13200000,
      ptkpCategory: 'TER_A',
      pph21Rate: '4.50%',
      pph21Amount: 540000,
      bpjsTkEmp: 360000,
      bpjsKesEmp: 120000,
      otherDeductions: 330000,
      totalDeductions: 1350000,
      takeHomePay: 11850000,
      verificationStatus: 'UNPAID_LEAVE',
    },
  ]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter records based on controls
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bankAccountNumber.includes(searchTerm);

    const matchesDept = selectedDepartment === 'ALL' || r.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'VERIFIED' && r.verificationStatus === 'VERIFIED') ||
      (selectedStatus === 'PENDING' && r.verificationStatus !== 'VERIFIED');

    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'LEMBUR' && r.verificationStatus === 'REVIEW_LEMBUR') ||
      (activeTab === 'UNPAID_LEAVE' && r.verificationStatus === 'UNPAID_LEAVE') ||
      (activeTab === 'NEW_HIRE' && r.verificationStatus === 'NEW_EMPLOYEE');

    return matchesSearch && matchesDept && matchesStatus && matchesTab;
  });

  // Handler for Exporting Excel / CSV
  const handleExportReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setNotification({
        type: 'success',
        message: 'Laporan Rekap Pajak PPh 21 TER & BPJS Periode Maret 2025 (.xlsx) berhasil diunduh.',
      });
    }, 1200);
  };

  // Live Fetcher from API & Neon Database
  const fetchPayrollData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/payroll?period=2025-03&t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setPeriodData(json.data);
          if (json.data.records && Array.isArray(json.data.records)) {
            setRecords(json.data.records);
          }
          if (json.data.currentStep) {
            setProcessStep(json.data.currentStep);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch live payroll:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('nexora_live_sync');
      bc.onmessage = (event) => {
        if (
          event.data?.type === 'PAYROLL_DISBURSED' ||
          event.data?.type === 'PAYROLL_UPDATED' ||
          event.data?.type === 'ATTENDANCE_SAVED' ||
          event.data?.type === 'EMPLOYEE_ADDED'
        ) {
          fetchPayrollData(true);
        }
      };
    } catch {}

    return () => {
      try {
        bc?.close();
      } catch {}
    };
  }, []);

  // Handler for Executing Payroll Process with Real API & PostgreSQL Persistence
  const handleRunPayrollProcess = async (targetStep = 3) => {
    setIsProcessingPayroll(true);
    setProcessStep(1);

    try {
      setTimeout(() => setProcessStep(2), 500);

      const res = await fetch('/api/v1/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          periodKey: '2025-03',
          step: targetStep,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setPeriodData(json.data);
          setRecords(json.data.records);
          setProcessStep(targetStep);
        }

        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({ type: 'PAYROLL_UPDATED', periodKey: '2025-03' });
          bc.close();
        } catch {}

        setNotification({
          type: 'success',
          message: `Proses Payroll Maret 2025 sukses dikompilasi! ${json.data?.totalEmployees || records.length} karyawan telah terverifikasi.`,
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Gagal memproses kompilasi payroll di server.',
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan koneksi saat memproses payroll.',
      });
    } finally {
      setIsProcessingPayroll(false);
      setIsProcessModalOpen(false);
    }
  };

  // Handler for Step 5: Transfer Batch Disbursement to Employee Banks & Release ESS
  const handleDisbursePayroll = async () => {
    setIsProcessingPayroll(true);
    try {
      const res = await fetch('/api/v1/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disburse',
          periodKey: '2025-03',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setPeriodData(json.data);
          setRecords(json.data.records);
          setProcessStep(5);
        }

        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({ type: 'PAYROLL_DISBURSED', periodKey: '2025-03' });
          bc.close();
        } catch {}

        setNotification({
          type: 'success',
          message: `🎉 Batch Transfer Payroll Maret 2025 sukses dicairkan ke bank karyawan & Slip Gaji ESS telah dirilis secara real-time!`,
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Gagal mengeksekusi transfer payroll.',
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Koneksi error saat transfer perbankan.',
      });
    } finally {
      setIsProcessingPayroll(false);
    }
  };

  return (
    <AdminLayoutSkeleton>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans antialiased">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between shadow-sm border transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. Breadcrumb & Top Page Header */}
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="hover:text-slate-700 cursor-pointer">Utama</span>
            <span>&rsaquo;</span>
            <span className="hover:text-slate-700 cursor-pointer">Operasional</span>
            <span>&rsaquo;</span>
            <span className="text-blue-600 font-semibold">Payroll & Gaji</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Payroll & Penggajian Karyawan
                </h1>
                <span className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  Maret 2025
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Kelola proses cut-off penggajian bulanan, perhitungan PPh 21, BPJS Ketenagakerjaan & Kesehatan, serta pengesahan dan distribusi slip gaji terpusat.
              </p>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => setIsComponentModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span>Pengaturan Komponen Gaji</span>
              </button>

              <button
                onClick={handleExportReport}
                disabled={isExporting}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                )}
                <span>Rekap Laporan Pajak & BPJS (.xlsx)</span>
              </button>

              <Link
                href="/admin/payroll/process"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Jalankan Proses Payroll</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Top 4 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Pengeluaran Gaji */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  TOTAL PENGELUARAN GAJI (MARET 2025)
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 mt-2 tracking-tight">
                {periodData ? formatRupiah(periodData.totalNet) : 'Rp 3.842.650.000'}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                  Kompilasi Real-Time
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {periodData?.records?.length || records.length} Karyawan Terdaftar
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate">
              {periodData
                ? `Bruto: ${formatRupiah(periodData.totalGross)} • Total Potongan: ${formatRupiah(periodData.totalDeductions)}`
                : 'Pokok: Rp 2.89M • Tunjangan: Rp 580Jt • Lembur: Rp 372.6Jt'}
            </div>
          </div>

          {/* Card 2: Status Cut-Off Periode Berjalan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  STATUS CUT-OFF PERIODE BERJALAN
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2.5 mt-2">
                <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
                  {periodData?.cutoffDateStr || '25 Maret 2025'}
                </div>
                <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                  Tersisa 1 Hari
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Verifikasi Presensi</span>
                  <span className="font-bold text-slate-800">100% Siap</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              {periodData
                ? `${periodData.lockedAttendanceCount} dari ${periodData.totalEmployees} data presensi terkunci rapi`
                : '1.236 dari 1.248 data presensi terkunci rapi'}
            </div>
          </div>

          {/* Card 3: PPh 21 & Potongan BPJS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  PPH 21 & POTONGAN BPJS
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 mt-2 tracking-tight">
                {periodData ? formatRupiah(periodData.totalPph21 + periodData.totalBpjs) : 'Rp 418.920.000'}
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200/60 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>TERVALIDASI DUKCAPIL & PAJAK TER</span>
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 truncate">
              {periodData
                ? `PPh 21: ${formatRupiah(periodData.totalPph21)} • BPJS: ${formatRupiah(periodData.totalBpjs)}`
                : 'PPh 21: Rp 268Jt • BPJS TK: Rp 98Jt • BPJS Kes: Rp 52.9Jt'}
            </div>
          </div>

          {/* Card 4: Slip Gaji Belum Terkirim */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {processStep >= 5 || periodData?.status === 'DISBURSED' ? 'STATUS PENCAIRAN GAJI' : 'SLIP GAJI BELUM TERKIRIM'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-[26px] font-extrabold text-slate-900 mt-2 tracking-tight">
                {processStep >= 5 || periodData?.status === 'DISBURSED'
                  ? `${periodData?.totalEmployees || records.length} Slip Terdistribusi`
                  : `${periodData?.totalEmployees || records.length} Karyawan`}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {processStep >= 5 || periodData?.status === 'DISBURSED'
                  ? 'Gaji telah lunas ditransfer ke rekening bank & slip ESS aktif.'
                  : 'Menunggu Approval Direktur Keuangan & Payroll Release'}
              </p>
            </div>

            <div className="mt-3 bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {processStep >= 5 || periodData?.status === 'DISBURSED'
                    ? 'Lunas: 28 Mar, 08:30 WIB'
                    : `Rilis: ${periodData?.releaseDateStr || '28 Mar 2025'}, 08:30 WIB`}
                </span>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-0.5"
              >
                <span>Detail Jadwal</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Alur Pemrosesan Payroll Stepper Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Title & Info */}
            <div className="flex items-center gap-3 min-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Alur Pemrosesan Payroll</h3>
                <p className="text-xs text-slate-500">Periode Penggajian: 26 Feb - 25 Mar 2025</p>
              </div>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 flex-1">
              {/* Step 1 */}
              <div className="bg-slate-50/90 rounded-xl p-2.5 sm:p-3 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Langkah 1</span>
                <div className="text-xs font-bold text-slate-700 truncate mt-0.5">Presensi & Lembur</div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Terkunci 24 Mar</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50/90 rounded-xl p-2.5 sm:p-3 border border-slate-200/80">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Langkah 2</span>
                <div className="text-xs font-bold text-slate-700 truncate mt-0.5">Hitung PPh & BPJS</div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Selesai Otomatis</span>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`rounded-xl p-2.5 sm:p-3 border transition-all ${
                  processStep === 3
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border-blue-500'
                    : processStep > 3
                    ? 'bg-slate-50/90 border-slate-200/80 text-slate-700'
                    : 'bg-slate-50/60 border-slate-200/60 opacity-80'
                }`}
              >
                <span className={`text-[10px] font-semibold block uppercase ${processStep === 3 ? 'text-blue-200' : 'text-slate-400'}`}>
                  Langkah 3
                </span>
                <div className={`text-xs font-bold truncate mt-0.5 ${processStep === 3 ? 'text-white' : 'text-slate-700'}`}>
                  Verifikasi HR Ops
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold">
                  {processStep === 3 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Terverifikasi (100%)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-blue-600">Selesai</span>
                    </>
                  )}
                </div>
              </div>

              {/* Step 4 */}
              <div
                onClick={() => {
                  if (processStep < 4) handleRunPayrollProcess(4);
                }}
                className={`rounded-xl p-2.5 sm:p-3 border cursor-pointer transition-all ${
                  processStep === 4
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border-blue-500'
                    : processStep > 4
                    ? 'bg-slate-50/90 border-slate-200/80 text-slate-700'
                    : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-100/80'
                }`}
                title="Klik untuk setujui Otorisasi Direksi"
              >
                <span className={`text-[10px] font-semibold block uppercase ${processStep === 4 ? 'text-blue-200' : 'text-slate-400'}`}>
                  Langkah 4
                </span>
                <div className={`text-xs font-bold truncate mt-0.5 ${processStep === 4 ? 'text-white' : 'text-slate-700'}`}>
                  Otorisasi Direksi
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold">
                  {processStep >= 4 ? (
                    <span className={processStep === 4 ? 'text-white flex items-center gap-1' : 'text-blue-600 flex items-center gap-1'}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Disetujui Direksi</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Klik Setujui</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Step 5 */}
              <div
                onClick={() => {
                  if (processStep >= 4 && processStep < 5) handleDisbursePayroll();
                }}
                className={`rounded-xl p-2.5 sm:p-3 border transition-all col-span-2 sm:col-span-1 ${
                  processStep === 5 || periodData?.status === 'DISBURSED'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 border-emerald-500'
                    : processStep === 4
                    ? 'bg-amber-50 border-amber-300 text-amber-900 cursor-pointer hover:bg-amber-100'
                    : 'bg-slate-50/60 border-slate-200/60 opacity-80'
                }`}
                title={processStep === 4 ? 'Klik untuk eksekusi pencairan gaji ke rekening bank' : undefined}
              >
                <span className={`text-[10px] font-semibold block uppercase ${processStep === 5 ? 'text-emerald-200' : 'text-slate-400'}`}>
                  Langkah 5
                </span>
                <div className={`text-xs font-bold truncate mt-0.5 ${processStep === 5 ? 'text-white' : 'text-slate-700'}`}>
                  Transfer & Slip ESS
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold">
                  {processStep === 5 || periodData?.status === 'DISBURSED' ? (
                    <span className="text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Lunas & Rilis</span>
                    </span>
                  ) : processStep === 4 ? (
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <Send className="w-3.5 h-3.5 animate-pulse" />
                      <span>Klik Cairkan</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Send className="w-3.5 h-3.5" />
                      <span>Menunggu Step 4</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Two-Column Layout: Left (Filters & Table) | Right (Bank Distribution Widget) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column (8 or 9 cols on xl) */}
          <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 sm:flex-none sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                  />
                </div>

                {/* Dropdown Departemen */}
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="appearance-none bg-white text-xs border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="ALL">Semua Departemen</option>
                    <option value="Technology & Engineering">Technology & Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Product & Design">Product & Design</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Dropdown Status */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none bg-white text-xs border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="ALL">Status Verifikasi: Semua</option>
                    <option value="VERIFIED">Terverifikasi Saja</option>
                    <option value="PENDING">Butuh Review Saja</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Filter Lanjut Button */}
              <button
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter Lanjut</span>
              </button>
            </div>

            {/* Pill Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua Karyawan (1.248)
              </button>

              <button
                onClick={() => setActiveTab('LEMBUR')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'LEMBUR'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Perlu Penyesuaian Lembur</span>
                <span className="bg-rose-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  12
                </span>
              </button>

              <button
                onClick={() => setActiveTab('UNPAID_LEAVE')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'UNPAID_LEAVE'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Ada Potongan Unpaid Leave</span>
                <span className="bg-slate-200 text-slate-700 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  6
                </span>
              </button>

              <button
                onClick={() => setActiveTab('NEW_HIRE')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'NEW_HIRE'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Karyawan Baru</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  3
                </span>
              </button>
            </div>

            {/* Main Payroll Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[11px]">
                      <th className="py-3.5 px-4">KARYAWAN & JABATAN</th>
                      <th className="py-3.5 px-4">GAJI POKOK</th>
                      <th className="py-3.5 px-4">TUNJANGAN & LEMBUR</th>
                      <th className="py-3.5 px-4">POTONGAN (PAJAK/BPJS)</th>
                      <th className="py-3.5 px-4">TAKE HOME PAY</th>
                      <th className="py-3.5 px-4 text-center">STATUS & AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Tidak ada karyawan yang cocok dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Karyawan & Jabatan */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full ${r.avatarBg} font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm`}
                              >
                                {r.initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{r.employeeName}</div>
                                <div className="text-slate-500 text-[11px]">
                                  {r.designation} • {r.employeeNumber}
                                </div>
                                <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                                  {r.bankName} - {r.bankAccountNumber}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Gaji Pokok */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 text-sm whitespace-nowrap">
                            {formatRupiah(r.baseSalary)}
                          </td>

                          {/* Tunjangan & Lembur */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-emerald-600 text-xs">
                              +{formatRupiah(r.allowances + r.overtimePay)}
                            </div>
                            <div className="text-[11px] text-slate-500 max-w-[200px] truncate mt-0.5">
                              {r.allowanceTitle}
                            </div>
                          </td>

                          {/* Potongan */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-rose-600 text-xs">
                              -{formatRupiah(r.totalDeductions)}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              PPh 21: {formatRupiah(r.pph21Amount)} • BPJS: {formatRupiah(r.bpjsTkEmp + r.bpjsKesEmp)}
                            </div>
                          </td>

                          {/* Take Home Pay */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-extrabold text-blue-600 text-sm">
                              {formatRupiah(r.takeHomePay)}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              TER {r.ptkpCategory} • {r.pph21Rate}
                            </div>
                          </td>

                          {/* Status & Aksi */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {r.verificationStatus === 'VERIFIED' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Terverifikasi</span>
                                </span>
                              )}
                              {r.verificationStatus === 'REVIEW_LEMBUR' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>Review Lembur</span>
                                </span>
                              )}
                              {r.verificationStatus === 'UNPAID_LEAVE' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Unpaid Leave</span>
                                </span>
                              )}

                              <button
                                onClick={() => setSelectedPayslip(r)}
                                title="Lihat Slip Gaji"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  Menampilkan <strong className="text-slate-800">{filteredRecords.length}</strong> dari{' '}
                  <strong className="text-slate-800">1.248</strong> karyawan
                </span>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50">
                    Sebelumnya
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold">1</button>
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                    2
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                    3
                  </button>
                  <span className="px-1 text-slate-400">...</span>
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                    104
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 or 3 cols on xl) */}
          <div className="xl:col-span-4 2xl:col-span-3 space-y-4">
            {/* Card: Distribusi Bank Payroll */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Distribusi Bank Payroll</h3>
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-blue-200/50">
                  Cash Mgmt API
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Rencana penyaluran dana payroll via sistem integrasi host-to-host perbankan nasional.
              </p>

              {/* Multi-segment Progress Bar */}
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                {periodData?.bankDistribution?.length ? (
                  periodData.bankDistribution.map((b: any, idx: number) => {
                    const colors = ['bg-blue-600', 'bg-sky-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'];
                    return (
                      <div
                        key={b.bankName}
                        className={`${colors[idx % colors.length]} h-full transition-all`}
                        style={{ width: `${b.percentage}%` }}
                        title={`${b.bankName} ${b.percentage}%`}
                      />
                    );
                  })
                ) : (
                  <>
                    <div className="bg-blue-600 h-full" style={{ width: '65%' }} title="BCA 65%" />
                    <div className="bg-sky-500 h-full" style={{ width: '25%' }} title="Mandiri 25%" />
                    <div className="bg-indigo-500 h-full" style={{ width: '10%' }} title="BNI 10%" />
                  </>
                )}
              </div>

              {/* Bank Breakdown List */}
              <div className="space-y-3 pt-1">
                {periodData?.bankDistribution?.length ? (
                  periodData.bankDistribution.map((b: any, idx: number) => {
                    const dotColors = ['bg-blue-600', 'bg-sky-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'];
                    return (
                      <div key={b.bankName} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]} flex-shrink-0`} />
                          <div>
                            <div className="font-bold text-slate-800">{b.bankName} Host-to-Host</div>
                            <div className="text-[11px] text-slate-400">
                              {b.count} Karyawan ({b.percentage}%)
                            </div>
                          </div>
                        </div>
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formatRupiah(b.amount)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {/* BCA */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">BCA Corporate</div>
                          <div className="text-[11px] text-slate-400">812 Karyawan (65%)</div>
                        </div>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">Rp 2.49 M</div>
                    </div>

                    {/* Mandiri */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">Bank Mandiri (MCM)</div>
                          <div className="text-[11px] text-slate-400">312 Karyawan (25%)</div>
                        </div>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">Rp 960 Jt</div>
                    </div>

                    {/* BNI */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">BNI Direct</div>
                          <div className="text-[11px] text-slate-400">124 Karyawan (10%)</div>
                        </div>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">Rp 392.65 Jt</div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons for Host-to-Host */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setNotification({
                      type: 'success',
                      message: 'File kliring batch (BCA Payroll & Mandiri MCM Format) siap diunduh.',
                    });
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Unduh File Format Kliring Bank</span>
                </button>
              </div>
            </div>

            {/* Compliance & Audit Immutability Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Kepatuhan Regulasi HR</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Terkalibrasi otomatis sesuai <strong>PP No. 58 Tahun 2023</strong> (PPh 21 TER) dan batas upah BPJS 2025.
              </p>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>PPh 21 TER Kategori A, B, C</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> 100% Valid
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Batas Cap UMR BPJS Kes</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Teraplikasi
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Audit Trail Immutability</span>
                  <span className="text-blue-400 font-bold">SHA-256 [REQ-DEC-09]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: JALANKAN PROSES PAYROLL (Calculation Wizard) */}
        {/* ========================================================================= */}
        {isProcessModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600 fill-blue-600" />
                  <h3 className="font-bold text-slate-900">Jalankan Proses Payroll Bulanan</h3>
                </div>
                <button
                  onClick={() => setIsProcessModalOpen(false)}
                  disabled={isProcessingPayroll}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem akan mengompilasi data absensi, jam lembur, potongan unpaid leave, formula PPh 21 TER PP 58/2023, serta iuran BPJS untuk seluruh <strong>1.248 karyawan</strong>.
                </p>

                {isProcessingPayroll ? (
                  <div className="space-y-4 py-4 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">
                        {processStep === 1 && 'Langkah 1/3: Mengunci data presensi & lembur...'}
                        {processStep === 2 && 'Langkah 2/3: Menghitung PPh 21 TER & BPJS...'}
                        {processStep === 3 && 'Langkah 3/3: Menghasilkan snapshot mutasi finansial...'}
                      </div>
                      <p className="text-xs text-slate-400">Harap tunggu, proses membutuhkan beberapa detik...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Periode</span>
                      <span className="font-bold text-slate-900">Maret 2025 (26 Feb - 25 Mar)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Target Distribusi</span>
                      <span className="font-bold text-slate-900">1.248 Karyawan Aktif</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Estimasi Total Bruto</span>
                      <span className="font-bold text-blue-600">Rp 3.842.650.000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Kepatuhan Pajak</span>
                      <span className="font-bold text-emerald-600">TER Kategori A, B, C (PP 58/2023)</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsProcessModalOpen(false)}
                    disabled={isProcessingPayroll}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleRunPayrollProcess(3)}
                    disabled={isProcessingPayroll}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    {isProcessingPayroll ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sedang Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Eksekusi Payroll</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: PENGATURAN KOMPONEN GAJI */}
        {/* ========================================================================= */}
        {isComponentModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Pengaturan Komponen Gaji & Tarif</h3>
                </div>
                <button
                  onClick={() => setIsComponentModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Formula Upah Lembur per Jam</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 font-mono text-[11px]">
                    1/173 × Gaji Pokok (Sesuai PP No. 35 Tahun 2021)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Iuran BPJS Ketenagakerjaan</label>
                    <input
                      type="text"
                      disabled
                      defaultValue="3% (JHT 2% + JP 1%) Karyawan"
                      className="w-full p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Iuran BPJS Kesehatan</label>
                    <input
                      type="text"
                      disabled
                      defaultValue="1% (Maks Upah Rp 12.000.000)"
                      className="w-full p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tabel Tarif Pajak TER 2024</label>
                  <p className="text-slate-500 mb-2">
                    Menggunakan tabel resmi DJP TER Kategori A, B, dan C berdasarkan status PTKP.
                  </p>
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Konfigurasi aktif dan tervalidasi dengan sistem pelaporan DJP Online.</span>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsComponentModalOpen(false);
                      setNotification({
                        type: 'success',
                        message: 'Pengaturan komponen gaji berhasil diperbarui.',
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: DETAIL JADWAL CUT-OFF & RILIS */}
        {/* ========================================================================= */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Jadwal Rilis Payroll Maret 2025</h3>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Cut-Off Absensi & Lembur</div>
                      <div className="text-slate-500">24 Maret 2025, 23:59 WIB (Selesai)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Approval Direktur Keuangan</div>
                      <div className="text-slate-500">26 Maret 2025, 14:00 WIB</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <Send className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900">Transfer Host-to-Host & Rilis ESS</div>
                      <div className="text-emerald-700">28 Maret 2025, 09:00 WIB</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: PRATINJAU SLIP GAJI RESMI */}
        {/* ========================================================================= */}
        {selectedPayslip && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Pratinjau Slip Gaji Resmi</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs flex items-center gap-1 font-medium shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak</span>
                  </button>
                  <button
                    onClick={() => setSelectedPayslip(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Indonesian Payslip */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
                {/* Header Perusahaan */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      PT NEXORA DIGITAL INOVASI
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Nexora Tower SCBD Lt. 18, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan
                    </p>
                    <p className="text-xs text-slate-500">NPWP: 01.345.678.9-012.000</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      SLIP GAJI KARYAWAN
                    </span>
                    <p className="text-xs font-semibold text-slate-700 mt-2">Periode Maret 2025</p>
                  </div>
                </div>

                {/* Info Karyawan */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-28 text-slate-500">Nama Karyawan</span>
                      <span className="font-bold text-slate-800">: {selectedPayslip.employeeName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500">Nomor Induk (NIK)</span>
                      <span className="font-semibold text-slate-800">: {selectedPayslip.employeeNumber}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500">Jabatan</span>
                      <span className="font-semibold text-slate-800">: {selectedPayslip.designation}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-28 text-slate-500">Departemen</span>
                      <span className="font-semibold text-slate-800">: {selectedPayslip.department}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500">Status Pajak</span>
                      <span className="font-semibold text-slate-800">: {selectedPayslip.ptkpCategory}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-slate-500">Rekening Transfer</span>
                      <span className="font-semibold text-slate-800">
                        : {selectedPayslip.bankName} - {selectedPayslip.bankAccountNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Penerimaan vs Potongan */}
                <div className="grid grid-cols-2 gap-6 text-xs">
                  {/* PENERIMAAN */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-emerald-700 border-b border-slate-200 pb-1 uppercase tracking-wider text-[11px]">
                      I. Penghasilan (Earnings)
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Gaji Pokok</span>
                        <span className="font-medium text-slate-900">{formatRupiah(selectedPayslip.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tunjangan Operasional</span>
                        <span className="font-medium text-slate-900">{formatRupiah(selectedPayslip.allowances)}</span>
                      </div>
                      {selectedPayslip.overtimePay > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Upah Lembur ({selectedPayslip.overtimeHours} Jam)</span>
                          <span className="font-medium">{formatRupiah(selectedPayslip.overtimePay)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Total Penerimaan Bruto</span>
                      <span>{formatRupiah(selectedPayslip.grossSalary)}</span>
                    </div>
                  </div>

                  {/* POTONGAN */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-rose-700 border-b border-slate-200 pb-1 uppercase tracking-wider text-[11px]">
                      II. Potongan (Deductions)
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">PPh 21 TER ({selectedPayslip.pph21Rate})</span>
                        <span className="font-medium text-rose-600">{formatRupiah(selectedPayslip.pph21Amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">BPJS Ketenagakerjaan (3%)</span>
                        <span className="font-medium text-slate-900">{formatRupiah(selectedPayslip.bpjsTkEmp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">BPJS Kesehatan (1%)</span>
                        <span className="font-medium text-slate-900">{formatRupiah(selectedPayslip.bpjsKesEmp)}</span>
                      </div>
                      {selectedPayslip.unpaidLeaveDeduction > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Potongan Unpaid Leave ({selectedPayslip.unpaidLeaveDays} Hari)</span>
                          <span className="font-medium">{formatRupiah(selectedPayslip.unpaidLeaveDeduction)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Total Potongan</span>
                      <span className="text-rose-600">{formatRupiah(selectedPayslip.totalDeductions)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
                      Penghasilan Bersih (Take Home Pay)
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ditransfer secara otomatis ke rekening karyawan pada tanggal penggajian.
                    </p>
                  </div>
                  <div className="text-2xl font-black text-blue-700">
                    {formatRupiah(selectedPayslip.takeHomePay)}
                  </div>
                </div>

                {/* Immutability Stamp */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Dokumen Digital Sah & Terenkripsi - Terverifikasi ISO 27001 [REQ-DEC-09]</span>
                  </div>
                  <span>Dicetak otomatis oleh NEXORA HRIS</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutSkeleton>
  );
}
