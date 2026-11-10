'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NexoraLogo } from '@/components/common/NexoraLogo';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Shield,
  HelpCircle,
  X,
  KeyRound,
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();

  // Role toggle: 'karyawan' (ESS) vs 'admin' (HR & Management)
  const [activeRole, setActiveRole] = useState<'karyawan' | 'admin'>('karyawan');

  // Input states
  const [identifier, setIdentifier] = useState('NX-2021008');
  const [password, setPassword] = useState('Karyawan@Nexora2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    email: string;
    role: string;
    redirectUrl: string;
    portalName: string;
  } | null>(null);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Quick switch role preset
  const handleRoleSwitch = (role: 'karyawan' | 'admin') => {
    setActiveRole(role);
    setErrorMsg(null);
    if (role === 'karyawan') {
      setIdentifier('NX-2021008');
      setPassword('Karyawan@Nexora2026!');
    } else {
      setIdentifier('admin@nexora.co.id');
      setPassword('Admin@Nexora2026!');
    }
  };

  const handleUnifiedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      // 1. Call Unified Auth API Endpoint
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(
          resData?.error?.message ||
            'Kredensial tidak valid. Pastikan Email Kantor atau ID Karyawan Anda telah terdaftar.'
        );
      }

      const { user, tokens, redirectUrl } = resData.data;

      // 2. Save Session Data Safely (Guarded against QuotaExceededError)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nexora_token', tokens?.accessToken || 'token-unified-active');

          // Defensive copy to prevent huge base64 strings from exhausting 5MB localStorage limit
          const safeUser = { ...user };
          if (
            safeUser.avatarUrl &&
            (safeUser.avatarUrl.startsWith('data:') || safeUser.avatarUrl.length > 25000)
          ) {
            safeUser.avatarUrl =
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
          }

          localStorage.setItem('nexora_user', JSON.stringify(safeUser));
          localStorage.setItem('nexora_employee_profile', JSON.stringify(safeUser));

          const incomingSessionId = resData.data.sessionId || resData.data.tokens?.sessionId;
          if (incomingSessionId) {
            localStorage.setItem('nexora_session_id', incomingSessionId);
          }

          try {
            localStorage.removeItem('nexora_latest_selfie_attendance');
          } catch {}

          if (user.roles?.includes('EMPLOYEE')) {
            localStorage.setItem('nexora_active_portal', 'karyawan');
          } else {
            localStorage.setItem('nexora_active_portal', 'admin');
          }
        } catch (storageErr) {
          console.warn('[Session] LocalStorage quota fallback activated:', storageErr);
          try {
            const minUser = {
              id: user.id,
              email: user.email,
              fullName: user.fullName || user.firstName,
              employeeNumber: user.employeeNumber,
              department: user.department,
              designation: user.designation,
              roles: user.roles,
              primaryRole: user.primaryRole,
            };
            localStorage.setItem('nexora_user', JSON.stringify(minUser));
          } catch {}
        }

        // Broadcast to intra-browser channels
        try {
          const channel = new BroadcastChannel('nexora_live_sync');
          channel.postMessage({
            type: 'USER_LOGGED_IN',
            user,
            redirectUrl,
            time: Date.now(),
          });
          channel.close();
        } catch {}
      }

      const portalName =
        redirectUrl === '/admin' ? 'Konsol Utama HR Administrator' : 'Portal Mandiri Karyawan (ESS)';

      setSuccessInfo({
        name: user.fullName || user.firstName || 'Pengguna',
        email: user.email || identifier,
        role: user.primaryRole || user.roles?.[0] || (activeRole === 'admin' ? 'HR_ADMIN' : 'EMPLOYEE'),
        redirectUrl,
        portalName,
      });

      // 3. Smooth Redirect after short feedback
      setTimeout(() => {
        router.push(redirectUrl);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kendala saat melakukan autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Main Centered White Card Container matching Mockup */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl sm:shadow-2xl shadow-slate-200/80 border border-slate-100 p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-all">
        {/* Top Header Row */}
        <header className="flex items-center justify-between pb-6 sm:pb-8 border-b border-slate-100">
          <NexoraLogo variant="light" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-4 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sertifikasi ISO/IEC 27001 &amp; UU PDP Terenkripsi</span>
          </div>
        </header>

        {/* 2-Column Grid Body */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-6 sm:py-8">
          {/* Left Column: Visual Banner */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/4.3] shadow-md border border-slate-100 group">
            <img
              src="/login-banner.jpg"
              alt="Ilustrasi Karyawan Nexora"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Dark gradient overlay on bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                Mulai Hari Kerja Anda bersama NEXORA
              </h2>
              <p className="text-xs sm:text-sm text-slate-200/90 mt-2 leading-relaxed">
                Akses presensi digital, dokumentasi otomatis, cek slip gaji, rekap cuti, dan profil kepegawaian Anda.
              </p>
            </div>
          </div>

          {/* Right Column: Clean Interactive Login Form */}
          <div className="flex flex-col justify-center">
            {/* Role Switcher Tabs (Portal Karyawan vs Admin HR & Direksi) */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 mb-5 w-fit">
              <button
                type="button"
                onClick={() => handleRoleSwitch('karyawan')}
                className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeRole === 'karyawan'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Portal Karyawan</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin HR &amp; Direksi</span>
              </button>
            </div>

            {/* Header Titles */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeRole === 'karyawan' ? 'Masuk ke Portal Karyawan' : 'Masuk ke Konsol Admin'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                {activeRole === 'karyawan'
                  ? 'Akses presensi digital, cek slip gaji, riwayat cuti, dan profil kepegawaian Anda.'
                  : 'Kelola data seluruh karyawan, approval cuti, kalkulasi payroll gaji, dan audit sistem.'}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Success Feedback Alert */}
            {successInfo && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Autentikasi Berhasil!</span>
                </div>
                <p className="text-xs mt-1 text-emerald-900 font-semibold">
                  Selamat datang kembali, {successInfo.name}
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Mengarahkan ke: <strong>{successInfo.portalName}</strong>...
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleUnifiedLogin} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {activeRole === 'admin'
                    ? 'Email Administrator atau ID Admin'
                    : 'ID Karyawan (NIK) atau Email Kantor'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      activeRole === 'admin'
                        ? 'admin@nexora.co.id'
                        : 'NX-2021008 atau nama.karyawan@nexora.co.id'
                    }
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
                  Ingat sesi login saya di perangkat ini
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Otorisasi...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeRole === 'admin' ? 'Masuk ke Konsol Admin' : 'Masuk ke Portal Karyawan'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper Pills */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Demo 1-Klik:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('karyawan')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-mono text-[11px] transition-colors cursor-pointer"
                >
                  Karyawan (NX-2021008)
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('admin')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-mono text-[11px] transition-colors cursor-pointer"
                >
                  Admin (admin@nexora.co.id)
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Card Bottom Footer */}
        <footer className="pt-6 sm:pt-8 mt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 PT Nexora Teknologi Nusantara. Enterprise Human Resource Information System.</p>
          <div className="flex items-center gap-3 text-xs">
            <span>Enkripsi TLS 1.3 / SSL 256-Bit</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Server Status: Normal
            </span>
          </div>
        </footer>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <span>Bantuan Pemulihan Sandi</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Sesuai kebijakan keamanan data <strong className="text-slate-900">ISO/IEC 27001</strong> Nexora, pemulihan kata sandi dilakukan melalui verifikasi resmi tim HR Operations.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-800">Sandi Standar Akun Karyawan Baru:</p>
                <p className="font-mono text-blue-600 font-bold text-sm">Karyawan@Nexora2026!</p>
              </div>
              <p>
                Jika Anda telah mengubah sandi dan lupa, silakan hubungi tim Helpdesk IT / HRD di{' '}
                <a
                  href="mailto:helpdesk@nexora.co.id"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  helpdesk@nexora.co.id
                </a>{' '}
                dengan melampirkan NIK dan kartu tanda pengenal karyawan Anda.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Mengerti &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
