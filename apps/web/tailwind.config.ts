import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nexora: {
          primary: '#265AE3',
          secondary: '#3B82F6',
          accent: '#8B5CF6',
          dark: '#0F172A',
          darker: '#0A0F1D',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#0EA5E9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(38, 90, 227, 0.08)',
        subtle: '0 2px 10px rgba(15, 23, 42, 0.04)',
        elevated: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
