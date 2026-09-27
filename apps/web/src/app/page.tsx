'use client';

import React, { useState, useEffect } from 'react';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import {
  Users,
  ShieldCheck,
  Clock,
  CreditCard,
  Calendar,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  Smartphone,
  Server,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const [activePortal, setActivePortal] = useState<'admin' | 'ess'>('admin');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      const startTime = performance.now();
      try {
        const res = await fetch('http://localhost:4000/api/v1/health/liveness', {
          cache: 'no-store',
        });
        const latency = Math.round(performance.now() - startTime);
        if (res.ok) {
          setApiStatus('online');
          setApiLatency(latency);
        } else {
          setApiStatus('offline');
        }
      } catch (err) {
        setApiStatus('offline');
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <NexoraLogo />

          <div className="flex items-center gap-4">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700">
              <span className="flex h-2 w-2 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    apiStatus === 'online'
                      ? 'bg-emerald-400'
                      : apiStatus === 'offline'
                      ? 'bg-amber-400'
                      : 'bg-blue-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    apiStatus === 'online'
                      ? 'bg-emerald-500'
                      : apiStatus === 'offline'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
              </span>
              <span>
                Backend API:{' '}
                <strong className="font-semibold uppercase">
                  {apiStatus === 'online'
                    ? `Online (${apiLatency}ms)`
                    : apiStatus === 'offline'
                    ? 'Standby (Port 4000)'
                    : 'Checking...'}
                </strong>
              </span>
            </div>

            <a
              href="http://localhost:4000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Swagger API Docs</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero & Dual-Panel Switcher */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex-1">
        {/* Banner Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 text-blue-800 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Phase 0: Foundation Setup & Infrastructure Active</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Human Resource Solutions{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Connect • Innovate • Grow
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Platform HRIS Enterprise Modular Monolith dengan End-to-End Type Safety, presensi geofencing anti-fraud, kalkulasi PPh 21 TER otomatis, dan arsitektur ganda terintegrasi.
          </p>
        </div>

        {/* Portal Selector Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex gap-1.5 shadow-inner">
            <button
              onClick={() => setActivePortal('admin')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activePortal === 'admin'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>HR Admin Portal</span>
            </button>
            <button
              onClick={() => setActivePortal('ess')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activePortal === 'ess'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Employee Self-Service (ESS)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Portal Showcase */}
        {activePortal === 'admin' ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-elevated p-8 sm:p-12 transition-all">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between border-b border-slate-100 pb-8">
              <div>
                <span className="inline-block text-xs font-bold tracking-wider uppercase text-blue-600 mb-1">
                  Management Console
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Admin & HR Executive Portal
                </h2>
                <p className="mt-1 text-slate-600 text-sm sm:text-base">
                  Pusat kendali operasional HR: Kelola data seluruh karyawan, pantau presensi real-time, eksekusi payroll massal, dan audit pergerakan data.
                </p>
              </div>

              <button
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all group"
                onClick={() => alert('Pondasi modul Auth & Dashboard Admin sedang aktif disiapkan.')}
              >
                <span>Buka HR Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Admin Feature Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Master Karyawan</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Struktur hierarki departemen, enkripsi data identitas KTP/Bank AES-256, dan riwayat mutasi jabatan.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Monitoring Presensi</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Deteksi keterlambatan otomatis, verifikasi koordinat GPS Geofencing, dan rekonsiliasi shift multi-jadwal.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Kalkulator Payroll TER</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Kalkulasi otomatis PPh 21 tarif efektif rata-rata (TER), BPJS Ketenagakerjaan/Kesehatan, dan ekspor transfer bank CSV.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Audit Trail Append-Only</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Pencatatan mutasi data sensitif yang tidak dapat diubah (immutable), melacak IP address, waktu, dan riwayat data lama vs baru.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-elevated p-8 sm:p-12 transition-all">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between border-b border-slate-100 pb-8">
              <div>
                <span className="inline-block text-xs font-bold tracking-wider uppercase text-indigo-600 mb-1">
                  Employee Self-Service
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Employee Self-Service (ESS) Portal
                </h2>
                <p className="mt-1 text-slate-600 text-sm sm:text-base">
                  Antarmuka mobile-first khusus karyawan: Presensi mandiri dengan kamera selfie & GPS geofence, ajukan cuti, dan unduh slip gaji instan.
                </p>
              </div>

              <button
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all group"
                onClick={() => alert('Pondasi modul ESS Karyawan sedang aktif disiapkan.')}
              >
                <span>Masuk Portal Karyawan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* ESS Feature Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">One-Touch Clock In</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Presensi masuk dan keluar praktis dari smartphone dengan validasi radius lokasi kantor dan bukti foto selfie.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Pengajuan Cuti Online</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Cek sisa kuota cuti tahunan secara langsung, unggah surat dokter (drag & drop), dan lacak status persetujuan atasan.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Slip Gaji Terproteksi</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Akses rincian penghasilan take-home pay bulanan dengan proteksi sandi/PIN dan download berkas PDF resmi.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Notifikasi Instan</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Pemberitahuan persetujuan cuti, pengumuman perusahaan, dan pengingat jadwal kerja langsung ke portal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Architecture Badges Footer Section */}
        <div className="mt-12 bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg">Modular Monolith Architecture</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                NestJS Backend • Next.js Frontend • PostgreSQL (Supabase) • Prisma ORM • Strict Type Safety
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Type Mismatch</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-blue-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Clean Architecture</span>
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NEXORA — Human Resource Solutions. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/GilbertNjr/Nexora-HRIS" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
              GitHub Repository
            </a>
            <a href="http://localhost:4000/api/docs" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
              API Docs
            </a>
            <span>v0.1.0 (Phase 0)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
