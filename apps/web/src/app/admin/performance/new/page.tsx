'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Save,
  Rocket,
  ShieldCheck,
  Check,
  X,
  SlidersHorizontal,
  Info,
  Layers,
  Sparkles,
  Users,
  Award,
  AlertTriangle,
  FileText,
  BarChart2,
  Plus,
  HelpCircle,
  Eye,
  Send,
  Target,
  UserCheck,
  Activity,
  CheckSquare,
  Square,
  Building2,
} from 'lucide-react';

export default function NewPerformanceCyclePage() {
  // Stepper state
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  // Form State matching screenshot & continued
  const [cycleForm, setCycleForm] = useState({
    name: 'Siklus Penilaian Kinerja Karyawan — Kuartal II 2025 (Q2 2025)',
    type: 'Kuartalan' as 'Kuartalan' | 'Tahunan' | 'Masa Percobaan' | 'Proyek Khusus',
    periodStart: '2025-04-01',
    periodEnd: '2025-06-30',
    windowStart: '2025-07-01',
    windowEnd: '2025-07-20',
    methods: {
      selfAppraisal: true,
      managerReview: true,
      peerReview: true,
      calibrationCommittee: true,
    },
    // Weights (Step 2 continuation)
    weights: {
      okr: 50,
      coreValues: 30,
      crossCollaboration: 20,
    },
    // Participant scope (Step 3 continuation)
    participantScope: 'Semua Divisi (1.248 Staf)',
    minTenureMonths: 3,
    excludeMaternityLongLeave: true,
  });

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveDraft = () => {
    showToast('Draf konfigurasi siklus kinerja berhasil disimpan.');
  };

  const handleLaunchCycle = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      setLaunchSuccess(true);
      showToast('Siklus Penilaian Kinerja Q2 2025 berhasil diluncurkan ke seluruh organisasi!');
    }, 1200);
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
        {/* Breadcrumb matching screenshot */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Operasional</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin/performance" className="hover:text-blue-600 transition-colors">
            Evaluasi Kinerja (KPI)
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 font-semibold">Buka Siklus Baru</span>
        </nav>

        {/* Header Section matching screenshot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Konfigurasi &amp; Peluncuran Siklus Penilaian Kinerja Baru
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                DRAF Q2 2025
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Atur periode evaluasi, alokasi pembobotan OKR &amp; KPI, cakupan divisi partisipan, matriks
              kalibrasi 9-Box, dan jadwal tahapan review 360° sebelum disiarkan ke seluruh jajaran
              organisasi.
            </p>
          </div>

          {/* Action Buttons Top Right matching screenshot */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Kembali ke KPI */}
            <Link
              href="/admin/performance"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Kembali ke KPI</span>
            </Link>

            {/* Simpan Draf */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Simpan Draf</span>
            </button>

            {/* Luncurkan Siklus */}
            <button
              type="button"
              onClick={() => setIsLaunchModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
            >
              <Rocket className="w-3.5 h-3.5 text-white" />
              <span>Luncurkan Siklus</span>
            </button>
          </div>
        </div>

        {/* 4 Steps Stepper Wizard matching screenshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Step 1: Tahap Aktif */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeStep === 1
                ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeStep === 1 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              1
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                TAHAP AKTIF
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Parameter &amp; Periode</p>
            </div>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeStep === 2
                ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeStep === 2 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                LANGKAH 2
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Matriks Bobot &amp; Kategori</p>
            </div>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeStep === 3
                ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeStep === 3 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                LANGKAH 3
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Sasaran &amp; Pengecualian</p>
            </div>
          </button>

          {/* Step 4 */}
          <button
            type="button"
            onClick={() => setActiveStep(4)}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeStep === 4
                ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeStep === 4 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              4
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                LANGKAH 4
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Timeline &amp; Otorisasi</p>
            </div>
          </button>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Main Form (~65% width / 8 cols)              */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Informasi Dasar & Periode Siklus matching screenshot */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      Informasi Dasar &amp; Periode Siklus
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tentukan nama, klasifikasi siklus kinerja, dan durasi pengisian formulir.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-center border border-slate-200">
                  Modul Utama
                </span>
              </div>

              {/* Form Input: Nama Siklus Evaluasi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nama Siklus Evaluasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cycleForm.name}
                  onChange={(e) => setCycleForm({ ...cycleForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Form Input: Tipe Siklus Evaluasi (4 Cards) matching screenshot */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Tipe Siklus Evaluasi</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Kuartalan */}
                  <button
                    type="button"
                    onClick={() => setCycleForm({ ...cycleForm, type: 'Kuartalan' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cycleForm.type === 'Kuartalan'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Kuartalan</span>
                      {cycleForm.type === 'Kuartalan' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">Quarterly Review Q2</p>
                  </button>

                  {/* Tahunan */}
                  <button
                    type="button"
                    onClick={() => setCycleForm({ ...cycleForm, type: 'Tahunan' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cycleForm.type === 'Tahunan'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Tahunan</span>
                      {cycleForm.type === 'Tahunan' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">Annual Appraisal 2025</p>
                  </button>

                  {/* Masa Percobaan */}
                  <button
                    type="button"
                    onClick={() => setCycleForm({ ...cycleForm, type: 'Masa Percobaan' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cycleForm.type === 'Masa Percobaan'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Masa Percobaan</span>
                      {cycleForm.type === 'Masa Percobaan' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">Probation Review</p>
                  </button>

                  {/* Proyek Khusus */}
                  <button
                    type="button"
                    onClick={() => setCycleForm({ ...cycleForm, type: 'Proyek Khusus' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cycleForm.type === 'Proyek Khusus'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Proyek Khusus</span>
                      {cycleForm.type === 'Proyek Khusus' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">Milestone Review</p>
                  </button>
                </div>
              </div>

              {/* Two Date Range Boxes matching screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Box 1: Periode Kinerja yang Dinilai */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Periode Kinerja yang Dinilai
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Rentang capaian performa aktual karyawan.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="date"
                      value={cycleForm.periodStart}
                      onChange={(e) => setCycleForm({ ...cycleForm, periodStart: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                    />
                    <span className="text-xs text-slate-400 font-medium">s/d</span>
                    <input
                      type="date"
                      value={cycleForm.periodEnd}
                      onChange={(e) => setCycleForm({ ...cycleForm, periodEnd: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Box 2: Jendela Pengisian & Review */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Jendela Pengisian &amp; Review</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                      20 Hari Kerja
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Tenggat pembukaan portal evaluasi staf &amp; atasan.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="date"
                      value={cycleForm.windowStart}
                      onChange={(e) => setCycleForm({ ...cycleForm, windowStart: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                    />
                    <span className="text-xs text-slate-400 font-medium">s/d</span>
                    <input
                      type="date"
                      value={cycleForm.windowEnd}
                      onChange={(e) => setCycleForm({ ...cycleForm, windowEnd: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Metodologi & Alur Penilaian (Multi-tier Feedback) matching screenshot & completed */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Metodologi &amp; Alur Penilaian (Multi-tier Feedback)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Self-Appraisal */}
                  <div
                    onClick={() =>
                      setCycleForm({
                        ...cycleForm,
                        methods: {
                          ...cycleForm.methods,
                          selfAppraisal: !cycleForm.methods.selfAppraisal,
                        },
                      })
                    }
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={cycleForm.methods.selfAppraisal}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Self-Appraisal</span>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Penilaian mandiri karyawan terhadap pencapaian objektif.
                      </p>
                    </div>
                  </div>

                  {/* Review Atasan Langsung */}
                  <div
                    onClick={() =>
                      setCycleForm({
                        ...cycleForm,
                        methods: {
                          ...cycleForm.methods,
                          managerReview: !cycleForm.methods.managerReview,
                        },
                      })
                    }
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={cycleForm.methods.managerReview}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Review Atasan Langsung</span>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Evaluasi 1-on-1 dan penilaian resmi Manajer L1 &amp; L2.
                      </p>
                    </div>
                  </div>

                  {/* Peer Review 360° (Continued cut-off) */}
                  <div
                    onClick={() =>
                      setCycleForm({
                        ...cycleForm,
                        methods: {
                          ...cycleForm.methods,
                          peerReview: !cycleForm.methods.peerReview,
                        },
                      })
                    }
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={cycleForm.methods.peerReview}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Peer Review 360°</span>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Umpan balik rekan sejawat lintas divisi untuk penilaian kolaborasi budaya kerja.
                      </p>
                    </div>
                  </div>

                  {/* Komite Kalibrasi HR & C-Level (Continued cut-off) */}
                  <div
                    onClick={() =>
                      setCycleForm({
                        ...cycleForm,
                        methods: {
                          ...cycleForm.methods,
                          calibrationCommittee: !cycleForm.methods.calibrationCommittee,
                        },
                      })
                    }
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={cycleForm.methods.calibrationCommittee}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Komite Kalibrasi HR &amp; C-Level
                      </span>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Sesi kalibrasi kurva bell dan pemetaan matriks 9-Box talent pool organisasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* CONTINUATION: Pembobotan Komponen KPI (Bobot = 100%)       */}
              {/* ========================================================= */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      2. Matriks Pembobotan Komponen (Total Bobot: 100%)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Keseimbangan porsi antara pencapaian target individual dan pengamalan nilai budaya.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Total: {cycleForm.weights.okr + cycleForm.weights.coreValues + cycleForm.weights.crossCollaboration}%
                  </span>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  {/* OKR Weight */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Capaian OKR &amp; Target Kinerja Individu</span>
                      <span className="text-blue-700">{cycleForm.weights.okr}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={80}
                      value={cycleForm.weights.okr}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          weights: { ...cycleForm.weights, okr: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Core Values Weight */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Core Values &amp; Kepemimpinan (Leadership Competencies)</span>
                      <span className="text-indigo-700">{cycleForm.weights.coreValues}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      value={cycleForm.weights.coreValues}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          weights: { ...cycleForm.weights, coreValues: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Collaboration Weight */}
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Inovasi &amp; Kolaborasi Tim (Cross-functional Project)</span>
                      <span className="text-emerald-700">{cycleForm.weights.crossCollaboration}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={40}
                      value={cycleForm.weights.crossCollaboration}
                      onChange={(e) =>
                        setCycleForm({
                          ...cycleForm,
                          weights: { ...cycleForm.weights, crossCollaboration: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* CONTINUATION: Cakupan Partisipan & Pengecualian */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">
                  3. Cakupan Partisipan &amp; Kriteria Pengecualian
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cakupan Divisi Karyawan</label>
                    <select
                      value={cycleForm.participantScope}
                      onChange={(e) => setCycleForm({ ...cycleForm, participantScope: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Semua Divisi (1.248 Staf)">Semua Divisi Organisasi (1.248 Staf)</option>
                      <option value="Divisi Teknologi & Produk Saja">Divisi Teknologi &amp; Produk Saja</option>
                      <option value="Divisi Operasional & Bisnis">Divisi Operasional &amp; Bisnis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Syarat Masa Kerja Minimal</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={cycleForm.minTenureMonths}
                        onChange={(e) => setCycleForm({ ...cycleForm, minTenureMonths: Number(e.target.value) })}
                        className="w-24 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                      />
                      <span className="text-slate-500">Bulan Kerja Aktif (Eksklusi Probation)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Bell Curve Guidelines & Simulation (~35%)   */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* Card 1: Panduan Kurva Bell (Target) matching screenshot */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      Panduan Kurva Bell (Target)
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  Standar HR
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Proporsi kuota penilaian normal untuk menjaga akurasi distribusi merit-increase kompensasi.
              </p>

              {/* Tiers Distribution List matching screenshot */}
              <div className="space-y-3 text-xs">
                {/* Grade A */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">Grade A (4.50 - 5.00) — Outstanding</span>
                    <span className="text-blue-700">Target 10 - 15%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#1D4ED8] h-full rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>

                {/* Grade B+ */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">Grade B+ (4.00 - 4.49) — Exceeds</span>
                    <span className="text-blue-600">Target 30 - 35%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                {/* Grade B */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">Grade B (3.00 - 3.99) — Meets</span>
                    <span className="text-blue-500">Target 40 - 45%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                {/* Grade C */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-rose-600">Grade C (&lt; 3.00) — PIP Wajib</span>
                    <span className="text-rose-600">Target 5 - 10%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
              </div>

              {/* Bell Curve Visual Graphic matching screenshot */}
              <div className="pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 relative">
                  <svg viewBox="0 0 300 90" className="w-full h-20 overflow-visible">
                    <defs>
                      <linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path
                      d="M 10 80 C 70 80, 100 75, 130 35 C 145 15, 155 15, 170 35 C 200 75, 230 80, 290 80 Z"
                      fill="url(#bellGrad)"
                    />
                    {/* Curve */}
                    <path
                      d="M 10 80 C 70 80, 100 75, 130 35 C 145 15, 155 15, 170 35 C 200 75, 230 80, 290 80"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Median Pin */}
                    <circle cx="150" cy="22" r="4" fill="#1D4ED8" />
                    <line x1="150" y1="26" x2="150" y2="80" stroke="#1D4ED8" strokeDasharray="3,3" />
                  </svg>
                  <div className="text-center mt-1">
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full">
                      ● Median Skor 3.82
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: CONTINUATION: Simulasi Dampak Siklus (Cut off in screenshot) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Simulasi Dampak Siklus
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </div>

              {/* Grid Metrics Breakdown (Partisipan, Penilai, Formulir, Impak) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PARTISIPAN</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">1.248</span>
                  <span className="text-[10px] text-slate-500">Staf Aktif</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PENILAI</span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5 block">142</span>
                  <span className="text-[10px] text-slate-500">Manajer &amp; Lead</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">FORMULIR</span>
                  <span className="text-base font-extrabold text-blue-700 mt-0.5 block">2.496</span>
                  <span className="text-[10px] text-slate-500">Review 360°</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">IMPAK MERIT</span>
                  <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">+6.5%</span>
                  <span className="text-[10px] text-slate-500">Top Performer</span>
                </div>
              </div>

              {/* 9-Box Matrix Preview Box */}
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5 text-[11px] text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Integrasi Matriks 9-Box Talent Pool</span>
                </div>
                <p className="leading-relaxed">
                  Hasil skor siklus ini akan memetakan karyawan ke dalam 9-Box Grid untuk identifikasi
                  penerus kepemimpinan (Succession Planning) dan nominasi promosi tahun berjalan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: Konfirmasi Peluncuran Siklus Penilaian Kinerja      */}
      {/* ========================================================= */}
      {isLaunchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Konfirmasi Peluncuran Siklus Evaluasi</h3>
                  <p className="text-xs text-slate-500">Siarkan siklus penilaian ke seluruh staf organisasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLaunchModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {launchSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Siklus Berhasil Diluncurkan!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Formulir self-appraisal telah dibuka untuk 1.248 karyawan. Notifikasi email dan kalender
                    telah dikirimkan otomatis.
                  </p>
                </div>
                <Link
                  href="/admin/performance"
                  className="inline-block px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Kembali ke Dashboard Kinerja
                </Link>
              </div>
            ) : (
              <form onSubmit={handleLaunchCycle} className="p-6 space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Siklus:</span>
                    <span className="font-bold text-slate-900 text-right max-w-xs">{cycleForm.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jendela Pengisian:</span>
                    <span className="font-semibold text-blue-700">01 Jul 2025 - 20 Jul 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Partisipan:</span>
                    <span className="font-semibold text-slate-800">1.248 Karyawan Aktif</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Setelah diluncurkan, parameter bobot dan jendela evaluasi akan dikunci resmi untuk
                  menjaga integritas audit tata kelola penilaian SDM.
                </p>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsLaunchModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLaunching}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs flex items-center gap-2"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>{isLaunching ? 'Meluncurkan...' : 'Konfirmasi & Luncurkan'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
