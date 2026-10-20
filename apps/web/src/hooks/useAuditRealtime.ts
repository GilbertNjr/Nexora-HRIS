'use client';

import { useEffect, useRef } from 'react';
import { playNotificationSound } from './useApprovalsRealtime';

export interface AuditRealtimeOptions {
  onAuditCreated?: (newLog: any) => void;
  onRefresh?: () => void;
  playAudioAlert?: boolean;
}

export function useAuditRealtime(options: AuditRealtimeOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    // 1. Establish Server-Sent Events (SSE) connection
    try {
      eventSource = new EventSource('/api/v1/audit/stream');

      eventSource.addEventListener('AUDIT_LOG_CREATED', (event: MessageEvent) => {
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

      eventSource.onerror = () => {
        // EventSource will automatically retry in the background
      };
    } catch (err) {
      console.warn('[AuditSSE] EventSource not supported, fallback to BroadcastChannel:', err);
    }

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

    // 3. Fallback Smart Polling (Runs every 12 seconds to guarantee sync)
    pollInterval = setInterval(() => {
      optionsRef.current.onRefresh?.();
    }, 12000);

    return () => {
      if (eventSource) eventSource.close();
      if (channel) channel.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);
}
