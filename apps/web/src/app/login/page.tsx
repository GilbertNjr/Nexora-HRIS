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
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Loader2,
  Fingerprint,
  UserCheck,
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();

  // Unified login input states (No tab switcher)
  const [identifier, setIdentifier] = useState('admin@nexora.local');
  const [password, setPassword] = useState('Admin@Nexora2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    role: string;
    redirectUrl: string;
    portalName: string;
  } | null>(null);

  // Quick-fill helper for QA / Testing (Does not alter the unified architecture)
  const handleFillDemo = (type: 'admin' | 'employee') => {
    if (type === 'admin') {
      setIdentifier('admin@nexora.local');
      setPassword('Admin@Nexora2026!');
    } else {
      setIdentifier('NX-2021008');
      setPassword('Karyawan@Nexora2026!');
    }
    setErrorMsg(null);
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
        body: JSON.stringify({ identifier, password }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || 'Kredensial tidak valid. Silakan periksa kembali.');
      }

      const { user, tokens, redirectUrl } = resData.data;

      // 2. Save Session Data
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexora_token', tokens?.accessToken || 'token-unified-active');
        localStorage.setItem('nexora_user', JSON.stringify(user));
        if (user.roles?.includes('EMPLOYEE')) {
          localStorage.setItem('nexora_active_portal', 'karyawan');
        } else {
          localStorage.setItem('nexora_active_portal', 'admin');
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

      const portalName = redirectUrl === '/admin' ? 'Konsol Utama HR Administrator' : 'Portal Mandiri Karyawan';

      setSuccessInfo({
        email: user.email || identifier,
        role: user.primaryRole || user.roles?.[0] || 'USER',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Top Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <NexoraLogo variant="dark" />
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-sm backdrop-blur-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Sertifikasi ISO/IEC 27001 & UU PDP 2024</span>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Unified Login Card */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500" />

            {/* Header Title */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pintu Masuk Tunggal (Unified Enterprise Portal)</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Masuk ke Nexora HRIS
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Sistem akan secara otomatis mengenali hak akses Anda dan mengarahkan ke dashboard yang sesuai (Konsol Admin atau Portal Karyawan).
              </p>
            </div>

            {/* SSO Enterprise Options */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  handleFillDemo('admin');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  handleFillDemo('employee');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>Microsoft Entra</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-slate-900 px-3 text-slate-500 font-semibold">
                  Atau Verifikasi Akun Korporat
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Feedback Alert */}
            {successInfo && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Autentikasi Berhasil!</span>
                </div>
                <p className="text-xs mt-1 text-emerald-300">
                  Peran terverifikasi: <strong className="font-mono text-white">{successInfo.role}</strong>
                </p>
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  Mengarahkan ke: <strong>{successInfo.portalName}</strong> ({successInfo.redirectUrl})...
                </p>
              </div>
            )}

            {/* Unified Form */}
            <form onSubmit={handleUnifiedLogin} className="space-y-4">
              {/* Identifier Input (Email or NIP) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ID Karyawan (NIP) atau Email Perusahaan
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: NX-2021008 atau nama@perusahaan.co.id"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Kata Sandi
                  </label>
                  <Link
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Silakan hubungi HR Administrator atau IT Helpdesk (helpdesk@nexora.co.id) untuk reset password.');
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer">
                  Ingat sesi saya di workstation ini
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Otorisasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Nexora HRIS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* QA Testing Helper Pill */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                ⚡ Mode Pengujian Cepat (QA Helper)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-blue-300 border border-slate-700 transition-colors font-medium flex items-center gap-1.5"
                >
                  <Building2 className="w-3 h-3 text-blue-400" />
                  <span>Isi Akun Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('employee')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-emerald-300 border border-slate-700 transition-colors font-medium flex items-center gap-1.5"
                >
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>Isi Akun Karyawan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>© 2026 PT Nexora Teknologi Nusantara. Enterprise Human Resource System.</p>
        <div className="flex items-center gap-4">
          <Link href="#privacy" className="hover:text-slate-400">Kebijakan Privasi</Link>
          <Link href="#security" className="hover:text-slate-400">Standar Kepatuhan</Link>
          <Link href="#status" className="hover:text-slate-400">Status Sistem: Normal (99.98%)</Link>
        </div>
      </footer>
    </div>
  );
}
