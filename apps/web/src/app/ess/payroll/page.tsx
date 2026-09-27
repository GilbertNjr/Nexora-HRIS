'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EssLayoutSkeleton } from '@/components/layout/EssLayoutSkeleton';
import {
  FileText,
  Download,
  Calendar,
  Eye,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Printer,
  X,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface EssPayslipItem {
  id: string;
  periodCode: string;
  periodName: string;
  payDate: string;
  baseSalary: number;
  allowances: number;
  overtimePay: number;
  grossSalary: number;
  pph21Rate: string;
  pph21Amount: number;
  bpjsTk: number;
  bpjsKes: number;
  otherDeductions: number;
  totalDeductions: number;
  takeHomePay: number;
  bankName: string;
  accountNumberMasked: string;
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function EssPayrollPage() {
  const [payslips, setPayslips] = useState<EssPayslipItem[]>([
    {
      id: 'slip-09',
      periodCode: '2026-09',
      periodName: 'Gaji Bulan September 2026',
      payDate: '25 September 2026',
      baseSalary: 18000000,
      allowances: 2000000,
      overtimePay: 624277,
      grossSalary: 20624277,
      pph21Rate: '8.00% (TER A)',
      pph21Amount: 1649942,
      bpjsTk: 540000,
      bpjsKes: 120000,
      otherDeductions: 0,
      totalDeductions: 2309942,
      takeHomePay: 18314335,
      bankName: 'BCA',
      accountNumberMasked: '••••••1842',
    },
    {
      id: 'slip-08',
      periodCode: '2026-08',
      periodName: 'Gaji Bulan Agustus 2026',
      payDate: '25 Agustus 2026',
      baseSalary: 18000000,
      allowances: 2000000,
      overtimePay: 312138,
      grossSalary: 20312138,
      pph21Rate: '8.00% (TER A)',
      pph21Amount: 1624971,
      bpjsTk: 540000,
      bpjsKes: 120000,
      otherDeductions: 0,
      totalDeductions: 2284971,
      takeHomePay: 18027167,
      bankName: 'BCA',
      accountNumberMasked: '••••••1842',
    },
    {
      id: 'slip-07',
      periodCode: '2026-07',
      periodName: 'Gaji Bulan Juli 2026',
      payDate: '25 Juli 2026',
      baseSalary: 18000000,
      allowances: 2000000,
      overtimePay: 0,
      grossSalary: 20000000,
      pph21Rate: '8.00% (TER A)',
      pph21Amount: 1600000,
      bpjsTk: 540000,
      bpjsKes: 120000,
      otherDeductions: 0,
      totalDeductions: 2260000,
      takeHomePay: 17740000,
      bankName: 'BCA',
      accountNumberMasked: '••••••1842',
    },
  ]);

  const [selectedSlip, setSelectedSlip] = useState<EssPayslipItem | null>(null);

  const latestSlip = payslips[0];

  return (
    <EssLayoutSkeleton>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Employee Financial Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Slip Gaji Digital (Payslips)</h1>
            <p className="text-sm text-slate-500 mt-1">
              Akses riwayat slip gaji resmi, rincian potongan PPh 21 TER, dan iuran BPJS ketenagakerjaan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Rekening Terverifikasi BCA</span>
            </span>
          </div>
        </div>

        {/* Kartu Highlight Gaji Bulan Terakhir */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-xl border border-indigo-700/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Gaji Bersih Bulan Berjalan (Take Home Pay)
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-white">
                {formatRupiah(latestSlip.takeHomePay)}
              </div>
              <p className="text-xs text-indigo-200 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Telah ditransfer ke rekening {latestSlip.bankName} {latestSlip.accountNumberMasked} pada {latestSlip.payDate}
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setSelectedSlip(latestSlip)}
                className="px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-semibold text-xs hover:bg-indigo-50 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat Rincian Lengkap</span>
              </button>
              <button
                onClick={() => alert(`Mengunduh PDF Slip Gaji ${latestSlip.periodName}...`)}
                className="px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium text-xs border border-indigo-500/30 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Riwayat Slip Gaji Bulanan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Arsip Slip Gaji Bulanan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua dokumen slip gaji tersimpan permanen dan kebal mutasi data [REQ-DEC-09].
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Tahun 2026
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {payslips.map((slip) => (
              <div
                key={slip.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{slip.periodName}</span>
                    <span className="text-xs font-medium text-slate-400">•</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Transfer Sukses
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dibayarkan pada: {slip.payDate} • Rekening: {slip.bankName} {slip.accountNumberMasked}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                    <span>Bruto: {formatRupiah(slip.grossSalary)}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-rose-600">Pajak: {formatRupiah(slip.pph21Amount)}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-indigo-600">BPJS: {formatRupiah(slip.bpjsTk + slip.bpjsKes)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Take Home Pay</span>
                    <div className="text-base font-extrabold text-indigo-600">
                      {formatRupiah(slip.takeHomePay)}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSlip(slip)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors"
                    title="Lihat Rincian Slip Gaji"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL SLIP GAJI LENGKAP */}
        {selectedSlip && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">Slip Gaji Elektronik Resmi</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Mengunduh PDF Slip Gaji ${selectedSlip.periodName}...`)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs flex items-center gap-1 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedSlip(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
                {/* Header Perusahaan */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">PT NEXORA DIGITAL INOVASI</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Nexora Tower SCBD Lt. 18, Jakarta Selatan</p>
                    <p className="text-xs text-slate-500">NPWP: 01.345.678.9-012.000</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      SLIP GAJI
                    </span>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{selectedSlip.periodName}</p>
                  </div>
                </div>

                {/* Info Karyawan */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-500">Nama: </span>
                      <span className="font-bold text-slate-800">Budi Santoso</span>
                    </div>
                    <div>
                      <span className="text-slate-500">NIK: </span>
                      <span className="font-semibold text-slate-800">NX-2026-0001</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Jabatan: </span>
                      <span className="font-semibold text-slate-800">Senior Backend Engineer</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-500">Departemen: </span>
                      <span className="font-semibold text-slate-800">Technology & Engineering</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Kategori Pajak: </span>
                      <span className="font-semibold text-slate-800">{selectedSlip.pph21Rate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Rekening: </span>
                      <span className="font-semibold text-slate-800">
                        {selectedSlip.bankName} {selectedSlip.accountNumberMasked}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rincian Komponen Gaji */}
                <div className="grid grid-cols-2 gap-6 text-xs">
                  {/* Penerimaan */}
                  <div className="space-y-2.5">
                    <h4 className="font-bold uppercase tracking-wider text-[11px] text-emerald-700 border-b border-slate-200 pb-1">
                      Penerimaan
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Gaji Pokok</span>
                        <span className="font-medium text-slate-900">{formatRupiah(selectedSlip.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tunjangan Operasional</span>
                        <span className="font-medium text-slate-900">{formatRupiah(selectedSlip.allowances)}</span>
                      </div>
                      {selectedSlip.overtimePay > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Upah Lembur</span>
                          <span className="font-medium">{formatRupiah(selectedSlip.overtimePay)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Total Penghasilan Bruto</span>
                      <span>{formatRupiah(selectedSlip.grossSalary)}</span>
                    </div>
                  </div>

                  {/* Potongan */}
                  <div className="space-y-2.5">
                    <h4 className="font-bold uppercase tracking-wider text-[11px] text-rose-700 border-b border-slate-200 pb-1">
                      Potongan
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-600">PPh 21 TER ({selectedSlip.pph21Rate})</span>
                        <span className="font-medium text-rose-600">{formatRupiah(selectedSlip.pph21Amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">BPJS Ketenagakerjaan (3%)</span>
                        <span className="font-medium text-slate-900">{formatRupiah(selectedSlip.bpjsTk)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">BPJS Kesehatan (1%)</span>
                        <span className="font-medium text-slate-900">{formatRupiah(selectedSlip.bpjsKes)}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Total Potongan</span>
                      <span className="text-rose-600">{formatRupiah(selectedSlip.totalDeductions)}</span>
                    </div>
                  </div>
                </div>

                {/* Take Home Pay */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-indigo-800 tracking-wider">
                      Penghasilan Bersih Diterima
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Telah disalurkan ke rekening bank Anda pada {selectedSlip.payDate}.
                    </p>
                  </div>
                  <div className="text-2xl font-black text-indigo-700">
                    {formatRupiah(selectedSlip.takeHomePay)}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Terverifikasi Digital Resmi NEXORA [REQ-DEC-09]</span>
                  </div>
                  <span>Dicetak otomatis</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </EssLayoutSkeleton>
  );
}
