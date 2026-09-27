'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EssLayoutSkeleton } from '@/components/layout/EssLayoutSkeleton';
import {
  CalendarDays,
  Clock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Info,
  X,
  Filter,
} from 'lucide-react';

interface LeaveBalance {
  id: string;
  type: string;
  code: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
  color: string;
}

interface LeaveRequestItem {
  id: string;
  typeName: string;
  typeCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  documentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  currentLevel: number;
  approverName: string;
  createdAt: string;
}

export default function EssLeavePage() {
  // State saldo cuti
  const [balances, setBalances] = useState<LeaveBalance[]>([
    {
      id: 'bal-1',
      type: 'Cuti Tahunan (Annual)',
      code: 'ANNUAL',
      total: 12,
      used: 2,
      pending: 1,
      remaining: 9,
      color: 'indigo',
    },
    {
      id: 'bal-2',
      type: 'Izin Sakit (Sick Leave)',
      code: 'SICK',
      total: 14,
      used: 1,
      pending: 0,
      remaining: 13,
      color: 'rose',
    },
    {
      id: 'bal-3',
      type: 'Cuti Khusus & Pernikahan',
      code: 'SPECIAL',
      total: 3,
      used: 0,
      pending: 0,
      remaining: 3,
      color: 'emerald',
    },
  ]);

  // State riwayat pengajuan cuti
  const [requests, setRequests] = useState<LeaveRequestItem[]>([
    {
      id: 'req-01',
      typeName: 'Cuti Tahunan',
      typeCode: 'ANNUAL',
      startDate: '2026-10-15',
      endDate: '2026-10-16',
      totalDays: 2,
      reason: 'Keperluan keluarga di luar kota',
      status: 'PENDING',
      currentLevel: 1,
      approverName: 'Rina Wijaya (Head of Tech)',
      createdAt: '2026-09-26 14:30',
    },
    {
      id: 'req-02',
      typeName: 'Izin Sakit',
      typeCode: 'SICK',
      startDate: '2026-09-10',
      endDate: '2026-09-10',
      totalDays: 1,
      reason: 'Demam dan flu (Surat Dokter Terlampir)',
      documentUrl: 'https://nexora.storage/docs/surat-dokter-budi.pdf',
      status: 'APPROVED',
      currentLevel: 2,
      approverName: 'HR Compliance Dept',
      createdAt: '2026-09-10 08:15',
    },
    {
      id: 'req-03',
      typeName: 'Cuti Tahunan',
      typeCode: 'ANNUAL',
      startDate: '2026-08-01',
      endDate: '2026-08-01',
      totalDays: 1,
      reason: 'Perpanjangan SIM & Dokumen Pribadi',
      status: 'APPROVED',
      currentLevel: 1,
      approverName: 'Rina Wijaya (Head of Tech)',
      createdAt: '2026-07-28 09:00',
    },
  ]);

  // Modal pengajuan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter tab
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Perhitungan durasi otomatis hari
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const calculatedDays = calculateDays();

  // Aturan multi-tier approval [REQ-DEC-07]:
  // Cuti tahunan <= 2 hari cukup 1-tier (Manager). Cuti > 2 hari atau jenis cuti lain butuh 2-tier (Manager + HR).
  const requiresTwoTiers = calculatedDays > 2 || selectedType !== 'ANNUAL';

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setNotification({ type: 'error', message: 'Silakan pilih tanggal mulai dan selesai cuti.' });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setNotification({ type: 'error', message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.' });
      return;
    }

    // Validasi Cuti Sakit Wajib Dokumen [REQ-DEC-06]
    if (selectedType === 'SICK' && !documentUrl) {
      setNotification({
        type: 'error',
        message: 'Pengajuan izin sakit wajib melampirkan bukti Surat Keterangan Dokter [REQ-DEC-06].',
      });
      return;
    }

    // Validasi toleransi H+2 hari lampau [REQ-DEC-06]
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (selectedType === 'SICK' && diffDays > 2) {
      setNotification({
        type: 'error',
        message: 'Pengajuan izin sakit lampau melebihi batas toleransi maksimal H+2 hari kerja [REQ-DEC-06].',
      });
      return;
    }

    // Cek saldo
    const targetBalance = balances.find((b) => b.code === selectedType);
    if (targetBalance && targetBalance.remaining < calculatedDays) {
      setNotification({
        type: 'error',
        message: `Sisa kuota tidak mencukupi (${targetBalance.remaining} hari tersedia, diajukan ${calculatedDays} hari).`,
      });
      return;
    }

    // Tambahkan pengajuan baru
    const newReq: LeaveRequestItem = {
      id: `req-${Date.now().toString().slice(-4)}`,
      typeName: selectedType === 'ANNUAL' ? 'Cuti Tahunan' : selectedType === 'SICK' ? 'Izin Sakit' : 'Cuti Khusus',
      typeCode: selectedType,
      startDate,
      endDate,
      totalDays: calculatedDays,
      reason,
      documentUrl: documentUrl || undefined,
      status: 'PENDING',
      currentLevel: 1,
      approverName: 'Rina Wijaya (Head of Tech)',
      createdAt: 'Baru saja',
    };

    setRequests([newReq, ...requests]);

    // Update pending balance
    setBalances((prev) =>
      prev.map((b) =>
        b.code === selectedType
          ? { ...b, pending: b.pending + calculatedDays, remaining: b.remaining - calculatedDays }
          : b,
      ),
    );

    setIsModalOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
    setDocumentUrl('');
    setNotification({
      type: 'success',
      message: 'Permohonan cuti berhasil diajukan dan diteruskan ke Line Manager untuk persetujuan.',
    });
  };

  // Batalkan pengajuan PENDING
  const handleCancelRequest = (id: string, days: number, code: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' as const } : r)),
    );

    setBalances((prev) =>
      prev.map((b) =>
        b.code === code
          ? { ...b, pending: Math.max(0, b.pending - days), remaining: b.remaining + days }
          : b,
      ),
    );

    setNotification({
      type: 'success',
      message: 'Permohonan cuti berhasil dibatalkan. Kuota yang dipesan telah dikembalikan ke saldo aktif Anda.',
    });
  };

  const filteredRequests = requests.filter((r) => {
    if (filterTab === 'ALL') return true;
    return r.status === filterTab;
  });

  return (
    <EssLayoutSkeleton>
      <div className="space-y-6">
        {/* Banner Notifikasi */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Title & CTA Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <CalendarDays className="w-4 h-4" />
              <span>Employee Self-Service (ESS)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Cuti & Izin</h1>
            <p className="text-sm text-slate-500 mt-1">
              Pantau kuota saldo cuti tahunan, ajukan permohonan izin kerja, dan lacak alur approval.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-sm shadow-indigo-200 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajukan Cuti Baru</span>
          </button>
        </div>

        {/* Kartu Ringkasan Kuota Saldo Cuti */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {balances.map((bal) => (
            <div
              key={bal.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {bal.type}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  Tahun 2026
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold text-slate-900">{bal.remaining}</span>
                <span className="text-xs text-slate-500">hari tersisa</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden flex">
                <div
                  className="bg-indigo-600 h-full"
                  style={{ width: `${(bal.used / bal.total) * 100}%` }}
                  title={`Terpakai: ${bal.used} hari`}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${(bal.pending / bal.total) * 100}%` }}
                  title={`Diproses: ${bal.pending} hari`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <p className="text-slate-400">Total Hak</p>
                  <p className="font-semibold text-slate-700">{bal.total} hr</p>
                </div>
                <div>
                  <p className="text-slate-400">Terpakai</p>
                  <p className="font-semibold text-slate-700">{bal.used} hr</p>
                </div>
                <div>
                  <p className="text-slate-400">Diproses</p>
                  <p className="font-semibold text-amber-600">{bal.pending} hr</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aturan Kebijakan Cuti Highlight [REQ-DEC-06 & REQ-DEC-07] */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Aturan Persetujuan Cuti & Dokumen Sakit
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                • Cuti Tahunan ≤ 2 hari: <strong>1-Tier Approval</strong> (Line Manager langsung).
                <br />• Cuti &gt; 2 hari / Cuti Khusus: <strong>2-Tier Approval</strong> (Line Manager + HR Compliance).
                <br />• Izin Sakit: Wajib lampirkan Surat Dokter, toleransi klaim lampau maksimal <strong>H+2 hari kerja</strong>.
              </p>
            </div>
          </div>
          <Link
            href="/admin/leave"
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-white/80 px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1 flex-shrink-0"
          >
            <span>Buka Antrean Approval HR</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Daftar Riwayat Pengajuan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">Riwayat Pengajuan Cuti</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar permohonan cuti dan status peninjauan oleh manajemen.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterTab === tab
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'ALL'
                    ? 'Semua'
                    : tab === 'PENDING'
                    ? 'Menunggu'
                    : tab === 'APPROVED'
                    ? 'Disetujui'
                    : 'Ditolak'}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Tidak ada pengajuan cuti</p>
              <p className="text-xs text-slate-400 mt-1">
                Data permohonan cuti Anda sesuai filter belum tersedia.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{req.typeName}</span>
                      <span className="text-xs font-medium text-slate-400">•</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {req.totalDays} Hari Kerja
                      </span>

                      {/* Status Badge */}
                      {req.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Menunggu Approval Atasan</span>
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Disetujui</span>
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Ditolak</span>
                        </span>
                      )}
                      {req.status === 'CANCELLED' && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          Dibatalkan
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Periode:</strong> {req.startDate} s/d {req.endDate}
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Alasan:</strong> &ldquo;{req.reason}&rdquo;
                    </p>

                    {req.documentUrl && (
                      <div className="pt-1">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Membuka pratinjau Surat Keterangan Dokter...');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 underline"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Lihat Surat Keterangan Dokter (PDF)</span>
                        </a>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400">
                      Penilai: {req.approverName} • Diajukan: {req.createdAt}
                    </p>
                  </div>

                  {/* Tombol Batalkan Cuti */}
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelRequest(req.id, req.totalDays, req.typeCode)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-medium transition-colors self-start sm:self-center"
                    >
                      Batalkan Pengajuan
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FORMULIR PENGAJUAN CUTI */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Formulir Pengajuan Cuti / Izin</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lengkapi detail tanggal dan alasan pengajuan cuti Anda.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Pilih Jenis Cuti */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Cuti / Izin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ANNUAL">Cuti Tahunan (Annual Leave - Kuota 12 hr)</option>
                    <option value="SICK">Izin Sakit (Sick Leave - Wajib Surat Dokter)</option>
                    <option value="SPECIAL">Cuti Khusus / Pernikahan (3 hr)</option>
                  </select>
                </div>

                {/* Tanggal Mulai & Selesai */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Mulai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Selesai <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Info Durasi & Approval Tier Badge [REQ-DEC-07] */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Estimasi Durasi: </span>
                    <span className="font-bold text-slate-900">{calculatedDays} Hari Kerja</span>
                  </div>
                  <div>
                    {requiresTwoTiers ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        2-Tier Approval (Manager + HR)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        1-Tier Approval (Manager)
                      </span>
                    )}
                  </div>
                </div>

                {/* Upload Dokumen untuk Cuti Sakit [REQ-DEC-06] */}
                {selectedType === 'SICK' && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Wajib Lampiran Surat Keterangan Dokter [REQ-DEC-06]</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Sesuai peraturan perusahaan, pengajuan izin sakit lampau dibatasi maksimal toleransi H+2 hari kerja.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="URL Dokumen / Bukti Medis (cth: https://...)"
                        value={documentUrl}
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsUploading(true);
                          setTimeout(() => {
                            setIsUploading(false);
                            setDocumentUrl('https://nexora.storage/docs/surat-dokter-demo.pdf');
                          }, 600);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 flex items-center gap-1"
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>{isUploading ? 'Mengunggah...' : 'Simulasi Upload'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Alasan Cuti */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alasan / Keterangan Tambahan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Contoh: Mengikuti acara keluarga di luar kota / rawat jalan..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm active:scale-95 transition-all"
                  >
                    Kirim Permohonan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </EssLayoutSkeleton>
  );
}
