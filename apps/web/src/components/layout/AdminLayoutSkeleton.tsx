'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NexoraLogo } from '../common/NexoraLogo';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  UserPlus,
  TrendingUp,
  FileBarChart,
  Settings,
  ShieldCheck,
  Bell,
  Search,
  Calendar,
  Plus,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onQuickAction?: () => void;
}

export function AdminLayoutSkeleton({ children, onQuickAction }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Dynamic Indonesian date formatted as "Senin, 24 Maret 2025"
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const navSections = [
    {
      title: 'UTAMA',
      items: [
        {
          name: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          active: pathname === '/admin',
        },
        {
          name: 'Direktori Karyawan',
          href: '/admin/employees',
          icon: Users,
          active: pathname.startsWith('/admin/employees'),
        },
        {
          name: 'Presensi & Waktu',
          href: '/admin/attendance',
          icon: Clock,
          active: pathname.startsWith('/admin/attendance'),
        },
        {
          name: 'Manajemen Cuti & Izin',
          href: '/admin/leave',
          icon: CalendarCheck,
          active: pathname.startsWith('/admin/leave'),
        },
      ],
    },
    {
      title: 'OPERASIONAL',
      items: [
        {
          name: 'Payroll & Gaji',
          href: '/admin/payroll',
          icon: CreditCard,
          active: pathname.startsWith('/admin/payroll'),
        },
        {
          name: 'Rekrutmen & Onboarding',
          href: '/admin/recruitment',
          icon: UserPlus,
          active: pathname.startsWith('/admin/recruitment'),
        },
        {
          name: 'Evaluasi Kinerja (KPI)',
          href: '/admin/performance',
          icon: TrendingUp,
          active: pathname.startsWith('/admin/performance'),
        },
      ],
    },
    {
      title: 'LAPORAN & SISTEM',
      items: [
        {
          name: 'Rekapitulasi & Analitik',
          href: '/admin/reports',
          icon: FileBarChart,
          active: pathname.startsWith('/admin/reports'),
        },
        {
          name: 'Audit Trail',
          href: '/admin/audit',
          icon: ShieldCheck,
          active: pathname.startsWith('/admin/audit'),
        },
        {
          name: 'Pengaturan Sistem',
          href: '/admin/settings',
          icon: Settings,
          active: pathname.startsWith('/admin/settings'),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col justify-between bg-white border-r border-slate-200/80 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
            <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
              {/* Logo Ribbon Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#265AE3] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-base shadow-sm flex-shrink-0">
                N
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[15px] tracking-tight text-[#0F172A] leading-tight">
                    Nexora HRIS
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 tracking-wider">
                    Enterprise Portal
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse / Close Button */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title={isSidebarCollapsed ? 'Buka Sidebar' : 'Ciutkan Sidebar'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav Links per Section */}
          <nav className="p-3 space-y-5 flex-1">
            {navSections.map((section, sIdx) => (
              <div key={sIdx}>
                {!isSidebarCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item, iIdx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={iIdx}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        title={isSidebarCollapsed ? item.name : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          item.active
                            ? 'bg-[#1D4ED8] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            item.active ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom: Help Card */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-slate-100 flex-shrink-0">
            <a
              href="mailto:support@nexora.local"
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/70 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    Bantuan HRIS
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    Dokumentasi & Kontak
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-1" />
            </a>
          </div>
        )}
      </aside>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
          {/* Left: Mobile Toggle & Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari karyawan, departemen, atau modul..."
                className="w-full pl-9 pr-14 py-2 text-xs rounded-xl border border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 pointer-events-none">
                Ctrl + K
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-4 ml-4">
            {/* Dynamic Date display */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{formattedDate}</span>
            </div>

            {/* Quick Action Button */}
            <Link
              href="/admin/quick-entry"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tambah Baru</span>
            </Link>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* Vertical Separator */}
            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            {/* User Profile Pill linking to /admin/profile */}
            <Link
              href="/admin/profile"
              className="flex items-center gap-2.5 pl-1 cursor-pointer group hover:opacity-90 transition-opacity"
              title="Buka Pengaturan Akun & Profil Pengguna"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 p-0.5 shadow-sm flex-shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                    alt="Dewi Lestari"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight whitespace-nowrap">
                  Dewi Lestari, S.Psi
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight whitespace-nowrap">
                  HR Operations Manager
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block flex-shrink-0" />
            </Link>
          </div>
        </header>

        {/* Main Content Render */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
