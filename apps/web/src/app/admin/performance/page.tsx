'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  TrendingUp,
  PlusCircle,
  Plus,
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
  ArrowUpRight,
  Target,
  FileSpreadsheet,
  ChevronDown,
  Layers,
  Sparkles,
  HelpCircle,
  Eye,
} from 'lucide-react';

export default function AdminPerformancePage() {
  const [selectedCycle, setSelectedCycle] = useState('Q1 2025 (Selesai)');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Semua Departemen');

  const performanceList = [
    {
      id: 'perf-1',
      name: 'Ir. Andi Wijaya, M.Kom',
      nik: 'NX-2018-0102',
      role: 'Chief Technology Officer',
      department: 'Technology',
      score: 4.85,
      grade: 'Grade A (Outstanding)',
      gradeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      okrAchievement: '112%',
      status: 'TERVERIFIKASI',
    },
    {
      id: 'perf-2',
      name: 'Dewi Lestari, S.Psi',
      nik: 'NX-2020-0012',
      role: 'HR Operations Manager',
      department: 'Human Resources',
      score: 4.65,
      grade: 'Grade A (Outstanding)',
      gradeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      okrAchievement: '108%',
      status: 'TERVERIFIKASI',
    },
    {
      id: 'perf-3',
      name: 'Bambang Sutedjo',
      nik: 'NX-2019-0045',
      role: 'Warehouse Logistics Lead',
      department: 'Operasional',
      score: 4.15,
      grade: 'Grade B+ (Exceeds)',
      gradeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      okrAchievement: '102%',
      status: 'TERVERIFIKASI',
    },
    {
      id: 'perf-4',
      name: 'Budi Santoso',
      nik: 'NX-2022-1140',
      role: 'Senior UI/UX Designer',
      department: 'Product & Design',
      score: 3.88,
      grade: 'Grade B (Meets)',
      gradeColor: 'text-slate-700 bg-slate-100 border-slate-200',
      okrAchievement: '96%',
      status: 'TERVERIFIKASI',
    },
    {
      id: 'perf-5',
      name: 'Hendra Gunawan',
      nik: 'NX-2024-0811',
      role: 'Junior Account Executive',
      department: 'Sales & Marketing',
      score: 2.85,
      grade: 'Grade C (PIP Wajib)',
      gradeColor: 'text-rose-700 bg-rose-50 border-rose-200',
      okrAchievement: '72%',
      status: 'PERLU COACHING',
    },
  ];

  return (
    <AdminLayoutSkeleton>
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Evaluasi Kinerja &amp; Manajemen KPI Karyawan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Pantau siklus penilaian kinerja berkala, distribusi kurva bell normal, pemetaan talent 9-Box
              matrix, serta evaluasi review 360° seluruh karyawan Nexora.
            </p>
          </div>

          {/* Action Buttons Top Right: Includes TRIGGER BUTTON FROM SCREENSHOT 1 */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Unduh Matriks (.xlsx) */}
            <button
              type="button"
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

        {/* Top 4 KPI Metrics */}
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
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">3.82</span>
              <span className="text-sm font-semibold text-slate-700">/ 5.00</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Meets Expectations (Standar Baik)</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Benchmark Q1 2025</span>
              <span className="font-bold text-emerald-600">+0.14 YoY</span>
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
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">168</span>
              <span className="text-sm font-semibold text-slate-700">Karyawan</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">13.5% dari total populasi staf</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Sesuai Kuota Kurva Bell</span>
              <span className="font-bold text-blue-600">Sempurna</span>
            </div>
          </div>

          {/* Card 3: PROGRESS SIKLUS AKTIF */}
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
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">Q1 2025</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tersinkronisasi Payroll
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Siklus Q2 2025 dijadwalkan buka 01 Juli</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">100% Review Selesai</span>
              <span className="font-bold text-slate-700">1.248 Staf</span>
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
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">42</span>
              <span className="text-sm font-semibold text-slate-700">Kandidat PIP</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">3.4% populasi memerlukan mentoring khusus</p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Tenggat Action Plan</span>
              <span className="font-bold text-rose-600">30 Hari</span>
            </div>
          </div>
        </div>

        {/* Performance Table & Records */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Daftar Hasil Penilaian Kinerja Karyawan (Siklus Q1 2025)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kompilasi nilai akhir multi-tier appraisal, capaian OKR, dan grade merit kompensasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIK..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 w-44"
                />
              </div>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
              >
                <option value="Semua Departemen">Semua Departemen</option>
                <option value="Technology">Technology</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operasional">Operasional</option>
                <option value="Product & Design">Product &amp; Design</option>
                <option value="Sales & Marketing">Sales &amp; Marketing</option>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {performanceList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.nik} • {p.role}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{p.department}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{p.score}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${p.gradeColor}`}>
                        {p.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-700">{p.okrAchievement}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayoutSkeleton>
  );
}
