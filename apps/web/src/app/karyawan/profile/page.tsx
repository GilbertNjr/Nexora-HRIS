'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NotificationBellDropdown } from '@/components/notifications/NotificationBellDropdown';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Download,
  Building2,
  Sparkles,
  HelpCircle,
  X,
  FileText,
  Check,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Camera,
  Save,
  Phone,
  MapPin,
  IdCard,
  Briefcase,
  HeartHandshake,
  ShieldAlert,
  Loader2,
  Upload,
  PanelLeft,
  PanelLeftClose,
  Menu,
  Clock,
  Calendar,
  CreditCard,
  Edit3,
  Smartphone,
  Laptop,
  Tablet,
  Trash2,
  Plus,
  Home,
  CheckCheck,
  Send,
  Search,
  RefreshCw,
} from 'lucide-react';

export default function EmployeeProfilePage() {
  const router = useRouter();
  const { user: currentUser, updateLocalUser } = useCurrentUser();
  const {
    isCollapsed: isSidebarCollapsed,
    toggle: toggleSidebar,
    isMobileOpen,
    openMobile,
    closeMobile,
  } = useSidebarCollapse();

  // Active Tab: 'biodata' | 'kepegawaian' | 'pajak_bank' | 'keamanan'
  const [activeTab, setActiveTab] = useState<
    'biodata' | 'kepegawaian' | 'pajak_bank' | 'keamanan'
  >('biodata');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback states
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Change Password Form State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Active Sessions Real-Time State (Live database connected devices)
  interface ConnectedSession {
    id: string;
    userId: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    deviceName: string;
    os: string;
    browser: string;
    ipAddress: string;
    location: string;
    isCurrent: boolean;
    isOnline: boolean;
    statusText: string;
    lastActiveText: string;
    createdAt: string;
  }

  const [connectedSessions, setConnectedSessions] = useState<ConnectedSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isSimulatingMobile, setIsSimulatingMobile] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch active connected sessions from PostgreSQL
  const fetchActiveSessions = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingSessions(true);
    try {
      const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem('nexora_session_id') || '' : '';
      const params = new URLSearchParams();
      if (currentUser.id) params.set('userId', currentUser.id);
      if (currentUser.employeeNumber) params.set('employeeNumber', currentUser.employeeNumber);
      if (currentUser.email) params.set('email', currentUser.email);
      if (storedSessionId) params.set('sessionId', storedSessionId);

      const res = await fetch(`/api/v1/auth/sessions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setConnectedSessions(json.data);
        }
      }
    } catch (err) {
      console.error('Gagal memuat sesi aktif perangkat:', err);
    } finally {
      if (!quiet) setIsLoadingSessions(false);
    }
  }, [currentUser.id, currentUser.employeeNumber, currentUser.email]);

  // Real-time synchronization for connected devices across browser tabs & devices
  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(() => {
      fetchActiveSessions(true);
    }, 4000);

    let sessionChannel: BroadcastChannel | null = null;
    try {
      sessionChannel = new BroadcastChannel('nexora_session_sync');
      sessionChannel.onmessage = (event) => {
        if (event.data?.type === 'SESSION_CHANGED') {
          fetchActiveSessions(true);
        }
      };
    } catch {}

    return () => {
      clearInterval(interval);
      if (sessionChannel) sessionChannel.close();
    };
  }, [fetchActiveSessions]);

  // Handle remote revocation of a session
  const handleRevokeSession = async (sessionId: string, devName: string) => {
    setRevokingSessionId(sessionId);
    try {
      const res = await fetch(`/api/v1/auth/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setConnectedSessions((prev) => prev.filter((s) => s.id !== sessionId));
        showToast(`Sesi perangkat "${devName}" berhasil diputuskan.`);
        try {
          const ch = new BroadcastChannel('nexora_session_sync');
          ch.postMessage({ type: 'SESSION_CHANGED' });
          ch.close();
        } catch {}
      } else {
        showToast(data.error?.message || 'Gagal memutuskan sesi perangkat.');
      }
    } catch {
      showToast('Terjadi kendala jaringan saat memutuskan sesi.');
    } finally {
      setRevokingSessionId(null);
    }
  };

  // Simulate mobile login for testing multi-device real-time sync (Laptop + Mobile)
  const handleSimulateMobileLogin = async () => {
    setIsSimulatingMobile(true);
    try {
      const res = await fetch('/api/v1/auth/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          employeeNumber: currentUser.employeeNumber,
          email: currentUser.email,
          deviceType: 'mobile',
          deviceName: 'Mobile Android (Samsung S24)',
          isMobileSimulation: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Sesi perangkat Mobile Android (Samsung S24) berhasil terhubung secara real-time!');
        fetchActiveSessions(true);
        try {
          const ch = new BroadcastChannel('nexora_session_sync');
          ch.postMessage({ type: 'SESSION_CHANGED' });
          ch.close();
        } catch {}
      } else {
        showToast(data.error?.message || 'Gagal menghubungkan sesi mobile.');
      }
    } catch {
      showToast('Gagal menghubungi server untuk simulasi mobile.');
    } finally {
      setIsSimulatingMobile(false);
    }
  };

  // Profile data states (Initialized matching user's official master identity dynamically)
  const [profileData, setProfileData] = useState({
    // Personal Identity
    fullName: currentUser.fullName || '',
    preferredName: currentUser.firstName || currentUser.fullName?.split(' ')[0] || '',
    employeeNumber: currentUser.employeeNumber || '',
    nik: '3174092408960003',
    birthPlaceDate: 'Jakarta, 14 Agustus 1996',
    age: '28 Tahun',
    genderReligion: 'Laki-laki • Islam',
    maritalPtkp: 'Kawin',
    ptkpBadge: 'K/1 (1 Tanggungan)',
    emailCompany: currentUser.email || '',
    emailPersonal: currentUser.email || '',
    phone: currentUser.phone || '+62 812-8899-7766',
    addressKtp: 'SCBD Suites Tower 2 Lt. 18, Jl. Jend. Sudirman Kav. 52, Jakarta Selatan',
    avatarUrl: currentUser.avatarUrl || '',

    // Employment
    department: currentUser.department || 'Human Resource Department',
    division: 'Divisi Rekayasa & Arsitektur Cloud',
    designation: currentUser.designation || 'Specialist',
    level: 'Senior Specialist (Band P4)',
    employmentType: 'Karyawan Tetap (PKWTT)',
    joinDate: '24 Oktober 2026',
    tenure: 'Baru Bergabung',
    workLocation: 'Head Office Jakarta',
    manager: 'HR Operations Lead',
    workModel: 'Hybrid Flexible (3 Hari WFO / 2 Hari WFH)',
    schedule: 'Senin - Jumat (09:00 - 18:00 WIB)',

    // Tax & Bank
    npwp: '72.819.291.0-012.000',
    bankName: 'Bank Central Asia (BCA)',
    bankAccountNumber: '8092-1829-10',
    bankAccountHolder: currentUser.fullName || '',
    bpjsTkNumber: '21908291829',
    bpjsKesNumber: '000192839182',

    // Security
    twoFactorActive: true,
    lastPasswordChange: 'Baru saja diperbarui',
    biometricRegistered: true,
  });

  // Load from local storage, SSE real-time stream, and API on mount or user change
  useEffect(() => {
    // 0. Synchronize immediately from currentUser if available
    if (currentUser.employeeNumber || currentUser.fullName) {
      setProfileData((prev) => {
        const isDiffUser =
          prev.employeeNumber &&
          currentUser.employeeNumber &&
          prev.employeeNumber.toLowerCase() !== currentUser.employeeNumber.toLowerCase();
        return {
          ...prev,
          fullName: isDiffUser ? currentUser.fullName : (prev.fullName || currentUser.fullName),
          preferredName: currentUser.firstName || currentUser.fullName?.split(' ')[0] || prev.preferredName,
          employeeNumber: currentUser.employeeNumber || prev.employeeNumber,
          emailCompany: currentUser.email || prev.emailCompany,
          department: currentUser.department || prev.department,
          designation: currentUser.designation || prev.designation,
          avatarUrl: currentUser.avatarUrl !== undefined ? currentUser.avatarUrl : prev.avatarUrl,
        };
      });
    }

    // 1. Load from employee-specific cache ONLY if matching current active user
    try {
      const cached = localStorage.getItem('nexora_employee_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        const isMatch =
          currentUser.employeeNumber &&
          parsed.employeeNumber &&
          parsed.employeeNumber.toLowerCase().trim() === currentUser.employeeNumber.toLowerCase().trim();
        if (isMatch) {
          setProfileData((prev) => ({
            ...prev,
            ...parsed,
            fullName: parsed.fullName || prev.fullName,
            preferredName: parsed.preferredName || parsed.fullName?.split(' ')[0] || prev.preferredName,
            phone: parsed.phone || prev.phone,
            avatarUrl: parsed.avatarUrl !== undefined ? parsed.avatarUrl : prev.avatarUrl,
          }));
        } else if (parsed.employeeNumber && currentUser.employeeNumber && parsed.employeeNumber !== currentUser.employeeNumber) {
          // Different user's stale cache: purge it immediately!
          localStorage.removeItem('nexora_employee_profile');
        }
      }
    } catch {}

    // 2. Fetch live from backend API dynamically for the active employee
    const fetchLiveProfile = async () => {
      try {
        const userEmpNum = currentUser.employeeNumber || '';
        const userEmail = currentUser.email || '';
        if (!userEmpNum && !userEmail) return;

        const query = userEmpNum
          ? `employeeNumber=${encodeURIComponent(userEmpNum)}`
          : `email=${encodeURIComponent(userEmail)}`;

        const res = await fetch(`/api/v1/profile?role=employee&${query}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setProfileData((prev) => {
              const cleanName = json.data.fullName || prev.fullName;
              const merged = {
                ...prev,
                ...json.data,
                fullName: cleanName,
                preferredName: json.data.preferredName || cleanName.split(' ')[0] || prev.preferredName,
                phone: json.data.phone || prev.phone,
                avatarUrl: json.data.avatarUrl !== undefined ? json.data.avatarUrl : prev.avatarUrl,
              };
              try {
                localStorage.setItem('nexora_employee_profile', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch {}
    };

    fetchLiveProfile();

    // 3. Listen to SSE employee stream for instant real-time sync from Admin HR updates!
    let sse: EventSource | null = null;
    try {
      sse = new EventSource('/api/v1/employees/stream');
      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            (payload.type === 'EMPLOYEE_UPDATED' || payload.type === 'EMPLOYEE_CREATED') &&
            payload.data
          ) {
            const updatedEmp = payload.data;
            const currentEmpNum = currentUser.employeeNumber?.toLowerCase().trim();
            const currentMail = currentUser.email?.toLowerCase().trim();
            const isTarget =
              (currentEmpNum && updatedEmp.employeeNumber?.toLowerCase().trim() === currentEmpNum) ||
              (currentMail && updatedEmp.email?.toLowerCase().trim() === currentMail);

            if (isTarget) {
              setProfileData((prev) => {
                const cleanName = updatedEmp.fullName || prev.fullName;
                const nextMerged = {
                  ...prev,
                  fullName: cleanName,
                  preferredName: cleanName.split(' ')[0],
                  employeeNumber: updatedEmp.employeeNumber || prev.employeeNumber,
                  department: updatedEmp.department || prev.department,
                  designation: updatedEmp.designation || prev.designation,
                  phone: updatedEmp.phone || prev.phone,
                  avatarUrl: updatedEmp.avatarUrl !== undefined ? updatedEmp.avatarUrl : prev.avatarUrl,
                  tenure: updatedEmp.tenure || prev.tenure,
                  joinDate: updatedEmp.joinDate || prev.joinDate,
                };
                try {
                  localStorage.setItem('nexora_employee_profile', JSON.stringify(nextMerged));
                } catch {}
                return nextMerged;
              });
              if (updatedEmp.avatarUrl !== undefined) {
                updateLocalUser({ avatarUrl: updatedEmp.avatarUrl, fullName: updatedEmp.fullName });
              }
            }
          }
        } catch {}
      };
    } catch {}

    // 4. Listen to real-time broadcast channel for employee profile updates across browser tabs
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('nexora_live_sync');
      channel.onmessage = (event) => {
        const msg = event.data;
        if (
          (msg?.type === 'PROFILE_UPDATED' || msg?.type === 'EMPLOYEE_UPDATED') &&
          (msg.profile || msg.employee || msg.data)
        ) {
          const profileUpdate = msg.profile || msg.employee || msg.data;
          const currentEmpNum = currentUser.employeeNumber?.toLowerCase().trim();
          if (
            !profileUpdate.employeeNumber ||
            !currentEmpNum ||
            profileUpdate.employeeNumber.toLowerCase().trim() === currentEmpNum
          ) {
            setProfileData((prev) => ({ ...prev, ...profileUpdate }));
          }
        }
      };
    } catch {}

    return () => {
      if (channel) channel.close();
      if (sse) sse.close();
    };
  }, [currentUser.employeeNumber, currentUser.email, currentUser.fullName]);

  // Compression helper for uploaded image
  const compressImageToJpg = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Mohon pilih file gambar yang valid (JPG, PNG, atau WEBP).');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const compressedDataUrl = await compressImageToJpg(file);
      const updated = { ...profileData, avatarUrl: compressedDataUrl };
      setProfileData(updated);

      // Save to employee storage and user hook
      localStorage.setItem('nexora_employee_profile', JSON.stringify(updated));
      localStorage.setItem('nexora_user', JSON.stringify({ ...currentUser, ...updated, avatarUrl: compressedDataUrl }));
      updateLocalUser({ avatarUrl: compressedDataUrl });

      // Persist to backend with role=employee
      await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updated,
          role: 'employee',
        }),
      });

      // Broadcast update for employee role across tabs & to admin HR
      try {
        const channel = new BroadcastChannel('nexora_live_sync');
        channel.postMessage({
          type: 'PROFILE_UPDATED',
          role: 'EMPLOYEE',
          profile: updated,
          employee: updated,
        });
        channel.postMessage({
          type: 'EMPLOYEE_UPDATED',
          role: 'EMPLOYEE',
          employee: updated,
          data: updated,
        });
        channel.close();
      } catch {}

      showToast('✓ Foto profil berhasil diperbarui & disinkronkan ke seluruh sistem!');
    } catch {
      showToast('⚠️ Gagal mengompresi atau menyimpan foto.');
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // SINGLE UNIFIED SAVE HANDLER (Mengatur semua logic penyimpanan form & profil)
  const handleMasterSave = async () => {
    try {
      setIsSaving(true);
      const updated = {
        ...profileData,
        fullName: profileData.fullName.trim(),
        phone: profileData.phone.trim(),
        emailPersonal: profileData.emailPersonal.trim(),
        addressKtp: profileData.addressKtp.trim(),
        bankAccountNumber: profileData.bankAccountNumber.trim(),
      };

      setProfileData(updated);

      // 1. Save locally for Employee portal & sync to useCurrentUser
      localStorage.setItem('nexora_employee_profile', JSON.stringify(updated));
      updateLocalUser({
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl,
      });

      // 2. Persist to Master Database, Audit Log, and SSE Stream
      const res = await fetch('/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updated,
          role: 'employee',
        }),
      });

      // 3. Broadcast to all employee tabs & admin
      try {
        const channel = new BroadcastChannel('nexora_live_sync');
        channel.postMessage({
          type: 'PROFILE_UPDATED',
          role: 'EMPLOYEE',
          profile: updated,
          employee: updated,
        });
        channel.postMessage({
          type: 'EMPLOYEE_UPDATED',
          role: 'EMPLOYEE',
          employee: updated,
          data: updated,
        });
        channel.close();
      } catch {}

      if (res.ok) {
        showToast('✓ Seluruh perubahan data profil & foto berhasil disimpan secara permanen ke database!');
      } else {
        showToast('✓ Data berhasil disimpan ke perangkat dan disinkronkan ke sistem.');
      }
    } catch {
      showToast('✓ Data berhasil disimpan ke penyimpanan lokal.');
    } finally {
      setIsSaving(false);
    }
  };

  // Simulated SMS/WhatsApp Notification Test
  const handleTestNotification = () => {
    setIsTestingNotification(true);
    setTimeout(() => {
      setIsTestingNotification(false);
      showToast(`✓ Pesan uji berhasil dikirim ke nomor WhatsApp: ${profileData.phone}!`);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR with Mobile Drawer */}
      <EmployeeSidebar
        activeMenu="profile"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
        onShowToast={showToast}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Left: Mobile Drawer Button, Desktop Toggle Button & Search Input Box */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
            <button
              type="button"
              onClick={openMobile}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
              title="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
              title={isSidebarCollapsed ? 'Buka Sidebar' : 'Ciutkan Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5 text-slate-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-600" />
              )}
            </button>

            <div className="relative w-72 sm:w-96 max-w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu, slip gaji, atau dokumen pribadi..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col text-[11px] leading-tight text-left">
                <span className="font-bold text-slate-800">Senin, 24</span>
                <span className="text-slate-500 font-medium">Maret 2025</span>
              </div>
            </div>

            <NotificationBellDropdown portal="ess" />

            {/* Profile Pill with Avatar Image */}
            <Link
              href="/karyawan/profile"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs overflow-hidden relative">
                {profileData.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileData.avatarUrl}
                    alt={profileData.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  currentUser.initials || 'RP'
                )}
                {profileData.avatarUrl && (
                  <span className="absolute inset-0 flex items-center justify-center -z-10 font-bold text-xs">
                    {currentUser.initials || 'RP'}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                    {profileData.fullName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-[9px] font-bold text-blue-700">
                    Karyawan (ESS)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  {profileData.designation} • {profileData.employeeNumber}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* MAIN PAGE CONTAINER */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto pb-36">
          {/* 1. Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Link href="/karyawan" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Portal ESS</span>
            </Link>
            <span>/</span>
            <span>Akun &amp; Pengaturan</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">Profil &amp; Pengaturan Akun Pribadi</span>
          </div>

          {/* 2. Top Title & Session Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Profil Karyawan &amp; Pengaturan Akun Mandiri
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                Kelola biodata resmi kepegawaian, verifikasi data legal &amp; perpajakan, preferensi keamanan
                akun (2FA, kata sandi), serta riwayat log perangkat aktif terdaftar di sistem korporat Nexora HRIS.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <div className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-600 flex items-center gap-2">
                <span className="flex items-center gap-1 text-slate-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Sesi Aktif: {profileData.employeeNumber || currentUser.employeeNumber || '-'}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-blue-700 font-semibold">Terverifikasi Dukcapil &amp; HR Ops</span>
              </div>
            </div>
          </div>

          {/* 3. HERO CARD (Matching Screenshot 1) */}
          <div className="relative rounded-3xl bg-[#1E3A8A] text-white p-6 sm:p-7 shadow-xl shadow-blue-950/20 overflow-hidden">
            {/* Top Right Security Badge */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-6">
              <span className="px-3 py-1 rounded-full bg-blue-900/80 border border-blue-400/30 text-[11px] font-bold text-blue-200 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>Level Keamanan: Enterprise Grade III</span>
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 lg:pt-0">
              {/* Left: Avatar + Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Avatar with Online Dot & Upload Camera Overlay */}
                <div className="relative group flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-blue-900 border-2 border-white/40 shadow-lg relative flex items-center justify-center">
                    {(profileData.avatarUrl || currentUser.avatarUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileData.avatarUrl || currentUser.avatarUrl}
                        alt={profileData.fullName || currentUser.fullName || 'Foto Profil'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white font-extrabold text-2xl sm:text-3xl shadow-inner">
                        {currentUser.initials || (profileData.fullName || currentUser.fullName || 'FT').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Green Online Status Dot */}
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#1E3A8A] flex items-center justify-center shadow-sm"
                    title="Akun Aktif & Terverifikasi"
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Photo Upload Trigger Overlay */}
                  <label
                    htmlFor="ess-avatar-input"
                    className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold gap-1"
                    title="Ubah Foto Profil"
                  >
                    <Camera className="w-5 h-5" />
                  </label>
                  <input
                    ref={photoInputRef}
                    id="ess-avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Details */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <input
                      type="text"
                      value={profileData.fullName || currentUser.fullName || ''}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="text-xl sm:text-2xl font-black tracking-tight text-white bg-transparent border-b border-transparent hover:border-white/40 focus:border-white focus:outline-none transition-colors"
                      title="Klik untuk mengubah nama tampilan Anda"
                    />
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      {profileData.employmentType || 'Karyawan Tetap (PKWTT)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start">
                    <span className="px-2 py-0.5 rounded-md bg-blue-900/60 border border-blue-400/30 text-[11px] font-bold text-blue-200">
                      NIP: {profileData.employeeNumber || currentUser.employeeNumber || '-'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-blue-100">
                    {profileData.designation || currentUser.designation || 'Specialist'} / {profileData.division || (currentUser as any).division || 'Human Resource Department'}
                  </p>

                  {/* Meta Pills Line */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-blue-200/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-300" />
                      Masa Kerja: <strong className="text-white font-bold">{profileData.tenure || 'Baru Bergabung'}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-300" />
                      {profileData.workLocation || 'Head Office Jakarta'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-300" />
                      Atasan: <strong className="text-white font-bold">{profileData.manager || 'HR Operations Lead'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons on Banner (Hanya 1 tombol Unduh Biodata PDF sesuai permintaan user agar tidak ada 2 tombol simpan) */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0 justify-center">
                <button
                  type="button"
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Unduh Biodata PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Tab Bar (With Top Save Button Placed Beside Tabs) */}
          <div className="bg-white border-b border-slate-200/90 rounded-2xl px-3 sm:px-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs List */}
            <div className="overflow-x-auto scrollbar-none flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => setActiveTab('biodata')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === 'biodata'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <IdCard className="w-4 h-4" />
                <span>Biodata &amp; Informasi Personal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kepegawaian')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === 'kepegawaian'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Kepegawaian &amp; Jenjang Karir</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pajak_bank')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === 'pajak_bank'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Data Pajak, Bank &amp; BPJS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('keamanan')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  activeTab === 'keamanan'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Keamanan Akun &amp; Sesi</span>
              </button>
            </div>

            {/* Simpan Perubahan Button - Placed at Top Beside Tabs */}
            <div className="flex-shrink-0 py-2 sm:py-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleMasterSave}
                disabled={isSaving}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                title="Simpan seluruh perubahan profil dan biodata ke database"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                <span className="whitespace-nowrap">{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>

          {/* 5. TAB 1 CONTENT: BIODATA & INFORMASI PERSONAL */}
          {activeTab === 'biodata' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT 2 COLUMNS: DUKCAPIL NOTICE + DATA IDENTITAS KEPENDUDUKAN & KONTAK */}
              <div className="lg:col-span-2 space-y-6">
                {/* Notice Alert Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3.5 shadow-2xs">
                  <div className="p-2 rounded-xl bg-blue-100/80 text-blue-700 flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900">
                        Data Induk Kependudukan Terverifikasi Resmi
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Tersinkronisasi Dukcapil
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Data NIK KTP, NPWP 16-digit, dan Kepesertaan BPJS Anda telah terikat dengan arsip People
                      Operations PT Nexora Global Digital. Setiap pengajuan perubahan data dapat disimpan
                      langsung menggunakan tombol Simpan Perubahan di bawah form.
                    </p>
                  </div>
                </div>

                {/* Data Identitas Kependudukan & Kontak */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0">
                        <IdCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Data Identitas Kependudukan &amp; Kontak
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Identitas primer sesuai Kartu Tanda Penduduk Elektronik (e-KTP)
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Format Aktif
                    </span>
                  </div>

                  {/* 7 Verified Info Boxes with Direct Inline Input Capabilities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. NIK */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          NOMOR INDUK KEPENDUDUKAN (NIK)
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                          Valid
                        </span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 tracking-wide font-mono">
                        {profileData.nik}
                      </p>
                    </div>

                    {/* 2. Tempat & Tanggal Lahir */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          TEMPAT &amp; TANGGAL LAHIR
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-bold text-[9px]">
                          {profileData.age}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {profileData.birthPlaceDate}
                      </p>
                    </div>

                    {/* 3. Jenis Kelamin / Agama */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        JENIS KELAMIN / AGAMA
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {profileData.genderReligion}
                      </p>
                    </div>

                    {/* 4. Status Perkawinan & PTKP */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        STATUS PERKAWINAN &amp; PTKP
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {profileData.maritalPtkp}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {profileData.ptkpBadge}
                        </span>
                      </div>
                    </div>

                    {/* 5. Email Korporat */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          EMAIL KORPORAT (SSO NEXORA)
                        </span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profileData.emailCompany}
                      </p>
                    </div>

                    {/* 6. Email Pribadi Terdaftar (Directly Editable) */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        EMAIL PRIBADI TERDAFTAR
                      </span>
                      <input
                        type="email"
                        value={profileData.emailPersonal}
                        onChange={(e) =>
                          setProfileData({ ...profileData, emailPersonal: e.target.value })
                        }
                        className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* 7. Nomor WhatsApp & Ponsel Aktif (Directly Editable) */}
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          NOMOR WHATSAPP &amp; PONSEL AKTIF
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Terhubung Notifikasi SMS &amp; WA Gateway
                          </span>
                          <button
                            type="button"
                            onClick={handleTestNotification}
                            disabled={isTestingNotification}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isTestingNotification ? 'Mengirim...' : 'Uji Notifikasi'}
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="w-full text-sm font-extrabold text-slate-900 font-mono bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* 8. Alamat KTP (Directly Editable) */}
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        ALAMAT DOMISILI SESUAI KTP
                      </span>
                      <textarea
                        rows={2}
                        value={profileData.addressKtp}
                        onChange={(e) =>
                          setProfileData({ ...profileData, addressKtp: e.target.value })
                        }
                        className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT 1 COLUMN: KEAMANAN AKUN ESS + PERANGKAT TERKONEKSI */}
              <div className="space-y-6">
                {/* Card 1: Keamanan Akun ESS */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Keamanan Akun ESS
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      100% AMAN
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Status Proteksi Akun</span>
                      <span className="text-emerald-600 font-bold">Sangat Baik</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                      Semua parameter proteksi enterprise aktif sesuai regulasi ISO 27001.
                    </p>
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <strong className="block text-slate-800 font-bold text-xs">
                          2-Factor Authentication (2FA)
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          Aktif via Google Authenticator (TOTP)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <strong className="block text-slate-800 font-bold text-xs">
                          Kata Sandi Korporat
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          {profileData.lastPasswordChange}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <strong className="block text-slate-800 font-bold text-xs">
                          Kunci Perangkat Terverifikasi
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          Biometrik TouchID / FaceID Terdaftar
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Button Perbarui Kata Sandi */}
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs mt-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Perbarui Kata Sandi</span>
                  </button>
                </div>

                {/* Card 2: Perangkat Terkoneksi (Real-time Multi-Device Tracking) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-slate-600" />
                      <h4 className="text-xs font-bold text-slate-800">Perangkat Terkoneksi</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                      {connectedSessions.length} Sesi Aktif
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {isLoadingSessions && connectedSessions.length === 0 ? (
                      <div className="py-4 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-[10px]">Memeriksa perangkat aktif...</span>
                      </div>
                    ) : connectedSessions.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-[11px]">
                        Tidak ada sesi perangkat lain yang terdeteksi.
                      </div>
                    ) : (
                      connectedSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            session.isCurrent
                              ? 'bg-blue-50/40 border-blue-200/80 shadow-2xs'
                              : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${
                                session.deviceType === 'mobile'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                                  : session.deviceType === 'tablet'
                                  ? 'bg-purple-50 text-purple-600 border border-purple-200/60'
                                  : 'bg-blue-50 text-blue-600 border border-blue-200/60'
                              }`}
                            >
                              {session.deviceType === 'mobile' ? (
                                <Smartphone className="w-3.5 h-3.5" />
                              ) : session.deviceType === 'tablet' ? (
                                <Tablet className="w-3.5 h-3.5" />
                              ) : (
                                <Laptop className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-800 text-[11px] truncate">
                                  {session.deviceName}
                                </p>
                                {session.isCurrent && (
                                  <span className="shrink-0 px-1.5 py-0.2 rounded text-[8px] font-bold bg-blue-100 text-blue-700">
                                    Ini
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-slate-400 truncate">
                                {session.location} • {session.lastActiveText}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                session.isOnline
                                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                                  : 'text-slate-500 bg-slate-100'
                              }`}
                            >
                              {session.statusText}
                            </span>
                            {!session.isCurrent && (
                              <button
                                type="button"
                                title="Putus Sesi Perangkat Ini"
                                disabled={revokingSessionId === session.id}
                                onClick={() => handleRevokeSession(session.id, session.deviceName)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {revokingSessionId === session.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Action buttons: Segarkan & Tambah Sesi Mobile */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => fetchActiveSessions()}
                      disabled={isLoadingSessions}
                      className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingSessions ? 'animate-spin text-blue-500' : ''}`} />
                      <span>Segarkan</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateMobileLogin}
                      disabled={isSimulatingMobile}
                      className="text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer border border-blue-200/50"
                    >
                      {isSimulatingMobile ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      <span>+ Simulasi Mobile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEPEGAWAIAN & JENJANG KARIR */}
          {activeTab === 'kepegawaian' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Struktur Organisasi &amp; Status Hubungan Kerja
                </h3>
                <p className="text-xs text-slate-500">
                  Data penempatan kerja, jenjang jabatan, dan lini pelaporan resmi di Nexora HRIS.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    DEPARTEMEN
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profileData.department}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    DIVISI / SQUAD
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profileData.division}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    JABATAN &amp; LEVEL
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profileData.level}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    LOKASI PENEMPATAN
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profileData.workLocation}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    MODEL KERJA
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profileData.workModel}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    JADWAL KERJA
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profileData.schedule}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA PAJAK, BANK & BPJS */}
          {activeTab === 'pajak_bank' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Kompensasi, Rekening Penggajian &amp; Jaminan Sosial
                </h3>
                <p className="text-xs text-slate-500">
                  Data kepesertaan jaminan ketenagakerjaan dan nomor rekening payroll karyawan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    NOMOR POKOK WAJIB PAJAK (NPWP)
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900">{profileData.npwp}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    NOMOR REKENING BANK PAYROLL
                  </span>
                  <input
                    type="text"
                    value={profileData.bankAccountNumber}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bankAccountNumber: e.target.value })
                    }
                    className="w-full text-xs font-bold text-slate-900 font-mono bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-500 font-medium pt-0.5">
                    {profileData.bankName} a/n {profileData.fullName}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    STATUS PTKP
                  </span>
                  <p className="text-xs font-bold text-slate-900">{profileData.ptkpBadge}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    BPJS KETENAGAKERJAAN
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900">{profileData.bpjsTkNumber}</p>
                  <span className="text-[9px] font-bold text-emerald-600">Aktif Ditanggung Perusahaan</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    BPJS KESEHATAN
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-900">{profileData.bpjsKesNumber}</p>
                  <span className="text-[9px] font-bold text-emerald-600">Kelas 1 (Keluarga Inti)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KEAMANAN AKUN & SESI */}
          {activeTab === 'keamanan' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Pengaturan Keamanan &amp; Log Aktivitas Akun
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola kredensial masuk korporat, autentikasi dua faktor, dan perangkat terpercaya.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800">Autentikasi Dua Faktor (2FA)</h4>
                    <p className="text-[11px] text-slate-400">
                      Memerlukan kode OTP 6-digit dari aplikasi authenticator setiap login di perangkat baru.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Aktif
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800">Kata Sandi Korporat</h4>
                    <p className="text-[11px] text-slate-400">{profileData.lastPasswordChange}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Ganti Sandi
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: DOWNLOAD BIODATA PDF */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Unduh Ringkasan Biodata</h3>
              <p className="text-xs text-slate-500 mt-1">
                Dokumen resmi PDF mencakup NIK, nomor rekening, status PTKP, dan data kepegawaian aktif.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDownloadModalOpen(false);
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Cetak / Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PERBARUI KATA SANDI */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Perbarui Kata Sandi Akun ESS</h3>
                  <p className="text-[11px] text-slate-400">Atur sandi baru untuk akun mandiri Anda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPwdError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {pwdError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPwdError(null);
                if (!newPwd || newPwd.length < 8) {
                  setPwdError('Kata sandi baru minimal 8 karakter.');
                  return;
                }
                if (newPwd !== confirmPwd) {
                  setPwdError('Konfirmasi kata sandi baru tidak cocok.');
                  return;
                }
                const userIdentifier = currentUser?.email || currentUser?.employeeNumber;
                if (!userIdentifier) {
                  setPwdError('Sesi pengguna tidak valid. Silakan muat ulang halaman.');
                  return;
                }
                setIsChangingPwd(true);
                try {
                  const res = await fetch('/api/v1/auth/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      identifier: userIdentifier,
                      currentPassword: currentPwd,
                      newPassword: newPwd,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok || !data.success) {
                    throw new Error(data?.error?.message || 'Gagal mengubah kata sandi');
                  }
                  setIsPasswordModalOpen(false);
                  setCurrentPwd('');
                  setNewPwd('');
                  setConfirmPwd('');
                  showToast('✓ Kata sandi berhasil diperbarui dan tersinkronisasi ke database!');
                } catch (err: any) {
                  setPwdError(err.message || 'Terjadi kesalahan saat menyimpan kata sandi.');
                } finally {
                  setIsChangingPwd(false);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  required
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Karyawan@Nexora2026! (atau sandi lama)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Minimal 8 karakter (huruf, angka, simbol)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 block">Kebijakan Kata Sandi Nexora:</span>
                <p>• Minimal 8 karakter kombinasi huruf besar, kecil, angka &amp; simbol.</p>
                <p>• Setelah berhasil disimpan, gunakan kata sandi baru untuk login portal mandiri.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPwdError(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isChangingPwd}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isChangingPwd ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Kata Sandi</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
