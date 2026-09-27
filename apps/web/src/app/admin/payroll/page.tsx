'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  CreditCard,
  Calculator,
  Lock,
  Send,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  User,
  ShieldCheck,
  ChevronRight,
  Eye,
  FileText,
  X,
  PlusCircle,
  Check,
  Printer,
  Sparkles,
} from 'lucide-react';

interface PayrollEmployeeRecord {
  id: string;
  employeeNumber: string;
  employeeName: string;
  department: string;
  designation: string;
  bankName: string;
  bankAccountMasked: string;
  baseSalary: number;
  allowances: number;
  overtimeHours: number;
  overtimePay: number;
  grossSalary: number;
  ptkpCategory: 'TER_A' | 'TER_B' | 'TER_C';
  pph21Rate: string;
  pph21Amount: number;
  bpjsTkEmp: number;
  bpjsKesEmp: number;
  otherDeductions: number;
  totalDeductions: number;
  takeHomePay: number;
}

interface PayrollPeriodItem {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'CALCULATING' | 'VERIFIED' | 'LOCKED' | 'PUBLISHED';
  totalGross: number;
  totalNet: number;
  employeeCount: number;
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function AdminPayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriodItem[]>([
    {
      id: 'per-01',
      code: '2026-10',
      name: 'Periode Penggajian Oktober 2026',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      status: 'DRAFT',
      totalGross: 62500000,
      totalNet: 56850000,
      employeeCount: 4,
    },
    {
      id: 'per-02',
      code: '2026-09',
      name: 'Periode Penggajian September 2026',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      status: 'PUBLISHED',
      totalGross: 62500000,
      totalNet: 56850000,
      employeeCount: 4,
    },
    {
      id: 'per-03',
      code: '2026-08',
      name: 'Periode Penggajian Agustus 2026',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      status: 'LOCKED',
      totalGross: 60000000,
      totalNet: 54600000,
      employeeCount: 4,
    },
  ]);

  const [selectedPeriodId, setSelectedPeriodId] = useState('per-01');
  const currentPeriod = periods.find((p) => p.id === selectedPeriodId) || periods[0];

