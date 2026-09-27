'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Building2,
  FileText,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  requestId: string;
  employeeNumber: string;
  employeeName: string;
  department: string;
  designation: string;
  leaveType: string;
  leaveTypeCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  documentUrl?: string;
  level: number;
  maxLevels: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  remainingBalanceBefore: number;
}

export default function AdminLeavePage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: 'app-101',
      requestId: 'req-01',
      employeeNumber: 'NX-2026-0001',
      employeeName: 'Budi Santoso',
      department: 'Technology & Engineering',
      designation: 'Senior Backend Engineer',
      leaveType: 'Cuti Tahunan',
      leaveTypeCode: 'ANNUAL',
      startDate: '2026-10-15',
      endDate: '2026-10-16',
      totalDays: 2,
      reason: 'Keperluan keluarga di luar kota',
      level: 1,
      maxLevels: 1, // <= 2 days is 1-tier
      status: 'PENDING',
      submittedAt: '2026-09-26 14:30',
      remainingBalanceBefore: 9,
    },
    {
      id: 'app-102',
      requestId: 'req-04',
      employeeNumber: 'NX-2026-0004',
      employeeName: 'Dewi Lestari',
      department: 'Marketing & Growth',
      designation: 'Digital Marketing Lead',
      leaveType: 'Izin Sakit (Surat Dokter)',
      leaveTypeCode: 'SICK',
      startDate: '2026-09-28',
      endDate: '2026-09-29',
      totalDays: 2,
      reason: 'Demam Berdarah (Rawat Jalan SCBD Clinic)',
      documentUrl: 'https://nexora.storage/docs/surat-dokter-dewi.pdf',
      level: 2,
      maxLevels: 2, // 2-tier approval
      status: 'PENDING',
      submittedAt: '2026-09-27 08:20',
      remainingBalanceBefore: 12,
    },
    {
      id: 'app-103',
      requestId: 'req-05',
      employeeNumber: 'NX-2026-0002',
      employeeName: 'Siti Rahmawati',
      department: 'Finance & Accounting',
      designation: 'Finance Associate',
      leaveType: 'Cuti Tahunan Panjang',
      leaveTypeCode: 'ANNUAL',
      startDate: '2026-11-02',
      endDate: '2026-11-06',
      totalDays: 5,
      reason: 'Liburan tahunan bersama keluarga',
      level: 1,
      maxLevels: 2,
      status: 'PENDING',
      submittedAt: '2026-09-25 11:00',
      remainingBalanceBefore: 10,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter list
  const filteredList = approvals.filter((item) => {
    const matchesTab = activeTab === 'PENDING' ? item.status === 'PENDING' : item.status !== 'PENDING';
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenAction = (item: ApprovalItem, type: 'APPROVE' | 'REJECT') => {
    setSelectedApproval(item);
    setActionType(type);
    setActionNotes(type === 'APPROVE' ? 'Disetujui. Selamat beristirahat.' : 'Mohon koordinasikan ulang dengan tim.');
  };

  const handleConfirmAction = () => {
    if (!selectedApproval || !actionType) return;

    setApprovals((prev) =>
      prev.map((item) =>
        item.id === selectedApproval.id
          ? {
              ...item,
              status: actionType === 'APPROVE' ? ('APPROVED' as const) : ('REJECTED' as const),
            }
          : item,
      ),
    );

    setNotification({
      type: 'success',
      message:
        actionType === 'APPROVE'
          ? `Permohonan cuti ${selectedApproval.employeeName} (${selectedApproval.totalDays} hari) berhasil disetujui. Kuota saldo telah dipotong secara atomik.`
          : `Permohonan cuti ${selectedApproval.employeeName} telah ditolak. Reservasi kuota pending telah dikembalikan.`,
    });

    setSelectedApproval(null);
    setActionType(null);
  };

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <AdminLayoutSkeleton>
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Toast Notifikasi */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <CalendarCheck className="w-4 h-4" />
              <span>HR & Manager Workflow</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Persetujuan Cuti & Izin Kerja</h1>
            <p className="text-sm text-slate-500 mt-1">
              Validasi pengajuan cuti berjenjang (Multi-Tier Approval) dan pemotongan kuota saldo otomatis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ess/leave"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm"
            >
              Simulasi ESS Portal
            </Link>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Antrean Menunggu Tindakan
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-amber-600">{pendingCount}</span>
              <span className="text-xs text-slate-500">permohonan aktif</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cuti Disetujui Bulan Ini
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-600">18</span>
              <span className="text-xs text-slate-500">permohonan</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sedang Cuti Hari Ini
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-indigo-600">3</span>
              <span className="text-xs text-slate-500">karyawan di SCBD HQ</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Kebijakan Multi-Tier
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-sm font-bold text-slate-800">1-Tier &le; 2 hr</span>
              <span className="text-xs text-slate-500">| 2-Tier &gt; 2 hr</span>
            </div>
          </div>
        </div>

        {/* Main Approval Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Controls: Search & Tabs */}
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Menunggu Persetujuan ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'HISTORY'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Riwayat Selesai
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama karyawan, NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4">Jenis Cuti</th>
                  <th className="py-3 px-4">Periode & Durasi</th>
                  <th className="py-3 px-4">Alasan & Dokumen</th>
                  <th className="py-3 px-4">Tingkat Approval</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada permohonan cuti pada kategori ini.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{item.employeeName}</div>
                        <div className="text-slate-400 text-[11px]">
                          {item.employeeNumber} • {item.department}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-800">
                        {item.leaveType}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-800">
                          {item.startDate} s/d {item.endDate}
                        </div>
                        <div className="text-blue-600 font-semibold text-[11px]">
                          {item.totalDays} Hari Kerja
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-slate-600 line-clamp-1 italic">&ldquo;{item.reason}&rdquo;</p>
                        {item.documentUrl && (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Pratinjau Dokumen Medis: ' + item.documentUrl);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium underline mt-0.5"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Surat Dokter Terlampir</span>
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.maxLevels === 1
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            Tier {item.level} of {item.maxLevels}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {item.maxLevels === 1 ? 'Line Manager Final' : 'Manager -> HR'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {item.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Menunggu Aksi</span>
                          </span>
                        )}
                        {item.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Disetujui</span>
                          </span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Ditolak</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {item.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAction(item, 'APPROVE')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1 shadow-sm transition-colors"
                              title="Setujui Cuti"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => handleOpenAction(item, 'REJECT')}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-medium text-xs flex items-center gap-1 border border-slate-200 transition-colors"
                              title="Tolak Cuti"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Konfirmasi Persetujuan / Penolakan */}
        {selectedApproval && actionType && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {actionType === 'APPROVE' ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </div>
                  )}
                  <h3 className="font-bold text-slate-900">
                    {actionType === 'APPROVE' ? 'Setujui Permohonan Cuti' : 'Tolak Permohonan Cuti'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedApproval(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Karyawan:</span>
                    <span className="font-semibold text-slate-900">{selectedApproval.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jenis & Periode:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedApproval.leaveType} ({selectedApproval.totalDays} Hari)
                    </span>
                  </div>
                  {actionType === 'APPROVE' && (
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-emerald-700 font-medium">
                      <span>Dampak Pemotongan Saldo:</span>
                      <span>
                        {selectedApproval.remainingBalanceBefore} hr &rarr;{' '}
                        {selectedApproval.remainingBalanceBefore - selectedApproval.totalDays} hr
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Keputusan Atasan / HR:
                  </label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan alasan atau catatan khusus..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedApproval(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all ${
                      actionType === 'APPROVE'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {actionType === 'APPROVE' ? 'Konfirmasi Disetujui' : 'Konfirmasi Penolakan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutSkeleton>
  );
}
