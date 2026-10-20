'use client';

import { useEffect, useRef } from 'react';

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
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let isConnected = false;

    // 1. Establish Server-Sent Events (SSE) connection (Works across multiple devices & networks)
    try {
      eventSource = new EventSource('/api/v1/approvals/stream');

      eventSource.addEventListener('connected', () => {
        isConnected = true;
      });

      eventSource.addEventListener('LEAVE_SUBMITTED', (event: MessageEvent) => {
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

      eventSource.addEventListener('LEAVE_ACTIONED', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          optionsRef.current.onLeaveActioned?.(parsed.payload);
          optionsRef.current.onRefresh?.();
        } catch (err) {
          console.error('[SSE] Failed to parse LEAVE_ACTIONED:', err);
        }
      });

      eventSource.onerror = () => {
        isConnected = false;
        // EventSource will automatically retry in the background
      };
    } catch (err) {
      console.warn('[SSE] EventSource not supported, using smart polling fallback:', err);
    }

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

    // 3. Fallback Smart Polling (Runs every 10 seconds to ensure 100% data freshness)
    pollInterval = setInterval(() => {
      optionsRef.current.onRefresh?.();
    }, 10000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (channel) {
        channel.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);
}
