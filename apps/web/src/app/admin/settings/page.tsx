'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminSettingsRootPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'attendance') {
      router.replace('/admin/settings/attendance');
    } else if (tab === 'rbac') {
      router.replace('/admin/settings/rbac');
    } else if (tab === 'payroll') {
      router.replace('/admin/settings/payroll');
    } else {
      router.replace('/admin/settings/company');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span>Memuat modul pengaturan sistem...</span>
      </div>
    </div>
  );
}
