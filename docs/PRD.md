# DETAILED PRODUCT REQUIREMENT DOCUMENT (PRD)
## NEXORA — Human Resource Information System (HRIS)
**Brand Tagline:** Human Resource Solutions | Connect • Innovate • Grow  
**Roles:** Product Manager, Business Analyst, QA Analyst  
**Version:** 2.0.0-Master-PRD  
**Status:** Approved for Implementation Planning  
**Target Horizon:** 1-3 Years Modular Architecture  

---

## DAFTAR ISI
1. [Kerangka Kerja & Panduan Prioritas](#1-kerangka-kerja--panduan-prioritas)
2. [Spesifikasi Rinci 15 Core Modules](#2-spesifikasi-rinci-15-core-modules)
   - [Modul 01: Authentication & Authorization](#modul-01-authentication--authorization)
   - [Modul 02: Employee Management (Core HR)](#modul-02-employee-management-core-hr)
   - [Modul 03: Attendance Management](#modul-03-attendance-management)
   - [Modul 04: Leave, Permission, & Sick Leave](#modul-04-leave-permission--sick-leave)
   - [Modul 05: Payroll Management](#modul-05-payroll-management)
   - [Modul 06: Benefits & Reimbursement](#modul-06-benefits--reimbursement)
   - [Modul 07: Performance Management](#modul-07-performance-management)
   - [Modul 08: Career & Development](#modul-08-career--development)
   - [Modul 09: Recruitment & Applicant Tracking System (ATS)](#modul-09-recruitment--applicant-tracking-system-ats)
   - [Modul 10: HR Dashboard & Executive Analytics](#modul-10-hr-dashboard--executive-analytics)
   - [Modul 11: Notification Engine](#modul-11-notification-engine)
   - [Modul 12: Reports & Data Export](#modul-12-reports--data-export)
   - [Modul 13: Documents & Policy Center](#modul-13-documents--policy-center)
   - [Modul 14: Audit Log & Compliance Trail](#modul-14-audit-log--compliance-trail)
   - [Modul 15: System Settings & Configurations](#modul-15-system-settings--configurations)
3. [Daftar Requirement Decision Needed](#3-daftar-requirement-decision-needed)
4. [Scope Breakdown](#4-scope-breakdown)
   - [MVP Scope (P0)](#mvp-scope-p0)
   - [Phase 2 Scope (P1)](#phase-2-scope-p1)
   - [Future Scope (P2 / P3)](#future-scope-p2--p3)
   - [Out of Scope](#out-of-scope)

---

## 1. KERANGKA KERJA & PANDUAN PRIORITAS

Setiap kebutuhan fungsional diklasifikasikan menggunakan skema prioritas industri:
- **[P0] Core Must-Have**: Wajib tersedia agar sistem dasar dapat berfungsi (MVP). Tanpa fitur ini, sistem HRIS tidak dapat dioperasikan secara legal, operasional, atau aman.
- **[P1] Important**: Sangat penting untuk efisiensi operasional dan kepatuhan penuh, diimplementasikan segera setelah MVP stabil.
- **[P2] Secondary**: Fitur bernilai tambah untuk otomatisasi tingkat lanjut dan kenyamanan pengguna.
- **[P3] Future Feature**: Fitur strategis jangka panjang (AI/ML, integrasi eksternal tingkat lanjut).

Setiap area yang memiliki ambiguitas kebijakan bisnis ditandai dengan **`[REQUIREMENT DECISION NEEDED]`** agar manajemen/stakeholder dapat memberikan keputusan final tanpa asumsi sepihak dari tim teknis.

---

## 2. SPESIFIKASI RINCI 15 CORE MODULES

---

### MODUL 01: AUTHENTICATION & AUTHORIZATION

#### 1. Objective
Menyediakan gerbang akses aman, terpusat, dan dapat diaudit bagi seluruh pengguna dengan memisahkan wewenang administratif dan akses mandiri karyawan secara ketat.

#### 2. Actor
- Super Admin, HR Admin, HR Staff, Line Manager, Employee, Unauthenticated User.

#### 3. Overview Functional Requirements
- Login berbasis Email & Password dengan proteksi brute-force [P0].
- Manajemen Sesi menggunakan Dual-Token (Short-lived Access Token + HTTP-Only Refresh Token) [P0].
- Centralized RBAC Policy Engine & ABAC Scope Filter [P0].
- Multi-Factor Authentication (TOTP) untuk pengguna dengan privilege finansial/admin [P1].
- Password reset via secure email link [P0].

---

#### FEATURE: Dual-Panel User Authentication & Session Security [P0]

- **USER STORY**:
  Sebagai pengguna (Admin atau Karyawan), saya ingin masuk ke panel yang sesuai dengan kredensial saya secara aman sehingga saya dapat mengakses fitur kerja sesuai hak wewenang saya.
- **BUSINESS RULE**:
  1. Password wajib memiliki panjang minimal 10 karakter, memuat minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus.
  2. Akun akan terkunci sementara selama 15 menit setelah 5 kali berturut-turut gagal memasukkan password dari IP yang sama.
  3. Access Token memiliki masa berlaku tepat 15 menit. Refresh Token memiliki masa berlaku 7 hari dan disimpan dalam HTTP-Only Secure Cookie.
  4. Penggunaan ulang (*reuse*) Refresh Token yang sudah usang akan memicu pembatalan (*revocation*) seluruh sesi aktif pengguna terkait (*security anomaly detection*).
- **ACCEPTANCE CRITERIA**:
  - Pengguna dengan role `EMPLOYEE` yang berhasil login diarahkan ke portal ESS (`/portal`).
  - Pengguna dengan role `SUPER_ADMIN` atau `HR_ADMIN` diarahkan ke Admin Console (`/admin`).
  - Request API tanpa header `Authorization: Bearer <token>` atau dengan token kedaluwarsa mengembalikan HTTP 401 Unauthorized.
- **EDGE CASE**:
  - Pengguna mencoba login saat status akun di database adalah `SUSPENDED` atau `INACTIVE` -> Sistem menolak dengan pesan generik "Kredensial tidak valid atau akun dinonaktifkan".
  - Pengguna login bersamaan dari dua perangkat berbeda -> `[REQUIREMENT DECISION NEEDED: Apakah single-session concurrent login diizinkan untuk Employee biasa, atau wajib membatalkan sesi lama?]`
- **SECURITY REQUIREMENT**:
  - Password disimpan menggunakan algoritma **Argon2id** (atau bcrypt cost 12).
  - Tidak ada informasi sensitif (password hash, secret key) di payload JWT.
- **NOTIFICATION**:
  - Email notifikasi peringatan login dari perangkat/lokasi baru [P1].
- **AUDIT REQUIREMENT**:
  - Setiap percobaan login (berhasil maupun gagal) wajib dicatat pada `audit_logs` memuat: `timestamp`, `email`, `ip_address`, `user_agent`, `status`.
- **TEST CASE**:
  - `TC-AUTH-01`: Login dengan email dan password valid mengembalikan HTTP 200 dan token.
  - `TC-AUTH-02`: Percobaan login gagal ke-5 memicu penguncian akun (HTTP 429 / 401 locked).
  - `TC-AUTH-03`: Request API dengan token expired memicu refresh token flow secara transparan.

---

#### FEATURE: Role-Based & Attribute-Based Access Control (RBAC & ABAC) [P0]

- **USER STORY**:
  Sebagai Sistem, saya ingin membatasi akses setiap endpoint dan data berdasarkan peran dan departemen pengguna agar tidak terjadi kebocoran atau manipulasi data antar karyawan.
- **BUSINESS RULE**:
  1. Hak akses modul diverifikasi di level middleware/guard sebelum mencapai logika bisnis.
  2. Aturan ABAC: Karyawan hanya boleh membaca/mengubah data miliknya sendiri. Manager hanya boleh melihat data bawahan langsung atau anggota departemennya.
  3. Super Admin tidak boleh mengeksekusi payroll tanpa review HR Admin. `[REQUIREMENT DECISION NEEDED: Apakah Super Admin memiliki wewenang override mutlak terhadap semua data finansial, atau berlaku Four-Eyes Principle?]`
- **ACCEPTANCE CRITERIA**:
  - Employee yang mencoba memanggil `GET /api/v1/employees` (list seluruh karyawan) menerima HTTP 403 Forbidden.
  - Line Manager yang mengakses `GET /api/v1/leaves/requests` hanya menerima daftar cuti dari karyawan dengan `manager_id == current_user.employee_id`.
- **EDGE CASE**:
  - Seorang manajer dipindahkan departemennya saat ada permohonan cuti bawahannya yang masih pending -> Sistem harus mengalihkan wewenang approval ke manajer baru secara otomatis.
- **SECURITY REQUIREMENT**:
  - Hak akses diperiksa secara berlapis: Route Guard (RBAC) + Service Layer Query Scoping (ABAC).
- **NOTIFICATION**:
  - Tidak ada notifikasi pengguna (Pencatatan pelanggaran ke log keamanan).
- **AUDIT REQUIREMENT**:
  - Percobaan akses ilegal (HTTP 403) dicatat sebagai insiden keamanan pada audit trail.
- **TEST CASE**:
  - `TC-RBAC-01`: Verifikasi role `EMPLOYEE` ditolak saat mengakses endpoint admin `/api/v1/payroll/periods`.
  - `TC-ABAC-01`: Verifikasi Line Manager A tidak dapat melihat pengajuan cuti tim Line Manager B.

#### Future Extensibility (Modul 01):
- Integrasi Single Sign-On (SSO) berbasis SAML 2.0 / OAuth2 / Google Workspace / Azure AD [P2].
- Dukungan Biometric Passkeys (WebAuthn / FIDO2) [P3].

---

### MODUL 02: EMPLOYEE MANAGEMENT (CORE HR)

#### 1. Objective
Mengelola master data kepegawaian secara komprehensif, terstruktur, aman, dan menjadi fondasi utama seluruh modul lainnya.

#### 2. Actor
- HR Admin, HR Staff, Line Manager, Employee.

#### 3. Overview Functional Requirements
- CRUD Data Induk Karyawan & Status Kepegawaian (PKWT/PKWTT/Probation/Intern) [P0].
- Manajemen Departemen, Divisi, dan Struktur Jabatan [P0].
- Visualisasi Bagan Organisasi (*Org Chart Tree*) [P1].
- Portal Profil Mandiri Karyawan (ESS Profile) [P0].
- Enkripsi Dokumen & Identitas Pribadi (KTP, NPWP, Rekening Bank) [P0].

---

#### FEATURE: Master Data Karyawan & Enkripsi Data Sensitif [P0]

- **USER STORY**:
  Sebagai HR Admin, saya ingin mendaftarkan dan memperbarui data profil karyawan lengkap dengan nomor identitas dan rekening bank secara aman agar data kepegawaian terkelola dengan valid.
- **BUSINESS RULE**:
  1. Nomor Induk Karyawan (NIK / `employee_code`) wajib unik di seluruh sistem dan mengikuti format standar perusahaan.
  2. Data sensitif (Nomor KTP, NPWP, Nomor Rekening Bank) wajib disimpan dalam kondisi terenkripsi (AES-256) di database dan hanya boleh dimasking saat ditampilkan di UI (`************1234`), kecuali bagi user yang memiliki permission `employee:view_sensitive`.
  3. Tanggal akhir kontrak (`end_date`) wajib diisi jika status kepegawaian adalah `CONTRACT` (PKWT) atau `PROBATION`.
  4. Penghapusan data karyawan menggunakan soft delete (`deleted_at`); hard delete dilarang demi integritas relasional data payroll dan audit.
- **ACCEPTANCE CRITERIA**:
  - Form pendaftaran karyawan baru berhasil menyimpan data dan secara otomatis membuat akun User (Modul 01).
  - Nilai kolom `national_id_number` dan `bank_account_no` di PostgreSQL tersimpan dalam cipher binary/base64 yang tidak dapat dibaca mentah.
  - Karyawan dapat melihat profilnya di ESS namun kolom jabatan, departemen, dan gaji terkunci (*read-only*).
- **EDGE CASE**:
  - Karyawan keluar (*resign/terminated*) -> Status berubah menjadi `TERMINATED`, akun login langsung dinonaktifkan secara otomatis, namun data historis tetap tersimpan.
  - Perubahan nomor rekening saat periode payroll sedang berjalan -> Sistem menerapkan versi rekening baru untuk periode berikutnya atau `[REQUIREMENT DECISION NEEDED: Apakah ada tanggal cut-off perubahan rekening bank per bulan?]`
- **SECURITY REQUIREMENT**:
  - Dekripsi data sensitif hanya terjadi di memori aplikasi pada use-case berizin khusus.
- **NOTIFICATION**:
  - Notifikasi email selamat datang kepada karyawan baru berisi instruksi aktivasi akun.
- **AUDIT REQUIREMENT**:
  - Setiap perubahan data profil (terutama NIK, nama, status, rekening bank) wajib mencatat nilai lama (*old_values*) dan nilai baru (*new_values*) di `audit_logs`.
- **TEST CASE**:
  - `TC-EMP-01`: Registrasi karyawan dengan NIK duplikat mengembalikan HTTP 409 Conflict.
  - `TC-EMP-02`: Verifikasi query database langsung pada tabel `employees` menampilkan ciphertext untuk field sensitif.

---

#### FEATURE: Pembaruan Profil Mandiri Karyawan (ESS Profile Update) [P0]

- **USER STORY**:
  Sebagai Karyawan, saya ingin memperbarui nomor telepon domisili dan kontak darurat saya secara mandiri melalui ESS agar informasi kontak saya selalu mutakhir.
- **BUSINESS RULE**:
  1. Karyawan hanya diizinkan mengedit field: `phone_number`, `current_address`, `emergency_contact_name`, `emergency_contact_phone`, dan `emergency_contact_relation`.
  2. Seluruh data struktural (Departemen, Posisi, Gaji, Manager, Bank) terkunci bagi karyawan.
- **ACCEPTANCE CRITERIA**:
  - Karyawan submit update data kontak -> data langsung terupdate di profilnya.
  - Karyawan mencoba mengirim payload berisi perubahan `basic_salary` melalui manipulasi API -> API mengabaikan atau menolak request dengan HTTP 400.
- **EDGE CASE**:
  - Karyawan menginput nomor kontak darurat sama persis dengan nomor telepon pribadinya -> Sistem memunculkan validasi peringatan.
- **SECURITY REQUIREMENT**:
  - Validasi ketat menggunakan DTO whitelist (hanya properti yang diizinkan yang diproses).
- **NOTIFICATION**:
  - Notifikasi konfirmasi perubahan data dikirimkan ke email karyawan.
- **AUDIT REQUIREMENT**:
  - Perubahan kontak dicatat pada `audit_logs` dengan `action: "UPDATE_PROFILE_SELF"`.
- **TEST CASE**:
  - `TC-EMP-03`: Karyawan mengedit alamat domisili berhasil tersimpan dan tercatat di audit log.

#### Future Extensibility (Modul 02):
- Fitur *Digital Identity Card* (QR Code ID Karyawan di aplikasi mobile) [P2].
- Integrasi e-Sign untuk kontrak kerja digital via PrivyID / Peruri [P2].

---

### MODUL 03: ATTENDANCE MANAGEMENT

#### 1. Objective
Mencatat dan memverifikasi kehadiran kerja harian secara akurat, real-time, anti-kecurangan, serta otomatis mengkalkulasi keterlambatan dan lembur sebagai input payroll.

#### 2. Actor
- Employee, Line Manager, HR Admin, HR Staff.

#### 3. Overview Functional Requirements
- Clock-in dan Clock-out mandiri via ESS dengan validasi Geofencing (GPS) dan IP Address [P0].
- Manajemen Jadwal & Shift Kerja (Fleksibel, Normal, Shift Roster) [P0].
- Deteksi otomatis: Masuk Tepat Waktu, Terlambat (*Late In*), Pulang Awal (*Early Out*), Absen (*No Show*) [P0].
- Pengajuan dan Approval Lembur (*Overtime Request*) [P1].
- Koreksi Absensi Manual oleh HR dengan riwayat alasan [P1].
- Impor data log presensi dari mesin Fingerprint (CSV / API) [P1].

---

#### FEATURE: Geofenced Mobile/Web Clock-In & Anti-Spoofing [P0]

- **USER STORY**:
  Sebagai Karyawan, saya ingin melakukan clock-in dari portal ESS dengan GPS lokasi saya sehingga jam kehadiran saya tercatat akurat dan diakui perusahaan.
- **BUSINESS RULE**:
  1. Clock-in hanya valid jika jarak koordinat pengguna berada dalam radius geofence kantor yang ditentukan (contoh: maksimal 100 meter dari titik koordinat kantor/cabang tempat karyawan ditugaskan).
  2. Waktu kehadiran (*timestamp*) mutlak menggunakan jam server (*Server Authoritative Time*), bukan waktu jam di perangkat klien.
  3. Toleransi keterlambatan (*grace period*) dihitung berdasarkan konfigurasi shift (misal: 15 menit). Karyawan yang clock-in setelah grace period otomatis berstatus `LATE` dengan durasi keterlambatan dihitung dalam satuan menit.
  4. Dalam satu hari kalender kerja, karyawan hanya dapat melakukan 1 kali Clock-In dan 1 kali Clock-Out utama (kecuali ada skema shift khusus yang diatur).
- **ACCEPTANCE CRITERIA**:
  - Karyawan berada di dalam radius 50 meter kantor -> Clock-in berhasil, status: `PRESENT`.
  - Karyawan berada di luar radius 100 meter -> Clock-in ditolak dengan pesan: "Anda berada di luar area kantor yang diizinkan (Jarak: X meter)".
  - Tombol Clock-In di portal ESS berubah menjadi tombol Clock-Out setelah presensi masuk berhasil dicatat.
- **EDGE CASE**:
  - Sinyal GPS lemah atau perangkat mematikan izin lokasi -> Sistem menolak presensi dengan instruksi jelas untuk mengaktifkan izin GPS akurasi tinggi.
  - Karyawan bertugas dinas luar kota -> Karyawan harus memilih opsi "Dinas Luar" yang mewajibkan unggah foto lokasi dan approval atasan `[REQUIREMENT DECISION NEEDED: Apakah presensi dinas luar memerlukan modul terpisah atau flag pada presensi reguler?]`
- **SECURITY REQUIREMENT**:
  - Deteksi indikasi Mock Location / Fake GPS pada browser/perangkat jika memungkinkan.
  - Idempotency key pada request clock-in untuk mencegah double record akibat klik berulang.
- **NOTIFICATION**:
  - Push notification/In-app toast berhasil clock-in.
  - Notifikasi ke Line Manager jika karyawan terlambat > 30 menit [P2].
- **AUDIT REQUIREMENT**:
  - Mencatat koordinat latitude, longitude, IP address, device user-agent, dan waktu server pada setiap baris presensi.
- **TEST CASE**:
  - `TC-ATT-01`: Clock-in pada koordinat valid menghasilkan record status `PRESENT`.
  - `TC-ATT-02`: Clock-in pada jarak 500 meter dari kantor ditolak dengan HTTP 422 `OUT_OF_GEOFENCE`.
  - `TC-ATT-03`: Clock-in kedua kali di tanggal yang sama ditolak (HTTP 409 / constraint violation).

---

#### FEATURE: Pengajuan & Perhitungan Lembur (Overtime) [P1]

- **USER STORY**:
  Sebagai Karyawan, saya ingin mengajukan lembur setelah jam kerja normal beserta rincian tugas yang dikerjakan agar jam lembur saya diverifikasi dan dibayarkan pada payroll.
- **BUSINESS RULE**:
  1. Pengajuan lembur wajib diajukan minimal pada hari H sebelum jam lembur dimulai atau maksimal H+1 sesuai kebijakan HR.
  2. Durasi lembur aktual dihitung dari selisih waktu clock-out dengan jam akhir shift, dengan batas maksimal sesuai lembur yang telah disetujui (*capped by approval*).
  3. Formula kompensasi lembur mengikuti regulasi Depnaker (Jam pertama: 1.5x upah sejam, jam berikutnya: 2x upah sejam) `[REQUIREMENT DECISION NEEDED: Apakah perusahaan menerapkan formula lembur Depnaker murni atau skema flat allowance?]`
  4. Pengajuan lembur wajib disetujui minimal oleh Line Manager (Level 1).
- **ACCEPTANCE CRITERIA**:
  - Pengajuan lembur yang di-approve manajer otomatis masuk ke rekap akumulasi jam lembur bulanan karyawan.
- **EDGE CASE**:
  - Karyawan mengajukan lembur 3 jam, tetapi clock-out hanya 1 jam setelah shift -> Sistem hanya mengakui durasi aktual (1 jam).
- **SECURITY REQUIREMENT**:
  - Verifikasi hak akses approval lembur (hanya manajer terkait yang dapat menyetujui).
- **NOTIFICATION**:
  - Real-time notification ke Manager saat pengajuan lembur disubmit.
  - Notifikasi ke karyawan saat pengajuan lembur disetujui/ditolak.
- **AUDIT REQUIREMENT**:
  - Log audit mencatat ID approver, waktu persetujuan, dan catatan approval.
- **TEST CASE**:
  - `TC-ATT-04`: Karyawan submit lembur 2 jam -> Manager approve -> Record lembur berstatus `APPROVED`.

#### Future Extensibility (Modul 03):
- Face Recognition selfie check dengan liveness detection [P2].
- Integrasi otomatis webhook ke IoT Smart Turnstile / Door Access Controller [P3].

---

### MODUL 04: LEAVE, PERMISSION, & SICK LEAVE

#### 1. Objective
Mengotomatisasi siklus pengajuan, alokasi kuota, verifikasi dokumen pendukung, dan alur persetujuan cuti/izin/sakit secara transparan tanpa mengganggu operasional tim.

#### 2. Actor
- Employee, Line Manager, HR Admin.

#### 3. Overview Functional Requirements
- Manajemen Master Jenis Cuti (Cuti Tahunan, Melahirkan, Menikah, Duka, Sakit, Unpaid Leave) [P0].
- Perhitungan Saldo Kuota Cuti Otomatis (Alokasi tahunan, akumulasi bulanan/accrual) [P0].
- Formulir Pengajuan Cuti Mandiri dengan unggah berkas (Surat Dokter untuk izin sakit) [P0].
- Multi-tier Approval Workflow (Employee -> Line Manager -> HR Admin) [P0].
- Kalender Cuti Bersama Tim (*Team Leave Calendar*) [P1].
- Pembatalan Cuti (*Leave Cancellation*) sebelum tanggal pelaksanaan [P1].

---

#### FEATURE: Pengajuan Cuti & Pemotongan Saldo Otomatis [P0]

- **USER STORY**:
  Sebagai Karyawan, saya ingin mengajukan cuti tahunan melalui portal ESS dengan melihat sisa kuota yang tersedia sehingga rencana libur saya terdata resmi.
- **BUSINESS RULE**:
  1. Pengajuan cuti tahunan tidak boleh melebihi sisa saldo cuti aktif (`remaining_days >= requested_days`).
  2. Pengajuan cuti sakit melebihi 1 hari kerja wajib melampirkan berkas surat keterangan dokter (format PDF/JPG/PNG maksimal 2MB).
  3. Hari libur nasional dan hari libur akhir pekan tidak dihitung sebagai pengurang saldo cuti.
  4. Saat pengajuan diajukan (*PENDING*), saldo cuti masuk ke status terpotong sementara (`pending_days`). Jika di-*REJECT*, saldo dikembalikan ke kuota aktif. Jika di-*APPROVED*, saldo resmi dipotong dari `allocated_days`.
  5. Pengajuan cuti tidak boleh bertabrakan (*overlap*) dengan tanggal pengajuan cuti lain yang sudah ada.
- **ACCEPTANCE CRITERIA**:
  - Karyawan dengan saldo 10 hari mengajukan 3 hari cuti -> Saldo tersisa menjadi 7 hari (dengan 3 hari pending).
  - Sistem menolak pengajuan jika tanggal awal lebih besar dari tanggal akhir atau tanggal di masa lampau `[REQUIREMENT DECISION NEEDED: Apakah backdated leave diizinkan khusus untuk izin sakit darurat?]`
- **EDGE CASE**:
  - Dua karyawan dalam satu tim yang memegang peran operasional tunggal mengajukan cuti di tanggal yang sama -> Sistem memunculkan *warning alert* kepada Line Manager mengenai benturan jadwal tim.
- **SECURITY REQUIREMENT**:
  - Validasi MIME type dan magic bytes pada berkas surat dokter untuk mencegah upload skrip berbahaya.
- **NOTIFICATION**:
  - Notifikasi real-time & email terkirim ke Line Manager saat pengajuan dibuat.
  - Notifikasi ke karyawan saat status permohonan berubah (Approved/Rejected).
- **AUDIT REQUIREMENT**:
  - Log audit mencatat pengurangan saldo cuti, mutasi status, dan alasan approver.
- **TEST CASE**:
  - `TC-LEV-01`: Pengajuan cuti 15 hari dengan sisa saldo 12 hari menghasilkan error HTTP 422 `INSUFFICIENT_LEAVE_BALANCE`.
  - `TC-LEV-02`: Pengajuan cuti yang disetujui memotong sisa saldo secara akurat pada database.

---

#### FEATURE: Multi-Level Approval Workflow [P0]

- **USER STORY**:
  Sebagai Line Manager dan HR Admin, saya ingin meninjau pengajuan cuti bawahan saya dan memberikan persetujuan atau penolakan dengan catatan agar operasional tetap terkontrol.
- **BUSINESS RULE**:
  1. Approval Tahap 1: Line Manager (Atasan langsung pemohon).
  2. Approval Tahap 2: HR Admin (Verifikasi kepatuhan kebijakan perusahaan) `[REQUIREMENT DECISION NEEDED: Apakah semua cuti wajib 2-level approval (Manager + HR), atau cuti reguler cukup 1-level Manager saja?]`
  3. Penolakan (*Rejection*) pada tahap mana pun wajib menyertakan alasan teks minimal 10 karakter.
- **ACCEPTANCE CRITERIA**:
  - Setelah Manager menyetujui, status berpindah ke `WAITING_HR_APPROVAL` (jika skema 2-level).
  - Jika ditolak, status berubah menjadi `REJECTED`, saldo pending dikembalikan utuh ke saldo aktif karyawan seketika itu juga dalam 1 database transaction.
- **EDGE CASE**:
  - Line Manager tidak merespons pengajuan cuti dalam kurun waktu 3 hari kerja -> Sistem mengirim reminder otomatis atau eskalasi ke atasan manajer `[REQUIREMENT DECISION NEEDED: Apakah auto-escalation diaktifkan?]`
- **SECURITY REQUIREMENT**:
  - Validasi otorisasi bahwa yang memanggil endpoint approve adalah benar atasan langsung dari pemohon.
- **NOTIFICATION**:
  - Notifikasi WebSocket instan ke antarmuka pemohon saat disetujui.
- **AUDIT REQUIREMENT**:
  - Tabel `leave_approvals` mencatat approver ID, status, komentar, dan timestamp.
- **TEST CASE**:
  - `TC-LEV-03`: Percobaan approval oleh user yang bukan atasan langsung menghasilkan HTTP 403 Forbidden.

#### Future Extensibility (Modul 04):
- Integrasi sinkronisasi jadwal cuti ke Google Calendar / Microsoft Outlook API [P2].
- Mekanisme Cuti Bersama yang memotong kuota tahunan secara massal (*bulk deduction*) [P1].

---

### MODUL 05: PAYROLL MANAGEMENT

#### 1. Objective
Memproses perhitungan upah, tunjangan, lembur, potongan pajak PPh 21 (TER), BPJS, dan potongan kehadiran secara presisi, tepat waktu, aman, serta menghasilkan slip gaji resmi.

#### 2. Actor
- HR Admin (Payroll Specialist), HR Director, Employee.

#### 3. Overview Functional Requirements
- Manajemen Komponen Gaji: Gaji Pokok, Tunjangan Tetap, Tunjangan Tidak Tetap, Potongan [P0].
- Mesin Kalkulasi PPh 21 skema TER (Tarif Efektif Rata-rata PP 58/2023) [P0].
- Mesin Kalkulasi Iuran BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) & BPJS Kesehatan [P0].
- Integrasi Pemotongan Otomatis dari Modul Kehadiran (Potongan telat/absen) & Cuti Unpaid [P0].
- Siklus Periode Penggajian: *Draft -> Calculate -> Verify -> Lock -> Publish* [P0].
- Generate Slip Gaji Digital terenkripsi & Ekspor File Batch Transfer Bank (BCA, Mandiri, dll) [P0].

---

#### FEATURE: Batch Payroll Calculation & Tax/BPJS Formula Engine [P0]

- **USER STORY**:
  Sebagai Payroll Specialist, saya ingin menjalankan kalkulasi penggajian bulanan untuk seluruh karyawan secara otomatis berdasarkan data master gaji dan rekap kehadiran agar proses payroll selesai cepat dan akurat.
- **BUSINESS RULE**:
  1. Formula Take Home Pay (THP):  
     `THP = (Gaji Pokok + Tunjangan Tetap + Tunjangan Variabel + Upah Lembur) - (PPh 21 + BPJS Ketenagakerjaan Karyawan + BPJS Kesehatan Karyawan + Potongan Kehadiran + Pinjaman/Potongan Lain)`.
  2. Perhitungan PPh 21 wajib mengikuti kategori TER (Kategori A, B, atau C berdasarkan status PTKP) untuk bulan Januari-November, dan perhitungan tarif Pasal 17 pada masa pajak Desember / masa akhir kerja.
  3. BPJS Ketenagakerjaan:
     - JHT: 3.7% pemberi kerja, 2.0% karyawan.
     - JP: 2.0% pemberi kerja, 1.0% karyawan (dengan plafon upah maksimal yang ditentukan pemerintah).
     - JKK (sesuai tingkat risiko) & JKM (0.3% pemberi kerja).
  4. BPJS Kesehatan: 4.0% pemberi kerja, 1.0% karyawan (dengan batas upah maksimal yang berlaku).
  5. Proses kalkulasi payroll massal wajib dijalankan secara asinkron (*Background Job*) untuk menghindari timeout HTTP.
- **ACCEPTANCE CRITERIA**:
  - Eksekusi tombol "Calculate Payroll" memicu background queue worker dan menampilkan progress bar status pemrosesan.
  - Hasil perhitungan menghasilkan rincian detail pada tabel `payroll_items` untuk setiap karyawan.
  - Jumlah total THP tidak boleh bernilai negatif (jika potongan > penghasilan, sistem memunculkan flag review manual).
- **EDGE CASE**:
  - Karyawan baru yang bergabung di tengah bulan (*prorate*) -> Sistem menghitung upah prorata berdasarkan jumlah hari kerja aktif dibagi total hari kerja sebulan `[REQUIREMENT DECISION NEEDED: Apakah prorata menggunakan formula hari kerja kalender atau standar 21/25 hari kerja?]`
- **SECURITY REQUIREMENT**:
  - Kolom nominal gaji di database wajib terenkripsi AES-256-GCM.
  - Akses endpoint kalkulasi payroll dibatasi hanya untuk role khusus Payroll Master.
- **NOTIFICATION**:
  - Notifikasi sistem ke Payroll Specialist saat background calculation selesai 100%.
- **AUDIT REQUIREMENT**:
  - Log audit mencatat: ID user pengeksekusi, parameter periode, jumlah karyawan terproses, dan total pengeluaran payroll.
- **TEST CASE**:
  - `TC-PAY-01`: Verifikasi formula PPh 21 TER Kategori A Penghasilan Rp 8.000.000 menghasilkan potongan pajak sesuai tabel regulasi resmi.
  - `TC-PAY-02`: Verifikasi potongan BPJS mematuhi batas upah tertinggi (*wage ceiling*).

---

#### FEATURE: Payroll Period Locking & Payslip Publishing [P0]

- **USER STORY**:
  Sebagai HR Director, saya ingin mengunci periode penggajian yang telah diverifikasi sehingga data gaji tidak dapat diubah lagi dan menerbitkan slip gaji ke portal ESS karyawan.
- **BUSINESS RULE**:
  1. Periode payroll yang sudah diberi status `LOCKED` bersifat *immutable* (tidak dapat dimodifikasi oleh siapa pun tanpa prosedur *Unlock* resmi dengan otorisasi Super Admin).
  2. Sekali payroll di-lock, modul Presensi dan Cuti dilarang memutasi data kehadiran pada rentang tanggal periode tersebut.
  3. Slip gaji hanya dapat diakses oleh pemilik akun (`employee_id == current_user.employee_id`) melalui portal ESS.
  4. Unduhan file PDF slip gaji diproteksi password (kombinasi tanggal lahir karyawan atau PIN keamanan).
- **ACCEPTANCE CRITERIA**:
  - Slip gaji muncul di menu "My Payslips" ESS seketika setelah status payroll diubah ke `PUBLISHED`.
  - Upaya mengubah data slip gaji pada periode locked melalui API menghasilkan HTTP 400 `PAYROLL_PERIOD_LOCKED`.
- **EDGE CASE**:
  - Terjadi koreksi gaji darurat setelah payroll di-lock -> `[REQUIREMENT DECISION NEEDED: Apakah koreksi dilakukan via mekanisme Unlock Periode atau dibebankan pada Adjustment di periode bulan berikutnya?]`
- **SECURITY REQUIREMENT**:
  - Endpoint download slip gaji menggunakan *signed URL* jangka pendek (maksimal 5 menit).
- **NOTIFICATION**:
  - Broadcast notifikasi real-time dan email ke seluruh karyawan: "Slip Gaji Periode [Bulan-Tahun] telah tersedia di ESS".
- **AUDIT REQUIREMENT**:
  - Aksi `LOCK_PAYROLL` dan `PUBLISH_PAYROLL` wajib dicatat di audit log dengan identitas eksekutor dan ringkasan nilai finansial.
- **TEST CASE**:
  - `TC-PAY-03`: Karyawan A mencoba mengakses endpoint slip gaji Karyawan B -> Menghasilkan HTTP 403 Forbidden.
  - `TC-PAY-04`: Update record gaji pada status locked menghasilkan error penolakan.

#### Future Extensibility (Modul 05):
- Integrasi langsung API Direct Disbursement Bank (Host-to-Host BCA/Mandiri API) [P3].
- Simulator kenaikan gaji berkala dan budgeting tahunan [P2].

---

### MODUL 06: BENEFITS & REIMBURSEMENT

#### 1. Objective
Mengelola tunjangan fleksibel, klaim penggantian biaya (reimbursement medis, perjalanan, kacamata) karyawan secara transparan dengan batas pagu yang terkontrol.

#### 2. Actor
- Employee, Line Manager, HR Admin, Finance/Payroll Staff.

#### 3. Overview Functional Requirements
- Alokasi Pagu Manfaat Karyawan per Kategori per Tahun [P1].
- Pengajuan Klaim Mandiri via ESS dengan unggah bukti kuitansi/faktur [P1].
- Alur Verifikasi Struk oleh HR dan Persetujuan Finansial [P1].
- Integrasi Pencairan Klaim ke dalam Periode Penggajian (Payroll) [P1].

---

#### FEATURE: Pengajuan & Pencairan Klaim Reimbursement [P1]

- **USER STORY**:
  Sebagai Karyawan, saya ingin mengajukan klaim penggantian biaya kacamata/medis dengan melampirkan foto kuitansi agar dana saya diganti pada pembayaran payroll berikutnya.
- **BUSINESS RULE**:
  1. Total nominal klaim yang diajukan tidak boleh melebihi sisa pagu manfaat tahunan karyawan untuk kategori tersebut.
  2. Kuitansi/faktur klaim yang diunggah tidak boleh bertanggal lebih dari 30 hari kalender sejak tanggal kwitansi (*claim expiration window*).
  3. Klaim yang telah disetujui HR dan Finance dapat dibayarkan melalui: (a) Transfer langsung via Finance, atau (b) Ditambahkan ke komponen penggajian bulan berjalan.
- **ACCEPTANCE CRITERIA**:
  - Karyawan mengisi nominal klaim Rp 500.000, melampirkan foto struk, dan submit -> Status: `SUBMITTED`.
  - Sisa pagu manfaat langsung berkurang sementara (*reserved balance*).
- **EDGE CASE**:
  - Foto struk buram atau tidak terbaca -> Approver dapat menolak klaim dengan status `REJECTED` disertai catatan: "Bukti kuitansi tidak terbaca, mohon unggah ulang". Sisa pagu otomatis dikembalikan utuh.
- **SECURITY REQUIREMENT**:
  - File kuitansi disimpan pada private storage dan hanya dapat dilihat oleh pemohon, HR Admin, dan Finance.
- **NOTIFICATION**:
  - Notifikasi ke HR Admin saat ada klaim baru.
  - Notifikasi ke Karyawan saat klaim disetujui untuk dicairkan.
- **AUDIT REQUIREMENT**:
  - Pencatatan nilai klaim yang disetujui, nama approver, dan tanggal approval.
- **TEST CASE**:
  - `TC-BEN-01`: Klaim dengan nominal melebihi sisa pagu ditolak dengan HTTP 422 `BENEFIT_LIMIT_EXCEEDED`.

#### Future Extensibility (Modul 06):
- Integrasi OCR otomatis untuk ekstraksi tanggal dan total nominal dari foto struk [P2].

---

### MODUL 07: PERFORMANCE MANAGEMENT

#### 1. Objective
Menyelaraskan sasaran kerja individu dengan strategi perusahaan melalui siklus evaluasi KPI/OKRs yang objektif, terukur, dan terdokumentasi.

#### 2. Actor
- HR Admin, Line Manager, Employee, Executive.

#### 3. Overview Functional Requirements
- Pembuatan Siklus Penilaian Kinerja (Tahunan / Semesteran / Triwulanan) [P2].
- Penyusunan Key Performance Indicators (KPI) & Key Results dengan bobot persentase [P2].
- Pengisian Evaluasi Mandiri (*Self-Assessment*) oleh Karyawan [P2].
- Penilaian Kinerja oleh Atasan Langsung (*Manager Review*) disertai umpan balik [P2].
- Kalibrasi Nilai oleh HR Admin dan Komite Evaluasi [P2].

---

#### FEATURE: Siklus Evaluasi Kinerja (KPI Appraisal Cycle) [P2]

- **USER STORY**:
  Sebagai Karyawan dan Line Manager, kami ingin mengisi form evaluasi capaian kerja akhir tahun secara online agar nilai kinerja dapat dihitung secara adil.
- **BUSINESS RULE**:
  1. Total bobot seluruh item KPI seorang karyawan wajib tepat 100%.
  2. Karyawan wajib menyelesaikan self-assessment terlebih dahulu sebelum form evaluasi terbuka untuk dinilai oleh Line Manager.
  3. Skor akhir dihitung berdasarkan formula: `(Skor Capaian x Bobot)`.
  4. Nilai kinerja yang telah difinalisasi diklasifikasikan ke dalam matriks grading (e.g. A = Outstanding, B = Exceeds Expectation, C = Meets Expectation, D = Needs Improvement, E = Unsatisfactory).
- **ACCEPTANCE CRITERIA**:
  - Manager dapat memberikan rating skor 1-5 untuk setiap sasaran kerja dan mengisi kolom *Strength* & *Area of Improvement*.
  - Status evaluasi: `DRAFT -> SELF_SUBMITTED -> MANAGER_EVALUATED -> HR_CALIBRATED -> FINALIZED`.
- **EDGE CASE**:
  - Karyawan tidak mengisi self-assessment hingga batas tenggat waktu (*deadline*) -> Sistem dapat melakukan auto-lock atau auto-forward ke Manager `[REQUIREMENT DECISION NEEDED: Kebijakan penanganan keterlambatan pengisian KPI]`.
- **SECURITY REQUIREMENT**:
  - Karyawan tidak dapat melihat nilai evaluasi atasan sebelum proses kalibrasi HR dinyatakan selesai dan dirilis secara resmi.
- **NOTIFICATION**:
  - Email reminder otomatis H-7 dan H-1 menjelang penutupan siklus evaluasi.
- **AUDIT REQUIREMENT**:
  - Log audit mencatat setiap perubahan nilai rating selama sesi kalibrasi HR.
- **TEST CASE**:
  - `TC-PERF-01`: Submit KPI dengan akumulasi bobot 90% menghasilkan validasi error `TOTAL_WEIGHT_MUST_BE_100`.

#### Future Extensibility (Modul 07):
- Skema evaluasi Review 360 Derajat (Peer Review & Subordinate Review) [P3].
- AI-assisted performance feedback generation [P3].

---

### MODUL 08: CAREER & DEVELOPMENT

#### 1. Objective
Mengelola riwayat perjalanan karir karyawan, pemetaan kompetensi (*skills matrix*), program pelatihan internal/eksternal, serta rencana suksesi.

#### 2. Actor
- HR Admin, Line Manager, Employee.

#### 3. Overview Functional Requirements
- Pencatatan Riwayat Karir Karyawan (Promosi, Demosi, Mutasi Departemen, Penyesuaian Grade) [P2].
- Katalog Program Pelatihan (*Training Directory*) & Jadwal Sesi [P2].
- Pendaftaran Pelatihan oleh Karyawan atau Penugasan oleh Manajer [P2].
- Pelacakan Sertifikasi Karyawan & Notifikasi Kedaluwarsa Sertifikat [P2].

---

#### FEATURE: Pencatatan Mutasi & Promosi Karyawan [P2]

- **USER STORY**:
  Sebagai HR Admin, saya ingin menerbitkan Surat Keputusan (SK) mutasi/promosi karyawan sehingga departemen, jabatan, dan struktur atasan langsung karyawan terbarui secara resmi.
- **BUSINESS RULE**:
  1. Perubahan departemen atau atasan langsung berlaku efektif per tanggal yang ditentukan dalam SK (`effective_date`).
  2. Sistem menyimpan seluruh histori jabatan lama tanpa menimpa data sebelumnya (*Historical Snapshot*).
  3. Otomatisasi wewenang: Hak akses approval cuti/lembur bawahan lama otomatis berpindah ke atasan baru per tanggal efektif.
- **ACCEPTANCE CRITERIA**:
  - Form mutasi mengupdate field `department_id`, `designation_id`, atau `manager_id` di tabel `employees` saat tanggal efektif tiba.
  - Riwayat karir dapat dilihat di tab "Career History" pada profil karyawan.
- **EDGE CASE**:
  - Karyawan dimutasi ke departemen baru saat masih memiliki pengajuan cuti yang pending di atasan lama -> `[REQUIREMENT DECISION NEEDED: Apakah approval dialihkan ke atasan baru atau diselesaikan oleh atasan lama?]`
- **SECURITY REQUIREMENT**:
  - Mutasi hanya dapat dieksekusi oleh HR Admin dengan permission `employee:career_mutate`.
- **NOTIFICATION**:
  - Notifikasi ucapan selamat ke karyawan dan pengumuman mutasi ke departemen terkait.
- **AUDIT REQUIREMENT**:
  - Rekam data jabatan lama, jabatan baru, nomor SK, dan eksekutor mutasi.
- **TEST CASE**:
  - `TC-CAR-01`: Mutasi karyawan berhasil mengubah hierarki atasan dan tercatat di histori karir.

#### Future Extensibility (Modul 08):
- Nine-Box Grid Talent Mapping untuk identifikasi *High-Potential Leaders* [P3].

---

### MODUL 09: RECRUITMENT & APPLICANT TRACKING SYSTEM (ATS)

#### 1. Objective
Mengelola siklus pengadaan tenaga kerja mulai dari pembukaan lowongan, penyaringan resume, penjadwalan wawancara, penawaran kerja (*offering*), hingga onboarding otomatis ke master data karyawan.

#### 2. Actor
- HR Recruiter, Hiring Manager, Candidate (Job Seeker).

#### 3. Overview Functional Requirements
- Manajemen Lowongan Kerja Internal & Eksternal (*Job Requisition & Posting*) [P2].
- Pipeline Pelamar ATS (Applied -> Screened -> Interview -> Technical Test -> Offering -> Hired) [P2].
- Penjadwalan Wawancara & Integrasi Kalender [P2].
- Konversi Otomatis Kandidat Diterima (*Hired*) menjadi Data Master Karyawan (Modul 02) [P1].

---

#### FEATURE: Kandidat Onboarding to Core Employee Conversion [P1]

- **USER STORY**:
  Sebagai HR Recruiter, saya ingin mengonversi data pelamar yang telah berstatus *Hired* menjadi master data karyawan baru hanya dengan 1 klik agar tidak perlu input ulang manual.
- **BUSINESS RULE**:
  1. Hanya kandidat dengan status `OFFERING_ACCEPTED` yang dapat dikonversi menjadi karyawan.
  2. Data dasar pelamar (Nama, Email, Nomor Telepon, Resume) otomatis dipetakan ke profil calon karyawan baru di Modul 02.
  3. HR Recruiter wajib melengkapi NIK, Tanggal Bergabung (*Join Date*), Departemen, Jabatan, dan Gaji Pokok sebelum konversi dinyatakan sukses.
- **ACCEPTANCE CRITERIA**:
  - Eksekusi tombol "Convert to Employee" membuat record baru di tabel `employees` dan akun di tabel `users`.
  - Status kandidat di modul ATS berubah menjadi `ONBOARDED`.
- **EDGE CASE**:
  - Email kandidat ternyata sudah terdaftar sebelumnya di sistem (misal mantan karyawan) -> Sistem memunculkan dialog konfirmasi untuk mengaktifkan kembali akun lama atau menggunakan email baru.
- **SECURITY REQUIREMENT**:
  - Data penawaran gaji (*offering letter*) terisolasi dan hanya dapat diakses oleh tim rekrutmen dan hiring manager terkait.
- **NOTIFICATION**:
  - Email otomatis berisi surat penawaran kerja dan link formulir kelengkapan berkas onboarding.
- **AUDIT REQUIREMENT**:
  - Log audit mencatat konversi kandidat ke ID karyawan baru.
- **TEST CASE**:
  - `TC-REC-01`: Konversi kandidat berstatus Hired sukses membuat record karyawan baru di database.

#### Future Extensibility (Modul 09):
- AI Resume Parsing untuk pencocokan otomatis kualifikasi pelamar dengan kriteria lowongan [P3].
- Integrasi ke LinkedIn Jobs & JobStreet API [P3].

---

### MODUL 10: HR DASHBOARD & EXECUTIVE ANALYTICS

#### 1. Objective
Menyajikan visualisasi data strategis SDM secara real-time dan interaktif bagi jajaran manajemen untuk pengambilan keputusan berbasis data (*Data-Driven HR*).

#### 2. Actor
- Executive (C-Level), HR Director, HR Admin.

#### 3. Overview Functional Requirements
- Metrik Utama SDM: Total Headcount, Rasio Gender, Distribusi Usia, Rasio Karyawan Tetap vs Kontrak [P1].
- Analitik Kehadiran Harian: Persentase Kehadiran, Keterlambatan, dan Ketidakhadiran [P1].
- Metrik Retensi Tenaga Kerja: Angka Perputaran Karyawan (*Turnover Rate*) & Masa Kerja Rata-rata [P2].
- Widget Peringatan Dini (*Early Warning Widget*): Kontrak PKWT akan habis dalam 30/60 hari, Karyawan Probation selesai [P1].
- Grafik Tren Biaya Penggajian (*Labor Cost Trends*) Bulanan [P1].

---

#### FEATURE: Executive KPI Dashboard & Contract Expiration Alerts [P1]

- **USER STORY**:
  Sebagai HR Director, saya ingin melihat dashboard ringkasan headcount, tren kehadiran, dan daftar kontrak yang akan berakhir bulan ini agar saya dapat merencanakan perpanjangan atau rekrutmen tepat waktu.
- **BUSINESS RULE**:
  1. Seluruh query analitik agregasi berat wajib di-cache menggunakan Redis dengan masa kadaluarsa (TTL) maksimal 15-30 menit atau di-invalidasi saat ada mutasi data karyawan baru.
  2. Data nominal finansial pada grafik payroll hanya dapat dilihat oleh user dengan role yang memiliki permission `payroll:view_analytics`.
- **ACCEPTANCE CRITERIA**:
  - Dashboard menampilkan widget kartu: Total Karyawan Aktif, Hadir Hari Ini, Karyawan Cuti Hari Ini, dan Kontrak Berakhir < 30 Hari.
  - Mengklik widget "Kontrak Berakhir < 30 Hari" membuka tabel daftar nama karyawan terkait secara terfilter.
- **EDGE CASE**:
  - Tidak ada data presensi (misal hari libur nasional) -> Dashboard menampilkan status "Hari Libur Resmi" tanpa error division by zero pada persentase.
- **SECURITY REQUIREMENT**:
  - Proteksi agregasi data agar tidak membocorkan data individu karyawan jika jumlah sampel terlalu kecil.
- **NOTIFICATION**:
  - Notifikasi email mingguan ringkasan HR Metric ke HR Director [P2].
- **AUDIT REQUIREMENT**:
  - Tidak ada pencatatan audit untuk query dashboard read-only (hanya request log server biasa).
- **TEST CASE**:
  - `TC-DASH-01`: Dashboard berhasil menampilkan angka headcount yang sinkron dengan total record karyawan aktif di database.

#### Future Extensibility (Modul 10):
- Analitik Prediktif: Prediksi potensi turnover karyawan (*Flight Risk Prediction*) menggunakan machine learning [P3].

---

### MODUL 11: NOTIFICATION ENGINE

#### 1. Objective
Menyediakan infrastruktur komunikasi asinkron yang andal untuk mendistribusikan notifikasi multi-channel (In-App, WebSocket, Email) kepada pengguna tepat waktu.

#### 2. Actor
- System Worker, Seluruh Pengguna Sistem.

#### 3. Overview Functional Requirements
- In-App Notification Center dengan penanda badge unread [P0].
- Push Notification Real-Time via WebSockets (Socket.io) [P1].
- Worker Pengiriman Email Transaksional berbasis Antrian (BullMQ + Redis) [P0].
- Pengaturan Preferensi Notifikasi per Pengguna [P2].
- Mekanisme Fallback Polling otomatis jika koneksi WebSocket terputus [P0].

---

#### FEATURE: Asynchronous Multi-Channel Notification Dispatcher [P0]

- **USER STORY**:
  Sebagai Pengguna, saya ingin menerima notifikasi instan saat ada tugas persetujuan atau pengumuman penting baik melalui lonceng aplikasi maupun email agar saya dapat bertindak cepat.
- **BUSINESS RULE**:
  1. Notifikasi dipicu oleh Domain Event internal (misal: `leave.submitted`, `payroll.published`).
  2. Kegagalan pada transport pengiriman email (SMTP down) tidak boleh membatalkan transaksi utama database dan wajib dicoba ulang secara otomatis (*retry backoff*) hingga 3 kali oleh BullMQ worker.
  3. Database PostgreSQL adalah sumber kebenaran (*Single Source of Truth*). Setiap notifikasi wajib memiliki record tersimpan di tabel `notifications`.
- **ACCEPTANCE CRITERIA**:
  - Saat cuti diajukan, lonceng notifikasi di antarmuka Line Manager bertambah +1 secara instan tanpa perlu refresh halaman (via WebSocket).
  - Mengklik notifikasi menandai status notifikasi menjadi `is_read = true` dan mengarahkan pengguna ke halaman detail yang relevan via payload link.
- **EDGE CASE**:
  - Pengguna membuka aplikasi di browser yang memblokir WebSocket -> Klien otomatis beralih ke HTTP polling interval 30 detik (*graceful degradation*).
- **SECURITY REQUIREMENT**:
  - Payload notifikasi tidak boleh memuat kredensial atau token otentikasi.
- **NOTIFICATION**:
  - Menghasilkan delivery In-App, WebSocket, dan Email.
- **AUDIT REQUIREMENT**:
  - Pencatatan log kegagalan pengiriman email pada file log worker.
- **TEST CASE**:
  - `TC-NOTIF-01`: Event `leave.approved` sukses memicu pembuatan record notifikasi dan push message ke channel user pemohon.

#### Future Extensibility (Modul 11):
- Integrasi WhatsApp Business API untuk notifikasi slip gaji dan approval darurat [P2].
- Integrasi bot notifikasi ke Slack / Microsoft Teams [P2].

---

### MODUL 12: REPORTS & DATA EXPORT

#### 1. Objective
Memfasilitasi ekstraksi dan rekapitulasi data operasional SDM dalam berbagai format standar (Excel, CSV, PDF) untuk kebutuhan audit, kepatuhan, dan pelaporan manajemen.

#### 2. Actor
- HR Admin, Payroll Specialist, Executive, Auditor.

#### 3. Overview Functional Requirements
- Laporan Rekapitulasi Presensi & Lembur Bulanan [P0].
- Laporan Rekapitulasi Cuti & Saldo Tahunan per Departemen [P0].
- Laporan Penggajian & Rekap Pajak PPh 21 Tahunan (Format 1721-A1) [P0].
- Generator Ekspor Dokumen Format Excel (`.xlsx`), CSV, dan PDF [P0].
- Pemrosesan Laporan Besar di Background dengan Notifikasi Unduhan [P1].

---

#### FEATURE: Background Report Generation & Export [P0]

- **USER STORY**:
  Sebagai HR Admin, saya ingin mengunduh laporan rekap absensi bulanan untuk seluruh 1.000 karyawan ke dalam file Excel tanpa membuat server hang/freeze.
- **BUSINESS RULE**:
  1. Ekspor data dengan jumlah baris > 1.000 baris dialihkan secara otomatis ke background job worker untuk di-generate secara asinkron.
  2. File hasil generate disimpan di temporary storage terenkripsi dengan masa berlaku unduh maksimal 24 jam.
  3. Format laporan keuangan wajib mematuhi standar pembukuan dan perpajakan resmi.
- **ACCEPTANCE CRITERIA**:
  - Pengguna memilih filter rentang tanggal -> klik "Export Excel" -> Muncul pemberitahuan: "Laporan sedang diproses, Anda akan diberi notifikasi saat file siap diunduh".
  - Notifikasi masuk berisi tombol download file `.xlsx` yang valid.
- **EDGE CASE**:
  - Pengguna mengekspor rentang data kosong (0 record) -> Sistem menampilkan notifikasi: "Tidak ada data pada kriteria filter yang dipilih" tanpa membuat file kosong.
- **SECURITY REQUIREMENT**:
  - URL unduhan laporan diamankan dengan signed token bertenggat waktu; user lain tidak dapat menebak URL unduhan.
- **NOTIFICATION**:
  - In-app notification saat file laporan siap diunduh.
- **AUDIT REQUIREMENT**:
  - Setiap aktivitas ekspor data karyawan wajib dicatat di `audit_logs` (mencegah *mass data exfiltration* tanpa izin).
- **TEST CASE**:
  - `TC-REP-01`: Ekspor data 500 karyawan menghasilkan file Excel dengan formula dan header kolom yang tepat.

#### Future Extensibility (Modul 12):
- Custom Report Builder (User dapat memilih kolom dan filter sendiri via antarmuka drag-and-drop) [P3].

---

### MODUL 13: DOCUMENTS & POLICY CENTER

#### 1. Objective
Menyediakan repositori terpusat dan teratur untuk seluruh dokumen kebijakan perusahaan, SOP, formulir resmi, serta memastikan kepatuhan karyawan terhadap peraturan kerja.

#### 2. Actor
- HR Admin, Seluruh Karyawan.

#### 3. Overview Functional Requirements
- Repositori Digital Kebijakan Perusahaan, Buku Pedoman (*Employee Handbook*), dan SOP [P1].
- Penomoran Versi Dokumen (*Document Versioning*) [P1].
- Pelacakan Tanda Terima & Konfirmasi Baca Digital (*Digital Policy Acknowledgment*) [P1].
- Manajemen Dokumen Pribadi Karyawan (Kontrak Kerja, Ijazah, Sertifikat) [P0].

---

#### FEATURE: Policy Publishing & Employee Acknowledgment Tracking [P1]

- **USER STORY**:
  Sebagai HR Admin, saya ingin menerbitkan Peraturan Perusahaan terbaru dan mewajibkan seluruh karyawan membaca serta menyetujuinya secara digital agar perusahaan memiliki bukti kepatuhan hukum.
- **BUSINESS RULE**:
  1. Dokumen kebijakan baru dapat ditandai sebagai `MANDATORY_ACKNOWLEDGMENT`.
  2. Karyawan yang login ke portal ESS akan menerima modal peringatan untuk membaca dokumen dan mengklik tombol "Saya Telah Membaca dan Menyetujui".
  3. Sistem mencatat timestamp, user ID, dan IP address saat konfirmasi diklik sebagai bukti digital sah.
- **ACCEPTANCE CRITERIA**:
  - HR Admin dapat memantau dashboard persentase kepatuhan (contoh: 85% karyawan telah menyetujui SOP baru).
- **EDGE CASE**:
  - Karyawan menolak menyetujui kebijakan baru -> Sistem mencatat penolakan dan memberi notifikasi ke HR Admin untuk tindak lanjut personal `[REQUIREMENT DECISION NEEDED: Apakah akses portal diblokir jika kebijakan wajib belum disetujui?]`
- **SECURITY REQUIREMENT**:
  - File dokumen kebijakan tersimpan aman dan hanya dapat diakses dalam mode *read-only* (mencegah manipulasi isi file).
- **NOTIFICATION**:
  - Notifikasi broadcast pengumuman dokumen kebijakan baru ke seluruh karyawan.
- **AUDIT REQUIREMENT**:
  - Catatan acknowledgment bersifat permanen dan tidak dapat dihapus.
- **TEST CASE**:
  - `TC-DOC-01`: Karyawan klik setuju pada dokumen SOP -> Tabel acknowledgment mencatat record baru dengan waktu akurat.

#### Future Extensibility (Modul 08/13):
- Integrasi sertifikat digital berotentikasi e-Meterai resmi Peruri [P2].

---

### MODUL 14: AUDIT LOG & COMPLIANCE TRAIL

#### 1. Objective
Menyediakan catatan rekaman seluruh aktivitas penting sistem yang permanen, tahan manipulasi (*tamper-proof*), dan tidak dapat dibantah (*non-repudiation*) untuk investigasi forensik dan audit kepatuhan.

#### 2. Actor
- Super Admin, Compliance Auditor, Sistem Keamanan.

#### 3. Overview Functional Requirements
- Pencatatan otomatis setiap aksi mutasi data penting (CREATE, UPDATE, DELETE) [P0].
- Pencatatan akses baca data sensitif (VIEW_SENSITIVE, EXPORT_DATA) [P0].
- Audit Log Viewer dengan filter waktu, pengguna, modul, dan tipe aksi [P0].
- Sifat data Append-Only (Tabel tanpa izin UPDATE dan DELETE di level basis data) [P0].

---

#### FEATURE: Tamper-Proof Audit Trail Logging [P0]

- **USER STORY**:
  Sebagai Auditor dan Super Admin, saya ingin memeriksa riwayat perubahan gaji seorang karyawan secara detail (siapa yang mengubah, kapan, dari nilai berapa menjadi berapa) untuk memastikan tidak ada kecurangan internal.
- **BUSINESS RULE**:
  1. Setiap perubahan data pada entitas sensitif (`Employee`, `PayrollRecord`, `LeaveBalance`, `UserRole`) wajib mencatat *delta change* (kolom `old_values` dan `new_values` dalam format JSONB).
  2. Data log audit tidak boleh dapat diubah atau dihapus oleh siapa pun, termasuk Super Admin (Dilarang ada endpoint atau antarmuka delete log).
  3. Aksi audit logging dieksekusi secara transaksional bersamaan dengan operasi bisnis utama.
- **ACCEPTANCE CRITERIA**:
  - Saat HR Staff mengubah nomor rekening karyawan, tabel `audit_logs` langsung mencatat: User ID pelaksana, Action: `UPDATE`, Entity: `Employee`, Old: `{ bank_account_no: "xxx" }`, New: `{ bank_account_no: "yyy" }`, IP Address, dan Timestamp.
  - Halaman Audit Log Viewer di Admin Panel dapat menampilkan perbandingan visual *side-by-side diff* antara nilai lama dan nilai baru.
- **EDGE CASE**:
  - Aksi dilakukan oleh sistem otomatis (Cron Job / Worker) -> Kolom `user_id` diisi `SYSTEM` atau `NULL` dengan keterangan nama job pada kolom metadata.
- **SECURITY REQUIREMENT**:
  - Konfigurasi permission database PostgreSQL: User aplikasi dilarang memiliki wewenang `DROP TABLE`, `TRUNCATE`, atau `DELETE` pada tabel `audit_logs`.
- **NOTIFICATION**:
  - Peringatan instan ke Security Officer jika terdeteksi aksi audit berkategori risiko tinggi (misal: pemberian role Super Admin baru) [P1].
- **AUDIT REQUIREMENT**:
  - Merupakan core engine dari seluruh sistem audit.
- **TEST CASE**:
  - `TC-AUD-01`: Percobaan query SQL `DELETE FROM audit_logs` memicu error permission denied dari PostgreSQL.
  - `TC-AUD-02`: Aksi perubahan gaji mencatat snapshot JSON nilai sebelum dan sesudah mutasi.

#### Future Extensibility (Modul 14):
- Pengiriman log secara streaming ke SIEM eksternal (Splunk / Datadog / Elasticsearch) [P2].
- Hashing berantai ala Cryptographic Audit Ledger (Merkle Tree / Blockchain-like verification) [P3].

---

### MODUL 15: SYSTEM SETTINGS & CONFIGURATIONS

#### 1. Objective
Mengelola parameter operasional global, kalender hari libur, struktur toleransi jam kerja, dan konstanta regulasi agar sistem fleksibel beradaptasi tanpa perlu mengubah kode sumber (*Zero-Code Configuration*).

#### 2. Actor
- Super Admin, HR Admin.

#### 3. Overview Functional Requirements
- Manajemen Hari Kerja & Sinkronisasi Kalender Libur Nasional [P0].
- Konfigurasi Batas Toleransi Jam Kerja & Geofence Radius Default [P0].
- Konfigurasi Konstanta Regulasi Finansial (Batas Maksimal Upah BPJS, Persentase Pajak) [P0].
- Konfigurasi Akun Email SMTP & Parameter Webhook [P0].

---

#### FEATURE: Dynamic Company Calendar & Work Schedule Configuration [P0]

- **USER STORY**:
  Sebagai HR Admin, saya ingin mengatur kalender kerja dan memasukkan daftar hari libur nasional tahun berjalan sehingga sistem tidak menghitung absen/pemotongan cuti pada hari libur tersebut.
- **BUSINESS RULE**:
  1. Hari yang ditandai sebagai Hari Libur Nasional otomatis mengecualikan pemotongan kuota cuti tahunan jika ada pengajuan cuti yang melintasi tanggal tersebut.
  2. Perubahan jadwal kerja atau hari libur tidak berlaku surut (*no retroactive recalculation*) pada data kehadiran yang telah berstatus final/terkunci.
- **ACCEPTANCE CRITERIA**:
  - HR Admin dapat menambah hari libur nasional baru -> Kalender absensi dan cuti langsung memperbarui status tanggal tersebut menjadi `PUBLIC_HOLIDAY`.
- **EDGE CASE**:
  - Pemerintah mengumumkan cuti bersama mendadak -> HR Admin dapat menambahkan tanggal libur baru dan sistem secara otomatis menyesuaikan kalkulasi kehadiran pada tanggal terkait.
- **SECURITY REQUIREMENT**:
  - Perubahan konfigurasi sistem hanya dapat dilakukan oleh role `SUPER_ADMIN` dan `HR_ADMIN`.
- **NOTIFICATION**:
  - Tidak ada notifikasi pengguna (hanya konfirmasi UI).
- **AUDIT REQUIREMENT**:
  - Setiap perubahan parameter konfigurasi tercatat di `audit_logs`.
- **TEST CASE**:
  - `TC-SET-01`: Penambahan hari libur nasional membatalkan perhitungan status `ABSENT` otomatis bagi karyawan di tanggal tersebut.

#### Future Extensibility (Modul 15):
- Otomatisasi sinkronisasi Hari Libur Nasional via integrasi Open API Pemerintah / Google Calendar [P2].

---

## 3. DAFTAR REQUIREMENT DECISION NEEDED

Berikut adalah rangkuman poin ambiguitas bisnis yang membutuhkan keputusan final dari pihak manajemen perusahaan sebelum tahap implementasi teknis modul terkait dimulai:

| ID Keputusan | Modul Terkait | Deskripsi Isu Bisnis yang Perlu Keputusan |
| :---: | :---: | :--- |
| **`[REQ-DEC-01]`** | Modul 01 (Auth) | Apakah sistem mengizinkan satu akun Karyawan (ESS) melakukan login secara bersamaan dari multiple device (ponsel + laptop), atau wajib membatalkan sesi lama (*Single Active Session*)? |
| **`[REQ-DEC-02]`** | Modul 01 (Auth) | Apakah Super Admin memiliki wewenang untuk melihat dan mengubah langsung data gaji karyawan, atau harus mematuhi *Four-Eyes Principle* (hanya HR Admin & Payroll Master yang berhak)? |
| **`[REQ-DEC-03]`** | Modul 02 (Employee) | Apakah ada batas tanggal cut-off bulanan untuk penerimaan perubahan nomor rekening bank karyawan sebelum penggajian diproses? |
| **`[REQ-DEC-04]`** | Modul 03 (Attendance)| Apakah presensi dinas luar kota/remote memerlukan alur permohonan dinas mandiri terlebih dahulu, atau cukup clock-in reguler dengan flag "Luar Kantor" dan foto bukti? |
| **`[REQ-DEC-05]`** | Modul 03 (Attendance)| Apakah formula lembur yang digunakan wajib 100% patuh pada formula Depnaker (pengali 1.5x dan 2x) atau perusahaan menggunakan skema uang saku lembur flat? |
| **`[REQ-DEC-06]`** | Modul 04 (Leave) | Apakah pengajuan izin sakit dan cuti darurat diizinkan diajukan di masa lampau (*backdated request*), dan berapa batas maksimal hari keterlambatan pengajuannya? |
| **`[REQ-DEC-07]`** | Modul 04 (Leave) | Apakah seluruh jenis cuti memerlukan persetujuan 2 tingkat (Line Manager lalu HR Admin), atau cuti tahunan cukup disetujui Line Manager saja? |
| **`[REQ-DEC-08]`** | Modul 05 (Payroll) | Untuk perhitungan gaji prorata karyawan yang masuk/keluar di tengah bulan, apakah formula pembagi menggunakan jumlah hari kalender kerja riil atau standar konstan 21/25 hari kerja? |
| **`[REQ-DEC-09]`** | Modul 05 (Payroll) | Jika ditemukan kekeliruan perhitungan gaji setelah status periode `LOCKED`, apakah prosedur perbaikan dilakukan dengan membuka lock (*Unlock Period*) atau melalui mekanisme koreksi penyesuaian (*Adjustment*) di bulan berikutnya? |
| **`[REQ-DEC-10]`** | Modul 07 (Performance)| Jika karyawan terlambat mengisi evaluasi mandiri (*self-assessment*) melewati batas deadline, apakah sistem otomatis mengunci form atau otomatis meneruskannya ke manajer penilai? |
| **`[REQ-DEC-11]`** | Modul 13 (Documents) | Apakah akses portal ESS karyawan akan diblokir sementara jika terdapat dokumen Peraturan Perusahaan wajib (*Mandatory Policy*) yang belum dikonfirmasi baca oleh karyawan? |

---

## 4. SCOPE BREAKDOWN

Untuk menjamin keberhasilan delivery secara modular dan aman, ruang lingkup implementasi dibagi secara terukur ke dalam 4 tahapan:

### MVP SCOPE (P0) - FONDASI OPERASIONAL WAJIB
Fokus pada kelayakan operasional legal dasar, pencatatan karyawan, kehadiran, cuti, penggajian, dan keamanan:
- **Modul 01**: Otentikasi Email/Password, JWT Session Management, RBAC & ABAC dasar.
- **Modul 02**: Master Data Karyawan, Struktur Departemen & Jabatan, Enkripsi AES-256 data PII/Bank, Profil ESS Karyawan.
- **Modul 03**: Clock-in & Clock-out berbasis Geofencing GPS & validasi IP, Manajemen Shift Standar, Deteksi Keterlambatan.
- **Modul 04**: Master Jenis Cuti, Alokasi Kuota Cuti Tahunan, Form Pengajuan Cuti Mandiri, Approval Line Manager, Pengurangan Saldo Otomatis.
- **Modul 05**: Master Komponen Gaji, Mesin Kalkulasi PPh 21 skema TER, Kalkulator BPJS TK & Kesehatan, Integrasi Potongan Absen, Status Periode (Draft/Calculate/Lock/Publish), Generate Slip Gaji PDF, Ekspor CSV Transfer Bank.
- **Modul 11**: Pusat Notifikasi In-App & Worker Email Transaksional (BullMQ).
- **Modul 12**: Laporan Rekap Presensi & Payroll Bulanan (Format Excel & PDF).
- **Modul 14**: Append-Only Audit Trail untuk mutasi data sensitif.
- **Modul 15**: Konfigurasi Hari Kerja, Jam Kantor, Radius Geofence, dan Hari Libur Nasional.

---

### PHASE 2 SCOPE (P1) - EFISIENSI & PENGEMBANGAN LANJUTAN
Fokus pada otomasi persetujuan tingkat lanjut, analitik eksekutif, dan manajemen dokumen:
- **Modul 01**: Multi-Factor Authentication (TOTP Authenticator) untuk role Admin/Payroll.
- **Modul 03**: Pengajuan & Rekonsiliasi Lembur (*Overtime*), Koreksi Absensi Manual oleh HR, Impor Log Mesin Fingerprint.
- **Modul 04**: Multi-tier Approval (Manager + HR), Kalender Cuti Bersama Tim, Pembatalan Cuti yang Disetujui.
- **Modul 06**: Manajemen Pagu Manfaat, Pengajuan Klaim Reimbursement Medis & Struk, Verifikasi & Pencairan via Payroll.
- **Modul 09**: Konversi Otomatis Pelamar Diterima (*Hired*) langsung menjadi data karyawan baru.
- **Modul 10**: HR Executive Dashboard (Metrik Headcount, Rasio Kehadiran, Alert Habis Kontrak PKWT < 30 Hari, Tren Payroll).
- **Modul 11**: Real-Time Push Notification via WebSocket (Socket.io) dengan Redis Pub/Sub adapter.
- **Modul 12**: Background Report Generator untuk dataset besar (> 1.000 baris).
- **Modul 13**: Repositori Kebijakan Perusahaan, Versi Dokumen, dan Pelacakan Konfirmasi Baca Digital (*Policy Acknowledgment*).

---

### FUTURE SCOPE (P2 / P3) - STRATEGIS & OTOMASI TINGKAT TINGGI
*(Dokumentasi dan kesiapan arsitektur rinci tersimpan di [`docs/FUTURE_EXPANSIONS.md`](file:///d:/Sistem%20HRIS/docs/FUTURE_EXPANSIONS.md))*:
1. **Mobile Application (Native / Cross-Platform)**: Aplikasi mobile mandiri (Flutter / React Native) untuk portal Employee Self-Service (ESS).
2. **Fingerprint Machine Integration**: Integrasi dan sinkronisasi log mesin absensi fisik kantor (ZKTeco, Solution, dll) ke tabel presensi.
3. **Face Recognition Attendance with Liveness Detection**: Presensi selfie kamera dengan verifikasi biometrik wajah anti-spoofing.
4. **WhatsApp Business Notification Gateway**: Pengiriman slip gaji, notifikasi approval, dan pengumuman instan via WhatsApp resmi.
5. **AI HR Analytics & Predictive Workforce Intelligence**: Deteksi dini risiko turnover karyawan (*Flight Risk Prediction*) dan model prediktif SDM.
6. **Employee Virtual Assistant / HR Chatbot**: Asisten virtual RAG cerdas untuk konsultasi kebijakan perusahaan dan sisa cuti 24/7.
7. **Biometric Attendance Engine**: Mesin verifikasi kehadiran biometrik gabungan (Fingerprint + Face Recognition + Geofencing).
8. **Advanced Payroll Engine**: Multi-Currency, Pinjaman Karyawan & Kasbon (*Salary Loan / Advance*), Cafeteria Flexible Benefits, dan integrasi API Host-to-Host (H2H) Bank.
- **Fitur Pendukung Lainnya**: Single Sign-On (SSO SAML / Google Workspace / Azure AD) [P2], WebAuthn Biometrics [P3], Streaming log forensik ke external SIEM [P2].

---

### OUT OF SCOPE
Hal-hal berikut secara eksplisit **TIDAK TERMASUK** dalam batasan proyek HRIS ini:
1. **Sistem Akuntansi Umum / ERP Finansial Lengkap**: Sistem HRIS ini hanya menghitung dan mengekspor jurnal beban payroll/gaji, namun tidak mengelola Buku Besar Umum (*General Ledger*), Hutang/Piutang Usaha (*AP/AR*), atau perpajakan badan (PPh Badan/PPN).
2. **Pengadaan Hardware Fisik**: Pengadaan fisik mesin fingerprint, turnstile gate, tablet absensi, atau kartu RFID fisik berada di luar cakupan software ini.
3. **Penyedia Layanan Pembayaran Pihak Ketiga (Payment Gateway Settlement)**: HRIS menghasilkan instruksi transfer file batch perbankan standar (BCA AutoPay, Mandiri MCM, dll), namun otorisasi token bank dan eksekusi debet rekening perusahaan tetap dilakukan melalui portal resmi perbankan terkait.
4. **Layanan Hukum & Konsultasi Ketenagakerjaan**: Perangkat lunak menyediakan formula dan fleksibilitas pengaturan sesuai regulasi UU Ketenagakerjaan, namun bukan pengganti nasihat konsultan hukum ketenagakerjaan.
