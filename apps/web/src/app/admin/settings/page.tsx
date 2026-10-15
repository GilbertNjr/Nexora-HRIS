import { redirect } from 'next/navigation';

interface AdminSettingsRootPageProps {
  searchParams?: { tab?: string };
}

export default function AdminSettingsRootPage({ searchParams }: AdminSettingsRootPageProps) {
  const tab = searchParams?.tab;

  if (tab === 'attendance') {
    redirect('/admin/settings/attendance');
  } else if (tab === 'rbac') {
    redirect('/admin/settings/rbac');
  } else if (tab === 'payroll') {
    redirect('/admin/settings/payroll');
  } else {
    redirect('/admin/settings/company');
  }
}

