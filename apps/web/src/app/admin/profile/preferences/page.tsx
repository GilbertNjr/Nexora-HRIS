'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  Palette,
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  RotateCcw,
  Save,
  CheckCircle2,
  ChevronRight,
  User,
  Lock,
  History,
  UserCheck,
  Check,
  Moon,
  Sun,
  Laptop,
  Volume2,
  Eye,
  Sliders,
  Globe,
  Calendar,
  Clock,
  Sparkles,
  Shield,
  ShieldAlert,
} from 'lucide-react';

interface NotificationRow {
  id: string;
  category: string;
  description: string;
  badge?: { text: string; color: 'red' | 'amber' | 'blue' };
  email: boolean;
  whatsapp: boolean;
  push: boolean;
}

export default function PreferencesAndNotificationsPage() {
  // Theme & Appearance State
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [fontSize, setFontSize] = useState<'standard' | 'large'>('standard');
  const [microAnimations, setMicroAnimations] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderSupport, setScreenReaderSupport] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(true);

  // Localization State
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timezone, setTimezone] = useState('Asia/Jakarta');

  // Notification Matrix State
  const [notifications, setNotifications] = useState<NotificationRow[]>([
    {
      id: 'leave',
      category: 'Permohonan Cuti & Izin Staf',
      description: 'Pengajuan cuti tahunan, sakit, dan izin dispensasi bawahan langsung',
      email: true,
      whatsapp: true,
      push: true,
    },
    {
      id: 'overtime',
      category: 'Pengajuan Lembur (SPL) & Koreksi Absensi',
      description: 'Surat Perintah Lembur dan verifikasi lupa tap check-in/out',
      email: true,
      whatsapp: false,
      push: true,
    },
    {
      id: 'payroll',
      category: 'Rekonsiliasi & Cut-Off Payroll Bulanan',
      description: 'Validasi kalkulasi BPJS, PPh 21, dan finalisasi transfer bank',
      badge: { text: 'Kritis', color: 'red' },
      email: true,
      whatsapp: true,
      push: true,
    },
    {
      id: 'contract',
      category: 'Notifikasi Kontrak & Probation Expired',
      description: 'Peringatan H-30 berakhirnya PKWT atau masa evaluasi 3 bulan staf baru',
      email: true,
      whatsapp: false,
      push: true,
    },
    {
      id: 'discipline',
      category: 'Eskalasi Pelanggaran & Surat Peringatan (SP)',
      description: 'Penerbitan SP1/SP2/SP3 dan laporan investigasi kedisiplinan kerja',
      badge: { text: 'Urgensi Tinggi', color: 'amber' },
      email: true,
      whatsapp: true,
      push: true,
    },
    {
      id: 'digest',
      category: 'Ringkasan Laporan Mingguan & Analisis HR',
      description: 'Digest otomatis rekap absensi, turnover, dan KPI divisi tiap Senin pagi',
      email: true,
      whatsapp: false,
      push: false,
    },
    {
      id: 'security_alert',
      category: 'Log Keamanan Akun & Percobaan Login Asing',
      description: 'Pemberitahuan login dari IP baru, browser asing, atau pergantian sandi',
      badge: { text: 'Keamanan', color: 'blue' },
      email: true,
      whatsapp: true,
      push: true,
    },
  ]);

  // UI Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleNotification = (
    id: string,
    channel: 'email' | 'whatsapp' | 'push'
  ) => {
    setNotifications((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [channel]: !row[channel] } : row
      )
    );
  };

  const handleResetDefaults = () => {
    setThemeMode('light');
    setTableDensity('normal');
    setFontSize('standard');
    setMicroAnimations(true);
    setHighContrast(false);
    setScreenReaderSupport(false);
    setAudioFeedback(true);
    setLanguage('id');
    setDateFormat('DD/MM/YYYY');
    setTimezone('Asia/Jakarta');
    showToast('Preferensi visual dan notifikasi dikembalikan ke pengaturan standar.');
  };

  const handleSavePreferences = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Perubahan preferensi visual & matriks notifikasi berhasil disimpan!');
    }, 600);
  };

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Breadcrumb Navigation */}
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
            Preferensi &amp; Notifikasi
          </span>
        </nav>

        {/* Page Header: Title + Subtitle + Action Buttons */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Preferensi Antarmuka &amp; Konfigurasi Notifikasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Sesuaikan pengalaman visual antarmuka sistem, format lokalisasi data &amp; tanggal, zona waktu operasional, serta matriks saluran notifikasi (Email, WhatsApp, Push Notification, dan Ringkasan Berkala).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset ke Default</span>
            </button>

            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003B99] hover:bg-[#002b70] text-white font-bold text-xs shadow-md transition-all active:scale-98 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Preferensi'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation - Fully Responsive, guaranteed unclipped across all screen widths */}
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* Tab 1: Profil Personal & Kontak */}
          <Link
            href="/admin/profile"
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>Profil Personal &amp; Kontak</span>
          </Link>

          {/* Tab 2: Keamanan & Kata Sandi */}
          <Link
            href="/admin/profile/security"
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Keamanan &amp; Kata Sandi</span>
          </Link>

          {/* Tab 3: Preferensi & Notifikasi (ACTIVE) */}
          <div className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#003B99] text-white shadow-xs whitespace-nowrap">
            <Sliders className="w-4 h-4 text-blue-200" />
            <span>Preferensi &amp; Notifikasi</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/40 text-blue-100">
              Aktif
            </span>
          </div>

          {/* Tab 4: Log Sesi & Aktivitas */}
          <Link
            href="/admin/profile/activity"
            className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Log Sesi &amp; Aktivitas</span>
          </Link>

          {/* Tab 5: Pendelegasian Wewenang (Guaranteed non-clipped & fully readable) */}
          <Link
            href="/admin/profile/delegation"
            className="flex-1 min-w-[210px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>Pendelegasian Wewenang</span>
          </Link>
        </div>

        {/* Manager Banner - Matching user mockup */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border-l-4 border-l-blue-600 border border-blue-100/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Profil Manajer Operasi HR Aktif: Dewi Lestari, S.Psi
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Preferensi notifikasi ini mengatur saluran persetujuan eskalasi langsung untuk 142 staf Divisi Operasional, Payroll, dan Manajemen Talenta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
            <span className="px-3 py-1 rounded-xl bg-blue-100/80 text-blue-800 text-xs font-semibold">
              Level Otoritas: Tier 2
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold font-mono">
              ID Karyawan: NX-88402
            </span>
          </div>
        </div>

        {/* Main Grid: Tampilan & Aksesibilitas (Left) + Matriks Saluran Notifikasi (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: TAMPILAN & AKSESIBILITAS ================= */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Tampilan &amp; Aksesibilitas
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kustomisasi visual workspace kerja harian
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                Visual
              </span>
            </div>

            {/* Section 1: Mode Tema Sistem */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700">
                Mode Tema Sistem
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Option 1: Terang */}
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    themeMode === 'light'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-full h-14 rounded-lg bg-slate-100 border border-slate-200 p-1.5 flex flex-col gap-1 mb-2.5">
                    <div className="h-2 w-1/2 bg-blue-500 rounded-sm" />
                    <div className="flex-1 bg-white rounded-sm border border-slate-200" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Terang</span>
                    {themeMode === 'light' ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    )}
                  </div>
                </button>

                {/* Option 2: Gelap */}
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    themeMode === 'dark'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-full h-14 rounded-lg bg-slate-900 border border-slate-800 p-1.5 flex flex-col gap-1 mb-2.5">
                    <div className="h-2 w-1/2 bg-blue-400 rounded-sm" />
                    <div className="flex-1 bg-slate-800 rounded-sm border border-slate-700" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Gelap</span>
                    {themeMode === 'dark' ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    )}
                  </div>
                </button>

                {/* Option 3: Ikuti Sistem */}
                <button
                  type="button"
                  onClick={() => setThemeMode('system')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    themeMode === 'system'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-full h-14 rounded-lg bg-gradient-to-r from-slate-100 to-slate-900 border border-slate-300 p-1.5 flex flex-col gap-1 mb-2.5">
                    <div className="h-2 w-1/2 bg-blue-500 rounded-sm" />
                    <div className="flex-1 bg-white/70 rounded-sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 whitespace-nowrap">Ikuti Sistem</span>
                    {themeMode === 'system' ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Section 2: Densitas Tabel & Ukuran Font */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Densitas Tabel Data */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Densitas Tabel Data
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTableDensity('compact')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      tableDensity === 'compact'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kompak
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableDensity('normal')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      tableDensity === 'normal'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableDensity('spacious')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      tableDensity === 'spacious'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lega
                  </button>
                </div>
              </div>

              {/* Ukuran Font Antarmuka */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Ukuran Font Antarmuka
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFontSize('standard')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      fontSize === 'standard'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Standar (14px)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('large')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      fontSize === 'large'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Besar (16px)
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Interactive Toggles (Fully visible, comfortable bottom spacing) */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              {/* Toggle 1: Animasi & Transisi Mikro */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Animasi &amp; Transisi Mikro
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tampilkan efek kehalusan render saat membuka modal &amp; filter tabel
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMicroAnimations(!microAnimations)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    microAnimations ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      microAnimations ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Mode Kontras Tinggi */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Mode Kontras Tinggi
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pertajam batasan kartu dan rasio kontras teks data tabel
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    highContrast ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Dukungan Pembaca Layar (Screen Reader) */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Dukungan Pembaca Layar (Screen Reader)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Optimalkan atribut ARIA label dan fokus keyboard untuk asisten suara tunanetra
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScreenReaderSupport(!screenReaderSupport)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    screenReaderSupport ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      screenReaderSupport ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 4: Efek Suara Notifikasi */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Suara Interaksi &amp; Audio Alert
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Bunyikan nada lembut saat pengajuan baru atau peringatan mendesak diterima
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioFeedback(!audioFeedback)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    audioFeedback ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      audioFeedback ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Section 4: Lokalisasi & Wilayah */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-700">
                Bahasa &amp; Zona Waktu Operasional
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Bahasa Sistem</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="id">Bahasa Indonesia (ID)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium">Zona Waktu Default</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Asia/Jakarta">WIB (UTC+07:00) Jakarta</option>
                    <option value="Asia/Makassar">WITA (UTC+08:00) Bali</option>
                    <option value="Asia/Jayapura">WIT (UTC+09:00) Papua</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: MATRIKS SALURAN NOTIFIKASI ================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Matriks Saluran Notifikasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atur kanal penerimaan alert sesuai urgensi operasional HR
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 self-start sm:self-center">
                Granular Alert
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tentukan saluran komunikasi mana yang akan dihubungi saat terjadi pembaruan status sistem dan pengajuan operasional tim.
            </p>

            {/* Matrix Table - Fully unclipped with interactive checkboxes */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Kategori Peristiwa HR</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Push Mobile</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {notifications.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 leading-tight">
                            {row.category}
                          </span>
                          {row.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.badge.color === 'red'
                                  ? 'bg-rose-100 text-rose-700'
                                  : row.badge.color === 'amber'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {row.badge.text}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {row.description}
                        </p>
                      </td>

                      {/* Email Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleNotification(row.id, 'email')}
                          className={`w-6 h-6 rounded-lg border inline-flex items-center justify-center transition-all ${
                            row.email
                              ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                          aria-label={`Toggle Email for ${row.category}`}
                        >
                          {row.email && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>
                      </td>

                      {/* WhatsApp Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleNotification(row.id, 'whatsapp')}
                          className={`w-6 h-6 rounded-lg border inline-flex items-center justify-center transition-all ${
                            row.whatsapp
                              ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                          aria-label={`Toggle WhatsApp for ${row.category}`}
                        >
                          {row.whatsapp && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Push Mobile Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleNotification(row.id, 'push')}
                          className={`w-6 h-6 rounded-lg border inline-flex items-center justify-center transition-all ${
                            row.push
                              ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                          aria-label={`Toggle Push Mobile for ${row.category}`}
                        >
                          {row.push && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Informative Footer Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Saluran WhatsApp terhubung via Nexora Official Business API</span>
              </div>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline self-start sm:self-auto"
              >
                Terapkan Matriks Saluran
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutSkeleton>
  );
}
