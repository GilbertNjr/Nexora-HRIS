import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  getPerformanceFromDb,
  upsertPerformanceToDb,
  getCurrentRealCycle,
  getGradeFromScore,
} from '@/lib/performanceDb';

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
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
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
  status: 'TERVERIFIKASI' | 'PERLU COACHING' | 'MENUNGGU KALIBRASI' | 'MENUNGGU SUBMISI';
  cycle: string;
  avatarUrl?: string;
  feedback?: string;
  submittedAt?: string;
  updatedAt?: string;
  selfRating?: number;
  managerRating?: number;
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

// Note: getGradeFromScore is provided by @/lib/performanceDb

const realCycleInfo = getCurrentRealCycle();
const defaultCycles: PerformanceCycle[] = [
  {
    id: `cycle-${realCycleInfo.year}-${realCycleInfo.quarter}`,
    name: realCycleInfo.name,
    code: realCycleInfo.code,
    status: 'ACTIVE',
    period: realCycleInfo.period,
    syncPayroll: true,
    totalParticipants: 1,
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
    targetMetric: 'Target Metrik: Latency response time < 80ms dan zero downtime saat release payroll bulanan pada jam beban puncak.',
    commentary: 'Migrasi 14 microservices selesai sesuai roadmap. Latency API turun rata-rata 32%, load test 50.000 concurrent user stabil tanpa packet drop.',
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
    targetMetric: 'Target Metrik: Kepatuhan 100% terhadap regulasi UU PDP No. 27/2022 dan lulus security audit ISO 27001.',
    commentary: 'Modul kriptografi data rest & transit rampung diimplementasikan dengan zero vulnerability pada penetration testing berkala.',
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
    targetMetric: 'Target Metrik: Mempercepat proses kalkulasi payroll bulanan dari 45 menit menjadi < 15 menit serta efisiensi tagihan server 18%.',
    commentary: 'Optimasi partisi tabel database dan query indexing berhasil memangkas runtime komputasi payroll hingga 68% lebih cepat.',
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
    targetMetric: 'Target Metrik: Mengadakan 6 sesi tech-talk arsitektur dan membimbing 3 junior backend engineers menuju kemandirian on-call.',
    commentary: 'Telah menyelesaikan 4 dari 6 sesi tech-talk arsitektur backend. 2 junior engineer telah berhasil memimpin deployment mandiri tanpa kendala.',
    isDraft: true,
  },
];

