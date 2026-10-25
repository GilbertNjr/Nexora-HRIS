'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import { PartnerBankSelect } from '@/components/common/PartnerBankSelect';
import {
  ChevronRight,
  Save,
  X,
  UserCheck,
  UserPlus,
  Calendar,
  Clock,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Trash2,
  Check,
  QrCode,
  Sparkles,
  Building2,
  CreditCard,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Send,
  FileText,
  Laptop,
  ChevronDown,
  RotateCcw,
  Camera,
  User,
} from 'lucide-react';

// Helper function to generate clean initial form data with dynamic NIP
const generateInitialNip = () => `NX-${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`;

const getBlankFormData = (autoId?: string) => ({
  fullName: '',
  nik: '',
  npwp: '',
  birthPlace: '',
  birthDate: '',
  gender: 'Laki-laki',
  ptkp: 'TK/0 - Tidak Kawin Tanpa Tanggungan',
  emailPersonal: '',
  emailCorporate: '',
  phone: '',
  address: '',
  department: 'Divisi Teknologi & Produk',
  directorate: 'Product Eng Directorate',
  role: '',
  contractType: 'PKWTT',
  employeeId: autoId || generateInitialNip(),
  reportingManager: '',
  startDate: new Date().toISOString().split('T')[0],
  workLocation: 'HQ SCBD Jakarta (Hybrid)',
  baseSalary: '',
  allowance: '',
  bankName: 'BCA',
  bankAccount: '',
  bpjsTk: '',
  bpjsKes: '',
  essRole: 'Karyawan Mandiri (ESS)',
  avatarUrl: '',
});

// High quality sample data for 1-click Demo Fill
const DEMO_SAMPLE_DATA = {
  fullName: 'Raden Aria Pratama, S.Kom.',
  nik: '3174092408960003',
  npwp: '3174.0924.0896.0003',
  birthPlace: 'Jakarta Selatan',
  birthDate: '1996-08-24',
  gender: 'Laki-laki',
  ptkp: 'TK/0 - Tidak Kawin Tanpa Tanggungan',
  emailPersonal: 'aria.pratama@gmail.com',
  emailCorporate: 'aria.pratama@nexora.co.id',
  phone: '+62 812-8899-7766',
  address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
  department: 'Divisi Teknologi & Produk',
  directorate: 'Product Eng Directorate',
  role: 'Sr. Cloud Backend Engineer',
  contractType: 'PKWTT',
  employeeId: 'NX-2026089',
  reportingManager: 'Rian Pratama, S.Kom (Lead Architect)',
  startDate: '2026-04-01',
  workLocation: 'HQ SCBD Jakarta (Hybrid)',
  baseSalary: '24000000',
  allowance: '4000000',
  bankName: 'BCA',
  bankAccount: '8820491823',
  bpjsTk: '00012984920',
  bpjsKes: '00092837411',
  essRole: 'Karyawan Mandiri (ESS)',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
};

const DEMO_PHOTO_PREVIEW =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400';

