'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Building2,
  Check,
  ChevronDown,
  Search,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export interface PartnerBank {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: 'Himbara' | 'Swasta' | 'Syariah' | 'Digital' | 'BPD';
  isPopular?: boolean;
  color: string;
  bgColor: string;
  accountFormatHint: string;
}

export const PARTNER_BANKS: PartnerBank[] = [
  // Top 5 National Payroll Partners (Paling Populer)
  {
    id: 'bca',
    code: '014',
    name: 'PT Bank Central Asia Tbk',
    shortName: 'BCA',
    category: 'Swasta',
    isPopular: true,
    color: '#00529C',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accountFormatHint: '10 digit (Contoh: 8830192841)',
  },
  {
    id: 'mandiri',
    code: '008',
    name: 'PT Bank Mandiri (Persero) Tbk',
    shortName: 'Mandiri',
    category: 'Himbara',
    isPopular: true,
    color: '#002D62',
    bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
    accountFormatHint: '13 digit (Contoh: 1370018293041)',
  },
  {
    id: 'bri',
    code: '002',
    name: 'PT Bank Rakyat Indonesia (Persero) Tbk',
    shortName: 'BRI',
    category: 'Himbara',
    isPopular: true,
    color: '#00529B',
    bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
    accountFormatHint: '15 digit (Contoh: 001201089283501)',
  },
  {
    id: 'bni',
    code: '009',
    name: 'PT Bank Negara Indonesia (Persero) Tbk',
    shortName: 'BNI',
    category: 'Himbara',
    isPopular: true,
    color: '#E05A12',
    bgColor: 'bg-orange-50 text-orange-800 border-orange-200',
    accountFormatHint: '10 digit (Contoh: 0981248102)',
  },
  {
    id: 'bsi',
    code: '451',
    name: 'PT Bank Syariah Indonesia Tbk',
    shortName: 'BSI',
    category: 'Syariah',
    isPopular: true,
    color: '#00A39D',
    bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accountFormatHint: '10 digit (Contoh: 7129849182)',
  },

  // Major Private & International Banks
  {
    id: 'cimb',
    code: '022',
    name: 'PT Bank CIMB Niaga Tbk',
    shortName: 'CIMB Niaga',
    category: 'Swasta',
    isPopular: true,
    color: '#8A0512',
    bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
    accountFormatHint: '13-14 digit (Contoh: 700129384712)',
  },
  {
    id: 'permata',
    code: '013',
    name: 'PT Bank Permata Tbk',
    shortName: 'Permata',
    category: 'Swasta',
    isPopular: false,
    color: '#056839',
    bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accountFormatHint: '10-12 digit (Contoh: 9812039481)',
  },
  {
    id: 'danamon',
    code: '011',
    name: 'PT Bank Danamon Indonesia Tbk',
    shortName: 'Danamon',
    category: 'Swasta',
    isPopular: false,
    color: '#EF6C00',
    bgColor: 'bg-amber-50 text-amber-800 border-amber-200',
    accountFormatHint: '10-12 digit',
  },
  {
    id: 'btn',
    code: '200',
    name: 'PT Bank Tabungan Negara (Persero) Tbk',
    shortName: 'BTN',
    category: 'Himbara',
    isPopular: false,
    color: '#1A365D',
    bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
    accountFormatHint: '16 digit',
  },
  {
    id: 'ocbc',
    code: '028',
    name: 'PT Bank OCBC NISP Tbk',
    shortName: 'OCBC NISP',
    category: 'Swasta',
    isPopular: false,
    color: '#ED1C24',
    bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
    accountFormatHint: '10-12 digit',
  },
  {
    id: 'panin',
    code: '019',
    name: 'PT Bank Panin Tbk',
    shortName: 'Panin Bank',
    category: 'Swasta',
    isPopular: false,
    color: '#005BAC',
    bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
    accountFormatHint: '10 digit',
  },
  {
    id: 'maybank',
    code: '016',
    name: 'PT Bank Maybank Indonesia Tbk',
    shortName: 'Maybank',
    category: 'Swasta',
    isPopular: false,
    color: '#FFBC00',
    bgColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    accountFormatHint: '10 digit',
  },
  {
    id: 'mega',
    code: '426',
    name: 'PT Bank Mega Tbk',
    shortName: 'Bank Mega',
    category: 'Swasta',
    isPopular: false,
    color: '#F4811F',
    bgColor: 'bg-orange-50 text-orange-800 border-orange-200',
    accountFormatHint: '10 digit',
  },

  // Bank Digital Terintegrasi BI-FAST
  {
    id: 'btpn',
    code: '213',
    name: 'PT Bank BTPN Tbk (Jenius)',
    shortName: 'BTPN Jenius',
    category: 'Digital',
    isPopular: true,
    color: '#F58220',
    bgColor: 'bg-orange-50 text-orange-800 border-orange-200',
    accountFormatHint: '11 digit cashtag / rekening',
  },
  {
    id: 'jago',
    code: '542',
    name: 'PT Bank Jago Tbk',
    shortName: 'Bank Jago',
    category: 'Digital',
    isPopular: false,
    color: '#652D90',
    bgColor: 'bg-purple-50 text-purple-800 border-purple-200',
    accountFormatHint: '12 digit',
  },
  {
    id: 'seabank',
    code: '535',
    name: 'PT SeaBank Indonesia',
    shortName: 'SeaBank',
    category: 'Digital',
    isPopular: false,
    color: '#FF5722',
    bgColor: 'bg-orange-50 text-orange-800 border-orange-200',
    accountFormatHint: '12 digit',
  },
  {
    id: 'allo',
    code: '567',
    name: 'PT Allo Bank Indonesia Tbk',
    shortName: 'Allo Bank',
    category: 'Digital',
    isPopular: false,
    color: '#340068',
    bgColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    accountFormatHint: '10 digit',
  },

  // Bank Pembangunan Daerah (BPD)
  {
    id: 'dki',
    code: '111',
    name: 'PT Bank DKI (BPD DKI Jakarta)',
    shortName: 'Bank DKI',
    category: 'BPD',
    isPopular: false,
    color: '#ED1B24',
    bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
    accountFormatHint: '10 digit',
  },
  {
    id: 'bjb',
    code: '110',
    name: 'PT Bank Pembangunan Daerah Jawa Barat dan Banten Tbk (BJB)',
    shortName: 'Bank BJB',
    category: 'BPD',
    isPopular: false,
    color: '#0072BC',
    bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
    accountFormatHint: '10-13 digit',
  },
  {
    id: 'jateng',
    code: '113',
    name: 'PT Bank Pembangunan Daerah Jawa Tengah (Bank Jateng)',
    shortName: 'Bank Jateng',
    category: 'BPD',
    isPopular: false,
    color: '#ED2024',
    bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
    accountFormatHint: '10 digit',
  },
  {
    id: 'jatim',
    code: '114',
    name: 'PT Bank Pembangunan Daerah Jawa Timur Tbk (Bank Jatim)',
    shortName: 'Bank Jatim',
    category: 'BPD',
    isPopular: false,
    color: '#ED1C24',
    bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
    accountFormatHint: '10 digit',
  },
];

