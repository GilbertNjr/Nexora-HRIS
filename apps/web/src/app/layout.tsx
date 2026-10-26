import type { Metadata } from 'next';
import './globals.css';
import { PreferencesProvider } from '@/components/providers/PreferencesProvider';

export const metadata: Metadata = {
  title: 'NEXORA — Enterprise Human Resource Information System',
  description:
    'Sistem Manajemen SDM Modern Enterprise: Dual-Panel Portal, Presensi Geofencing, Manajemen Cuti, dan Payroll PPh 21 TER Otomatis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors duration-200">
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}

