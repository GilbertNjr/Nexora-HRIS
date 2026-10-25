'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Sparkles,
  Loader2,
  HelpCircle,
  User,
  Shield,
  Zap,
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();

  // Role toggle: 'karyawan' (ESS) vs 'admin' (HR & Management)
  const [activeRole, setActiveRole] = useState<'karyawan' | 'admin'>('karyawan');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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

  // Quick fill demo helpers
  const handleQuickFill = (role: 'fatih' | 'rian' | 'admin') => {
    setErrorMsg(null);
    if (role === 'fatih') {
      setActiveRole('karyawan');
      setIdentifier('fatih@nexora.co.id');
      setPassword('Karyawan@Nexora2026!');
    } else if (role === 'rian') {
      setActiveRole('karyawan');
      setIdentifier('rian.pratama@nexora.co.id');
      setPassword('Karyawan@Nexora2026!');
    } else if (role === 'admin') {
      setActiveRole('admin');
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
            // Minimalist session object guaranteed to be < 1 KB
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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans antialiased relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-blue-900/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <NexoraLogo variant="dark" />
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 shadow-sm backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sertifikasi ISO/IEC 27001 &amp; UU PDP Terenkripsi</span>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Role Navigation Switcher Tabs */}
          <div className="p-1 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl mb-4 grid grid-cols-2 gap-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setActiveRole('karyawan');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRole === 'karyawan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Portal Karyawan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin HR &amp; Direksi</span>
            </button>
          </div>

          {/* Unified Login Card */}
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400'
              }`}
            />

            {/* Header Title */}
            <div className="mb-6">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-3.5 border ${
                  activeRole === 'admin'
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}
              >
                {activeRole === 'admin' ? (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>Konsol HR Administrator</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Employee Self-Service (ESS)</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                {activeRole === 'admin' ? 'Masuk sebagai Admin HR' : 'Masuk Portal Karyawan'}
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {activeRole === 'admin'
                  ? 'Akses manajemen data karyawan, payroll gaji, persetujuan cuti & audit log terintegrasi.'
                  : 'Akses presensi digital, cek slip gaji, riwayat cuti, dan profil kepegawaian Anda.'}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Success Feedback Alert */}
            {successInfo && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Autentikasi Berhasil!</span>
                </div>
                <p className="text-xs mt-1 text-emerald-200 font-semibold">
                  Selamat datang, {successInfo.name}
                </p>
                <p className="text-[11px] text-emerald-400/90 mt-0.5">
                  Mengarahkan ke: <strong>{successInfo.portalName}</strong>...
                </p>
              </div>
            )}

            {/* Unified Login Form */}
            <form onSubmit={handleUnifiedLogin} className="space-y-4">
              {/* Identifier Input (Email or NIK) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {activeRole === 'admin'
                    ? 'Email Administrator atau ID Admin'
                    : 'ID Karyawan (NIK) atau Email Kantor'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      activeRole === 'admin'
                        ? 'Contoh: admin@nexora.co.id atau dewi.lestari@nexora.co.id'
                        : 'Contoh: fatih@nexora.co.id atau NX-2025089'
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Kata Sandi</label>
                  <button
                    type="button"
                    onClick={() => {
                      alert(
                        'Untuk reset kata sandi, silakan hubungi tim HR Operations SCBD atau kirim permohonan ke helpdesk@nexora.co.id.'
                      );
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Login Shortcut Pills */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-semibold text-slate-400">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Pintasan Akun Terverifikasi:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeRole === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => handleQuickFill('admin')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-700/60 hover:bg-indigo-900 text-indigo-300 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🛡️ Admin HR (admin@nexora.co.id)</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('fatih')}
                        className="px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-700/60 hover:bg-blue-900 text-blue-300 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>👤 Fatih (fatih@nexora.co.id)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('rian')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>👤 Rian (rian.pratama@nexora.co.id)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer select-none">
                  Ingat sesi login saya di perangkat ini
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70 mt-3 cursor-pointer ${
                  activeRole === 'admin'
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Otorisasi...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeRole === 'admin' ? 'Masuk ke Konsol Admin HR' : 'Masuk ke Portal Karyawan'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Help & Support Note */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Kata sandi default awal karyawan:{' '}
                  <strong className="text-white font-mono">Karyawan@Nexora2026!</strong>
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 relative z-10">
        <p>© 2026 PT Nexora Teknologi Nusantara. Enterprise Human Resource Information System.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">Enkripsi TLS 1.3 / SSL 256-Bit</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Server Status: Normal
          </span>
        </div>
      </footer>
    </div>
  );
}
