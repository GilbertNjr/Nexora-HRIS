'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  History,
  Plus,
  Layers,
  Landmark,
  ShieldCheck,
  ArrowDownToLine,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronDown,
  Eye,
  Trash2,
  CreditCard,
  X,
} from 'lucide-react';

export interface SalaryComponentItem {
  id: string;
  code: string;
  name: string;
  category: 'earnings' | 'deductions' | 'benefits';
  type: string;
  nature: string;
  taxTreatment: string;
  taxBadge: string;
  formula: string;
  status: 'Berlaku Nasional' | 'Aktif' | 'Penyesuaian Cabang';
}

export default function PayrollSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [salaryComponents, setSalaryComponents] = useState<SalaryComponentItem[]>([
    {
      id: 'c1',
      code: 'EARN-001',
      name: 'Gaji Pokok',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tetap',
      taxTreatment: 'Objek Pajak Bruto',
      taxBadge: '$ Pajak Bruto',
      formula: 'Nominal Base Kontrak',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c2',
      code: 'EARN-002',
      name: 'Tunjangan Jabatan & Keahlian',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tetap Bulanan',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: 'Matriks Grade (Rp 1.5Jt - Rp 15Jt)',
      status: 'Aktif',
    },
    {
      id: 'c3',
      code: 'EARN-003',
      name: 'Uang Makan & Kehadiran (Meal & Transport)',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Variabel Harian',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: 'Rp 50.000 / Hari Hadir Valid',
      status: 'Aktif',
    },
    {
      id: 'c4',
      code: 'EARN-004',
      name: 'Upah Lembur Resmi (Overtime Depnaker)',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Variabel Lembur',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: '1.5x - 2.0x Upah Sejam (PP 35/2021)',
      status: 'Aktif',
    },
    {
      id: 'c5',
      code: 'EARN-005',
      name: 'Tunjangan Komunikasi & Pulsa',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tetap Bulanan',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: 'Rp 350.000 - Rp 750.000 / Bln',
      status: 'Aktif',
    },
    {
      id: 'c6',
      code: 'EARN-006',
      name: 'Tunjangan Hari Raya (THR Keagamaan)',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tahunan / Non-Reguler',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ TER Non-Reguler',
      formula: '1x Upah Sebulan (Masa Kerja >= 12 Bln)',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c7',
      code: 'EARN-007',
      name: 'Bonus Kinerja Tahunan (KPI Performance)',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tahunan / Non-Reguler',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ TER Non-Reguler',
      formula: '1.0x - 3.5x Upah Pokok (Review KPI)',
      status: 'Aktif',
    },
    {
      id: 'c8',
      code: 'EARN-008',
      name: 'Tunjangan Shift Operasional Pabrik',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Variabel Shift',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: 'Rp 45.000 / Shift Malam & Hari Libur',
      status: 'Aktif',
    },
    {
      id: 'c9',
      code: 'EARN-009',
      name: 'Insentif Penjualan & Komisi (Sales)',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Variabel Target',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: '2.5% - 5.0% Pencapaian Omzet',
      status: 'Aktif',
    },
    {
      id: 'c10',
      code: 'EARN-010',
      name: 'Tunjangan Penempatan Site / Remote',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tetap Penempatan',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: '15% - 30% Base Salary (Site Non-Jawa)',
      status: 'Aktif',
    },
    {
      id: 'c11',
      code: 'EARN-011',
      name: 'Tunjangan Sertifikasi Keahlian Khusus',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tetap Bulanan',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: 'Rp 1.000.000 / Lisensi Aktif',
      status: 'Aktif',
    },
    {
      id: 'c12',
      code: 'EARN-012',
      name: 'Kompensasi Akhir Kontrak PKWT',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Non-Reguler Kontrak',
      taxTreatment: 'PPh Final',
      taxBadge: '$ Formula PP 35',
      formula: 'Masa Kerja/12 x 1 Bulan Upah',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c13',
      code: 'EARN-013',
      name: 'Uang Penggantian Hak Cuti Tahunan',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Non-Reguler',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: 'Sisa Hari Cuti x (1/21 x Gaji Pokok)',
      status: 'Aktif',
    },
    {
      id: 'c14',
      code: 'EARN-014',
      name: 'Tunjangan Kendaraan Dinas (Car Allowance)',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tetap Manajerial',
      taxTreatment: 'Objek Pajak',
      taxBadge: '$ Penambah Bruto',
      formula: 'Rp 3.500.000 / Bulan (Level Manager)',
      status: 'Aktif',
    },
    {
      id: 'c15',
      code: 'DED-001',
      name: 'Iuran JHT Tenaga Kerja (Karyawan)',
      category: 'deductions',
      type: 'Potongan Wajib',
      nature: 'Statutori BPJSTK',
      taxTreatment: 'Pengurang Bruto',
      taxBadge: '▼ Pengurang Netto',
      formula: '2.0% x (Gaji Pokok + Tunj. Tetap)',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c16',
      code: 'DED-002',
      name: 'Iuran Jaminan Pensiun (JP Karyawan)',
      category: 'deductions',
      type: 'Potongan Wajib',
      nature: 'Statutori Capped',
      taxTreatment: 'Pengurang Bruto',
      taxBadge: '▼ Pengurang Netto',
      formula: '1.0% x Upah (Maks Rp 100.423)',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c17',
      code: 'DED-003',
      name: 'Iuran BPJS Kesehatan (Karyawan)',
      category: 'deductions',
      type: 'Potongan Wajib',
      nature: 'Statutori Capped',
      taxTreatment: 'Beban Karyawan',
      taxBadge: '• Non Pengurang',
      formula: '1.0% x Upah (Maks Rp 120.000)',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c18',
      code: 'DED-004',
      name: 'Pemotongan Pajak PPh 21 Bulanan',
      category: 'deductions',
      type: 'Potongan Wajib',
      nature: 'Pajak Statutori',
      taxTreatment: 'Pajak Penghasilan',
      taxBadge: '§ Tarif TER / Ps 17',
      formula: 'Skema TER PP 58/2023 & Ps 17 UU HPP',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c19',
      code: 'DED-005',
      name: 'Potongan Keterlambatan & Disiplin',
      category: 'deductions',
      type: 'Potongan Operasional',
      nature: 'Variabel Presensi',
      taxTreatment: 'Pengurang Bruto',
      taxBadge: '▼ Adjustment Gaji',
      formula: 'Matriks Jam Keterlambatan > 15 Menit',
      status: 'Aktif',
    },
    {
      id: 'c20',
      code: 'DED-006',
      name: 'Cicilan Koperasi & Payroll Loan',
      category: 'deductions',
      type: 'Potongan Sukarela',
      nature: 'Potongan Netto',
      taxTreatment: 'Pemotongan Netto',
      taxBadge: '• Pemotongan Gaji',
      formula: 'Sesuai Jadwal Angsuran Disetujui',
      status: 'Aktif',
    },
    {
      id: 'c21',
      code: 'BEN-001',
      name: 'Iuran JKK & JKM Dibayar Perusahaan',
      category: 'benefits',
      type: 'Benefit Statutori',
      nature: 'Statutori BPJSTK',
      taxTreatment: 'Penambah Bruto PPh 21',
      taxBadge: '$ Penambah Bruto',
      formula: 'JKK (0.89%) + JKM (0.30%) x Upah',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c22',
      code: 'BEN-002',
      name: 'Iuran JHT & JP Dibayar Perusahaan',
      category: 'benefits',
      type: 'Benefit Statutori',
      nature: 'Statutori BPJSTK',
      taxTreatment: 'Bukan Objek Pajak Saat Ini',
      taxBadge: '✓ Bebas PPh Saat Terima',
      formula: 'JHT (3.7%) + JP (2.0%) x Upah',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c23',
      code: 'BEN-003',
      name: 'Iuran BPJS Kesehatan Dibayar Perusahaan',
      category: 'benefits',
      type: 'Benefit Statutori',
      nature: 'Statutori Kesehatan',
      taxTreatment: 'Penambah Bruto PPh 21',
      taxBadge: '$ Penambah Bruto',
      formula: '4.0% x Upah (Maks Capped Rp 12Jt)',
      status: 'Berlaku Nasional',
    },
    {
      id: 'c24',
      code: 'BEN-004',
      name: 'Premi Asuransi Kesehatan Swasta Eksekutif',
      category: 'benefits',
      type: 'Benefit Perusahaan',
      nature: 'Fasilitas Natura',
      taxTreatment: 'Objek Pajak Kenikmatan',
      taxBadge: '$ PMK 66/2023',
      formula: 'Plafond Rp 25Jt - Rp 50Jt / Karyawan / Thn',
      status: 'Aktif',
    },
  ]);

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'earnings' | 'deductions' | 'benefits'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [natureFilter, setNatureFilter] = useState('ALL');
  const [componentStatusFilter, setComponentStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaxHistoryModal, setShowTaxHistoryModal] = useState(false);
  const [isTestingH2H, setIsTestingH2H] = useState(false);

  const [newCompForm, setNewCompForm] = useState({
    code: 'EARN-015',
    name: '',
    category: 'earnings' as 'earnings' | 'deductions' | 'benefits',
    type: 'Pendapatan',
    nature: 'Tetap',
    taxTreatment: 'Objek Pajak Bruto',
    formula: '',
    status: 'Aktif' as 'Berlaku Nasional' | 'Aktif' | 'Penyesuaian Cabang',
  });

  const filteredComponents = salaryComponents.filter((comp) => {
    if (categoryFilter !== 'all' && comp.category !== categoryFilter) return false;
    if (searchKeyword.trim() !== '') {
      const q = searchKeyword.toLowerCase();
      if (!comp.code.toLowerCase().includes(q) && !comp.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (natureFilter !== 'ALL') {
      if (!comp.nature.toLowerCase().includes(natureFilter.toLowerCase())) return false;
    }
    if (componentStatusFilter !== 'ALL') {
      if (comp.status !== componentStatusFilter) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredComponents.length / itemsPerPage));
  const paginatedComponents = filteredComponents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const earningsCount = salaryComponents.filter((c) => c.category === 'earnings').length;
  const deductionsCount = salaryComponents.filter((c) => c.category === 'deductions').length;
  const benefitsCount = salaryComponents.filter((c) => c.category === 'benefits').length;

  const handleDownloadMatrixXlsx = () => {
    showToast('Menyiapkan file Matriks Komponen Payroll & Regulasi Pajak (.xlsx)...');
    setTimeout(() => {
      const headers = ['KODE', 'NAMA KOMPONEN', 'KATEGORI', 'TIPE', 'SIFAT', 'PERLAKUAN PPH 21', 'FORMULA', 'STATUS'];
      const rows = salaryComponents.map((c) => [
        c.code,
        `"${c.name}"`,
        c.category,
        c.type,
        c.nature,
        `"${c.taxTreatment}"`,
        `"${c.formula}"`,
        c.status,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Master_Komponen_Payroll_PPh21_Nexora_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Matriks Komponen Payroll (.xlsx/.csv) berhasil diunduh!');
    }, 600);
  };

  const handleDownloadBatchCsv = () => {
    showToast('Mengunduh template file batch disbursement perbankan (.csv)...');
    setTimeout(() => {
      const batchSample = [
        'REK_ASAL,REK_TUJUAN,BANK_PENERIMA,NAMA_KARYAWAN,NOMINAL,BERITA,ID_KARYAWAN',
        '0882918899,5210984123,BCA,Dewi Lestari,18500000,Gaji Maret 2025,NX-2018012',
        '0882918899,1220098212,MANDIRI,Irvan Setiawan,14200000,Gaji Maret 2025,NX-2019042',
      ].join('\n');
      const blob = new Blob([batchSample], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Template_Batch_Disbursement_BCA_Mandiri.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Template file batch payroll (.csv) berhasil diunduh!');
    }, 500);
  };

  const handleTestH2H = () => {
    setIsTestingH2H(true);
    showToast('Menguji koneksi Host-to-Host (H2H) BCA Corporate & Mandiri MCM...');
    setTimeout(() => {
      setIsTestingH2H(false);
      showToast('Koneksi H2H Berhasil! Response time: BCA (18ms), Mandiri (24ms) - Status: SIAP TRANSFER');
    }, 1000);
  };

  const handleCreateComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompForm.name.trim()) return;

    const newItem: SalaryComponentItem = {
      id: `c-${Date.now()}`,
      code: newCompForm.code.trim().toUpperCase(),
      name: newCompForm.name.trim(),
      category: newCompForm.category,
      type: newCompForm.type,
      nature: newCompForm.nature,
      taxTreatment: newCompForm.taxTreatment,
      taxBadge: newCompForm.category === 'earnings' ? '$ Penambah Bruto' : newCompForm.category === 'deductions' ? '▼ Pengurang Netto' : '$ PMK 66',
      formula: newCompForm.formula.trim() || 'Formula Khusus HRIS',
      status: newCompForm.status,
    };

    setSalaryComponents([newItem, ...salaryComponents]);
    setShowAddModal(false);
    setNewCompForm({
      code: `EARN-0${salaryComponents.length + 2}`,
      name: '',
      category: 'earnings',
      type: 'Pendapatan',
      nature: 'Tetap',
      taxTreatment: 'Objek Pajak Bruto',
      formula: '',
      status: 'Aktif',
    });
    showToast(`Komponen gaji "${newItem.name}" (${newItem.code}) berhasil ditambahkan!`);
  };

  const handleDeleteComponent = (id: string, name: string) => {
    setSalaryComponents((prev) => prev.filter((item) => item.id !== id));
    showToast(`Komponen gaji "${name}" berhasil dihapus.`);
  };

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

      {/* Header Khusus Payroll matching screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-200/80 mt-0.5">
            <FileSpreadsheet className="w-5 h-5 text-blue-800" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Master Komponen Payroll &amp; Regulasi Pajak PPh 21
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Konfigurasi formula tunjangan, potongan BPJS Ketenagakerjaan &amp; Kesehatan, skema tarif
              efektif rata-rata (TER PPh 21 PP 58/2023), serta integrasi rekening batch payroll perbankan.
            </p>
          </div>
        </div>

        {/* Action Buttons Top Right matching screenshot */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleDownloadMatrixXlsx}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh Matriks (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTaxHistoryModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Riwayat Perubahan Pajak</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#002B80] hover:bg-[#002266] text-white shadow-xs transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Tambah Komponen Gaji</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL KOMPONEN GAJI */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TOTAL KOMPONEN GAJI
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{salaryComponents.length}</span>
              <span className="text-base font-bold text-slate-700">Komponen</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100">
            <span className="font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded">
              {earningsCount} Tunjangan • {deductionsCount + benefitsCount} Potongan
            </span>
            <span className="font-bold text-blue-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tax Expert Valid
            </span>
          </div>
        </div>

        {/* Card 2: FORMULA PPH 21 TERINTEGRASI */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              FORMULA PPH 21 TERINTEGRASI
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              TER PP 58/2023
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100">
            <span className="font-semibold text-slate-500">
              Kategori TER A, B, C &amp; Ps. 17
            </span>
            <span className="font-bold text-blue-600 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Sinkronisasi DJP
            </span>
          </div>
        </div>

        {/* Card 3: SKEMA BPJS KETENAGAKERJAAN */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              SKEMA BPJS KETENAGAKERJAAN
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              JHT, JKK, JKM, JP
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100">
            <span className="font-semibold text-slate-500">
              Formula PP 84/2013 &amp; Permenaker
            </span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Statutori
            </span>
          </div>
        </div>

        {/* Card 4: BATAS MAKSIMAL UPAH BPJS (CAP) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              BATAS MAKSIMAL UPAH BPJS (CAP)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Rp 10.042.300
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100">
            <span className="font-semibold text-slate-500">
              Plafon JP (Kesehatan: Rp 12Jt)
            </span>
            <span className="font-bold text-blue-600">
              BPS Rev. 2025
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Master Salary Components Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  Daftar Komponen Penggajian Master
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola formula kalkulasi, status objek pajak, dan relasi tunjangan struktural.
                </p>
              </div>

              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full self-start sm:self-center">
                {salaryComponents.length} Total Aktif
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
                  categoryFilter === 'all'
                    ? 'bg-[#002B80] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Komponen ({salaryComponents.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('earnings');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
                  categoryFilter === 'earnings'
                    ? 'bg-[#002B80] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pendapatan &amp; Tunjangan ({earningsCount})
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('deductions');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
                  categoryFilter === 'deductions'
                    ? 'bg-[#002B80] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Potongan Wajib &amp; Sukarela ({deductionsCount})
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('benefits');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
                  categoryFilter === 'benefits'
                    ? 'bg-[#002B80] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Benefit &amp; Natura Perusahaan ({benefitsCount})
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari kode (mis. EARN-001) atau nama komponen..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-3 relative">
                <select
                  value={natureFilter}
                  onChange={(e) => {
                    setNatureFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ALL">Semua Sifat Komponen</option>
                  <option value="Tetap">Tetap (Reguler)</option>
                  <option value="Variabel">Variabel / Operasional</option>
                  <option value="Statutori">Statutori (Pemerintah)</option>
                  <option value="Tahunan">Tahunan / Non-Reguler</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="sm:col-span-3 relative">
                <select
                  value={componentStatusFilter}
                  onChange={(e) => {
                    setComponentStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Berlaku Nasional">Berlaku Nasional</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Penyesuaian Cabang">Penyesuaian Cabang</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#EEF2F6] text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">KODE &amp; NAMA KOMPONEN</th>
                    <th className="py-3 px-3">TIPE &amp; SIFAT</th>
                    <th className="py-3 px-3">PERLAKUAN PPH 21</th>
                    <th className="py-3 px-3">FORMULA / NILAI DEFAULT</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-3 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedComponents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                        Tidak ada komponen penggajian yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedComponents.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                comp.category === 'earnings'
                                  ? 'bg-[#002B80]'
                                  : comp.category === 'deductions'
                                  ? 'bg-rose-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                {comp.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {comp.code}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">
                            {comp.type}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {comp.nature}
                          </p>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                comp.category === 'earnings'
                                  ? 'text-blue-700 bg-blue-50 border border-blue-200'
                                  : comp.category === 'deductions'
                                  ? 'text-rose-700 bg-rose-50 border border-rose-200'
                                  : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              }`}
                            >
                              {comp.taxBadge}
                            </span>
                            <p className="text-[10px] text-slate-500">
                              {comp.taxTreatment}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="text-[11px] font-semibold text-slate-800 font-mono">
                            {comp.formula}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              comp.status === 'Berlaku Nasional'
                                ? 'text-blue-800 bg-blue-100/70 border border-blue-200'
                                : comp.status === 'Aktif'
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : 'text-amber-700 bg-amber-50 border border-amber-200'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                showToast(`Detail formula ${comp.code} (${comp.name}) dibuka.`)
                              }
                              title="Lihat Detail Formula"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteComponent(comp.id, comp.name)}
                              title="Hapus Komponen"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <div>
                Menampilkan{' '}
                <span className="font-bold text-slate-900">
                  {filteredComponents.length === 0
                    ? 0
                    : (currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                -{' '}
                <span className="font-bold text-slate-900">
                  {Math.min(currentPage * itemsPerPage, filteredComponents.length)}
                </span>{' '}
                dari{' '}
                <span className="font-bold text-slate-900">
                  {filteredComponents.length}
                </span>{' '}
                Komponen Gaji Aktif
              </div>

              <div className="flex items-center gap-1 self-center sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700"
                >
                  Sebelumnya
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? 'bg-[#002B80] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Parameter BPJS & PPh 21 */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Parameter Iuran BPJS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Parameter Iuran BPJS
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Tahun 2025
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Distribusi beban iuran statutori antara entitas pemberi kerja (perusahaan) dan tenaga kerja.
            </p>

            <div className="space-y-3.5 pt-1">
              {/* Item 1: Jaminan Hari Tua (JHT) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Jaminan Hari Tua (JHT)</span>
                  <span className="font-bold text-blue-700 font-mono">Total 5.7%</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Perusahaan: <strong className="text-slate-800">3.7%</strong></span>
                  <span>Karyawan: <strong className="text-slate-800">2.0%</strong></span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="bg-blue-600 h-full" style={{ width: '65%' }} />
                  <div className="bg-[#002B80] h-full" style={{ width: '35%' }} />
                </div>
              </div>

              {/* Item 2: Jaminan Kematian (JKM) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Jaminan Kematian (JKM)</span>
                  <span className="font-bold text-blue-700 font-mono">0.3%</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Perusahaan: <strong className="text-slate-800">0.3%</strong></span>
                  <span>Karyawan: <strong className="text-slate-800">0.0%</strong></span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="bg-blue-600 h-full w-full" />
                </div>
              </div>

              {/* Item 3: Jaminan Kecelakaan Kerja (JKK) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Jaminan Kecelakaan Kerja (JKK)</span>
                  <span className="font-bold text-blue-700 font-mono">0.89%</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Perusahaan: <strong className="text-slate-800">0.89% (Risiko Sedang)</strong></span>
                  <span>Karyawan: <strong className="text-slate-800">0.0%</strong></span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="bg-blue-600 h-full w-full" />
                </div>
              </div>

              {/* Item 4: Jaminan Pensiun (JP) */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Jaminan Pensiun (JP)</span>
                  <span className="font-bold text-blue-700 font-mono">Total 3.0%</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Perusahaan: <strong className="text-slate-800">2.0%</strong></span>
                  <span>Karyawan: <strong className="text-slate-800">1.0%</strong></span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="bg-blue-600 h-full" style={{ width: '67%' }} />
                  <div className="bg-[#002B80] h-full" style={{ width: '33%' }} />
                </div>
                <p className="text-[10px] text-slate-400">
                  Plafon Upah Maksimal: Rp 10.042.300/bln (Maks Iuran Rp 301.269)
                </p>
              </div>

              {/* Item 5: BPJS Kesehatan (JKN) */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">BPJS Kesehatan (JKN)</span>
                  <span className="font-bold text-blue-700 font-mono">Total 5.0%</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Perusahaan: <strong className="text-slate-800">4.0%</strong></span>
                  <span>Karyawan: <strong className="text-slate-800">1.0%</strong></span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="bg-blue-600 h-full" style={{ width: '80%' }} />
                  <div className="bg-[#002B80] h-full" style={{ width: '20%' }} />
                </div>
                <p className="text-[10px] text-slate-400">
                  Plafon Upah Maksimal: Rp 12.000.000/bln (Maks Iuran Rp 600.000)
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Beban Perusahaan:</span>
                <strong className="text-blue-900 font-mono">10.89%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Beban Karyawan:</span>
                <strong className="text-slate-800 font-mono">4.00%</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                <span>Akumulasi Beban Statutori:</span>
                <span className="text-emerald-700 font-mono">14.89%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Skema Tarif Efektif Rata-Rata (TER PPh 21) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Skema Tarif Efektif Rata-Rata (TER)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                PP 58/2023
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900">Kategori TER A</strong>
                  <span className="text-[10px] font-semibold text-blue-600">0% s/d 34%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Status PTKP: TK/0 (Rp 54Jt), TK/1 &amp; K/0 (Rp 58.5Jt).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900">Kategori TER B</strong>
                  <span className="text-[10px] font-semibold text-blue-600">0% s/d 34%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Status PTKP: TK/2 &amp; K/1 (Rp 63Jt), TK/3 &amp; K/2 (Rp 67.5Jt).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900">Kategori TER C</strong>
                  <span className="text-[10px] font-semibold text-blue-600">0% s/d 34%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Status PTKP: K/3 (Rp 72Jt).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1 text-xs">
              <p className="font-bold text-blue-900">Masa Pajak Terakhir (Desember):</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Otomatis rekonsiliasi Pasal 17 ayat (1) huruf a UU HPP atas akumulasi penghasilan setahun dikurangi PTKP.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                DJP e-Bupot 21/26 Terverifikasi Otomatis
              </span>
            </div>
          </div>

          {/* Card 3: Batch Disbursement & Host-to-Host Bank */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Batch Payroll Disbursement
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                H2H Online
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">BCA Corporate Giro</p>
                  <p className="text-[11px] text-slate-400 font-mono">088-291-8899 • Host-to-Host</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Primary
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Bank Mandiri MCM 2.0</p>
                  <p className="text-[11px] text-slate-400 font-mono">122-00-98212-00 • API Gateway</p>
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  Secondary
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadBatchCsv}
                className="py-2 px-3 text-[11px] font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Format Batch (.csv)</span>
              </button>

              <button
                type="button"
                onClick={handleTestH2H}
                disabled={isTestingH2H}
                className="py-2 px-3 text-[11px] font-bold rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-blue-700 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingH2H ? 'animate-spin' : ''}`} />
                <span>{isTestingH2H ? 'Menguji...' : 'Uji Koneksi H2H'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Tambah Komponen Gaji Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Komponen Gaji Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateComponent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Komponen</label>
                  <input
                    type="text"
                    required
                    value={newCompForm.code}
                    onChange={(e) => setNewCompForm({ ...newCompForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newCompForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setNewCompForm({
                        ...newCompForm,
                        category: cat,
                        type: cat === 'earnings' ? 'Pendapatan' : cat === 'deductions' ? 'Potongan Wajib' : 'Benefit Statutori',
                        taxTreatment: cat === 'earnings' ? 'Objek Pajak Bruto' : cat === 'deductions' ? 'Pengurang Bruto' : 'Bukan Objek Pajak',
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
                  >
                    <option value="earnings">Pendapatan &amp; Tunjangan</option>
                    <option value="deductions">Potongan Wajib &amp; Sukarela</option>
                    <option value="benefits">Benefit Perusahaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Komponen Penggajian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tunjangan Perumahan Manajerial"
                  value={newCompForm.name}
                  onChange={(e) => setNewCompForm({ ...newCompForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sifat Pembayaran</label>
                  <select
                    value={newCompForm.nature}
                    onChange={(e) => setNewCompForm({ ...newCompForm, nature: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
                  >
                    <option value="Tetap Bulanan">Tetap Bulanan</option>
                    <option value="Variabel Harian">Variabel Harian</option>
                    <option value="Variabel Lembur">Variabel Lembur</option>
                    <option value="Tahunan / Non-Reguler">Tahunan / Non-Reguler</option>
                    <option value="Statutori BPJSTK">Statutori BPJSTK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perlakuan PPh 21</label>
                  <select
                    value={newCompForm.taxTreatment}
                    onChange={(e) => setNewCompForm({ ...newCompForm, taxTreatment: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
                  >
                    <option value="Objek Pajak Bruto">Objek Pajak Bruto (TER)</option>
                    <option value="Pengurang Bruto">Pengurang Bruto (Iuran Sah)</option>
                    <option value="Bukan Objek Pajak">Bukan Objek Pajak (Natura Non-Pajak)</option>
                    <option value="PPh Final">PPh Final (Kompensasi PKWT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Formula / Nilai Default</label>
                <input
                  type="text"
                  placeholder="Contoh: Rp 2.500.000 / Bulan atau 5% x Gaji Pokok"
                  value={newCompForm.formula}
                  onChange={(e) => setNewCompForm({ ...newCompForm, formula: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B80] hover:bg-[#002266] text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Komponen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Riwayat Perubahan Pajak */}
      {showTaxHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Riwayat Perubahan Pajak &amp; Regulasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTaxHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 font-bold">Plafon Upah JP BPJSTK Disesuaikan</strong>
                  <span className="text-[10px] text-slate-400">01 Jan 2025</span>
                </div>
                <p className="text-slate-600">
                  Batas maksimal upah Jaminan Pensiun ditingkatkan menjadi <strong>Rp 10.042.300</strong> berdasarkan rilis pertumbuhan PDB BPS dan SE Kemenaker No. B/12/2025.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 font-bold">Implementasi Skema TER PPh 21</strong>
                  <span className="text-[10px] text-slate-400">01 Jan 2024</span>
                </div>
                <p className="text-slate-600">
                  Penerapan Tarif Efektif Rata-rata (TER Kategori A, B, C) untuk pemotongan PPh 21 bulanan sesuai PP 58/2023 &amp; PMK 168/2023.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 font-bold">Pembaruan Pajak Natura PMK 66/2023</strong>
                  <span className="text-[10px] text-slate-400">01 Jul 2023</span>
                </div>
                <p className="text-slate-600">
                  Fasilitas asuransi kesehatan swasta dan benefit natura diklasifikasikan ulang sesuai ambang batas non-objek pajak.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 font-bold">Standardisasi Overtime PP 35/2021</strong>
                  <span className="text-[10px] text-slate-400">15 Des 2022</span>
                </div>
                <p className="text-slate-600">
                  Rumus upah lembur resmi dan kompensasi akhir masa kontrak PKWT disahkan oleh Konsultan Pajak Korporasi.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTaxHistoryModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
