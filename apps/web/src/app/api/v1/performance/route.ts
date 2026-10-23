import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface OkrItem {
  id: string;
  category: 'teknikal' | 'operasional' | 'budaya';
  categoryLabel: string;
  weight: number;
  progressPercent: number;
  tag: string;
  selfRating: number;
  title: string;
  targetMetric: string;
  commentary: string;
  isDraft?: boolean;
}

export interface OneOnOneSession {
  date: string;
  time: string;
  managerName: string;
  managerTitle: string;
  managerNik: string;
  managerAvatar?: string;
  platform: string;
  meetLink: string;
  agenda: string[];
  risalahDate?: string;
  risalahAgreedPoints?: string[];
}

export interface PeerReviewSummary {
  rating: number;
  totalReviews: number;
  maxReviews: number;
  reviewers: { initials: string; bg: string }[];
  tags: string[];
  quote: string;
}

export interface IdpItem {
  id: string;
  title: string;
  target: string;
  status: string;
}

export interface PastCycleArchive {
  cycle: string;
  score: number;
  grade: string;
  approvalDate: string;
  bonusImpact: string;
  approvers: string;
}

export interface PerformanceTimelineStep {
  step: number;
  title: string;
  subtitle: string;
  deadline?: string;
  dates?: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
}

export interface PerformanceRecord {
  id: string;
  name: string;
  nik: string;
  role: string;
  department: string;
  score: number;
  grade: string;
  gradeColor: string;
  okrAchievement: string;
  status: 'TERVERIFIKASI' | 'MENUNGGU_REVIEW' | 'PERLU COACHING' | 'DRAFT';
  cycle: string;
  avatarUrl?: string;
  selfRating?: number;
  managerRating?: number;
  feedback?: string;
  submittedAt?: string;
  updatedAt?: string;
  // Extended dynamic fields
  okrs?: OkrItem[];
  oneOnOne?: OneOnOneSession;
  peerReview?: PeerReviewSummary;
  idp?: IdpItem[];
  pastCycles?: PastCycleArchive[];
  timeline?: PerformanceTimelineStep[];
}

export interface PerformanceCycle {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  period: string;
  syncPayroll: boolean;
  totalParticipants: number;
}

const STORAGE_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), '.data');
const PERFORMANCE_FILE = path.join(STORAGE_DIR, 'nexora_performance.json');

function getGradeFromScore(score: number): { grade: string; gradeColor: string } {
  if (score >= 4.5) {
    return {
      grade: 'Grade A (Outstanding)',
      gradeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    };
  }
  if (score >= 4.0) {
    return {
      grade: 'Grade B+ (Exceeds)',
      gradeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    };
  }
  if (score >= 3.0) {
    return {
      grade: 'Grade B (Meets)',
      gradeColor: 'text-slate-700 bg-slate-100 border-slate-200',
    };
  }
  return {
    grade: 'Grade C (PIP Wajib)',
    gradeColor: 'text-rose-700 bg-rose-50 border-rose-200',
  };
}

const defaultCycles: PerformanceCycle[] = [
  {
    id: 'cycle-q1-2025',
    name: 'Siklus Penilaian Kinerja Karyawan Q1 2025',
    code: 'Q1 2025',
    status: 'ACTIVE',
    period: '01 Jan 2025 - 31 Mar 2025',
    syncPayroll: true,
    totalParticipants: 1248,
  },
  {
    id: 'cycle-q2-2025',
    name: 'Siklus Penilaian Kinerja Karyawan Q2 2025',
    code: 'Q2 2025',
    status: 'UPCOMING',
    period: '01 Apr 2025 - 30 Jun 2025',
    syncPayroll: false,
    totalParticipants: 1248,
  },
];

