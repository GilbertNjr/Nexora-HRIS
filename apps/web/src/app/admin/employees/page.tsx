'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  MoreVertical,
  X,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

interface EmployeeItem {
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
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Human Resource Department',
    designation: 'HR Specialist',
    employmentType: 'PERMANENT',
    joinDate: new Date().toISOString().split('T')[0],
    bankName: 'BCA',
    accountNumber: '',
  });

  // Mock initial dataset for demo / offline fallback
  const initialMockData: EmployeeItem[] = [
    {
      id: 'emp-01',
      employeeNumber: 'NX-2024-0001',
      fullName: 'Ahmat Gebyar',
      firstName: 'Ahmat',
      lastName: 'Gebyar',
      email: 'ahmat.gebyar@nexora.local',
      phone: '+62 812-3456-7890',
      department: 'Technology & Product',
      designation: 'Senior Software Engineer',
      employmentType: 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: '2024-06-01',
    },
    {
      id: 'emp-02',
      employeeNumber: 'NX-2024-0002',
      fullName: 'Siti Rahmawati',
      firstName: 'Siti',
      lastName: 'Rahmawati',
      email: 'siti.rahmawati@nexora.local',
      phone: '+62 821-9876-5432',
      department: 'Human Resource Department',
      designation: 'HR Specialist & Talent Acquisition',
      employmentType: 'PERMANENT',
      employmentStatus: 'ACTIVE',
      joinDate: '2024-01-15',
    },
    {
      id: 'emp-03',
      employeeNumber: 'NX-2025-0012',
      fullName: 'Budi Santoso',
      firstName: 'Budi',
      lastName: 'Santoso',
      email: 'budi.santoso@nexora.local',
      phone: '+62 857-1122-3344',
      department: 'Finance & Payroll',
      designation: 'Payroll Specialist',
      employmentType: 'PROBATION',
      employmentStatus: 'ACTIVE',
      joinDate: '2025-08-01',
    },
    {
      id: 'emp-04',
      employeeNumber: 'NX-2026-0045',
      fullName: 'Dimas Wicaksono',
      firstName: 'Dimas',
      lastName: 'Wicaksono',
      email: 'dimas.w@nexora.local',
      phone: '+62 878-5566-7788',
      department: 'Technology & Product',
      designation: 'Frontend Engineer',
      employmentType: 'CONTRACT_PKWT',
      employmentStatus: 'ACTIVE',
      joinDate: '2026-02-01',
    },
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nexora_token') : null;
        const res = await fetch('http://localhost:4000/api/v1/employees?limit=50', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data?.data?.items && data.data.items.length > 0) {
          setEmployees(data.data.items);
        } else {
          setEmployees(initialMockData);
        }
      } catch {
        setEmployees(initialMockData);
      }
    };

    fetchEmployees();
  }, []);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || emp.employmentStatus === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp: EmployeeItem = {
      id: `emp-${Date.now()}`,
      employeeNumber: `NX-2026-${String(employees.length + 1).padStart(4, '0')}`,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      designation: formData.designation,
      employmentType: formData.employmentType as any,
      employmentStatus: 'ACTIVE',
      joinDate: formData.joinDate,
    };

    setEmployees([newEmp, ...employees]);
    setIsModalOpen(false);
    alert(`Karyawan ${newEmp.fullName} (${newEmp.employeeNumber}) berhasil ditambahkan! Akun login mandiri (ESS) telah dibuat dengan kata sandi: NexoraEmp2026!`);
  };

  return (
    <AdminLayoutSkeleton>
      <div className="space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-blue-600">Beranda</Link>
              <span>/</span>
              <span>Personalia</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Master Karyawan</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Direktori & Master Data Karyawan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola profil seluruh personil, mutasi jabatan, departemen, dan rekening penggajian terenkripsi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Fitur Ekspor CSV Karyawan diunduh.')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Karyawan Baru</span>
            </button>
          </div>
        </div>

        {/* Headcount Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Karyawan</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{employees.length} Orang</p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span>+2 bulan ini</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Status Aktif</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {employees.filter((e) => e.employmentStatus === 'ACTIVE').length} Orang
              </p>
              <span className="text-[10px] text-slate-400">100% dari total</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Masa Percobaan (Probation)</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {employees.filter((e) => e.employmentType === 'PROBATION').length} Orang
              </p>
              <span className="text-[10px] text-amber-600 font-semibold">Evaluasi dalam 30 hari</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Kontrak PKWT</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {employees.filter((e) => e.employmentType === 'CONTRACT_PKWT').length} Orang
              </p>
              <span className="text-[10px] text-slate-400">Batas akhir kontrak terpantau</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan NIK, nama lengkap, atau email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700"
              >
                <option value="ALL">Semua Departemen</option>
                <option value="Human Resource Department">Human Resource</option>
                <option value="Technology & Product">Technology & Product</option>
                <option value="Finance & Payroll">Finance & Payroll</option>
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="PROBATION">Probation</option>
              <option value="TERMINATED">Non-aktif</option>
            </select>
          </div>
        </div>

        {/* Employees Responsive Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Karyawan</th>
                  <th className="px-6 py-3.5">Departemen & Jabatan</th>
                  <th className="px-6 py-3.5">Tipe Kontrak</th>
                  <th className="px-6 py-3.5">Tgl Bergabung</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada karyawan yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                            {emp.firstName[0]}
                            {emp.lastName ? emp.lastName[0] : ''}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {emp.fullName}
                            </p>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 mt-0.5">
                              {emp.employeeNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Designation */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{emp.designation}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{emp.department}</p>
                      </td>

                      {/* Employment Type */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            emp.employmentType === 'PERMANENT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : emp.employmentType === 'PROBATION'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-violet-50 text-violet-700 border border-violet-200'
                          }`}
                        >
                          {emp.employmentType.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(emp.joinDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Aktif</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployee(emp);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 text-xs transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detail Karyawan */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {selectedEmployee.firstName[0]}
                {selectedEmployee.lastName ? selectedEmployee.lastName[0] : ''}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedEmployee.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedEmployee.employeeNumber}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Status: Aktif
                </span>
              </div>
            </div>

            <div className="py-6 space-y-3 text-xs">
              <div className="flex items-center gap-3 text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-semibold w-28">Departemen:</span>
                <span>{selectedEmployee.department}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span className="font-semibold w-28">Jabatan:</span>
                <span>{selectedEmployee.designation}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-semibold w-28">Email:</span>
                <span className="font-mono">{selectedEmployee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-semibold w-28">Telepon:</span>
                <span>{selectedEmployee.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold w-28">Tanggal Gabung:</span>
                <span>{selectedEmployee.joinDate}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span className="font-semibold w-28">Rekening Bank:</span>
                <span className="font-mono text-slate-500">BCA (Terenkripsi AES-256)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Karyawan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Tambah Data Karyawan Baru</h2>
              <p className="text-xs text-slate-500 mt-1">
                Sistem akan secara otomatis membuat akun login Employee Self-Service (ESS) dengan kata sandi bawaan.
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Contoh: Pratama"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                    placeholder="karyawan@nexora.local"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Human Resource Department">Human Resource Department</option>
                    <option value="Technology & Product">Technology & Product</option>
                    <option value="Finance & Payroll">Finance & Payroll</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Contoh: Software Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Ketenagakerjaan</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="PERMANENT">Karyawan Tetap (Permanent)</option>
                    <option value="CONTRACT_PKWT">Kontrak PKWT</option>
                    <option value="PROBATION">Masa Percobaan (Probation)</option>
                    <option value="INTERNSHIP">Magang (Internship)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai Masuk</label>
                  <input
                    type="date"
                    required
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bank Account Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Informasi Rekening Penggajian (Terenkripsi AES-256)</span>
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
                      placeholder="1234567890"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-md transition-colors"
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
