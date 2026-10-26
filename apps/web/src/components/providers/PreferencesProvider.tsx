'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface NotificationSetting {
  id: string;
  category: string;
  description: string;
  badge?: { text: string; color: 'red' | 'amber' | 'blue' };
  email: boolean;
  whatsapp: boolean;
  push: boolean;
}

export interface SystemPreferences {
  themeMode: 'light' | 'dark' | 'system';
  tableDensity: 'compact' | 'normal' | 'spacious';
  fontSize: 'standard' | 'large';
  microAnimations: boolean;
  highContrast: boolean;
  screenReaderSupport: boolean;
  audioFeedback: boolean;
  language: 'id' | 'en';
  dateFormat: string;
  timezone: string;
  notifications: NotificationSetting[];
}

export const DEFAULT_NOTIFICATIONS: NotificationSetting[] = [
  {
    id: 'leave',
    category: 'Permohonan Cuti & Izin Staf',
    description: 'Pengajuan cuti tahunan, sakit, dan izin dispensasi bawahan langsung',
    email: true,
    whatsapp: true,
    push: true,
  },
  {
    id: 'overtime',
    category: 'Pengajuan Lembur (SPL) & Koreksi Absensi',
    description: 'Surat Perintah Lembur dan verifikasi lupa tap check-in/out',
    email: true,
    whatsapp: false,
    push: true,
  },
  {
    id: 'payroll',
    category: 'Rekonsiliasi & Cut-Off Payroll Bulanan',
    description: 'Validasi kalkulasi BPJS, PPh 21, dan finalisasi transfer bank',
    badge: { text: 'Kritis', color: 'red' },
    email: true,
    whatsapp: true,
    push: true,
  },
  {
    id: 'contract',
    category: 'Notifikasi Kontrak & Probation Expired',
    description: 'Peringatan H-30 berakhirnya PKWT atau masa evaluasi 3 bulan staf baru',
    email: true,
    whatsapp: false,
    push: true,
  },
  {
    id: 'discipline',
    category: 'Eskalasi Pelanggaran & Surat Peringatan (SP)',
    description: 'Penerbitan SP1/SP2/SP3 dan laporan investigasi kedisiplinan kerja',
    badge: { text: 'Urgensi Tinggi', color: 'amber' },
    email: true,
    whatsapp: true,
    push: true,
  },
  {
    id: 'digest',
    category: 'Ringkasan Laporan Mingguan & Analisis HR',
    description: 'Digest otomatis rekap absensi, turnover, dan KPI divisi tiap Senin pagi',
    email: true,
    whatsapp: false,
    push: false,
  },
  {
    id: 'security_alert',
    category: 'Log Keamanan Akun & Percobaan Login Asing',
    description: 'Pemberitahuan login dari IP baru, browser asing, atau pergantian sandi',
    badge: { text: 'Keamanan', color: 'blue' },
    email: true,
    whatsapp: true,
    push: true,
  },
];

export const DEFAULT_PREFERENCES: SystemPreferences = {
  themeMode: 'light',
  tableDensity: 'normal',
  fontSize: 'standard',
  microAnimations: true,
  highContrast: false,
  screenReaderSupport: false,
  audioFeedback: true,
  language: 'id',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Jakarta',
  notifications: DEFAULT_NOTIFICATIONS,
};

// Web Audio API Dual-Tone Chime Player
export function playWebAudioChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (A5 - 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.09, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.32);

    // Second tone (D6 - 1174.66Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.11);
    gain2.gain.setValueAtTime(0.1, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.11);
    osc2.stop(now + 0.52);
  } catch (err) {
    console.warn('[AudioAlert] Web Audio not available:', err);
  }
}

// Function to immediately apply visual classes and attributes to DOM root
export function applyDomPreferences(prefs: SystemPreferences) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Theme Mode
  let isDark = false;
  if (prefs.themeMode === 'dark') {
    isDark = true;
  } else if (prefs.themeMode === 'system') {
    isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  root.classList.toggle('dark', isDark);

  // 2. Font Size
  root.classList.toggle('font-scale-large', prefs.fontSize === 'large');

  // 3. Table Density
  root.setAttribute('data-density', prefs.tableDensity);

  // 4. High Contrast
  root.classList.toggle('high-contrast', prefs.highContrast);

  // 5. Reduced Motion
  root.classList.toggle('reduce-motion', !prefs.microAnimations);

  // 6. Language & Timezone
  root.setAttribute('lang', prefs.language);
  root.setAttribute('data-timezone', prefs.timezone);
}

