'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FolderArchive,
  Headphones,
  Search,
  Calendar,
  CheckCircle2,
  Lock,
  Mail,
  Download,
  ShieldCheck,
  Building2,
  Sparkles,
  HelpCircle,
  X,
  FileText,
  Check,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Camera,
  Save,
  Phone,
  MapPin,
  IdCard,
  Briefcase,
  HeartHandshake,
  ShieldAlert,
  Loader2,
  Share2,
  Upload,
} from 'lucide-react';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

interface FamilyMember {
  name: string;
  relation: string;
  dob: string;
  bpjsCovered: boolean;
}

export default function EmployeeProfilePage() {
  const router = useRouter();

  // Active Tab: 'personal' | 'employment' | 'payroll' | 'family' | 'security'
  const [activeTab, setActiveTab] = useState<
    'personal' | 'employment' | 'payroll' | 'family' | 'security'
  >('personal');

  // Search in header
  const [searchQuery, setSearchQuery] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRequestCorrectionModalOpen, setIsRequestCorrectionModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [correctionField, setCorrectionField] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Profile data states
  const [profileData, setProfileData] = useState({
    // Personal
    fullName: 'Rian Pratama, S.Kom',
    preferredName: 'Rian',
    employeeNumber: 'NX-2021008',
    nik: '3171041508930005',
    birthPlace: 'Jakarta',
    birthDate: '1993-08-15',
    gender: 'Laki-laki',
    bloodType: 'O+',
    religion: 'Islam',
    maritalStatus: 'Menikah',
    emailPersonal: 'rian.pratama93@gmail.com',
    emailCompany: 'rian.pratama@nexora.co.id',
    phone: '+62 812-8899-7711',
    addressKtp: 'Jl. Melati Indah No. 42, Kebayoran Baru, Jakarta Selatan, 12140',
    addressCurrent: 'Jl. Melati Indah No. 42, Kebayoran Baru, Jakarta Selatan, 12140',
    avatarUrl: '',

    // Employment
    department: 'Technology & Core Engineering',
    designation: 'Lead Backend Architect',
    level: 'Senior Lead Specialist (Band 5)',
    employmentType: 'PKWTT (Karyawan Tetap)',
    joinDate: '2021-01-12',
    workLocation: 'SCBD Headquarter, Gedung Pasifik Lt. 7, Jakarta',
    workModel: 'Hybrid (3 Hari WFO / 2 Hari WFH)',
    manager: 'Hendra Wijaya, M.Sc (VP of Engineering)',
    shiftSchedule: 'Normal Office Hours (08:30 - 17:30 WIB)',

    // Payroll & Taxes
    bankName: 'Bank Central Asia (BCA)',
    bankAccountNumber: '8092-1829-10',
    bankAccountHolder: 'Rian Pratama',
    npwp: '72.819.291.0-012.000',
    ptkpStatus: 'K/1 (Kawin, 1 Tanggungan Anak)',
    bpjsTkNumber: '21908291829',
    bpjsKesNumber: '000192839182',

    // Security
    twoFactorEnabled: true,
  });

  // Emergency contact list
  const [emergencyContacts] = useState<EmergencyContact[]>([
    {
      name: 'Sarah Amanda, S.Farm',
      relationship: 'Istri',
      phone: '+62 813-2233-4455',
      address: 'Jl. Melati Indah No. 42, Kebayoran Baru, Jakarta Selatan',
    },
    {
      name: 'Budi Santoso',
      relationship: 'Orang Tua (Ayah)',
      phone: '+62 811-9988-1122',
      address: 'Jl. Cempaka Putih Timur No. 12, Jakarta Pusat',
    },
  ]);

  // Family members list
  const [familyMembers] = useState<FamilyMember[]>([
    {
      name: 'Sarah Amanda',
      relation: 'Istri',
      dob: '1995-04-20',
      bpjsCovered: true,
    },
    {
      name: 'Kenzo Althaf Pratama',
      relation: 'Anak Kandung',
      dob: '2023-02-10',
      bpjsCovered: true,
    },
  ]);

  // Load from localStorage or API on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('nexora_user_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        setProfileData((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
      const persistentAvatar = localStorage.getItem('nexora_persistent_avatar');
      if (persistentAvatar) {
        setProfileData((prev) => ({ ...prev, avatarUrl: persistentAvatar }));
      }
    } catch {}

    // Listen to real-time broadcast channel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (msg?.type === 'PROFILE_UPDATED' && msg.profile) {
          setProfileData((prev) => ({ ...prev, ...msg.profile }));
        }
      };
    } catch {}

    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Client-side automatic JPG compression for profile photo
  const compressImageToJpg = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const MAX_DIM = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Mohon pilih file gambar yang valid (JPG, PNG, atau WEBP).');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const compressedDataUrl = await compressImageToJpg(file);

      const updated = { ...profileData, avatarUrl: compressedDataUrl };
      setProfileData(updated);

      localStorage.setItem('nexora_persistent_avatar', compressedDataUrl);
      localStorage.setItem('nexora_user_profile', JSON.stringify(updated));

      // Broadcast update
      try {
        const channel = new BroadcastChannel('nexora_live_sync');
        channel.postMessage({
          type: 'PROFILE_UPDATED',
          profile: updated,
        });
        channel.close();
      } catch {}

      showToast('✓ Foto profil berhasil diperbarui!');
    } catch {
      showToast('⚠️ Gagal memproses gambar. Silakan coba lagi.');
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      localStorage.setItem('nexora_user_profile', JSON.stringify(profileData));

      // Broadcast update
      try {
        const channel = new BroadcastChannel('nexora_live_sync');
        channel.postMessage({
          type: 'PROFILE_UPDATED',
          profile: profileData,
        });
        channel.close();
      } catch {}

      showToast('✓ Data profil pribadi Anda berhasil disimpan dan disinkronkan!');
    } catch {
      showToast('⚠️ Terjadi kendala saat menyimpan. Periksa jaringan Anda.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestCorrectionModalOpen(false);
    showToast(`✓ Permohonan revisi data "${correctionField}" telah diteruskan ke Tim People Ops (HR).`);
    setCorrectionField('');
    setCorrectionReason('');
  };

  // Format current date
  const today = new Date();
  const currentDateStr = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* LEFT SIDEBAR matching screenshot */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 justify-between p-4 sm:p-5 sticky top-0 md:h-screen z-30 shadow-2xs">
        <div className="space-y-5">
          {/* Logo Brand matching screenshot */}
          <Link href="/karyawan" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-blue-500/20 flex-shrink-0">
              <span className="text-white font-black tracking-tight">❖</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                Nexora <span className="text-blue-600 font-bold">HRIS</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 leading-tight">
                Portal Karyawan (ESS)
              </span>
            </div>
          </Link>

          {/* Active Session Pill matching screenshot */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sesi Aktif: NX-2021008</span>
          </div>

          {/* SECTION 1: UTAMA */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              UTAMA
            </p>

            {/* Beranda Saya */}
            <Link
              href="/karyawan"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Beranda Saya</span>
            </Link>

            {/* Profil Saya (ACTIVE matching screenshot style) */}
            <Link
              href="/karyawan/profile"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-all"
            >
              <User className="w-4 h-4 text-white" />
              <span>Profil Saya</span>
            </Link>

            {/* Presensi & Absensi */}
            <Link
              href="/karyawan/attendance"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Presensi & Absensi</span>
            </Link>

            {/* Cuti & Izin Saya */}
            <Link
              href="/karyawan/leave"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span>Cuti & Izin Saya</span>
            </Link>

            {/* Slip Gaji & Kompensasi */}
            <Link
              href="/karyawan/payroll"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Slip Gaji & Kompensasi</span>
            </Link>
          </div>

          {/* SECTION 2: KARIR & PENGEMBANGAN */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              KARIR & PENGEMBANGAN
            </p>

            <Link
              href="/karyawan/performance"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span>Kinerja & KPI Pribadi</span>
            </Link>

            <Link
              href="/karyawan/training"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>Pelatihan & Modul</span>
            </Link>
          </div>

          {/* SECTION 3: DOKUMEN & BANTUAN */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              DOKUMEN & BANTUAN
            </p>

            <Link
              href="/karyawan/documents"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <FolderArchive className="w-4 h-4 text-slate-400" />
              <span>Arsip & Formulir</span>
            </Link>

            <button
              type="button"
              onClick={() => showToast('Kontak HR Helpdesk: Ext. 402 / helpdesk-hr@nexora.co.id')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
            >
              <Headphones className="w-4 h-4 text-slate-400" />
              <span>Bantuan & Kontak HR</span>
            </button>
          </div>
        </div>

        {/* BOTTOM CARD: PUSAT DUKUNGAN matching screenshot */}
        <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Pusat Dukungan</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Ada kendala data kehadiran atau klaim?
          </p>
          <div className="pt-1 space-y-1 font-semibold text-[11px]">
            <a
              href="#sop"
              onClick={(e) => {
                e.preventDefault();
                showToast('Membuka SOP Kepegawaian & Panduan ESS Nexora...');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>SOP Kepegawaian</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
            <a
              href="#tiket"
              onClick={(e) => {
                e.preventDefault();
                showToast('Membuka Form Tiket Helpdesk HR...');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>Tiket Helpdesk HR</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR matching screenshot */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Search Input Box */}
          <div className="relative w-72 sm:w-96 max-w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu, profil, atau dokumen pribadi..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Live Date display */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDateStr}</span>
            </div>

            {/* Real-time Notification Bell */}
            <NotificationBellDropdown portal="ess" />

            {/* User Profile Pill */}
            <Link
              href="/karyawan/profile"
              className="flex items-center gap-2.5 p-1 rounded-xl bg-blue-50/70 border border-blue-200/60 transition-colors"
              title="Profil Pengguna Saya"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs overflow-hidden">
                {profileData.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileData.avatarUrl}
                    alt={profileData.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  'RP'
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                    {profileData.fullName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-[9px] font-bold text-blue-700">
                    Karyawan (ESS)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  {profileData.designation} • {profileData.employeeNumber}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1500px] w-full mx-auto pb-28">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Link href="/karyawan" className="hover:text-blue-600 transition-colors">
              Beranda Saya
            </Link>
            <span>&gt;</span>
            <span className="text-slate-800 font-bold">Profil Saya</span>
          </div>

          {/* PROFILE HERO HEADER CARD */}
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
            {/* Background Decorative Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left: Avatar + Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
                {/* Avatar with Camera upload button */}
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 border-2 border-white/40 shadow-inner flex items-center justify-center text-3xl font-black text-white overflow-hidden backdrop-blur-xs">
                    {profileData.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileData.avatarUrl}
                        alt={profileData.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      'RP'
                    )}
                  </div>
                  {/* Photo Upload trigger button */}
                  <label
                    htmlFor="ess-avatar-input"
                    className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 shadow-lg cursor-pointer transition-transform active:scale-95 flex items-center justify-center border border-blue-200"
                    title="Ubah Foto Profil"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                    ) : (
                      <Camera className="w-4 h-4 text-blue-700" />
                    )}
                  </label>
                  <input
                    ref={photoInputRef}
                    id="ess-avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {profileData.fullName}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold">
                      Aktif Bekerja
                    </span>
                  </div>

                  <p className="text-sm text-blue-100 font-medium">
                    {profileData.designation} • {profileData.department}
                  </p>

                  {/* Pills Info */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-semibold text-blue-100">
                    <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
                      NIP: {profileData.employeeNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
                      Status: {profileData.employmentType}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
                      Bergabung: {profileData.joinDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold backdrop-blur-xs shadow-sm transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Unduh Biodata PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold shadow-lg shadow-black/10 transition-all active:scale-95 disabled:opacity-70"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                  ) : (
                    <Save className="w-4 h-4 text-blue-700" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'personal'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Data Pribadi & Biodata</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('employment')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'employment'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Kepegawaian & Posisi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payroll')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'payroll'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payroll, Rekening & Pajak</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('family')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'family'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Keluarga & Kontak Darurat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Keamanan & Sandi</span>
            </button>
          </div>

          {/* TAB 1: DATA PRIBADI & BIODATA */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Editable Form */}
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Informasi Biodata Karyawan
                    </h2>
                    <p className="text-xs text-slate-500">
                      Data ini digunakan untuk administrasi kepegawaian dan kepatuhan ketenagakerjaan.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    Dapat Disunting Mandiri
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap (sesuai KTP)
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, fullName: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Preferred Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Panggilan
                    </label>
                    <input
                      type="text"
                      value={profileData.preferredName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, preferredName: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* NIK (KTP) - Protected Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        NIK (Nomor Induk Kependudukan)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCorrectionField('NIK / No. KTP');
                          setIsRequestCorrectionModalOpen(true);
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Minta Revisi HR
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={profileData.nik}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jenis Kelamin
                    </label>
                    <select
                      value={profileData.gender}
                      onChange={(e) =>
                        setProfileData({ ...profileData, gender: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  {/* Place of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      value={profileData.birthPlace}
                      onChange={(e) =>
                        setProfileData({ ...profileData, birthPlace: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) =>
                        setProfileData({ ...profileData, birthDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Religion */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Agama</label>
                    <select
                      value={profileData.religion}
                      onChange={(e) =>
                        setProfileData({ ...profileData, religion: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen Protestan">Kristen Protestan</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  {/* Blood Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Golongan Darah
                    </label>
                    <select
                      value={profileData.bloodType}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bloodType: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      No. Handphone / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Personal Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Pribadi
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={profileData.emailPersonal}
                        onChange={(e) =>
                          setProfileData({ ...profileData, emailPersonal: e.target.value })
                        }
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Address KTP */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Alamat Lengkap (KTP)
                    </label>
                    <textarea
                      rows={2}
                      value={profileData.addressKtp}
                      onChange={(e) =>
                        setProfileData({ ...profileData, addressKtp: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  {/* Address Current */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Alamat Domisili Sekarang
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setProfileData({ ...profileData, addressCurrent: profileData.addressKtp })
                        }
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Sama dengan alamat KTP
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={profileData.addressCurrent}
                      onChange={(e) =>
                        setProfileData({ ...profileData, addressCurrent: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveProfile()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Biodata</span>
                  </button>
                </div>
              </div>

              {/* Right 1 Col: Quick Info Card & Status */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Status Verifikasi Data</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-600">Dokumen KTP</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Terverifikasi HR
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-600">NPWP Terdaftar</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Valid DJP
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-600">BPJS Ketenagakerjaan</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Aktif
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-600">BPJS Kesehatan</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Aktif
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/70 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span>Punya Perubahan Data Resmi?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Perubahan nama resmi, status pernikahan, atau data rekening wajib menyertakan dokumen pendukung ke HR.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCorrectionField('Umum / Data Pribadi');
                      setIsRequestCorrectionModalOpen(true);
                    }}
                    className="w-full py-2 px-3 text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors shadow-2xs"
                  >
                    Ajukan Permohonan Revisi HR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEPEGAWAIAN & POSISI */}
          {activeTab === 'employment' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Struktur & Informasi Kepegawaian
                  </h2>
                  <p className="text-xs text-slate-500">
                    Data posisi dan hubungan kerja resmi yang dikelola oleh Divisi People & Talent.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Hanya-Baca (HR Master Data)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Nomor Induk Karyawan (NIP)
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {profileData.employeeNumber}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Unit Departemen
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {profileData.department}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Jabatan / Designation
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {profileData.designation}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Jenjang & Leveling
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">{profileData.level}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status Perjanjian Kerja
                  </p>
                  <p className="text-sm font-extrabold text-emerald-700">
                    {profileData.employmentType}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tanggal Mulai Bergabung
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">{profileData.joinDate}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1 sm:col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Atasan Langsung (Direct Manager)
                  </p>
                  <p className="text-sm font-extrabold text-blue-700">{profileData.manager}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Model Kerja
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">{profileData.workModel}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1 sm:col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Penempatan Kantor & Lokasi
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {profileData.workLocation}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Jadwal Kerja
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {profileData.shiftSchedule}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYROLL, REKENING & PAJAK */}
          {activeTab === 'payroll' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Informasi Pembayaran Gaji, Pajak & Jaminan Sosial
                  </h2>
                  <p className="text-xs text-slate-500">
                    Digunakan untuk pencairan transfer take home pay bulanan dan pemotongan PPh 21 / BPJS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCorrectionField('Rekening Payroll / NPWP');
                    setIsRequestCorrectionModalOpen(true);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200"
                >
                  Ajukan Ubah Rekening
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Bank Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
                      Bank Payroll Resmi
                    </span>
                    <CreditCard className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Nomor Rekening</p>
                    <p className="text-xl font-mono font-bold tracking-wider text-white">
                      {profileData.bankAccountNumber}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                    <div>
                      <p className="text-[10px] text-slate-400">Atas Nama</p>
                      <p className="font-bold text-white">{profileData.bankAccountHolder}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Bank</p>
                      <p className="font-bold text-white">{profileData.bankName}</p>
                    </div>
                  </div>
                </div>

                {/* Tax & BPJS Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Nomor Pokok Wajib Pajak (NPWP)
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-800">
                      {profileData.npwp}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Status PTKP PPh 21
                    </p>
                    <p className="text-xs font-bold text-slate-800">{profileData.ptkpStatus}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      BPJS Ketenagakerjaan
                    </p>
                    <p className="text-xs font-mono font-bold text-emerald-700">
                      {profileData.bpjsTkNumber}
                    </p>
                    <span className="text-[10px] text-slate-400">JHT, JKK, JKM, JP</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      BPJS Kesehatan
                    </p>
                    <p className="text-xs font-mono font-bold text-emerald-700">
                      {profileData.bpjsKesNumber}
                    </p>
                    <span className="text-[10px] text-slate-400">Kelas 1 (Keluarga)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KELUARGA & KONTAK DARURAT */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              {/* Emergency Contacts */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Kontak Darurat (Emergency Contact)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Pihak yang dapat dihubungi oleh perusahaan dalam situasi mendesak / keselamatan kerja.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergencyContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">{contact.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                          {contact.relationship}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{contact.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span>{contact.address}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Family Members */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Susunan Anggota Keluarga Terdaftar
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tercatat untuk perhitungan tunjangan asuransi kesehatan & tanggungan pajak PTKP.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Nama Anggota</th>
                        <th className="py-2.5 px-3">Hubungan</th>
                        <th className="py-2.5 px-3">Tanggal Lahir</th>
                        <th className="py-2.5 px-3">Status BPJS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {familyMembers.map((fam, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-bold text-slate-900">{fam.name}</td>
                          <td className="py-3 px-3 text-slate-600">{fam.relation}</td>
                          <td className="py-3 px-3 text-slate-600">{fam.dob}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                              <Check className="w-3 h-3" /> Ditanggung Perusahaan
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KEAMANAN & SANDI */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password Form */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-extrabold text-slate-900">Ubah Kata Sandi</h2>
                  <p className="text-xs text-slate-500">
                    Pastikan password baru Anda kuat (minimal 8 karakter dengan kombinasi angka & simbol).
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi baru"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Ketik ulang password baru"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('✓ Kata sandi berhasil diperbarui dengan aman!')}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Simpan Kata Sandi Baru
                  </button>
                </div>
              </div>

              {/* 2FA & Active Sessions */}
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Autentikasi Dua Langkah (2FA)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Lapisan keamanan ekstra menggunakan Google Authenticator
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Akun Anda terlindungi dengan verifikasi kode OTP setiap login dari perangkat baru.
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                    Sesi Login Aktif
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div>
                        <p className="font-bold text-slate-900">Chrome di Windows 11 (Perangkat Ini)</p>
                        <p className="text-[10px] text-slate-400">Jakarta, Indonesia • IP 182.253.x.x</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Aktif Sekarang
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div>
                        <p className="font-bold text-slate-900">Nexora Mobile App (iPhone 15 Pro)</p>
                        <p className="text-[10px] text-slate-400">Terakhir aktif: 2 jam yang lalu</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast('Sesi perangkat lain berhasil dihentikan.')}
                        className="text-[10px] text-red-600 hover:underline font-semibold"
                      >
                        Keluar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* REQUEST CORRECTION MODAL */}
      {isRequestCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Permohonan Revisi Data HR
              </h3>
              <button
                type="button"
                onClick={() => setIsRequestCorrectionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kolom yang Diubah</label>
                <input
                  type="text"
                  value={correctionField}
                  onChange={(e) => setCorrectionField(e.target.value)}
                  placeholder="Contoh: NIK, Nama KTP, Rekening Bank"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alasan & Nilai Data Baru
                </label>
                <textarea
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Jelaskan perubahan data yang diinginkan dan lampirkan bukti jika ada..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOWNLOAD MODAL SIMULATION */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Unduh Formulir Biodata</h3>
              <p className="text-xs text-slate-500 mt-1">
                Dokumen resmi PDF Biodata Karyawan NX-2021008 sedang disiapkan.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 text-left">
              📄 Biodata_Karyawan_NX-2021008.pdf (1.2 MB)
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDownloadModalOpen(false);
                  showToast('✓ Berhasil mengunduh dokumen Biodata Karyawan PDF!');
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/20"
              >
                Mulai Unduh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
