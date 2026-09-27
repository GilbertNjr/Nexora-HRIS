'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
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
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  module: 'AUTH' | 'EMPLOYEE' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL';
  action: string;
  recordId: string;
  userName: string;
  userEmail: string;
  userNik?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  oldData: any | null;
  newData: any | null;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([
    {
      id: 'aud-001',
      module: 'PAYROLL',
      action: 'PAYROLL_PERIOD_LOCKED',
      recordId: 'per-03',
      userName: 'HR Administrator',
      userEmail: 'admin@nexora.local',
      userNik: 'NX-2026-0000',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0',
      timestamp: '2026-09-27 10:45:12 WIB',
      oldData: { status: 'VERIFIED' },
      newData: { status: 'LOCKED', lockedAt: '2026-09-27T10:45:12Z', invariant: 'REQ-DEC-09' },
    },
    {
      id: 'aud-002',
      module: 'LEAVE',
      action: 'LEAVE_APPROVAL_DECIDED',
      recordId: 'app-101',
      userName: 'Rina Wijaya (Head of Tech)',
      userEmail: 'rina.wijaya@nexora.local',
      userNik: 'NX-2026-0005',
      ipAddress: '10.0.4.15',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      timestamp: '2026-09-27 09:30:00 WIB',
      oldData: { status: 'PENDING' },
      newData: {
        status: 'APPROVED',
        employee: 'Budi Santoso',
        totalDays: 2,
        tierLevel: 1,
        attendanceMarked: 'ON_LEAVE',
      },
    },
    {
      id: 'aud-003',
      module: 'ATTENDANCE',
      action: 'CLOCK_IN_GEOFENCE_VERIFIED',
      recordId: 'att-502',
      userName: 'Budi Santoso',
      userEmail: 'employee@nexora.local',
      userNik: 'NX-2026-0001',
      ipAddress: '114.122.35.88',
      userAgent: 'Nexora Mobile ESS / Android 14',
      timestamp: '2026-09-27 08:52:19 WIB',
      oldData: null,
      newData: {
        distanceMeters: 25.4,
        officeRadiusLimit: 100,
        lateMinutes: 0,
        status: 'PRESENT',
        gpsCoordinates: '-6.2255, 106.8095',
      },
    },
    {
      id: 'aud-004',
      module: 'AUTH',
      action: 'LOGIN_SUCCESS',
      recordId: 'usr-admin',
      userName: 'HR Administrator',
      userEmail: 'admin@nexora.local',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: '2026-09-27 08:00:22 WIB',
      oldData: null,
      newData: { role: 'HR_ADMIN', portal: 'ADMIN', mfaVerified: true },
    },
    {
      id: 'aud-005',
      module: 'EMPLOYEE',
      action: 'EMPLOYEE_CREATED_WITH_PROVISION',
      recordId: 'emp-04',
      userName: 'HR Administrator',
      userEmail: 'admin@nexora.local',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: '2026-09-26 16:15:40 WIB',
      oldData: null,
      newData: {
        employeeNumber: 'NX-2026-0004',
        fullName: 'Dewi Lestari',
        department: 'Marketing & Growth',
        designation: 'Digital Marketing Lead',
        bankAccountEncrypted: true,
      },
    },
  ]);

  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <h1 className="text-2xl font-bold text-slate-900">Audit Trail & Forensic Log</h1>
            <p className="text-sm text-slate-500 mt-1">
              Jejak audit digital append-only yang kebal manipulasi, mencatat seluruh mutasi data dan otentikasi sistem.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Mengekspor Log Audit Terenkripsi untuk Audit ISO 27001...')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
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
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{logs.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Append-only (Zero Mutation)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Peristiwa Hari Ini
            </span>
            <div className="text-3xl font-extrabold text-blue-600 mt-2">4</div>
            <p className="text-[11px] text-slate-500 mt-1">Kehadiran, Cuti & Payroll</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Jejak Kriptografis
            </span>
            <div className="text-sm font-bold text-emerald-600 mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>SHA-256 Checksum Valid</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Integritas data 100% utuh</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Standar Kepatuhan
            </span>
            <div className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>ISO 27001 / UU PDP</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Masa retensi log: 5 Tahun</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Filter Modul:
            </span>
            {['ALL', 'AUTH', 'EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'PAYROLL'].map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedModule === mod
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aksi, aktor, IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Modul</th>
                  <th className="py-3 px-4">Peristiwa / Aksi</th>
                  <th className="py-3 px-4">Pengguna (Aktor)</th>
                  <th className="py-3 px-4">IP Address & Device</th>
                  <th className="py-3 px-4 text-right">Inspeksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getModuleBadgeColor(
                          log.module,
                        )}`}
                      >
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.userName}</div>
                      <div className="text-slate-400 text-[11px]">{log.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-slate-700">{log.ipAddress}</div>
                      <div className="text-slate-400 text-[10px] truncate max-w-xs">{log.userAgent}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEntry(log)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium text-xs flex items-center gap-1 ml-auto transition-colors"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>JSON Diff</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL INSPEKTUR FORENSIK JSON DIFF */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-slate-900">Inspeksi Forensik Log Audit</h3>
                    <p className="text-xs text-slate-500 font-mono">{selectedEntry.action}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Konteks Keamanan */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans">
                  <div>
                    <span className="text-slate-400">Pengguna / Aktor:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedEntry.userName} ({selectedEntry.userEmail})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Timestamp:</span>
                    <p className="font-semibold text-slate-800">{selectedEntry.timestamp}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">IP Address:</span>
                    <p className="font-mono text-slate-800">{selectedEntry.ipAddress}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Target Record ID:</span>
                    <p className="font-mono text-slate-800">{selectedEntry.recordId}</p>
                  </div>
                </div>

                {/* Perbandingan Data (Old vs New) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">
                      Data Sebelum Mutasi (oldData):
                    </span>
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono h-48">
                      {JSON.stringify(selectedEntry.oldData, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">
                      Data Sesudah Mutasi (newData):
                    </span>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono h-48">
                      {JSON.stringify(selectedEntry.newData, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Catatan ini bersifat immutable (append-only) dan telah ditandatangani secara kriptografis untuk audit forensik.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutSkeleton>
  );
}
