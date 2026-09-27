import React from 'react';

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

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dynamic Ribbon "N" Symbol */}
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
        {/* Ribbon Loop Path */}
        <path
          d="M20 75C15 65 15 35 25 25C35 15 50 30 50 50C50 70 65 85 75 75C85 65 85 35 80 25C78 20 72 20 70 25C65 35 65 65 55 75C45 85 30 70 30 50C30 30 15 15 25 25"
          stroke="url(#nexoraRibbonGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark Typography */}
      <div className="flex flex-col">
        <span
          className={`font-bold tracking-wider text-xl leading-none font-sans ${
            isDark ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          NEXORA
        </span>
        {showSubtitle && (
          <span
            className={`text-[8px] font-medium tracking-[0.22em] uppercase mt-1 font-sans ${
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
