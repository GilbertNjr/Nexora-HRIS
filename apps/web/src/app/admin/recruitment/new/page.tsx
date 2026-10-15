'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  ChevronRight,
  ArrowLeft,
  Briefcase,
  Lock,
  Building2,
  Users,
  MapPin,
  Banknote,
  FileText,
  Calendar,
  CheckCircle2,
  Eye,
  Send,
  Save,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Share2,
  Tag,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  ExternalLink,
} from 'lucide-react';

export default function NewJobRequisitionPage() {
  // Navigation / Stepper State
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: 'Senior Cloud Platform Engineer',
    requisitionCode: 'REQ-2025-094',
    department: 'Divisi Teknologi & Rekayasa Produk',
    seniority: 'Senior Specialist / Lead (4-7 Thn)',
    targetQuota: 2,
    contractType: 'PKWTT' as 'PKWTT' | 'PKWT' | 'Magang',
    workLocation: 'Jakarta Sudirman (Head Office)',
    workModel: 'Hybrid (3 Hari WFO / 2 Hari WFH)',
    salaryMin: 22000000,
    salaryMax: 30000000,
    showSalaryPublic: true,
    deadlineDate: '2025-04-30',
    targetOnboardDate: '2025-06-01',
    jobDescription:
      'Kami mencari Senior Cloud Platform Engineer yang berpengalaman untuk memimpin orkestrasi infrastruktur multi-cloud (AWS & GCP), implementasi arsitektur microservices berbasis Kubernetes, serta mengautomasi CI/CD pipeline yang tangguh dan aman guna mendukung operasional platform ERP Nexora Enterprise.',
    responsibilities: [
      'Merancang, membangun, dan memelihara arsitektur cloud terdistribusi dengan ketersediaan tinggi (99.99% SLA).',
      'Mengelola kluster Kubernetes skala produksi dan menerapkan praktik Infrastructure as Code (IaC) dengan Terraform.',
      'Memperkuat keamanan cloud, compliance ISO 27001, serta optimasi biaya komputasi (FinOps).',
      'Membimbing tim junior engineer dalam implementasi best practice DevOps dan observabilitas modern.',
    ],
    skills: ['AWS Cloud', 'Kubernetes (K8s)', 'Terraform IaC', 'Golang / Python', 'Docker', 'CI/CD GitLab', 'Datadog'],
    hiringManager: 'Ir. Andi Wijaya, M.Kom (CTO)',
    recruiter: 'Jessica Wulandari (Lead Talent Acquisition)',
    channels: {
      portalNexora: true,
      linkedin: true,
      jobstreet: true,
      glints: true,
      kalibrr: false,
    },
  });

  // State for adding skill tag
  const [newSkillInput, setNewSkillInput] = useState('');

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!formData.skills.includes(newSkillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkillInput.trim()],
      });
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSaveDraft = () => {
    showToast('Draf formulir pembukaan lowongan berhasil disimpan.');
  };

  const handlePublishJob = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      showToast('Lowongan berhasil dipublikasikan ke Portal Karir & kanal mitra!');
    }, 1200);
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
        {/* Breadcrumb Navigation matching screenshot */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Operasional</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin/recruitment" className="hover:text-blue-600 transition-colors">
            Rekrutmen &amp; Onboarding
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-blue-600 font-semibold">Buka Lowongan Baru</span>
        </nav>

        {/* Page Header Section matching screenshot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100 shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Buat &amp; Publikasikan Lowongan Kerja Baru
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Formulir pembukaan formasi kerja (Job Requisition), konfigurasi kriteria seleksi ATS,
                persetujuan anggaran manajerial, dan integrasi kanal publikasi karir.
              </p>
            </div>
          </div>

          {/* Action Buttons Top Right matching screenshot */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Kembali ke Pipeline */}
            <Link
              href="/admin/recruitment"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Kembali ke Pipeline</span>
            </Link>

            {/* Simpan Draf */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Simpan Draf</span>
            </button>

            {/* Publikasikan Lowongan */}
            <button
              type="button"
              onClick={handlePublishJob}
              disabled={isPublishing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>{isPublishing ? 'Mempublikasikan...' : 'Publikasikan Lowongan'}</span>
            </button>
          </div>
        </div>

        {/* 4 Tahap Stepper Wizard matching screenshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Tahap 1: Detail Formasi */}
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 1
                ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeTab === 1 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              1
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                TAHAP 1
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Detail Formasi &amp; Org...</p>
            </div>
          </button>

          {/* Tahap 2: Kualifikasi */}
          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 2
                ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeTab === 2 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                TAHAP 2
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Kualifikasi &amp; Uji Komp...</p>
            </div>
          </button>

          {/* Tahap 3: Alur Seleksi */}
          <button
            type="button"
            onClick={() => setActiveTab(3)}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 3
                ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeTab === 3 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              3
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                TAHAP 3
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Alur Seleksi &amp; Angga...</p>
            </div>
          </button>

          {/* Tahap 4: Kanal & Otorisasi */}
          <button
            type="button"
            onClick={() => setActiveTab(4)}
            className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left border ${
              activeTab === 4
                ? 'bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                activeTab === 4 ? 'bg-[#1D4ED8] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              4
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                TAHAP 4
              </span>
              <p className="text-xs font-bold text-slate-900 truncate">Kanal &amp; Otorisasi Dir...</p>
            </div>
          </button>
        </div>

        {/* Main Content Layout: Form Left (~65%) and Live Preview Right (~35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Main Multi-Step Form                         */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Informasi Posisi & Struktur Organisasi matching screenshot */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      1. Informasi Posisi &amp; Struktur Organisasi
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tentukan nama peran, divisi penempatan, serta status hubungan kerja formal.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Formasi Sah</span>
                </span>
              </div>

              {/* Form Fields: Row 1 - Nama Jabatan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nama Jabatan / Posisi Kerja <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Senior Cloud Platform Engineer"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Form Fields: Row 2 - Kode Requisition & Departemen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Kode Requisition (ID Otomatis)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={formData.requisitionCode}
                      className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed pr-9"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Departemen / Divisi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Divisi Teknologi & Rekayasa Produk">
                        Divisi Teknologi &amp; Rekayasa Produk
                      </option>
                      <option value="Divisi Keuangan & Akuntansi">Divisi Keuangan &amp; Akuntansi</option>
                      <option value="Divisi SDM & Operasional">Divisi SDM &amp; Operasional</option>
                      <option value="Divisi Pemasaran & Sales">Divisi Pemasaran &amp; Sales</option>
                      <option value="Divisi Legal & Compliance">Divisi Legal &amp; Compliance</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Form Fields: Row 3 - Jenjang Karir & Target Kuota */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Jenjang Karir / Senioritas
                  </label>
                  <div className="relative">
                    <select
                      value={formData.seniority}
                      onChange={(e) => setFormData({ ...formData, seniority: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Entry Level / Junior (0-2 Thn)">Entry Level / Junior (0-2 Thn)</option>
                      <option value="Mid-Level Specialist (2-4 Thn)">Mid-Level Specialist (2-4 Thn)</option>
                      <option value="Senior Specialist / Lead (4-7 Thn)">
                        Senior Specialist / Lead (4-7 Thn)
                      </option>
                      <option value="Managerial / Principal (7+ Thn)">
                        Managerial / Principal (7+ Thn)
                      </option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Target Kuota Formasi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.targetQuota}
                      onChange={(e) => setFormData({ ...formData, targetQuota: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-xs text-slate-400 font-medium absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      Kandidat
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Fields: Row 4 - Tipe Hubungan Kerja (3 Radio Cards) matching screenshot */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Tipe Hubungan Kerja (Kontrak Organisasi)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* PKWTT */}
                  <label
                    onClick={() => setFormData({ ...formData, contractType: 'PKWTT' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.contractType === 'PKWTT'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-700">PKWTT</span>
                      <input
                        type="radio"
                        name="contractType"
                        checked={formData.contractType === 'PKWTT'}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-900">Karyawan Tetap Penuh</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Masa percobaan 3 bulan dengan pagu benefit utuh.
                      </p>
                    </div>
                  </label>

                  {/* PKWT */}
                  <label
                    onClick={() => setFormData({ ...formData, contractType: 'PKWT' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.contractType === 'PKWT'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700">PKWT</span>
                      <input
                        type="radio"
                        name="contractType"
                        checked={formData.contractType === 'PKWT'}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-900">Perjanjian Kontrak Waktu</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Durasi perjanjian 12 - 24 bulan per project milestone.
                      </p>
                    </div>
                  </label>

                  {/* Magang / Kampus */}
                  <label
                    onClick={() => setFormData({ ...formData, contractType: 'Magang' })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      formData.contractType === 'Magang'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-700">Magang / Kampus</span>
                      <input
                        type="radio"
                        name="contractType"
                        checked={formData.contractType === 'Magang'}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-900">Internship Talent Pool</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Durasi 6 bulan dengan sertifikasi kemitraan resmi.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ========================================================= */}
              {/* CONTINUATION OF CUT OFF SECTION: Lokasi, Gaji, Deskripsi */}
              {/* ========================================================= */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                {/* Lokasi & Kebijakan Remote */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Lokasi Penempatan Kantor</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.workLocation}
                        onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Model Kebijakan Kerja</label>
                    <div className="relative">
                      <select
                        value={formData.workModel}
                        onChange={(e) => setFormData({ ...formData, workModel: e.target.value })}
                        className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 pr-9 cursor-pointer"
                      >
                        <option value="Hybrid (3 Hari WFO / 2 Hari WFH)">Hybrid (3 Hari WFO / 2 Hari WFH)</option>
                        <option value="WFO Penuh (On-site Jakarta)">WFO Penuh (On-site Sudirman)</option>
                        <option value="Remote Penuh (Work From Anywhere)">Remote Penuh (WFA Indonesia)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Rentang Gaji (Salary Band) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Pagu Rentang Gaji Bulanan (Gross IDR)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showSalaryPublic}
                        onChange={(e) => setFormData({ ...formData, showSalaryPublic: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] font-semibold text-slate-600">
                        Tampilkan Rentang Gaji di Portal Publik
                      </span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="text-xs text-slate-400 font-bold absolute left-3.5 top-1/2 -translate-y-1/2">
                        Min: Rp
                      </span>
                      <input
                        type="number"
                        step={1000000}
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                        className="w-full pl-16 pr-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                    <div className="relative">
                      <span className="text-xs text-slate-400 font-bold absolute left-3.5 top-1/2 -translate-y-1/2">
                        Maks: Rp
                      </span>
                      <input
                        type="number"
                        step={1000000}
                        value={formData.salaryMax}
                        onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                        className="w-full pl-16 pr-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Target Penutupan & Onboarding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Batas Waktu Lamaran (Closing Date)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={formData.deadlineDate}
                        onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Target Hari Pertama Onboard</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={formData.targetOnboardDate}
                        onChange={(e) => setFormData({ ...formData, targetOnboardDate: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Deskripsi Pekerjaan */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Ringkasan Gambaran Peran (Job Description)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-normal leading-relaxed rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Kualifikasi & Skill Tags */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Tag Kualifikasi &amp; Keahlian Teknis (ATS Keyword Matcher)
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                      >
                        <Tag className="w-3 h-3 text-blue-600" />
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-600 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="text"
                        placeholder="Tambah skill..."
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kanal Distribusi Karir */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Kanal Publikasi Lowongan (Otomatisasi Multi-Channel)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.channels.portalNexora}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            channels: { ...formData.channels, portalNexora: e.target.checked },
                          })
                        }
                        className="w-3.5 h-3.5 rounded text-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-800">Portal Karir Nexora</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.channels.linkedin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            channels: { ...formData.channels, linkedin: e.target.checked },
                          })
                        }
                        className="w-3.5 h-3.5 rounded text-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-800">LinkedIn Jobs</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.channels.jobstreet}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            channels: { ...formData.channels, jobstreet: e.target.checked },
                          })
                        }
                        className="w-3.5 h-3.5 rounded text-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-800">Jobstreet SEEK</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.channels.glints}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            channels: { ...formData.channels, glints: e.target.checked },
                          })
                        }
                        className="w-3.5 h-3.5 rounded text-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-800">Glints Network</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Live Card Preview matching screenshot       */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* Live ATS Preview Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 leading-tight">Pratinjau Kartu Karir</h3>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                LIVE ATS PREVIEW
              </span>
            </div>

            {/* The Live Job Card Box matching screenshot */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1D4ED8] text-white">
                  BARU DIBUKA
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {formData.requisitionCode}
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                  {formData.title || 'Nama Posisi Kerja'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">Nexora Group • Rekayasa Produk</p>
              </div>

              {/* Meta items matching screenshot */}
              <div className="space-y-2 text-xs text-slate-600 border-y border-slate-100 py-3">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">{formData.workLocation} (Hybrid WFO)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Banknote className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-bold text-slate-800">
                    {formatRupiah(formData.salaryMin)} - {formatRupiah(formData.salaryMax)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">
                    {formData.contractType} (Karyawan Tetap Penuh)
                  </span>
                </div>
              </div>

              {/* Footer matching screenshot */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-500">
                  <span>Ditutup: </span>
                  <strong className="text-slate-800">30 Apr 2025</strong>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-xs transition-all"
                >
                  Lamar Sekarang
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed pt-2 border-t border-slate-50">
                Tampilan di atas merupakan gambaran kartu lowongan pada portal karir publik Nexora.
              </p>
            </div>

            {/* CONTINUATION: SLA & Recruitment Readiness Metrics Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Estimasi SLA &amp; Kesiapan Rekrutmen
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  98% Siap
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Kelengkapan Formasi</span>
                    <span className="font-bold text-emerald-600">98% Lengkap</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Target Time-to-Hire:</span>
                  <span className="font-bold text-slate-900">21 Hari Kerja</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Estimasi Pelamar Masuk:</span>
                  <span className="font-bold text-blue-700">80 - 120 Kandidat</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Hiring Manager:</span>
                  <span className="font-semibold text-slate-800">Ir. Andi Wijaya</span>
                </div>
              </div>
            </div>

            {/* CONTINUATION: Compliance Checklist */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Kepatuhan Regulasi &amp; Anggaran
                </h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  MPP Q2 Sah
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Sesuai Pagu Manpower Planning (MPP 2025)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Standar deskripsi kerja terakreditasi SKKNI</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Klausul PKWTT sinkron dengan regulasi UU Ketenagakerjaan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutSkeleton>
  );
}
