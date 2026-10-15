# PRODUCT REQUIREMENT DOCUMENT (PRD) — FINAL APPROVED BASELINE
## NEXORA — Human Resource Information System (HRIS)
**Tagline:** Human Resource Solutions | Connect • Innovate • Grow  
**Dokumen Acuan Bisnis Utama:** `Capstone Project.pdf` (Kelompok 5) & `docs/requirements/`  
**Peran:** Senior Software Architect, Product Manager, Business Analyst, QA Lead, Security Engineer  
**Versi:** 2.1.0-Master-Approved-PRD  
**Status:** Disetujui Penuh untuk Eksekusi Teknis (Baseline Disahkan)  
**Target Horizon:** 1–3+ Tahun Arsitektur Modular Berkelanjutan  

---

## DAFTAR ISI
1. [Kerangka Kerja, Prinsip Arsitektur, & Traceability](#1-kerangka-kerja-prinsip-arsitektur--traceability)
   - [1.1 Definisi & Tujuan Sistem](#11-definisi--tujuan-sistem)
   - [1.2 Karakteristik Dual-Panel System](#12-karakteristik-dual-panel-system)
   - [1.3 Matriks Penyelarasan 17 Use Case Capstone ke Modul PRD](#13-matriks-penyelarasan-17-use-case-capstone-ke-modul-prd)
2. [Spesifikasi Fungsional Rinci Modul HRIS](#2-spesifikasi-fungsional-rinci-modul-hris)
   - [Modul 01: Authentication & Authorization (BR-AUTH-001)](#modul-01-authentication--authorization-br-auth-001)
   - [Modul 02: Employee Master Data Management (BR-EMP-001, BR-ESS-EMP-001)](#modul-02-employee-master-data-management-br-emp-001-br-ess-emp-001)
   - [Modul 03: Attendance & Time Tracking (BR-ATT-001, BR-ESS-ATT-001)](#modul-03-attendance--time-tracking-br-att-001-br-ess-att-001)
   - [Modul 04: Leave, Permission, & Sick Leave (BR-ESS-LEV-001)](#modul-04-leave-permission--sick-leave-br-ess-lev-001)
   - [Modul 05: Payroll Management (BR-PAY-001, BR-ESS-PAY-001)](#modul-05-payroll-management-br-pay-001-br-ess-pay-001)
   - [Modul 06: Benefit & Asuransi (BR-BEN-001, BR-ESS-BEN-001)](#modul-06-benefit--asuransi-br-ben-001-br-ess-ben-001)
   - [Modul 07: Penilaian Kinerja / KPI (BR-PRF-001, BR-ESS-PRF-001)](#modul-07-penilaian-kinerja--kpi-br-prf-001-br-ess-prf-001)
   - [Modul 08: Pelatihan Karier & Kompetensi (BR-TRN-001, BR-ESS-TRN-001)](#modul-08-pelatihan-karier--kompetensi-br-trn-001-br-ess-trn-001)
   - [Modul 09: Rekrutmen & Onboarding (BR-REC-001)](#modul-09-rekrutmen--onboarding-br-rec-001)
   - [Modul 10: Laporan Analitik & Executive Dashboard (BR-REP-001)](#modul-10-laporan-analitik--executive-dashboard-br-rep-001)
   - [Modul 11: Pengaturan Sistem (BR-SET-001)](#modul-11-pengaturan-sistem-br-set-001)
   - [Modul 12: Notification Engine](#modul-12-notification-engine)
   - [Modul 13: Audit Trail & Compliance Logging](#modul-13-audit-trail--compliance-logging)
3. [Daftar Keputusan Bisnis yang Telah Disetujui (Approved Decisions)](#3-daftar-keputusan-bisnis-yang-telah-disetujui-approved-decisions)
4. [Scope Breakdown & Rencana Implementasi Bertahap](#4-scope-breakdown--rencana-implementasi-bertahap)
   - [MVP Scope (P0) — Fondasi Capstone](#mvp-scope-p0--fondasi-capstone)
   - [Phase 2 Scope (P1) — Efisiensi Lanjutan](#phase-2-scope-p1--efisiensi-lanjutan)
   - [Future Scope (P2 / P3)](#future-scope-p2--p3)
   - [Out of Scope](#out-of-scope)

---

## 1. KERANGKA KERJA, PRINSIP ARSITEKTUR, & TRACEABILITY

### 1.1 Definisi & Tujuan Sistem
Sistem informasi berbasis digital yang dirancang untuk mengotomatisasi, mengintegrasikan, dan mengelola seluruh proses administrasi sumber daya manusia (SDM) di perusahaan secara terpusat (*centralized database center*). Seluruh data yang diinput oleh karyawan (seperti absensi dan permohonan cuti) langsung masuk ke basis data utama, yang kemudian diolah otomatis menjadi data siap pakai untuk penggajian (*payroll*) dan laporan manajemen bagi Admin HR.

### 1.2 Karakteristik Dual-Panel System
Menggunakan pendekatan **Dual-Panel System** yang memisahkan area kerja manajemen dan akses mandiri pegawai secara ketat:
1. **Admin HR Panel (`/admin/*`)**: Dikhususkan bagi Admin HR untuk mengelola master data karyawan, rekrutmen hingga onboarding, validasi rekap absensi staf, kalkulasi penggajian, alokasi benefit, penilaian kinerja divisi, pelatihan karier, analitik eksekutif, dan pengaturan sistem.
2. **Employee Self-Service (ESS) Panel (`/ess/*`)**: Dikhususkan bagi Karyawan untuk presensi harian digital, edit profil kontak dinamis, pengajuan cuti/izin/sakit, unduh slip gaji resmi, melihat hak benefit aktif, melihat evaluasi rapot kerja, dan mengambil tawaran pelatihan.

### 1.3 Matriks Penyelarasan 17 Use Case Capstone ke Modul PRD
Seluruh 17 use case yang tercantum pada Bab 5 `Capstone Project.pdf` dipetakan secara terukur ke modul-modul PRD ini:

| No | Nama Use Case (PDF) | Aktor | ID Kebutuhan Bisnis | Modul PRD Terkait | Rute Frontend |
|:---|:---|:---|:---|:---|:---|
| 1 | **Login** | Admin HR & Karyawan | `BR-AUTH-001` | Modul 01: Auth | `/login` |
| 2 | **Kelola data karyawan** | Admin HR | `BR-EMP-001` | Modul 02: Employee | `/admin/employees` |
| 3 | **Kelola rekrutmen** | Admin HR | `BR-REC-001` | Modul 09: Recruitment | `/admin/recruitment` |
| 4 | **Rekap absensi staf** | Admin HR | `BR-ATT-001` | Modul 03: Attendance | `/admin/attendance` |
| 5 | **Proses payroll** | Admin HR | `BR-PAY-001` | Modul 05: Payroll | `/admin/payroll` |
| 6 | **Kelola benefit** | Admin HR | `BR-BEN-001` | Modul 06: Benefits | `/admin/benefits` |
| 7 | **Penilaian Kinerja** | Admin HR | `BR-PRF-001` | Modul 07: Performance | `/admin/performance` |
| 8 | **Kelola pelatihan** | Admin HR | `BR-TRN-001` | Modul 08: Training | `/admin/training` |
| 9 | **Lihat lap. analitik** | Admin HR | `BR-REP-001` | Modul 10: Reports | `/admin/reports` |
| 10 | **Pengaturan sistem** | Admin HR | `BR-SET-001` | Modul 11: Settings | `/admin/settings` |
| 11 | **Kelola profil mandiri** | Karyawan | `BR-ESS-EMP-001` | Modul 02: Employee | `/ess/profile` |
| 12 | **Absensi digital** | Karyawan | `BR-ESS-ATT-001` | Modul 03: Attendance | `/ess/attendance` |
| 13 | **Ajukan cuti dan izin** | Karyawan | `BR-ESS-LEV-001` | Modul 04: Leave | `/ess/leave` |
| 14 | **Unduh slip gaji** | Karyawan | `BR-ESS-PAY-001` | Modul 05: Payroll | `/ess/payroll` |
| 15 | **Lihat benefit** | Karyawan | `BR-ESS-BEN-001` | Modul 06: Benefits | `/ess/benefits` |
| 16 | **Lihat evaluasi** | Karyawan | `BR-ESS-PRF-001` | Modul 07: Performance | `/ess/evaluations` |
| 17 | **Lihat pelatihan** | Karyawan | `BR-ESS-TRN-001` | Modul 08: Training | `/ess/training` |

---

## 2. SPESIFIKASI FUNGSIONAL RINCI MODUL HRIS

---

### MODUL 01: AUTHENTICATION & AUTHORIZATION (BR-AUTH-001)

#### 1. Objective
Menyediakan gerbang autentikasi terpusat dan aman yang memvalidasi kredensial pengguna dan mengarahkan pengguna secara otomatis ke panel hak akses yang sesuai (Dual-Panel Redirection).

#### 2. Actor & Role Mapping
- **Admin HR**: Masuk ke Admin Panel (`/admin`).
- **Karyawan**: Masuk ke ESS Portal (`/ess`).
- *Catatan Teknis:* Role di belakang layar dipetakan secara harmonis (`SUPER_ADMIN`, `HR_ADMIN`, `HR_STAFF`, `LINE_MANAGER` $\rightarrow$ Admin Panel; `EMPLOYEE` $\rightarrow$ ESS Portal).

#### 3. Functional Requirements
- **Autentikasi Fleksibel [P0]:** Pengguna dapat login menggunakan `username` ATAU `email` dan kata sandi yang valid.
- **Session Management [P0]:** Menggunakan Short-Lived Access Token (JWT, 15 menit) dan HTTP-Only Secure Refresh Token (7 hari).
- **Proteksi Brute-Force [P0]:** Akun dikunci sementara selama 15 menit setelah 5 kali gagal memasukkan kata sandi berturut-turut.
- **Role Redirection Otomatis [P0]:**
  - Akun dengan wewenang Admin diarahkan ke `/admin`.
  - Akun Karyawan diarahkan ke `/ess`.
- **Ubah Password [P0]:** Fitur `ubahPassword()` mandiri dengan verifikasi password lama.

#### 4. Acceptance Criteria & Test Cases
- `TC-AUTH-01`: Login kredensial valid menghasilkan HTTP 200, JWT token, dan pengalihan ke dashboard yang tepat.
- `TC-AUTH-02`: Kredensial tidak cocok menampilkan pesan error generik tanpa kebocoran data sensitif.
- `TC-AUTH-03`: Percobaan akses rute `/admin` oleh pengguna role Karyawan menghasilkan HTTP 403 Forbidden.

---

### MODUL 02: EMPLOYEE MASTER DATA MANAGEMENT (BR-EMP-001, BR-ESS-EMP-001)

#### 1. Objective
Mengelola siklus hidup data master kepegawaian perusahaan sebagai sumber kebenaran tunggal (*Single Source of Truth*) yang terintegrasi dengan struktur departemen.

#### 2. Actor
- **Admin HR**: CRUD data master pegawai (`BR-EMP-001`).
- **Karyawan**: Pembaruan profil mandiri data personal dinamis (`BR-ESS-EMP-001`).

#### 3. Functional Requirements
- **Kelola Data Karyawan (Admin HR) [P0]:**
  - Menginput data master pegawai baru: `nip`, `nama`, `tgl_lahir`, `jk` (jenis kelamin), `alamat`, `status_kerja`, dan `id_dept` (relasi ke `Departemen`).
  - Memperbarui data kepegawaian, status kerja (Tetap, Kontrak/PKWT, Magang, Percobaan), dan perpindahan departemen.
  - Menonaktifkan pegawai (*soft deactivation*) untuk menjaga integritas data historis masa lalu.
- **Kelola Profil Mandiri (Karyawan - ESS) [P0]:**
  - Karyawan hanya memiliki hak untuk mengubah data personal yang bersifat **dinamis**, yaitu: **`alamat`** dan **`nomor HP`**.
  - Data struktural (`nip`, `nama`, `tgl_lahir`, `status_kerja`, `departemen`) bersifat *read-only* bagi karyawan.
- **Manajemen Departemen [P0]:**
  - Admin HR mengelola data departemen: `id_dept`, `nama_dept`, `deskripsi` (`tambah()`, `ubah()`, `hapus()`). Relasi: 1 Departemen memiliki 0..* Karyawan.

#### 4. Acceptance Criteria & Test Cases
- `TC-EMP-01`: Tambah pegawai baru dengan NIP unik dan departemen valid tersimpan di database.
- `TC-EMP-02`: Karyawan berhasil memperbarui alamat dan no HP via endpoint `/api/v1/ess/profile`.
- `TC-EMP-03`: Percobaan karyawan memodifikasi NIP atau Departemen via payload ditolak oleh validator API.

---

### MODUL 03: ATTENDANCE & TIME TRACKING (BR-ATT-001, BR-ESS-ATT-001)

#### 1. Objective
Mencatat kehadiran kerja harian secara mandiri melalui web ESS dan menyediakan rekapitulasi data kehadiran yang siap divalidasi oleh HR sebagai dasar perhitungan penggajian.

#### 2. Actor
- **Karyawan**: Melakukan check-in dan check-out mandiri (`BR-ESS-ATT-001`).
- **Admin HR**: Memantau, memvalidasi, dan merekapitulasi jam masuk/pulang semua staf (`BR-ATT-001`).

#### 3. Functional Requirements
- **Absensi Digital Karyawan (ESS) [P0]:**
  - Karyawan melakukan aksi Check-In saat masuk kerja dan Check-Out saat pulang kerja.
  - Waktu kehadiran dicatat secara real-time berdasarkan jam server (*Server Authoritative Time*).
  - Presensi bersifat fleksibel: Koordinat lokasi GPS dan swafoto bersifat opsional (*non-blocking*) sesuai keputusan `BDR-ATT-01`.
  - Sistem mencegah duplikasi check-in pada tanggal kalender kerja yang sama.
- **Rekap Absensi Staf (Admin HR) [P0]:**
  - Admin HR memantau log kehadiran seluruh staf secara harian/bulanan.
  - Sistem menampilkan jam masuk, jam pulang, dan status kehadiran: `PRESENT` (Tepat Waktu), `LATE` (Terlambat), `ABSENT` (Alpa), `ON_LEAVE` (Cuti/Izin).
  - Admin HR dapat memvalidasi dan mengoreksi data presensi staf.
- **Toleransi Keterlambatan (*Grace Period*) [P0]:**
  - Diberikan batas toleransi keterlambatan **15 menit** dari jam masuk kerja resmi. Check-in setelah menit ke-15 dikategorikan `LATE`.

#### 4. Acceptance Criteria & Test Cases
- `TC-ATT-01`: Karyawan klik tombol Check-In $\rightarrow$ status hari ini tercatat `PRESENT` / `LATE` dengan waktu server akurat.
- `TC-ATT-02`: Karyawan klik tombol Check-Out $\rightarrow$ jam pulang tercatat pada baris presensi hari tersebut.
- `TC-ATT-03`: Admin HR dapat memfilter rekap absensi per departemen dan per rentang periode tanggal.

---

### MODUL 04: LEAVE, PERMISSION, & SICK LEAVE (BR-ESS-LEV-001)

#### 1. Objective
Mengotomatisasi siklus pengajuan izin, sakit, dan cuti tahunan secara digital dengan alur persetujuan terpusat langsung oleh Admin HR.

#### 2. Actor
- **Karyawan**: Mengisi formulir permohonan digital (`BR-ESS-LEV-001`).
- **Admin HR**: Menyetujui atau menolak permohonan cuti/izin (`ubahStatus`).

#### 3. Functional Requirements
- **Pengajuan Cuti & Izin Mandiri (ESS) [P0]:**
  - Karyawan memilih kategori: **Libur (Cuti Tahunan)**, **Sakit**, atau **Dispensasi/Izin**.
  - Mengisi `tanggal_mulai`, `tanggal_selesai`, dan `keterangan`.
  - Validasi: `tanggal_selesai` $\ge$ `tanggal_mulai`.
- **Kebijakan Saldo Cuti & Izin [P0]:**
  - Kuota cuti tahunan ditetapkan baku **12 hari per tahun** per karyawan (`BDR-LEV-01`).
  - Pengajuan jenis **Sakit** dan **Dispensasi** **tidak memotong** kuota cuti tahunan.
  - Pengajuan jenis cuti tahunan memotong saldo kuota saat permohonan disetujui.
- **Alur Persetujuan Terpusat (Admin HR) [P0]:**
  - Sesuai keputusan resmi, persetujuan cuti ditangani langsung oleh Admin HR di Admin Panel via fungsi `ubahStatus()` (`APPROVED` / `REJECTED`).
  - Permohonan yang disetujui otomatis menyinkronkan status kalender presensi karyawan menjadi `ON_LEAVE` sehingga tidak dihitung alpa.

#### 4. Acceptance Criteria & Test Cases
- `TC-LEV-01`: Karyawan submit cuti tahunan 3 hari dengan saldo 12 $\rightarrow$ status permohonan `PENDING`.
- `TC-LEV-02`: Admin HR klik approve $\rightarrow$ status cuti menjadi `APPROVED`, saldo cuti berkurang menjadi 9 hari.
- `TC-LEV-03`: Pengajuan cuti yang melebihi sisa saldo ditolak sistem dengan pesan saldo tidak mencukupi.

---

### MODUL 05: PAYROLL MANAGEMENT (BR-PAY-001, BR-ESS-PAY-001)

#### 1. Objective
Menghitung gaji bersih karyawan secara otomatis berdasarkan rekapitulasi absensi bulanan dan menerbitkan dokumen slip gaji resmi yang dapat diunduh oleh karyawan.

#### 2. Actor
- **Admin HR**: Menjalankan kalkulasi payroll bulanan (`BR-PAY-001`).
- **Karyawan**: Melihat rincian pendapatan dan mengunduh slip gaji resmi (`BR-ESS-PAY-001`).

#### 3. Functional Requirements
- **Formula Penggajian Baku (Sesuai Keputusan BDR-PAY-01 & BDR-PAY-02) [P0]:**
  $$\text{Total Gaji} = \text{Gaji Pokok} + \text{Tunjangan} - \text{Potongan}$$
  - **Gaji Pokok:** Berdasarkan master data gaji karyawan.
  - **Tunjangan:** Tunjangan tetap bulanan yang terkonfigurasi.
  - **Potongan Absensi (Alpa):**
    $$\text{Potongan Alpa} = \left(\frac{\text{Gaji Pokok}}{21}\right) \times \text{Jumlah Hari Alpa}$$
  - **Potongan Lain:** Iuran BPJS dan potongan resmi perusahaan.
- **Relasi Payroll ke Slip Gaji [P0]:**
  - Tepat $1$ catatan `Payroll` menghasilkan $1$ berkas `SlipGaji`.
  - Berkas slip gaji mencatat: `id_slip`, `id_payroll`, `periode`, `tgl_cetak`, dan berkas dokumen `file_slip` (PDF resmi).
- **Akses Slip Gaji Mandiri (ESS) [P0]:**
  - Karyawan hanya dapat melihat rincian gaji dan mengunduh berkas slip gaji miliknya sendiri.
  - Akses slip gaji lintas akun diblokir secara mutlak pada level data API.

#### 4. Acceptance Criteria & Test Cases
- `TC-PAY-01`: Admin HR klik "Proses Payroll" untuk periode tertentu $\rightarrow$ sistem mengkalkulasi potongan alpa dan menghasilkan rekap gaji seluruh staf.
- `TC-PAY-02`: Karyawan dengan 2 hari alpa menerima potongan gaji tepat `(Gaji Pokok / 21) * 2`.
- `TC-PAY-03`: Karyawan login ke ESS membuka menu slip gaji $\rightarrow$ rincian pendapatan tampil dan berkas PDF slip resmi berhasil diunduh.

---

### MODUL 06: BENEFIT & ASURANSI (BR-BEN-001, BR-ESS-BEN-001)

#### 1. Objective
Mengonfigurasi alokasi jaminan sosial (BPJS), asuransi kesehatan, dan bonus perusahaan per karyawan, serta menyediakan transparansi sisa plafon kesehatan pada portal mandiri pegawai.

#### 2. Actor
- **Admin HR**: Konfigurasi alokasi benefit per karyawan dan periode (`BR-BEN-001`).
- **Karyawan**: Memeriksa jenis asuransi aktif dan sisa plafon kesehatan (`BR-ESS-BEN-001`).

#### 3. Functional Requirements
- **Kelola Benefit (Admin HR) [P0]:**
  - Menyimpan data benefit: `id_benefit`, `id_karyawan`, `jenis_benefit` (Asuransi Kesehatan, BPJS Ketenagakerjaan, BPJS Kesehatan, Bonus Perusahaan), `nilai : decimal`, dan `periode : string`.
  - Admin HR dapat menambah, mengubah, atau memperbarui nominal alokasi benefit per periode.
- **Lihat Benefit Mandiri (ESS) [P0]:**
  - Karyawan dapat mengecek daftar asuransi aktif miliknya dan melihat nilai sisa plafon kesehatan pada periode berjalan.

#### 4. Acceptance Criteria & Test Cases
- `TC-BEN-01`: Admin HR mengalokasikan benefit asuransi kesehatan senilai Rp 10.000.000 untuk seorang karyawan.
- `TC-BEN-02`: Karyawan yang bersangkutan membuka menu Benefit di ESS $\rightarrow$ informasi jenis asuransi dan sisa plafon Rp 10.000.000 tampil akurat.

---

### MODUL 07: PENILAIAN KINERJA / KPI (BR-PRF-001, BR-ESS-PRF-001)

#### 1. Objective
Mendokumentasikan hasil evaluasi kerja berkala (KPI) tiap divisi secara objektif dan menyajikan rapot kerja transparan bagi karyawan.

#### 2. Actor
- **Admin HR**: Menginput hasil evaluasi kerja berkala divisi (`BR-PRF-001`).
- **Karyawan**: Mengakses penilaian rapot kerja dari manajemen (`BR-ESS-PRF-001`).

#### 3. Functional Requirements
- **Input Penilaian Kinerja (Admin HR) [P0]:**
  - Mencatat data penilaian: `id_penilaian`, `id_karyawan`, `periode : string`, `nilai : decimal`, dan `catatan : string`.
  - Standar rentang nilai KPI menggunakan skala **0 s/d 100 (desimal)** sesuai keputusan `BDR-PRF-01`.
  - Admin HR mengisi skor angka dan catatan evaluasi kualitatif per karyawan per periode evaluasi.
- **Lihat Evaluasi Mandiri (ESS) [P0]:**
  - Karyawan dapat mengakses rapot kerja miliknya yang memuat skor KPI, predikat, dan catatan evaluasi dari manajemen.
  - Data evaluasi bersifat *read-only* bagi karyawan.

#### 4. Acceptance Criteria & Test Cases
- `TC-PRF-01`: Admin HR input nilai KPI 88.50 dan catatan evaluasi karyawan untuk periode 2026-Q3 $\rightarrow$ data tersimpan.
- `TC-PRF-02`: Karyawan login ke ESS membuka menu Evaluasi $\rightarrow$ nilai 88.50 dan catatan manajemen tampil pada layar.

---

### MODUL 08: PELATIHAN KARIER & KOMPETENSI (BR-TRN-001, BR-ESS-TRN-001)

#### 1. Objective
Mengelola katalog program peningkatan kompetensi kerja, mengatur jadwal dan kuota peserta, serta memfasilitasi pendaftaran mandiri oleh karyawan maupun penugasan diklat wajib.

#### 2. Actor
- **Admin HR**: Menyusun program, jadwal, dan kapasitas peserta pelatihan (`BR-TRN-001`).
- **Karyawan**: Mengambil tawaran kelas kompetensi atau melihat jadwal diklat wajib (`BR-ESS-TRN-001`).

#### 3. Functional Requirements
- **Kelola Pelatihan (Admin HR) [P0]:**
  - Mengelola data pelatihan: `id_pelatihan`, `nama_pelatihan`, `tanggal : date`, `lokasi : string`, dan batas kuota `peserta : int`.
  - Admin HR dapat menambah program pelatihan baru, memperbarui jadwal/lokasi, atau menghapus program yang dibatalkan.
- **Pendaftaran & Jadwal Pelatihan (ESS) [P0]:**
  - Karyawan dapat melihat daftar program pelatihan yang aktif beserta jadwal dan lokasi.
  - Karyawan dapat mengambil tawaran kelas kompetensi dengan mendaftar mandiri (*self-enroll*) selama kuota peserta belum penuh (`BDR-TRN-01`).
  - Sistem menolak pendaftaran mandiri jika kuota `peserta` telah tercapai.
  - Menampilkan status jadwal diklat wajib yang ditugaskan oleh Admin HR.

#### 4. Acceptance Criteria & Test Cases
- `TC-TRN-01`: Admin HR membuat jadwal pelatihan "Advanced TypeScript" dengan kuota 20 peserta pada tanggal tertentu.
- `TC-TRN-02`: Karyawan klik tombol daftar kelas kompetensi di ESS $\rightarrow$ pendaftaran berhasil dan sisa kuota berkurang.
- `TC-TRN-03`: Pendaftaran ditolak jika kuota peserta telah bernilai 0 (penuh).

---

### MODUL 09: REKRUTMEN & ONBOARDING (BR-REC-001)

#### 1. Objective
Mengelola pembukaan lowongan pekerjaan dan tahapan seleksi calon tenaga kerja baru hingga tahap onboarding ke dalam data master pegawai.

#### 2. Actor
- **Admin HR**: Mengatur proses seleksi pelamar baru hingga tahap onboarding (`BR-REC-001`).

#### 3. Functional Requirements
- **Manajemen Lowongan Pekerjaan [P0]:**
  - Mengelola entitas rekrutmen: `id_rekrutmen`, `posisi : string`, `tgl_buka : date`, `tgl_tutup : date`, `status : string`.
  - Admin HR membuka lowongan pekerjaan dengan rentang tanggal dan status aktif.
- **Tahapan Seleksi & Onboarding [P0]:**
  - Memperbarui status tahapan seleksi kandidat (Pendaftaran, Seleksi Berkas, Wawancara, Onboarding).
  - Kandidat yang menyelesaikan tahap onboarding siap dikonversi menjadi data master pegawai baru pada Modul 02 (`Karyawan`).

#### 4. Acceptance Criteria & Test Cases
- `TC-REC-01`: Admin HR membuat posisi rekrutmen baru "Senior Frontend Engineer" dengan tanggal buka dan tutup valid.
- `TC-REC-02`: Status rekrutmen dapat diubah menjadi `ONBOARDING` atau `CLOSED`.

---

### MODUL 10: LAPORAN ANALITIK & EXECUTIVE DASHBOARD (BR-REP-001)

#### 1. Objective
Menyajikan grafik visual statistik ketenagakerjaan secara real-time dan memfasilitasi pengunduhan berkas laporan bulanan resmi bagi manajemen HR.

#### 2. Actor
- **Admin HR**: Memantau grafik analitik dan mengunduh berkas laporan bulanan (`BR-REP-001`).

#### 3. Functional Requirements
- **Grafik Statistik SDM [P0]:**
  - Menampilkan ringkasan visual metrik SDM: Total Karyawan Aktif, Rasio Kehadiran Bulanan, Persentase Keterlambatan, dan Rekapitulasi Status Cuti.
- **Unduh Laporan Bulanan Resmi [P0]:**
  - Admin HR dapat men-generate dan mengunduh berkas laporan bulanan (`generate()`, `unduh()`).
  - Entitas `LaporanAnalitik` mencatat: `id_laporan`, `jenis`, `periode`, `tanggal_generate`, dan tautan `file_laporan` (PDF / spreadsheet resmi).

#### 4. Acceptance Criteria & Test Cases
- `TC-REP-01`: Dashboard analitik merender grafik statistik kehadiran secara akurat berdasarkan data tabel absensi.
- `TC-REP-02`: Admin HR klik unduh laporan bulanan $\rightarrow$ berkas laporan resmi berhasil diunduh ke perangkat.

---

### MODUL 11: PENGATURAN SISTEM (BR-SET-001)

#### 1. Objective
Mengelola parameter konfigurasi dasar aplikasi dan pembagian hak akses pengguna agar operasional HRIS berjalan sesuai kebijakan perusahaan.

#### 2. Actor
- **Admin HR**: Mengatur konfigurasi dasar aplikasi dan pembagian hak user (`BR-SET-001`).

#### 3. Functional Requirements
- **Manajemen Konfigurasi Aplikasi [P0]:**
  - Menyimpan parameter: `id_setting`, `nama_setting`, `nilai`, dan `deskripsi`.
  - Admin HR dapat memodifikasi nilai setting (`ubahSetting()`) seperti nama perusahaan, jam masuk kerja resmi, toleransi keterlambatan, dll.
  - Admin HR dapat mereset konfigurasi ke nilai default bawaan sistem (`reset()`).
- **Pembagian Hak User [P0]:**
  - Mengatur pembagian penugasan hak akses pengguna antara Admin HR dan Karyawan.

#### 4. Acceptance Criteria & Test Cases
- `TC-SET-01`: Admin HR mengubah toleransi keterlambatan dari 15 menit menjadi 20 menit $\rightarrow$ perubahan tersimpan dan berlaku aktif.
- `TC-SET-02`: Admin HR klik tombol reset $\rightarrow$ parameter sistem kembali ke nilai bawaan pabrik (*default values*).

---

### MODUL 12: NOTIFICATION ENGINE

#### 1. Objective
Mendistribusikan notifikasi in-app dan peringatan sistem secara otomatis untuk setiap aksi persetujuan dan perubahan status.

#### 2. Actor
- Seluruh Pengguna Sistem.

#### 3. Functional Requirements
- **In-App Notification Center [P0]:** Menampilkan badge notifikasi pada antarmuka saat ada pengajuan cuti baru, penerbitan slip gaji baru, atau perubahan jadwal pelatihan.
- **Pemberitahuan Status [P0]:** Karyawan menerima notifikasi instan saat permohonan cuti disetujui atau ditolak oleh Admin HR.

---

### MODUL 13: AUDIT TRAIL & COMPLIANCE LOGGING

#### 1. Objective
Mencatat seluruh mutasi data sensitif secara permanen (*append-only*) untuk menjamin transparansi, integritas data, dan kemudahan audit forensik.

#### 2. Actor
- Sistem Otomatis, Compliance Auditor, Admin HR.

#### 3. Functional Requirements
- **Append-Only Audit Logs [P0]:**
  - Setiap mutasi pada master karyawan, pemrosesan payroll, persetujuan cuti, dan konfigurasi sistem wajib mencatat entri pada tabel `audit_logs`.
  - Mencatat: `user_id`, `action`, `module`, `record_id`, `ip_address`, `old_data` (JSON snapshot), `new_data` (JSON snapshot), dan `created_at`.
  - Data log dilarang memiliki operasi DELETE atau UPDATE di level aplikasi.

---

## 3. DAFTAR KEPUTUSAN BISNIS YANG TELAH DISETUJUI (APPROVED DECISIONS)

Berikut adalah ringkasan resmi keputusan bisnis yang telah disahkan oleh pemilik proyek untuk menutup seluruh ambiguitas operasional:

| ID Keputusan | Modul | Aturan Bisnis yang Disetujui | Tanggal Disahkan |
|:---|:---|:---|:---|
| **`BDR-PAY-01`** | Payroll | **Formula Potongan Alpa:** `(Gaji Pokok / 21) * Hari Alpa`. Toleransi keterlambatan 15 menit. Formula Total Gaji: `Gaji Pokok + Tunjangan - Potongan`. | 13 Okt 2026 |
| **`BDR-PAY-02`** | Payroll | **Sifat Tunjangan:** Tunjangan bersifat tunjangan tetap bulanan (*fixed monthly allowance*). | 13 Okt 2026 |
| **`BDR-LEV-01`** | Cuti & Izin | **Kuota Cuti:** Ditetapkan 12 hari per tahun. Izin Sakit tidak memotong kuota tahunan. Persetujuan cuti/izin diproses langsung oleh Admin HR di panel Admin (`ubahStatus`). | 13 Okt 2026 |
| **`BDR-ATT-01`** | Absensi | **Presensi Fleksibel:** Tombol Check-In / Check-Out di ESS web mencatat waktu real-time server. Verifikasi GPS dan swafoto bersifat opsional (*non-blocking*). | 13 Okt 2026 |
| **`BDR-PRF-01`** | Evaluasi KPI | **Skala Nilai KPI:** Menggunakan rentang skala 0 s/d 100 (desimal). | 13 Okt 2026 |
| **`BDR-TRN-01`** | Pelatihan | **Mekanisme Pendaftaran:** Karyawan dapat mendaftar mandiri (*self-enroll*) di ESS hingga kuota `peserta` penuh, serta Admin HR dapat menugaskan diklat wajib. | 13 Okt 2026 |
| **`BDR-BEN-01`** | Benefit | **Plafon Manfaat:** Alokasi asuransi, BPJS, dan plafon kesehatan dikonfigurasi per periode oleh Admin HR, dan karyawan dapat memantau sisa plafon di ESS. | 13 Okt 2026 |

---

## 4. SCOPE BREAKDOWN & RENCANA IMPLEMENTASI BERTAHAP

### MVP SCOPE (P0) — FONDASI LENGKAP CAPSTONE
Mencakup seluruh 17 use case yang tercantum dalam dokumen blueprint `Capstone Project.pdf`:
1. **Modul 01 (Auth):** Login Dual-Panel (`/admin` dan `/ess`), session security, ubah password mandiri.
2. **Modul 02 (Employee):** Master data pegawai lengkap departemen, edit profil mandiri alamat & no HP.
3. **Modul 03 (Attendance):** Presensi digital check-in/out harian ESS, monitoring & rekap absensi staf Admin HR.
4. **Modul 04 (Leave):** Permohonan cuti/sakit/dispensasi ESS, approval terpusat Admin HR, saldo cuti 12 hari.
5. **Modul 05 (Payroll):** Perhitungan payroll otomatis dengan potongan alpa `(Gaji Pokok / 21) * Hari Alpa`, slip gaji PDF resmi.
6. **Modul 06 (Benefits):** Konfigurasi alokasi BPJS & asuransi Admin HR, cek sisa plafon kesehatan ESS.
7. **Modul 07 (Performance):** Input skor evaluasi KPI (skala 0–100) Admin HR, tampilan rapot kerja ESS.
8. **Modul 08 (Training):** Kelola jadwal diklat Admin HR, katalog dan pendaftaran mandiri pelatihan ESS.
9. **Modul 09 (Recruitment):** Lowongan kerja dan alur seleksi pelamar hingga onboarding Admin HR.
10. **Modul 10 (Reports):** Grafik visual statistik SDM dan ekspor laporan bulanan Admin HR.
11. **Modul 11 (Settings):** Konfigurasi dasar aplikasi dan pembagian hak user Admin HR.
12. **Modul 12 (Notifications):** In-app notification center untuk approval dan slip gaji.
13. **Modul 13 (Audit Logs):** Pencatatan riwayat mutasi data sensitif terpusat.

---

### PHASE 2 SCOPE (P1) — EFISIENSI & OTOMASI LANJUTAN
- Multi-Factor Authentication (TOTP).
- Background report queue worker untuk laporan dataset besar (> 1.000 baris).
- Ekspor file transfer bank (BCA AutoPay / Mandiri MCM format).
- Kalender cuti bersama tim (*Team Leave Calendar*).

---

### FUTURE SCOPE (P2 / P3)
- Aplikasi Mobile Mandiri (React Native / Flutter) untuk ESS.
- Integrasi mesin fisik absensi sidik jari (Fingerprint Machine ZKTeco via sync agent).
- Face Recognition Attendance dengan deteksi keaslian wajah (*Liveness Detection*).
- Gateway notifikasi WhatsApp Business API resmi.

---

### OUT OF SCOPE
- Sistem Akuntansi Finansial / General Ledger ERP lengkap (Hanya memproses beban payroll SDM).
- Pengadaan perangkat keras fisik mesin fingerprint / turnstile gate.
- Payment Gateway Settlement pencairan dana langsung tanpa otorisasi portal bank.

---
*Dokumen PRD ini telah disahkan dan diselaraskan secara penuh dengan Capstone Project.pdf serta keputusan bisnis pemilik proyek.*
