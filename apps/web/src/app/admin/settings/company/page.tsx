'use client';

import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Save,
  History,
  Upload,
  Trash2,
  MapPin,
  Compass,
  Radio,
  Plus,
  Edit3,
  SlidersHorizontal,
  X,
  Check,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface BranchOffice {
  id: string;
  name: string;
  type: string;
  address: string;
  coordinates: string;
  radiusMeters: number;
  staffCount: number;
  wifiSsid: string;
  status: 'ACTIVE' | 'CALIBRATING';
}

export default function CompanySettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Legal Company Data Form
  const [companyForm, setCompanyForm] = useState({
    legalName: 'PT Nexora Teknologi Nusantara Tbk',
    commercialName: 'Nexora Group & HR Solutions',
    nib: '0220108920194001',
    npwp: '01.345.678.9-012.000',
    kbli: '62019 - Aktivitas Pemrograman Komputer & Solusi Cloud Korporasi Terintegrasi',
    entityType: 'Perseroan Terbuka (Tbk)',
    address: 'SCBD Treasury Tower Lt. 32, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan, DKI Jakarta 12190',
  });

  // Branch Offices List
  const [branchOffices, setBranchOffices] = useState<BranchOffice[]>([
    {
      id: 'b-1',
      name: 'Head Office (HQ) Jakarta',
      type: 'Kantor Pusat & Eksekutif',
      address: 'SCBD Treasury Tower Lt. 32, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
      coordinates: '-6.2255, 106.8089',
      radiusMeters: 100,
      staffCount: 680,
      wifiSsid: 'NEXORA_CORP_SECURE',
      status: 'ACTIVE',
    },
    {
      id: 'b-2',
      name: 'Bandung R&D & Engineering Hub',
      type: 'Pusat Riset & Rekayasa Produk',
      address: 'Dago Tech Park Kav. 12, Jl. Ir. H. Juanda, Bandung, Jawa Barat',
      coordinates: '-6.8824, 107.6145',
      radiusMeters: 150,
      staffCount: 145,
      wifiSsid: 'NEXORA_BANDUNG_DEV',
      status: 'ACTIVE',
    },
    {
      id: 'b-3',
      name: 'Pabrik & Manufaktur Cikarang',
      type: 'Fasilitas Pabrik & Operasional',
      address: 'Kawasan Industri GIIC Blok C-15, Cikarang Pusat, Bekasi, Jawa Barat',
      coordinates: '-6.3571, 107.1682',
      radiusMeters: 250,
      staffCount: 850,
      wifiSsid: 'NEXORA_PLANT_FACTORY',
      status: 'ACTIVE',
    },
    {
      id: 'b-4',
      name: 'Hub Logistik Surabaya',
      type: 'Distribusi & Pergudangan Regional',
      address: 'Jl. Rungkut Industri III No. 45, Surabaya, Jawa Timur',
      coordinates: '-7.3312, 112.7601',
      radiusMeters: 120,
      staffCount: 320,
      wifiSsid: 'NEXORA_SUB_LOGISTICS',
      status: 'ACTIVE',
    },
  ]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    type: 'Kantor Cabang Operasional',
    address: '',
    coordinates: '-6.2088, 106.8456',
    radiusMeters: 100,
    staffCount: 50,
    wifiSsid: 'NEXORA_OFFICE_WIFI',
  });

  const handleSaveProfile = () => {
    showToast('Pembaruan data legalitas perseroan & identitas visual berhasil disimpan!');
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim()) return;

    const branch: BranchOffice = {
      id: `b-${Date.now()}`,
      name: newBranch.name,
      type: newBranch.type,
      address: newBranch.address,
      coordinates: newBranch.coordinates,
      radiusMeters: Number(newBranch.radiusMeters),
      staffCount: Number(newBranch.staffCount),
      wifiSsid: newBranch.wifiSsid,
      status: 'ACTIVE',
    };

    setBranchOffices([...branchOffices, branch]);
    setShowBranchModal(false);
    setNewBranch({
      name: '',
      type: 'Kantor Cabang Operasional',
      address: '',
      coordinates: '-6.2088, 106.8456',
      radiusMeters: 100,
      staffCount: 50,
      wifiSsid: 'NEXORA_OFFICE_WIFI',
    });
    showToast(`Kantor cabang "${branch.name}" berhasil ditambahkan.`);
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

      {/* Page Header Section matching screenshot */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Profil Perusahaan &amp; Manajemen Kantor
            </h1>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              Holding Group Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Kelola identitas badan hukum perseroan, nomor legalitas &amp; perpajakan (NPWP, NIB), daftar
            kantor cabang operasional, koordinat geofencing absensi, serta struktur entitas bisnis Nexora Group.
          </p>
        </div>

        {/* Action Buttons Top Right matching screenshot */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Riwayat Perubahan Legalitas</span>
          </button>

          <button
            type="button"
            onClick={handleSaveProfile}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Simpan Pembaruan Profil</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ----------------------------------------------------- */}
        {/* LEFT COLUMN (8 cols): Identitas Badan Hukum & Legalitas*/}
        {/* ----------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            {/* Header Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Identitas Badan Hukum &amp; Informasi Legal
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konfigurasi data pokok perseroan terdaftar sesuai AHU dan basis data perpajakan negara.
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Entitas Terverifikasi Kemenkumham &amp; DJP</span>
              </span>
            </div>

            {/* Logo Visual Upload matching screenshot */}
            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-sm tracking-tighter">
                  N
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    Logo Resmi &amp; Identitas Visual Korporasi
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-md mt-0.5">
                    Ditampilkan pada slip gaji elektronik, laporan kepatuhan, serta dashboard karyawan. Rasio 1:1 (Maks. 2.0 MB).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Membuka file dialog unggah logo resmi...')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Unggah Logo Resmi</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Logo berhasil di-reset ke default.')}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Legal Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Resmi Badan Usaha (Sesuai Akta AHU)
                </label>
                <input
                  type="text"
                  value={companyForm.legalName}
                  onChange={(e) => setCompanyForm({ ...companyForm, legalName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Komersial / Brand Tagline
                </label>
                <input
                  type="text"
                  value={companyForm.commercialName}
                  onChange={(e) => setCompanyForm({ ...companyForm, commercialName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Induk Berusaha (NIB OSS RBA)
                </label>
                <input
                  type="text"
                  value={companyForm.nib}
                  onChange={(e) => setCompanyForm({ ...companyForm, nib: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Pokok Wajib Pajak (NPWP 16 Digit)
                </label>
                <input
                  type="text"
                  value={companyForm.npwp}
                  onChange={(e) => setCompanyForm({ ...companyForm, npwp: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Klasifikasi Baku Lapangan Usaha Indonesia (KBLI)
                </label>
                <input
                  type="text"
                  value={companyForm.kbli}
                  onChange={(e) => setCompanyForm({ ...companyForm, kbli: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Kantor Pusat Terdaftar (Legal AHU)
                </label>
                <textarea
                  rows={2}
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------- */}
        {/* RIGHT COLUMN (4 cols): Radar Geofencing Presensi      */}
        {/* ----------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Radar Geofencing Presensi
                </h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pemantauan koordinat GPS absensi mobile secara real-time. Batas toleransi validasi akurasi satelit:{' '}
              <strong className="text-slate-800">±15 meter</strong>.
            </p>

            {/* Interactive Radar Screen Visualization matching screenshot */}
            <div className="relative w-full aspect-square rounded-2xl bg-[#09152C] overflow-hidden p-4 flex items-center justify-center border border-slate-800 shadow-inner">
              {/* Radar concentric circles */}
              <div className="absolute inset-4 rounded-full border border-blue-500/20" />
              <div className="absolute inset-10 rounded-full border border-blue-500/30" />
              <div className="absolute inset-16 rounded-full border border-blue-400/40" />
              <div className="absolute inset-24 rounded-full border border-blue-400/50" />

              {/* Grid cross lines */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-blue-500/20" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-blue-500/20" />

              {/* Radar sweep beam animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/10 to-transparent animate-spin-slow pointer-events-none" />

              {/* Zoom Buttons matching screenshot */}
              <div className="absolute right-3 top-3 flex flex-col gap-1 z-10">
                <button
                  type="button"
                  onClick={() => showToast('Zoom radar in (+)')}
                  className="w-6 h-6 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-800"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Zoom radar out (-)')}
                  className="w-6 h-6 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-800"
                >
                  -
                </button>
              </div>

              {/* Map Point: HQ Jakarta */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-blue-500/30 animate-pulse" />
                <span className="text-[10px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                  HQ Jakarta
                </span>
              </div>

              {/* Map Point: Cikarang (250m) matching screenshot */}
              <div className="absolute bottom-8 left-16 flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30" />
                <span className="text-[9px] font-bold text-slate-200 bg-slate-900/90 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">
                  Cikarang (250m)
                </span>
              </div>

              {/* Map Point: Surabaya */}
              <div className="absolute bottom-10 right-10 flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                <span className="text-[9px] font-bold text-slate-200 bg-slate-900/90 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">
                  Surabaya
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Status Koordinat:</span>
                <span className="text-emerald-700 font-bold">4 Titik Cabang Aktif</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Data sinkronisasi satelit GNSS/Galileo &amp; validasi IP Gateway real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* BOTTOM SECTION: Daftar Kantor Cabang & Entitas Grup   */}
      {/* ----------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Daftar Kantor Cabang &amp; Fasilitas Operasional
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola radius toleransi check-in geofence dan access point WiFi terdaftar per unit kerja.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBranchModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#002B80] hover:bg-[#002266] text-white shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Tambah Kantor Cabang</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#EEF2F6] text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">NAMA KANTOR &amp; TIPE</th>
                <th className="py-3 px-3">ALAMAT &amp; KOORDINAT GPS</th>
                <th className="py-3 px-3">RADIUS GEOFENCE</th>
                <th className="py-3 px-3">HEADCOUNT AKTIF</th>
                <th className="py-3 px-3">WIFI SSID RESMI</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {branchOffices.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{b.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{b.type}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-xs text-slate-700 line-clamp-1 max-w-xs">{b.address}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      <MapPin className="w-3 h-3 inline mr-1 text-slate-400" />
                      {b.coordinates}
                    </p>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-800 font-mono">{b.radiusMeters} Meter</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-slate-800">{b.staffCount} Karyawan</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {b.wifiSsid}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ● Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => showToast(`Edit koordinat kantor ${b.name} dibuka.`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Riwayat Perubahan Legalitas */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Riwayat Perubahan Legalitas Perseroan</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 font-bold">Pembaruan Akta Perubahan Modal AHU</strong>
                  <span className="text-[10px] text-slate-400">14 Jan 2025</span>
                </div>
                <p className="text-slate-600">
                  Peningkatan modal ditempatkan dan disetor penuh tercatat dalam SK Menkumham RI No. AHU-00129.AH.01.02.Tahun 2025.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900 font-bold">Penetapan NPWP 16 Digit (NIK/NPWP16)</strong>
                  <span className="text-[10px] text-slate-400">01 Jul 2024</span>
                </div>
                <p className="text-slate-600">
                  Sinkronisasi format NPWP 16 digit terintegrasi langsung dengan portal Coretax DJP.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Tambah Kantor Cabang */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Tambah Kantor Cabang Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBranchModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kantor / Hub</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kantor Cabang Medan"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Fasilitas</label>
                  <select
                    value={newBranch.type}
                    onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 bg-white"
                  >
                    <option value="Kantor Cabang Operasional">Kantor Cabang Operasional</option>
                    <option value="Hub Logistik Regional">Hub Logistik Regional</option>
                    <option value="Fasilitas Manufaktur">Fasilitas Manufaktur</option>
                    <option value="Pusat Layanan Klien">Pusat Layanan Klien</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Radius Geofence (Meter)</label>
                  <input
                    type="number"
                    min={30}
                    max={500}
                    value={newBranch.radiusMeters}
                    onChange={(e) => setNewBranch({ ...newBranch, radiusMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Koordinat GPS (Latitude, Longitude)</label>
                <input
                  type="text"
                  placeholder="Contoh: 3.5952, 98.6722"
                  value={newBranch.coordinates}
                  onChange={(e) => setNewBranch({ ...newBranch, coordinates: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  placeholder="Alamat fisik gedung cabang..."
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Cabang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
