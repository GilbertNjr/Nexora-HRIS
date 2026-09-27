export type TerCategory = 'TER_A' | 'TER_B' | 'TER_C';

export interface TerRateBracket {
  maxGross: number;
  rate: number;
}

// PP 58/2023 & PMK 168/2023 TER A (TK/0, TK/1, K/0)
const TER_A_BRACKETS: TerRateBracket[] = [
  { maxGross: 5400000, rate: 0 },
  { maxGross: 5650000, rate: 0.0025 },
  { maxGross: 5950000, rate: 0.005 },
  { maxGross: 6300000, rate: 0.0075 },
  { maxGross: 6750000, rate: 0.01 },
  { maxGross: 7500000, rate: 0.0125 },
  { maxGross: 8550000, rate: 0.015 },
  { maxGross: 9650000, rate: 0.0175 },
  { maxGross: 10050000, rate: 0.02 },
  { maxGross: 10350000, rate: 0.0225 },
  { maxGross: 10700000, rate: 0.025 },
  { maxGross: 12500000, rate: 0.03 },
  { maxGross: 13750000, rate: 0.04 },
  { maxGross: 15100000, rate: 0.05 },
  { maxGross: 16950000, rate: 0.06 },
  { maxGross: 19750000, rate: 0.07 },
  { maxGross: 24100000, rate: 0.08 },
  { maxGross: 26450000, rate: 0.09 },
  { maxGross: 28000000, rate: 0.1 },
  { maxGross: 30050000, rate: 0.11 },
  { maxGross: 32400000, rate: 0.12 },
  { maxGross: 35400000, rate: 0.13 },
  { maxGross: 39100000, rate: 0.14 },
  { maxGross: 43850000, rate: 0.15 },
  { maxGross: 47800000, rate: 0.16 },
  { maxGross: 51400000, rate: 0.17 },
  { maxGross: 56300000, rate: 0.18 },
  { maxGross: 62200000, rate: 0.19 },
  { maxGross: 68600000, rate: 0.2 },
  { maxGross: 77500000, rate: 0.21 },
  { maxGross: 89000000, rate: 0.22 },
  { maxGross: 103000000, rate: 0.23 },
  { maxGross: 125000000, rate: 0.24 },
  { maxGross: 157000000, rate: 0.25 },
  { maxGross: 206000000, rate: 0.26 },
  { maxGross: 337000000, rate: 0.27 },
  { maxGross: 454000000, rate: 0.28 },
  { maxGross: 550000000, rate: 0.29 },
  { maxGross: 695000000, rate: 0.3 },
  { maxGross: 910000000, rate: 0.31 },
  { maxGross: 1400000000, rate: 0.32 },
  { maxGross: Infinity, rate: 0.34 },
];

// PP 58/2023 & PMK 168/2023 TER B (TK/2, TK/3, K/1, K/2)
const TER_B_BRACKETS: TerRateBracket[] = [
  { maxGross: 6200000, rate: 0 },
  { maxGross: 6500000, rate: 0.0025 },
  { maxGross: 6850000, rate: 0.005 },
  { maxGross: 7300000, rate: 0.0075 },
  { maxGross: 9200000, rate: 0.01 },
  { maxGross: 10750000, rate: 0.015 },
  { maxGross: 11250000, rate: 0.02 },
  { maxGross: 11600000, rate: 0.025 },
  { maxGross: 12600000, rate: 0.03 },
  { maxGross: 13600000, rate: 0.04 },
  { maxGross: 14950000, rate: 0.05 },
  { maxGross: 16400000, rate: 0.06 },
  { maxGross: 18450000, rate: 0.07 },
  { maxGross: 21850000, rate: 0.08 },
  { maxGross: 26000000, rate: 0.09 },
  { maxGross: 27700000, rate: 0.1 },
  { maxGross: 29350000, rate: 0.11 },
  { maxGross: 31450000, rate: 0.12 },
  { maxGross: 33950000, rate: 0.13 },
  { maxGross: 37100000, rate: 0.14 },
  { maxGross: 41100000, rate: 0.15 },
  { maxGross: 45800000, rate: 0.16 },
  { maxGross: 49500000, rate: 0.17 },
  { maxGross: 53800000, rate: 0.18 },
  { maxGross: 58500000, rate: 0.19 },
  { maxGross: 64000000, rate: 0.2 },
  { maxGross: 71000000, rate: 0.21 },
  { maxGross: 80000000, rate: 0.22 },
  { maxGross: 93000000, rate: 0.23 },
  { maxGross: 109000000, rate: 0.24 },
  { maxGross: 129000000, rate: 0.25 },
  { maxGross: 163000000, rate: 0.26 },
  { maxGross: 211000000, rate: 0.27 },
  { maxGross: 374000000, rate: 0.28 },
  { maxGross: 459000000, rate: 0.29 },
  { maxGross: 555000000, rate: 0.3 },
  { maxGross: 704000000, rate: 0.31 },
  { maxGross: 957000000, rate: 0.32 },
  { maxGross: 1405000000, rate: 0.33 },
  { maxGross: Infinity, rate: 0.34 },
];

