'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  CalendarCheck,
  CreditCard,
  UserPlus,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Filter,
  Megaphone,
} from 'lucide-react';
import { subscribeSharedSSE } from '@/lib/sseClient';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'attendance' | 'leave' | 'payroll' | 'employee' | 'system' | 'security';
  type: 'info' | 'success' | 'warning' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  actor?: {
    name: string;
    initials: string;
    avatarColor?: string;
    avatarUrl?: string;
  };
  metadata?: Record<string, any>;
}

interface NotificationBellDropdownProps {
  portal?: 'admin' | 'ess';
}

export function NotificationBellDropdown({ portal = 'admin' }: NotificationBellDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'approvals' | 'system'>('all');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
  const [hasNewAlert, setHasNewAlert] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  // Synthesize soft audio chime without external mp3
  const playNotificationChime = useCallback(() => {
    if (!isSoundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch {
      // ignore
    }
  }, [isSoundEnabled]);

  // Load notifications from API
  const fetchNotifications = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch('/api/v1/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data)) {
        const items: NotificationItem[] = json.data;
        const count: number = json.unreadCount ?? items.filter((n) => !n.isRead).length;

        // Check if fresh unread notification arrived
        if (!isSilent && prevCountRef.current !== undefined && count > prevCountRef.current) {
          playNotificationChime();
          setHasNewAlert(true);
          setTimeout(() => setHasNewAlert(false), 4000);
        }

        prevCountRef.current = count;
        setNotifications(items);
        setUnreadCount(count);
      }
    } catch {
      // ignore
    }
  }, [playNotificationChime]);

  // Initial load + Sound preference
  useEffect(() => {
    try {
      const soundPref = localStorage.getItem('nexora_notif_sound');
      if (soundPref !== null) setIsSoundEnabled(soundPref === 'true');
    } catch {}

    fetchNotifications(true);

    // Smart fallback polling every 45 seconds (only when tab is visible)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchNotifications(false);
      }
    }, 45000);

    // Cross-tab BroadcastChannel listener for instantaneous live events
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (
          msg?.type === 'NEW_NOTIFICATION' ||
          msg?.type === 'APPROVAL_SUBMITTED' ||
          msg?.type === 'APPROVAL_STATUS_CHANGED' ||
          msg?.type === 'ATTENDANCE_RECORDED' ||
          msg?.type === 'ANNOUNCEMENT_PUBLISHED'
        ) {
          fetchNotifications(false);
        }
      };
    } catch {
      // ignore
    }

    // Server-Sent Events (SSE) listener using shared multiplexed socket
    const unsubAnnouncement = subscribeSharedSSE('/api/v1/employees/stream', 'ANNOUNCEMENT_PUBLISHED', () => {
      fetchNotifications(false);
    });
    const unsubNotification = subscribeSharedSSE('/api/v1/employees/stream', 'NEW_NOTIFICATION', () => {
      fetchNotifications(false);
    });

    // Refresh on window focus
    const handleFocus = () => fetchNotifications(false);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      if (channel) channel.close();
      unsubAnnouncement();
      unsubNotification();
    };
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('nexora_notif_sound', String(next));
      return next;
    });
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      prevCountRef.current = 0;

      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });

      // Broadcast update
      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'NEW_NOTIFICATION' });
        ch.close();
      } catch {}
    } catch {
      // ignore
    }
  };

  // Mark single as read/unread
  const handleToggleRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const target = notifications.find((n) => n.id === id);
      if (!target) return;
      const nextIsRead = !target.isRead;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: nextIsRead } : n))
      );
      setUnreadCount((prev) => (nextIsRead ? Math.max(0, prev - 1) : prev + 1));

      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: nextIsRead }),
      });
    } catch {
      // ignore
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await fetch(`/api/v1/notifications?id=${id}`, {
        method: 'DELETE',
      });
    } catch {
      // ignore
    }
  };

  // Clear all
  const handleClearAll = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      prevCountRef.current = 0;

      await fetch('/api/v1/notifications?action=clear_all', {
        method: 'DELETE',
      });
    } catch {
      // ignore
    }
  };

  // Quick Approval Action directly inside notification popover
  const handleQuickApproval = async (
    notifId: string,
    reqId: string,
    status: 'APPROVED' | 'REJECTED',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      setIsProcessingAction(notifId);
      // 1. Call approvals API
      await fetch('/api/v1/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reqId, status }),
      });

      // 2. Mark this notification as read
      await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notifId, isRead: true }),
      });

      // 3. Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId
            ? {
                ...n,
                isRead: true,
                message: `✓ Pengajuan telah ${status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'}.`,
                type: status === 'APPROVED' ? 'success' : 'info',
              }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // 4. Broadcast live sync
      try {
        const ch = new BroadcastChannel('nexora_live_sync');
        ch.postMessage({ type: 'APPROVAL_STATUS_CHANGED', reqId, status });
        ch.close();
      } catch {}
    } catch {
      // ignore
    } finally {
      setIsProcessingAction(null);
    }
  };

  // Notification item click
  const handleItemClick = (notif: NotificationItem) => {
    if (!notif.isRead) {
      handleToggleRead(notif.id);
    }
    setIsOpen(false);
    if (notif.metadata?.isAnnouncement && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('nexora_open_announcement', { detail: notif.metadata })
      );
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  // Format relative timestamp in Indonesian
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 2) return 'Baru saja';
      if (diffMin < 60) return `${diffMin} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      return `${diffDays} hari lalu`;
    } catch {
      return 'Baru saja';
    }
  };

  // Filter items
  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.isRead;
    if (activeFilter === 'approvals') return item.category === 'leave';
    if (activeFilter === 'system') return item.category === 'attendance' || item.category === 'system' || item.category === 'payroll' || item.category === 'security';
    return true;
  });

  const getCategoryIcon = (category: NotificationItem['category'], metadata?: Record<string, any>) => {
    if (metadata?.isAnnouncement) {
      return <Megaphone className="w-4 h-4 text-amber-600" />;
    }
    switch (category) {
      case 'leave':
        return <CalendarCheck className="w-4 h-4 text-amber-600" />;
      case 'attendance':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'payroll':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'employee':
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBg = (category: NotificationItem['category'], metadata?: Record<string, any>) => {
    if (metadata?.isAnnouncement) {
      return 'bg-amber-50 border-amber-200/80';
    }
    switch (category) {
      case 'leave':
        return 'bg-amber-50 border-amber-200/80';
      case 'attendance':
        return 'bg-blue-50 border-blue-200/80';
      case 'payroll':
        return 'bg-emerald-50 border-emerald-200/80';
      case 'employee':
        return 'bg-purple-50 border-purple-200/80';
      case 'security':
        return 'bg-rose-50 border-rose-200/80';
      default:
        return 'bg-slate-50 border-slate-200/80';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Pusat Notifikasi Real-Time"
        className={`relative p-2 rounded-xl transition-all active:scale-95 ${
          isOpen
            ? 'bg-blue-50 text-blue-700 shadow-xs'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`}
        title={`Pusat Notifikasi (${unreadCount} belum dibaca)`}
      >
        <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 && (
          <>
            {hasNewAlert && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-400 animate-ping opacity-75 pointer-events-none" />
            )}
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[360px] sm:w-[440px] max-w-[calc(100vw-24px)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      Pusat Notifikasi
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Real-Time</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {unreadCount > 0
                      ? `${unreadCount} pemberitahuan baru butuh tinjauan`
                      : 'Semua notifikasi telah dibaca'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                {/* Audio chime toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title={isSoundEnabled ? 'Suara notifikasi aktif' : 'Suara notifikasi dibisukan'}
                >
                  {isSoundEnabled ? (
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills & Quick Actions Bar */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    activeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    activeFilter === 'unread'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Belum Dibaca ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('approvals')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    activeFilter === 'approvals'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Persetujuan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('system')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    activeFilter === 'system'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Sistem
                </button>
              </div>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                  title="Tandai semua sebagai sudah dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tandai Dibaca</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Tidak ada notifikasi</h4>
                <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                  Semua aktivitas kepegawaian dan persetujuan telah ditinjau secara lengkap.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-4 transition-colors cursor-pointer group relative flex items-start gap-3.5 ${
                    notif.isRead
                      ? 'bg-white hover:bg-slate-50/70'
                      : 'bg-blue-50/30 hover:bg-blue-50/60'
                  }`}
                >
                  {/* Category icon badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-2xs ${getCategoryBg(
                      notif.category,
                      notif.metadata
                    )}`}
                  >
                    {getCategoryIcon(notif.category, notif.metadata)}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-xs font-bold leading-snug line-clamp-1 ${
                          notif.isRead ? 'text-slate-800' : 'text-slate-900'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    {/* Quick Action buttons for approvals */}
                    {notif.metadata?.requestId && !notif.isRead && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isProcessingAction === notif.id}
                          onClick={(e) =>
                            handleQuickApproval(notif.id, notif.metadata?.requestId, 'APPROVED', e)
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition-all active:scale-95 disabled:opacity-60 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Setujui</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessingAction === notif.id}
                          onClick={(e) =>
                            handleQuickApproval(notif.id, notif.metadata?.requestId, 'REJECTED', e)
                          }
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold shadow-2xs transition-all active:scale-95 disabled:opacity-60 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}

                    {/* Footer Row: Actor & Direct Action Link */}
                    <div className="flex items-center justify-between gap-2 pt-1.5">
                      {notif.actor ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                          <span
                            className={`w-4 h-4 rounded-full bg-gradient-to-tr ${
                              notif.actor.avatarColor || 'from-slate-600 to-slate-800'
                            } text-white flex items-center justify-center font-bold text-[8px] flex-shrink-0`}
                          >
                            {notif.actor.initials}
                          </span>
                          <span className="truncate max-w-[140px]">{notif.actor.name}</span>
                        </div>
                      ) : (
                        <span />
                      )}

                      {notif.actionLabel && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 group-hover:text-blue-700">
                          <span>{notif.actionLabel}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover action controls: Toggle read & Delete */}
                  <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(notif.id, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title={notif.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Hapus notifikasi ini"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 absolute right-3 top-4 shadow-xs" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <Link
              href={portal === 'admin' ? '/admin/audit' : '/ess'}
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              <span>Buka Log Aktivitas Lengkap</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors font-medium"
              >
                Bersihkan Semua
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
