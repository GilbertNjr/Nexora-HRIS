'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  Building2,
  Clock,
  KeyRound,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  // Determine active tab based on current pathname
  const isCompany = pathname.includes('/admin/settings/company') || pathname === '/admin/settings';
  const isAttendance = pathname.includes('/admin/settings/attendance');
  const isRbac = pathname.includes('/admin/settings/rbac');
  const isPayroll = pathname.includes('/admin/settings/payroll');

  // Active label for breadcrumbs
  const activeTabName = isPayroll
    ? 'Komponen Payroll & Pajak'
    : isRbac
    ? 'Hak Akses & Peran (RBAC)'
    : isAttendance
    ? 'Kebijakan Kerja & Presensi'
    : 'Profil Perusahaan & Kantor';

  return (
    <AdminLayoutSkeleton>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb Navigation - Consistent across all settings modules */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Utama
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Laporan &amp; Sistem</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin/settings/company" className="hover:text-blue-600 transition-colors">
            Pengaturan Sistem
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className={`font-bold ${isPayroll ? 'text-[#002B80]' : 'text-blue-600'}`}>
            {activeTabName}
          </span>
        </nav>

        {/* 4 Persistent Sub-Tabs Bar */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {/* Tab 1: Profil Perusahaan & Kantor */}
          <Link
            href="/admin/settings/company"
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
              isCompany
                ? 'bg-[#1D4ED8] text-white shadow-blue-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil Perusahaan &amp; Kantor</span>
          </Link>

          {/* Tab 2: Kebijakan Kerja & Presensi */}
          <Link
            href="/admin/settings/attendance"
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
              isAttendance
                ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 shadow-blue-500/10'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className={`w-4 h-4 ${isAttendance ? 'text-blue-700' : ''}`} />
            <span>Kebijakan Kerja &amp; Presensi</span>
          </Link>

          {/* Tab 3: Hak Akses & Peran (RBAC) */}
          <Link
            href="/admin/settings/rbac"
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
              isRbac
                ? 'bg-[#1D4ED8] text-white shadow-blue-500/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Hak Akses &amp; Peran (RBAC)</span>
          </Link>

          {/* Tab 4: Komponen Payroll & Pajak */}
          <Link
            href="/admin/settings/payroll"
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
              isPayroll
                ? 'bg-[#002B80] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Komponen Payroll &amp; Pajak</span>
            {isPayroll && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 ml-1 inline-block" />
            )}
          </Link>
        </div>

        {/* Dynamic Nested Page Content (Domain Isolated) */}
        <div className="pt-1">
          {children}
        </div>
      </div>
    </AdminLayoutSkeleton>
  );
}
