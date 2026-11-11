'use client';

import React, { useState, useEffect } from 'react';
import { subscribeSharedSSE } from '@/lib/sseClient';

interface NexoraLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showSubtitle?: boolean;
}

export function NexoraLogo({
  variant = 'light',
  className = '',
  showSubtitle = true,
}: NexoraLogoProps) {
  const isDark = variant === 'dark';
  const [companyLogo, setCompanyLogo] = useState<string>('/company-logo-saved.jpg');
  const [companyName, setCompanyName] = useState<string>('Nexora Group & HR Solutions');
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fast local load from localStorage for instant rendering
    try {
      const persistentLogo = localStorage.getItem('nexora_persistent_company_logo');
      const cached = localStorage.getItem('nexora_company_settings');
      if (persistentLogo) {
        setCompanyLogo(persistentLogo);
        setImgError(false);
      }
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!persistentLogo && parsed.logoUrl) {
          setCompanyLogo(parsed.logoUrl);
          setImgError(false);
        }
        if (parsed.commercialName) {
          setCompanyName(parsed.commercialName);
        }
      }
    } catch {
      // ignore
    }

    // 2. Live sync with PostgreSQL database via /api/v1/company
    fetch('/api/v1/company')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          if (json.data.logoUrl !== undefined) {
            setCompanyLogo(json.data.logoUrl || '');
            setImgError(false);
            if (json.data.logoUrl) {
              try {
                localStorage.setItem('nexora_persistent_company_logo', json.data.logoUrl);
              } catch {}
            }
          }
          if (json.data.commercialName) {
            setCompanyName(json.data.commercialName);
          }
        }
      })
      .catch(() => {});

    // 3. Real-time multi-tab & cross-device listener
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (msg?.type === 'LOGO_UPDATED') {
          setCompanyLogo(msg.logoUrl || '');
          setImgError(false);
          if (msg.companyName) setCompanyName(msg.companyName);
        }
      };
    } catch {
      // ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nexora_persistent_company_logo') {
        setCompanyLogo(e.newValue || '');
        setImgError(false);
      }
      if (e.key === 'nexora_company_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.logoUrl !== undefined) {
            setCompanyLogo(parsed.logoUrl || '');
            setImgError(false);
          }
          if (parsed.commercialName) setCompanyName(parsed.commercialName);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    const unsubCompany = subscribeSharedSSE('/api/v1/employees/stream', 'COMPANY_UPDATED', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const data = parsed.payload;
        if (data?.logoUrl !== undefined) {
          setCompanyLogo(data.logoUrl || '');
          setImgError(false);
        }
        if (data?.commercialName) setCompanyName(data.commercialName);
      } catch {}
    });

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      unsubCompany();
    };
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dynamic Company Logo / PP saved in Database */}
      {companyLogo && !imgError ? (
        <div
          className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0 border ${
            isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200/80 bg-white'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={companyLogo}
            alt={companyName || 'Logo Perusahaan'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        /* Fallback Dynamic Ribbon "N" Symbol */
        <svg
          width="38"
          height="38"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105"
        >
          <defs>
            <linearGradient
              id="nexoraRibbonGrad"
              x1="10"
              y1="90"
              x2="90"
              y2="10"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#265AE3" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <path
            d="M20 75C15 65 15 35 25 25C35 15 50 30 50 50C50 70 65 85 75 75C85 65 85 35 80 25C78 20 72 20 70 25C65 35 65 65 55 75C45 85 30 70 30 50C30 30 15 15 25 25"
            stroke="url(#nexoraRibbonGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* Wordmark Typography */}
      <div className="flex flex-col min-w-0">
        <span
          className={`font-bold tracking-tight text-base sm:text-xl leading-none font-sans truncate ${
            isDark ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          {companyName || 'NEXORA'}
        </span>
        {showSubtitle && (
          <span
            className={`text-[9px] font-medium tracking-[0.2em] uppercase mt-1 font-sans truncate ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Human Resource Solutions
          </span>
        )}
      </div>
    </div>
  );
}
