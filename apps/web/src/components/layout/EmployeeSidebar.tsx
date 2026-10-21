'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  CreditCard,
  TrendingUp,
  GraduationCap,
  FolderArchive,
  Headphones,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

export type EmployeeActiveMenu =
  | 'dashboard'
  | 'profile'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'performance'
  | 'training'
  | 'documents';

interface EmployeeSidebarProps {
  activeMenu: EmployeeActiveMenu;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenPkbModal?: () => void;
  onShowToast?: (msg: string) => void;
}

export function EmployeeSidebar({
  activeMenu,
  isCollapsed,
  onToggleCollapse,
  onOpenPkbModal,
  onShowToast,
}: EmployeeSidebarProps) {
  const handleHelpdeskClick = () => {
    if (onShowToast) {
      onShowToast('Kontak HR Helpdesk: Ext. 402 / helpdesk-hr@nexora.co.id');
    }
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 justify-between sticky top-0 md:h-screen z-30 shadow-2xs transition-all duration-300 ${
        isCollapsed ? 'w-full md:w-20 p-3' : 'w-full md:w-64 p-4 sm:p-5'
      }`}
    >
      <div className="space-y-4">
        {/* Logo Brand Header with Collapse Toggle */}
        <div
          className={`flex items-center transition-all ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {isCollapsed ? (
            /* Minimized Logo: Click to expand */
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-blue-500/20 hover:scale-105 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
              title="Buka Sidebar Penuh (Expand)"
            >
              <span className="text-white font-black tracking-tight">❖</span>
            </button>
          ) : (
            /* Expanded Brand */
            <>
              <Link href="/karyawan" className="flex items-center gap-3 group min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-blue-500/20 flex-shrink-0">
                  <span className="text-white font-black tracking-tight">❖</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors truncate">
                    Nexora <span className="text-blue-600 font-bold">HRIS</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 leading-tight truncate">
                    Portal Karyawan (ESS)
                  </span>
                </div>
              </Link>

              {/* Sidebar Collapse Button */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                title="Ciutkan Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Active Session Pill */}
        {isCollapsed ? (
          <div
            className="w-10 h-8 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 flex items-center justify-center mx-auto"
            title="Sesi Aktif: NX-2021008 (Karyawan Terverifikasi)"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="truncate">Sesi Aktif: NX-2021008</span>
          </div>
        )}

        {/* SECTION 1: UTAMA */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              UTAMA
            </p>
          )}

          {/* Beranda Saya */}
          <Link
            href="/karyawan"
            title={isCollapsed ? 'Beranda Saya' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'dashboard'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Beranda Saya</span>}
          </Link>

          {/* Profil Saya */}
          <Link
            href="/karyawan/profile"
            title={isCollapsed ? 'Profil Saya' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'profile'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <User className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'profile' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Profil Saya</span>}
          </Link>

          {/* Presensi & Absensi */}
          <Link
            href="/karyawan/attendance"
            title={isCollapsed ? 'Presensi & Absensi' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'attendance'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <Clock className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'attendance' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Presensi & Absensi</span>}
          </Link>

          {/* Cuti & Izin Saya */}
          <Link
            href="/karyawan/leave"
            title={isCollapsed ? 'Cuti & Izin Saya' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'leave'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <CalendarDays className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'leave' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Cuti & Izin Saya</span>}
          </Link>

          {/* Slip Gaji & Kompensasi */}
          <Link
            href="/karyawan/payroll"
            title={isCollapsed ? 'Slip Gaji & Kompensasi' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'payroll'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <CreditCard className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'payroll' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Slip Gaji & Kompensasi</span>}
          </Link>
        </div>

        {/* SECTION 2: KARIR & PENGEMBANGAN */}
        <div className="space-y-1 pt-1">
          {!isCollapsed && (
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              KARIR & PENGEMBANGAN
            </p>
          )}

          <Link
            href="/karyawan/performance"
            title={isCollapsed ? 'Kinerja & KPI Pribadi' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'performance'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <TrendingUp className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'performance' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Kinerja & KPI Pribadi</span>}
          </Link>

          <Link
            href="/karyawan/training"
            title={isCollapsed ? 'Pelatihan & Modul' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'training'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <GraduationCap className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'training' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Pelatihan & Modul</span>}
          </Link>
        </div>

        {/* SECTION 3: DOKUMEN & BANTUAN */}
        <div className="space-y-1 pt-1">
          {!isCollapsed && (
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              DOKUMEN & BANTUAN
            </p>
          )}

          <Link
            href="/karyawan/documents"
            title={isCollapsed ? 'Arsip & Formulir' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'documents'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <FolderArchive className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'documents' ? 'text-white' : 'text-slate-400'}`} />
            {!isCollapsed && <span>Arsip & Formulir</span>}
          </Link>

          <button
            type="button"
            onClick={handleHelpdeskClick}
            title={isCollapsed ? 'Bantuan & Kontak HR' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left ${
              isCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5 gap-3'
            }`}
          >
            <Headphones className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {!isCollapsed && <span>Bantuan & Kontak HR</span>}
          </button>
        </div>
      </div>

      {/* BOTTOM CARD: PUSAT DUKUNGAN */}
      {isCollapsed ? (
        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (onOpenPkbModal) onOpenPkbModal();
              else handleHelpdeskClick();
            }}
            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors shadow-2xs"
            title="Pusat Dukungan (SOP & Tiket HR)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Pusat Dukungan</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Ada kendala data kehadiran atau klaim?
          </p>

          <div className="pt-1 space-y-1 font-semibold text-[11px]">
            <a
              href="#sop"
              onClick={(e) => {
                e.preventDefault();
                if (onOpenPkbModal) onOpenPkbModal();
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>SOP Kepegawaian</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
            <a
              href="#tiket"
              onClick={(e) => {
                e.preventDefault();
                handleHelpdeskClick();
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              <span>Tiket Helpdesk HR</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>
        </div>
      )}
    </aside>
  );
}
