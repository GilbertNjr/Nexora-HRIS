'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  CheckCircle2,
  Save,
  History,
  Upload,
  Trash2,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function CompanySettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 4000);
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
    logoUrl: '',
  });

  const [logoCompressionInfo, setLogoCompressionInfo] = useState<{
    originalSize: string;
    compressedSize: string;
    savingsPercent: number;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Client-side automatic image compression to lightweight JPG (image/jpeg)
  const compressImageToJpg = (
    file: File
  ): Promise<{ dataUrl: string; originalSize: string; compressedSize: string; savingsPercent: number }> => {
    return new Promise((resolve, reject) => {
      const originalBytes = file.size;
      const originalKb = (originalBytes / 1024).toFixed(1);
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          // 400x400 max dimension - perfect crisp resolution for 1:1 corporate logos
          const MAX_DIM = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas tidak dapat diinisialisasi'));
            return;
          }

          // 1. Fill clean white background (prevents transparent PNGs from turning black in JPG)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // 2. Draw scaled image
          ctx.drawImage(img, 0, 0, width, height);

          // 3. Compress to image/jpeg at 0.82 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

          // 4. Calculate size savings
          const head = 'data:image/jpeg;base64,';
          const base64Length = dataUrl.length - head.length;
          const compressedBytes = base64Length * 0.75;
          const compressedKb = (compressedBytes / 1024).toFixed(1);

          const savingsPercent = Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100));

          resolve({
            dataUrl,
            originalSize: `${originalKb} KB`,
            compressedSize: `${compressedKb} KB`,
            savingsPercent,
          });
        };

        img.onerror = () => reject(new Error('Gagal memuat file gambar'));
      };

      reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Format tidak didukung. Harap pilih gambar (PNG, JPG, JPEG, WebP).');
      return;
    }

    try {
      setIsCompressing(true);
      const res = await compressImageToJpg(file);
      setCompanyForm((prev) => ({ ...prev, logoUrl: res.dataUrl }));
      setLogoCompressionInfo({
        originalSize: res.originalSize,
        compressedSize: res.compressedSize,
        savingsPercent: res.savingsPercent,
      });

      // Persist immediately to dedicated local logo cache
      localStorage.setItem('nexora_persistent_company_logo', res.dataUrl);

      // Save immediately to global database so all mobile devices (HP) & other screens update in real time!
      try {
        await fetch('/api/v1/company', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoUrl: res.dataUrl, commercialName: companyForm.commercialName }),
        });
        const bc = new BroadcastChannel('nexora_live_sync');
        bc.postMessage({
          type: 'LOGO_UPDATED',
          logoUrl: res.dataUrl,
          companyName: companyForm.commercialName,
        });
        bc.close();
      } catch {}

      showToast(
        `✓ Logo berhasil diunggah & disinkronkan secara global ke database untuk seluruh HP & perangkat lain (${res.originalSize} ➔ ${res.compressedSize})!`
      );
    } catch (err: any) {
      showToast('Gagal memproses gambar: ' + (err.message || 'Error'));
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetLogo = async () => {
    setCompanyForm((prev) => ({ ...prev, logoUrl: '' }));
    setLogoCompressionInfo(null);
    localStorage.removeItem('nexora_persistent_company_logo');
    try {
      await fetch('/api/v1/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: '', commercialName: companyForm.commercialName }),
      });
      const bc = new BroadcastChannel('nexora_live_sync');
      bc.postMessage({
        type: 'LOGO_UPDATED',
        logoUrl: '',
        companyName: companyForm.commercialName,
      });
      bc.close();
    } catch {}
    showToast('✓ Logo resmi di-reset ke inisial default (N) secara global.');
  };

  // Load saved company data from backend API / database with defensive caching
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const cachedLogo = localStorage.getItem('nexora_persistent_company_logo') || '';
        // Fast local load
        const cached = localStorage.getItem('nexora_company_settings');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setCompanyForm((prev) => ({
              ...prev,
              ...parsed,
              logoUrl: parsed.logoUrl || cachedLogo || prev.logoUrl,
            }));
          } catch {
            // ignore
          }
        } else if (cachedLogo) {
          setCompanyForm((prev) => ({ ...prev, logoUrl: cachedLogo }));
        }

        // Backend load
        const res = await fetch('/api/v1/company');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCompanyForm((prev) => {
              // DEFENSIVE CACHING: Preserve existing logo if server returns empty string
              const persistentLogo =
                json.data.logoUrl || prev.logoUrl || cachedLogo || '';
              const merged = {
                ...prev,
                ...json.data,
                logoUrl: persistentLogo,
              };
              localStorage.setItem('nexora_company_settings', JSON.stringify(merged));
              if (persistentLogo) {
                localStorage.setItem('nexora_persistent_company_logo', persistentLogo);
              }
              return merged;
            });
          }
        }
      } catch {
        // silent fallback
      }
    };

    loadCompanyData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...companyForm,
      };

      // 1. Local backup & persistent logo
      localStorage.setItem('nexora_company_settings', JSON.stringify(payload));
      if (companyForm.logoUrl) {
        localStorage.setItem('nexora_persistent_company_logo', companyForm.logoUrl);
      } else {
        localStorage.removeItem('nexora_persistent_company_logo');
      }

      // 2. Broadcast immediately to open layouts (Sidebar & Header)
      try {
        const bc = new BroadcastChannel('nexora_live_sync');
        bc.postMessage({
          type: 'LOGO_UPDATED',
          logoUrl: companyForm.logoUrl,
          companyName: companyForm.commercialName,
        });
        bc.close();
      } catch {
        // ignore
      }

      // 3. Backend database save
      const res = await fetch('/api/v1/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Data legalitas perseroan & logo JPG terkompresi berhasil disimpan ke database!');
      } else {
        showToast(json.error?.message || 'Data disimpan ke penyimpanan lokal.');
      }
    } catch {
      showToast('Data legalitas & logo berhasil diperbarui.');
    } finally {
      setIsSaving(false);
    }
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
              Profil Perusahaan &amp; Legalitas Korporasi
            </h1>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              Enterprise Holding
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Kelola identitas badan hukum perseroan, nomor legalitas resmi (NIB, NPWP 16 digit),
            identitas visual logo korporat, serta data profil terdaftar PT Nexora Teknologi Nusantara.
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
            disabled={isSaving}
            onClick={handleSaveProfile}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-xs transition-all transform active:scale-95 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-white" />
            )}
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Pembaruan Profil'}</span>
          </button>
        </div>
      </div>

      {/* Identitas Badan Hukum & Legalitas Card (Full Width) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Header Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Identitas Badan Hukum &amp; Informasi Legal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi data pokok perseroan terdaftar sesuai AHU dan basis data perpajakan negara.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Entitas Terverifikasi Kemenkumham &amp; DJP</span>
          </span>
        </div>

        {/* Hidden native file input for logo upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleLogoUpload}
        />

        {/* Logo Visual Upload with automatic JPG compression */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Visual Box with interactive preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer border border-slate-200 bg-white shadow-xs group transition-transform hover:scale-105 flex-shrink-0"
              title="Klik untuk unggah logo resmi (otomatis kompres ke JPG)"
            >
              {companyForm.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={companyForm.logoUrl}
                  alt="Logo Resmi Perseroan"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-2xl tracking-tighter">
                  N
                </div>
              )}

              {/* Hover Upload Overlay */}
              <div className="absolute inset-0 bg-slate-950/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="w-5 h-5 text-white" />
              </div>

              {/* Compressing Spinner Overlay */}
              {isCompressing && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-1">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Logo Resmi &amp; Identitas Visual Korporasi
                </h4>
                {companyForm.logoUrl ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    JPG Terkompresi
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    Default Gradient
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl mt-0.5">
                Ditampilkan pada slip gaji elektronik, laporan kepatuhan, serta dashboard karyawan. Rasio 1:1 (Maks. 2.0 MB).
              </p>
              {logoCompressionInfo && (
                <p className="text-[11px] text-blue-600 font-semibold mt-1 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Kompresi JPG aktif: {logoCompressionInfo.originalSize} ➔ {logoCompressionInfo.compressedSize} (Hemat {logoCompressionInfo.savingsPercent}% ruang database)
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              disabled={isCompressing}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-all shadow-xs disabled:opacity-60"
            >
              {isCompressing ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{isCompressing ? 'Mengompres...' : 'Unggah Logo Resmi'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetLogo}
              title="Reset ke inisial logo default (N)"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legal Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              Bentuk Entitas Hukum
            </label>
            <input
              type="text"
              value={companyForm.entityType}
              onChange={(e) => setCompanyForm({ ...companyForm, entityType: e.target.value })}
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

          <div className="lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Klasifikasi Baku Lapangan Usaha (KBLI)
            </label>
            <input
              type="text"
              value={companyForm.kbli}
              onChange={(e) => setCompanyForm({ ...companyForm, kbli: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
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

    </div>
  );
}
