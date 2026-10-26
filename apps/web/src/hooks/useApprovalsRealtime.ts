'use client';

import { useEffect, useRef } from 'react';
import { subscribeSharedSSE } from '@/lib/sseClient';

export interface ApprovalsRealtimeOptions {
  onLeaveSubmitted?: (newItem: any) => void;
  onLeaveActioned?: (data: { id: string; status: 'APPROVED' | 'REJECTED'; item: any }) => void;
  onRefresh?: () => void;
  playAudioAlert?: boolean;
}

// Gentle pleasant notification chime using Web Audio API (Zero external mp3 asset required)
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Arpeggio note C5 -> E5 -> G5
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch {
    // Ignore audio permission restrictions
  }
}

export function useApprovalsRealtime(options: ApprovalsRealtimeOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    // 1. Subscribe to Shared SSE connection multiplexed across the browser tab
    const unsubSubmitted = subscribeSharedSSE('/api/v1/employees/stream', 'LEAVE_SUBMITTED', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const item = parsed.payload;
        if (optionsRef.current.playAudioAlert) {
          playNotificationSound();
        }
        optionsRef.current.onLeaveSubmitted?.(item);
        optionsRef.current.onRefresh?.();
      } catch (err) {
        console.error('[SSE] Failed to parse LEAVE_SUBMITTED:', err);
      }
    });

    const unsubActioned = subscribeSharedSSE('/api/v1/employees/stream', 'LEAVE_ACTIONED', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        optionsRef.current.onLeaveActioned?.(parsed.payload);
        optionsRef.current.onRefresh?.();
      } catch (err) {
        console.error('[SSE] Failed to parse LEAVE_ACTIONED:', err);
      }
    });

    // 2. Intra-browser BroadcastChannel (Instant <5ms sync for tabs on the same computer)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        if (msg.type === 'APPROVAL_SUBMITTED' || msg.type === 'NEW_APPROVAL_REQUEST') {
          if (msg.request) {
            optionsRef.current.onLeaveSubmitted?.(msg.request);
          }
          optionsRef.current.onRefresh?.();
        } else if (msg.type === 'APPROVAL_UPDATED') {
          optionsRef.current.onLeaveActioned?.({
            id: msg.id,
            status: msg.status,
            item: msg.item,
          });
          optionsRef.current.onRefresh?.();
        }
      };
    } catch {}

    // 3. Revalidate on Tab Focus
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        optionsRef.current.onRefresh?.();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    // 4. Relaxed Smart Fallback Polling (Every 45 seconds when tab is active)
    pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        optionsRef.current.onRefresh?.();
      }
    }, 45000);

    return () => {
      unsubSubmitted();
      unsubActioned();
      if (channel) channel.close();
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);
}