// PP 58/2023 & PMK 168/2023 TER C (K/3)
const TER_C_BRACKETS: TerRateBracket[] = [
  { maxGross: 6600000, rate: 0 },
  { maxGross: 6950000, rate: 0.0025 },
  { maxGross: 7350000, rate: 0.005 },
  { maxGross: 7800000, rate: 0.0075 },
  { maxGross: 8850000, rate: 0.01 },
  { maxGross: 9800000, rate: 0.0125 },
  { maxGross: 10950000, rate: 0.015 },
  { maxGross: 11200000, rate: 0.0175 },
  { maxGross: 12050000, rate: 0.02 },
  { maxGross: 12950000, rate: 0.03 },
  { maxGross: 14150000, rate: 0.04 },
  { maxGross: 15550000, rate: 0.05 },
  { maxGross: 17050000, rate: 0.06 },
  { maxGross: 19500000, rate: 0.07 },
  { maxGross: 22700000, rate: 0.08 },
  { maxGross: 24700000, rate: 0.09 },
  { maxGross: 26300000, rate: 0.1 },
  { maxGross: 28000000, rate: 0.11 },
  { maxGross: 30450000, rate: 0.12 },
  { maxGross: 32700000, rate: 0.13 },
  { maxGross: 35400000, rate: 0.14 },
  { maxGross: 38800000, rate: 0.15 },
  { maxGross: 43100000, rate: 0.16 },
  { maxGross: 47500000, rate: 0.17 },
  { maxGross: 51500000, rate: 0.18 },
  { maxGross: 56500000, rate: 0.19 },
  { maxGross: 62500000, rate: 0.2 },
  { maxGross: 69500000, rate: 0.21 },
  { maxGross: 79000000, rate: 0.22 },
  { maxGross: 91000000, rate: 0.23 },
  { maxGross: 105000000, rate: 0.24 },
  { maxGross: 125000000, rate: 0.25 },
  { maxGross: 153000000, rate: 0.26 },
  { maxGross: 206000000, rate: 0.27 },
  { maxGross: 337000000, rate: 0.28 },
  { maxGross: 454000000, rate: 0.29 },
  { maxGross: 550000000, rate: 0.3 },
  { maxGross: 695000000, rate: 0.31 },
  { maxGross: 910000000, rate: 0.32 },
  { maxGross: 1419000000, rate: 0.33 },
  { maxGross: Infinity, rate: 0.34 },
];

/**
 * Menentukan Kategori TER Berdasarkan Status PTKP Karyawan
 */
export function determineTerCategory(ptkpStatus: string): TerCategory {
  const normalized = (ptkpStatus || 'TK/0').toUpperCase().trim();
  if (['TK/0', 'TK/1', 'K/0'].includes(normalized)) {
    return 'TER_A';
  }
  if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(normalized)) {
    return 'TER_B';
  }
  if (['K/3'].includes(normalized)) {
    return 'TER_C';
  }
  return 'TER_A'; // Default jika belum tersetting
}

/**
 * Menghitung Pajak PPh 21 Bulanan Berdasarkan Tarif Efektif Rata-Rata (TER) PP 58/2023
 */
export function calculatePph21Ter(
  grossIncome: number,
  category: TerCategory = 'TER_A',
): {
  rate: number;
  ratePercentage: string;
  taxAmount: number;
  category: TerCategory;
} {
  const brackets =
    category === 'TER_B'
      ? TER_B_BRACKETS
      : category === 'TER_C'
      ? TER_C_BRACKETS
      : TER_A_BRACKETS;

  const bracket = brackets.find((b) => grossIncome <= b.maxGross) || brackets[brackets.length - 1];
  const rate = bracket.rate;
  const taxAmount = Math.round(grossIncome * rate);

  return {
    rate,
    ratePercentage: `${(rate * 100).toFixed(2)}%`,
    taxAmount,
    category,
  };
}

/**
 * Batas Plafon Maksimal BPJS Ketenagakerjaan (JP) & BPJS Kesehatan (2024/2026)
 */