const defaultOkrsForRian: OkrItem[] = [
  {
    id: 'okr-1',
    category: 'teknikal',
    categoryLabel: 'Teknikal & Arsitektur',
    weight: 25,
    progressPercent: 95,
    tag: 'Arsitektur Core',
    selfRating: 4.9,
    title: 'Migrasi Arsitektur Microservices Cloud Core Engine ke Kubernetes GKE',
    targetMetric:
      'Target Metrik: Latency response time < 80ms dan zero downtime saat release payroll bulanan pada jam beban puncak.',
    commentary:
      'Migrasi 14 microservices selesai sesuai roadmap Q1. Latency API turun rata-rata 32%, load test 50.000 concurrent user stabil tanpa packet drop.',
    isDraft: false,
  },
  {
    id: 'okr-2',
    category: 'teknikal',
    categoryLabel: 'Teknikal & Arsitektur',
    weight: 25,
    progressPercent: 100,
    tag: 'Security & Compliance',
    selfRating: 5.0,
    title: 'Implementasi Enkripsi AES-256 & Audit Trail RFC-5424 Keamanan Data Karyawan',
    targetMetric:
      'Target Metrik: Kepatuhan 100% terhadap regulasi UU PDP No. 27/2022 dan lulus security audit ISO 27001.',
    commentary:
      'Modul kriptografi data rest & transit rampung diimplementasikan dengan zero vulnerability pada penetration testing berkala.',
    isDraft: false,
  },
  {
    id: 'okr-3',
    category: 'operasional',
    categoryLabel: 'Efisiensi Operasional',
    weight: 30,
    progressPercent: 90,
    tag: 'FinOps & Database',
    selfRating: 4.8,
    title: 'Optimasi Kueri Payroll Engine & Reduksi Biaya Komputasi Cloud (FinOps)',
    targetMetric:
      'Target Metrik: Mempercepat proses kalkulasi payroll bulanan dari 45 menit menjadi < 15 menit serta efisiensi tagihan server 18%.',
    commentary:
      'Optimasi partisi tabel database dan query indexing berhasil memangkas runtime komputasi payroll hingga 68% lebih cepat.',
    isDraft: false,
  },
  {
    id: 'okr-4',
    category: 'budaya',
    categoryLabel: 'Kepemimpinan & Budaya',
    weight: 20,
    progressPercent: 75,
    tag: 'Mentorship & Talent',
    selfRating: 4.7,
    title: 'Mentoring Rekayasa Perangkat Lunak & Knowledge Sharing Squad Backend',
    targetMetric:
      'Target Metrik: Mengadakan 6 sesi tech-talk arsitektur dan membimbing 3 junior backend engineers menuju kemandirian on-call.',
    commentary:
      'Telah menyelesaikan 4 dari 6 sesi tech-talk arsitektur backend. 2 junior engineer (Rizky & Amanda) telah berhasil memimpin deployment mandiri tanpa kendala.',
    isDraft: true,
  },
];

const defaultOneOnOneForRian: OneOnOneSession = {
  date: '03 April 2025',
  time: '14:00 - 15:00 WIB',
  managerName: 'Arya Wibowo, M.Sc',
  managerTitle: 'VP of Engineering',
  managerNik: 'NX-2018042',
  managerAvatar: '',
  platform: 'Google Meet',
  meetLink: 'https://meet.google.com/nex-perf-rian',
  agenda: [
    '1. Kalibrasi self-appraisal arsitektur microservices core.',
    '2. Roadmap sertifikasi GCP Cloud Architect Q2 2025.',
    '3. Rencana suksesi mentoring engineering squad backend.',
  ],
  risalahDate: '14 Maret 2025',
  risalahAgreedPoints: [
    'Arsitektur cloud Kubernetes GKE dinilai sangat sukses menjaga SLA 99.99%.',
    'Penyelesaian modul enkripsi data karyawan diapresiasi penuh oleh HR & Legal.',
    'Fokus kuartal berikutnya dialokasikan 20% untuk mentoring squad junior.',
  ],
};

const defaultPeerReviewForRian: PeerReviewSummary = {
  rating: 4.9,
  totalReviews: 4,
  maxReviews: 4,
  reviewers: [
    { initials: 'DY', bg: 'bg-blue-600' },
    { initials: 'BS', bg: 'bg-emerald-600' },
    { initials: 'KT', bg: 'bg-purple-600' },
    { initials: '+1', bg: 'bg-slate-900' },
  ],
  tags: ['#ArsitekSolutif', '#HighReliability', '#GreatMentor', '#FastResponse', '#CleanCode'],
  quote:
    'Sangat tanggap saat insiden production dan selalu memberikan penjelasan arsitektural yang jelas untuk tim. Bimbingan tech-talk mikroservis sangat membantu percepatan rilis modul integrasi absensi.',
};

