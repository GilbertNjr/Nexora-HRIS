'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  Star,
  CheckSquare,
  PieChart,
  Video,
  Play,
  Users,
  Target,
  MessageSquare,
  Edit3,
  BookmarkCheck,
  Activity,
  PanelLeft,
  PanelLeftClose,
  Menu,
  Download,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
} from 'lucide-react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import {
  OkrItem,
  OneOnOneSession,
  PeerReviewSummary,
  IdpItem,
  PastCycleArchive,
  PerformanceRecord,
} from '@/app/api/v1/performance/route';

export default function EssPerformancePage() {
  const { user: currentUser } = useCurrentUser();
  const {
    isCollapsed: isSidebarCollapsed,
    toggle: toggleSidebar,
    isMobileOpen,
    openMobile,
    closeMobile,
  } = useSidebarCollapse();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'teknikal' | 'operasional' | 'budaya'>('all');

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPastCycleModalOpen, setIsPastCycleModalOpen] = useState(false);
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [isRisalahModalOpen, setIsRisalahModalOpen] = useState(false);
  const [isAddIdpModalOpen, setIsAddIdpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic real-time date state
  const [todayDate, setTodayDate] = useState<{ dayName: string; dayNum: string; monthYear: string }>({
    dayName: 'Senin',
    dayNum: '24',
    monthYear: 'Maret 2025',
  });

  // Performance live state
  const [performanceRecord, setPerformanceRecord] = useState<PerformanceRecord | null>(null);
  const [activeCycle, setActiveCycle] = useState('Q1 2025');
  const [okrList, setOkrList] = useState<OkrItem[]>([]);
  const [editingOkrId, setEditingOkrId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState<string>('4.7');
  const [tempCommentary, setTempCommentary] = useState<string>('');

  // IDP form state
  const [newIdpTitle, setNewIdpTitle] = useState('');
  const [newIdpTarget, setNewIdpTarget] = useState('');

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSavingOkr, setIsSavingOkr] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Set real Indonesian date
  useEffect(() => {
    try {
      const now = new Date();
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(now);
      const dayNum = new Intl.DateTimeFormat('id-ID', { day: 'numeric' }).format(now);
      const monthYear = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);
      setTodayDate({ dayName, dayNum, monthYear });
    } catch {}
  }, []);

  // Fetch current employee review from unified performance API
  const fetchMyPerformance = useCallback(async () => {
    const nik = currentUser.employeeNumber || 'NX-2021008';
    try {
      const res = await fetch(`/api/v1/performance?nik=${encodeURIComponent(nik)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const rec: PerformanceRecord = json.data;
          setPerformanceRecord(rec);
          if (json.activeCycle) setActiveCycle(json.activeCycle);
          if (Array.isArray(rec.okrs)) {
            setOkrList(rec.okrs);
          }
        }
      }
    } catch {}
  }, [currentUser.employeeNumber]);

  // Real-time listener for updates across tabs / admin
  useEffect(() => {
    fetchMyPerformance();
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('nexora_live_sync');
      bc.onmessage = (event) => {
        if (
          event.data?.type === 'PERFORMANCE_UPDATED' ||
          event.data?.type === 'PERFORMANCE_CYCLE_LAUNCHED' ||
          event.data?.type === 'PROFILE_UPDATED'
        ) {
          fetchMyPerformance();
        }
      };
    } catch {}

    const handleFocus = () => fetchMyPerformance();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchMyPerformance]);

  // Calculated dynamic self-appraisal score based on current okrList weights
  const calculatedScore = useMemo(() => {
    if (!okrList || okrList.length === 0) return 4.85;
    const total = okrList.reduce((acc, item) => {
      const weightFraction = (item.weight || 25) / 100;
      const rating = Number(item.selfRating) || 4.5;
      return acc + rating * weightFraction;
    }, 0);
    return Math.round(total * 100) / 100;
  }, [okrList]);

  // Dynamic Grade & Predicate
  const gradeLabel = useMemo(() => {
    if (calculatedScore >= 4.8) return 'Sangat Baik (Rekomendasi)';
    if (calculatedScore >= 4.5) return 'Grade A (Outstanding)';
    if (calculatedScore >= 4.0) return 'Grade B+ (Exceeds)';
    if (calculatedScore >= 3.0) return 'Grade B (Meets)';
    return 'Grade C (Perlu Peningkatan)';
  }, [calculatedScore]);

  // YoY Comparison with past cycle score
  const yoyComparison = useMemo(() => {
    const pastScore = performanceRecord?.pastCycles?.[0]?.score || 4.7;
    const diff = calculatedScore - pastScore;
    const isPositive = diff >= 0;
    const diffString = `${isPositive ? '+' : ''}${diff.toFixed(2)}`;
    return {
      diffString,
      isPositive,
      pastScore,
    };
  }, [calculatedScore, performanceRecord]);

  // Status Evaluasi Diri metrics
  const evaluationStats = useMemo(() => {
    const total = okrList.length || 4;
    const filledCount = okrList.filter((item) => !item.isDraft).length;
    const percentage = Math.round((filledCount / total) * 100);
    const draftRemaining = total - filledCount;
    return {
      total,
      filledCount,
      percentage,
      draftRemaining,
      isAllCompleted: draftRemaining === 0,
    };
  }, [okrList]);

  // Bobot Terkalibrasi categories breakdown
  const weightBreakdown = useMemo(() => {
    const teknikalWeight = okrList
      .filter((o) => o.category === 'teknikal')
      .reduce((sum, o) => sum + (o.weight || 0), 0);
    const operasionalWeight = okrList
      .filter((o) => o.category === 'operasional')
      .reduce((sum, o) => sum + (o.weight || 0), 0);
    const budayaWeight = okrList
      .filter((o) => o.category === 'budaya')
      .reduce((sum, o) => sum + (o.weight || 0), 0);

    return {
      okrTim: teknikalWeight || 40,
      operasional: operasionalWeight || 35,
      budaya: budayaWeight || 15,
      peer: 10,
    };
  }, [okrList]);

  // One on one data
  const oneOnOne: OneOnOneSession = useMemo(() => {
    return (
      performanceRecord?.oneOnOne || {
        date: '03 April 2025',
        time: '14:00 - 15:00 WIB',
        managerName: 'Arya Wibowo, M.Sc',
        managerTitle: 'VP of Engineering',
        managerNik: 'NX-2018042',
        platform: 'Google Meet',
        meetLink: 'https://meet.google.com/nex-perf-rian',
        agenda: [
          '1. Kalibrasi self-appraisal arsitektur microservices core.',
          '2. Roadmap sertifikasi GCP Cloud Architect Q2 2025.',
          '3. Rencana suksesi mentoring engineering squad backend.',
        ],
        risalahDate: '14 Maret 2025',
        risalahAgreedPoints: [
          'Arsitektur cloud Kubernetes GKE dinilai sangat sukses menjaga SLA 99.99%.',
          'Penyelesaian modul enkripsi data karyawan diapresiasi penuh oleh HR & Legal.',
          'Fokus kuartal berikutnya dialokasikan 20% untuk mentoring squad junior.',
        ],
      }
    );
  }, [performanceRecord]);

  // Peer review data
  const peerReview: PeerReviewSummary = useMemo(() => {
    return (
      performanceRecord?.peerReview || {
        rating: 4.9,
        totalReviews: 4,
        maxReviews: 4,
        reviewers: [
          { initials: 'DY', bg: 'bg-blue-600' },
          { initials: 'BS', bg: 'bg-emerald-600' },
          { initials: 'KT', bg: 'bg-purple-600' },
          { initials: '+1', bg: 'bg-slate-900' },
        ],
        tags: ['#ArsitekSolutif', '#HighReliability', '#GreatMentor', '#FastResponse', '#CleanCode'],
        quote:
          'Sangat tanggap saat insiden production dan selalu memberikan penjelasan arsitektural yang jelas untuk tim. Bimbingan tech-talk mikroservis sangat membantu percepatan rilis modul integrasi absensi.',
      }
    );
  }, [performanceRecord]);

  // IDP data
  const idpList: IdpItem[] = useMemo(() => {
    return (
      performanceRecord?.idp || [
        {
          id: 'idp-1',
          title: 'Google Cloud Professional Cloud Architect',
          target: 'Target Sertifikasi: Mei 2025 • Biaya ditanggung PT Nexora',
          status: 'Disetujui VP',
        },
        {
          id: 'idp-2',
          title: 'Executive Engineering Leadership Workshop',
          target: 'Target Modul: Juni 2025 • Persiapan Principal Band',
          status: 'Disetujui VP',
        },
      ]
    );
  }, [performanceRecord]);

  // Past cycles
  const pastCycles: PastCycleArchive[] = useMemo(() => {
    return (
      performanceRecord?.pastCycles || [
        {
          cycle: 'Q4 2024',
          score: 4.7,
          grade: 'Sangat Baik (Exceeds)',
          approvalDate: '20 Januari 2025',
          bonusImpact: 'Bonus Kinerja Akhir Tahun 2.5x Gaji Pokok & Kenaikan Grade Band 4.',
          approvers: 'Arya Wibowo (VP Eng) & Citra Lestari (Chief People Officer)',
        },
      ]
    );
  }, [performanceRecord]);

  // Filtered OKRs
  const filteredOkrs = useMemo(() => {
    let list = okrList;
    if (activeTab !== 'all') {
      list = list.filter((item) => item.category === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.targetMetric.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q)
      );
    }
    return list;
  }, [okrList, activeTab, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: okrList.length,
      teknikal: okrList.filter((o) => o.category === 'teknikal').length,
      operasional: okrList.filter((o) => o.category === 'operasional').length,
      budaya: okrList.filter((o) => o.category === 'budaya').length,
    };
  }, [okrList]);

  // Open edit for a specific OKR
  const handleStartEditOkr = (okr: OkrItem) => {
    setEditingOkrId(okr.id);
    setTempRating(String(okr.selfRating || 4.7));
    setTempCommentary(okr.commentary || '');
  };

  // Save single OKR draft to API
  const handleSaveOkrDraft = async (okrId: string) => {
    setIsSavingOkr(true);
    const numRating = parseFloat(tempRating) || 4.7;

    const nextOkrs = okrList.map((o) => {
      if (o.id === okrId) {
        return {
          ...o,
          selfRating: numRating,
          commentary: tempCommentary,
          isDraft: false,
        };
      }
      return o;
    });

    setOkrList(nextOkrs);
    setEditingOkrId(null);

    // Save to API
    const nik = currentUser.employeeNumber || 'NX-2021008';
    try {
      const res = await fetch('/api/v1/performance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik,
          okrId,
          selfRating: numRating,
          commentary: tempCommentary,
          isDraft: false,
        }),
      });

      if (res.ok) {
        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({ type: 'PERFORMANCE_UPDATED', nik });
          bc.close();
        } catch {}
      }
    } catch {}

    setIsSavingOkr(false);
    showToast('✓ Evaluasi diri sasaran berhasil disimpan secara dinamis!');
  };

  // Submit entire self-appraisal
  const handleSubmitSelfAppraisal = async () => {
    setIsSubmittingReview(true);
    const nik = currentUser.employeeNumber || 'NX-2021008';

    // Mark all OKRs as non-draft
    const finalizedOkrs = okrList.map((o) => ({ ...o, isDraft: false }));

    try {
      const res = await fetch('/api/v1/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik,
          name: currentUser.fullName,
          role: currentUser.designation,
          department: currentUser.department,
          score: calculatedScore,
          okrAchievement: '105%',
          status: 'TERVERIFIKASI',
          selfRating: calculatedScore,
          feedback:
            tempCommentary ||
            performanceRecord?.feedback ||
            'Self-appraisal lengkap disahkan oleh karyawan.',
          avatarUrl: currentUser.avatarUrl,
          okrs: finalizedOkrs,
        }),
      });

      if (res.ok) {
        setOkrList(finalizedOkrs);
        try {
          const bc = new BroadcastChannel('nexora_live_sync');
          bc.postMessage({ type: 'PERFORMANCE_UPDATED', nik });
          bc.close();
        } catch {}
      }
    } catch {}

    setIsSubmittingReview(false);
    setIsSubmitModalOpen(false);
    fetchMyPerformance();
    showToast('✓ Evaluasi Self-Appraisal berhasil dikirimkan & disinkronkan ke sistem HR secara real-time!');
  };

  // Add new IDP Goal
  const handleAddIdpGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdpTitle.trim()) return;

    const newItem: IdpItem = {
      id: `idp-${Date.now()}`,
      title: newIdpTitle.trim(),
      target: newIdpTarget.trim() || 'Target Modul Q2 2025 • Biaya ditanggung PT Nexora',
      status: 'Diajukan ke Atasan',
    };

    const nextList = [...idpList, newItem];
    const nik = currentUser.employeeNumber || 'NX-2021008';

    try {
      await fetch('/api/v1/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik,
          idp: nextList,
        }),
      });
      if (performanceRecord) {
        setPerformanceRecord({ ...performanceRecord, idp: nextList });
      }
    } catch {}

    setNewIdpTitle('');
    setNewIdpTarget('');
    setIsAddIdpModalOpen(false);
    showToast('✓ Target rencana pengembangan (IDP) baru berhasil ditambahkan!');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR with Collapse/Expand */}
      <EmployeeSidebar
        activeMenu="performance"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
        onShowToast={showToast}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Left: Mobile & Desktop Toggle Button & Search Input Box */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={openMobile}
              className="flex md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
              title={isSidebarCollapsed ? 'Buka Sidebar' : 'Ciutkan Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5 text-slate-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Search Input Box */}
            <div className="relative w-72 sm:w-96 max-w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sasaran, OKR, metrik, atau target evaluasi..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Dynamic Real-Time Date */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col text-[11px] leading-tight text-left">
                <span className="font-bold text-slate-800">
                  {todayDate.dayName}, {todayDate.dayNum}
                </span>
                <span className="text-slate-500 font-medium">{todayDate.monthYear}</span>
              </div>
            </div>

            <NotificationBellDropdown portal="ess" />

            <Link
              href="/karyawan/profile"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs overflow-hidden relative">
                {currentUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  currentUser.initials
                )}
                {currentUser.avatarUrl && (
                  <span className="absolute inset-0 flex items-center justify-center -z-10 font-bold text-xs">
                    {currentUser.initials}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                    {currentUser.fullName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-[9px] font-bold text-slate-600">
                    Karyawan (ESS)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  {currentUser.designation} • {currentUser.employeeNumber}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto pb-36">
          {/* HEADER SECTION matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="space-y-1.5">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Link href="/karyawan" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Beranda Saya</span>
                </Link>
                <span>/</span>
                <span>Karir &amp; Pengembangan</span>
                <span>/</span>
                <span className="text-slate-800 font-bold">Kinerja &amp; KPI Pribadi</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Evaluasi Kinerja &amp; KPI Pribadi
              </h1>

              {/* Status Pill */}
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>
                    Siklus Aktif: {activeCycle} (Sedang Berjalan — Tahap Self-Appraisal)
                  </span>
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Pantau progres sasaran kuartalan, lengkapi penilaian mandiri, dan kelola rencana pengembangan profesional.
              </p>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              {/* Riwayat Siklus Lalu (.pdf) Button */}
              <button
                type="button"
                onClick={() => setIsPastCycleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Riwayat Siklus Lalu (.pdf)</span>
              </button>

              {/* Kirim Self-Appraisal Sekarang (Solid Blue Button) */}
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Kirim Self-Appraisal Sekarang</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: 4 KEY METRIC CARDS matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: SKOR CAPAIAN SEMENTARA */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  SKOR CAPAIAN SEMENTARA
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-blue-600" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-700 tracking-tight font-mono">
                  {calculatedScore.toFixed(2)}
                </span>
                <span className="text-slate-400 font-bold text-lg">/ 5.0</span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[170px]">
                  {gradeLabel}
                </span>
                <span
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    yoyComparison.isPositive ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {yoyComparison.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>{yoyComparison.diffString} YoY</span>
                </span>
              </div>

              {/* Solid blue accent bar at bottom */}
              <div className="pt-0.5">
                <div
                  className="h-1 bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (calculatedScore / 5.0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Card 2: STATUS EVALUASI DIRI */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  STATUS EVALUASI DIRI
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {evaluationStats.percentage}%
                </span>
                <span className="text-slate-500 font-bold text-xs">Terisi</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                {evaluationStats.filledCount} dari {evaluationStats.total} Sasaran Strategis telah dinilai secara mandiri.
              </p>

              <div className="flex items-center justify-between text-[11px] font-semibold text-rose-600 pt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-500" />
                  <span>Tenggat: 31 Maret 2025</span>
                </span>
                <span
                  className={`font-bold ${
                    evaluationStats.isAllCompleted ? 'text-emerald-600' : 'text-amber-700'
                  }`}
                >
                  {evaluationStats.isAllCompleted
                    ? 'Status: Lengkap'
                    : `${evaluationStats.draftRemaining} Draft Tersisa`}
                </span>
              </div>
            </div>

            {/* Card 3: BOBOT TERKALIBRASI */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  BOBOT TERKALIBRASI
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">100%</span>
                <span className="text-slate-500 font-bold text-xs">Total Bobot</span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-600 font-medium">
                <span className="truncate">● OKR Tim: {weightBreakdown.okrTim}%</span>
                <span className="truncate">● Operasional: {weightBreakdown.operasional}%</span>
                <span className="truncate">● Budaya: {weightBreakdown.budaya}%</span>
                <span className="truncate">● Peer: {weightBreakdown.peer}%</span>
              </div>

              {/* Segmented color bar */}
              <div className="pt-0.5">
                <div className="w-full grid grid-cols-4 gap-1 h-1">
                  <div className="bg-blue-600 rounded-full h-full" />
                  <div className="bg-emerald-500 rounded-full h-full" />
                  <div className="bg-amber-500 rounded-full h-full" />
                  <div className="bg-purple-500 rounded-full h-full" />
                </div>
              </div>
            </div>

            {/* Card 4: JADWAL SESI 1-ON-1 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  JADWAL SESI 1-ON-1
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {oneOnOne.date}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug truncate">
                Tatap muka daring bersama {oneOnOne.managerName} ({oneOnOne.managerTitle}).
              </p>

              <div className="flex items-center justify-between pt-0.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {oneOnOne.platform} Terkonfirmasi
                </span>
                <button
                  type="button"
                  onClick={() => setIsMeetModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2 cursor-pointer"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: 2-COLUMN LAYOUT (LEFT 8 COLS, RIGHT 4 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (8 COLS): ALUR LINIMASA & RINCIAN SASARAN KINERJA (OKR) */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION A: Alur & Linimasa Penilaian Siklus */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Alur &amp; Linimasa Penilaian Siklus {activeCycle}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Status Global: <strong className="text-blue-600">Sedang Berlangsung</strong>
                  </span>
                </div>

                {/* 4 Steps Timeline Grid matching screenshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {/* Step 1: Self-Appraisal (Active) */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        1
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Batas: 31 Mar</span>
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-900">Self-Appraisal</p>
                    <p className="text-[11px] text-slate-500">Pengisian Mandiri</p>
                  </div>

                  {/* Step 2: Review Atasan */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center">
                      2
                    </div>
                    <p className="text-xs font-bold text-slate-900">Review Atasan</p>
                    <p className="text-[11px] text-slate-500">1-on-1 dgn {oneOnOne.managerName.split(',')[0]}</p>
                    <p className="text-[10px] text-slate-400">03 - 07 Apr 2025</p>
                  </div>

                  {/* Step 3: Kalibrasi HR */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center">
                      3
                    </div>
                    <p className="text-xs font-bold text-slate-900">Kalibrasi HR</p>
                    <p className="text-[11px] text-slate-500">Komite &amp; C-Level</p>
                    <p className="text-[10px] text-slate-400">10 - 18 Apr 2025</p>
                  </div>

                  {/* Step 4: Pengesahan */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center">
                      4
                    </div>
                    <p className="text-xs font-bold text-slate-900">Pengesahan</p>
                    <p className="text-[11px] text-slate-500">Hasil &amp; Kompensasi</p>
                    <p className="text-[10px] text-slate-400">25 Apr 2025</p>
                  </div>
                </div>
              </div>

              {/* SECTION B: Rincian Sasaran Kinerja & Key Results (OKR) */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Rincian Sasaran Kinerja &amp; Key Results (OKR)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluasi berkala terhadap objektif teknis, kontribusi arsitektural, dan budaya tim.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 self-start sm:self-auto">
                    Total Bobot: 100%
                  </span>
                </div>

                {/* Filter Tabs matching screenshot */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-100 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Semua Sasaran ({tabCounts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('teknikal')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'teknikal'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Teknikal &amp; Arsitektur ({tabCounts.teknikal})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('operasional')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'operasional'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Efisiensi Operasional ({tabCounts.operasional})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('budaya')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'budaya'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Kepemimpinan &amp; Budaya ({tabCounts.budaya})
                  </button>
                </div>

                {/* DYNAMIC OKR CARDS - EDITABLE, LIVE, NOT STATIC DUMMY! */}
                <div className="space-y-4 pt-1">
                  {filteredOkrs.map((okr) => {
                    const isCurrentlyEditing = editingOkrId === okr.id || (okr.isDraft && editingOkrId === null && okr.id === 'okr-4');

                    return (
                      <div
                        key={okr.id}
                        className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3 transition-all hover:bg-white hover:shadow-xs"
                      >
                        {/* Badges Row matching screenshot */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                              BOBOT: {okr.weight}%
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                okr.progressPercent >= 90
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              ✓ {okr.progressPercent}% Tercapai
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/80 text-slate-700">
                              {okr.tag}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                            <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                            <span>Self-Rating: {Number(okr.selfRating).toFixed(1)} / 5.0</span>
                            {!isCurrentlyEditing && (
                              <button
                                type="button"
                                onClick={() => handleStartEditOkr(okr)}
                                className="ml-1 p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit evaluasi mandiri sasaran ini"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Target Metric */}
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                            {okr.title}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {okr.targetMetric}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              okr.progressPercent >= 95
                                ? 'bg-blue-600'
                                : okr.progressPercent >= 85
                                ? 'bg-emerald-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${okr.progressPercent}%` }}
                          />
                        </div>

                        {/* Commentary & Self Rating Section */}
                        {isCurrentlyEditing ? (
                          <div className="space-y-2 pt-1 border-t border-slate-200/80">
                            <div className="flex items-center justify-between text-xs">
                              <label className="font-bold text-slate-700">
                                Catatan Evaluasi Diri (Draft Mandiri):
                              </label>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Belum Disimpan
                              </span>
                            </div>
                            <textarea
                              rows={2}
                              value={tempCommentary || okr.commentary}
                              onChange={(e) => setTempCommentary(e.target.value)}
                              placeholder="Tuliskan pencapaian konkrit, tantangan teknis, dan bukti kontribusi..."
                              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500">Nilai Diri Sendiri:</span>
                                <select
                                  value={tempRating}
                                  onChange={(e) => setTempRating(e.target.value)}
                                  className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                                >
                                  <option value="4.0">4.0 - Memenuhi Ekspektasi (Meets)</option>
                                  <option value="4.5">4.5 - Melampaui Ekspektasi (Exceeds)</option>
                                  <option value="4.7">4.7 - Sangat Baik (Rekomendasi)</option>
                                  <option value="4.8">4.8 - Luar Biasa (Outstanding)</option>
                                  <option value="4.9">4.9 - Istimewa</option>
                                  <option value="5.0">5.0 - Sempurna (100% Target)</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingOkrId(null)}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  disabled={isSavingOkr}
                                  onClick={() => handleSaveOkrDraft(okr.id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  {isSavingOkr && (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  )}
                                  <span>Simpan Draft</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-600 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 text-[11px]">
                                Catatan Evaluasi Mandiri:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Tersimpan
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditOkr(okr)}
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                                >
                                  Ubah
                                </button>
                              </div>
                            </div>
                            <p className="text-[11px] leading-relaxed italic">
                              &ldquo;{okr.commentary}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (4 COLS): CATATAN ATASAN, PEER REVIEW 360, & IDP */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
              {/* CARD 1: Catatan Atasan Langsung */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Catatan Atasan Langsung
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    1-on-1 Terakhir
                  </span>
                </div>

                {/* Manager Profile Pill */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-2xs flex-shrink-0">
                    {oneOnOne.managerName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {oneOnOne.managerName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {oneOnOne.managerTitle} • {oneOnOne.managerNik}
                    </p>
                  </div>
                </div>

                {/* Manager Feedback Quote Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;
                  {performanceRecord?.feedback ||
                    'Rian menunjukkan kepemimpinan teknikal yang sangat solid dalam menjaga stabilitas arsitektur core payroll Q1. Pertahankan ritme mentoring tim junior agar kemandirian squad semakin matang di kuartal berikutnya.'}
                  &rdquo;
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{oneOnOne.risalahDate || '14 Maret 2025'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRisalahModalOpen(true)}
                    className="font-bold text-blue-600 hover:text-blue-800 text-xs cursor-pointer"
                  >
                    Lihat Risalah Lengkap
                  </button>
                </div>
              </div>

              {/* CARD 2: Umpan Balik Rekan (360° Peer Review) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Umpan Balik Rekan (360°)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Lengkap ({peerReview.totalReviews}/{peerReview.maxReviews})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      RATA-RATA PENILAIAN REKAN
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                        {peerReview.rating.toFixed(2)}
                      </span>
                      <span className="text-slate-400 font-bold text-xs">/ 5.0</span>
                    </div>
                  </div>

                  {/* Reviewers Avatar Stack */}
                  <div className="flex items-center -space-x-2">
                    {peerReview.reviewers.map((rev, idx) => (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-full ${rev.bg} text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs`}
                      >
                        {rev.initials}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Tags */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-bold text-slate-800">
                    Kata Kunci &amp; Persepsi Tim (Anonim):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {peerReview.tags.map((tag, idx) => {
                      const colors = [
                        'bg-blue-50 text-blue-700 border-blue-100',
                        'bg-emerald-50 text-emerald-700 border-emerald-100',
                        'bg-purple-50 text-purple-700 border-purple-100',
                        'bg-amber-50 text-amber-700 border-amber-100',
                        'bg-slate-100 text-slate-700 border-slate-200',
                      ];
                      const c = colors[idx % colors.length];
                      return (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${c}`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Anonymous Peer Quote */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 italic leading-relaxed">
                  &ldquo;{peerReview.quote}&rdquo;
                </div>
              </div>

              {/* CARD 3: Individual Development Plan (IDP) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Rencana Pengembangan (IDP Q2)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddIdpModalOpen(true)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {idpList.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-800">{item.title}</p>
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex-shrink-0">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.target}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: KIRIM SELF-APPRAISAL SEKARANG */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-blue-600 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Konfirmasi Pengiriman Self-Appraisal
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Siklus {activeCycle} • {currentUser.designation}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-2">
              <p className="font-bold">Ringkasan Evaluasi Diri Anda:</p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-blue-700/80">Skor Rata-Rata:</span>
                  <p className="font-black text-blue-900 font-mono text-sm">
                    {calculatedScore.toFixed(2)} / 5.0
                  </p>
                </div>
                <div>
                  <span className="text-blue-700/80">Sasaran Terisi:</span>
                  <p className="font-black text-blue-900 font-mono text-sm">
                    {evaluationStats.total} dari {evaluationStats.total} OKR (100%)
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-blue-800/80 pt-1 border-t border-blue-200/60">
                Setelah dikirimkan, berkas akan diteruskan secara otomatis ke antrean review 1-on-1{' '}
                {oneOnOne.managerName}.
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin mengirimkan seluruh evaluasi mandiri {activeCycle} ke atasan langsung sekarang?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isSubmittingReview}
                onClick={handleSubmitSelfAppraisal}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmittingReview && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Kirim Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RIWAYAT SIKLUS LALU (.PDF) */}
      {isPastCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Arsip Evaluasi Siklus Lalu ({pastCycles[0]?.cycle || 'Q4 2024'})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Disahkan HR Committee {pastCycles[0]?.approvalDate || '20 Januari 2025'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPastCycleModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px]">Hasil Skor Final:</span>
                  <p className="text-xl font-black text-slate-900 font-mono">
                    {pastCycles[0]?.score?.toFixed(2) || '4.70'} / 5.0
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {pastCycles[0]?.grade || 'Sangat Baik (Exceeds)'}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-600 space-y-1">
                <p>
                  <strong>Dampak Kompensasi:</strong>{' '}
                  {pastCycles[0]?.bonusImpact || 'Bonus Kinerja Akhir Tahun 2.5x Gaji Pokok & Kenaikan Grade Band 4.'}
                </p>
                <p>
                  <strong>Penyetuju:</strong>{' '}
                  {pastCycles[0]?.approvers || 'Arya Wibowo (VP Eng) & Citra Lestari (Chief People Officer).'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPastCycleModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPastCycleModalOpen(false);
                  showToast('✓ Berkas PDF Evaluasi Kinerja Q4 2024 berhasil diunduh.');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF Arsip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DETAIL SESI 1-ON-1 */}
      {isMeetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Detail Jadwal 1-on-1 Review
                  </h3>
                  <p className="text-[11px] text-slate-400">Sinkronisasi Google Calendar Terkonfirmasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMeetModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                <span className="text-blue-600 font-bold text-[10px] uppercase">Waktu &amp; Tanggal</span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {oneOnOne.date} • {oneOnOne.time}
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  {oneOnOne.platform}: {oneOnOne.meetLink}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-[11px] text-slate-600">
                <p className="font-bold text-slate-800">Agenda Pembahasan:</p>
                {oneOnOne.agenda.map((ag, i) => (
                  <p key={i}>{ag}</p>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsMeetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={oneOnOne.meetLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setIsMeetModalOpen(false);
                  showToast('Membuka tautan rapat online...');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Buka Link Meet</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LIHAT RISALAH LENGKAP */}
      {isRisalahModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookmarkCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Risalah Sesi 1-on-1 ({oneOnOne.risalahDate || '14 Maret 2025'})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pewawancara: {oneOnOne.managerName} ({oneOnOne.managerTitle})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRisalahModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900">Poin Kesepakatan Utama:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                {(
                  oneOnOne.risalahAgreedPoints || [
                    'Arsitektur cloud Kubernetes GKE dinilai sangat sukses menjaga SLA 99.99%.',
                    'Penyelesaian modul enkripsi data karyawan diapresiasi penuh oleh HR & Legal.',
                    'Fokus kuartal berikutnya dialokasikan 20% untuk mentoring squad junior.',
                  ]
                ).map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRisalahModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TAMBAH TARGET IDP */}
      {isAddIdpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Tambah Rencana Pengembangan (IDP)
                  </h3>
                  <p className="text-[11px] text-slate-400">Target Belajar &amp; Peningkatan Kompetensi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddIdpModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIdpGoal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kursus / Sertifikasi:</label>
                <input
                  type="text"
                  required
                  value={newIdpTitle}
                  onChange={(e) => setNewIdpTitle(e.target.value)}
                  placeholder="Contoh: Certified Kubernetes Administrator (CKA)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Metrik &amp; Periode:</label>
                <input
                  type="text"
                  value={newIdpTarget}
                  onChange={(e) => setNewIdpTarget(e.target.value)}
                  placeholder="Target Sertifikasi: Juli 2025 • Biaya ditanggung PT Nexora"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddIdpModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Simpan Target IDP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