export const BPJS_CONFIG = {
  // Jaminan Pensiun (JP) batas atas upah Rp 10.042.300
  MAX_WAGE_JP: 10042300,
  // BPJS Kesehatan batas atas upah Rp 12.000.000
  MAX_WAGE_KES: 12000000,
  // Tarif BPJS Ketenagakerjaan
  RATE_JHT_EMP: 0.02, // 2% Karyawan
  RATE_JHT_COM: 0.037, // 3.7% Perusahaan
  RATE_JP_EMP: 0.01, // 1% Karyawan
  RATE_JP_COM: 0.02, // 2% Perusahaan
  RATE_JKK_COM: 0.0024, // 0.24% Perusahaan
  RATE_JKM_COM: 0.003, // 0.3% Perusahaan
  // Tarif BPJS Kesehatan
  RATE_KES_EMP: 0.01, // 1% Karyawan
  RATE_KES_COM: 0.04, // 4% Perusahaan
};

/**
 * Menghitung Iuran BPJS Ketenagakerjaan dan BPJS Kesehatan
 */
export function calculateBpjs(baseSalary: number) {
  // 1. BPJS TK - JHT (Jaminan Hari Tua - Tanpa Plafon)
  const jhtEmp = Math.round(baseSalary * BPJS_CONFIG.RATE_JHT_EMP);
  const jhtCom = Math.round(baseSalary * BPJS_CONFIG.RATE_JHT_COM);

  // 2. BPJS TK - JP (Jaminan Pensiun - Ada Plafon)
  const jpWage = Math.min(baseSalary, BPJS_CONFIG.MAX_WAGE_JP);
  const jpEmp = Math.round(jpWage * BPJS_CONFIG.RATE_JP_EMP);
  const jpCom = Math.round(jpWage * BPJS_CONFIG.RATE_JP_COM);

  // 3. BPJS TK - JKK & JKM (Ditanggung Perusahaan Penuh)
  const jkkCom = Math.round(baseSalary * BPJS_CONFIG.RATE_JKK_COM);
  const jkmCom = Math.round(baseSalary * BPJS_CONFIG.RATE_JKM_COM);

  // 4. BPJS Kesehatan (Ada Plafon Rp 12.000.000)
  const kesWage = Math.min(baseSalary, BPJS_CONFIG.MAX_WAGE_KES);
  const kesEmp = Math.round(kesWage * BPJS_CONFIG.RATE_KES_EMP);
  const kesCom = Math.round(kesWage * BPJS_CONFIG.RATE_KES_COM);

  return {
    employeeDeductions: {
      jht: jhtEmp,
      jp: jpEmp,
      totalTk: jhtEmp + jpEmp,
      bpjsKes: kesEmp,
      totalAll: jhtEmp + jpEmp + kesEmp,
    },
    companyContributions: {
      jht: jhtCom,
      jp: jpCom,
      jkk: jkkCom,
      jkm: jkmCom,
      totalTk: jhtCom + jpCom + jkkCom + jkmCom,
      bpjsKes: kesCom,
      totalAll: jhtCom + jpCom + jkkCom + jkmCom + kesCom,
    },
  };
}

/**
 * Menghitung Upah Lembur Sesuai Aturan Depnaker RI (PP 35/2021) [REQ-DEC-05]
 * Upah per jam = 1/173 x Gaji Pokok
 * Jam pertama = 1.5x upah per jam
 * Jam kedua dan seterusnya = 2.0x upah per jam
 */
export function calculateOvertimePay(baseSalary: number, overtimeHours: number): number {
  if (overtimeHours <= 0) return 0;
  const hourlyWage = baseSalary / 173;

  if (overtimeHours <= 1) {
    return Math.round(overtimeHours * 1.5 * hourlyWage);
  }

  const firstHourPay = 1.5 * hourlyWage;
  const remainingHours = overtimeHours - 1;
  const subsequentPay = remainingHours * 2.0 * hourlyWage;

  return Math.round(firstHourPay + subsequentPay);
}

/**
 * Menghitung Gaji Prorata Hari Kerja Riil Kalender Bulan Berjalan [REQ-DEC-08]
 */
export function calculateProratedSalary(
  baseSalary: number,
  actualWorkingDays: number,
  officialWorkingDaysInMonth: number = 22,
): number {
  if (actualWorkingDays >= officialWorkingDaysInMonth) {
    return baseSalary;
  }
  if (actualWorkingDays <= 0) {
    return 0;
  }
  return Math.round((actualWorkingDays / officialWorkingDaysInMonth) * baseSalary);
}
