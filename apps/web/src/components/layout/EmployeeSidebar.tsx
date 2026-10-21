'use client';

import React, { useState, useEffect } from 'react';
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
  X,
  Menu,
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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenPkbModal?: () => void;
  onShowToast?: (msg: string) => void;
  subtitle?: string;
}

export function EmployeeSidebar({
  activeMenu,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  onOpenPkbModal,
  onShowToast,
  subtitle,
}: EmployeeSidebarProps) {
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('Nexora Group & HR Solutions');

  useEffect(() => {
    try {
      const persistentLogo = localStorage.getItem('nexora_persistent_company_logo');
      const cached = localStorage.getItem('nexora_company_settings');
      if (persistentLogo) {
        setCompanyLogo(persistentLogo);
      }
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!persistentLogo && parsed.logoUrl) setCompanyLogo(parsed.logoUrl);
        if (parsed.commercialName) setCompanyName(parsed.commercialName);
      }
    } catch {
      // ignore
    }

    fetch('/api/v1/company')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          if (json.data.logoUrl) {
            setCompanyLogo(json.data.logoUrl);
            try {
              localStorage.setItem('nexora_persistent_company_logo', json.data.logoUrl);
            } catch {}
          }
          if (json.data.commercialName) setCompanyName(json.data.commercialName);
        }
      })
      .catch(() => {});

    // Listen to real-time BroadcastChannel & storage events
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (msg?.type === 'LOGO_UPDATED') {
          if (msg.logoUrl) setCompanyLogo(msg.logoUrl);
          if (msg.companyName) setCompanyName(msg.companyName);
        }
      };
    } catch {
      // ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nexora_persistent_company_logo' && e.newValue) {
        setCompanyLogo(e.newValue);
      }
      if (e.key === 'nexora_company_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.commercialName) setCompanyName(parsed.commercialName);
          if (parsed.logoUrl) setCompanyLogo(parsed.logoUrl);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Listen to real-time multi-device SSE for company updates across different devices
    let sse: EventSource | null = null;
    try {
      sse = new EventSource('/api/v1/employees/stream');
      sse.addEventListener('COMPANY_UPDATED', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          const data = parsed.payload;
          if (data?.logoUrl !== undefined) setCompanyLogo(data.logoUrl || '');
          if (data?.commercialName) setCompanyName(data.commercialName);
        } catch {}
      });
    } catch {}

    return () => {
      if (channel) channel.close();
      if (sse) sse.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleHelpdeskClick = () => {
    if (onShowToast) {
      onShowToast('Kontak HR Helpdesk: Ext. 402 / helpdesk-hr@nexora.co.id');
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 flex flex-col justify-between bg-white border-r border-slate-200/90 transition-all duration-300 overflow-y-auto ${
          isCollapsed ? 'md:w-20 p-3' : 'md:w-64 p-4 sm:p-5'
        } ${
          isMobileOpen
            ? 'translate-x-0 w-72 max-w-[85vw] p-4 sm:p-5 shadow-2xl'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Logo Brand Header with Collapse Toggle & Mobile Close Button */}
          <div
            className={`flex items-center transition-all ${
              isCollapsed ? 'md:justify-center justify-between' : 'justify-between'
            }`}
          >
            {/* Desktop-only Minimized Logo Button when Collapsed */}
            {isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex w-10 h-10 rounded-xl overflow-hidden items-center justify-center shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-400 hover:scale-105 transition-all flex-shrink-0"
                title="Buka Sidebar Penuh (Expand)"
              >
                {companyLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#265AE3] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-base">
                    N
                  </div>
                )}
              </button>
            )}

            {/* Full Brand (Shown always on mobile, and on desktop when not collapsed) */}
            <div className={`items-center justify-between w-full ${isCollapsed ? 'flex md:hidden' : 'flex'}`}>
              <Link
                href="/karyawan"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 overflow-hidden min-w-0 group"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0">
                  {companyLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#265AE3] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-base">
                      N
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[15px] tracking-tight text-[#0F172A] leading-tight truncate group-hover:text-blue-600 transition-colors">
                    {companyName || 'Nexora Group & HR Solutions'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 tracking-wider truncate">
                    {subtitle || 'Portal Karyawan (ESS)'}
                  </span>
                </div>
              </Link>

              {/* Desktop Collapse Button (Only when expanded) */}
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                  title="Ciutkan Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}

              {/* Mobile Drawer Close Button */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

        {/* Active Session Pill */}
        {isCollapsed && (
          <div
            className="hidden md:flex w-10 h-8 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 items-center justify-center mx-auto"
            title="Sesi Aktif: NX-2021008 (Karyawan Terverifikasi)"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
        <div className={`px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold items-center gap-2 ${
          isCollapsed ? 'flex md:hidden' : 'flex'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="truncate">Sesi Aktif: NX-2021008</span>
        </div>

        {/* SECTION 1: UTAMA */}
        <div className="space-y-1">
          <p className={`text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5 ${
            isCollapsed ? 'block md:hidden' : 'block'
          }`}>
            UTAMA
          </p>

          {/* Beranda Saya */}
          <Link
            href="/karyawan"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Beranda Saya' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'dashboard'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Beranda Saya</span>
          </Link>

          {/* Profil Saya */}
          <Link
            href="/karyawan/profile"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Profil Saya' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'profile'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <User className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'profile' ? 'text-white' : 'text-slate-400'}`} />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Profil Saya</span>
          </Link>

          {/* Presensi & Absensi */}
          <Link
            href="/karyawan/attendance"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Presensi & Absensi' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'attendance'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <Clock className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'attendance' ? 'text-white' : 'text-slate-400'}`} />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Presensi & Absensi</span>
          </Link>

          {/* Cuti & Izin Saya */}
          <Link
            href="/karyawan/leave"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Cuti & Izin Saya' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'leave'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <CalendarDays className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'leave' ? 'text-white' : 'text-slate-400'}`} />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Cuti & Izin Saya</span>
          </Link>

          {/* Slip Gaji & Kompensasi */}
          <Link
            href="/karyawan/payroll"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Slip Gaji & Kompensasi' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'payroll'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <CreditCard className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'payroll' ? 'text-white' : 'text-slate-400'}`} />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Slip Gaji & Kompensasi</span>
          </Link>
        </div>

        {/* SECTION 2: KARIR & PENGEMBANGAN */}
        <div className="space-y-1 pt-1">
          <p className={`text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5 ${
            isCollapsed ? 'block md:hidden' : 'block'
          }`}>
            KARIR & PENGEMBANGAN
          </p>

          <Link
            href="/karyawan/performance"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Kinerja & KPI Pribadi' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'performance'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <TrendingUp className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'performance' ? 'text-white' : 'text-slate-400'}`} />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Kinerja & KPI Pribadi</span>
          </Link>

          <Link
            href="/karyawan/training"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Pelatihan & Modul' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'training'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <GraduationCap className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'training' ? 'text-white' : 'text-slate-400'}`} />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Pelatihan & Modul</span>
          </Link>
        </div>

        {/* SECTION 3: DOKUMEN & BANTUAN */}
        <div className="space-y-1 pt-1">
          <p className={`text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5 ${
            isCollapsed ? 'block md:hidden' : 'block'
          }`}>
            DOKUMEN & BANTUAN
          </p>

          <Link
            href="/karyawan/documents"
            onClick={onCloseMobile}
            title={isCollapsed ? 'Arsip & Formulir' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
              activeMenu === 'documents'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'}`}
          >
            <FolderArchive className={`w-4 h-4 flex-shrink-0 ${activeMenu === 'documents' ? 'text-white' : 'text-slate-400'}`} />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Arsip & Formulir</span>
          </Link>

          <button
            type="button"
            onClick={handleHelpdeskClick}
            title={isCollapsed ? 'Bantuan & Kontak HR' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left ${
              isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'
            }`}
          >
            <Headphones className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Bantuan & Kontak HR</span>
          </button>
        </div>
      </div>

      {/* BOTTOM CARD: PUSAT DUKUNGAN */}
      {isCollapsed && (
        <div className="hidden md:flex pt-4 border-t border-slate-100 justify-center">
          <button
            type="button"
            onClick={() => {
              if (onOpenPkbModal) onOpenPkbModal();
              else handleHelpdeskClick();
            }}
            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 items-center justify-center transition-colors shadow-2xs"
            title="Pusat Dukungan (SOP & Tiket HR)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className={`mt-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs space-y-2 ${
        isCollapsed ? 'block md:hidden' : 'block'
      }`}>
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Pusat Dukungan ESS</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {activeMenu === 'attendance'
            ? 'Kendala liveness camera, radius geofence, atau koreksi?'
            : 'Ada kendala data kehadiran atau klaim?'}
        </p>

        <div className="pt-1 space-y-1 font-semibold text-[11px]">
          {activeMenu === 'attendance' ? (
            <>
              <a
                href="#sop"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenPkbModal) onOpenPkbModal();
                  else if (onShowToast) onShowToast('SOP Presensi Biometrik: Pastikan pencahayaan cukup dan izinkan akses kamera.');
                }}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
              >
                <span>SOP Presensi Biometrik</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </a>
              <a
                href="#chat-pic"
                onClick={(e) => {
                  e.preventDefault();
                  if (onShowToast) onShowToast('Menghubungkan ke PIC Absensi HR: Diana S. (Ext. 405 / WA Business HR)');
                }}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
              >
                <span>Chat PIC Absensi (Diana S.)</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </a>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
