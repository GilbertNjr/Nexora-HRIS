import React from 'react';
import { NexoraLogo } from '../common/NexoraLogo';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  FileBarChart,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Building2,
} from 'lucide-react';

export function AdminLayoutSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo */}
          <div className="h-16 px-6 flex items-center border-b border-slate-800">
            <NexoraLogo variant="dark" />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-sm font-medium">
            <a
              href="#dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-600 text-white shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Analitik</span>
            </a>

            <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Manajemen Personalia
            </div>
            <a
              href="#employees"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Master Karyawan</span>
            </a>
            <a
              href="#departments"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>Struktur Organisasi</span>
            </a>

            <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Operasional & Waktu
            </div>
            <a
              href="#attendance"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Presensi & Shift</span>
            </a>
            <a
              href="#leave"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Persetujuan Cuti</span>
            </a>

            <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Finansial & Kepatuhan
            </div>
            <a
              href="#payroll"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Payroll & PPh 21 TER</span>
            </a>
            <a
              href="#reports"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <FileBarChart className="w-4 h-4" />
              <span>Laporan & Rekap</span>
            </a>
            <a
              href="#audit"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit Trail Log</span>
            </a>
          </nav>
        </div>

        {/* Bottom Profile / Settings */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <a
            href="#settings"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan Sistem</span>
          </a>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              HA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">HR Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">admin@nexora.local</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari karyawan, NIK, atau dokumen (Ctrl + K)..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Admin Portal
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