interface PartnerBankSelectProps {
  value: string;
  onChange: (bankName: string, bankCode?: string) => void;
  className?: string;
  label?: string;
  showPills?: boolean;
}

export function PartnerBankSelect({
  value,
  onChange,
  className = '',
  label = 'Nama Bank Penyalur Payroll',
  showPills = true,
}: PartnerBankSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Himbara' | 'Swasta' | 'Syariah' | 'Digital' | 'BPD'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find currently selected bank object
  const selectedBank = useMemo(() => {
    if (!value) return null;
    const lower = value.toLowerCase().trim();
    return PARTNER_BANKS.find(
      (b) =>
        b.shortName.toLowerCase() === lower ||
        b.name.toLowerCase() === lower ||
        b.id.toLowerCase() === lower ||
        lower.includes(b.shortName.toLowerCase())
    );
  }, [value]);

  // Filter banks based on search & category
  const filteredBanks = useMemo(() => {
    return PARTNER_BANKS.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch =
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.code.includes(q);
      const matchesCategory =
        categoryFilter === 'ALL' || b.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  // Popular banks for quick-select chips
  const popularBanks = useMemo(() => {
    return PARTNER_BANKS.filter((b) => b.isPopular);
  }, []);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (bank: PartnerBank) => {
    onChange(bank.shortName, bank.code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-semibold text-slate-700">
            {label}
          </label>
          {selectedBank && (
            <span className="text-[10px] text-blue-600 font-mono font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Kode: {selectedBank.code} (BI-FAST)
            </span>
          )}
        </div>
      )}

      {/* Quick Select Partner Pills */}
      {showPills && (
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          <span className="text-[10px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Mitra Utama:
          </span>
          {popularBanks.slice(0, 6).map((bank) => {
            const isSelected =
              selectedBank?.id === bank.id ||
              value?.toLowerCase() === bank.shortName.toLowerCase();
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => handleSelect(bank)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs scale-102'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {bank.shortName}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-blue-400 text-left flex items-center justify-between shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
            {selectedBank ? selectedBank.shortName.slice(0, 3) : <Building2 className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {selectedBank ? `${selectedBank.shortName} — ${selectedBank.name}` : value || 'Pilih Bank Mitra Payroll...'}
            </p>
            {selectedBank && (
              <p className="text-[10px] text-slate-400 truncate">
                Format: {selectedBank.accountFormatHint}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2.5 animate-in fade-in zoom-in-98 max-h-[360px] flex flex-col">
          {/* Search Bar inside Dropdown */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari bank mitra (contoh: BCA, Mandiri, BSI, 014)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-[10px]">
            {(['ALL', 'Himbara', 'Swasta', 'Syariah', 'Digital', 'BPD'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'ALL' ? 'Semua Bank' : cat}
              </button>
            ))}
          </div>

          {/* Bank Items List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-1 divide-y divide-slate-100">
            {filteredBanks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Tidak ada bank yang cocok dengan pencarian "{search}".
              </div>
            ) : (
              filteredBanks.map((bank) => {
                const isSelected = selectedBank?.id === bank.id;
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => handleSelect(bank)}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {bank.shortName.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {bank.shortName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            (Kode: {bank.code})
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${bank.bgColor}`}>
                            {bank.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {bank.name}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