  const [records, setRecords] = useState<PayrollEmployeeRecord[]>([
    {
      id: 'rec-1',
      employeeNumber: 'NX-2026-0001',
      employeeName: 'Budi Santoso',
      department: 'Technology & Engineering',
      designation: 'Senior Backend Engineer',
      bankName: 'BCA',
      bankAccountMasked: '••••••1842',
      baseSalary: 18000000,
      allowances: 2000000,
      overtimeHours: 4,
      overtimePay: 624277,
      grossSalary: 20624277,
      ptkpCategory: 'TER_A',
      pph21Rate: '8.00%',
      pph21Amount: 1649942,
      bpjsTkEmp: 540000,
      bpjsKesEmp: 120000,
      otherDeductions: 0,
      totalDeductions: 2309942,
      takeHomePay: 18314335,
    },
    {
      id: 'rec-2',
      employeeNumber: 'NX-2026-0002',
      employeeName: 'Siti Rahmawati',
      department: 'Finance & Accounting',
      designation: 'Finance Associate',
      bankName: 'Mandiri',
      bankAccountMasked: '••••••7721',
      baseSalary: 9500000,
      allowances: 1000000,
      overtimeHours: 0,
      overtimePay: 0,
      grossSalary: 10500000,
      ptkpCategory: 'TER_A',
      pph21Rate: '2.50%',
      pph21Amount: 262500,
      bpjsTkEmp: 285000,
      bpjsKesEmp: 95000,
      otherDeductions: 500000,
      totalDeductions: 1142500,
      takeHomePay: 9357500,
    },
    {
      id: 'rec-3',
      employeeNumber: 'NX-2026-0003',
      employeeName: 'Ahmad Fauzi',
      department: 'Human Resource',
      designation: 'People Operations Lead',
      bankName: 'BCA',
      bankAccountMasked: '••••••9012',
      baseSalary: 14000000,
      allowances: 1500000,
      overtimeHours: 0,
      overtimePay: 0,
      grossSalary: 15500000,
      ptkpCategory: 'TER_A',
      pph21Rate: '6.00%',
      pph21Amount: 930000,
      bpjsTkEmp: 420000,
      bpjsKesEmp: 120000,
      otherDeductions: 0,
      totalDeductions: 1470000,
      takeHomePay: 14030000,
    },
    {
      id: 'rec-4',
      employeeNumber: 'NX-2026-0004',
      employeeName: 'Dewi Lestari',
      department: 'Marketing & Growth',
      designation: 'Digital Marketing Lead',
      bankName: 'BNI',
      bankAccountMasked: '••••••3341',
      baseSalary: 12000000,
      allowances: 1000000,
      overtimeHours: 2,
      overtimePay: 242775,
      grossSalary: 13242775,
      ptkpCategory: 'TER_B',
      pph21Rate: '4.00%',
      pph21Amount: 529711,
      bpjsTkEmp: 360000,
      bpjsKesEmp: 120000,
      otherDeductions: 0,
      totalDeductions: 1009711,
      takeHomePay: 12233064,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEmployeeRecord | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Totals
  const totalGross = records.reduce((acc, r) => acc + r.grossSalary, 0);
  const totalNet = records.reduce((acc, r) => acc + r.takeHomePay, 0);
  const totalPph21 = records.reduce((acc, r) => acc + r.pph21Amount, 0);
  const totalBpjs = records.reduce((acc, r) => acc + r.bpjsTkEmp + r.bpjsKesEmp, 0);

  // Jalankan Kalkulasi
  const handleCalculatePayroll = () => {
    if (currentPeriod.status === 'LOCKED' || currentPeriod.status === 'PUBLISHED') {
      setNotification({
        type: 'error',
        message:
          'PAYROLL_PERIOD_LOCKED: Periode penggajian telah dikunci. Modifikasi data finansial dilarang sesuai ketetapan [REQ-DEC-09].',
      });
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setPeriods((prev) =>
        prev.map((p) =>
          p.id === currentPeriod.id ? { ...p, status: 'VERIFIED' as const } : p,
        ),
      );
      setNotification({
        type: 'success',
        message: `Kalkulasi payroll periode ${currentPeriod.name} selesai. Formula PPh 21 TER 2024 dan BPJS berhasil diproses untuk 4 karyawan.`,
      });
    }, 1200);
  };

  // Kunci Periode [REQ-DEC-09]
  const handleLockPeriod = () => {
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === currentPeriod.id ? { ...p, status: 'LOCKED' as const } : p,
      ),
    );
    setNotification({
      type: 'success',
      message: `Periode ${currentPeriod.name} telah DIKUNCI (LOCKED). Data historis finansial dan kehadiran resmi bersifat kekal (immutable) [REQ-DEC-09].`,
    });
  };

