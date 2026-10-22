import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const defaultRecords: PerformanceRecord[] = [
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
    submittedAt: '18 Mar 2025',
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
    submittedAt: '19 Mar 2025',
  },
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
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.85,
    managerRating: 4.85,
    feedback: 'Optimasi query payroll engine dan kepemimpinan mentoring squad backend sangat memuaskan.',
    submittedAt: '24 Mar 2025',
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
    submittedAt: '20 Mar 2025',
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
    submittedAt: '21 Mar 2025',
  },
  {
    id: 'perf-6',
    name: 'Kevin Sanjaya',
    nik: 'NX-2022014',
    role: 'Senior Frontend Engineer',
    department: 'Technology',
    score: 4.20,
    grade: 'Grade B+ (Exceeds)',
    gradeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    okrAchievement: '100%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.3,
    managerRating: 4.1,
    feedback: 'Kecepatan rendering portal karyawan meningkat signifikan.',
    submittedAt: '22 Mar 2025',
  },
  {
    id: 'perf-7',
    name: 'Siti Nurhaliza, M.M.',
    nik: 'NX-201992',
    role: 'People & Talent Dev Specialist',
    department: 'Human Resources',
    score: 4.40,
    grade: 'Grade B+ (Exceeds)',
    gradeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    okrAchievement: '102%',
    status: 'TERVERIFIKASI',
    cycle: 'Q1 2025',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    selfRating: 4.5,
    managerRating: 4.3,
    feedback: 'Pelaksanaan workshop pelatihan karyawan berjalan dengan tingkat kepuasan 94%.',
    submittedAt: '22 Mar 2025',
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
    submittedAt: '23 Mar 2025',
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
    const single = state.records.find((r) => r.nik.toLowerCase() === nik.toLowerCase());
    return NextResponse.json({
      success: true,
      data: single || null,
      activeCycle: state.activeCycle,
    });
  }

  // Calculate dynamic metrics
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

    // Add or update review
    const { name, nik, role, department, score, okrAchievement, status, cycle, feedback, avatarUrl } = body;
    const finalScore = Number(score) || 4.85;
    const { grade, gradeColor } = getGradeFromScore(finalScore);

    const existingIdx = state.records.findIndex((r) => r.nik.toLowerCase() === (nik || '').toLowerCase());
    const newRecord: PerformanceRecord = {
      id: existingIdx >= 0 ? state.records[existingIdx].id : `perf-${Date.now()}`,
      name: name || 'Rian Pratama, S.Kom',
      nik: nik || 'NX-2021008',
      role: role || 'Lead Backend Architect',
      department: department || 'Technology',
      score: finalScore,
      grade,
      gradeColor,
      okrAchievement: okrAchievement || '105%',
      status: status || 'TERVERIFIKASI',
      cycle: cycle || state.activeCycle,
      feedback: feedback || '',
      avatarUrl: avatarUrl || '',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      state.records[existingIdx] = {
        ...state.records[existingIdx],
        ...newRecord,
      };
    } else {
      state.records.unshift(newRecord);
    }

    saveStoredPerformance(state);

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: 'Penilaian kinerja berhasil disimpan secara real-time.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nik, score, status, feedback, managerRating } = body;

    const state = getStoredPerformance();
    const targetIdx = state.records.findIndex(
      (r) => (id && r.id === id) || (nik && r.nik.toLowerCase() === nik.toLowerCase())
    );

    if (targetIdx === -1) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    const current = state.records[targetIdx];
    const newScore = typeof score === 'number' ? score : current.score;
    const { grade, gradeColor } = getGradeFromScore(newScore);

    state.records[targetIdx] = {
      ...current,
      score: newScore,
      grade,
      gradeColor,
      status: status || current.status,
      feedback: feedback !== undefined ? feedback : current.feedback,
      managerRating: managerRating !== undefined ? managerRating : current.managerRating,
      updatedAt: new Date().toISOString(),
    };

    saveStoredPerformance(state);

    return NextResponse.json({
      success: true,
      data: state.records[targetIdx],
      message: 'Kalibrasi nilai kinerja berhasil diperbarui.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
