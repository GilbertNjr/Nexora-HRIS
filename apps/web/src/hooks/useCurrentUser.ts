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
  phone?: string;
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
  avatarUrl: '',
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
    const rawUser = localStorage.getItem('nexora_user');
    const rawEmp = localStorage.getItem('nexora_employee_profile');

    const parsedUser = rawUser ? JSON.parse(rawUser) : null;
    const parsedEmp = rawEmp ? JSON.parse(rawEmp) : null;

    // Check if parsedEmp belongs to the same user as parsedUser
    let validEmp: any = null;
    if (parsedEmp && parsedUser) {
      const sameNik =
        parsedEmp.employeeNumber &&
        parsedUser.employeeNumber &&
        parsedEmp.employeeNumber.toLowerCase().trim() === parsedUser.employeeNumber.toLowerCase().trim();
      const sameEmail =
        parsedEmp.email &&
        parsedUser.email &&
        parsedEmp.email.toLowerCase().trim() === parsedUser.email.toLowerCase().trim();
      if (sameNik || sameEmail) {
        validEmp = parsedEmp;
      } else {
        // Discard stale employee profile cached from a previous session/account
        try {
          localStorage.removeItem('nexora_employee_profile');
        } catch {}
      }
    } else if (parsedEmp && !parsedUser) {
      validEmp = parsedEmp;
    }

    // Determine the active user base
    const base = parsedUser || validEmp;
    if (!base) return DEFAULT_USER;

    const rawFullName =
      (parsedUser && parsedUser.fullName) ||
      (parsedUser && parsedUser.name) ||
      (validEmp && validEmp.fullName) ||
      (validEmp && validEmp.name) ||
      DEFAULT_USER.fullName;

    const cleanRaw = rawFullName.trim();
    const fullName = cleanRaw
      ? cleanRaw
          .split(/\s+/)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Karyawan';

    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName =
      (parsedUser && parsedUser.firstName && (parsedUser.firstName.charAt(0).toUpperCase() + parsedUser.firstName.slice(1))) ||
      (nameParts.length > 0 ? nameParts[0] : 'Karyawan');
    const lastName =
      (parsedUser && parsedUser.lastName) ||
      (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

    const employeeNumber =
      (parsedUser && (parsedUser.employeeNumber || parsedUser.nik || parsedUser.employee_number)) ||
      (validEmp && (validEmp.employeeNumber || validEmp.nik)) ||
      DEFAULT_USER.employeeNumber;

    const email =
      (parsedUser && (parsedUser.email || parsedUser.emailCompany)) ||
      (validEmp && validEmp.email) ||
      DEFAULT_USER.email;

    const roles = Array.isArray(base.roles)
      ? base.roles
      : [base.primaryRole || 'EMPLOYEE'];

    const primaryRole = base.primaryRole || roles[0] || 'EMPLOYEE';
    const department = base.department || (validEmp && validEmp.department) || DEFAULT_USER.department;
    const designation = base.designation || base.role || (validEmp && validEmp.designation) || DEFAULT_USER.designation;

    let avatarUrl =
      typeof (validEmp?.avatarUrl || base.avatarUrl) === 'string'
        ? (validEmp?.avatarUrl || base.avatarUrl)
        : '';

    // Ignore corrupted test strings
    if (avatarUrl && avatarUrl.includes('TESTING_AVATAR')) {
      avatarUrl = '';
    }

    const initials = getInitials(fullName);

    return {
      id: base.id || DEFAULT_USER.id,
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
      phone: validEmp?.phone || parsedUser?.phone,
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

    // 1. Fetch live profile from database on mount for the CURRENT logged-in employee
    let isMounted = true;
    const fetchLiveUser = async () => {
      try {
        const currentStored = parseStoredUser();
        const empNum = currentStored.employeeNumber || '';
        const empEmail = currentStored.email || '';
        if (!empNum && !empEmail) return;

        const query = empNum
          ? `employeeNumber=${encodeURIComponent(empNum)}`
          : `email=${encodeURIComponent(empEmail)}`;

        const res = await fetch(`/api/v1/profile?role=employee&${query}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setUser((prev) => {
              // Ensure we only update if the returned profile belongs to the currently active user
              if (
                json.data.employeeNumber &&
                prev.employeeNumber &&
                json.data.employeeNumber.toLowerCase() !== prev.employeeNumber.toLowerCase()
              ) {
                return prev;
              }

              const liveAvatar = json.data.avatarUrl;
              const hasValidLiveAvatar =
                typeof liveAvatar === 'string' &&
                liveAvatar.length > 15 &&
                !liveAvatar.includes('TESTING_AVATAR');

              const nextAvatar = hasValidLiveAvatar ? liveAvatar : prev.avatarUrl;

              const rawLive = (json.data.fullName || prev.fullName || '').trim();
              const cleanName = rawLive
                ? rawLive
                    .split(/\s+/)
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')
                : prev.fullName;
              const nameParts = cleanName.split(/\s+/).filter(Boolean);
              const nextFirstName =
                json.data.firstName
                  ? json.data.firstName.charAt(0).toUpperCase() + json.data.firstName.slice(1)
                  : nameParts.length > 0
                  ? nameParts[0]
                  : prev.firstName;
              const nextLastName =
                json.data.lastName ||
                (nameParts.length > 1 ? nameParts.slice(1).join(' ') : prev.lastName);

              const updated: CurrentUser = {
                ...prev,
                fullName: cleanName || prev.fullName,
                firstName: nextFirstName,
                lastName: nextLastName,
                employeeNumber: json.data.employeeNumber || prev.employeeNumber,
                department: json.data.department || prev.department,
                designation: json.data.designation || prev.designation,
                email: json.data.email || prev.email,
                phone: json.data.phone || (prev as any).phone,
                avatarUrl: nextAvatar,
              };
              if (cleanName) {
                updated.initials = getInitials(cleanName);
              }
              try {
                localStorage.setItem('nexora_user', JSON.stringify(updated));
                localStorage.setItem('nexora_employee_profile', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }
      } catch {}
    };

    fetchLiveUser();

    // 2. Listen to changes in localStorage from other tabs or components
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nexora_user' || e.key === 'nexora_employee_profile') {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorage);

    // 3. Listen to BroadcastChannel events
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        if (
          event.data?.type === 'USER_LOGGED_IN' ||
          event.data?.type === 'PROFILE_UPDATED' ||
          event.data?.type === 'EMPLOYEE_UPDATED'
        ) {
          if (event.data?.profile || event.data?.user) {
            const p = event.data.profile || event.data.user;
            setUser((prev) => {
              const nextAvatar = p.avatarUrl !== undefined ? p.avatarUrl : prev.avatarUrl;
              const next: CurrentUser = {
                ...prev,
                ...p,
                avatarUrl: nextAvatar,
              };
              if (p.fullName) {
                next.initials = getInitials(p.fullName);
              }
              return next;
            });
          } else {
            refreshUser();
          }
        }
      };
    } catch {}

    return () => {
      isMounted = false;
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
        localStorage.setItem('nexora_employee_profile', JSON.stringify(next));
        try {
          const ch = new BroadcastChannel('nexora_live_sync');
          ch.postMessage({ type: 'PROFILE_UPDATED', user: next, profile: next });
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
