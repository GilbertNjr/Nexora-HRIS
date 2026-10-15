'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  ChevronDown,
  Fingerprint,
  RefreshCw,
  Landmark,
  Mail,
  KeyRound,
  ChevronRight,
  Lock,
  Shield,
  Download,
  Check,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function AttendanceSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State matching screenshot 1 & 2
  const [shiftWork, setShiftWork] = useState('Reguler HQ (08:00 - 17:00 WIB)');
  const [lateTolerance, setLateTolerance] = useState('15');
  const [geofenceRadius, setGeofenceRadius] = useState('100');
  const [requireSelfie, setRequireSelfie] = useState(true);
  const [allowCorrection, setAllowCorrection] = useState(true);
  const [overtimePolicy, setOvertimePolicy] = useState<'spl' | 'biometric'>('spl');
  const [requireSplDinasLuar, setRequireSplDinasLuar] = useState(true);
  const [wifiBssidLock, setWifiBssidLock] = useState(true);

  // Biometrics Machine State matching screenshot
  const [machines, setMachines] = useState([
    { id: 'm1', name: 'HQ Jakarta - Lantai 3', ip: '192.168.1.120', status: 'Online', lastPing: '2 ms lalu' },
    { id: 'm2', name: 'Pabrik Cikarang - Pos 1', ip: '192.168.10.45', status: 'Online', lastPing: '14 ms lalu' },
    { id: 'm3', name: 'Hub Logistik Surabaya', ip: '192.168.20.18', status: 'Online', lastPing: '28 ms lalu' },
    { id: 'm4', name: 'Cabang Bandung - Front Office', ip: '192.168.30.12', status: 'Online', lastPing: '9 ms lalu' },
  ]);

  const [isSyncingMachines, setIsSyncingMachines] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('24 Maret 2025, 08:30 WIB oleh Super Admin');

  const handleTestSyncMachines = () => {
    setIsSyncingMachines(true);
    showToast('Menguji koneksi ke 4 terminal mesin biometrik...');
    setTimeout(() => {
      setIsSyncingMachines(false);
      setMachines((prev) =>
        prev.map((m) => ({
          ...m,
          status: 'Online',
          lastPing: `${Math.floor(4 + Math.random() * 20)} ms lalu`,
        }))
      );
      showToast('Semua terminal biometrik berhasil merespons (Latency optimal < 30ms)');
    }, 900);
  };

  const handleDownloadBackup = () => {
    showToast('Menyiapkan file backup konfigurasi presensi (.json)...');
    setTimeout(() => {
      const backupData = {
        app: 'Nexora HRIS Enterprise Portal',
        module: 'Attendance & Work Policy',
        exportedAt: new Date().toISOString(),
        settings: { shiftWork, lateTolerance, geofenceRadius, requireSelfie, allowCorrection, overtimePolicy },
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nexora_Attendance_Policy_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('File backup konfigurasi kebijakan presensi (.json) berhasil diunduh!');
    }, 600);
  };

  const handleSaveAllChanges = () => {
    const now = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    setLastSyncTime(`${now} WIB oleh Super Admin`);
    showToast('Seluruh konfigurasi kebijakan kerja & presensi berhasil disimpan dan disinkronkan!');
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pengaturan &amp; Konfigurasi Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Kelola kebijakan HR, matriks hak akses pengguna (RBAC), parameter jam kerja, integrasi
            perangkat biometrik, serta audit keamanan data perusahaan.
          </p>
        </div>

        {/* Action Buttons Top Right matching screenshot */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh Backup (.json)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAllChanges}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>
      </div>

      {/* Top Status Banner Card matching screenshot */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="text-sm font-bold text-slate-900">
                  Status Sistem: Berjalan Normal
                </span>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                v2.4.2 Enterprise Release
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Terakhir Disinkronkan: {lastSyncTime}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Enkripsi Data AES-256 Aktif •</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>2FA Diwajibkan (Level Manajerial)</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid matching screenshot 1 & 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ----------------------------------------------------- */}
        {/* LEFT COLUMN: Parameter Kebijakan Jam Kerja & Toleransi*/}
        {/* ----------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">
                    Parameter Kebijakan Jam Kerja &amp; Toleransi Presensi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aturan batas keterlambatan, geofencing lokasi, dan validasi kehadiran harian.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full self-start sm:self-center">
                Penerapan: Semua Divisi (Default)
              </span>
            </div>

            {/* Row 1 - Shift Kerja & Batas Toleransi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Shift Kerja Utama</label>
                <div className="relative">
                  <select
                    value={shiftWork}
                    onChange={(e) => setShiftWork(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Reguler HQ (08:00 - 17:00 WIB)">Reguler HQ (08:00 - 17:00 WIB)</option>
                    <option value="Shift Pagi Operasional (06:00 - 15:00 WIB)">
                      Shift Pagi Operasional (06:00 - 15:00 WIB)
                    </option>
                    <option value="Shift Siang Operasional (14:00 - 23:00 WIB)">
                      Shift Siang Operasional (14:00 - 23:00 WIB)
                    </option>
                    <option value="Flexible Tech Work (Core: 09:30 - 16:30 WIB)">
                      Flexible Tech Work (Core: 09:30 - 16:30 WIB)
                    </option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Diterapkan secara otomatis untuk seluruh staf non-lapangan.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Batas Toleransi Keterlambatan
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={lateTolerance}
                    onChange={(e) => setLateTolerance(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-xs text-slate-400 font-medium absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    Menit
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Keterlambatan di atas batas ini otomatis tercatat sebagai pemotongan insentif disiplin.
                </p>
              </div>
            </div>

            {/* Row 2 - Radius Geofencing */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Radius Geofencing Presensi Mobile
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={20}
                  max={500}
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 pr-60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-xs text-slate-400 font-medium absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  Meter dari Koordinat Titik Kantor
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Toleransi presensi GPS mobile app karyawan berbasis titik koordinat valid cabang.
              </p>
            </div>

            {/* Row 3 - Toggles */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">
                    Wajib Foto Selfie (Liveness Detection) saat Check-in Mobile
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Mencegah manipulasi lokasi dan absensi titipan melalui biometrik wajah langsung.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireSelfie(!requireSelfie)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
                    requireSelfie ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      requireSelfie ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      Izinkan Permintaan Koreksi Presensi Mandiri
                    </p>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Maksimal 3x / Bulan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Karyawan dapat mengajukan lupa tap-in/out dengan wajib melampirkan bukti logikal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowCorrection(!allowCorrection)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
                    allowCorrection ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      allowCorrection ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Row 4 - Kebijakan Lembur SPL */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Kebijakan Perhitungan Lembur (Overtime)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setOvertimePolicy('spl')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    overtimePolicy === 'spl'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="overtimePolicy"
                    checked={overtimePolicy === 'spl'}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      Wajib Surat Perintah Lembur (SPL)
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Perhitungan uang lembur hanya aktif jika disetujui atasan divisi sebelumnya.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setOvertimePolicy('biometric')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    overtimePolicy === 'biometric'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="overtimePolicy"
                    checked={overtimePolicy === 'biometric'}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      Otomatis Selisih Jam Biometrik
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Dihitung otomatis saat jam check-out melebihi 60 menit setelah jadwal shift selesai.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Standar PP 35/2021 & Core Hours */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Standar Hari Kerja &amp; Matriks Jam Fleksibel
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Standar Beban Kerja Mingguan</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      PP 35/2021
                    </span>
                  </div>
                  <p className="text-slate-600">5 Hari Kerja (Senin - Jumat) • Total 40 Jam Kerja Aktif.</p>
                  <p className="text-[10px] text-slate-400">Istirahat wajib minimal 1 jam setelah 4 jam bekerja.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Jam Inti Kehadiran (Core Hours)</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      Hybrid Policy
                    </span>
                  </div>
                  <p className="text-slate-600">09:30 - 16:30 WIB (Wajib Berada di Kantor / Online).</p>
                  <p className="text-[10px] text-slate-400">Fleksibilitas kedatangan ±30 menit sebelum core hours.</p>
                </div>
              </div>

              {/* Toggles: Dinas Luar & Anti-Fake GPS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      Wajib Surat Perjalanan Dinas / Lampiran GPS Luar Geofence
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Karyawan yang dinas luar kota wajib menyertakan foto geotagged lokasi kunjungan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireSplDinasLuar(!requireSplDinasLuar)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
                      requireSplDinasLuar ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        requireSplDinasLuar ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      Validasi BSSID WiFi Jaringan Kantor (Anti-Fake GPS)
                    </p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Memastikan check-in terhubung dengan access point jaringan resmi gedung kantor.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWifiBssidLock(!wifiBssidLock)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0 ${
                      wifiBssidLock ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        wifiBssidLock ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------- */}
        {/* RIGHT COLUMN: Integrasi Mesin & Gateway Eksternal     */}
        {/* ----------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Integrasi Mesin Biometrik */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Integrasi &amp; Mesin
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                ● Terkoneksi (4 Terminal)
              </span>
            </div>

            {/* Machines List matching screenshot */}
            <div className="space-y-2.5">
              {machines.slice(0, 3).map((machine) => (
                <div
                  key={machine.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{machine.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">IP: {machine.ip}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                    {machine.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Test Sync Button */}
            <button
              type="button"
              onClick={handleTestSyncMachines}
              disabled={isSyncingMachines}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncingMachines ? 'animate-spin' : ''}`} />
              <span>{isSyncingMachines ? 'Menguji Koneksi...' : 'Tes Sinkronisasi Semua Mesin'}</span>
            </button>

            {/* GATEWAY EKSTERNAL matching screenshot */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GATEWAY EKSTERNAL
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Landmark className="w-3.5 h-3.5 text-slate-400" />
                    <span>BCA Corporate Cash (H2H)</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600">Aktif</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Landmark className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mandiri MCM 2.0 API</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600">Aktif</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>SMTP: mail.nexora-hr.id (587)</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600">TLS Aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Ringkasan Hak Akses Presensi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  Hak Akses &amp; Peran
                </h3>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                4 Tingkat Peran
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-800">Super Admin:</span>
                <span className="text-emerald-600 font-bold">Bypass &amp; Config Mesin</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-800">HR Operations:</span>
                <span className="text-blue-600 font-bold">Koreksi &amp; SPL Otomatis</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="font-semibold text-slate-800">Dept Lead:</span>
                <span className="text-slate-700 font-medium">Otorisasi Shift &amp; Cuti</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-slate-800">Karyawan:</span>
                <span className="text-slate-500">Tap Mobile &amp; Ajukan Lupa</span>
              </div>
            </div>

            <Link
              href="/admin/settings/rbac"
              className="w-full py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Kelola Matriks RBAC Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Audit Log Kebijakan Terkini */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                Audit Log Kebijakan Terkini
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Presensi Log</span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 space-y-0.5">
                <p className="font-bold text-slate-800">Toleransi Keterlambatan Diubah ke 15 Menit</p>
                <p className="text-[10px] text-slate-400">20 Mar 2025 • Oleh Super Admin (NX-2017001)</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 space-y-0.5">
                <p className="font-bold text-slate-800">Wajib Liveness Detection Selfie Diaktifkan</p>
                <p className="text-[10px] text-slate-400">15 Mar 2025 • Modul Mobile v2.4.2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
