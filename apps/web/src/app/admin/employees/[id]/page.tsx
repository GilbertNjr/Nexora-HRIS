'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ArrowLeft,
  Download,
  Edit3,
  MoreVertical,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Users,
  Star,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Network,
  CreditCard,
  Lock,
  Unlock,
  Folder,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  X,
  FileCheck,
  TrendingUp,
  Layers,
  Award,
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = (params?.id as string) || 'NX-2021008';

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'identitas' | 'karir' | 'presensi' | 'kompensasi' | 'dokumen'
  >('identitas');

  // UI Interactive state
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);
  const [isCopiedPhone, setIsCopiedPhone] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSalaryRevealed, setIsSalaryRevealed] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  // Editable Profile Data State
  const [profile, setProfile] = useState({
    id: employeeId,
    fullName: 'Rian Pratama, S.Kom',
    statusType: 'Karyawan Tetap (PKWTT)',
    grade: 'Grade: P5 - Principal Specialist',
    designation: 'Lead Backend Architect',
    division: 'Divisi Rekayasa & Arsitektur Cloud',
    department: 'Departemen Sistem Inti (Core Engine)',
    office: 'Head Office Jakarta',
    joinDate: '14 Januari 2021',
    tenure: '4 Tahun 2 Bulan',
    deskLocation: 'Lantai 7, Node #B-12',
    email: 'rian.pratama@nexora.co.id',
    phone: '+62 812-9845-1120',
    nik: '3174051408920003',
    npwp: '82.491.332.8-014.000',
    bpjsTk: '21094481029',
    bpjsKes: '0002881920194',
    birthPlaceDate: 'Jakarta, 14 Agustus 1992 (32 Tahun)',
    genderBlood: 'Laki-Laki / O (+)',
    religion: 'Islam',
    taxStatus: 'Kawin (K/1)',
    taxDependents: '1 Anak Terdaftar',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch real employee profile from backend API
  React.useEffect(() => {
    let isMounted = true;
    const fetchEmployeeDetail = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await fetch(`/api/v1/employees/${encodeURIComponent(employeeId)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          const emp = json?.data;
          if (emp && isMounted) {
            setProfile((prev) => ({
              ...prev,
              id: emp.employeeNumber || emp.id,
              fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || prev.fullName,
              statusType: emp.employmentType === 'PERMANENT' ? 'Karyawan Tetap (PKWTT)' : emp.employmentType === 'CONTRACT_PKWT' ? 'Kontrak PKWT' : emp.employmentType === 'PROBATION' ? 'Masa Percobaan (Probation)' : 'Magang (Internship)',
              grade: emp.grade || prev.grade,
              designation: emp.designation || prev.designation,
              division: emp.division || prev.division,
              department: emp.department || prev.department,
              office: emp.office || prev.office,
              joinDate: emp.joinDate || prev.joinDate,
              tenure: emp.tenure || prev.tenure,
              deskLocation: emp.deskLocation || prev.deskLocation,
              email: emp.email || prev.email,
              phone: emp.phone || prev.phone,
              nik: emp.nik || prev.nik,
              npwp: emp.npwp || prev.npwp,
              bpjsTk: emp.bpjsTk || prev.bpjsTk,
              bpjsKes: emp.bpjsKes || prev.bpjsKes,
              birthPlaceDate: emp.birthPlaceDate || prev.birthPlaceDate,
              genderBlood: emp.genderBlood || prev.genderBlood,
              religion: emp.religion || prev.religion,
              taxStatus: emp.taxStatus || prev.taxStatus,
              taxDependents: emp.taxDependents || prev.taxDependents,
            }));
          }
        }
      } catch {
        // use fallback initial state
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    fetchEmployeeDetail();
    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard?.writeText(text);
    if (type === 'email') {
      setIsCopiedEmail(true);
      setTimeout(() => setIsCopiedEmail(false), 2000);
    } else {
      setIsCopiedPhone(true);
      setTimeout(() => setIsCopiedPhone(false), 2000);
    }
    showToast(`Disalin ke papan klip: ${text}`);
  };

  const handleDownloadProfile = () => {
    showToast('Mengunduh Berkas Rekap Profil Karyawan (PDF)...');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/employees/${encodeURIComponent(profile.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designation: profile.designation,
          grade: profile.grade,
          deskLocation: profile.deskLocation,
          email: profile.email,
          phone: profile.phone,
          department: profile.department,
          division: profile.division,
          office: profile.office,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message || 'Data karyawan berhasil diperbarui & dicatat ke Audit Trail!');
        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({ type: 'EMPLOYEES_UPDATED' });
          bc.close();
        } catch {
          // ignore
        }
      } else {
        showToast(result.error?.message || 'Gagal memperbarui data karyawan');
      }
    } catch {
      showToast('Data karyawan diperbarui secara lokal');
    } finally {
      setIsSaving(false);
      setIsEditModalOpen(false);
    }
  };

  return (
    <AdminLayoutSkeleton onQuickAction={() => setIsEditModalOpen(true)}>
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white ml-2 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-5 max-w-[1440px] mx-auto pb-12">
        {/* =========================================================================
            1. BREADCRUMBS & TOP ACTIONS BAR (Identical to Stitch Screenshot)
        ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Left: Back button + Breadcrumb trail + ID Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/employees"
              className="w-9 h-9 rounded-xl border border-blue-200/80 bg-white text-blue-600 hover:bg-blue-50/80 flex items-center justify-center transition-all shadow-sm flex-shrink-0"
              title="Kembali ke Direktori Karyawan"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <Link
                  href="/admin/employees"
                  className="hover:text-blue-600 transition-colors"
                >
                  Direktori Karyawan
                </Link>
                <span>&gt;</span>
                <span className="text-slate-500">Detail Karyawan</span>
                <span>&gt;</span>
                <span className="font-semibold text-slate-800 truncate">
                  {profile.fullName}
                </span>
              </div>

              <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  ID: {profile.id}
                </span>
                <span className="text-[11px] text-slate-400">
                  Terakhir diperbarui: 18 Maret 2025, 14:20 WIB
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions (Unduh Rekap Profil + Ubah Data Karyawan + More) */}
          <div className="flex items-center gap-2.5 flex-shrink-0 relative">
            <button
              onClick={handleDownloadProfile}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Unduh Rekap Profil</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Ubah Data Karyawan</span>
            </button>

            {/* Dropdown More */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all shadow-sm"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      showToast('Kredensial SSO direset & dikirim ke email karyawan');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Reset Kredensial SSO
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      showToast('Surat Keterangan Kerja (Paklaring/Active) disiapkan');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Buat Surat Kerja
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      showToast('Audit log status mutasi dicatat');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    Mutasi / Promosi Jabatan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. HERO PROFILE CARD (Photo, Name, Grade, Role, Meta & Contacts)
        ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left: Avatar + Identity Info */}
            <div className="flex flex-col sm:flex-row items-start gap-5 min-w-0">
              {/* Avatar Photo Frame */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md flex-shrink-0 bg-slate-100 group">
                <img
                  src="/avatars/rian-pratama.jpg"
                  alt={profile.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to stylized initial if image missing
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[10px] text-white font-semibold">Ubah Foto</span>
                </div>
              </div>

              {/* Bio Details */}
              <div className="min-w-0 space-y-1.5">
                {/* Name + Status Badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
                    {profile.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {profile.statusType}
                  </span>
                </div>

                {/* Grade Badge */}
                <div>
                  <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-2.5 py-0.5 text-xs font-semibold">
                    {profile.grade}
                  </span>
                </div>

                {/* Role / Designation */}
                <div className="flex items-center gap-2 pt-0.5">
                  <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="font-bold text-slate-800 text-sm sm:text-base">
                    {profile.designation}
                  </span>
                </div>

                {/* Division & Department Tree */}
                <p className="text-xs text-slate-500 font-medium">
                  {profile.division} • {profile.department} • {profile.office}
                </p>

                {/* Meta details: Join Date, Tenure, Desk Location */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Bergabung: <strong className="text-slate-800">{profile.joinDate}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Masa Kerja: <strong className="text-slate-800">{profile.tenure}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Lokasi Meja: <strong className="text-slate-800">{profile.deskLocation}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Direct Pills */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0 lg:min-w-[240px]">
              {/* Email Pill */}
              <div
                onClick={() => copyToClipboard(profile.email, 'email')}
                className="group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60 text-blue-700 transition-all cursor-pointer shadow-sm"
                title="Klik untuk menyalin alamat email"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-mono font-medium truncate">
                    {profile.email}
                  </span>
                </div>
                {isCopiedEmail ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
              </div>

              {/* Phone / WhatsApp Pill */}
              <div
                onClick={() => copyToClipboard(profile.phone, 'phone')}
                className="group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60 text-emerald-700 transition-all cursor-pointer shadow-sm"
                title="Klik untuk menyalin nomor WhatsApp/Telepon"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-mono font-medium truncate">
                    {profile.phone}
                  </span>
                </div>
                {isCopiedPhone ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. SEGMENTED TABS (5 Modules: Identitas, Karir, Presensi, Gaji, Dokumen)
        ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-1.5 flex gap-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('identitas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'identitas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Informasi Pribadi & Kontak</span>
          </button>

          <button
            onClick={() => setActiveTab('karir')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'karir'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Pekerjaan & Jenjang Karir</span>
          </button>

          <button
            onClick={() => setActiveTab('presensi')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'presensi'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Presensi & Riwayat Waktu</span>
          </button>

          <button
            onClick={() => setActiveTab('kompensasi')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'kompensasi'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Gaji & Kompensasi</span>
            <Lock className="w-3 h-3 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveTab('dokumen')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dokumen'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Dokumen & Kontrak</span>
          </button>
        </div>

        {/* =========================================================================
            4. TAB CONTENT: INFORMASI PRIBADI & KONTAK (Active Screen in Stitch)
        ========================================================================= */}
        {activeTab === 'identitas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* -------------------------------------------------------------
                LEFT COLUMN: Identitas & Legalitas (5 cols)
            ------------------------------------------------------------- */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Identitas & Legalitas
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Terverifikasi Dukcapil
                  </span>
                </div>

                {/* Key-Value Records */}
                <div className="py-4 space-y-3.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">
                      Nomor Induk Kependudukan (NIK)
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {profile.nik}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">
                      Nomor Pokok Wajib Pajak (NPWP)
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {profile.npwp}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">
                      BPJS Ketenagakerjaan
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {profile.bpjsTk}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">
                      BPJS Kesehatan
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {profile.bpjsKes}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">
                      Tempat & Tanggal Lahir
                    </span>
                    <span className="font-semibold text-slate-800">
                      {profile.birthPlaceDate}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">
                      Jenis Kelamin / Gol. Darah
                    </span>
                    <span className="font-semibold text-slate-800">
                      {profile.genderBlood}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Agama</span>
                    <span className="font-semibold text-slate-800">
                      {profile.religion}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                    <span className="text-slate-500 font-medium">
                      Status Pajak & Tanggungan
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-slate-800 block">
                        {profile.taxStatus}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {profile.taxDependents}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Certificate Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>E-KTP & KK Tersertifikasi</span>
                <button
                  onClick={() => setPreviewDoc('KTP_Scan_RianPratama.pdf')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Lihat Berkas KTP
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------
                MIDDLE COLUMN: Struktur Garis Komando (4 cols)
            ------------------------------------------------------------- */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Struktur Garis Komando
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                  Matrix Org
                </span>
              </div>

              {/* Atasan Langsung (Direct Manager) */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                  ATASAN LANGSUNG (DIRECT MANAGER)
                </p>

                <div
                  onClick={() => showToast('Membuka profil atasan: Dewi Lestari, S.Psi')}
                  className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 flex items-center justify-between transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="/avatars/dewi-lestari.jpg"
                      alt="Dewi Lestari"
                      className="w-11 h-11 rounded-full object-cover border border-white shadow-sm flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        Dewi Lestari, S.Psi
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        VP of Engineering / HR Advisory
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        NIK: NX-2018012
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                </div>
              </div>

              {/* Anggota Tim Dibimbing (4 Engineers) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    ANGGOTA TIM DIBIMBING (4 ENGINEERS)
                  </p>
                  <button
                    onClick={() => showToast('Membuka bagan hierarki squad backend')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    Lihat Tim
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Engineer 1 */}
                  <div className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        FA
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          Fajar Anugrah
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Senior Go Backend
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* Engineer 2 */}
                  <div className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        TM
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          Tari Maulida
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Backend Developer
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* Engineer 3 */}
                  <div className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        BA
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          Bima Arya
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Infrastructure Engineer
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* Engineer 4 */}
                  <div className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        RS
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          Rian Setiawan (Jr.)
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          Junior Cloud Eng.
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                RIGHT COLUMN: Quick KPI & Metrics Widgets (3 cols)
            ------------------------------------------------------------- */}
            <div className="lg:col-span-3 space-y-4">
              {/* Widget 1: Skor KPI Kuartal Q4 2024 */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    SKOR KPI KUARTAL Q4 2024
                  </span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>

                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-bold text-slate-900">4.8</span>
                  <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                </div>

                <div className="mt-2.5">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <TrendingUp className="w-3 h-3" />
                    +0.3 poin dari Q3 (Exceeds Target)
                  </div>
                </div>

                {/* KPI Meter bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full w-[96%]" />
                </div>
              </div>

              {/* Widget 2: Saldo Cuti Tahunan 2025 */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    SALDO CUTI TAHUNAN 2025
                  </span>
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>

                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-bold text-slate-900">8</span>
                  <span className="text-xs font-semibold text-slate-500">
                    Hari Tersisa
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  Terpakai: <strong className="text-slate-800">4 hari</strong> | Kuota: <strong className="text-slate-800">12 hari</strong>
                </p>

                {/* Progress bar ratio */}
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden flex">
                  <div className="bg-amber-500 h-full w-[33%]" title="4 hari terpakai" />
                  <div className="bg-blue-600 h-full w-[67%]" title="8 hari tersisa" />
                </div>

                <p className="text-[10px] text-slate-400 mt-2.5">
                  Kedaluwarsa kuota: 31 Desember 2025
                </p>
              </div>

              {/* Widget 3: Tingkat Disiplin Presensi */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    TINGKAT DISIPLIN PRESENSI
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-slate-900">98.4%</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tepat Waktu
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  2 keterlambatan tercatat (Bulan ini)
                </p>

                {/* Attendance mini meter */}
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[98.4%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. TAB 2: PEKERJAAN & JENJANG KARIR
        ========================================================================= */}
        {activeTab === 'karir' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Riwayat Karir & Matriks Kompetensi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekam jejak promosi, perpindahan squad, dan evaluasi grade P1 hingga P5.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Jalur: Technical Specialist Track
              </span>
            </div>

            {/* Timeline progression */}
            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm" />
                <span className="text-[11px] font-mono font-bold text-blue-600">
                  Januari 2024 — Sekarang
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  Lead Backend Architect (Grade P5)
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Memimpin arsitektur sistem microservices Core Engine, standardisasi API gateway, dan mentoring 4 squad engineer.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-sm" />
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  Januari 2022 — Desember 2023
                </span>
                <h4 className="text-sm font-bold text-slate-800 mt-0.5">
                  Senior Backend Engineer (Grade P4)
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Mengembangkan pipeline asynchronous messaging dan optimasi query database transaksi berkapasitas 100k TPM.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm" />
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  Januari 2021 — Desember 2021
                </span>
                <h4 className="text-sm font-bold text-slate-700 mt-0.5">
                  Backend Engineer (Grade P3)
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Bergabung melalui program talent acquisition spesialis migrasi sistem monolitik ke modular NestJS.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            6. TAB 3: PRESENSI & RIWAYAT WAKTU
        ========================================================================= */}
        {activeTab === 'presensi' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Log Presensi & Kehadiran Bulan Ini (Maret 2025)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sinkronisasi mesin biometric tap-in / tap-out dan pelacakan jam lembur.
                </p>
              </div>
              <button
                onClick={() => showToast('Mengunduh rekap presensi bulan Maret...')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Rekap CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5">Tanggal</th>
                    <th className="py-2.5">Jam Masuk (Tap-In)</th>
                    <th className="py-2.5">Jam Keluar (Tap-Out)</th>
                    <th className="py-2.5">Total Jam Kerja</th>
                    <th className="py-2.5">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Senin, 24 Maret 2025</td>
                    <td className="py-3 font-mono text-emerald-600">08:48 WIB</td>
                    <td className="py-3 font-mono text-slate-400">— (Sedang Berjalan)</td>
                    <td className="py-3">Aktif di Kantor</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Tepat Waktu
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Jumat, 21 Maret 2025</td>
                    <td className="py-3 font-mono text-emerald-600">08:52 WIB</td>
                    <td className="py-3 font-mono text-slate-700">18:05 WIB</td>
                    <td className="py-3">9 Jam 13 Menit</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Hadir Lengkap
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Kamis, 20 Maret 2025</td>
                    <td className="py-3 font-mono text-amber-600">09:12 WIB</td>
                    <td className="py-3 font-mono text-slate-700">18:30 WIB</td>
                    <td className="py-3">9 Jam 18 Menit</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Telat 12 Menit
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. TAB 4: GAJI & KOMPENSASI (Terkunci dengan Otoritas HR)
        ========================================================================= */}
        {activeTab === 'kompensasi' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Struktur Gaji & Tunjangan (Privileged HR View)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Confidential
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Data dilindungi enkripsi AES-256 dan hanya dapat diakses oleh HR Operations Manager.
                </p>
              </div>
              <button
                onClick={() => setIsSalaryRevealed(!isSalaryRevealed)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
              >
                {isSalaryRevealed ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sembunyikan Nominal</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tampilkan Nominal</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Komponen Penghasilan */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-blue-700">
                  Komponen Penghasilan Kotor
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Gaji Pokok (Base Salary)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {isSalaryRevealed ? 'Rp 28.500.000' : '••••••••••••'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Tunjangan Jabatan Lead</span>
                  <span className="font-mono font-bold text-slate-900">
                    {isSalaryRevealed ? 'Rp 4.500.000' : '••••••••••••'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Tunjangan Keahlian & Cloud</span>
                  <span className="font-mono font-bold text-slate-900">
                    {isSalaryRevealed ? 'Rp 3.000.000' : '••••••••••••'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-blue-900">
                  <span>Total Gaji Kotor</span>
                  <span className="font-mono">
                    {isSalaryRevealed ? 'Rp 36.000.000' : '••••••••••••'}
                  </span>
                </div>
              </div>

              {/* Potongan Resmi */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] text-rose-700">
                  Potongan Wajib & Statutori
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">PPh 21 (Pajak Penghasilan)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {isSalaryRevealed ? 'Rp 2.450.000' : '••••••••••••'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">BPJS Ketenagakerjaan (3%)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {isSalaryRevealed ? 'Rp 540.000' : '••••••••••••'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">BPJS Kesehatan (1%)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {isSalaryRevealed ? 'Rp 180.000' : '••••••••••••'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-emerald-700">
                  <span>Estimasi Take Home Pay</span>
                  <span className="font-mono">
                    {isSalaryRevealed ? 'Rp 32.830.000' : '••••••••••••'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            8. TAB 5: DOKUMEN & KONTRAK
        ========================================================================= */}
        {activeTab === 'dokumen' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Arsip Dokumen Legal & Kontrak Karyawan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh dokumen tersimpan aman dan terenkripsi di cloud storage internal Nexora.
                </p>
              </div>
              <button
                onClick={() => showToast('Membuka dialog unggah berkas baru')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
              >
                + Unggah Dokumen Baru
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'Perjanjian Kerja PKWTT (Signed)',
                  type: 'PDF • 2.4 MB',
                  date: '14 Jan 2021',
                  file: 'Perjanjian_Kerja_PKWTT_RianPratama.pdf',
                },
                {
                  title: 'Salinan E-KTP Terverifikasi',
                  type: 'PDF • 1.1 MB',
                  date: '14 Jan 2021',
                  file: 'KTP_Scan_RianPratama.pdf',
                },
                {
                  title: 'NPWP Elektronik Resmi',
                  type: 'PDF • 850 KB',
                  date: '14 Jan 2021',
                  file: 'NPWP_Elektronik_Rian.pdf',
                },
                {
                  title: 'Ijazah S1 Ilmu Komputer',
                  type: 'PDF • 3.2 MB',
                  date: '10 Jan 2021',
                  file: 'Ijazah_S1_IlmuKomputer.pdf',
                },
                {
                  title: 'Sertifikasi AWS Solutions Architect',
                  type: 'PDF • 1.8 MB',
                  date: '20 Nov 2023',
                  file: 'AWS_SAP_Certification.pdf',
                },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{doc.type}</p>
                      <p className="text-[10px] text-slate-400">Diunggah: {doc.date}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      onClick={() => setPreviewDoc(doc.file)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Pratinjau
                    </button>
                    <button
                      onClick={() => showToast(`Mengunduh berkas: ${doc.file}`)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: UBAH DATA KARYAWAN
      ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Ubah Data Karyawan
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {profile.fullName} ({profile.id})
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="py-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) =>
                    setProfile({ ...profile, designation: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Grade Jabatan
                  </label>
                  <input
                    type="text"
                    value={profile.grade}
                    onChange={(e) =>
                      setProfile({ ...profile, grade: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Lokasi Meja Kerja
                  </label>
                  <input
                    type="text"
                    value={profile.deskLocation}
                    onChange={(e) =>
                      setProfile({ ...profile, deskLocation: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Email Kantor
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PRATINJAU DOKUMEN (PDF PREVIEW)
      ========================================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  Pratinjau Berkas Dokumen
                </h3>
                <p className="text-xs text-slate-500 font-mono truncate">
                  {previewDoc}
                </p>
              </div>
            </div>

            <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <FileText className="w-12 h-12 text-blue-600 mx-auto stroke-1" />
              <p className="text-xs font-semibold text-slate-700">
                Dokumen Resmi Terverifikasi Sistem HRIS
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Berkas telah ditandatangani secara digital dengan enkripsi SHA-256 dan siap digunakan untuk kebutuhan kepatuhan hukum tenaga kerja.
              </p>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  showToast(`Mengunduh ${previewDoc}`);
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Berkas
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