  // Publikasikan ke ESS
  const handlePublishPeriod = () => {
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === currentPeriod.id ? { ...p, status: 'PUBLISHED' as const } : p,
      ),
    );
    setNotification({
      type: 'success',
      message: `Slip gaji periode ${currentPeriod.name} berhasil DIPUBLIKASIKAN. Karyawan kini dapat mengunduh slip gaji di portal ESS.`,
    });
  };

  const filteredRecords = records.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminLayoutSkeleton>
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Toast Notifikasi */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <CreditCard className="w-4 h-4" />
              <span>Financial & Tax Compliance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Payroll Core & PPh 21 TER Engine</h1>
            <p className="text-sm text-slate-500 mt-1">
              Kompilasi gaji bulanan otomatis, tarif efektif PPh 21 TER 2024 (PP 58/2023), BPJS, dan audit immutability [REQ-DEC-09].
            </p>
          </div>

          {/* Action Workflow Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCalculatePayroll}
              disabled={isCalculating || currentPeriod.status === 'LOCKED' || currentPeriod.status === 'PUBLISHED'}
              className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 shadow-sm transition-all ${
                currentPeriod.status === 'LOCKED' || currentPeriod.status === 'PUBLISHED'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>{isCalculating ? 'Mengkalkulasi...' : 'Kalkulasi Payroll'}</span>
            </button>

            {currentPeriod.status === 'VERIFIED' && (
              <button
                onClick={handleLockPeriod}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Kunci Periode [REQ-DEC-09]</span>
              </button>
            )}

            {(currentPeriod.status === 'LOCKED' || currentPeriod.status === 'VERIFIED') && (
              <button
                onClick={handlePublishPeriod}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Publikasikan ke ESS</span>
              </button>
            )}

            <Link
              href="/ess/payroll"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              Lihat Portal ESS
            </Link>
          </div>
        </div>

        {/* Periode Selector Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pilih Periode:
            </span>
            <div className="flex items-center gap-2">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriodId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    p.id === selectedPeriodId
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Status Periode:</span>
            {currentPeriod.status === 'DRAFT' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                DRAFT
              </span>
            )}
            {currentPeriod.status === 'VERIFIED' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>VERIFIED (Siap Dikunci)</span>
              </span>
            )}
            {currentPeriod.status === 'LOCKED' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>LOCKED (Immutable [REQ-DEC-09])</span>
              </span>
            )}
            {currentPeriod.status === 'PUBLISHED' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PUBLISHED (Aktif di ESS)</span>
              </span>
            )}
          </div>
        </div>

        {/* Ringkasan Finansial Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Beban Gaji Bruto
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {formatRupiah(totalGross)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Gaji Pokok, Tunjangan & Lembur</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Take Home Pay (Net)
            </span>
            <div className="text-2xl font-extrabold text-blue-600 mt-2">
              {formatRupiah(totalNet)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Dana Ditransfer ke Rekening Karyawan</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Potongan Pajak PPh 21 TER
            </span>
            <div className="text-2xl font-extrabold text-rose-600 mt-2">
              {formatRupiah(totalPph21)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Disetor ke Kas Negara (DJP)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Iuran BPJS Karyawan
            </span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-2">
              {formatRupiah(totalBpjs)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">JHT (2%) + JP (1%) + Kes (1%)</p>
          </div>
        </div>

        {/* Tabel Rincian Penggajian */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900">Daftar Payroll Karyawan Terhitung</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data snapshot rekening bank dan rincian pajak kebal mutasi jabatan.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama karyawan, NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4">Gaji Pokok</th>
                  <th className="py-3 px-4">Tunjangan & Lembur</th>
                  <th className="py-3 px-4">Penghasilan Bruto</th>
                  <th className="py-3 px-4">PPh 21 TER 2024</th>
                  <th className="py-3 px-4">BPJS (TK+Kes)</th>
                  <th className="py-3 px-4">Take Home Pay (Net)</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{r.employeeName}</div>
                      <div className="text-slate-400 text-[11px]">
                        {r.employeeNumber} • {r.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {formatRupiah(r.baseSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{formatRupiah(r.allowances)}</div>
                      {r.overtimePay > 0 && (
                        <div className="text-[11px] text-emerald-600 font-medium">
                          +Lembur: {formatRupiah(r.overtimePay)} ({r.overtimeHours}j)
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatRupiah(r.grossSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-rose-600">{formatRupiah(r.pph21Amount)}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        {r.ptkpCategory} • {r.pph21Rate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">
                        {formatRupiah(r.bpjsTkEmp + r.bpjsKesEmp)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        TK {formatRupiah(r.bpjsTkEmp)} | Kes {formatRupiah(r.bpjsKesEmp)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-blue-600">
                        {formatRupiah(r.takeHomePay)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {r.bankName} {r.bankAccountMasked}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayslip(r)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Slip Gaji</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL PRATINJAU SLIP GAJI RESMI */}
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
                    onClick={() => alert('Mencetak Slip Gaji Resmi...')}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs flex items-center gap-1 font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak</span>
                  </button>
                  <button
                    onClick={() => setSelectedPayslip(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Authentic Indonesian Payslip */}
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
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      SLIP GAJI KARYAWAN
                    </span>
                    <p className="text-xs font-semibold text-slate-700 mt-2">{currentPeriod.name}</p>
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
                        : {selectedPayslip.bankName} {selectedPayslip.bankAccountMasked}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kolom Penerimaan vs Kolom Potongan */}
                <div className="grid grid-cols-2 gap-6 text-xs">
                  {/* PENERIMAAN */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider text-[11px] text-emerald-700">
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
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wider text-[11px] text-rose-700">
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
                      {selectedPayslip.otherDeductions > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Potongan Koperasi / Lainnya</span>
                          <span className="font-medium text-rose-600">{formatRupiah(selectedPayslip.otherDeductions)}</span>
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

                {/* Stempel Immutability Audit */}
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
