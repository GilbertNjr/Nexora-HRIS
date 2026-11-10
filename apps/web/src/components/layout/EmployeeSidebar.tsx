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
  Headphones,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  X,
  Menu,
  Megaphone,
  LogOut,
} from 'lucide-react';
import { EmployeeAnnouncementBroadcastListener } from '@/components/notifications/EmployeeAnnouncementBroadcastListener';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { subscribeSharedSSE } from '@/lib/sseClient';

export type EmployeeActiveMenu =
  | 'dashboard'
  | 'profile'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'performance'
  | 'training';

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
  const { user: currentUser } = useCurrentUser();
  const [companyLogo, setCompanyLogo] = useState<string>('/company-logo-saved.jpg');
  const [companyName, setCompanyName] = useState<string>('Nexora Group & HR Solutions');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('nexora_session_id') : null;
      if (sessionId) {
        await fetch('/api/v1/auth/sessions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('nexora_user');
      localStorage.removeItem('nexora_session_id');
      localStorage.removeItem('nexora_active_portal');
      localStorage.removeItem('nexora_employee_profile');

      try {
        const bc = new BroadcastChannel('nexora_live_sync');
        bc.postMessage({ type: 'USER_LOGGED_OUT', timestamp: Date.now() });
        bc.close();
      } catch {}

      window.location.href = '/login';
    }
  };

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
          } else {
            // Auto sync: if database doesn't have logo yet but this device has it, upload it!
            const localLogo = localStorage.getItem('nexora_persistent_company_logo');
            if (localLogo) {
              fetch('/api/v1/company', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logoUrl: localLogo }),
              }).catch(() => {});
            }
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

    // Listen to real-time multi-device SSE for company updates using shared socket
    const unsubCompany = subscribeSharedSSE('/api/v1/employees/stream', 'COMPANY_UPDATED', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const data = parsed.payload;
        if (data?.logoUrl !== undefined) setCompanyLogo(data.logoUrl || '');
        if (data?.commercialName) setCompanyName(data.commercialName);
      } catch {}
    });

    return () => {
      if (channel) channel.close();
      unsubCompany();
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
            title={`Sesi Aktif: ${currentUser.employeeNumber || 'Karyawan'} (${currentUser.fullName || 'Terverifikasi'})`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
        <div className={`px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold items-center gap-2 ${
          isCollapsed ? 'flex md:hidden' : 'flex'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="truncate">Sesi Aktif: {currentUser.employeeNumber || 'Karyawan'}</span>
        </div>

        {/* Quick Access: Pengumuman HRD Live */}
        {isCollapsed && (
          <div className="hidden md:flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('nexora_open_announcement'));
                }
              }}
              className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center transition-all shadow-2xs group relative cursor-pointer"
              title="Pengumuman HRD & Surat Edaran Aktif"
            >
              <Megaphone className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white animate-pulse" />
            </button>
          </div>
        )}

        <div className={`p-2.5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/90 border border-amber-200/90 items-center justify-between gap-2 shadow-2xs transition-all ${
          isCollapsed ? 'flex md:hidden' : 'flex'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold text-amber-950 truncate">Pengumuman HRD</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-amber-800/80 font-medium truncate">Surat Edaran Manajemen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nexora_open_announcement'));
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200 shadow-2xs transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          >
            Lihat
          </button>
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

        {/* SECTION 3: BANTUAN & DUKUNGAN */}
        <div className="space-y-1 pt-1">
          <p className={`text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1.5 ${
            isCollapsed ? 'block md:hidden' : 'block'
          }`}>
            BANTUAN &amp; DUKUNGAN
          </p>

          <button
            type="button"
            onClick={handleHelpdeskClick}
            title={isCollapsed ? 'Bantuan & Kontak HR' : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all text-left cursor-pointer ${
              isCollapsed ? 'justify-start md:justify-center px-3.5 py-2.5 md:p-2.5 gap-3 md:gap-0' : 'px-3.5 py-2.5 gap-3'
            }`}
          >
            <Headphones className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className={isCollapsed ? 'inline md:hidden' : 'inline'}>Bantuan &amp; Kontak HR</span>
          </button>
        </div>
      </div>

      {/* BOTTOM CARD: PUSAT DUKUNGAN, LOGOUT & VERSI APPS */}
      {isCollapsed && (
        <div className="hidden md:flex pt-4 border-t border-slate-100 flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onOpenPkbModal) onOpenPkbModal();
              else handleHelpdeskClick();
            }}
            className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            title="Pusat Dukungan (SOP & Tiket HR)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 flex items-center justify-center transition-colors cursor-pointer"
            title="Keluar Akun Karyawan (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <span
            className="font-mono text-[9px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60"
            title="Nexora HRIS ESS v2.4.0"
          >
            v2.4
          </span>
        </div>
      )}

      <div className={`mt-6 space-y-3 ${isCollapsed ? 'block md:hidden' : 'block'}`}>
        {/* Support Box */}
        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs space-y-2">
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

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200/60 transition-all cursor-pointer group shadow-2xs active:scale-[0.99]"
          title="Keluar dari Akun Karyawan (Logout)"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Keluar Akun</span>
          </div>
          <span className="text-[10px] font-bold text-rose-500/80 group-hover:text-rose-700">Logout</span>
        </button>

        {/* App Version Information */}
        <div className="flex items-center justify-between px-1.5 pt-0.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
            <span className="font-semibold text-slate-500 text-[10px] truncate">Nexora ESS Portal</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 flex-shrink-0">
            v2.4.0
          </span>
        </div>
      </div>
    </aside>

    {/* Modal Konfirmasi Logout Karyawan */}
    {showLogoutModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Konfirmasi Keluar Akun</h3>
              <p className="text-xs text-slate-500">Nexora Portal Karyawan (ESS)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin keluar dari akun karyawan? Sesi aktif pada perangkat ini akan diakhiri.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Memproses...' : 'Ya, Keluar'}</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Global Real-Time HR Announcement Broadcast Listener across all employee sub-pages */}
    <EmployeeAnnouncementBroadcastListener />
    </>
  );
}
