'use client';

import { useEffect, useRef } from 'react';
import { playNotificationSound } from './useApprovalsRealtime';
import { subscribeSharedSSE } from '@/lib/sseClient';

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
    let pollInterval: NodeJS.Timeout | null = null;

    // 1. Subscribe to Shared SSE Stream (Zero socket waste across components)
    const unsubCreated = subscribeSharedSSE('/api/v1/employees/stream', 'EMPLOYEE_CREATED', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (optionsRef.current.playAudioAlert) playNotificationSound();
        optionsRef.current.onEmployeeCreated?.(parsed.payload);
        optionsRef.current.onRefresh?.();
      } catch (err) {
        console.error('[EmployeeSSE] Failed to parse EMPLOYEE_CREATED:', err);
      }
    });

    const unsubUpdated = subscribeSharedSSE('/api/v1/employees/stream', 'EMPLOYEE_UPDATED', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        optionsRef.current.onEmployeeUpdated?.(parsed.payload);
        optionsRef.current.onRefresh?.();
      } catch (err) {
        console.error('[EmployeeSSE] Failed to parse EMPLOYEE_UPDATED:', err);
      }
    });

    const unsubDeleted = subscribeSharedSSE('/api/v1/employees/stream', 'EMPLOYEE_DELETED', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        optionsRef.current.onEmployeeDeleted?.(parsed.payload);
        optionsRef.current.onRefresh?.();
      } catch (err) {
        console.error('[EmployeeSSE] Failed to parse EMPLOYEE_DELETED:', err);
      }
    });

    const unsubCompany = subscribeSharedSSE('/api/v1/employees/stream', 'COMPANY_UPDATED', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        optionsRef.current.onCompanyUpdated?.(parsed.payload);
        optionsRef.current.onRefresh?.();
      } catch (err) {
        console.error('[EmployeeSSE] Failed to parse COMPANY_UPDATED:', err);
      }
    });

    // 2. Intra-browser BroadcastChannel (Instant multi-tab sync without network)
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

    // 4. Relaxed Fallback Polling (Every 45s, only when tab is visible)
    pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        optionsRef.current.onRefresh?.();
      }
    }, 45000);

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubCompany();
      if (channel) channel.close();
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);
}
