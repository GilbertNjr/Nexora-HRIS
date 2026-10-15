'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Users,
  CheckCircle2,
  Lock,
  Plus,
  Save,
  History,
  UserCheck,
  UserPlus,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

interface RoleDefinition {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  description: string;
  usersCount: number;
  level: string;
  badgeVariant: 'system' | 'active' | 'authorizer' | 'standard';
}

interface ModulePermission {
  id: string;
  name: string;
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

export default function RbacSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [selectedRoleId, setSelectedRoleId] = useState<string>('hr_ops');

  const [rolesList, setRolesList] = useState<RoleDefinition[]>([
    {
      id: 'super_admin',
      name: 'Super Administrator',
      tag: 'Akses Sistem Penuh',
      subtitle: 'Direksi & CTO',
      description:
        'Akses kontrol penuh ke seluruh modul, audit forensik, konfigurasi database, dan pengelolaan keamanan tingkat root.',
      usersCount: 2,
      level: 'LEVEL 0 ROOT',
      badgeVariant: 'system',
    },
    {
      id: 'hr_ops',
      name: 'HR Operations Manager',
      tag: 'Aktif Dipilih',
      subtitle: 'Dewi Lestari & Tim Inti',
      description:
        'Hak akses operasional menyeluruh: Payroll, Rekrutmen, Manajemen Cuti, Direktori Karyawan, dan Penilaian Kinerja.',
      usersCount: 4,
      level: 'MANAJERIAL UTAMA',
      badgeVariant: 'active',
    },
    {
      id: 'dept_lead',
      name: 'Department Lead',
      tag: 'Otorisator',
      subtitle: 'Head of Division & Supervisor',
      description:
        'Persetujuan cuti & lembur bawahan langsung, evaluasi berkala KPI divisi, tanpa hak ubah master payroll.',
      usersCount: 142,
      level: 'MANAJERIAL L1/L2',
      badgeVariant: 'authorizer',
    },
    {
      id: 'employee_self',
      name: 'Employee Self Service',
      tag: 'Standar',
      subtitle: 'Staf & Karyawan Reguler',
      description:
        'Pengajuan izin pribadi, klaim benefit, presensi mobile, dan pengunduhan slip gaji pribadi via ESS portal.',
      usersCount: 1100,
      level: 'AKSES MANDIRI',
      badgeVariant: 'standard',
    },
  ]);

  const [permissionsMatrix, setPermissionsMatrix] = useState<ModulePermission[]>([
    { id: 'mod-1', name: 'Direktori & Profil Karyawan', read: true, create: true, edit: true, delete: false, approve: true, export: true },
    { id: 'mod-2', name: 'Presensi, Waktu & Biometrik', read: true, create: true, edit: true, delete: false, approve: true, export: true },
    { id: 'mod-3', name: 'Manajemen Cuti & Izin', read: true, create: true, edit: true, delete: false, approve: true, export: true },
    { id: 'mod-4', name: 'Payroll & Pajak PPh 21 (TER 2025)', read: true, create: true, edit: true, delete: false, approve: true, export: true },
    { id: 'mod-5', name: 'Rekrutmen & Pelamar ATS', read: true, create: true, edit: true, delete: true, approve: true, export: true },
    { id: 'mod-6', name: 'Evaluasi Kinerja (KPI & 9-Box)', read: true, create: true, edit: true, delete: false, approve: true, export: true },
    { id: 'mod-7', name: 'Pengaturan Sistem & Konfigurasi', read: true, create: false, edit: false, delete: false, approve: false, export: false },
    { id: 'mod-8', name: 'Audit Trail & Log Forensik Keamanan', read: true, create: false, edit: false, delete: false, approve: false, export: true },
  ]);