interface PreferencesContextValue {
  preferences: SystemPreferences;
  updatePreferences: (updater: Partial<SystemPreferences> | ((prev: SystemPreferences) => SystemPreferences)) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setTableDensity: (density: 'compact' | 'normal' | 'spacious') => void;
  setFontSize: (size: 'standard' | 'large') => void;
  setMicroAnimations: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setScreenReaderSupport: (val: boolean) => void;
  setAudioFeedback: (val: boolean) => void;
  setLanguage: (lang: 'id' | 'en') => void;
  setTimezone: (tz: string) => void;
  setDateFormat: (df: string) => void;
  toggleNotificationChannel: (id: string, channel: 'email' | 'whatsapp' | 'push') => void;
  resetDefaults: () => void;
  saveToServer: () => Promise<boolean>;
  playChime: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<SystemPreferences>(DEFAULT_PREFERENCES);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize preferences on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexora_global_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged: SystemPreferences = {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          notifications: Array.isArray(parsed.notifications) && parsed.notifications.length > 0
            ? parsed.notifications
            : DEFAULT_NOTIFICATIONS,
        };
        setPreferences(merged);
        applyDomPreferences(merged);
      } else {
        applyDomPreferences(DEFAULT_PREFERENCES);
      }
    } catch {
      applyDomPreferences(DEFAULT_PREFERENCES);
    }
    setIsInitialized(true);

    // Cross-tab and cross-role synchronization channel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_preferences_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'PREFERENCES_UPDATED' && event.data.preferences) {
          const incoming = event.data.preferences as SystemPreferences;
          setPreferences(incoming);
          applyDomPreferences(incoming);
        }
      };
    } catch {}

    // Listen for OS system theme changes if mode is 'system'
    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handleSystemThemeChange = () => {
      setPreferences((curr) => {
        if (curr.themeMode === 'system') {
          applyDomPreferences(curr);
        }
        return curr;
      });
    };
    if (mediaQuery) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    }

    return () => {
      if (channel) channel.close();
      if (mediaQuery) mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Update preferences state, persist to localStorage, and broadcast globally
  const updatePreferences = useCallback((
    updater: Partial<SystemPreferences> | ((prev: SystemPreferences) => SystemPreferences)
  ) => {
    setPreferences((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem('nexora_global_preferences', JSON.stringify(next));
        applyDomPreferences(next);
        const channel = new BroadcastChannel('nexora_preferences_sync');
        channel.postMessage({ type: 'PREFERENCES_UPDATED', preferences: next });
        channel.close();
      } catch {}
      return next;
    });
  }, []);

  const setThemeMode = useCallback((mode: 'light' | 'dark' | 'system') => {
    updatePreferences({ themeMode: mode });
  }, [updatePreferences]);

  const setTableDensity = useCallback((density: 'compact' | 'normal' | 'spacious') => {
    updatePreferences({ tableDensity: density });
  }, [updatePreferences]);

  const setFontSize = useCallback((size: 'standard' | 'large') => {
    updatePreferences({ fontSize: size });
  }, [updatePreferences]);

  const setMicroAnimations = useCallback((val: boolean) => {
    updatePreferences({ microAnimations: val });
  }, [updatePreferences]);

  const setHighContrast = useCallback((val: boolean) => {
    updatePreferences({ highContrast: val });
  }, [updatePreferences]);

  const setScreenReaderSupport = useCallback((val: boolean) => {
    updatePreferences({ screenReaderSupport: val });
  }, [updatePreferences]);

  const setAudioFeedback = useCallback((val: boolean) => {
    updatePreferences({ audioFeedback: val });
    if (val) playWebAudioChime();
  }, [updatePreferences]);

  const setLanguage = useCallback((lang: 'id' | 'en') => {
    updatePreferences({ language: lang });
  }, [updatePreferences]);

  const setTimezone = useCallback((tz: string) => {
    updatePreferences({ timezone: tz });
  }, [updatePreferences]);

  const setDateFormat = useCallback((df: string) => {
    updatePreferences({ dateFormat: df });
  }, [updatePreferences]);

  const toggleNotificationChannel = useCallback((
    id: string,
    channel: 'email' | 'whatsapp' | 'push'
  ) => {
    updatePreferences((prev) => ({
      ...prev,
      notifications: prev.notifications.map((row) =>
        row.id === id ? { ...row, [channel]: !row[channel] } : row
      ),
    }));
  }, [updatePreferences]);

  const resetDefaults = useCallback(() => {
    updatePreferences(DEFAULT_PREFERENCES);
    playWebAudioChime();
  }, [updatePreferences]);

  const saveToServer = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [preferences]);

  const playChime = useCallback(() => {
    if (preferences.audioFeedback) {
      playWebAudioChime();
    }
  }, [preferences.audioFeedback]);

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        setThemeMode,
        setTableDensity,
        setFontSize,
        setMicroAnimations,
        setHighContrast,
        setScreenReaderSupport,
        setAudioFeedback,
        setLanguage,
        setTimezone,
        setDateFormat,
        toggleNotificationChannel,
        resetDefaults,
        saveToServer,
        playChime,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    return {
      preferences: DEFAULT_PREFERENCES,
      updatePreferences: () => {},
      setThemeMode: () => {},
      setTableDensity: () => {},
      setFontSize: () => {},
      setMicroAnimations: () => {},
      setHighContrast: () => {},
      setScreenReaderSupport: () => {},
      setAudioFeedback: () => {},
      setLanguage: () => {},
      setTimezone: () => {},
      setDateFormat: () => {},
      toggleNotificationChannel: () => {},
      resetDefaults: () => {},
      saveToServer: async () => true,
      playChime: () => {},
    };
  }
  return context;
}
