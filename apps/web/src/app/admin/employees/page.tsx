'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  X,
  Building2,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

export interface EmployeeItem {
  id: string;
  employeeNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  department: string;
  designation: string;
  employmentType: 'PERMANENT' | 'CONTRACT_PKWT' | 'PROBATION' | 'INTERNSHIP';
  employmentStatus: 'ACTIVE' | 'RESIGNED' | 'TERMINATED' | 'SUSPENDED';
  joinDate: string;
  bankName?: string;
  accountNumber?: string;
}

export default function EmployeesPage() {
  // Master mock dataset aligned with reference design
  const initialDataset: EmployeeItem[] = [
    {
      id: 'emp-101',
      employeeNumber: 'NIK-2021001',
      fullName: 'Rian Ardiansyah',
      firstName: 'Rian',
      lastName: 'Ardiansyah',
      email: 'rian.ardiansyah@perusahaan.co.id',
      phone: '+62 812-9845-1120',
      department: 'Teknologi Informasi',
      designation: 'Senior Software Engineer',
      employmentType: 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: '2021-02-15',
      bankName: 'BCA',
      accountNumber: '8830192841',
    },
    {
      id: 'emp-102',
      employeeNumber: 'NIK-2022014',
      fullName: 'Siti Rahmawati',
      firstName: 'Siti',
      lastName: 'Rahmawati',
      email: 'siti.rahmawati@perusahaan.co.id',
      phone: '+62 821-9876-5432',
      department: 'Sumber Daya Manusia',
      designation: 'HR Business Partner',
      employmentType: 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: '2022-04-10',
      bankName: 'Mandiri',
      accountNumber: '1370018293041',
    },
    {
      id: 'emp-103',
      employeeNumber: 'NIK-2023089',
      fullName: 'Bambang Wijaya',
      firstName: 'Bambang',
      lastName: 'Wijaya',
      email: 'bambang.wijaya@perusahaan.co.id',
      phone: '+62 857-1122-3344',
      department: 'Keuangan & Pajak',
      designation: 'Financial Analyst',
      employmentType: 'CONTRACT_PKWT',
      employmentStatus: 'ACTIVE',
      joinDate: '2023-08-01',
      bankName: 'BCA',
      accountNumber: '7310492810',
    },
    {
      id: 'emp-104',
      employeeNumber: 'NIK-2020042',
      fullName: 'Indah Permata',
      firstName: 'Indah',
      lastName: 'Permata',
      email: 'indah.permata@perusahaan.co.id',
      phone: '+62 878-5566-7788',
      department: 'Operasional',
      designation: 'Operations Supervisor',
      employmentType: 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: '2020-09-01',
      bankName: 'BNI',
      accountNumber: '0981248102',
    },
    {
      id: 'emp-105',
      employeeNumber: 'NIK-2023115',
      fullName: 'Doni Prasetyo',
      firstName: 'Doni',
      lastName: 'Prasetyo',
      email: 'doni.prasetyo@perusahaan.co.id',
      phone: '+62 813-7788-9900',
      department: 'Teknologi Informasi',
      designation: 'Product Designer',
      employmentType: 'CONTRACT_PKWT',
      employmentStatus: 'ACTIVE',
      joinDate: '2023-11-15',
      bankName: 'BCA',
      accountNumber: '5220394812',
    },
    {
      id: 'emp-106',
      employeeNumber: 'NIK-2022067',
      fullName: 'Anita Kusuma',
      firstName: 'Anita',
      lastName: 'Kusuma',
      email: 'anita.kusuma@perusahaan.co.id',
      phone: '+62 819-2233-4455',
      department: 'Pemasaran & Bisnis',
      designation: 'Marketing Lead',
      employmentType: 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: '2022-07-20',
      bankName: 'Mandiri',
      accountNumber: '1580029384712',
    },
    {
      id: 'emp-107',
      employeeNumber: 'NIK-2024001',
      fullName: 'Ahmat Gebyar',
      firstName: 'Ahmat',
      lastName: 'Gebyar',
      email: 'ahmat.gebyar@perusahaan.co.id',
      phone: '+62 812-3456-7890',
      department: 'Teknologi Informasi',
      designation: 'Lead Solution Architect',
      employmentType: 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: '2024-01-08',
      bankName: 'BCA',
      accountNumber: '8820491823',
    },
    {
      id: 'emp-108',
      employeeNumber: 'NIK-2025012',
      fullName: 'Budi Santoso',
      firstName: 'Budi',
      lastName: 'Santoso',
      email: 'budi.santoso@perusahaan.co.id',
      phone: '+62 856-4321-8765',
      department: 'Keuangan & Pajak',
      designation: 'Senior Payroll Specialist',
      employmentType: 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: '2025-03-01',
      bankName: 'BCA',
      accountNumber: '6120491820',
    },
  ];

  const [employees, setEmployees] = useState<EmployeeItem[]>(initialDataset);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<EmployeeItem | null>(null);
  const [editEmployee, setEditEmployee] = useState<EmployeeItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<EmployeeItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Teknologi Informasi',
    designation: 'Junior Engineer',
    employmentType: 'PERMANENT' as const,
    joinDate: new Date().toISOString().split('T')[0],
    bankName: 'BCA',
    accountNumber: '',
  });

  // Attempt live backend fetch if available (fails silently to resilient local state)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          return;
        }
        const endpoint = apiUrl ? `${apiUrl}/api/v1/employees?limit=50` : 'http://localhost:4000/api/v1/employees?limit=50';
        const res = await fetch(endpoint, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.items && data.data.items.length > 0) {
            setEmployees(data.data.items);
          }
        }
      } catch {
        // Keep resilient dataset
      }
    };
    fetchEmployees();
  }, []);

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeNumber.toLowerCase().includes(q) ||
        (emp.email && emp.email.toLowerCase().includes(q)) ||
        emp.designation.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDept]);

  // Pagination calculation
  const totalEmployees = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalEmployees / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + rowsPerPage);

  // Total statistics for pill header
  const totalPermanent = employees.filter((e) => e.employmentType === 'PERMANENT').length;
  const totalContract = employees.filter((e) => e.employmentType === 'CONTRACT_PKWT').length;

  // Add Employee Handler
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp: EmployeeItem = {
      id: `emp-${Date.now()}`,
      employeeNumber: `NIK-${new Date().getFullYear()}${String(employees.length + 1).padStart(3, '0')}`,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      designation: formData.designation,
      employmentType: formData.employmentType,
      employmentStatus: 'ACTIVE',
      joinDate: formData.joinDate,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
    };

    setEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
    showToast(`Karyawan ${newEmp.fullName} (${newEmp.employeeNumber}) berhasil ditambahkan!`);
  };

  // Edit Employee Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;

    setEmployees(employees.map((emp) => (emp.id === editEmployee.id ? editEmployee : emp)));
    showToast(`Data ${editEmployee.fullName} berhasil diperbarui.`);
    setEditEmployee(null);
  };

  // Delete Handler
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    setEmployees(employees.filter((emp) => emp.id !== deleteCandidate.id));
    showToast(`Karyawan ${deleteCandidate.fullName} telah dihapus dari direktori.`);
    setDeleteCandidate(null);
  };

  return (
    <AdminLayoutSkeleton>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Page Header matching reference */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Kelola Data Karyawan
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Daftar seluruh pegawai aktif dan pengelolaan profil staf.
            </p>
          </div>

          {/* Right Header Status Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold shadow-xs">
            <span className="flex items-center gap-1.5 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Total: <strong>348 Karyawan</strong></span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">
              <strong className="text-slate-800">274</strong> Tetap
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">
              <strong className="text-slate-800">74</strong> Kontrak
            </span>
          </div>
        </div>

        {/* Control & Search Bar matching reference */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama atau NIK..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>

            {/* Department Dropdown */}
            <div className="sm:w-56">
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs cursor-pointer"
              >
                <option value="ALL">Semua Departemen</option>
                <option value="Teknologi Informasi">Teknologi Informasi</option>
                <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
                <option value="Keuangan & Pajak">Keuangan & Pajak</option>
                <option value="Operasional">Operasional</option>
                <option value="Pemasaran & Bisnis">Pemasaran & Bisnis</option>
              </select>
            </div>
          </div>

          {/* Add Employee CTA */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Karyawan</span>
          </button>
        </div>

        {/* Master Employee Table matching reference design */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-36">NIK</th>
                  <th className="py-4 px-6 w-48">NAMA KARYAWAN</th>
                  <th className="py-4 px-6 w-52">JABATAN</th>
                  <th className="py-4 px-6 w-48">DEPARTEMEN</th>
                  <th className="py-4 px-6">EMAIL</th>
                  <th className="py-4 px-6 w-32 text-center">STATUS</th>
                  <th className="py-4 px-6 w-44 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center text-slate-400">
                      Tidak ada karyawan yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* NIK */}
                      <td className="py-4 px-6 font-mono text-slate-600 font-medium">
                        {emp.employeeNumber}
                      </td>

                      {/* Nama Karyawan */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {emp.fullName}
                        </span>
                      </td>

                      {/* Jabatan */}
                      <td className="py-4 px-6 text-slate-700">
                        {emp.designation}
                      </td>

                      {/* Departemen */}
                      <td className="py-4 px-6 text-slate-600">
                        {emp.department}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-slate-600 font-normal">
                        {emp.email || '-'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        {emp.employmentType === 'PERMANENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Tetap</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Kontrak</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi: Lihat | Edit | Hapus (Spacious & Clean, no text clipping) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setViewEmployee(emp)}
                            className="text-blue-600 hover:text-blue-800 transition-colors hover:underline focus:outline-none"
                            title="Lihat detail lengkap karyawan"
                          >
                            Lihat
                          </button>
                          <span className="text-slate-300 font-light select-none">|</span>
                          <button
                            type="button"
                            onClick={() => setEditEmployee(emp)}
                            className="text-slate-700 hover:text-blue-600 transition-colors hover:underline focus:outline-none"
                            title="Edit data karyawan"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300 font-light select-none">|</span>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(emp)}
                            className="text-rose-600 hover:text-rose-800 transition-colors hover:underline focus:outline-none"
                            title="Hapus karyawan"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer matching reference */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Menampilkan{' '}
              <strong>{totalEmployees === 0 ? 0 : startIndex + 1}</strong> -{' '}
              <strong>{Math.min(startIndex + rowsPerPage, totalEmployees)}</strong> dari{' '}
              <strong>348 karyawan</strong>
            </p>

            <div className="flex items-center gap-3">
              <span>
                Halaman <strong>{currentPage}</strong> dari <strong>10</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= 10}
                  onClick={() => setCurrentPage((p) => Math.min(10, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Detail Profil Karyawan (Klik 'Lihat') */}
      {viewEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-slate-100">
            <button
              onClick={() => setViewEmployee(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {viewEmployee.firstName[0]}
                {viewEmployee.lastName ? viewEmployee.lastName[0] : ''}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{viewEmployee.fullName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {viewEmployee.employeeNumber}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      viewEmployee.employmentType === 'PERMANENT'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {viewEmployee.employmentType === 'PERMANENT' ? 'Tetap' : 'Kontrak'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-2 gap-4 py-6 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Jabatan</span>
                <p className="font-semibold text-slate-900 mt-1">{viewEmployee.designation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Departemen</span>
                <p className="font-semibold text-slate-900 mt-1">{viewEmployee.department}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Email Kantor</span>
                <p className="font-semibold text-slate-900 mt-1 truncate">{viewEmployee.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Nomor Telepon</span>
                <p className="font-semibold text-slate-900 mt-1">{viewEmployee.phone || '-'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Tanggal Bergabung</span>
                <p className="font-semibold text-slate-900 mt-1">
                  {new Date(viewEmployee.joinDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium">Rekening Payroll</span>
                <p className="font-semibold text-slate-900 mt-1">
                  {viewEmployee.bankName || 'BCA'} - {viewEmployee.accountNumber || '8830192841'}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/admin/employees/${viewEmployee.employeeNumber || viewEmployee.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>Buka Halaman Lengkap 360°</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setViewEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Karyawan (Klik 'Edit') */}
      {editEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setEditEmployee(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-bold text-slate-900">Edit Data Karyawan</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {editEmployee.employeeNumber} — {editEmployee.fullName}
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editEmployee.fullName}
                  onChange={(e) => setEditEmployee({ ...editEmployee, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen</label>
                  <select
                    value={editEmployee.department}
                    onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Teknologi Informasi">Teknologi Informasi</option>
                    <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
                    <option value="Keuangan & Pajak">Keuangan & Pajak</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Pemasaran & Bisnis">Pemasaran & Bisnis</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    required
                    value={editEmployee.designation}
                    onChange={(e) => setEditEmployee({ ...editEmployee, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editEmployee.email || ''}
                    onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Ketenagakerjaan</label>
                  <select
                    value={editEmployee.employmentType}
                    onChange={(e) =>
                      setEditEmployee({
                        ...editEmployee,
                        employmentType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="PERMANENT">Karyawan Tetap</option>
                    <option value="CONTRACT_PKWT">Kontrak PKWT</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditEmployee(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-md transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Konfirmasi Hapus (Klik 'Hapus') */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Hapus Data Karyawan?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <strong>{deleteCandidate.fullName}</strong> ({deleteCandidate.employeeNumber})? Tindakan ini akan menghapus akses portal mandiri staf bersangkutan.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Ya, Hapus Karyawan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Tambah Karyawan Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Tambah Data Karyawan Baru</h2>
              <p className="text-xs text-slate-500 mt-1">
                Data akan otomatis didaftarkan ke direktori dan dibuatkan akun Employee Self-Service (ESS).
              </p>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Depan *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Contoh: Muhammad"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Contoh: Pratama"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Perusahaan *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@perusahaan.co.id"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Teknologi Informasi">Teknologi Informasi</option>
                    <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
                    <option value="Keuangan & Pajak">Keuangan & Pajak</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Pemasaran & Bisnis">Pemasaran & Bisnis</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Contoh: Senior Engineer"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Ketenagakerjaan</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="PERMANENT">Karyawan Tetap (Permanent)</option>
                    <option value="CONTRACT_PKWT">Kontrak PKWT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai Masuk</label>
                  <input
                    type="date"
                    required
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                  </input>
                </div>
              </div>

              {/* Bank Account Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Informasi Rekening Penggajian</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Nama Bank</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="BCA / Mandiri / BNI"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Contoh: 8830192841"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-md transition-colors"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
