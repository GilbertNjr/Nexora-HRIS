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
  KeyRound,
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();

  // Clean login input states (Clean, real enterprise authentication)
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

      const portalName =
        redirectUrl === '/admin' ? 'Konsol Utama HR Administrator' : 'Portal Mandiri Karyawan (ESS)';

      setSuccessInfo({
        name: user.fullName || user.firstName || 'Pengguna',
        email: user.email || identifier,
        role: user.primaryRole || user.roles?.[0] || 'EMPLOYEE',
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
          {/* Unified Login Card */}
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

            {/* Header Title */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold mb-3.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal Masuk Tunggal (Unified SSO)</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                Masuk ke Nexora HRIS
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Akses terintegrasi untuk seluruh karyawan dan tim HRD. Sistem otomatis mengidentifikasi peran Anda.
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
                  ID Karyawan (NIK) atau Email Kantor
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: nama@nexora.co.id atau NX-2025089"
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
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70 mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Otorisasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem HRIS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Help & Support Note */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Karyawan baru? Pastikan akun telah diaktivasi oleh HR Operations.</span>
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
