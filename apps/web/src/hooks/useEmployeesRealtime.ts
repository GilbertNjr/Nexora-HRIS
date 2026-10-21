'use client';

import { useEffect, useRef } from 'react';
import { playNotificationSound } from './useApprovalsRealtime';

export interface EmployeesRealtimeOptions {
  onEmployeeCreated?: (newEmp: any) => void;
  onEmployeeUpdated?: (updatedEmp: any) => void;
  onEmployeeDeleted?: (data: { id: string; permanent?: boolean }) => void;
  onCompanyUpdated?: (companyData: any) => void;
  onRefresh?: () => void;
  playAudioAlert?: boolean;
}

export function useEmployeesRealtime(options: EmployeesRealtimeOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    // 1. Establish Server-Sent Events (SSE) connection across multiple devices & networks
    try {
      eventSource = new EventSource('/api/v1/employees/stream');

      eventSource.addEventListener('EMPLOYEE_CREATED', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          const emp = parsed.payload;
          if (optionsRef.current.playAudioAlert) {
            playNotificationSound();
          }
          optionsRef.current.onEmployeeCreated?.(emp);
          optionsRef.current.onRefresh?.();
        } catch (err) {
          console.error('[EmployeeSSE] Failed to parse EMPLOYEE_CREATED:', err);
        }
      });

      eventSource.addEventListener('EMPLOYEE_UPDATED', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          optionsRef.current.onEmployeeUpdated?.(parsed.payload);
          optionsRef.current.onRefresh?.();
        } catch (err) {
          console.error('[EmployeeSSE] Failed to parse EMPLOYEE_UPDATED:', err);
        }
      });

      eventSource.addEventListener('EMPLOYEE_DELETED', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          optionsRef.current.onEmployeeDeleted?.(parsed.payload);
          optionsRef.current.onRefresh?.();
        } catch (err) {
          console.error('[EmployeeSSE] Failed to parse EMPLOYEE_DELETED:', err);
        }
      });

      eventSource.addEventListener('COMPANY_UPDATED', (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          optionsRef.current.onCompanyUpdated?.(parsed.payload);
          optionsRef.current.onRefresh?.();
        } catch (err) {
          console.error('[EmployeeSSE] Failed to parse COMPANY_UPDATED:', err);
        }
      });

      eventSource.onerror = () => {
        // EventSource will automatically retry in the background
      };
    } catch (err) {
      console.warn('[EmployeeSSE] EventSource not supported, fallback to polling:', err);
    }

    // 2. Intra-browser BroadcastChannel (Syncs tabs within the same machine instantly)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || !msg.type) return;

        if (msg.type === 'EMPLOYEES_UPDATED' || msg.type === 'EMPLOYEE_CREATED') {
          if (msg.employee) {
            optionsRef.current.onEmployeeCreated?.(msg.employee);
          }
          optionsRef.current.onRefresh?.();
        }
      };
    } catch {}

    // 3. Revalidate on Tab Focus / Visibility Change
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        optionsRef.current.onRefresh?.();
      }
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // 4. Fallback Polling (Every 12 seconds to ensure 100% data fresh across any network condition)
    pollInterval = setInterval(() => {
      optionsRef.current.onRefresh?.();
    }, 12000);

    return () => {
      if (eventSource) eventSource.close();
      if (channel) channel.close();
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);
}