const defaultIdpForRian: IdpItem[] = [
  {
    id: 'idp-1',
    title: 'Google Cloud Professional Cloud Architect',
    target: 'Target Sertifikasi: Mei 2025 • Biaya ditanggung PT Nexora',
    status: 'Disetujui VP',
  },
  {
    id: 'idp-2',
    title: 'Executive Engineering Leadership Workshop',
    target: 'Target Modul: Juni 2025 • Persiapan Principal Band',
    status: 'Disetujui VP',
  },
];

const defaultPastCyclesForRian: PastCycleArchive[] = [
  {
    cycle: 'Q4 2024',
    score: 4.7,
    grade: 'Sangat Baik (Exceeds)',
    approvalDate: '20 Januari 2025',
    bonusImpact: 'Bonus Kinerja Akhir Tahun 2.5x Gaji Pokok & Kenaikan Grade Band 4.',
    approvers: 'Arya Wibowo (VP Eng) & Citra Lestari (Chief People Officer)',
  },
];

const defaultRecords: PerformanceRecord[] = [
  {
    id: 'perf-3',
    name: 'Rian Pratama, S.Kom',
    nik: 'NX-2021008',
    role: 'Lead Backend Architect',
    department: 'Technology',
    score: 4.85,
    grade: 'Grade A (Outstanding)',
    gradeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    okrAchievement: '105%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: '',
    selfRating: 4.85,
    managerRating: 4.85,
    feedback:
      'Rian menunjukkan kepemimpinan teknikal yang sangat solid dalam menjaga stabilitas arsitektur core payroll Q1. Pertahankan ritme mentoring tim junior agar kemandirian squad semakin matang di kuartal berikutnya.',
    submittedAt: '2025-03-24T10:00:00.000Z',
    okrs: defaultOkrsForRian,
    oneOnOne: defaultOneOnOneForRian,
    peerReview: defaultPeerReviewForRian,
    idp: defaultIdpForRian,
    pastCycles: defaultPastCyclesForRian,
  },
  {
    id: 'perf-1',
    name: 'Ir. Andi Wijaya, M.Kom',
    nik: 'NX-2018-0102',
    role: 'Chief Technology Officer',
    department: 'Technology',
    score: 4.85,
    grade: 'Grade A (Outstanding)',
    gradeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    okrAchievement: '112%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.9,
    managerRating: 4.8,
    feedback: 'Pencapaian luar biasa dalam memimpin migrasi infrastruktur cloud tanpa insiden.',
    submittedAt: '2025-03-18T09:00:00.000Z',
  },
  {
    id: 'perf-2',
    name: 'Dewi Lestari, S.Psi',
    nik: 'NX-2020-0012',
    role: 'HR Operations Manager',
    department: 'Human Resources',
    score: 4.65,
    grade: 'Grade A (Outstanding)',
    gradeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    okrAchievement: '108%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.7,
    managerRating: 4.6,
    feedback: 'Implementasi program retensi talenta berhasil menekan angka turnover sebesar 14%.',
    submittedAt: '2025-03-19T09:00:00.000Z',
  },
  {
    id: 'perf-4',
    name: 'Bambang Sutedjo',
    nik: 'NX-2019-0045',
    role: 'Warehouse Logistics Lead',
    department: 'Operasional',
    score: 4.15,
    grade: 'Grade B+ (Exceeds)',
    gradeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    okrAchievement: '102%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.2,
    managerRating: 4.1,
    feedback: 'Manajemen alur barang hub logistik stabil dengan akurasi pengiriman 99.1%.',
    submittedAt: '2025-03-20T09:00:00.000Z',
  },
  {
    id: 'perf-5',
    name: 'Budi Santoso',
    nik: 'NX-2022-1140',
    role: 'Senior UI/UX Designer',
    department: 'Product & Design',
    score: 3.88,
    grade: 'Grade B (Meets)',
    gradeColor: 'text-slate-700 bg-slate-100 border-slate-200',
    okrAchievement: '96%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.0,
    managerRating: 3.8,
    feedback: 'Desain design-system HRIS rapi dan adaptif pada seluruh resolusi layar.',
    submittedAt: '2025-03-21T09:00:00.000Z',
  },
  {
    id: 'perf-6',
    name: 'Kevin Sanjaya',
    nik: 'NX-2022014',
    role: 'Senior Frontend Engineer',
    department: 'Technology',
    score: 4.2,
    grade: 'Grade B+ (Exceeds)',
    gradeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    okrAchievement: '100%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.3,
    managerRating: 4.1,
    feedback: 'Kecepatan rendering portal karyawan meningkat signifikan.',
    submittedAt: '2025-03-22T09:00:00.000Z',
  },
  {
    id: 'perf-7',
    name: 'Siti Nurhaliza, M.M.',
    nik: 'NX-201992',
    role: 'People & Talent Dev Specialist',
    department: 'Human Resources',
    score: 4.4,
    grade: 'Grade B+ (Exceeds)',
    gradeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    okrAchievement: '102%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.5,
    managerRating: 4.3,
    feedback: 'Pelaksanaan workshop pelatihan karyawan berjalan dengan tingkat kepuasan 94%.',
    submittedAt: '2025-03-22T09:00:00.000Z',
  },
  {
    id: 'perf-8',
    name: 'Hendra Gunawan',
    nik: 'NX-2024-0811',
    role: 'Junior Account Executive',
    department: 'Sales & Marketing',
    score: 2.85,
    grade: 'Grade C (PIP Wajib)',
    gradeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    okrAchievement: '72%',
    status: 'PERLU COACHING',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    selfRating: 3.0,
    managerRating: 2.7,
    feedback: 'Perlu pendampingan intensif dari tim lead sales untuk pencapaian kuota lead bulanan.',
    submittedAt: '2025-03-23T09:00:00.000Z',
  },
];

