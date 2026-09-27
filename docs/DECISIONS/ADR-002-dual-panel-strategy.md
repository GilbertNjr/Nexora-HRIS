# ADR-002: Strategi Dual-Panel (Admin/HR vs Employee Self-Service)

## Konteks & Latar Belakang
Pengguna HRIS memiliki dua profil kebutuhan yang sangat kontras:
1. **HR Specialists & Manajer**: Membutuhkan fungsionalitas intensif data: tabel kompleks, filter multi-dimensi, approval batch, konfigurasi kebijakan, dan ekspor analitik. Penggunaan mayoritas di desktop.
2. **Karyawan Reguler (ESS)**: Membutuhkan kemudahan akses cepat, antarmuka sederhana (*glanceable*), pengajuan presensi dengan GPS di ponsel, pengajuan izin cuti dalam 3 klik, dan unduh slip gaji instan.

## Keputusan
Menerapkan arsitektur **Dual-Panel** berbasis antarmuka terpisah dengan satu backend terpusat (*Single Backend & Database Core*):
1. **Admin / HR Portal** (`/admin`)
2. **Employee Self-Service (ESS) Portal** (`/portal` atau root `/`)

## Rasional & Justifikasi
1. **User Experience Terfokus**: Karyawan biasa tidak terbebani oleh kompleksitas navigasi HR Admin, mengurangi kesalahan pengoperasian (*human error*).
2. **Optimasi Performa & Ukuran Bundle**: Halaman ESS dapat dioptimalkan secara ekstrem untuk kecepatan loading di koneksi mobile tanpa harus mengunduh library tabel data berat atau modul charting analitik HR.
3. **Pemisahan Otorisasi Bersih**: Middleware dan route guards dapat memvalidasi konteks akses di layer antarmuka dan API secara ketat.

## Konsekuensi
- Memerlukan desain UI/UX terpisah yang harmonis dalam satu Design System terpadu (Design Tokens, Typography, Button styles).