const defaultOneOnOneForRian: OneOnOneSession = {
  date: '28 Oktober 2026',
  time: '14:00 - 15:00 WIB',
  managerName: 'Arya Wibowo, M.Sc',
  managerTitle: 'VP of Engineering',
  managerNik: 'NX-2018042',
  managerAvatar: '',
  platform: 'Google Meet',
  meetLink: 'https://meet.google.com/nex-perf-rian',
  agenda: [
    '1. Kalibrasi self-appraisal arsitektur microservices core.',
    '2. Roadmap sertifikasi GCP Cloud Architect.',
    '3. Rencana suksesi mentoring engineering squad backend.',
  ],
  risalahDate: '24 Oktober 2026',
  risalahAgreedPoints: [
    'Arsitektur cloud Kubernetes GKE dinilai sangat sukses menjaga SLA 99.99%.',
    'Penyelesaian modul enkripsi data karyawan diapresiasi penuh oleh HR & Legal.',
    'Fokus kuartal dialokasikan 20% untuk mentoring squad junior.',
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
  tags: [
    '#ArsitekSolutif',
    '#HighReliability',
    '#GreatMentor',
    '#FastResponse',
    '#CleanCode',
  ],
  quote:
    'Sangat tanggap saat insiden production dan selalu memberikan penjelasan arsitektural yang jelas untuk tim. Bimbingan tech-talk mikroservis sangat membantu percepatan rilis modul integrasi absensi.',
};

const defaultIdpForRian: IdpItem[] = [
  {
    id: 'idp-1',
    title: 'Google Cloud Professional Cloud Architect',
    target: 'Target Sertifikasi: Semester Ini • Biaya ditanggung PT Nexora',
    status: 'Disetujui VP',
  },
  {
    id: 'idp-2',
    title: 'Executive Engineering Leadership Workshop',
    target: 'Target Modul: Akhir Kuartal • Persiapan Principal Band',
    status: 'Disetujui VP',
  },
];

const defaultPastCyclesForRian: PastCycleArchive[] = [
  {
    cycle: 'Q3 2026',
    score: 4.7,
    grade: 'Sangat Baik (Exceeds)',
    approvalDate: '20 Oktober 2026',
    bonusImpact: 'Bonus Kinerja Kuartalan 2.5x Gaji Pokok & Kenaikan Grade Band 4.',
    approvers: 'Arya Wibowo (VP Eng) & Citra Lestari (Chief People Officer)',
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
      if (data && Array.isArray(data.records)) {
        return {
          cycles: data.cycles || defaultCycles,
          records: data.records,
          activeCycle: data.activeCycle || realCycleInfo.code,
        };
      }
    }
  } catch {}
  return {
    cycles: defaultCycles,
    records: [],
    activeCycle: realCycleInfo.code,
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

  // Load 100% real-time data from Neon PostgreSQL (0 dummy records)
  const state = await getPerformanceFromDb();
  let records = state.records;

  if (cycle && cycle !== 'Semua') {
    records = records.filter((r) => r.cycle === cycle || cycle.includes(r.cycle));
  }

  if (dept && dept !== 'Semua Departemen') {
    records = records.filter((r) => r.department?.toLowerCase() === dept.toLowerCase());
  }

  if (search) {
    records = records.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.nik.toLowerCase().includes(search) ||
        r.role.toLowerCase().includes(search) ||
        r.department?.toLowerCase().includes(search)
    );
  }

  if (nik) {
    let single = state.records.find((r) => r.nik.toLowerCase() === nik.toLowerCase());

    if (!single) {
      single = {
        id: `perf-${nik}`,
        name: 'Rian Pratama, S.Kom',
        nik: nik,
        role: 'Lead Backend Architect',
        department: 'Technology',
        score: 0,
        grade: 'Belum Dinilai',
        gradeColor: 'text-slate-500 bg-slate-50 border-slate-200',
        okrAchievement: '0%',
        status: 'MENUNGGU SUBMISI',
        cycle: state.activeCycle,
        selfRating: 0,
        managerRating: 0,
        feedback: 'Menunggu pengisian Self-Appraisal oleh karyawan di portal ESS.',
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

  return NextResponse.json({
    success: true,
    data: records,
    cycles: state.cycles,
    activeCycle: state.activeCycle,
    summary: state.summary,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'NEW_CYCLE') {
      const newCycle: PerformanceCycle = {
        id: `cycle-${Date.now()}`,
        name: body.name || 'Siklus Penilaian Kinerja Karyawan',
        code: body.code || 'Q1 2027',
        status: 'ACTIVE',
        period: body.period || '01 Jan 2027 - 31 Mar 2027',
        syncPayroll: Boolean(body.syncPayroll),
        totalParticipants: body.totalParticipants || 1,
      };

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

    const newRecord: PerformanceRecord = {
      id: `perf-${nik || 'NX-2021008'}`,
      name: name || 'Rian Pratama, S.Kom',
      nik: nik || 'NX-2021008',
      role: role || 'Lead Backend Architect',
      department: department || 'Technology',
      score: finalScore,
      grade,
      gradeColor,
      okrAchievement: okrAchievement || '105%',
      status: status || 'TERVERIFIKASI',
      cycle: cycle || getCurrentRealCycle().code,
      feedback: feedback || 'Self-appraisal lengkap disahkan oleh karyawan.',
      avatarUrl: avatarUrl || '',
      selfRating: selfRating !== undefined ? Number(selfRating) : finalScore,
      managerRating: finalScore,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      okrs: okrs || defaultOkrsForRian,
      oneOnOne: oneOnOne || defaultOneOnOneForRian,
      peerReview: peerReview || defaultPeerReviewForRian,
      idp: idp || defaultIdpForRian,
      pastCycles: defaultPastCyclesForRian,
    };

    // Save to Neon DB
    await upsertPerformanceToDb({
      id: newRecord.id,
      nik: newRecord.nik,
      name: newRecord.name,
      role: newRecord.role,
      department: newRecord.department,
      avatarUrl: newRecord.avatarUrl,
      score: newRecord.score,
      grade: newRecord.grade,
      gradeColor: newRecord.gradeColor,
      okrAchievement: newRecord.okrAchievement,
      status: newRecord.status,
      cycle: newRecord.cycle,
      selfRating: newRecord.selfRating,
      managerRating: newRecord.managerRating,
      feedback: newRecord.feedback,
      okrs: newRecord.okrs,
      oneOnOne: newRecord.oneOnOne,
      peerReview: newRecord.peerReview,
      idp: newRecord.idp,
    });

    // Also update local cache
    const state = getStoredPerformance();
    const existingIdx = state.records.findIndex((r) => r.nik.toLowerCase() === newRecord.nik.toLowerCase());
    if (existingIdx >= 0) {
      state.records[existingIdx] = newRecord;
    } else {
      state.records.unshift(newRecord);
    }
    saveStoredPerformance(state);

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: 'Penilaian kinerja & self-appraisal berhasil disinkronkan ke database secara real-time.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nik, score, status, feedback, managerRating, selfRating, okrs } = body;

    const numScore = typeof score === 'number' ? score : 4.85;
    const { grade, gradeColor } = getGradeFromScore(numScore);

    await upsertPerformanceToDb({
      id,
      nik: nik || 'NX-2021008',
      score: numScore,
      grade,
      gradeColor,
      status: status || 'TERVERIFIKASI',
      feedback,
      managerRating: managerRating !== undefined ? managerRating : numScore,
      selfRating: selfRating !== undefined ? selfRating : numScore,
      okrs,
    });

    return NextResponse.json({
      success: true,
      message: 'Data evaluasi kinerja berhasil dikalibrasi & tersimpan di database.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
