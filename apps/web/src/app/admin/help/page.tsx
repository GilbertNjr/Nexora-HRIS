'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  HelpCircle,
  Search,
  Download,
  PlusCircle,
  Activity,
  Ticket,
  BookOpen,
  PhoneCall,
  MapPin,
  FileText,
  Calendar,
  Users,
  Award,
  ShieldCheck,
  Headset,
  Mail,
  MessageSquare,
  Asterisk,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  X,
  FileSpreadsheet,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

interface GuideCategory {
  id: string;
  title: string;
  count: number;
  description: string;
  updatedAt: string;
  icon: React.ElementType;
  route: string;
}

export default function HelpCenterPage() {
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: 'support' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'support',
      text: 'Halo Ibu Dewi Lestari! Ada yang bisa tim Konsultan HR Nexora bantu terkait regulasi atau konfigurasi sistem hari ini?',
      time: '15:30',
    },
  ]);
  const [inputChat, setInputChat] = useState('');

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketModule, setTicketModule] = useState('Presensi & Geofencing');
  const [ticketUrgency, setTicketUrgency] = useState<'Rendah' | 'Sedang' | 'Kritis'>('Sedang');
  const [ticketDescription, setTicketDescription] = useState('');
  const [activeTicketsCount, setActiveTicketsCount] = useState(1);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Guide Categories
  const categories: GuideCategory[] = [
    {
      id: 'attendance',
      title: 'Presensi & Geofencing',
      count: 12,
      description:
        'Panduan konfigurasi radius koordinat kantor, toleransi keterlambatan bertingkat, dan penanganan manipulasi lokasi GPS.',
      updatedAt: 'Update 3 hari lalu',
      icon: MapPin,
      route: '/admin/attendance',
    },
    {
      id: 'payroll',
      title: 'Payroll & Pajak PPh 21',
      count: 16,
      description:
        'Implementasi skema TER PP 58/2023, rumus lembur PP 35/2021, integrasi iuran BPJS TK/Kes, dan otomasi transfer bank.',
      updatedAt: 'Update 1 hari lalu',
      icon: FileText,
      route: '/admin/payroll',
    },
    {
      id: 'leave',
      title: 'Cuti & Dispensasi Karyawan',
      count: 8,
      description:
        'Alur pengajuan cuti tahunan, dispensasi sakit, cuti melahirkan 6 bulan UU KIA, dan delegasi approval bertingkat.',
      updatedAt: 'Update 5 hari lalu',
      icon: Calendar,
      route: '/admin/leave',
    },
    {
      id: 'recruitment',
      title: 'Rekrutmen & Onboarding Digital',
      count: 10,
      description:
        'Manajemen alur pipeline ATS, scoring wawancara, digital offering letter, dan otomatisasi pembuatan profil karyawan.',
      updatedAt: 'Update 1 minggu lalu',
      icon: Users,
      route: '/admin/recruitment',
    },
    {
      id: 'performance',
      title: 'Manajemen Kinerja & OKR',
      count: 6,
      description:
        'Penyusunan indikator kinerja individu, review berkala 360 derajat, kalibrasi penilaian, dan evaluasi masa probation.',
      updatedAt: 'Update 2 minggu lalu',
      icon: Award,
      route: '/admin/performance',
    },
    {
      id: 'security',
      title: 'Keamanan Akun & Kepatuhan ISO',
      count: 9,
      description:
        'Protokol autentikasi 2FA, enkripsi data kredensial, kontrol peran RBAC, dan audit trail aktivitas sesi pengguna.',
      updatedAt: 'Update 4 hari lalu',
      icon: ShieldCheck,
      route: '/admin/profile/security',
    },
  ];

  // Popular search keywords
  const popularKeywords = [
    'Formula PPh 21 TER 2025',
    'Kebijakan Cuti Melahirkan UU KIA',
    'Koneksi Geofencing GPS',
    'Reset Kata Sandi Karyawan',
    'Kalkulasi Lembur PP 35',
  ];

  const handleSelectKeyword = (kw: string) => {
    setSelectedTag(kw);
    setSearchQuery(kw);
  };

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.title.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q)
    );
  });

  const handleDownloadHandbook = () => {
    showToast('Mengunduh Buku Panduan Resmi HRIS Nexora Enterprise (.pdf)...');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    setActiveTicketsCount((prev) => prev + 1);
    setIsTicketModalOpen(false);
    showToast(`Tiket #${Math.floor(1000 + Math.random() * 9000)} "${ticketSubject}" berhasil diajukan ke Tim IT Helpdesk!`);
    setTicketSubject('');
    setTicketDescription('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    const userMsg = inputChat.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: '15:32' },
    ]);
    setInputChat('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'support',
          text: `Terima kasih atas pertanyaannya terkait "${userMsg}". Permintaan Anda telah kami teruskan ke spesialis kepatuhan HR. Mohon tunggu sesaat.`,
          time: '15:33',
        },
      ]);
    }, 1000);
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

      {/* Modal: Ajukan Tiket Bantuan */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ajukan Tiket Bantuan Teknis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tim IT Helpdesk akan merespons dalam estimasi ~14 menit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subjek Kendala</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Contoh: Kesalahan sync sidik jari mesin Cikarang..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kategori Modul</label>
                  <select
                    value={ticketModule}
                    onChange={(e) => setTicketModule(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option>Presensi &amp; Geofencing</option>
                    <option>Payroll &amp; Pajak PPh 21</option>
                    <option>Cuti &amp; Dispensasi</option>
                    <option>Rekrutmen &amp; ATS</option>
                    <option>Keamanan &amp; Akun</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tingkat Urgensi</label>
                  <select
                    value={ticketUrgency}
                    onChange={(e) => setTicketUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  >
                    <option value="Rendah">Rendah (Pertanyaan Umum)</option>
                    <option value="Sedang">Sedang (Kendala Operasional)</option>
                    <option value="Kritis">Kritis (Sistem Terhenti)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Deskripsi Rinci</label>
                <textarea
                  rows={4}
                  required
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Jelaskan langkah terjadinya kendala, kode galat, atau dampak ke karyawan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#003B99] hover:bg-[#002b70] text-white text-xs font-bold shadow-md"
                >
                  Kirim Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Live Chat Konsultan HR */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[520px] overflow-hidden animate-in zoom-in-95">
            {/* Chat Header */}
            <div className="p-4 bg-[#003B99] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    HR
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#003B99] absolute bottom-0 right-0" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Konsultan HR Nexora</h4>
                  <p className="text-[11px] text-blue-200">Online • Tim Operasional &amp; Legal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                placeholder="Ketik pertanyaan regulasi / panduan..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
        {/* Breadcrumb Navigation - matches user mockup exactly */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 font-semibold">Bantuan HRIS</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">
            Pusat Bantuan &amp; Dokumentasi
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pusat Bantuan &amp; Panduan HRIS
              </h1>
              <span className="px-2.5 py-0.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Temukan dokumentasi SOP kepatuhan ketenagakerjaan, panduan operasional modul, kalkulator regulasi, dan tiket bantuan teknis HR.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadHandbook}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Panduan (.pdf)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTicketModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003B99] hover:bg-[#002b70] text-white font-bold text-xs shadow-md transition-all active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajukan Tiket Bantuan</span>
            </button>
          </div>
        </div>

        {/* Hero Search Box */}
        <div className="bg-gradient-to-b from-blue-50/70 via-slate-50/50 to-white rounded-3xl p-8 sm:p-10 border border-blue-100/90 shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
            <HelpCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Ada yang bisa kami bantu seputar modul Nexora?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Cari dokumentasi SOP, formula gaji, regulasi ketenagakerjaan, atau kode galat teknis.
            </p>
          </div>

          {/* Big Search Bar with CTRL K badge */}
          <div className="max-w-2xl mx-auto relative pt-2">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci: PPh 21 TER, toleransi keterlambatan, cuti melahirkan..."
                className="w-full pl-12 pr-24 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 text-xs sm:text-sm text-slate-900 shadow-xs transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
                  CTRL
                </kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
                  K
                </kbd>
              </div>
            </div>

            {/* Popular Search Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <span className="text-xs font-bold text-slate-500">
                Pencarian Populer:
              </span>
              {popularKeywords.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelectKeyword(tag)}
                  className={`text-xs px-3 py-1 rounded-xl border transition-all ${
                    searchQuery === tag
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Metric Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Kesiapan Sistem & SLA */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                KESIAPAN SISTEM &amp; SLA
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900">99.98%</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Normal
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Respon Tim IT HR: ~14 Menit
            </p>
          </div>

          {/* Card 2: Tiket Bantuan Aktif */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                TIKET BANTUAN AKTIF
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {activeTicketsCount} Tiket
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Investigasi
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Mesin Biometrik Cikarang
            </p>
          </div>

          {/* Card 3: Dokumentasi & SOP */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                DOKUMENTASI &amp; SOP
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900">48 Artikel</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Resmi
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Diperbarui: 22 Maret 2025
            </p>
          </div>

          {/* Card 4: Hotline Darurat */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                HOTLINE DARURAT
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900">Ext. #4099</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                24 Jam
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Legal Compliance: Ext. #4022
            </p>
          </div>
        </div>

        {/* Main Content Layout: Kategori Panduan (8 cols) + Kontak Bantuan Cepat (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: KATEGORI PANDUAN (8 COLS) ================= */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Kategori Panduan &amp; Dokumentasi Modul
                </h3>
                <p className="text-xs text-slate-500">
                  Eksplorasi tata kelola teknis dan kepatuhan administratif Nexora HRIS
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua Kategori</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grid of 6 Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {cat.count} Panduan
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {cat.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {cat.updatedAt}
                      </span>
                      <Link
                        href={cat.route}
                        className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group/btn"
                      >
                        <span>Buka Modul</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: KONTAK & STATUS TIKET (4 COLS) ================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Kontak Bantuan Cepat */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Headset className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kontak Bantuan Cepat
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-700">
                      Tim Aktif (08:00 - 18:00 WIB)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Live Chat Konsultan HR */}
              <button
                type="button"
                onClick={() => setIsChatModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#003B99] hover:bg-[#002b70] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mulai Live Chat Konsultan HR</span>
              </button>

              {/* Contact Channels List */}
              <div className="space-y-3.5 pt-1 text-xs">
                {/* 1. Email */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Email Helpdesk Resmi:
                    </p>
                    <a
                      href="mailto:support@nexora.id"
                      className="font-bold text-slate-900 hover:text-blue-600"
                    >
                      support@nexora.id
                    </a>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Estimasi balasan: ~30 menit
                    </p>
                  </div>
                </div>

                {/* 2. WhatsApp */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      WhatsApp Khusus Admin HR:
                    </p>
                    <a
                      href="https://wa.me/6281198764321"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-slate-900 hover:text-emerald-700"
                    >
                      +62 811-9876-4321
                    </a>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tersertifikasi OTP Korporasi
                    </p>
                  </div>
                </div>

                {/* 3. Emergency Call */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Asterisk className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Telepon Darurat Server (24 Jam):
                    </p>
                    <p className="font-bold text-slate-900">
                      Ext. 1109 (NOC Cikarang)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Status Tiket Aktif Saya */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Tiket Aktif Terbaru</span>
                <span className="text-[11px] text-blue-600 font-semibold">#TKT-9921</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    Mesin Biometrik Cikarang
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Investigasi
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pengecekan firmware gateway biometric reader offline di gerbang barat.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Respon terakhir: 10 mnt lalu</span>
                  <button
                    type="button"
                    onClick={() => showToast('Membuka detail log tiket #TKT-9921')}
                    className="font-bold text-blue-700 hover:underline"
                  >
                    Buka Log →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutSkeleton>
  );
}
