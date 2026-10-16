'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  RotateCcw,
  Smartphone,
  Eye,
  EyeOff,
  Clock,
  Globe,
  Download,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Bell,
  History,
  UserCheck,
  Key,
  Copy,
  Check,
  FileText,
  Shield,
  Laptop,
} from 'lucide-react';

export default function SecurityAndPasswordsPage() {
  const router = useRouter();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('•••••••••••••');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal & notification states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const [isSaving, setIsSaving] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Backup codes mock
  const [backupCodes] = useState([
    'A9F2-48K1-99LX',
    'B8D3-77P0-12QM',
    'C4E8-21R9-54VX',
    'K1L9-60S3-88ZP',
    'M7X4-33T5-09WQ',
    'N5Y2-19U8-76LK',
    'P3Q8-84W1-42MN',
    'R6Z1-52Y7-31OP',
  ]);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Perubahan kredensial dan preferensi keamanan berhasil disimpan!');
    }, 700);
  };

  const handleDownloadSecurityReport = () => {
    showToast('Mengunduh Laporan Riwayat Audit Keamanan (.pdf)...', 'info');
  };

  const handleTerminateAllOtherSessions = () => {
    showToast('Berhasil keluar dari semua perangkat lain (iPhone 15 Pro & Tablet).');
  };

  const handleCopyCode = (code: string, index: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    }
  };

  // Password requirement validators
  const hasMinLength = newPassword.length >= 12;
  const hasUpperLower = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const validScore = [hasMinLength, hasUpperLower, hasNumber, hasSpecial].filter(Boolean).length;

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kunci Cadangan Pemulihan (2FA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    8 dari 10 kode cadangan masih tersedia dan aktif
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBackupCodesModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                Simpan kode cadangan di tempat yang aman. Setiap kode hanya dapat digunakan satu kali apabila Anda kehilangan akses ke aplikasi Google Authenticator.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {backupCodes.map((code, idx) => (
                <div
                  key={code}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between font-mono text-xs text-slate-800"
                >
                  <span>{code}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(code, idx)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                    title="Salin Kode"
                  >
                    {copiedCodeIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => showToast('Kode cadangan berhasil diunduh (.txt)')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File (.txt)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBackupCodesModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb Navigation - matches user mockup exactly */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin/profile" className="hover:text-blue-600 transition-colors">
            Pengaturan Akun
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">
            Keamanan &amp; Kata Sandi
          </span>
        </nav>

        {/* Page Header: Title + ISO Badge + Action Buttons */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Keamanan Akun &amp; Manajemen Kata Sandi
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>ISO/IEC 27001</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Kelola perlindungan login, autentikasi multi-faktor (2FA/MFA), riwayat pergantian kredensial, verifikasi perangkat terpercaya, dan protokol sesi keamanan sesuai standar ISO/IEC 27001.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Button 1: Unduh Riwayat Keamanan (.pdf) */}
            <button
              type="button"
              onClick={handleDownloadSecurityReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Riwayat Keamanan (.pdf)</span>
            </button>

            {/* Button 2: Keluar dari Semua Perangkat Lain */}
            <button
              type="button"
              onClick={handleTerminateAllOtherSessions}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs shadow-2xs transition-all active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Keluar dari Semua Perangkat Lain</span>
            </button>

            {/* Button 3: Simpan Perubahan Kredensial */}
            <button
              type="button"
              onClick={() => handleSaveCredentials()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003B99] hover:bg-[#002b70] text-white font-bold text-xs shadow-md transition-all active:scale-98 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Kredensial'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation - Fully Responsive, unclipped across screen widths */}
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* Tab 1: Profil Personal & Kontak */}
          <Link
            href="/admin/profile"
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>Profil Personal &amp; Kontak</span>
          </Link>

          {/* Tab 2: Keamanan & Kata Sandi (ACTIVE) */}
          <div className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-white text-blue-700 shadow-xs border border-slate-200/60 whitespace-nowrap">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Keamanan &amp; Kata Sandi</span>
          </div>

          {/* Tab 3: Preferensi & Notifikasi */}
          <Link
            href="/admin/profile?tab=preferences"
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <Bell className="w-4 h-4 text-slate-500" />
            <span>Preferensi &amp; Notifikasi</span>
          </Link>

          {/* Tab 4: Log Sesi & Aktivitas */}
          <Link
            href="/admin/profile?tab=activity"
            className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Log Sesi &amp; Aktivitas</span>
          </Link>

          {/* Tab 5: Pendelegasian Wewenang (Guaranteed non-clipped) */}
          <Link
            href="/admin/profile?tab=delegation"
            className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>Pendelegasian Wewenang</span>
          </Link>
        </div>

        {/* Main Content Layout: Two Columns (Left: 8 cols, Right: 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN (8 COLS) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Skor Keamanan Kredensial */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
              {/* Top Row: Gauge + Title + ISO Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  {/* Circular Score Badge 98% */}
                  <div className="relative w-16 h-16 rounded-full border-4 border-blue-600 flex items-center justify-center text-blue-900 font-extrabold text-xl bg-blue-50/70 shadow-xs flex-shrink-0">
                    <span>98%</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Skor Keamanan Kredensial
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        Sangat Baik
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Akun memenuhi seluruh tolok ukur perlindungan perimeter digital Nexora Enterprise.
                    </p>
                  </div>
                </div>

                {/* ISO Standard Pill */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 self-start sm:self-center">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <p className="text-slate-500 font-medium">Terverifikasi Standar</p>
                    <p className="font-bold text-slate-800">ISO 27001:2022</p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Metric 1: Sandi Diperbarui */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      SANDI DIPERBARUI
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      14 hari lalu
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Kedaluwarsa: tiap 90 hari
                    </p>
                  </div>
                </div>

                {/* Metric 2: Autentikasi 2FA */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      AUTENTIKASI 2FA
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      Aktif (Google TOTP)
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      Proteksi 2 lapis aktif
                    </p>
                  </div>
                </div>

                {/* Metric 3: Kunci Cadangan */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      KUNCI CADANGAN
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      8 dari 10 Tersisa
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      2 kode telah digunakan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Pembaruan Kata Sandi */}
            <form
              onSubmit={handleSaveCredentials}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Pembaruan Kata Sandi
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pastikan kata sandi baru memenuhi standar kerumitan perusahaan
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-center">
                  ID Kredensial: NX-88421
                </span>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Kata Sandi Saat Ini */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Kata Sandi Saat Ini
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('Tautan reset kata sandi telah dikirim ke dewi.lestari@nexora.co.id', 'info')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi saat ini"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs text-slate-900 pr-11 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub-grid: Kata Sandi Baru & Konfirmasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kata Sandi Baru */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 12 karakter aman..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs text-slate-900 pr-11 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi Baru */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru..."
                        className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-xs text-slate-900 pr-11 font-mono transition-all ${
                          confirmPassword && !passwordsMatch
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                            : confirmPassword && passwordsMatch
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-time Checklist Criteria */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Kekuatan Sandi:</span>
                    <span
                      className={`font-bold ${
                        validScore >= 4
                          ? 'text-emerald-600'
                          : validScore >= 3
                          ? 'text-blue-600'
                          : validScore >= 2
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {validScore >= 4
                        ? 'Sangat Kuat (Memenuhi Standar)'
                        : validScore >= 3
                        ? 'Kuat'
                        : validScore >= 2
                        ? 'Sedang'
                        : 'Belum Memenuhi Syarat'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        validScore >= 1 ? 'bg-amber-500' : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        validScore >= 2 ? 'bg-amber-500' : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        validScore >= 3 ? 'bg-blue-500' : 'bg-transparent'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-colors ${
                        validScore >= 4 ? 'bg-emerald-500' : 'bg-transparent'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          hasMinLength ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <span className={hasMinLength ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                        Minimal 12 karakter
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          hasUpperLower ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <span className={hasUpperLower ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                        Huruf besar (A-Z) &amp; kecil (a-z)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          hasNumber ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <span className={hasNumber ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                        Mengandung angka (0-9)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          hasSpecial ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <span className={hasSpecial ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                        Simbol khusus (!@#$%^&amp;*)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons inside form */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Terakhir diganti: 14 hari yang lalu oleh Pengguna
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all active:scale-98 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>

            {/* Card 3: Manajemen 2FA & Kunci Cadangan */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Autentikasi Dua Faktor (2FA / MFA)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Menggunakan aplikasi TOTP standar (Google Authenticator, Microsoft Authenticator)
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Aktif</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">
                    Aplikasi Terhubung: Google Authenticator (iPhone 15 Pro)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sinkronisasi waktu OTP otomatis dengan server HRIS (RFC 6238 TOTP)
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowBackupCodesModal(true)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                  >
                    Lihat Kunci Cadangan
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Membuka konfigurasi QR Code 2FA...', 'info')}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Konfigurasi Ulang
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (4 COLS) ================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Kebijakan Keamanan TI (Matches user screenshot) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
              {/* Header */}
              <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Kebijakan Keamanan TI
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Nexora Group Governance v4.2
                  </p>
                </div>
              </div>

              {/* Intro text */}
              <p className="text-xs text-slate-600 leading-relaxed">
                Kepatuhan kredensial akun karyawan dikontrol secara terpusat melalui Active Directory &amp; Okta Identity Cloud sesuai regulasi OJK &amp; ISO/IEC 27001.
              </p>

              {/* 4 Bullet Points */}
              <div className="space-y-4 pt-1">
                {/* 1. Rotasi Wajib 90 Hari */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Rotasi Wajib 90 Hari
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Notifikasi pengingat dikirim pada H-14 dan H-3 sebelum masa berlaku berakhir.
                    </p>
                  </div>
                </div>

                {/* 2. Penguncian Otomatis (Lockout) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Penguncian Otomatis (Lockout)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Akun dibekukan selama 30 menit setelah 5 kali gagal memasukkan sandi/OTP berturut-turut.
                    </p>
                  </div>
                </div>

                {/* 3. Batas Sesi Tidak Aktif (30 Menit) */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Batas Sesi Tidak Aktif (30 Menit)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Portal HRIS akan logout otomatis jika tidak ada pergerakan kursor atau input data.
                    </p>
                  </div>
                </div>

                {/* 4. Zero Trust Network Access */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Zero Trust Network Access
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Akses payroll di luar jaringan kantor mewajibkan koneksi Cisco AnyConnect VPN.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Kepatuhan & Status Perlindungan Karyawan */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Status Enkripsi &amp; EDR</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Compliant
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-600">Enkripsi Penyimpanan</span>
                  <span className="font-bold text-slate-900">AES-256 BitLocker</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-600">EDR Protection</span>
                  <span className="font-bold text-slate-900">CrowdStrike Falcon</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-600">Audit Terakhir</span>
                  <span className="font-bold text-emerald-600">Kemarin, 23:45 WIB (Pass)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutSkeleton>
  );
}
