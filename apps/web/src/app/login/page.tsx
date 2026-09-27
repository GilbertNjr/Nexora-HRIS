'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export default function LoginPage() {
  const [portalMode, setPortalMode] = useState<'admin' | 'ess'>('admin');
  const [email, setEmail] = useState('admin@nexora.local');
  const [password, setPassword] = useState('Admin@Nexora2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const handleQuickFill = (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      setPortalMode('admin');
      setEmail('admin@nexora.local');
      setPassword('Admin@Nexora2026!');
    } else {
      setPortalMode('ess');
      setEmail('employee@nexora.local');
      setPassword('Employee@Nexora2026!');
    }
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(
          resData?.error?.message ||
            'Kredensial login tidak valid. Pastikan server backend & database aktif.',
        );
      }

      setSuccessData(resData.data);
      // Store token in localStorage
      if (typeof window !== 'undefined' && resData.data?.tokens?.accessToken) {
        localStorage.setItem('nexora_token', resData.data.tokens.accessToken);
        localStorage.setItem('nexora_user', JSON.stringify(resData.data.user));
      }
    } catch (err: any) {
      // Fallback demo simulation if backend is not yet started locally
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setErrorMsg(
          'Tidak dapat terhubung ke Backend (Port 4000). Pastikan backend aktif dengan perintah: npm run dev:api',
        );
      } else {
        setErrorMsg(err.message || 'Terjadi kesalahan saat masuk');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/">
          <NexoraLogo variant="dark" />
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
        >
          ← Kembali ke Beranda
        </Link>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600" />

            {/* Portal Switcher Tabs */}
            <div className="bg-slate-950/80 p-1.5 rounded-2xl flex gap-1 mb-8 border border-slate-800/80 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setPortalMode('admin');
                  handleQuickFill('admin');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  portalMode === 'admin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>HR Admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalMode('ess');
                  handleQuickFill('employee');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  portalMode === 'ess'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Karyawan (ESS)</span>
              </button>
            </div>

            {/* Title & Description */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>
                  {portalMode === 'admin' ? 'Portal Administrator' : 'Portal Mandiri Karyawan'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {portalMode === 'admin'
                  ? 'Masuk ke konsol eksekutif HRIS untuk mengelola SDM dan penggajian.'
                  : 'Akses presensi selfie, pengajuan cuti instan, dan slip gaji terenkripsi.'}
              </p>
            </div>

            {/* Success State Alert */}
            {successData && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Login Berhasil!</span>
                </div>
                <p className="text-xs mt-1 text-emerald-300">
                  Selamat datang, <strong>{successData.user.email}</strong>.
                </p>
                <p className="text-[11px] mt-0.5 text-emerald-400 font-mono">
                  Peran: {successData.user.roles.join(', ')}
                </p>
                <div className="mt-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <span>Lanjutkan ke Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-950/70 border border-rose-600/40 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            {!successData && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Alamat Email Perusahaan
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="nama@perusahaan.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Kata Sandi
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Silakan hubungi HR Administrator untuk me-reset kata sandi Anda.');
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Lupa sandi?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Single Active Session Warning for ESS */}
                {portalMode === 'ess' && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span>
                      Sesuai kebijakan <strong>[REQ-DEC-01]</strong>, login ESS menerapkan <em>Single Active Session</em> untuk mencegah titip absen.
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all group ${
                    portalMode === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/30'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-900/30'
                  } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke {portalMode === 'admin' ? 'HR Admin' : 'ESS Portal'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Fill Credentials Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-3">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Akun Uji Coba Cepat (Demo Presensi / Ujian):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left transition-colors"
                >
                  <p className="text-[10px] font-bold text-blue-400 uppercase">HR Admin</p>
                  <p className="text-[10px] text-slate-400 truncate">admin@nexora.local</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('employee')}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-left transition-colors"
                >
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Karyawan ESS</p>
                  <p className="text-[10px] text-slate-400 truncate">employee@nexora.local</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>© {new Date().getFullYear()} NEXORA — Human Resource Solutions. Enterprise Security & PII Protection.</p>
      </footer>
    </div>
  );
}