export default function AdminQuickEntryPage() {
  // Navigation & Sub-Tabs in Quick Entry Center
  const [activeTab, setActiveTab] = useState<
    'employee' | 'leave' | 'requisition' | 'overtime' | 'disciplinary'
  >('employee');

  // Step wizard for Employee Registration
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State - Employee Registration (Professional Blank Default)
  const [formData, setFormData] = useState(getBlankFormData());

  // Photo preview state (Starts empty by default)
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1-Click Demo Auto Fill
  const handleLoadDemoData = () => {
    setFormData({ ...DEMO_SAMPLE_DATA });
    setPhotoPreview(DEMO_PHOTO_PREVIEW);
    showToast('Data contoh demo berhasil dimuat otomatis!', 'info');
  };

  // Reset / Clear Form Back to Blank
  const handleResetForm = () => {
    setFormData(getBlankFormData());
    setPhotoPreview('');
    setCurrentStep(1);
    showToast('Formulir berhasil dikosongkan untuk pendaftaran baru.', 'info');
  };

  // Generate Fresh NIP
  const handleGenerateNewNip = () => {
    const freshNip = generateInitialNip();
    setFormData((prev) => ({ ...prev, employeeId: freshNip }));
    showToast(`NIP baru dihasilkan: ${freshNip}`, 'info');
  };

  // Smart Name Input with Corporate Email Auto-Suggest
  const handleFullNameChange = (name: string) => {
    setFormData((prev) => {
      const cleanWords = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);

      const suggestedEmail =
        cleanWords.length > 0 ? `${cleanWords.slice(0, 2).join('.')}@nexora.co.id` : '';

      // Only auto-suggest corporate email if it is currently empty or was previously auto-suggested
      const shouldUpdateEmail =
        !prev.emailCorporate || prev.emailCorporate.endsWith('@nexora.co.id');

      return {
        ...prev,
        fullName: name,
        emailCorporate: shouldUpdateEmail && suggestedEmail ? suggestedEmail : prev.emailCorporate,
      };
    });
  };

  // Completion percentage calculation
  const completionPercent = useMemo(() => {
    let score = 0;
    if (formData.fullName.trim()) score += 20;
    if (formData.nik.trim().length === 16) score += 15;
    if (formData.emailCorporate.trim()) score += 15;
    if (formData.role.trim() && formData.department) score += 25;
    if (formData.baseSalary && formData.bankAccount.trim()) score += 15;
    if (photoPreview) score += 10;
    return Math.min(100, score);
  }, [formData, photoPreview]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoPreview(uploadEvent.target.result as string);
          showToast('Pasfoto resmi karyawan berhasil diunggah!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Router for navigation
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Final Submit to Real Backend API
  const handleKirimDanAktifkan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.emailCorporate) {
      showToast('Nama Lengkap dan Email Korporat wajib diisi.', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Karyawan';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        firstName,
        lastName,
        fullName: formData.fullName.trim(),
        email: formData.emailCorporate.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: formData.department,
        designation: formData.role,
        division: formData.directorate || 'Divisi Rekayasa & Arsitektur Cloud',
        employmentType: formData.contractType === 'PKWTT' ? 'PERMANENT' : 'CONTRACT_PKWT',
        employeeNumber: formData.employeeId.trim(),
        joinDate: formData.startDate || new Date().toISOString().split('T')[0],
        nik: formData.nik.trim(),
        npwp: formData.npwp.trim(),
        birthPlaceDate: `${formData.birthPlace}, ${formData.birthDate}`,
        genderBlood: `${formData.gender} / O (+)`,
        taxStatus: formData.ptkp,
        bankName: formData.bankName,
        accountNumber: formData.bankAccount,
        accountHolder: formData.fullName.trim(),
        basicSalary: Number(formData.baseSalary) || 20000000,
        transportAllowance: Number(formData.allowance) || 3000000,
        mealAllowance: 1500000,
        bpjsTk: formData.bpjsTk,
        bpjsKes: formData.bpjsKes,
        avatarUrl: photoPreview || formData.avatarUrl,
        office: formData.workLocation,
      };

      const res = await fetch('/api/v1/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData?.error?.message || 'Gagal menyimpan data karyawan baru.');
      }

      // Broadcast on BroadcastChannel so Kelola Data Karyawan (Gambar 2) and other tabs refresh immediately
      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({
          type: 'EMPLOYEE_CREATED',
          employee: resData.data,
          time: Date.now(),
        });
        ch.close();
      } catch {}

      showToast(
        `✓ Akun ${formData.fullName} (${formData.employeeId}) berhasil didaftarkan ke Database & Aktif di Portal! Mengalihkan ke direktori...`,
        'success'
      );

      // Smooth redirect to Kelola Data Karyawan (Gambar 2) so user can see it in the master table
      setTimeout(() => {
        router.push('/admin/employees');
      }, 1500);
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat mendaftarkan karyawan.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Draft
  const handleSaveDraft = () => {
    const draftPayload = JSON.stringify(formData, null, 2);
    const blob = new Blob([draftPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Draft_Karyawan_${formData.employeeId}.draft`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Draf formulir karyawan berhasil disimpan (.draft)');
  };

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Operasional</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Pusat Entri Data Baru</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Pusat Tambah Data &amp; Formulir Cepat HR
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Entri instan data karyawan onboarding, delegasi cuti mendesak, penerbitan SPL lembur,
              hingga pembukaan lowongan terintegrasi.
            </p>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Isi Data Contoh (Demo) */}
            <button
              type="button"
              onClick={handleLoadDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 shadow-xs transition-all cursor-pointer"
              title="Isi otomatis seluruh kolom formulir dengan data contoh untuk simulasi demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Isi Data Contoh (Demo)</span>
            </button>

            {/* Kosongkan Form */}
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs transition-all cursor-pointer"
              title="Bersihkan semua input kembali kosong"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Kosongkan Form</span>
            </button>

            {/* Simpan Draf (.draft) */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Simpan Draf (.draft)</span>
            </button>

            {/* Batal */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs transition-all"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Batal</span>
            </Link>

            {/* Kirim & Aktifkan Akun */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleKirimDanAktifkan}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                  <span>Mendaftarkan ke Database...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-white" />
                  <span>Kirim &amp; Aktifkan Akun</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5 Main Entry Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Tab 1: Registrasi Karyawan Baru (Active) */}
          <button
            type="button"
            onClick={() => setActiveTab('employee')}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'employee'
                ? 'bg-[#1D4ED8] text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTab === 'employee' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold truncate">Registrasi Karyawan Baru</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                  activeTab === 'employee' ? 'bg-blue-900/60 text-blue-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                Utama
              </span>
            </div>
          </button>

          {/* Tab 2: Cuti & Izin Mandat HR */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('leave');
              showToast('Membuka formulir delegasi Cuti & Izin Mandat HR');
            }}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'leave'
                ? 'bg-[#1D4ED8] text-white border-blue-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTab === 'leave' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold block truncate">Cuti &amp; Izin Mandat HR</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-blue-200/60">
                14 Pending
              </span>
            </div>
          </button>

          {/* Tab 3: Requisition Rekrutmen */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('requisition');
              showToast('Membuka formulir Requisition Rekrutmen Headcount');
            }}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'requisition'
                ? 'bg-[#1D4ED8] text-white border-blue-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTab === 'requisition' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold block truncate">Requisition Rekrutmen</span>
              <span className="text-[10px] text-slate-400">Headcount Baru</span>
            </div>
          </button>

          {/* Tab 4: Surat Perintah Lembur (SPL) */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('overtime');
              showToast('Membuka formulir Surat Perintah Lembur (SPL)');
            }}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'overtime'
                ? 'bg-[#1D4ED8] text-white border-blue-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTab === 'overtime' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold block truncate">Surat Perintah Lembur (SPL)</span>
              <span className="text-[10px] text-slate-400">Otorisasi HR</span>
            </div>
          </button>

          {/* Tab 5: Penerbitan SP / Konseling */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('disciplinary');
              showToast('Membuka formulir Surat Peringatan & Konseling');
            }}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 'disciplinary'
                ? 'bg-[#1D4ED8] text-white border-blue-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTab === 'disciplinary' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold block truncate">Penerbitan SP / Konseling</span>
              <span className="text-[10px] text-slate-400">Tindakan Disiplin</span>
            </div>
          </button>
        </div>

        {/* Step Wizard Bar (Under Tabs) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep >= 1 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                1
              </div>
              <div>
                <p className={`text-xs font-bold ${currentStep === 1 ? 'text-[#1D4ED8]' : 'text-slate-800'}`}>
                  Identitas Pribadi
                </p>
                <p className="text-[11px] text-slate-400">Data KTP &amp; Profil</p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep >= 2 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <div>
                <p className={`text-xs font-bold ${currentStep === 2 ? 'text-[#1D4ED8]' : 'text-slate-800'}`}>
                  Jabatan &amp; Unit
                </p>
                <p className="text-[11px] text-slate-400">Posisi &amp; Atasan</p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep >= 3 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </div>
              <div>
                <p className={`text-xs font-bold ${currentStep === 3 ? 'text-[#1D4ED8]' : 'text-slate-800'}`}>
                  Payroll &amp; BPJS
                </p>
                <p className="text-[11px] text-slate-400">Gaji &amp; Benefit</p>
              </div>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep >= 4 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                4
              </div>
              <div>
                <p className={`text-xs font-bold ${currentStep === 4 ? 'text-[#1D4ED8]' : 'text-slate-800'}`}>
                  Akses Akun ESS
                </p>
                <p className="text-[11px] text-slate-400">Aktivasi Portal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Main Form Left, Cards Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: The Primary Form (8 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: Identitas Pribadi */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      1. Pasfoto &amp; Berkas Identitas KTP
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                    Wajib Lengkap
                  </span>
                </div>

                {/* Photo Upload Container */}
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 flex flex-col sm:flex-row items-center gap-5">
                  {/* Photo Preview Container */}
                  <div className="w-24 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 sm:border-solid sm:border-white shadow-sm overflow-hidden flex-shrink-0 relative group flex items-center justify-center">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Pasfoto Karyawan"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-50 text-slate-400">
                        <Camera className="w-6 h-6 mb-1 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">Pasfoto 3:4</span>
                        <span className="text-[9px] text-slate-400">Belum ada foto</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & Description */}
                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{photoPreview ? 'Ganti Foto Resmi' : 'Unggah Foto Resmi'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview('');
                            showToast('Foto karyawan berhasil dihapus');
                          }}
                          className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
                      Format yang didukung: JPG, PNG, atau WEBP. Maksimal 3 MB dengan rasio 3:4 latar
                      belakang polos untuk cetak otomatis ID Card.
                    </p>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Nama Lengkap (sesuai Ijazah / KTP) *
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Cantumkan gelar akademis jika relevan
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      placeholder="Contoh: Raden Aria Pratama, S.Kom."
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* NIK & NPWP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Nomor Induk Kependudukan (NIK) *
                        </label>
                        {formData.nik.trim().length === 16 ? (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            16 Digit Valid
                          </span>
                        ) : formData.nik.trim().length > 0 ? (
                          <span className="text-[11px] font-semibold text-amber-600">
                            {formData.nik.trim().length}/16 Digit
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">16 digit KTP</span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          maxLength={16}
                          value={formData.nik}
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                          placeholder="Masukkan 16 digit NIK KTP"
                          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        {formData.nik.trim().length === 16 && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 pointer-events-none" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        NPWP 16 Digit (Format Baru)
                      </label>
                      <input
                        type="text"
                        value={formData.npwp}
                        onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                        placeholder="Contoh: 3174.0924.0896.0003"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Tempat Lahir & Tanggal Lahir */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        value={formData.birthPlace}
                        onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                        placeholder="Contoh: Jakarta Selatan"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tanggal Lahir
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Jenis Kelamin & PTKP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Jenis Kelamin *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Status Pajak &amp; Tanggungan (PTKP)
                      </label>
                      <select
                        value={formData.ptkp}
                        onChange={(e) => setFormData({ ...formData, ptkp: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="TK/0 - Tidak Kawin Tanpa Tanggungan">
                          TK/0 - Tidak Kawin Tanpa Tanggungan
                        </option>
                        <option value="K/0 - Kawin Tanpa Tanggungan">
                          K/0 - Kawin Tanpa Tanggungan
                        </option>
                        <option value="K/1 - Kawin 1 Tanggungan">K/1 - Kawin 1 Tanggungan</option>
                        <option value="K/2 - Kawin 2 Tanggungan">K/2 - Kawin 2 Tanggungan</option>
                        <option value="K/3 - Kawin 3 Tanggungan">K/3 - Kawin 3 Tanggungan</option>
                      </select>
                    </div>
                  </div>

                  {/* Alamat KTP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Alamat Kependudukan (Sesuai KTP)
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Contoh: Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Form Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    <span>Lanjut: Jabatan &amp; Unit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Jabatan & Unit */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      2. Struktur Organisasi &amp; Detail Penugasan
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                    Langkah 2 dari 4
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Divisi / Direktorat *
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Divisi Teknologi & Produk">Divisi Teknologi &amp; Produk</option>
                        <option value="Divisi Operasional & Logistik">Divisi Operasional &amp; Logistik</option>
                        <option value="Divisi Keuangan & Akuntansi">Divisi Keuangan &amp; Akuntansi</option>
                        <option value="Divisi SDM & People Operations">Divisi SDM &amp; People Operations</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Posisi / Jabatan Pekerjaan *
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Contoh: Sr. Cloud Backend Engineer"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Status Ketenagakerjaan *
                      </label>
                      <select
                        value={formData.contractType}
                        onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="PKWTT">PKWTT (Karyawan Tetap)</option>
                        <option value="PKWT">PKWT (Karyawan Kontrak)</option>
                        <option value="Magang">Magang / Internship</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Nomor Induk Karyawan (NIK Internal)
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateNewNip}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          title="Generate NIP baru otomatis"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Acak NIP</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        placeholder="Contoh: NX-2026101"
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Atasan Langsung (Reporting Manager)
                      </label>
                      <input
                        type="text"
                        value={formData.reportingManager}
                        onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                        placeholder="Contoh: Rian Pratama, S.Kom (Lead Architect)"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tanggal Mulai Bergabung (Join Date)
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Lokasi Kantor Penempatan Utama
                    </label>
                    <input
                      type="text"
                      value={formData.workLocation}
                      onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                      placeholder="Contoh: HQ SCBD Jakarta (Hybrid)"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <span>Lanjut: Payroll &amp; BPJS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payroll & BPJS */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      3. Kompensasi, Bank Payroll &amp; Jaminan Sosial BPJS
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                    Langkah 3 dari 4
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Gaji Pokok Bulanan (IDR) *
                      </label>
                      <input
                        type="number"
                        value={formData.baseSalary}
                        onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                        placeholder="Contoh: 15000000"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tunjangan Tetap &amp; Operasional (IDR)
                      </label>
                      <input
                        type="number"
                        value={formData.allowance}
                        onChange={(e) => setFormData({ ...formData, allowance: e.target.value })}
                        placeholder="Contoh: 3000000"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <PartnerBankSelect
                        value={formData.bankName}
                        onChange={(bankName) => setFormData({ ...formData, bankName })}
                        label="Nama Bank Penyalur Payroll"
                        showPills={true}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Rekening Bank *
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value.replace(/\D/g, '') })}
                        placeholder="Nomor rekening tanpa spasi"
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        No. BPJS Ketenagakerjaan (KPJ)
                      </label>
                      <input
                        type="text"
                        value={formData.bpjsTk}
                        onChange={(e) => setFormData({ ...formData, bpjsTk: e.target.value.replace(/\D/g, '') })}
                        placeholder="Contoh: 00012984920 (11 digit)"
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        No. BPJS Kesehatan (13 Digit)
                      </label>
                      <input
                        type="text"
                        value={formData.bpjsKes}
                        onChange={(e) => setFormData({ ...formData, bpjsKes: e.target.value.replace(/\D/g, '') })}
                        placeholder="Contoh: 00092837411 (13 digit)"
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <span>Lanjut: Akses Akun ESS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Akses Akun ESS */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      4. Kredensial SSO &amp; Aktivasi Akun Portal Mandiri (ESS)
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                    Langkah Terakhir
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Korporat Resmi (Google Workspace SSO) *
                    </label>
                    <input
                      type="email"
                      value={formData.emailCorporate}
                      onChange={(e) => setFormData({ ...formData, emailCorporate: e.target.value })}
                      placeholder="Contoh: nama.karyawan@nexora.co.id"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Kredensial dan instruksi aktivasi 2FA akan dikirimkan otomatis ke email ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tingkat Izin Hak Akses (Role)
                      </label>
                      <select
                        value={formData.essRole}
                        onChange={(e) => setFormData({ ...formData, essRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="Karyawan Mandiri (ESS)">Karyawan Mandiri (ESS Portal)</option>
                        <option value="Department Head / Reviewer">Department Head / Reviewer</option>
                        <option value="HR Operations Staff">HR Operations Staff</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nomor Handphone WhatsApp (OTP)
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Contoh: +62 812-8899-7766"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800">
                      Ringkasan Aktivasi Otomatis:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      <li>Akun profil terdaftar di Direktori Karyawan perusahaan.</li>
                      <li>Smart Badge RFID aktif untuk akses pintu masuk dan presensi biometrik.</li>
                      <li>Karyawan menerima email sambutan &amp; tautan pengisian data mandiri.</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleKirimDanAktifkan}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shadow-xs disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mendaftarkan ke Database...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Simpan &amp; Aktifkan Akun Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Validasi & Pratinjau ID Badge (4 cols on lg) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* Card 1: Validasi Kelengkapan */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Validasi Kelengkapan
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-lg">
                  {completionPercent}% Siap
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-3 pt-1 text-xs">
                {/* 1. NIK KTP Valid */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      formData.nik.trim().length === 16
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    {formData.nik.trim().length === 16 && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <p
                      className={`font-bold leading-tight ${
                        formData.nik.trim().length === 16 ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      Format NIK KTP {formData.nik.trim().length === 16 ? 'Valid' : '(16 Digit)'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formData.nik.trim().length > 0
                        ? `${formData.nik.trim().length}/16 digit terisi`
                        : '16 digit sinkron dengan database Dukcapil'}
                    </p>
                  </div>
                </div>

                {/* 2. Email Belum Terdaftar */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      formData.emailCorporate.trim().includes('@')
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    {formData.emailCorporate.trim().includes('@') && <Check className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <p
                      className={`font-bold leading-tight ${
                        formData.emailCorporate.trim().includes('@') ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      Alamat Email Korporat
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {formData.emailCorporate.trim()
                        ? `${formData.emailCorporate.trim()} siap didaftarkan`
                        : 'Gunakan email resmi @nexora.co.id'}
                    </p>
                  </div>
                </div>

                {/* 3. Siklus Cut-Off Payroll */}
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">Siklus Cut-Off Payroll Sesuai</p>
                    <p className="text-[11px] text-slate-400">
                      Mulai {formData.startDate || 'tanggal bergabung'} terhitung otomatis
                    </p>
                  </div>
                </div>

                {/* 4. Rekening Bank & BPJS */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      formData.bankAccount.trim() && formData.bpjsTk.trim()
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    {formData.bankAccount.trim() && formData.bpjsTk.trim() && (
                      <Check className="w-2.5 h-2.5" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-bold leading-tight ${
                        formData.bankAccount.trim() && formData.bpjsTk.trim()
                          ? 'text-slate-900'
                          : 'text-slate-600'
                      }`}
                    >
                      Nomor Rekening Bank &amp; BPJS
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formData.bankAccount.trim() && formData.bpjsTk.trim()
                        ? 'Rekening & kartu BPJS terkonfirmasi'
                        : 'Diperlukan di Langkah ke-3'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Pratinjau Nexora Smart Badge */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  PRATINJAU NEXORA SMART BADGE
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Auto-Sync
                </span>
              </div>

              {/* Digital Smart Badge Card Graphic */}
              <div className="rounded-2xl bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#0F172A] p-5 text-white shadow-xl relative overflow-hidden space-y-4">
                {/* Background decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

                {/* Card Top: Logo & PKWTT pill */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                      N
                    </div>
                    <span className="text-xs font-bold tracking-tight">Nexora HRIS</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white backdrop-blur-xs">
                    {formData.contractType || 'PKWTT'}
                  </span>
                </div>

                {/* Card Middle: Photo + Info */}
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-14 h-16 rounded-xl bg-white/10 border-2 border-white/60 overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/10 text-white">
                        {formData.fullName.trim() ? (
                          <span className="text-base font-extrabold tracking-wider">
                            {formData.fullName
                              .trim()
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        ) : (
                          <User className="w-6 h-6 text-white/50" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-bold truncate leading-tight ${
                        formData.fullName.trim() ? 'text-white' : 'text-white/60 italic'
                      }`}
                    >
                      {formData.fullName.trim() || 'Nama Lengkap Karyawan'}
                    </h4>
                    <p
                      className={`text-[11px] truncate mt-0.5 font-medium ${
                        formData.role.trim() ? 'text-blue-200' : 'text-blue-200/60 italic'
                      }`}
                    >
                      {formData.role.trim() || 'Posisi / Jabatan'}
                    </p>
                    <p className="text-[10px] text-slate-300 truncate font-normal">
                      {formData.directorate.trim() || formData.department || 'Direktorat / Divisi'}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: NIK & QR Code */}
                <div className="pt-2 border-t border-white/20 flex items-end justify-between relative z-10">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
                      NOMOR INDUK KARYAWAN
                    </p>
                    <p className="text-xs font-bold font-mono tracking-wider text-white mt-0.5">
                      {formData.employeeId.trim() || 'NX-OTOMATIS'}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shadow-xs">
                    <QrCode className="w-7 h-7 text-slate-900" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
                QR Code ini akan otomatis terhubung ke sistem mesin absensi IoT dan akses gerbang
                kartu RFID kantor pusat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutSkeleton>
  );
}