function ensureStorage(): void {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch {}
}

function getStoredPerformance(): { cycles: PerformanceCycle[]; records: PerformanceRecord[]; activeCycle: string } {
  try {
    ensureStorage();
    if (fs.existsSync(PERFORMANCE_FILE)) {
      const data = JSON.parse(fs.readFileSync(PERFORMANCE_FILE, 'utf-8'));
      if (data && Array.isArray(data.records) && data.records.length > 0) {
        return data;
      }
    }
  } catch {}
  return {
    cycles: defaultCycles,
    records: defaultRecords,
    activeCycle: 'Q1 2025',
  };
}

function saveStoredPerformance(data: { cycles: PerformanceCycle[]; records: PerformanceRecord[]; activeCycle: string }): void {
  try {
    ensureStorage();
    fs.writeFileSync(PERFORMANCE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nik = searchParams.get('nik');
  const cycle = searchParams.get('cycle');
  const dept = searchParams.get('department');
  const search = searchParams.get('search')?.toLowerCase();

  const state = getStoredPerformance();
  let records = state.records;

  if (cycle && cycle !== 'Semua') {
    records = records.filter((r) => r.cycle === cycle || cycle.includes(r.cycle));
  }

  if (dept && dept !== 'Semua Departemen') {
    records = records.filter((r) => r.department.toLowerCase() === dept.toLowerCase());
  }

  if (search) {
    records = records.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.nik.toLowerCase().includes(search) ||
        r.role.toLowerCase().includes(search) ||
        r.department.toLowerCase().includes(search)
    );
  }

  if (nik) {
    let single = state.records.find((r) => r.nik.toLowerCase() === nik.toLowerCase());
    
    // If not found in records, construct a realistic record based on user profile so the view is always dynamic and filled
    if (!single) {
      single = {
        id: `perf-${Date.now()}`,
        name: 'Karyawan Nexora',
        nik: nik,
        role: 'Spesialis',
        department: 'Operasional',
        score: 4.85,
        grade: 'Grade A (Outstanding)',
        gradeColor: 'text-blue-700 bg-blue-50 border-blue-200',
        okrAchievement: '105%',
        status: 'TERVERIFIKASI',
        cycle: state.activeCycle,
        selfRating: 4.85,
        managerRating: 4.85,
        feedback: 'Kinerja kuartal ini berjalan sangat memuaskan sesuai dengan standar target perusahaan.',
        okrs: defaultOkrsForRian,
        oneOnOne: defaultOneOnOneForRian,
        peerReview: defaultPeerReviewForRian,
        idp: defaultIdpForRian,
        pastCycles: defaultPastCyclesForRian,
      };
    } else if (!single.okrs || single.okrs.length === 0) {
      single.okrs = defaultOkrsForRian;
      single.oneOnOne = single.oneOnOne || defaultOneOnOneForRian;
      single.peerReview = single.peerReview || defaultPeerReviewForRian;
      single.idp = single.idp || defaultIdpForRian;
      single.pastCycles = single.pastCycles || defaultPastCyclesForRian;
    }

    return NextResponse.json({
      success: true,
      data: single,
      activeCycle: state.activeCycle,
      cycles: state.cycles,
    });
  }

  // Calculate dynamic metrics for Admin dashboard
  const total = state.records.length;
  const avgScore = total > 0 ? (state.records.reduce((acc, r) => acc + r.score, 0) / total).toFixed(2) : '3.82';
  const topPerformers = state.records.filter((r) => r.score >= 4.5);
  const topPerformersPercent = total > 0 ? ((topPerformers.length / total) * 100).toFixed(1) : '13.5';
  const pipCandidates = state.records.filter((r) => r.score < 3.0 || r.status === 'PERLU COACHING');
  const pipPercent = total > 0 ? ((pipCandidates.length / total) * 100).toFixed(1) : '3.4';
  const verifiedCount = state.records.filter((r) => r.status === 'TERVERIFIKASI').length;
  const completionPercent = total > 0 ? Math.round((verifiedCount / total) * 100) : 100;

  return NextResponse.json({
    success: true,
    data: records,
    cycles: state.cycles,
    activeCycle: state.activeCycle,
    summary: {
      avgScore,
      topPerformersCount: topPerformers.length,
      topPerformersPercent,
      pipCount: pipCandidates.length,
      pipPercent,
      completionPercent,
      totalEmployees: total,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const state = getStoredPerformance();

    if (body.type === 'NEW_CYCLE') {
      const newCycle: PerformanceCycle = {
        id: `cycle-${Date.now()}`,
        name: body.name || 'Siklus Penilaian Kinerja Karyawan Q2 2025',
        code: body.code || 'Q2 2025',
        status: 'ACTIVE',
        period: body.period || '01 Apr 2025 - 30 Jun 2025',
        syncPayroll: Boolean(body.syncPayroll),
        totalParticipants: body.totalParticipants || 1248,
      };

      state.cycles.unshift(newCycle);
      state.activeCycle = newCycle.code;
      saveStoredPerformance(state);

      return NextResponse.json({
        success: true,
        message: `Siklus ${newCycle.code} berhasil diluncurkan!`,
        data: newCycle,
      });
    }

    // Add or update review from ESS Self-Appraisal or Admin
    const {
      name,
      nik,
      role,
      department,
      score,
      okrAchievement,
      status,
      cycle,
      feedback,
      avatarUrl,
      okrs,
      oneOnOne,
      peerReview,
      idp,
      selfRating,
    } = body;

    let finalScore = Number(score);
    if (isNaN(finalScore) || finalScore <= 0) {
      if (Array.isArray(okrs) && okrs.length > 0) {
        finalScore = okrs.reduce((acc: number, item: OkrItem) => acc + (item.selfRating || 4.5) * (item.weight / 100), 0);
        finalScore = Math.round(finalScore * 100) / 100;
      } else {
        finalScore = 4.85;
      }
    }

    const { grade, gradeColor } = getGradeFromScore(finalScore);

    const existingIdx = state.records.findIndex((r) => r.nik.toLowerCase() === (nik || '').toLowerCase());
    const existing = existingIdx >= 0 ? state.records[existingIdx] : null;

    const newRecord: PerformanceRecord = {
      id: existing ? existing.id : `perf-${Date.now()}`,
      name: name || (existing ? existing.name : 'Rian Pratama, S.Kom'),
      nik: nik || (existing ? existing.nik : 'NX-2021008'),
      role: role || (existing ? existing.role : 'Lead Backend Architect'),
      department: department || (existing ? existing.department : 'Technology'),
      score: finalScore,
      grade,
      gradeColor,
      okrAchievement: okrAchievement || (existing ? existing.okrAchievement : '105%'),
      status: status || (existing ? existing.status : 'TERVERIFIKASI'),
      cycle: cycle || state.activeCycle,
      feedback: feedback !== undefined ? feedback : (existing ? existing.feedback : ''),
      avatarUrl: avatarUrl !== undefined ? avatarUrl : (existing ? existing.avatarUrl : ''),
      selfRating: selfRating !== undefined ? Number(selfRating) : finalScore,
      managerRating: existing ? existing.managerRating : finalScore,
      submittedAt: existing?.submittedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      okrs: okrs || (existing ? existing.okrs : defaultOkrsForRian),
      oneOnOne: oneOnOne || (existing ? existing.oneOnOne : defaultOneOnOneForRian),
      peerReview: peerReview || (existing ? existing.peerReview : defaultPeerReviewForRian),
      idp: idp || (existing ? existing.idp : defaultIdpForRian),
      pastCycles: existing ? existing.pastCycles : defaultPastCyclesForRian,
    };

    if (existingIdx >= 0) {
      state.records[existingIdx] = newRecord;
    } else {
      state.records.unshift(newRecord);
    }

    saveStoredPerformance(state);

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: 'Penilaian kinerja & self-appraisal berhasil disinkronkan secara real-time.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nik, score, status, feedback, managerRating, selfRating, okrs, okrId, commentary, isDraft } = body;

    const state = getStoredPerformance();
    const targetIdx = state.records.findIndex(
      (r) => (id && r.id === id) || (nik && r.nik.toLowerCase() === nik.toLowerCase())
    );

    if (targetIdx === -1) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    const current = state.records[targetIdx];
    let updatedOkrs = current.okrs ? [...current.okrs] : [...defaultOkrsForRian];

    // If updating a specific OKR item
    if (okrId) {
      const oIdx = updatedOkrs.findIndex((o) => o.id === okrId);
      if (oIdx >= 0) {
        updatedOkrs[oIdx] = {
          ...updatedOkrs[oIdx],
          selfRating: selfRating !== undefined ? Number(selfRating) : updatedOkrs[oIdx].selfRating,
          commentary: commentary !== undefined ? commentary : updatedOkrs[oIdx].commentary,
          isDraft: isDraft !== undefined ? isDraft : false,
        };
      }
    } else if (Array.isArray(okrs)) {
      updatedOkrs = okrs;
    }

    // Recalculate score from OKRs if updated
    let newScore = current.score;
    if (typeof score === 'number') {
      newScore = score;
    } else if (updatedOkrs.length > 0) {
      const calc = updatedOkrs.reduce((sum, o) => sum + (o.selfRating || 4.5) * (o.weight / 100), 0);
      newScore = Math.round(calc * 100) / 100;
    }

    const { grade, gradeColor } = getGradeFromScore(newScore);

    state.records[targetIdx] = {
      ...current,
      score: newScore,
      grade,
      gradeColor,
      status: status || current.status,
      feedback: feedback !== undefined ? feedback : current.feedback,
      managerRating: managerRating !== undefined ? managerRating : current.managerRating,
      selfRating: selfRating !== undefined ? Number(selfRating) : newScore,
      okrs: updatedOkrs,
      updatedAt: new Date().toISOString(),
    };

    saveStoredPerformance(state);

    return NextResponse.json({
      success: true,
      data: state.records[targetIdx],
      message: 'Data evaluasi kinerja berhasil diperbarui.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
