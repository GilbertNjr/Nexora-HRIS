'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  User,
  Shield,
  ShieldCheck,
  Smartphone,
  Laptop,
  Mail,
  Phone,
  Building2,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  Camera,
  LogOut,
  Save,
  KeyRound,
  Bell,
  History,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Check,
  X,
  CreditCard,
  Briefcase,
  IdCard,
} from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'preferences' | 'activity' | 'delegation'
  >('profile');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: 'Dewi Lestari, S.Psi',
    employeeNumber: 'NX-2018012',
    email: 'dewi.lestari@nexora.co.id',
    phone: '+62 812-9876-5432',
    department: 'People & Culture / People Operations',
    designation: 'HR Operations Manager',
    manager: 'Direktur SDM & Legal (Board of Directors)',
    location: 'Kantor Pusat - SCBD Jakarta (Hybrid Policy)',
    joinDate: '12 Mar 2018',
  });

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Perubahan profil dan kontak kerja berhasil disimpan!');
    }, 600);
  };

  const handleTerminateOtherSessions = () => {
    showToast('Sesi perangkat iPhone 15 Pro berhasil dihentikan (Logged out).');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('nexora_user');
    }
    router.push('/login');
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

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb matching Image 1 */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            UTAMA
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">PENGATURAN AKUN</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600">PROFIL & KEAMANAN PENGGUNA</span>
        </nav>

        {/* Page Header matching Image 1 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Pengaturan Akun & Profil Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Kelola informasi biodata personal, keamanan akun, autentikasi dua faktor (2FA), preferensi antarmuka sistem, dan riwayat aktivitas sesi login Anda.
            </p>
          </div>

          {/* Action Buttons Top Right matching Image 1 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 shadow-2xs transition-all active:scale-98"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Keluar Sesi (Logout)</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all active:scale-98 disabled:opacity-60"
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Simpan Perubahan Akun</span>
            </button>
          </div>
        </div>

        {/* Hero Profile Card with Full Non-Clipped Name & 3 Metrics */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
            {/* Left: Avatar + Identity (Ensuring Name is NEVER cut off) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Photo Avatar with Online Dot & Camera Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md bg-gradient-to-tr from-amber-500 via-rose-400 to-indigo-500 p-0.5">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=240"
                    alt="Dewi Lestari, S.Psi"
                    className="w-full h-full object-cover rounded-2xl bg-white"
                  />
                </div>
                {/* Active Status Dot */}
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                {/* Edit Photo Button */}
                <button
                  type="button"
                  onClick={() => showToast('Pilih foto baru untuk memperbarui avatar profil.')}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-white transition-all active:scale-95"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bio & Details (Full unclipped text) */}
              <div className="space-y-2 min-w-0">
                {/* Name: Displayed prominently without truncate */}
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                    {profileData.fullName}
                  </h2>
                </div>

                {/* Role & Level Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    {profileData.designation}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                    Manajerial Utama (Tingkat 2)
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Pengelola Operasional Sumber Daya Manusia • Nexora Global Solusindo PT
                </p>

                {/* Meta details list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>NIK: <strong className="font-mono text-slate-800">{profileData.employeeNumber}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-800 font-medium">{profileData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>HQ Jakarta - SCBD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Bergabung 12 Mar 2018 (7 Thn)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 3 Mini Status Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-shrink-0">
              {/* Metric 1: Status Keamanan */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    STATUS KEAMANAN
                  </p>
                  <p className="text-sm font-extrabold text-emerald-900 mt-0.5">
                    98% Sangat Kuat
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    2FA Aktif • ISO 27001
                  </p>
                </div>
              </div>

              {/* Metric 2: Sesi Aktif */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    SESI AKTIF
                  </p>
                  <p className="text-sm font-extrabold text-blue-900 mt-0.5">
                    2 Perangkat
                  </p>
                  <p className="text-[10px] text-blue-700 font-medium mt-0.5">
                    macOS & Nexora iOS
                  </p>
                </div>
              </div>

              {/* Metric 3: Hak Otoritas */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    HAK OTORITAS
                  </p>
                  <p className="text-sm font-extrabold text-indigo-900 mt-0.5">
                    Full Ops Manager
                  </p>
                  <p className="text-[10px] text-indigo-700 font-medium mt-0.5">
                    Otorisasi L1, L2, & HR-Admin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Full width & spaced so NO tab text is clipped) */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>Profil Personal & Kontak</span>
          </button>

          <Link
            href="/admin/profile/security"
            className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-all whitespace-nowrap"
          >
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Keamanan &amp; Kata Sandi</span>
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Preferensi & Notifikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'activity'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <History className="w-4 h-4 text-indigo-500" />
            <span>Log Sesi & Aktivitas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delegation')}
            className={`flex-1 min-w-[190px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'delegation'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-600" />
            <span>Pendelegasian Wewenang</span>
          </button>
        </div>

        {/* Tab 1 Content: Profil Personal & Kontak (Form + Sesi Aktif) */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form Informasi Data Diri & Kontak Kerja (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
              {/* Form Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Informasi Data Diri & Kontak Kerja
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Identitas kepegawaian resmi yang terdaftar di basis data Master HRIS Nexora.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 self-start sm:self-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Data Master Aktif</span>
                </span>
              </div>

              {/* Form Input Fields Grid */}
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Nama Lengkap (dengan Gelar)
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  {/* NIK (Terkunci) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-slate-700">Nomor Induk Karyawan (NIK)</label>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Terkunci (Sistem)</span>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={profileData.employeeNumber}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-semibold text-slate-700 cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Korporat (With generous right padding so email is NEVER clipped by badge) */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Email Korporat (SSO Google)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-28 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 pointer-events-none">
                        <Check className="w-3 h-3" />
                        <span>Terverifikasi</span>
                      </span>
                    </div>
                  </div>

                  {/* Nomor Telepon / WA */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Nomor Telepon / WhatsApp Operasional
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Departemen */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Departemen / Divisi
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profileData.department}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Jabatan Struktural */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Jabatan Struktural
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profileData.designation}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Atasan Langsung */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Atasan Langsung (Pelaporan Struktural)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profileData.manager}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Lokasi Penempatan Kerja */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Lokasi Penempatan Kerja
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profileData.location}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all active:scale-98 disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Biodata</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Perangkat & Sesi Aktif (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      Perangkat & Sesi Aktif
                    </h3>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Active Sessions List */}
              <div className="space-y-3">
                {/* Session 1: Current MacBook */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Laptop className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-bold text-slate-900">
                        MacBook Pro 16" • Chrome
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Sesi Ini
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Jakarta, ID • IP: 182.253.14.88
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Aktif sejak: Hari ini, 08:30 WIB
                  </p>
                </div>

                {/* Session 2: Mobile Phone */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <span className="text-xs font-bold text-slate-900">
                        iPhone 15 Pro • Nexora App
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">
                      15 mnt lalu
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Jakarta Selatan, ID • Versi 2.4.1
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Terakhir aktif: Hari ini, 10:45 WIB
                  </p>
                </div>
              </div>

              {/* Action Button: Keluar Dari Semua Perangkat Lain */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTerminateOtherSessions}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Keluar Dari Semua Perangkat Lain</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Keamanan & Kata Sandi */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="pb-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Keamanan Sandi & Otentikasi 2FA</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terapkan kata sandi berstandar ISO/IEC 27001 dan amankan login dengan aplikasi authenticator.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">Ganti Kata Sandi Akun</h4>
                <div>
                  <label className="block text-slate-600 mb-1">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    placeholder="Minimal 8 karakter (huruf, angka, simbol)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Kata sandi berhasil diperbarui!')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  Perbarui Kata Sandi
                </button>
              </div>

              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-900">Autentikasi Dua Faktor (2FA)</h4>
                </div>
                <p className="text-slate-500">
                  Status: <strong className="text-emerald-600">Aktif (Google Authenticator)</strong>
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Setiap kali Anda masuk dari perangkat baru, kode verifikasi 6-digit dari aplikasi authenticator akan diminta untuk mengonfirmasi identitas Anda.
                </p>
                <button
                  type="button"
                  onClick={() => showToast('Konfigurasi 2FA diverifikasi.')}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
                >
                  Konfigurasi Ulang Authenticator
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Preferensi & Notifikasi */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="pb-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Preferensi Notifikasi & Tampilan</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur saluran pemberitahuan email, WhatsApp Gateway, dan jadwal rekap harian.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">Notifikasi Email Permohonan Cuti Staf</p>
                  <p className="text-slate-500 mt-0.5">Kirim email setiap kali ada bawahan mengajukan cuti atau izin sakit.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">Peringatan Keterlambatan Presensi Harian</p>
                  <p className="text-slate-500 mt-0.5">Kirim laporan harian jam 09:30 WIB terkait staf yang belum clock-in.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">Notifikasi WhatsApp Broadcast Payroll</p>
                  <p className="text-slate-500 mt-0.5">Notifikasi otomatis saat proses transfer gaji bulanan selesai disetujui.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Log Sesi & Aktivitas */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="pb-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Riwayat Sesi Login & Jejak Audit</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar riwayat autentikasi akun 30 hari terakhir untuk memantau keamanan akun Anda.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Perangkat & Browser</th>
                    <th className="py-3 px-4">Alamat IP</th>
                    <th className="py-3 px-4">Lokasi</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-mono">Hari ini, 08:30 WIB</td>
                    <td className="py-3 px-4 font-semibold">MacBook Pro (Chrome 122)</td>
                    <td className="py-3 px-4 font-mono text-slate-600">182.253.14.88</td>
                    <td className="py-3 px-4 text-slate-600">Jakarta Pusat, ID</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Berhasil</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono">Kemarin, 14:15 WIB</td>
                    <td className="py-3 px-4 font-semibold">iPhone 15 Pro (Nexora App)</td>
                    <td className="py-3 px-4 font-mono text-slate-600">114.122.98.12</td>
                    <td className="py-3 px-4 text-slate-600">Jakarta Selatan, ID</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Berhasil</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono">14 Okt 2024, 08:10 WIB</td>
                    <td className="py-3 px-4 font-semibold">MacBook Pro (Chrome 122)</td>
                    <td className="py-3 px-4 font-mono text-slate-600">182.253.14.88</td>
                    <td className="py-3 px-4 text-slate-600">Jakarta Pusat, ID</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Berhasil</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Pendelegasian Wewenang (Unclipped & Full Feature) */}
        {activeTab === 'delegation' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="pb-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Pendelegasian Wewenang & Persetujuan</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Limpahkan hak persetujuan cuti dan lembur kepada staf pengganti saat Anda sedang cuti atau dinas luar.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Status Delegasi Saat Ini</p>
                  <p className="text-slate-500 mt-0.5">Saat ini Anda memegang otorisasi penuh secara mandiri.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                  Tidak Aktif
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih Pejabat Pengganti</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white">
                    <option>Siti Rahmawati - HR Specialist</option>
                    <option>Rian Ardiansyah - Lead Engineer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Waktu Pendelegasian</label>
                  <input type="date" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showToast('Pendelegasian wewenang berhasil disimpan!')}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                >
                  Aktifkan Pendelegasian
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Logout */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Keluar Sesi Akun?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin keluar dari sesi portal HRIS saat ini? Anda harus memasukkan kredensial login kembali untuk mengakses sistem.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Ya, Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
