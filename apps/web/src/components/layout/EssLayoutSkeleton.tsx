import React from 'react';
import Link from 'next/link';
import { NexoraLogo } from '../common/NexoraLogo';
import {
  Clock,
  CalendarDays,
  FileText,
  User,
  Bell,
  MapPin,
} from 'lucide-react';

export function EssLayoutSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <Link href="/">
          <NexoraLogo />
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>HQ Office Radius (Inside)</span>
          </div>

          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            GS
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1">{children}</main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 shadow-lg">
        <Link href="/ess/attendance" className="flex flex-col items-center gap-1 text-indigo-600">
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Presensi</span>
        </Link>
        <Link href="#cuti" className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600">
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cuti</span>
        </Link>
        <Link href="#payroll" className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600">
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-medium">Slip Gaji</span>
        </Link>
        <Link href="#profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-600">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
