import { neon } from '@neondatabase/serverless';

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

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_Jv7SzD1PgcQl@ep-shiny-silence-azkjdzr3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_NEON_DATABASE_URL;

function getDb() {
  return neon(DATABASE_URL);
}

export function getCurrentRealCycle(): {
  code: string;
  name: string;
  period: string;
  nextCycleSchedule: string;
  quarter: number;
  year: number;
} {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  const code = `Q${quarter} ${year}`;
  const name = `Siklus Penilaian Kinerja Karyawan ${code}`;

  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0);

  const startStr = startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const endStr = endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const period = `${startStr} - ${endStr}`;

  const nextQ = quarter === 4 ? 1 : quarter + 1;
  const nextY = quarter === 4 ? year + 1 : year;
  const nextDate = new Date(nextY, (nextQ - 1) * 3, 1);
  const nextCycleSchedule = `Siklus Q${nextQ} ${nextY} dijadwalkan buka ${nextDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long' })}`;

  return { code, name, period, nextCycleSchedule, quarter, year };
}

export function getGradeFromScore(score: number): { grade: string; gradeColor: string } {
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
  if (score > 0) {
    return {
      grade: 'Grade C (PIP Wajib)',
      gradeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    };
  }
  return {
    grade: 'Belum Dinilai',
    gradeColor: 'text-slate-500 bg-slate-50 border-slate-200',
  };
}

export async function getPerformanceFromDb(): Promise<{
  cycles: PerformanceCycle[];
  records: PerformanceRecord[];
  activeCycle: string;
  summary: {
    avgScore: string;
    topPerformersCount: number;
    topPerformersPercent: string;
    pipCount: number;
    pipPercent: string;
    completionPercent: number;
    totalEmployees: number;
    benchmarkLabel: string;
    nextScheduleLabel: string;
  };
}> {
  const currentCycleInfo = getCurrentRealCycle();
  const activeCycle = currentCycleInfo.code;

  const cycles: PerformanceCycle[] = [
    {
      id: `cycle-${currentCycleInfo.year}-${currentCycleInfo.quarter}`,
      name: currentCycleInfo.name,
      code: currentCycleInfo.code,
      status: 'ACTIVE',
      period: currentCycleInfo.period,
      syncPayroll: true,
      totalParticipants: 1,
    },
  ];

  try {
    const sql = getDb();

    // 1. Fetch real active employees from Neon PostgreSQL
    const employees = await sql`
      SELECT 
        e.id, 
        e.employee_number, 
        e.first_name, 
        e.last_name, 
        e.avatar_url, 
        d.name as department_name, 
        des.title as designation_title 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      LEFT JOIN designations des ON e.designation_id = des.id
      WHERE e.deleted_at IS NULL
      ORDER BY e.created_at ASC
    `;

    // 2. Fetch existing reviews from performance_reviews
    const reviewRows = await sql`
      SELECT * FROM performance_reviews WHERE cycle = ${activeCycle}
    `;

    const reviewMap = new Map<string, any>();
    reviewRows.forEach((r: any) => {
      reviewMap.set(r.nik?.toLowerCase(), r);
    });

    // 3. Map real employees into PerformanceRecord format
    const records: PerformanceRecord[] = employees.map((emp: any) => {
      const nik = emp.employee_number || 'NX-2021008';
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Rian Pratama, S.Kom';
      const role = emp.designation_title || 'Lead Backend Architect';
      const department = emp.department_name || 'Technology';
      const avatarUrl = emp.avatar_url || '';

      const existing = reviewMap.get(nik.toLowerCase());
      if (existing) {
        const score = Number(existing.score) || 0;
        const gradeInfo = getGradeFromScore(score);
        return {
          id: existing.id,
          nik,
          name: fullName,
          role,
          department,
          avatarUrl: existing.avatar_url || avatarUrl,
          score,
          grade: existing.grade || gradeInfo.grade,
          gradeColor: existing.grade_color || gradeInfo.gradeColor,
          okrAchievement: existing.okr_achievement || '100%',
          status: existing.status || 'TERVERIFIKASI',
          cycle: existing.cycle || activeCycle,
          selfRating: Number(existing.self_rating) || score,
          managerRating: Number(existing.manager_rating) || score,
          feedback: existing.feedback || '',
          submittedAt: existing.submitted_at ? new Date(existing.submitted_at).toISOString() : new Date().toISOString(),
          okrs: existing.okrs || undefined,
          oneOnOne: existing.one_on_one || undefined,
          peerReview: existing.peer_review || undefined,
          idp: existing.idp || undefined,
        };
      }

      // Real employee who has not submitted evaluation yet in this active cycle
      return {
        id: `perf-emp-${emp.id}`,
        nik,
        name: fullName,
        role,
        department,
        avatarUrl,
        score: 0,
        grade: 'Belum Dinilai',
        gradeColor: 'text-slate-500 bg-slate-50 border-slate-200',
        okrAchievement: '0%',
        status: 'MENUNGGU SUBMISI',
        cycle: activeCycle,
        selfRating: 0,
        managerRating: 0,
        feedback: 'Menunggu pengisian Self-Appraisal oleh karyawan di portal ESS.',
        submittedAt: new Date().toISOString(),
      };
    });

    // 4. Calculate dynamic real-time metrics strictly from real employees
    const total = records.length;
    const evaluated = records.filter((r) => r.score > 0 || r.status === 'TERVERIFIKASI');
    const totalScore = evaluated.reduce((sum, r) => sum + r.score, 0);
    const avgScore = evaluated.length > 0 ? (totalScore / evaluated.length).toFixed(2) : '0.00';

    const topPerformers = records.filter((r) => r.score >= 4.5);
    const topPerformersPercent = total > 0 ? ((topPerformers.length / total) * 100).toFixed(1) : '0.0';

    const pipCandidates = records.filter((r) => (r.score > 0 && r.score < 3.0) || r.status === 'PERLU COACHING');
    const pipPercent = total > 0 ? ((pipCandidates.length / total) * 100).toFixed(1) : '0.0';

    const completionPercent = total > 0 ? Math.round((evaluated.length / total) * 100) : 0;

    return {
      cycles,
      records,
      activeCycle,
      summary: {
        avgScore,
        topPerformersCount: topPerformers.length,
        topPerformersPercent,
        pipCount: pipCandidates.length,
        pipPercent,
        completionPercent,
        totalEmployees: total,
        benchmarkLabel: `Benchmark ${activeCycle}`,
        nextScheduleLabel: currentCycleInfo.nextCycleSchedule,
      },
    };
  } catch (error) {
    console.error('Failed to query performance from Neon DB:', error);
    return {
      cycles,
      records: [],
      activeCycle,
      summary: {
        avgScore: '0.00',
        topPerformersCount: 0,
        topPerformersPercent: '0.0',
        pipCount: 0,
        pipPercent: '0.0',
        completionPercent: 0,
        totalEmployees: 0,
        benchmarkLabel: `Benchmark ${activeCycle}`,
        nextScheduleLabel: currentCycleInfo.nextCycleSchedule,
      },
    };
  }
}

