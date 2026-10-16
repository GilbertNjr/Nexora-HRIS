'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AdminLayoutSkeleton } from '@/components/layout/AdminLayoutSkeleton';
import {
  Briefcase,
  UserPlus,
  Users,
  UserCheck,
  Timer,
  CheckCircle2,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  SlidersHorizontal,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Calendar,
  CalendarCheck,
  GitFork,
  Laptop,
  Mail,
  ShieldCheck,
  Sparkles,
  Eye,
  FileText,
  X,
  Trash2,
  Edit3,
  Share2,
  Check,
  Archive,
  Layers,
  ArrowRight,
  Building2,
  MapPin,
  GraduationCap,
  Phone,
  Send,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Award,
  Terminal,
  Code2,
  Smartphone,
  ExternalLink,
  TrendingUp,
  LayoutList,
  LayoutGrid,
  FileCheck,
} from 'lucide-react';

// Types
export interface TableVacancy {
  id: string;
  title: string;
  type: string;
  location: string;
  departmentBadge: string;
  deptColor: string;
  openDate: string;
  deadlineDate: string;
  applicantCount: number;
  status: 'Aktif' | 'Tutup';
}

const initialTableVacancies: TableVacancy[] = [
  {
    id: 'vac-1',
    title: 'Frontend Engineer',
    type: 'Full-Time',
    location: 'Kantor Pusat Jakarta',
    departmentBadge: 'IT & Engineering',
    deptColor: 'bg-blue-100 text-blue-800',
    openDate: '10 Okt 2024',
    deadlineDate: '31 Okt 2024',
    applicantCount: 12,
    status: 'Aktif',
  },
  {
    id: 'vac-2',
    title: 'HR Specialist',
    type: 'Full-Time',
    location: 'People Operations',
    departmentBadge: 'HRD',
    deptColor: 'bg-indigo-100 text-indigo-800',
    openDate: '14 Okt 2024',
    deadlineDate: '04 Nov 2024',
    applicantCount: 8,
    status: 'Aktif',
  },
  {
    id: 'vac-3',
    title: 'Staff Akuntansi',
    type: 'Full-Time',
    location: 'Tax & Accounting',
    departmentBadge: 'Finance',
    deptColor: 'bg-sky-100 text-sky-800',
    openDate: '18 Okt 2024',
    deadlineDate: '08 Nov 2024',
    applicantCount: 5,
    status: 'Aktif',
  },
  {
    id: 'vac-4',
    title: 'Staf Operasional',
    type: 'Kontrak',
    location: 'Logistik & Fasilitas',
    departmentBadge: 'Ops',
    deptColor: 'bg-slate-100 text-slate-800',
    openDate: '20 Okt 2024',
    deadlineDate: '10 Nov 2024',
    applicantCount: 3,
    status: 'Aktif',
  },
];

const initialRecentApplicants = [
  {
    id: 'rec-1',
    initials: 'RA',
    avatarBg: 'bg-blue-600 text-white',
    name: 'Rian Aditya',
    role: 'Frontend Engineer',
    timeAgo: '2 jam yang lalu',
    statusBadge: 'Review Berkas',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    dotColor: 'bg-blue-600',
  },
  {
    id: 'rec-2',
    initials: 'NP',
    avatarBg: 'bg-slate-900 text-white',
    name: 'Nadya Putri',
    role: 'HR Specialist',
    timeAgo: '5 jam yang lalu',
    statusBadge: 'Wawancara',
    badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    dotColor: 'bg-indigo-600',
  },
  {
    id: 'rec-3',
    initials: 'BK',
    avatarBg: 'bg-sky-500 text-white',
    name: 'Bagus Kurniawan',
    role: 'Staff Akuntansi',
    timeAgo: 'Kemarin, 16:20',
    statusBadge: 'Review Berkas',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    dotColor: 'bg-blue-600',
  },
];

interface JobPosting {
  id: string;
  code: string;
  title: string;
  department: string;
  contractType: 'PKWTT' | 'PKWT' | 'Magang';
  priority: 'Prioritas Tinggi' | 'Prioritas Sedang' | 'Prioritas Normal';
  targetDate: string;
  totalApplicants: number;
  passedScreening: number;
  userInterview: number;
  status: 'Aktif' | 'Draft' | 'Ditutup';
  iconType: 'terminal' | 'code' | 'finance' | 'people' | 'mobile' | 'product';
  salaryRange?: string;
  location?: string;
  applicantsSample: { initials: string; bg: string; name: string }[];
}

interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  currentRole: string;
  experienceYears: number;
  education: string;
  matchScore: number;
  stage: 'Screening CV' | 'Tes & Asesmen' | 'Wawancara HR/User' | 'Offering & MCU' | 'Siap Onboard';
  appliedDate: string;
  notes?: string;
  initials: string;
  avatarBg: string;
}

interface OnboardingEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  batch: string;
  startDate: string;
  initials: string;
  avatarBg: string;
  progress: number;
  checklists: {
    id: string;
    label: string;
    category: 'IT & Fasilitas' | 'Administrasi' | 'Orientasi';
    completed: boolean;
  }[];
}

interface TalentPoolCandidate {
  id: string;
  name: string;
  role: string;
  department: string;
  skills: string[];
  lastExperience: string;
  rating: number;
  status: 'Silver Medalist' | 'Talent Pool' | 'Arsip';
  archivedDate: string;
}