  const [assignedStaff] = useState([
    { id: 'staff-1', name: 'Dewi Lestari, S.Psi', nik: 'NX-2018012', role: 'Head of People Operations', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { id: 'staff-2', name: 'Irvan Setiawan, S.T.', nik: 'NX-2019042', role: 'HR Specialist', avatarUrl: '' },
    { id: 'staff-3', name: 'Siti Rahmawati, S.E.', nik: 'NX-2021041', role: 'Sr. Compensation Officer', avatarUrl: '' },
    { id: 'staff-4', name: 'Farhan Maulana', nik: 'NX-2022091', role: 'People Operations Lead', avatarUrl: '' },
  ]);

  const togglePermission = (moduleId: string, field: keyof Omit<ModulePermission, 'id' | 'name'>) => {
    setPermissionsMatrix((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, [field]: !mod[field] } : mod))
    );
    showToast('Izin akses modul berhasil diperbarui.');
  };

  const handleSaveMatrix = () => {
    showToast('Matriks hak akses RBAC (Role-Based Access Control) berhasil disimpan ke basis data.');
  };

  const activeRole = rolesList.find((r) => r.id === selectedRoleId) || rolesList[1];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Hak Akses &amp; Peran Pengguna (RBAC)
            </h1>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              ISO 27001 Access Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Kelola matriks kewenangan granular, pemisahan tugas (*Segregation of Duties*), alokasi staf pada peran manajerial, serta audit log autentikasi pengguna.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => showToast('Membuka log riwayat autentikasi & perubahan peran...')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Log RBAC</span>
          </button>

          <button
            type="button"
            onClick={handleSaveMatrix}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Simpan Matriks Izin</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Role Definitions & Granular Matrix */}
        <div className="lg:col-span-8 space-y-6">
          {/* Defined Roles Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Tingkat Peran Terdefinisi
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Pilih peran untuk menyesuaikan matriks hak akses:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {rolesList.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            role.badgeVariant === 'system'
                              ? 'bg-rose-500'
                              : role.badgeVariant === 'active'
                              ? 'bg-blue-600'
                              : role.badgeVariant === 'authorizer'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-slate-900">{role.name}</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {role.level}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        <strong className="text-slate-800">{role.usersCount}</strong> Pengguna Aktif
                      </span>
                      <span className="text-blue-600 font-bold">{role.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Granular Permissions Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Matriks Izin Akses Granular: <span className="text-blue-600">{activeRole.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan otorisasi per modul secara spesifik (BACA, BUAT, UBAH, HAPUS, APPROVE, EKSPOR).
                </p>
              </div>

              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                Modul Aktif: {permissionsMatrix.length} Modul
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#EEF2F6] text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">MODUL HRIS</th>
                    <th className="py-3 px-2 text-center">BACA</th>
                    <th className="py-3 px-2 text-center">BUAT</th>
                    <th className="py-3 px-2 text-center">UBAH</th>
                    <th className="py-3 px-2 text-center">HAPUS</th>
                    <th className="py-3 px-2 text-center">PERSETUJUAN</th>
                    <th className="py-3 px-2 text-center">EKSPOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {permissionsMatrix.map((mod) => (
                    <tr key={mod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{mod.name}</td>
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={mod.read}
                          onChange={() => togglePermission(mod.id, 'read')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={mod.create}
                          onChange={() => togglePermission(mod.id, 'create')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={mod.edit}
                          onChange={() => togglePermission(mod.id, 'edit')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={mod.delete}
                          onChange={() => togglePermission(mod.id, 'delete')}
                          className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={mod.approve}
                          onChange={() => togglePermission(mod.id, 'approve')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={mod.export}
                          onChange={() => togglePermission(mod.id, 'export')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Assigned Staff & Security Parameters */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card: Staf Pengampu Peran */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Staf Pengampu Peran ({activeRole.name})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {assignedStaff.length} Staf
              </span>
            </div>

            <div className="space-y-2.5">
              {assignedStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{staff.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{staff.nik}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Aktif
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => showToast('Membuka modal alokasi staf baru...')}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Tambah Staf ke Peran Ini</span>
            </button>
          </div>

          {/* Card: Kebijakan Keamanan Akun & Kepatuhan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Kepatuhan Keamanan ISO 27001
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Compliant
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                <p className="font-bold text-slate-800">Masa Kedaluwarsa Password</p>
                <p className="text-[11px] text-slate-500">Wajib ganti sandi setiap 90 hari kalender.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                <p className="font-bold text-slate-800">Auto-Logout Sesi Tidak Aktif</p>
                <p className="text-[11px] text-slate-500">Sesi terputus otomatis setelah 30 menit idola.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                <p className="font-bold text-slate-800">Enkripsi Database &amp; Token</p>
                <p className="text-[11px] text-slate-500">AES-256 GCM pada level storage &amp; JWT 15 menit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
