'use client';

import { useEffect, useRef } from 'react';
import { playNotificationSound } from './useApprovalsRealtime';
import { subscribeSharedSSE } from '@/lib/sseClient';

export interface AuditRealtimeOptions {
  onAuditCreated?: (newLog: any) => void;
  onRefresh?: () => void;
  playAudioAlert?: boolean;
}

export function useAuditRealtime(options: AuditRealtimeOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    // 1. Subscribe to Shared SSE connection
    const unsubAudit = subscribeSharedSSE('/api/v1/audit/stream', 'AUDIT_LOG_CREATED', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const log = parsed.payload;
        if (optionsRef.current.playAudioAlert) {
          playNotificationSound();
        }
        optionsRef.current.onAuditCreated?.(log);
        optionsRef.current.onRefresh?.();
      } catch (err) {
        console.error('[AuditSSE] Failed to parse AUDIT_LOG_CREATED:', err);
      }
    });

    // 2. Intra-browser BroadcastChannel (Instant <5ms sync across open tabs)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        if (msg.type === 'AUDIT_LOG_CREATED' && msg.log) {
          optionsRef.current.onAuditCreated?.(msg.log);
          optionsRef.current.onRefresh?.();
        }
      };
    } catch {}

    // 3. Relaxed Smart Polling (Runs every 45s only when visible)
    pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        optionsRef.current.onRefresh?.();
      }
    }, 45000);

    return () => {
      unsubAudit();
      if (channel) channel.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);
}
