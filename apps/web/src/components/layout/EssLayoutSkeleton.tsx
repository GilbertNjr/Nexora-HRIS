'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NexoraLogo } from '../common/NexoraLogo';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  FileText,
  User,
  Bell,
  MapPin,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

export function EssLayoutSkeleton({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('Nexora HRIS');

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
            localStorage.setItem('nexora_persistent_company_logo', json.data.logoUrl);
          }
          if (json.data.commercialName) setCompanyName(json.data.commercialName);
        }
      })
      .catch(() => {});

    // Listen to real-time BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (msg?.type === 'LOGO_UPDATED') {
          setCompanyLogo(msg.logoUrl || '');
          if (msg.companyName) setCompanyName(msg.companyName);
        }
      };
    } catch {
      // ignore
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/ess" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-xs flex-shrink-0">
              {companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  N
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                {companyName || 'Nexora HRIS'}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                Portal Mandiri Karyawan (ESS)
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Sync Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terhubung Real-Time HR Admin</span>
          </div>

          {/* Quick link to HR Admin */}
          <Link
            href="/admin"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 transition-all"
            title="Buka Portal HR Admin"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Portal HR Admin</span>
          </Link>

          <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            GB
          </div>
        </div>
      </header>

      {/* Desktop Sub Navigation */}
      <div className="hidden md:flex bg-white border-b border-slate-200 px-6 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-8">
          <Link
            href="/ess"
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              pathname === '/ess'
                ? 'text-blue-700 border-blue-600'
                : 'text-slate-600 hover:text-blue-600 border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Beranda Karyawan</span>
          </Link>

          <Link
            href="/ess/attendance"
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              pathname === '/ess/attendance'
                ? 'text-blue-700 border-blue-600'
                : 'text-slate-600 hover:text-blue-600 border-transparent'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Presensi Mandiri</span>
          </Link>

          <Link
            href="/ess/leave"
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              pathname === '/ess/leave'
                ? 'text-blue-700 border-blue-600'
                : 'text-slate-600 hover:text-blue-600 border-transparent'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Manajemen Cuti &amp; Izin</span>
          </Link>

          <Link
            href="/ess/payroll"
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              pathname === '/ess/payroll'
                ? 'text-blue-700 border-blue-600'
                : 'text-slate-600 hover:text-blue-600 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Slip Gaji (Payslip)</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1">{children}</main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 shadow-lg">
        <Link
          href="/ess"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/ess' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </Link>
        <Link
          href="/ess/attendance"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/ess/attendance' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Presensi</span>
        </Link>
        <Link
          href="/ess/leave"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/ess/leave' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px]">Cuti</span>
        </Link>
        <Link
          href="/ess/payroll"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/ess/payroll' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-blue-600'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Slip Gaji</span>
        </Link>
        <Link href="/admin" className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">HR Admin</span>
        </Link>
      </nav>
    </div>
  );
}