export default function AdminRecruitmentPage() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'jobs' | 'pipeline' | 'onboarding' | 'talent_pool'>('jobs');
  const [jobViewMode, setJobViewMode] = useState<'table' | 'cards'>('table');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableVacancies, setTableVacancies] = useState<TableVacancy[]>(initialTableVacancies);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<string | null>(null);

  // Filters for Pipeline
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Semua Departemen');
  const [selectedStatus, setSelectedStatus] = useState('Aktif');

  // Modals & Drawers
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isOnboardingTemplateModalOpen, setIsOnboardingTemplateModalOpen] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<JobPosting | null>(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [activeDropdownJobId, setActiveDropdownJobId] = useState<string | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Table Vacancies matching Image 1
  const filteredTableVacancies = useMemo(() => {
    return tableVacancies.filter((v) => {
      const q = tableSearchQuery.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.departmentBadge.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    });
  }, [tableVacancies, tableSearchQuery]);

  // 1. Initial Job Postings Data
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([
    {
      id: 'job-1',
      code: 'DEV-2025-01',
      title: 'Lead DevOps Engineer',
      department: 'Divisi Teknologi',
      contractType: 'PKWTT',
      priority: 'Prioritas Tinggi',
      targetDate: '15 Apr 2025',
      totalApplicants: 46,
      passedScreening: 21,
      userInterview: 3,
      status: 'Aktif',
      iconType: 'terminal',
      salaryRange: 'Rp 28.000.000 - Rp 38.000.000',
      location: 'Jakarta Selatan (Hybrid)',
      applicantsSample: [
        { initials: 'AD', bg: 'bg-indigo-600 text-white', name: 'Aldi Dharmawan' },
        { initials: 'FN', bg: 'bg-amber-600 text-white', name: 'Fikri Nugraha' },
        { initials: 'TW', bg: 'bg-emerald-600 text-white', name: 'Teguh Wibowo' },
      ],
    },
    {
      id: 'job-2',
      code: 'ENG-2025-04',
      title: 'Senior Frontend Engineer (Next.js)',
      department: 'Divisi Teknologi',
      contractType: 'PKWTT',
      priority: 'Prioritas Tinggi',
      targetDate: '20 Apr 2025',
      totalApplicants: 38,
      passedScreening: 18,
      userInterview: 5,
      status: 'Aktif',
      iconType: 'code',
      salaryRange: 'Rp 18.000.000 - Rp 25.000.000',
      location: 'Jakarta Selatan (Hybrid)',
      applicantsSample: [
        { initials: 'RK', bg: 'bg-blue-600 text-white', name: 'Reza Kurnia' },
        { initials: 'MS', bg: 'bg-violet-600 text-white', name: 'Maya Santoso' },
        { initials: 'DS', bg: 'bg-rose-600 text-white', name: 'Dion Siregar' },
      ],
    },
    {
      id: 'job-3',
      code: 'FIN-2025-02',
      title: 'Senior Tax & Accounting Specialist',
      department: 'Divisi Keuangan & Pajak',
      contractType: 'PKWTT',
      priority: 'Prioritas Sedang',
      targetDate: '30 Apr 2025',
      totalApplicants: 29,
      passedScreening: 12,
      userInterview: 2,
      status: 'Aktif',
      iconType: 'finance',
      salaryRange: 'Rp 14.000.000 - Rp 19.000.000',
      location: 'Jakarta Pusat (On-site)',
      applicantsSample: [
        { initials: 'HW', bg: 'bg-teal-600 text-white', name: 'Hani Wulandari' },
        { initials: 'BP', bg: 'bg-sky-600 text-white', name: 'Bayu Pratama' },
        { initials: 'CL', bg: 'bg-orange-600 text-white', name: 'Clarissa Lin' },
      ],
    },
    {
      id: 'job-4',
      code: 'HR-2025-03',
      title: 'People & Culture Specialist (HRBP)',
      department: 'Divisi SDM & Operasional',
      contractType: 'PKWT',
      priority: 'Prioritas Sedang',
      targetDate: '05 Mei 2025',
      totalApplicants: 54,
      passedScreening: 24,
      userInterview: 4,
      status: 'Aktif',
      iconType: 'people',
      salaryRange: 'Rp 11.000.000 - Rp 15.000.000',
      location: 'Jakarta Selatan (Hybrid)',
      applicantsSample: [
        { initials: 'AS', bg: 'bg-pink-600 text-white', name: 'Anindya Syafira' },
        { initials: 'GP', bg: 'bg-purple-600 text-white', name: 'Gilang Permana' },
        { initials: 'NK', bg: 'bg-cyan-600 text-white', name: 'Nadia Kusuma' },
      ],
    },
    {
      id: 'job-5',
      code: 'MOB-2025-07',
      title: 'Mobile Engineer (Flutter & iOS)',
      department: 'Divisi Teknologi',
      contractType: 'PKWTT',
      priority: 'Prioritas Tinggi',
      targetDate: '18 Apr 2025',
      totalApplicants: 32,
      passedScreening: 14,
      userInterview: 3,
      status: 'Aktif',
      iconType: 'mobile',
      salaryRange: 'Rp 16.000.000 - Rp 23.000.000',
      location: 'Jakarta Selatan (Hybrid)',
      applicantsSample: [
        { initials: 'DR', bg: 'bg-blue-700 text-white', name: 'Dimas Ramadhan' },
        { initials: 'EL', bg: 'bg-emerald-700 text-white', name: 'Eka Lestari' },
        { initials: 'YI', bg: 'bg-amber-700 text-white', name: 'Yoga Irawan' },
      ],
    },
  ]);

  // 2. Candidates in ATS Pipeline
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 'cand-1',
      jobId: 'job-1',
      name: 'Aldi Dharmawan',
      email: 'aldi.dharmawan@techdev.id',
      phone: '+62 812-4455-8899',
      currentRole: 'Senior SRE / DevOps Specialist',
      experienceYears: 7,
      education: 'S1 Teknik Informatika - ITB',
      matchScore: 96,
      stage: 'Wawancara HR/User',
      appliedDate: '12 Mar 2025',
      notes: 'Pengalaman kuat di Kubernetes, Terraform, AWS, dan CI/CD GitLab. Komunikasi terstruktur.',
      initials: 'AD',
      avatarBg: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'cand-2',
      jobId: 'job-1',
      name: 'Fikri Nugraha',
      email: 'fikri.nugraha@cloudsys.co',
      phone: '+62 813-8877-2211',
      currentRole: 'DevOps & Infrastructure Lead',
      experienceYears: 8,
      education: 'S1 Sistem Informasi - UI',
      matchScore: 93,
      stage: 'Wawancara HR/User',
      appliedDate: '14 Mar 2025',
      notes: 'Expertise di multi-cloud migration, Istio Service Mesh, dan observability Datadog.',
      initials: 'FN',
      avatarBg: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'cand-3',
      jobId: 'job-1',
      name: 'Teguh Wibowo',
      email: 'teguh.wibowo@fintech.net',
      phone: '+62 821-3322-1100',
      currentRole: 'Site Reliability Engineer',
      experienceYears: 6,
      education: 'S1 Ilmu Komputer - UGM',
      matchScore: 89,
      stage: 'Tes & Asesmen',
      appliedDate: '18 Mar 2025',
      notes: 'Skor tes teknikal arsitektur: 92/100. Sedang menunggu jadwal review live coding.',
      initials: 'TW',
      avatarBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'cand-4',
      jobId: 'job-1',
      name: 'Budi Santoso',
      email: 'budi.santoso@infra.id',
      phone: '+62 811-9988-7766',
      currentRole: 'Cloud Infrastructure Engineer',
      experienceYears: 5,
      education: 'S1 Teknik Elektro - ITS',
      matchScore: 88,
      stage: 'Offering & MCU',
      appliedDate: '02 Mar 2025',
      notes: 'Offering letter dikirim Rp 32.000.000. MCU dijadwalkan di RS Siloam Semanggi.',
      initials: 'BS',
      avatarBg: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'cand-5',
      jobId: 'job-1',
      name: 'Rian Pratama',
      email: 'rian.pratama@enterprise.com',
      phone: '+62 812-9900-1122',
      currentRole: 'Lead Platform Architect',
      experienceYears: 9,
      education: 'S2 Computer Science - NUS',
      matchScore: 98,
      stage: 'Siap Onboard',
      appliedDate: '20 Feb 2025',
      notes: 'Offering accepted. Bergabung di Batch April 2025 tanggal 1 April.',
      initials: 'RP',
      avatarBg: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'cand-6',
      jobId: 'job-1',
      name: 'Cynthia Amanda',
      email: 'cynthia.amanda@tech.id',
      phone: '+62 856-7788-9900',
      currentRole: 'Junior DevOps Engineer',
      experienceYears: 3,
      education: 'S1 Teknik Informatika - Binus',
      matchScore: 82,
      stage: 'Screening CV',
      appliedDate: '22 Mar 2025',
      notes: 'Portfolio Docker & CI/CD menarik. Perlu konfirmasi kesiapan on-call rotation.',
      initials: 'CA',
      avatarBg: 'bg-rose-100 text-rose-700',
    },
  ]);

  // 3. Onboarding Employees Data (Matching screenshot right panel)
  const [onboardingList, setOnboardingList] = useState<OnboardingEmployee[]>([
    {
      id: 'onb-1',
      name: 'Farhan Maulana',
      role: 'Frontend Dev',
      department: 'IT',
      batch: 'Batch April 2025',
      startDate: '1 Apr 2025',
      initials: 'FM',
      avatarBg: 'bg-blue-100 text-blue-700 font-bold',
      progress: 80,
      checklists: [
        { id: 'c1', label: 'Laptop & Email', category: 'IT & Fasilitas', completed: true },
        { id: 'c2', label: 'Tanda Tangan PKWTT', category: 'Administrasi', completed: true },
        { id: 'c3', label: 'Data Rekening Payroll', category: 'Administrasi', completed: true },
        { id: 'c4', label: 'Verifikasi BPJS Ketenagakerjaan', category: 'Administrasi', completed: false },
        { id: 'c5', label: 'Orientasi HR & Budaya', category: 'Orientasi', completed: true },
      ],
    },
    {
      id: 'onb-2',
      name: 'Siti Rahmania, S.E.',
      role: 'Tax Officer',
      department: 'Finance',
      batch: 'Batch April 2025',
      startDate: '1 Apr 2025',
      initials: 'SR',
      avatarBg: 'bg-indigo-100 text-indigo-700 font-bold',
      progress: 60,
      checklists: [
        { id: 'c1', label: 'Data Mandiri Karyawan', category: 'Administrasi', completed: true },
        { id: 'c2', label: 'Penyerahan NPWP & KK', category: 'Administrasi', completed: true },
        { id: 'c3', label: 'Laptop & Setup Akun ERP', category: 'IT & Fasilitas', completed: true },
        { id: 'c4', label: 'Orientasi HR', category: 'Orientasi', completed: false },
        { id: 'c5', label: 'Briefing Supervisor Finance', category: 'Orientasi', completed: false },
      ],
    },
    {
      id: 'onb-3',
      name: 'Bima Arya Prasetyo',
      role: 'Mobile Eng',
      department: 'Tech',
      batch: 'Batch April 2025',
      startDate: '1 Apr 2025',
      initials: 'BA',
      avatarBg: 'bg-teal-100 text-teal-700 font-bold',
      progress: 100,
      checklists: [
        { id: 'c1', label: 'Semua modul siap', category: 'Orientasi', completed: true },
        { id: 'c2', label: 'MacBook Pro M3 & Git Access', category: 'IT & Fasilitas', completed: true },
        { id: 'c3', label: 'Verifikasi BPJS & Asuransi', category: 'Administrasi', completed: true },
        { id: 'c4', label: 'Paket Sambutan & ID Card', category: 'Orientasi', completed: true },
        { id: 'c5', label: 'Siap Hari Pertama', category: 'Orientasi', completed: true },
      ],
    },
    {
      id: 'onb-4',
      name: 'Jessica Wulandari',
      role: 'Talent Acquisition',
      department: 'HR',
      batch: 'Batch April 2025',
      startDate: '1 Apr 2025',
      initials: 'JW',
      avatarBg: 'bg-pink-100 text-pink-700 font-bold',
      progress: 75,
      checklists: [
        { id: 'c1', label: 'Email Google Workspace & ATS', category: 'IT & Fasilitas', completed: true },
        { id: 'c2', label: 'Kelengkapan Dokumen Ijazah', category: 'Administrasi', completed: true },
        { id: 'c3', label: 'Orientasi Organisasi', category: 'Orientasi', completed: true },
        { id: 'c4', label: 'Assign Mentor Buddy', category: 'Orientasi', completed: false },
      ],
    },
    {
      id: 'onb-5',
      name: 'Raditya Hendra',
      role: 'DevOps Engineer',
      department: 'Tech',
      batch: 'Batch April 2025',
      startDate: '1 Apr 2025',
      initials: 'RH',
      avatarBg: 'bg-purple-100 text-purple-700 font-bold',
      progress: 90,
      checklists: [
        { id: 'c1', label: 'Cloud Access & VPN', category: 'IT & Fasilitas', completed: true },
        { id: 'c2', label: 'Security Compliance Sign-off', category: 'Administrasi', completed: true },
        { id: 'c3', label: 'Laptop Linux Ready', category: 'IT & Fasilitas', completed: true },
        { id: 'c4', label: 'Buddy Meeting', category: 'Orientasi', completed: false },
      ],
    },
  ]);

  // 4. Talent Pool Data
  const [talentPool, setTalentPool] = useState<TalentPoolCandidate[]>([
    {
      id: 'tp-1',
      name: 'Eko Prasetyo',
      role: 'Fullstack Engineer',
      department: 'Divisi Teknologi',
      skills: ['Go', 'React', 'Docker', 'PostgreSQL'],
      lastExperience: '5 Tahun di Unicorn Fintech',
      rating: 4.8,
      status: 'Silver Medalist',
      archivedDate: '10 Feb 2025',
    },
    {
      id: 'tp-2',
      name: 'Kurnia Dewi',
      role: 'Senior Financial Analyst',
      department: 'Divisi Keuangan & Pajak',
      skills: ['Brevet AB', 'Financial Modeling', 'SAP', 'IFRS'],
      lastExperience: '6 Tahun di Big 4 Audit Firm',
      rating: 4.9,
      status: 'Silver Medalist',
      archivedDate: '18 Jan 2025',
    },
    {
      id: 'tp-3',
      name: 'Hendra Saputra',
      role: 'Senior Product Designer (UI/UX)',
      department: 'Divisi Bisnis & Produk',
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      lastExperience: '4 Tahun di Travel Tech',
      rating: 4.7,
      status: 'Talent Pool',
      archivedDate: '05 Mar 2025',
    },
    {
      id: 'tp-4',
      name: 'Vania Putri',
      role: 'Performance Marketing Lead',
      department: 'Divisi Pemasaran & Sales',
      skills: ['Google Ads', 'Meta Ads', 'GA4', 'Data Studio'],
      lastExperience: '5 Tahun di E-commerce',
      rating: 4.6,
      status: 'Talent Pool',
      archivedDate: '22 Feb 2025',
    },
  ]);

  // 5. New Job Form State
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    department: 'Divisi Teknologi',
    contractType: 'PKWTT' as 'PKWTT' | 'PKWT' | 'Magang',
    priority: 'Prioritas Tinggi' as 'Prioritas Tinggi' | 'Prioritas Sedang' | 'Prioritas Normal',
    targetDate: '2025-05-15',
    salaryMin: '15000000',
    salaryMax: '25000000',
    location: 'Jakarta Selatan (Hybrid)',
    description: '',
  });

  // Filtered Job Postings
  const filteredJobs = useMemo(() => {
    return jobPostings.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept =
        selectedDepartment === 'Semua Departemen' || job.department === selectedDepartment;

      const matchStatus =
        selectedStatus === 'Semua' || job.status === selectedStatus;

      return matchSearch && matchDept && matchStatus;
    });
  }, [jobPostings, searchQuery, selectedDepartment, selectedStatus]);

  // Funnel Stage Statistics
  const pipelineStats = useMemo(() => {
    return [
      { id: 'Screening CV', name: '1. Screening CV', count: 142, label: 'Pelamar', activeColor: 'bg-blue-600' },
      { id: 'Tes & Asesmen', name: '2. Tes & Asesmen', count: 68, label: 'Peserta', activeColor: 'bg-blue-600' },
      { id: 'Wawancara HR/User', name: '3. Wawancara HR/User', count: 29, label: 'Kandidat', activeColor: 'bg-blue-600' },
      { id: 'Offering & MCU', name: '4. Offering & MCU', count: 9, label: 'Final', activeColor: 'bg-blue-600' },
      { id: 'Siap Onboard', name: '5. Siap Onboard', count: 5, label: 'Lolos', activeColor: 'bg-blue-600' },
    ];
  }, []);

  // Handlers
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobForm.title.trim()) {
      alert('Mohon masukkan judul lowongan');
      return;
    }

    const createdJob: JobPosting = {
      id: `job-${Date.now()}`,
      code: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: newJobForm.title,
      department: newJobForm.department,
      contractType: newJobForm.contractType,
      priority: newJobForm.priority,
      targetDate: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(newJobForm.targetDate)),
      totalApplicants: 1,
      passedScreening: 0,
      userInterview: 0,
      status: 'Aktif',
      iconType: newJobForm.department.includes('Teknologi') ? 'terminal' : 'finance',
      salaryRange: `Rp ${Number(newJobForm.salaryMin).toLocaleString('id-ID')} - Rp ${Number(newJobForm.salaryMax).toLocaleString('id-ID')}`,
      location: newJobForm.location,
      applicantsSample: [{ initials: 'HR', bg: 'bg-blue-600 text-white', name: 'Baru Masuk' }],
    };

    setJobPostings([createdJob, ...jobPostings]);
    setIsNewJobModalOpen(false);
    showToast(`Lowongan "${createdJob.title}" berhasil dipublikasikan!`);
    setNewJobForm({
      title: '',
      department: 'Divisi Teknologi',
      contractType: 'PKWTT',
      priority: 'Prioritas Tinggi',
      targetDate: '2025-05-15',
      salaryMin: '15000000',
      salaryMax: '25000000',
      location: 'Jakarta Selatan (Hybrid)',
      description: '',
    });
  };

  const handleExportXLSX = () => {
    showToast('Mengunduh Laporan Rekrutmen & Onboarding (.xlsx)...', 'info');
    setTimeout(() => {
      // Simulate file download
      const csvHeader = 'ID Lowongan,Posisi,Departemen,Tipe Kontrak,Target Penutupan,Total Pelamar,Lolos Screening,Tahap Wawancara,Status\n';
      const csvRows = jobPostings
        .map(
          (j) =>
            `"${j.code}","${j.title}","${j.department}","${j.contractType}","${j.targetDate}",${j.totalApplicants},${j.passedScreening},${j.userInterview},"${j.status}"`
        )
        .join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Nexora_Rekrutmen_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Laporan Rekrutmen berhasil diunduh!');
    }, 600);
  };

  // Toggle checklist for onboarding employee
  const handleToggleChecklist = (empId: string, checklistId: string) => {
    setOnboardingList((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const updatedChecklists = emp.checklists.map((c) =>
          c.id === checklistId ? { ...c, completed: !c.completed } : c
        );
        const completedCount = updatedChecklists.filter((c) => c.completed).length;
        const newProgress = Math.round((completedCount / updatedChecklists.length) * 100);
        return {
          ...emp,
          checklists: updatedChecklists,
          progress: newProgress,
        };
      })
    );
    showToast('Progress checklist onboarding diperbarui!');
  };

  // Move candidate to next stage
  const handleAdvanceCandidate = (candidateId: string, targetStage: Candidate['stage']) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: targetStage } : c))
    );
    showToast(`Kandidat berhasil dipindahkan ke tahap "${targetStage}"`);
  };

  return (
    <AdminLayoutSkeleton>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-blue-600 transition-colors">
            Sistem HR
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Portal Utama</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </span>
        </nav>

        {/* Page Header matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>MODUL REKRUTMEN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Kelola Rekrutmen
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Daftar lowongan kerja aktif dan status lamaran pelamar.
            </p>
          </div>

          {/* Action Buttons Top Right matching Image 1 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleExportXLSX}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-all active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Rekap</span>
            </button>

            <Link
              href="/admin/recruitment/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-sm shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Buka Lowongan Baru</span>
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards matching Image 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Lowongan Dibuka */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Lowongan Dibuka</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">4</span>
                <span className="text-xs font-semibold text-slate-600">Posisi</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Semua berstatus aktif</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>

          {/* Card 2: Total Berkas Masuk */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Berkas Masuk</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">28</span>
                <span className="text-xs font-semibold text-slate-600">Kandidat</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+6 pelamar hari ini</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>

          {/* Card 3: Menunggu Tindakan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Menunggu Tindakan</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">11</span>
                <span className="text-xs font-semibold text-slate-600">Berkas</span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-slate-400">
                Perlu screening awal HR
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
        </div>

        {/* Tab Navigation matching Image 1 */}
        <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto no-scrollbar pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Lowongan Aktif</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'jobs'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              4
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pipeline ATS (Kartu)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'pipeline'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              18
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('onboarding')}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'onboarding'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Karyawan Baru & Onboarding</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'onboarding'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              14
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('talent_pool')}
            className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'talent_pool'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Bank Talenta & Arsip</span>
          </button>
        </div>

        {/* Tab 0 Content: Lowongan Aktif (Image 1 Table View with Image 2 Cards Toggle Option) */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Control Bar: View Switcher (Tabel Image 1 vs Kartu Image 2) & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* View Mode Toggle Button */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start">
                <button
                  type="button"
                  onClick={() => setJobViewMode('table')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    jobViewMode === 'table'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Tampilan Tabel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJobViewMode('cards')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    jobViewMode === 'cards'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Tampilan Kartu (Image 2)</span>
                </button>
              </div>

              {/* Search Bar matching Image 1 */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  placeholder="Cari posisi pekerjaan..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            {/* If View Mode is 'table', Render Image 1 Table & Recent Applicants */}
            {jobViewMode === 'table' ? (
              <div className="space-y-8">
                {/* Master Table Lowongan Aktif matching Image 1 */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-4 px-6">Posisi Lowongan</th>
                          <th className="py-4 px-6">Departemen</th>
                          <th className="py-4 px-6">Tanggal Buka</th>
                          <th className="py-4 px-6">Batas Lamaran</th>
                          <th className="py-4 px-6 text-center">Jumlah Pelamar</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredTableVacancies.map((vac) => (
                          <tr key={vac.id} className="hover:bg-slate-50/70 transition-colors group">
                            {/* Posisi Lowongan */}
                            <td className="py-4 px-6">
                              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {vac.title}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {vac.type} • {vac.location}
                              </p>
                            </td>

                            {/* Departemen Badge */}
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${vac.deptColor}`}
                              >
                                {vac.departmentBadge}
                              </span>
                            </td>

                            {/* Tanggal Buka */}
                            <td className="py-4 px-6 text-slate-600">
                              {vac.openDate}
                            </td>

                            {/* Batas Lamaran */}
                            <td className="py-4 px-6 text-slate-600">
                              {vac.deadlineDate}
                            </td>

                            {/* Jumlah Pelamar */}
                            <td className="py-4 px-6 text-center">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200/60">
                                {vac.applicantCount}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{vac.status}</span>
                              </span>
                            </td>

                            {/* Aksi: Detail | Tutup */}
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-2 text-xs font-semibold">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchJob = jobPostings.find((j) => j.title.includes(vac.title.split(' ')[0])) || jobPostings[0];
                                    setSelectedJobForReview(matchJob);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                                >
                                  Detail
                                </button>
                                <span className="text-slate-300 font-light select-none">|</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTableVacancies((prev) =>
                                      prev.map((item) =>
                                        item.id === vac.id
                                          ? { ...item, status: item.status === 'Aktif' ? 'Tutup' : 'Aktif' }
                                          : item
                                      )
                                    );
                                    showToast(`Status lowongan "${vac.title}" berhasil diperbarui!`);
                                  }}
                                  className="text-rose-600 hover:text-rose-800 transition-colors hover:underline"
                                >
                                  Tutup
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer matching Image 1 */}
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <p>Menampilkan <strong>{filteredTableVacancies.length}</strong> lowongan pekerjaan aktif</p>
                    <div className="flex items-center gap-1">
                      <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs">
                        1
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section Pelamar Terbaru Masuk matching Image 1 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          Pelamar Terbaru Masuk
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Update kandidat yang baru saja mengirimkan berkas lamaran.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('pipeline')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <span>Lihat Semua Pelamar (28)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 3 Horizontal Candidate Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {initialRecentApplicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        onClick={() => setActiveTab('pipeline')}
                        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${applicant.avatarBg}`}
                          >
                            {applicant.initials}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {applicant.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {applicant.role}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{applicant.timeAgo}</span>
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${applicant.badgeColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${applicant.dotColor}`} />
                            <span>{applicant.statusBadge}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* If View Mode is 'cards', Render the Image 2 Card View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Main Column: Job Cards (Image 2 - 8 cols on desktop) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Search & Filter Controls matching Image 2 */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama lowongan atau ID..."
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                      />
                    </div>

                    <div className="relative min-w-[170px]">
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                      >
                        <option value="Semua Departemen">Semua Departemen</option>
                        <option value="Divisi Teknologi">Divisi Teknologi</option>
                        <option value="Divisi Keuangan & Pajak">Divisi Keuangan & Pajak</option>
                        <option value="Divisi SDM & Operasional">Divisi SDM & Operasional</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative min-w-[140px]">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                      >
                        <option value="Aktif">Status: Aktif</option>
                        <option value="Semua">Semua Status</option>
                        <option value="Draft">Status: Draft</option>
                        <option value="Ditutup">Status: Ditutup</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 4 Job Listings Cards matching Image 2 */}
                  <div className="space-y-3.5">
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {job.iconType === 'terminal' && <Terminal className="w-5 h-5" />}
                            {job.iconType === 'code' && <Code2 className="w-5 h-5" />}
                            {job.iconType === 'finance' && <FileSpreadsheet className="w-5 h-5" />}
                            {job.iconType === 'people' && <Users className="w-5 h-5" />}
                            {job.iconType === 'mobile' && <Smartphone className="w-5 h-5" />}
                          </div>

                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                                {job.title}
                              </h3>
                              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full">
                                {job.priority}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
                              <span>{job.department}</span>
                              <span className="text-slate-300">•</span>
                              <span>Karyawan Tetap ({job.contractType})</span>
                              <span className="text-slate-300">•</span>
                              <span>Target Penutupan: {job.targetDate}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1 font-semibold">
                              <span>{job.totalApplicants} Total Pelamar</span>
                              <span className="text-slate-300">•</span>
                              <span>{job.passedScreening} Lolos Screening</span>
                              <span className="text-slate-300">•</span>
                              <span>{job.userInterview} Tahap Interview User</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-center">
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {job.applicantsSample.map((cand, idx) => (
                              <div
                                key={idx}
                                title={cand.name}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-2xs ${cand.bg}`}
                              >
                                {cand.initials}
                              </div>
                            ))}
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                              +{job.totalApplicants - job.applicantsSample.length}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedJobForReview(job)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                          >
                            Tinjau Pelamar
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedJobForReview(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Onboarding Batch April Card (4 cols on desktop) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <CalendarCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            Onboarding Batch April
                          </h3>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-lg">
                        1 Apr 2025
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <div className="py-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              FM
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                Farhan Maulana
                              </p>
                              <p className="text-[11px] text-slate-500">Frontend Dev • IT</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">80%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Laptop & Email: Siap | Verifikasi BPJS: Pending
                        </p>
                      </div>

                      <div className="py-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                              SR
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                Siti Rahmania, S.E.
                              </p>
                              <p className="text-[11px] text-slate-500">Tax Officer • Finance</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">60%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Data Mandiri: Selesai | Orientasi HR: Belum
                        </p>
                      </div>

                      <div className="py-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                              BA
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 leading-tight">
                                Bima Arya Prasetyo
                              </p>
                              <p className="text-[11px] text-slate-500">Mobile Eng • Tech</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">100%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Semua modul siap</span>
                          <span className="text-emerald-600 font-semibold">Siap Hari Pertama</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveTab('onboarding')}
                        className="w-full py-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Lihat Semua 14 Onboarding</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Tab 1 Content: Pipeline Rekrutmen (ATS) */}
        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Main Column: Pipeline Stages & Job Cards (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tahapan Pipeline Keseluruhan Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-800">
                      Tahapan Pipeline Keseluruhan
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    253 Kandidat Aktif Berproses
                  </span>
                </div>

                {/* 5 Funnel Stages Horizontal Bar */}
                <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                  {pipelineStats.map((stage) => {
                    const isSelected = selectedPipelineStage === stage.id;
                    return (
                      <div
                        key={stage.id}
                        onClick={() =>
                          setSelectedPipelineStage(isSelected ? null : stage.id)
                        }
                        className={`rounded-xl p-2 sm:p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                            : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60'
                        }`}
                      >
                        <div>
                          <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate" title={stage.name}>
                            {stage.name}
                          </p>
                          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1 sm:gap-1.5">
                            <span className="text-base sm:text-xl font-bold text-slate-900">
                              {stage.count}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                              {stage.label}
                            </span>
                          </div>
                        </div>
                        {/* Blue Accent Underline bar */}
                        <div className="mt-3 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full w-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama lowongan atau ID..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Departemen Dropdown */}
                <div className="relative min-w-[170px]">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Semua Departemen">Semua Departemen</option>
                    <option value="Divisi Teknologi">Divisi Teknologi</option>
                    <option value="Divisi Keuangan & Pajak">Divisi Keuangan & Pajak</option>
                    <option value="Divisi SDM & Operasional">Divisi SDM & Operasional</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Status Dropdown */}
                <div className="relative min-w-[140px]">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Aktif">Status: Aktif</option>
                    <option value="Semua">Semua Status</option>
                    <option value="Draft">Status: Draft</option>
                    <option value="Ditutup">Status: Ditutup</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Job Listings List */}
              <div className="space-y-3.5">
                {filteredJobs.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Tidak ada lowongan ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ganti kata kunci pencarian atau sesuaikan filter departemen.
                    </p>
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left Job Info */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {job.iconType === 'terminal' && <Terminal className="w-5 h-5" />}
                          {job.iconType === 'code' && <Code2 className="w-5 h-5" />}
                          {job.iconType === 'finance' && <FileSpreadsheet className="w-5 h-5" />}
                          {job.iconType === 'people' && <Users className="w-5 h-5" />}
                          {job.iconType === 'mobile' && <Smartphone className="w-5 h-5" />}
                        </div>

                        {/* Text details */}
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                              {job.title}
                            </h3>
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full">
                              {job.priority}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
                            <span>{job.department}</span>
                            <span className="text-slate-300">•</span>
                            <span>Karyawan Tetap ({job.contractType})</span>
                            <span className="text-slate-300">•</span>
                            <span>Target Penutupan: {job.targetDate}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1 font-semibold">
                            <span>{job.totalApplicants} Total Pelamar</span>
                            <span className="text-slate-300">•</span>
                            <span>{job.passedScreening} Lolos Screening</span>
                            <span className="text-slate-300">•</span>
                            <span>{job.userInterview} Tahap Interview User</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action & Avatars Stack */}
                      <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-center">
                        {/* Candidate Avatar Stack */}
                        <div className="flex items-center -space-x-2 overflow-hidden">
                          {job.applicantsSample.map((cand, idx) => (
                            <div
                              key={idx}
                              title={cand.name}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-xs ${cand.bg}`}
                            >
                              {cand.initials}
                            </div>
                          ))}
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                            +{job.totalApplicants - job.applicantsSample.length}
                          </div>
                        </div>

                        {/* Review Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedJobForReview(job)}
                          className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95"
                        >
                          Tinjau Pelamar
                        </button>

                        {/* 3-dots Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDropdownJobId(
                                activeDropdownJobId === job.id ? null : job.id
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdownJobId === job.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs">
                              <button
                                onClick={() => {
                                  setActiveDropdownJobId(null);
                                  showToast('Tautan lowongan disalin ke clipboard!');
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                              >
                                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                                Salin Tautan Lowongan
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdownJobId(null);
                                  setSelectedJobForReview(job);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                Edit Detail Posisi
                              </button>
                              <div className="border-t border-slate-100 my-1"></div>
                              <button
                                onClick={() => {
                                  setActiveDropdownJobId(null);
                                  setJobPostings(
                                    jobPostings.map((j) =>
                                      j.id === job.id ? { ...j, status: 'Ditutup' } : j
                                    )
                                  );
                                  showToast('Lowongan berhasil ditutup');
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                Tutup Lowongan
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Onboarding Batch April Card (4 cols on desktop) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        Onboarding Batch April
                      </h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-lg">
                    1 Apr 2025
                  </span>
                </div>

                {/* Candidate Onboarding List Items */}
                <div className="divide-y divide-slate-100">
                  {/* Farhan Maulana */}
                  <div className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          FM
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            Farhan Maulana
                          </p>
                          <p className="text-[11px] text-slate-500">Frontend Dev • IT</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600">80%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Laptop & Email: Siap | Verifikasi BPJS: Pending
                    </p>
                  </div>

                  {/* Siti Rahmania, S.E. */}
                  <div className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                          SR
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            Siti Rahmania, S.E.
                          </p>
                          <p className="text-[11px] text-slate-500">Tax Officer • Finance</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600">60%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Data Mandiri: Selesai | Orientasi HR: Belum
                    </p>
                  </div>

                  {/* Bima Arya Prasetyo */}
                  <div className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                          BA
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            Bima Arya Prasetyo
                          </p>
                          <p className="text-[11px] text-slate-500">Mobile Eng • Tech</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600">100%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Semua modul siap</span>
                      <span className="text-emerald-600 font-semibold">Siap Hari Pertama</span>
                    </div>
                  </div>
                </div>

                {/* Footer Switch Tab Action */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('onboarding')}
                    className="w-full py-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Lihat Semua 14 Onboarding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Karyawan Baru & Onboarding Detail Workspace */}
        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Manajemen Checklist Onboarding Karyawan Baru
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pantau kesiapan fasilitas kerja, dokumen legal, orientasi pengenalan budaya, serta
                  verifikasi BPJS sebelum hari pertama masuk.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOnboardingTemplateModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Atur Standar Checklist</span>
                </button>
              </div>
            </div>

            {/* List of Onboarding Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {onboardingList.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${emp.avatarBg}`}
                      >
                        {emp.initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {emp.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {emp.role} • {emp.department}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        emp.progress === 100
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {emp.progress}%
                    </span>
                  </div>

                  {/* Batch & Start Date Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl font-medium">
                    <span>{emp.batch}</span>
                    <span className="font-semibold text-slate-700">Mulai: {emp.startDate}</span>
                  </div>

                  {/* Checklist Items Interactive */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Checklist Tugas
                    </p>
                    {emp.checklists.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(emp.id, item.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                          item.completed
                            ? 'bg-emerald-50/60 border-emerald-200/70 text-emerald-800'
                            : 'bg-slate-50/60 border-slate-200/70 text-slate-600 hover:bg-slate-100/70'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            item.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {item.completed && <Check className="w-3 h-3" />}
                        </div>
                        <span className={`flex-1 ${item.completed ? 'line-through opacity-80' : ''}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() =>
                        showToast(`Notifikasi onboarding dikirim ke email ${emp.name}`)
                      }
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Kirim Reminder
                    </button>
                    {emp.progress === 100 && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Siap Masuk
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3 Content: Bank Talenta & Arsip */}
        {activeTab === 'talent_pool' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bank Talenta & Arsip Pelamar Berkualitas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Database talenta pre-screened, silver medalists dari seleksi sebelumnya, siap
                  diundang saat posisi baru dibuka.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  Total Tersimpan: {talentPool.length} Profil
                </span>
              </div>
            </div>

            {/* Talent cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {talentPool.map((talent) => (
                <div
                  key={talent.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{talent.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {talent.role} • {talent.department}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        ★ {talent.rating} • {talent.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Pengalaman: </span>
                      {talent.lastExperience}
                    </p>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {talent.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Diarsipkan: {talent.archivedDate}
                    </span>
                    <button
                      onClick={() =>
                        showToast(`Undangan wawancara berhasil dikirimkan ke ${talent.name}!`)
                      }
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Undang ke Lowongan Baru
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ATS Candidate Pipeline Review Drawer / Modal */}
      {selectedJobForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedJobForReview.title}
                    </h3>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {selectedJobForReview.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedJobForReview.department} • {selectedJobForReview.salaryRange} • Target:{' '}
                    {selectedJobForReview.targetDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJobForReview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Kanban ATS Stages */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daftar Kandidat Terpilih ({candidates.length} Berkas Aktif)
                </p>
                <span className="text-xs text-slate-500">
                  Klik tombol pada kandidat untuk memindahkan ke tahap berikutnya
                </span>
              </div>

              {/* Kanban Column grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs space-y-3 hover:border-blue-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${cand.avatarBg}`}
                          >
                            {cand.initials}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{cand.name}</h4>
                            <p className="text-[11px] text-slate-500">{cand.currentRole}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {cand.matchScore}% Match
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                        <p>
                          <span className="text-slate-400 font-medium">Pendidikan:</span>{' '}
                          {cand.education}
                        </p>
                        <p>
                          <span className="text-slate-400 font-medium">Pengalaman:</span>{' '}
                          {cand.experienceYears} Tahun
                        </p>
                        <p>
                          <span className="text-slate-400 font-medium">Kontak:</span> {cand.phone}
                        </p>
                      </div>

                      {/* Stage Badge */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Tahap:
                        </span>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {cand.stage}
                        </span>
                      </div>

                      {cand.notes && (
                        <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          "{cand.notes}"
                        </p>
                      )}
                    </div>

                    {/* Stage Transition Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          const stages: Candidate['stage'][] = [
                            'Screening CV',
                            'Tes & Asesmen',
                            'Wawancara HR/User',
                            'Offering & MCU',
                            'Siap Onboard',
                          ];
                          const currIdx = stages.indexOf(cand.stage);
                          if (currIdx < stages.length - 1) {
                            handleAdvanceCandidate(cand.id, stages[currIdx + 1]);
                          } else {
                            showToast(`${cand.name} sudah berada di tahap akhir Siap Onboard!`);
                          }
                        }}
                        className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Loloskan Tahap</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setCandidates(candidates.filter((c) => c.id !== cand.id));
                          showToast(`${cand.name} dipindahkan ke Arsip Penolakan`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Tolak Kandidat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Data pipeline tersinkronisasi otomatis dengan portal pelamar karir.
              </span>
              <button
                type="button"
                onClick={() => setSelectedJobForReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Buka Lowongan Baru */}
      {isNewJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Buka Lowongan Pekerjaan Baru</h3>
                  <p className="text-xs text-slate-500">
                    Publikasikan posisi baru ke portal karir internal & eksternal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewJobModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateJob} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Judul Posisi Lowongan *
                </label>
                <input
                  type="text"
                  required
                  value={newJobForm.title}
                  onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                  placeholder="Contoh: Senior Backend Engineer (Node.js/Go)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Departemen
                  </label>
                  <select
                    value={newJobForm.department}
                    onChange={(e) => setNewJobForm({ ...newJobForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="Divisi Teknologi">Divisi Teknologi</option>
                    <option value="Divisi Keuangan & Pajak">Divisi Keuangan & Pajak</option>
                    <option value="Divisi SDM & Operasional">Divisi SDM & Operasional</option>
                    <option value="Divisi Bisnis & Pemasaran">Divisi Bisnis & Pemasaran</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status Kontrak
                  </label>
                  <select
                    value={newJobForm.contractType}
                    onChange={(e) =>
                      setNewJobForm({
                        ...newJobForm,
                        contractType: e.target.value as 'PKWTT' | 'PKWT' | 'Magang',
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="PKWTT">PKWTT (Tetap)</option>
                    <option value="PKWT">PKWT (Kontrak)</option>
                    <option value="Magang">Magang / Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={newJobForm.priority}
                    onChange={(e) =>
                      setNewJobForm({
                        ...newJobForm,
                        priority: e.target.value as 'Prioritas Tinggi' | 'Prioritas Sedang' | 'Prioritas Normal',
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="Prioritas Tinggi">Prioritas Tinggi (Urgent)</option>
                    <option value="Prioritas Sedang">Prioritas Sedang</option>
                    <option value="Prioritas Normal">Prioritas Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Tanggal Penutupan
                  </label>
                  <input
                    type="date"
                    value={newJobForm.targetDate}
                    onChange={(e) => setNewJobForm({ ...newJobForm, targetDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Gaji Min (IDR)
                  </label>
                  <input
                    type="number"
                    value={newJobForm.salaryMin}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salaryMin: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Gaji Max (IDR)
                  </label>
                  <input
                    type="number"
                    value={newJobForm.salaryMax}
                    onChange={(e) => setNewJobForm({ ...newJobForm, salaryMax: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lokasi Kerja
                </label>
                <input
                  type="text"
                  value={newJobForm.location}
                  onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                  placeholder="Contoh: Jakarta Selatan (Hybrid)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kualifikasi Singkat & Catatan HR
                </label>
                <textarea
                  rows={3}
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                  placeholder="Tuliskan skill teknis utama, pengalaman minimal, dan sertifikasi yang diutamakan..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Publikasikan Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Kelola Template Onboarding */}
      {isOnboardingTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Template Checklist Onboarding Karyawan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Standar tugas otomatis yang diberikan untuk setiap karyawan baru
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardingTemplateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kategori 1: IT & Sarana Kerja
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span>Pembuatan Email Perusahaan & Akun Slack</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">Wajib</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span>Penyiapan Laptop Kerja & Asset Tagging</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">Wajib</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span>Akses VPN & Repository Kode (IT/Tech)</span>
                    <span className="text-blue-600 font-semibold text-[11px]">Kondisional</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kategori 2: Administrasi & Legalitas
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span>Tanda Tangan Kontrak Kerja PKWT / PKWTT</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">Wajib</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span>Pendaftaran BPJS Ketenagakerjaan & Kesehatan</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">Wajib</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span>Input Nomor Rekening Payroll BCA</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">Wajib</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kategori 3: Orientasi & Budaya Perusahaan
                </h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span>Sesi Pengenalan Perusahaan oleh Tim HR</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">Wajib</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span>Pengenalan Mentor / Buddy Pendamping</span>
                    <span className="text-emerald-600 font-semibold text-[11px]">Wajib</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsOnboardingTemplateModalOpen(false);
                  showToast('Template checklist onboarding berhasil disimpan!');
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Simpan Konfigurasi Template
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutSkeleton>
  );
}
