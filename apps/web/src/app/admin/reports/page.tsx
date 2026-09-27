'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  FileBarChart,
  Users,
  Clock,
  CreditCard,
  Building2,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  PieChart,
} from 'lucide-react';

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  const departmentStats = [
    { name: 'Technology & Engineering', count: 1, percentage: 25, color: 'bg-blue-600' },
    { name: 'Finance & Accounting', count: 1, percentage: 25, color: 'bg-indigo-600' },
    { name: 'Human Resource Department', count: 1, percentage: 25, color: 'bg-purple-600' },
    { name: 'Marketing & Growth', count: 1, percentage: 25, color: 'bg-emerald-600' },
  ];

  const taxStats = [
    {
      category: 'Kategori TER A (TK/0, TK/1, K/0)',
      count: 3,
      gross: 49367052,
      tax: 2842442,
    },
    {
      category: 'Kategori TER B (TK/2, TK/3, K/1, K/2)',
      count: 1,
      gross: 13242775,
      tax: 529711,
    },
    {
      category: 'Kategori TER C (K/3)',
      count: 0,
      gross: 0,
      tax: 0,
    },
  ];

  const totalGrossTaxable = taxStats.reduce((acc, t) => acc + t.gross, 0);
  const totalTaxPayable = taxStats.reduce((acc, t) => acc + t.tax, 0);

  return (
    <AdminLayoutSkeleton>
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <FileBarChart className="w-4 h-4" />
              <span>C-Level & Executive Reporting</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Laporan Eksekutif & Kepatuhan Pajak</h1>
            <p className="text-sm text-slate-500 mt-1">
              Ringkasan metrik analitik personalia, disiplin jam kerja, dan kepatuhan perpajakan SPT Masa PPh 21 TER.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Mengekspor File SPT Masa PPh 21 TER format CSV e-Bupot DJP...')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor CSV DJP</span>
            </button>
            <button
              onClick={() => alert('Mengekspor Laporan HR Komprehensif format Excel...')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Karyawan Aktif
              </span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">4 Orang</div>
            <p className="text-[11px] text-slate-500 mt-1">3 PKWTT (Tetap) • 1 PKWT (Kontrak)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Disiplin Kehadiran (On-Time)
              </span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">95.8%</div>
            <p className="text-[11px] text-slate-500 mt-1">Target Perusahaan &ge; 95.0% (Tercapai)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Beban Payroll Bruto
              </span>
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {formatRupiah(totalGrossTaxable)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Periode September 2026</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Pajak PPh 21 TER
              </span>
              <TrendingUp className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-rose-600 mt-2">
              {formatRupiah(totalTaxPayable)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">SPT Masa Disetor ke DJP</p>
          </div>
        </div>

        {/* Distribusi Departemen & Kehadiran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Distribusi Departemen */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Distribusi Headcount Departemen</h3>
                <p className="text-xs text-slate-500 mt-0.5">Komposisi persebaran personel di SCBD HQ.</p>
              </div>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>

            <div className="space-y-3 pt-2">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{dept.name}</span>
                    <span className="font-bold text-slate-900">{dept.count} Org ({dept.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${dept.color} h-full`} style={{ width: `${dept.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rekapitulasi Kehadiran & Cuti */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Rekapitulasi Kehadiran & Cuti</h3>
                <p className="text-xs text-slate-500 mt-0.5">Analisis keterlambatan dan cuti bulan berjalan.</p>
              </div>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-800">Tepat Waktu</span>
                <div className="text-xl font-black text-emerald-700 mt-1">68 Kali</div>
                <span className="text-[10px] text-emerald-600">Presensi SCBD</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-800">Terlambat</span>
                <div className="text-xl font-black text-amber-700 mt-1">3 Kali</div>
                <span className="text-[10px] text-amber-600">Rata-rata 12 mnt</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-[11px] font-semibold text-indigo-800">Cuti & Izin</span>
                <div className="text-xl font-black text-indigo-700 mt-1">4 Hari</div>
                <span className="text-[10px] text-indigo-600">Disetujui HR</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Seluruh pencatatan absensi tervalidasi radar geofence GPS 100m.</span>
            </div>
          </div>
        </div>

        {/* Tabel Rekapitulasi Pajak PPh 21 TER 2024 (PP 58/2023) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">Rekapitulasi SPT Masa PPh 21 TER (PP 58/2023)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelompokan pelaporan pajak penghasilan bulanan resmi siap lapor DJP e-Bupot.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Periode 2026-09
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Kategori TER (Tarif Efektif Rata-Rata)</th>
                  <th className="py-3 px-4 text-center">Jumlah Pegawai</th>
                  <th className="py-3 px-4">Total Penghasilan Bruto</th>
                  <th className="py-3 px-4">Total PPh 21 Terutang</th>
                  <th className="py-3 px-4 text-right">Kepatuhan DJP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxStats.map((item) => (
                  <tr key={item.category} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {item.count}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {formatRupiah(item.gross)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      {formatRupiah(item.tax)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Siap Lapor
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <td className="py-3 px-4">TOTAL KESELURUHAN</td>
                  <td className="py-3 px-4 text-center">4</td>
                  <td className="py-3 px-4 font-mono">{formatRupiah(totalGrossTaxable)}</td>
                  <td className="py-3 px-4 font-mono text-rose-600">{formatRupiah(totalTaxPayable)}</td>
                  <td className="py-3 px-4 text-right text-emerald-700">100% Valid</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </AdminLayoutSkeleton>
  );
}
