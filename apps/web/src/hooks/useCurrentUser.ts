'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CurrentUser {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  email: string;
  roles: string[];
  primaryRole: string;
  department: string;
  designation: string;
  avatarUrl: string;
  initials: string;
}

const DEFAULT_USER: CurrentUser = {
  id: 'usr-emp-default',
  fullName: 'Rian Pratama, S.Kom',
  firstName: 'Rian',
  lastName: 'Pratama',
  employeeNumber: 'NX-2021008',
  email: 'rian.pratama@nexora.co.id',
  roles: ['EMPLOYEE'],
  primaryRole: 'EMPLOYEE',
  department: 'Technology & Engineering',
  designation: 'Lead Backend Architect',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  initials: 'RP',
};

function getInitials(name: string): string {
  if (!name) return 'NX';
  const clean = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NX';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function parseStoredUser(): CurrentUser {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const raw = localStorage.getItem('nexora_user');
    if (!raw) return DEFAULT_USER;
    const parsed = JSON.parse(raw);

    const fullName = parsed.fullName || parsed.name || DEFAULT_USER.fullName;
    const nameParts = fullName.split(' ');
    const firstName = parsed.firstName || nameParts[0] || 'Karyawan';
    const lastName = parsed.lastName || nameParts.slice(1).join(' ') || '';
    const employeeNumber = parsed.employeeNumber || parsed.nik || parsed.employee_number || DEFAULT_USER.employeeNumber;
    const email = parsed.email || DEFAULT_USER.email;
    const roles = Array.isArray(parsed.roles) ? parsed.roles : [parsed.primaryRole || 'EMPLOYEE'];
    const primaryRole = parsed.primaryRole || roles[0] || 'EMPLOYEE';
    const department = parsed.department || DEFAULT_USER.department;
    const designation = parsed.designation || parsed.role || DEFAULT_USER.designation;
    const avatarUrl = parsed.avatarUrl || parsed.avatar_url || DEFAULT_USER.avatarUrl;
    const initials = getInitials(fullName);

    return {
      id: parsed.id || DEFAULT_USER.id,
      fullName,
      firstName,
      lastName,
      employeeNumber,
      email,
      roles,
      primaryRole,
      department,
      designation,
      avatarUrl,
      initials,
    };
  } catch {
    return DEFAULT_USER;
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(DEFAULT_USER);
  const [isReady, setIsReady] = useState(false);

  const refreshUser = useCallback(() => {
    const current = parseStoredUser();
    setUser(current);
    setIsReady(true);
  }, []);

  useEffect(() => {
    refreshUser();

    // Listen to changes in localStorage from other tabs or components
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nexora_user') {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorage);

    // Listen to BroadcastChannel events
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'USER_LOGGED_IN' || event.data?.type === 'PROFILE_UPDATED') {
          refreshUser();
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [refreshUser]);

  const updateLocalUser = useCallback((partial: Partial<CurrentUser>) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      if (partial.fullName) {
        next.initials = getInitials(partial.fullName);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexora_user', JSON.stringify(next));
        try {
          const ch = new BroadcastChannel('nexora_live_sync');
          ch.postMessage({ type: 'PROFILE_UPDATED', user: next });
          ch.close();
        } catch {}
      }
      return next;
    });
  }, []);

  return {
    user,
    isReady,
    updateLocalUser,
    refreshUser,
  };
}
