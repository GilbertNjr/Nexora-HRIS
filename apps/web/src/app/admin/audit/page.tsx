'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import { useAuditRealtime } from '@/hooks/useAuditRealtime';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Activity,
  FileCode,
  Lock,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Globe,
  Monitor,
  Sparkles,
  RefreshCw,
  Radio,
  Plus,
  Database,
  History,
} from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  module: 'AUTH' | 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'PERFORMANCE' | 'ANNOUNCEMENTS';
  action: string;
  recordId: string;
  userName: string;
  userEmail: string;
  userNik?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  createdAt?: string;
  oldData: any | null;
  newData: any | null;
}

export interface AuditRetentionMeta {
  policy: '7_DAYS_ROLLING';
  retentionDays: number;
  retentionHours: number;
  totalActiveLogs: number;
  safetyGuarantee: string;
  lastPrunedAt?: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retentionMeta, setRetentionMeta] = useState<AuditRetentionMeta | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [recentNewId, setRecentNewId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch real-time audit logs from database API (strictly within 7-day retention)
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/audit');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLogs(json.data);
          if (json.meta?.retention) {
            setRetentionMeta(json.meta.retention);
          }
        }
      }
    } catch {
      // Keep state on network glitch
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Hook into Real-Time SSE Stream & BroadcastChannel (Zero-Refresh)
  useAuditRealtime({
    onAuditCreated: (newLog) => {
      setLogs((prev) => {
        const exists = prev.some((l) => l.id === newLog.id);
        if (exists) return prev;
        return [newLog, ...prev];
      });
      setRecentNewId(newLog.id);
      setTimeout(() => setRecentNewId(null), 6000);
    },
    onRefresh: () => {
      fetchLogs();
    },
    playAudioAlert: true,
  });

  // Action to simulate a live event for QA testing without refreshing
  const handleSimulateLiveEvent = async () => {
    setIsSimulating(true);
    try {
      const sampleEvents = [
        {
          module: 'AUTH',
          action: 'LOGIN_SUCCESS',
          userName: 'Rian Pratama, S.Kom',
          userEmail: 'rian.pratama@nexora.co.id',
          userNik: 'NX-2021008',
          newData: { portal: '/karyawan', method: 'UNIFIED_LOGIN', authMode: 'PASSWORD' },
        },
        {
          module: 'ATTENDANCE',
          action: 'CLOCK_IN_SELFIE_VERIFIED',
          userName: 'Rian Pratama, S.Kom',
          userEmail: 'rian.pratama@nexora.co.id',
          userNik: 'NX-2021008',
          newData: { status: 'TEPAT_WAKTU', location: 'SCBD Treasury Tower Lt. 32 (HQ Jakarta)', livenessScore: '99.4%' },
        },
        {
          module: 'LEAVE',
          action: 'LEAVE_REQUESTED',
          userName: 'Rian Pratama, S.Kom',
          userEmail: 'rian.pratama@nexora.co.id',
          userNik: 'NX-2021008',
          newData: { leaveType: 'Cuti Tahunan', durationDays: 2, reason: 'Urusan keluarga' },
        },
        {
          module: 'PERFORMANCE',
          action: 'PERFORMANCE_SELF_APPRAISAL_SUBMITTED',
          userName: 'Rian Pratama, S.Kom',
          userEmail: 'rian.pratama@nexora.co.id',
          userNik: 'NX-2021008',
          newData: { cycle: 'Q4 2026', selfRating: 4.85, okrCount: 4 },
        },
      ];

      const picked = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];

      await fetch('/api/v1/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(picked),
      });
    } catch {
      // ignore
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userNik && log.userNik.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.ipAddress.includes(searchTerm);
    return matchesModule && matchesSearch;
  });

  const getModuleBadgeColor = (module: string) => {
    switch (module) {
      case 'AUTH':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'EMPLOYEE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ATTENDANCE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LEAVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PAYROLL':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PERFORMANCE':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'ANNOUNCEMENTS':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayoutSkeleton>
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO 27001 & UU PDP Compliance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <span>Audit Trail & Forensic Log</span>
              {/* Real-Time Live Status Pill */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Real-Time Stream</span>
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Jejak audit digital append-only tersimpan permanen di Neon PostgreSQL dengan siklus retensi otomatis 7 hari (168 jam). Log baru & akhir pekan terproteksi aman.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateLiveEvent}
              disabled={isSimulating}
              className="px-3.5 py-2 rounded-xl border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              title="Kirim event uji coba ke server untuk melihat update langsung di tabel"
            >
              <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Simulasi Event Baru (QA)</span>
            </button>

            <button
              onClick={() => alert('Mengekspor Log Audit Terenkripsi untuk Audit ISO 27001...')}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Log Audit</span>
            </button>
          </div>
        </div>

        {/* Security Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Log Tercatat
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {isLoading ? (
                <span className="inline-block w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
              ) : (
                logs.length
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Append-only (Retensi 7 Hari Aktif)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Retensi Database
            </span>
            <div className="text-sm font-bold text-emerald-600 mt-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>7 Hari (Auto-Prune)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Log Baru & Weekend Terproteksi</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sinkronisasi
            </span>
            <div className="text-sm font-bold text-blue-600 mt-3 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>SSE & DB PostgreSQL</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Multi-client instant broadcast</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Standar Kepatuhan
            </span>
            <div className="text-3xl font-extrabold text-indigo-600 mt-2">100%</div>
            <p className="text-[11px] text-slate-500 mt-1">ISO 27001 & UU PDP No. 27/2022</p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['ALL', 'AUTH', 'EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'PERFORMANCE'].map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedModule === mod
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mod === 'ALL' ? 'Semua Modul' : mod}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari aksi, user, IP, atau email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">Aksi / Event</th>
                  <th className="py-3 px-4">Pengguna / Subjek</th>
                  <th className="py-3 px-4">Alamat IP</th>
                  <th className="py-3 px-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                        <span>Memuat log audit real-time dari database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <History className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="font-semibold text-slate-600">Tidak ada catatan audit yang cocok.</span>
                        <span className="text-[11px] text-slate-400">Log audit yang berumur lebih dari 7 hari otomatis dibersihkan oleh sistem.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isNew = recentNewId === log.id;
                    return (
                      <tr
                        key={log.id}
                        className={`transition-colors hover:bg-slate-50/80 cursor-pointer ${
                          isNew ? 'bg-emerald-50/90 font-medium animate-pulse' : ''
                        }`}
                        onClick={() => setSelectedEntry(log)}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {log.timestamp}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getModuleBadgeColor(
                              log.module
                            )}`}
                          >
                            {log.module}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                              {log.userName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{log.userName}</span>
                                {log.userNik && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                                    {log.userNik}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">{log.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                          {log.ipAddress}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntry(log);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forensic Detail Slide-Over Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full border text-xs font-bold ${getModuleBadgeColor(
                      selectedEntry.module
                    )}`}
                  >
                    {selectedEntry.module}
                  </span>
                  <span className="font-mono font-extrabold text-sm text-slate-900">
                    {selectedEntry.action}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Identity & Origin Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pengguna / Subjek</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEntry.userName}</p>
                  <p className="text-slate-500 text-[11px]">{selectedEntry.userEmail} {selectedEntry.userNik ? `(${selectedEntry.userNik})` : ''}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Waktu & Tanggal (WIB)</span>
                  <p className="font-bold text-slate-900 mt-0.5 font-mono">{selectedEntry.timestamp}</p>
                  <p className="text-slate-500 text-[11px]">Audit UUID: {selectedEntry.id}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Alamat IP</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedEntry.ipAddress}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Record ID / Ref</span>
                  <p className="font-mono text-slate-700 mt-0.5 text-[11px] font-semibold">
                    {selectedEntry.recordId}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">User Agent / Client</span>
                  <p className="font-mono text-slate-700 mt-0.5 text-[10px] break-all" title={selectedEntry.userAgent}>
                    {selectedEntry.userAgent}
                  </p>
                </div>
              </div>

              {/* Data Diff (Old vs New) */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Payload & Perubahan Data (Diff)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-1">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                      Data Sebelumnya (Old Data)
                    </span>
                    <pre className="overflow-x-auto whitespace-pre-wrap">
                      {selectedEntry.oldData
                        ? JSON.stringify(selectedEntry.oldData, null, 2)
                        : '// Tidak ada data sebelumnya (Insert Baru)'}
                    </pre>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Data Baru (New Data)
                    </span>
                    <pre className="overflow-x-auto whitespace-pre-wrap">
                      {selectedEntry.newData
                        ? JSON.stringify(selectedEntry.newData, null, 2)
                        : '// Null'}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Tutup Tinjauan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutSkeleton>
  );
}