export async function upsertPerformanceToDb(record: {
  id?: string;
  nik: string;
  name?: string;
  role?: string;
  department?: string;
  avatarUrl?: string;
  score?: number;
  grade?: string;
  gradeColor?: string;
  okrAchievement?: string;
  status?: string;
  cycle?: string;
  selfRating?: number;
  managerRating?: number;
  feedback?: string;
  okrs?: any;
  oneOnOne?: any;
  peerReview?: any;
  idp?: any;
}): Promise<boolean> {
  const currentCycleInfo = getCurrentRealCycle();
  const cycle = record.cycle || currentCycleInfo.code;
  const id = record.id || `perf-${record.nik}-${cycle.replace(/\s+/g, '-').toLowerCase()}`;
  const score = typeof record.score === 'number' ? record.score : 0;
  const gradeInfo = getGradeFromScore(score);
  const grade = record.grade || gradeInfo.grade;
  const gradeColor = record.gradeColor || gradeInfo.gradeColor;

  try {
    const sql = getDb();

    // If name/role/dept missing, query from employees table
    let name = record.name;
    let role = record.role;
    let department = record.department;
    let avatarUrl = record.avatarUrl || '';

    if (!name || !role || !department) {
      const empRows = await sql`
        SELECT e.first_name, e.last_name, e.avatar_url, d.name as department_name, des.title as designation_title
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN designations des ON e.designation_id = des.id
        WHERE e.employee_number = ${record.nik}
        LIMIT 1
      `;
      if (empRows.length > 0) {
        const emp = empRows[0];
        name = name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
        role = role || emp.designation_title;
        department = department || emp.department_name;
        avatarUrl = avatarUrl || emp.avatar_url || '';
      }
    }

    const okrsJson = record.okrs ? JSON.stringify(record.okrs) : null;
    const oneOnOneJson = record.oneOnOne ? JSON.stringify(record.oneOnOne) : null;
    const peerReviewJson = record.peerReview ? JSON.stringify(record.peerReview) : null;
    const idpJson = record.idp ? JSON.stringify(record.idp) : null;

    await sql`
      INSERT INTO performance_reviews (
        id, nik, name, role, department, avatar_url, score, grade, grade_color,
        okr_achievement, status, cycle, self_rating, manager_rating, feedback,
        okrs, one_on_one, peer_review, idp, submitted_at, updated_at
      ) VALUES (
        ${id},
        ${record.nik},
        ${name || 'Rian Pratama, S.Kom'},
        ${role || 'Lead Backend Architect'},
        ${department || 'Technology'},
        ${avatarUrl},
        ${score},
        ${grade},
        ${gradeColor},
        ${record.okrAchievement || '100%'},
        ${record.status || 'TERVERIFIKASI'},
        ${cycle},
        ${record.selfRating ?? score},
        ${record.managerRating ?? score},
        ${record.feedback || ''},
        ${okrsJson}::jsonb,
        ${oneOnOneJson}::jsonb,
        ${peerReviewJson}::jsonb,
        ${idpJson}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        score = EXCLUDED.score,
        grade = EXCLUDED.grade,
        grade_color = EXCLUDED.grade_color,
        okr_achievement = EXCLUDED.okr_achievement,
        status = EXCLUDED.status,
        manager_rating = EXCLUDED.manager_rating,
        feedback = EXCLUDED.feedback,
        okrs = COALESCE(EXCLUDED.okrs, performance_reviews.okrs),
        one_on_one = COALESCE(EXCLUDED.one_on_one, performance_reviews.one_on_one),
        peer_review = COALESCE(EXCLUDED.peer_review, performance_reviews.peer_review),
        idp = COALESCE(EXCLUDED.idp, performance_reviews.idp),
        updated_at = NOW()
    `;
    return true;
  } catch (error) {
    console.error('Failed to upsert performance review to Neon DB:', error);
    return false;
  }
}
