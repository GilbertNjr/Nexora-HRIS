'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Megaphone,
  X,
  ShieldCheck,
  Calendar,
  FileText,
  Printer,
  ChevronRight,
  ExternalLink,
  Volume2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export interface HrAnnouncementItem {
  id: string;
  badge: string;
  docNumber: string;
  title: string;
  summary: string;
  content: string;
  buttonText: string;
  priority: 'URGENT' | 'IMPORTANT' | 'INFO';
  publishedAt: string;
  author: string;
  isEmergency?: boolean;
  attachmentUrl?: string;
}

export function EmployeeAnnouncementBroadcastListener() {
  const [activeAnnouncement, setActiveAnnouncement] = useState<HrAnnouncementItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [floatingAlert, setFloatingAlert] = useState<HrAnnouncementItem | null>(null);
  const [allAnnouncements, setAllAnnouncements] = useState<HrAnnouncementItem[]>([]);
  const hasAudioPlayedRef = useRef<string | null>(null);

  // Synthesize soft pleasant audio chime
  const playHarmonicChime = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Double chime note (chord)
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playTone(523.25, 0, 0.25); // C5
      playTone(659.25, 0.1, 0.3); // E5
      playTone(783.99, 0.2, 0.4); // G5
    } catch {
      // ignore
    }
  }, []);

  // Fetch announcements on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/v1/announcements', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            setAllAnnouncements(json.data);
            if (json.data.length > 0 && !activeAnnouncement) {
              setActiveAnnouncement(json.data[0]);
            }
          }
        }
      } catch {
        // ignore
      }
    };

    fetchLatest();

    // 1. Cross-tab BroadcastChannel listener for immediate sync across tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('nexora_live_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ANNOUNCEMENT_PUBLISHED' && event.data?.payload) {
          const newAnn = event.data.payload as HrAnnouncementItem;
          handleNewAnnouncement(newAnn);
        }
      };
    } catch {
      // ignore
    }

    // 2. Server-Sent Events (SSE) listener for multi-device sync
    let sse: EventSource | null = null;
    try {
      sse = new EventSource('/api/v1/employees/stream');
      sse.addEventListener('ANNOUNCEMENT_PUBLISHED', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          const newAnn = parsed.payload as HrAnnouncementItem;
          if (newAnn && newAnn.title) {
            handleNewAnnouncement(newAnn);
          }
        } catch {}
      });
    } catch {
      // ignore
    }

    // 3. Custom event listener from NotificationBellDropdown or other triggers
    const handleOpenCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const meta = customEvent.detail;
      if (meta?.announcementId && allAnnouncements.length > 0) {
        const found = allAnnouncements.find((a) => a.id === meta.announcementId);
        if (found) {
          setActiveAnnouncement(found);
          setIsModalOpen(true);
          return;
        }
      }
      // If not found in memory, re-fetch
      fetch('/api/v1/announcements')
        .then((r) => r.json())
        .then((j) => {
          if (j.success && Array.isArray(j.data) && j.data.length > 0) {
            setAllAnnouncements(j.data);
            const found = j.data.find((a: HrAnnouncementItem) => a.id === meta?.announcementId) || j.data[0];
            setActiveAnnouncement(found);
            setIsModalOpen(true);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('nexora_open_announcement', handleOpenCustomEvent);

    return () => {
      isMounted = false;
      if (bc) bc.close();
      if (sse) sse.close();
      window.removeEventListener('nexora_open_announcement', handleOpenCustomEvent);
    };
  }, []);

  const handleNewAnnouncement = (newAnn: HrAnnouncementItem) => {
    setAllAnnouncements((prev) => {
      const filtered = prev.filter((a) => a.id !== newAnn.id);
      return [newAnn, ...filtered];
    });
    setActiveAnnouncement(newAnn);
    setFloatingAlert(newAnn);

    if (hasAudioPlayedRef.current !== newAnn.id) {
      hasAudioPlayedRef.current = newAnn.id;
      playHarmonicChime();
    }
  };

  const handleDismissFloating = () => {
    setFloatingAlert(null);
  };

  const handleOpenModal = (ann?: HrAnnouncementItem) => {
    if (ann) setActiveAnnouncement(ann);
    setIsModalOpen(true);
    setFloatingAlert(null);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* FLOATING REAL-TIME ANNOUNCEMENT ALERT TOAST */}
      {/* ========================================================= */}
      {floatingAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-32px)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 sm:p-5 rounded-2xl shadow-2xl border text-slate-900 bg-white/95 backdrop-blur-md relative overflow-hidden transition-all ${
              floatingAlert.priority === 'URGENT'
                ? 'border-rose-400 ring-2 ring-rose-500/30 shadow-rose-500/10'
                : 'border-amber-300 ring-2 ring-amber-500/20 shadow-amber-500/10'
            }`}
          >
            {/* Top decorative gradient bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                floatingAlert.priority === 'URGENT'
                  ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-blue-600'
              }`}
            />

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    floatingAlert.priority === 'URGENT'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Megaphone className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                        floatingAlert.priority === 'URGENT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {floatingAlert.badge || 'PENGUMUMAN HRD'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Baru Disiarkan</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {floatingAlert.docNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismissFloating}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Tutup banner notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              <h4 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                {floatingAlert.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {floatingAlert.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-medium">
                {floatingAlert.author || 'HR Operations'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDismissFloating}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Nanti Saja
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenModal(floatingAlert)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all active:scale-95 flex items-center gap-1 ${
                    floatingAlert.priority === 'URGENT'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  <span>{floatingAlert.buttonText || 'Baca Selengkapnya'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* COMPLETE DECREE / ANNOUNCEMENT MODAL */}
      {/* ========================================================= */}
      {isModalOpen && activeAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div
              className={`p-5 sm:p-6 text-white relative ${
                activeAnnouncement.priority === 'URGENT'
                  ? 'bg-gradient-to-r from-rose-700 via-rose-800 to-indigo-950'
                  : 'bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-950'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-white/10 text-white inline-flex items-center justify-center">
                      <Megaphone className="w-4 h-4" />
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider">
                      {activeAnnouncement.badge || 'PENGUMUMAN RESMI HRD'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Live Siaran HR</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug pt-1">
                    {activeAnnouncement.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-blue-100/90 font-medium">
                    <span>{activeAnnouncement.docNumber}</span>
                    <span>•</span>
                    <span>Diterbitkan: {activeAnnouncement.publishedAt}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
                  title="Tutup dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ringkasan Eksekutif Pengumuman</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Wajib Diketahui Seluruh Karyawan</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {activeAnnouncement.summary}
                </p>
              </div>

              {/* Complete Official Text / Decree */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ketetapan & Dokumen Kebijakan Lengkap</span>
                </h4>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 whitespace-pre-line leading-relaxed shadow-2xs font-mono text-[11.5px]">
                  {activeAnnouncement.content}
                </div>
              </div>

              {/* Authorized Signatory Info */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    HR
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{activeAnnouncement.author || 'Dewi Lestari, S.Psi'}</p>
                    <p className="text-[11px] text-slate-500">Divisi Sumber Daya Manusia & Operasional Perusahaan</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sah & Tervalidasi</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/70 border border-slate-200 transition-colors"
                title="Cetak atau unduh salinan pengumuman ini"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Cetak Dokumen</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Saya Mengerti & Telah Membaca
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
