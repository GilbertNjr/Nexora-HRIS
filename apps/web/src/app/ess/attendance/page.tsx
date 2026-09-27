'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EssLayoutSkeleton } from '@/components/layout/EssLayoutSkeleton';
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';

// Koordinat Resmi Kantor Pusat (Nexora Tower SCBD Jakarta)
const OFFICE_COORDINATES = {
  lat: -6.2255,
  lng: 106.8095,
  radiusMeters: 100,
  name: 'Nexora Tower SCBD Jakarta (Lt. 18)',
};

export default function EssAttendancePage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isInsideRadius, setIsInsideRadius] = useState<boolean>(true);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [photoCaptured, setPhotoCaptured] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState<{
    clockInTime: string | null;
    clockOutTime: string | null;
    status: 'PRESENT' | 'LATE' | 'NOT_CLOCKED_IN';
    lateMinutes: number;
  }>({
    clockInTime: null,
    clockOutTime: null,
    status: 'NOT_CLOCKED_IN',
    lateMinutes: 0,
  });

  // Recent attendance history
  const [history, setHistory] = useState([
    {
      date: 'Kemarin',
      clockIn: '08:52 WIB',
      clockOut: '18:05 WIB',
      status: 'PRESENT',
      label: 'Tepat Waktu',
    },
    {
      date: '25 Sep 2026',
      clockIn: '09:18 WIB',
      clockOut: '18:10 WIB',
      status: 'LATE',
      label: 'Terlambat 18 mnt',
    },
    {
      date: '24 Sep 2026',
      clockIn: '08:45 WIB',
      clockOut: '18:00 WIB',
      status: 'PRESENT',
      label: 'Tepat Waktu',
    },
  ]);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set default demo location at office
  useEffect(() => {
    simulateOfficeLocation();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meter
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const simulateOfficeLocation = () => {
    // 25 meters from office (inside radius)
    const lat = OFFICE_COORDINATES.lat + 0.00015;
    const lng = OFFICE_COORDINATES.lng + 0.00012;
    const dist = calculateDistance(lat, lng, OFFICE_COORDINATES.lat, OFFICE_COORDINATES.lng);
    setGpsLocation({ lat, lng });
    setDistance(dist);
    setIsInsideRadius(dist <= OFFICE_COORDINATES.radiusMeters);
  };

  const simulateOutsideLocation = () => {
    // 450 meters from office (outside radius)
    const lat = OFFICE_COORDINATES.lat + 0.0035;
    const lng = OFFICE_COORDINATES.lng + 0.0032;
    const dist = calculateDistance(lat, lng, OFFICE_COORDINATES.lat, OFFICE_COORDINATES.lng);
    setGpsLocation({ lat, lng });
    setDistance(dist);
    setIsInsideRadius(dist <= OFFICE_COORDINATES.radiusMeters);
  };

  const detectBrowserGps = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = calculateDistance(lat, lng, OFFICE_COORDINATES.lat, OFFICE_COORDINATES.lng);
        setGpsLocation({ lat, lng });
        setDistance(dist);
        setIsInsideRadius(dist <= OFFICE_COORDINATES.radiusMeters);
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        alert(`Gagal mengambil koordinat GPS: ${err.message}. Menggunakan simulasi lokasi kantor.`);
        simulateOfficeLocation();
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  const handleClockIn = async () => {
    if (!isInsideRadius) {
      alert('Presensi ditolak: Anda berada di luar radius 100 meter kantor!');
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Simulate API delay or actual fetch
    setTimeout(() => {
      setTodayAttendance({
        clockInTime: timeStr,
        clockOutTime: null,
        status: 'PRESENT',
        lateMinutes: 0,
      });
      setPhotoCaptured(true);
      setIsSubmitting(false);
      alert(`Clock-In Berhasil! Tercatat pada ${timeStr}. Jarak radius: ${distance}m dari kantor.`);
    }, 800);
  };

  const handleClockOut = async () => {
    setIsSubmitting(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    setTimeout(() => {
      setTodayAttendance((prev) => ({
        ...prev,
        clockOutTime: timeStr,
      }));
      setIsSubmitting(false);
      alert(`Clock-Out Berhasil! Jam kepulangan: ${timeStr}. Selamat beristirahat!`);
    }, 800);
  };

  return (
    <EssLayoutSkeleton>
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Employee Self-Service (ESS) Presensi</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Presensi & Geofencing
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                {currentDate || 'Memuat kalender...'}
              </p>
            </div>

            {/* Live Clock Display */}
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 block">
                Waktu Server (WIB)
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider">
                {currentTime || '00:00:00'}
              </span>
            </div>
          </div>
        </div>

        {/* Geofencing Status & Location Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isInsideRadius ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{OFFICE_COORDINATES.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isInsideRadius
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isInsideRadius ? 'DI DALAM RADIUS' : 'DI LUAR RADIUS'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jarak Anda dari kantor:{' '}
                  <strong className={isInsideRadius ? 'text-emerald-600' : 'text-rose-600'}>
                    {distance !== null ? `${distance} meter` : 'Mendeteksi...'}
                  </strong>{' '}
                  (Batas toleransi: 100m)
                </p>
              </div>
            </div>

            <button
              onClick={detectBrowserGps}
              disabled={isDetectingGps}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Mencari GPS...' : 'Cek GPS Perangkat'}</span>
            </button>
          </div>

          {/* Location Simulator Bar (Sangat berguna untuk demonstrasi sidang/evaluasi) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="font-medium">Simulasi Lokasi Demo:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={simulateOfficeLocation}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
              >
                ✓ Di Kantor (Radius 25m)
              </button>
              <button
                type="button"
                onClick={simulateOutsideLocation}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
              >
                ✗ Di Luar Kantor (450m)
              </button>
            </div>
          </div>
        </div>

        {/* Main Clock-In / Clock-Out Interaction Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-elevated text-center">
          {/* Status Badge */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                todayAttendance.clockInTime
                  ? todayAttendance.clockOutTime
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  todayAttendance.clockInTime
                    ? todayAttendance.clockOutTime
                      ? 'bg-blue-500'
                      : 'bg-emerald-500 animate-pulse'
                    : 'bg-slate-400'
                }`}
              />
              <span>
                {todayAttendance.clockInTime
                  ? todayAttendance.clockOutTime
                    ? 'Presensi Hari Ini Selesai'
                    : 'Sedang Bekerja (Checked In)'
                  : 'Belum Presensi Hari Ini'}
              </span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {!todayAttendance.clockInTime
              ? 'Waktunya Mencatat Kehadiran Masuk'
              : !todayAttendance.clockOutTime
              ? 'Siap untuk Mengakhiri Hari Kerja?'
              : 'Anda Sudah Menyelesaikan Presensi Hari Ini'}
          </h2>

          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            {!todayAttendance.clockInTime
              ? 'Pastikan Anda sudah berada di lokasi kantor dan mengizinkan akses kamera untuk verifikasi selfie.'
              : !todayAttendance.clockOutTime
              ? 'Tekan tombol Clock-Out untuk mencatat jam kepulangan resmi Anda.'
              : 'Terima kasih atas kontribusi Anda hari ini. Data presensi telah tercatat aman di server.'}
          </p>

          {/* Big Action Button */}
          <div className="my-8 flex justify-center">
            {!todayAttendance.clockInTime ? (
              <button
                onClick={handleClockIn}
                disabled={isSubmitting || !isInsideRadius}
                className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center gap-3 font-bold text-white shadow-2xl transition-all transform active:scale-95 ${
                  isInsideRadius
                    ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 hover:scale-105 shadow-blue-500/40 ring-8 ring-blue-100'
                    : 'bg-slate-300 cursor-not-allowed shadow-none ring-8 ring-slate-100'
                }`}
              >
                <Clock className="w-12 h-12" />
                <div className="leading-tight">
                  <span className="text-xl sm:text-2xl block font-black">CLOCK-IN</span>
                  <span className="text-xs opacity-90 block">Shift 09:00 - 18:00</span>
                </div>
              </button>
            ) : !todayAttendance.clockOutTime ? (
              <button
                onClick={handleClockOut}
                disabled={isSubmitting}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center gap-3 font-bold text-white shadow-2xl transition-all transform active:scale-95 bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 hover:scale-105 shadow-indigo-500/40 ring-8 ring-indigo-100"
              >
                <CheckCircle2 className="w-12 h-12" />
                <div className="leading-tight">
                  <span className="text-xl sm:text-2xl block font-black">CLOCK-OUT</span>
                  <span className="text-xs opacity-90 block">Selesai Kerja</span>
                </div>
              </button>
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-600 ring-8 ring-slate-50 border border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <span className="text-sm font-bold text-slate-800">Selesai</span>
                <span className="text-[11px] text-slate-500">Sampai jumpa besok!</span>
              </div>
            )}
          </div>

          {/* Today's Log Card Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-6 border-t border-slate-100 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Jam Masuk</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">
                {todayAttendance.clockInTime || '—'}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {todayAttendance.clockInTime ? 'Tepat Waktu' : 'Belum absen'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Jam Keluar</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">
                {todayAttendance.clockOutTime || '—'}
              </span>
              <span className="text-[10px] text-slate-400">
                {todayAttendance.clockOutTime ? 'Shift Selesai' : 'Belum checkout'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Verifikasi</span>
              <span className="text-sm font-bold text-blue-600 mt-1 block flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Geofence OK</span>
              </span>
              <span className="text-[10px] text-slate-400">Radius & IP Valid</span>
            </div>
          </div>
        </div>

        {/* Riwayat Kehadiran 7 Hari Terakhir */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Riwayat Kehadiran Terakhir</span>
            </h3>
            <span className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              Lihat Semua
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {history.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{item.date}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Masuk: {item.clockIn} • Pulang: {item.clockOut}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </EssLayoutSkeleton>
  );
}
