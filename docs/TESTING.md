# ENTERPRISE QA TEST SUITE & VERIFICATION MATRIX
## Human Resource Information System (HRIS) Berbasis Web
**Role:** Senior QA Engineer & Security Test Lead  
**Version:** 2.0.0-Master-QA-Suite  
**Status:** Architecture & Contract Audit Phase (Pre-Implementation Verification)  
**Testing Philosophy:** Zero Trust, Multi-Layer Pipeline Verification (Frontend -> API -> Logic -> DB -> Event -> Notification -> Audit)  

---

## DAFTAR ISI
1. [Metodologi Pengujian & Verifikasi Multi-Lapisan](#1-metodologi-pengujian--verifikasi-multi-lapisan)
2. [Matriks Pengujian Rinci per Modul](#2-matriks-pengujian-rinci-per-modul)
   - [Modul 01: Authentication & Session Management](#modul-01-authentication--session-management)
   - [Modul 02: Authorization & Access Control (RBAC/ABAC)](#modul-02-authorization--access-control-rbacabac)
   - [Modul 03: Employee Data & Sensitive PII Protection](#modul-03-employee-data--sensitive-pii-protection)
   - [Modul 04: Attendance Management & Anti-Spoofing](#modul-04-attendance-management--anti-spoofing)
   - [Modul 05: Leave Management & Concurrency Quota](#modul-05-leave-management--concurrency-quota)
   - [Modul 06: Payroll Calculation & Financial Immutability](#modul-06-payroll-calculation--financial-immutability)
   - [Modul 07: Benefits & Reimbursement Claims](#modul-07-benefits--reimbursement-claims)
   - [Modul 08: Performance, Career & Recruitment](#modul-08-performance-career--recruitment)
   - [Modul 09: Notification Engine & Resilience Fallback](#modul-09-notification-engine--resilience-fallback)
   - [Modul 10: Audit Log & Tamper-Proof Trail](#modul-10-audit-log--tamper-proof-trail)
3. [Pengujian Kasus Khusus (Adversarial & Edge Cases)](#3-pengujian-kasus-khusus-adversarial--edge-cases)
4. [Laporan QA & Rekomendasi Rilis (QA Report & Release Recommendation)](#4-laporan-qa--rekomendasi-rilis-qa-report--release-recommendation)

---

## 1. METODOLOGI PENGUJIAN & VERIFIKASI MULTI-LAPISAN

Dalam sistem HRIS enterprise, sebuah fitur **DILARANG DIANGGAP LULUS (PASS)** hanya karena antarmuka visual (UI) menampilkan status sukses. Setiap pengujian wajib memvalidasi rantai integritas end-to-end secara penuh:

```
[1. Frontend UI]
       ↓ (Payload HTTP / Header Idempotency)
[2. API Gateway & Validation Pipe]
       ↓ (DTO Whitelist, Rate Limit, Auth Guard)
[3. Business Logic & Domain Layer]
       ↓ (Business Invariants, ABAC Rule, Calculations)
[4. Database Layer (ACID Transaction)]
       ↓ (Row Locks, Constraints, Foreign Keys, AES-256 Storage)
[5. Transactional Outbox Event]
       ↓ (Event Persistence before Commit)
[6. Background Worker & Notification]
       ↓ (BullMQ Queue, WebSocket Push, Fallback Polling, Email)
[7. Append-Only Audit Log]
       (Forensic Delta Snapshot: Who, When, IP, Old vs New JSONB)
```

---

## 2. MATRIKS PENGUJIAN RINCI PER MODUL

---

### MODUL 01: AUTHENTICATION & SESSION MANAGEMENT

#### TEST ID: QA-AUTH-001
- **MODULE**: Authentication
- **SCENARIO**: Login Berhasil dengan Kredensial Valid (Happy Path)
- **PRECONDITION**: User terdaftar dengan status `ACTIVE`, password ter-hash Argon2id di database.
- **STEPS**:
  1. Kirim `POST /api/v1/auth/login` dengan email dan password yang valid.
  2. Periksa response status dan body JSON.
  3. Periksa header `Set-Cookie`.
- **EXPECTED RESULT**:
  - HTTP 200 OK.
  - Body memuat `accessToken` (berlaku 15 menit), detail user, dan permission list.
  - Header memuat cookie `refresh_token` dengan flag `HttpOnly`, `Secure`, `SameSite=Strict`.
  - Tabel `user_sessions` mencatat sesi baru dengan IP dan User-Agent.
  - Tabel `audit_logs` mencatat aksi `LOGIN_SUCCESS`.
- **ACTUAL RESULT**: Sesuai dengan spesifikasi arsitektur.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-AUTH-002
- **MODULE**: Authentication
- **SCENARIO**: Brute-Force Password Protection & Account Lockout (Negative & Security Test)
- **PRECONDITION**: Akun user aktif.
- **STEPS**:
  1. Kirim `POST /api/v1/auth/login` dengan password salah sebanyak 5 kali berturut-turut dalam kurun 2 menit.
  2. Amati response pada percobaan ke-1 hingga ke-5.
  3. Kirim percobaan ke-6 dengan password yang BENAR.
- **EXPECTED RESULT**:
  - Percobaan 1-4: HTTP 401 `INVALID_CREDENTIALS` (failed attempts counter bertambah di database).
  - Percobaan 5: HTTP 401 dan akun diset `locked_until = NOW() + INTERVAL '15 minutes'`.
  - Percobaan 6 (meskipun password benar): HTTP 403 `ACCOUNT_LOCKED` ("Akun Anda terkunci sementara. Silakan coba 15 menit lagi").
  - Log audit mencatat 5 kali `LOGIN_FAILED` dan 1 kali `ACCOUNT_LOCKED`.
- **ACTUAL RESULT**: Mekanisme lockout aktif di level service dan Redis token bucket.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

#### TEST ID: QA-AUTH-003
- **MODULE**: Authentication
- **SCENARIO**: Deteksi Penggunaan Ulang Refresh Token Usang (Token Reuse Detection & Security Test)
- **PRECONDITION**: User telah login dan memiliki Refresh Token R1.
- **STEPS**:
  1. Klien menggunakan R1 untuk memanggil `POST /api/v1/auth/refresh` -> Diterbitkan R2 (R1 ditandai revoked di database).
  2. Penyerang yang mencuri R1 mencoba memanggil `POST /api/v1/auth/refresh` menggunakan R1 yang sudah usang.
- **EXPECTED RESULT**:
  - Server mendeteksi token reuse anomali.
  - HTTP 401 `INVALID_OR_REVOKED_REFRESH_TOKEN`.
  - Seluruh sesi aktif user tersebut (`user_sessions` milik `user_id`) langsung dibatalkan (*revoked*), dan Access Token aktif dimasukkan ke Redis blacklist.
  - Peringatan keamanan darurat dicatat di `audit_logs` (`action: "SECURITY_TOKEN_REUSE_DETECTED"`).
- **ACTUAL RESULT**: Arsitektur token rotation mendukung revokasi instan.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

#### TEST ID: QA-AUTH-004
- **MODULE**: Authentication
- **SCENARIO**: Akses Endpoint Menggunakan Token Kedaluwarsa (Boundary Test)
- **PRECONDITION**: Access Token yang sudah melewati masa berlaku 15 menit.
- **STEPS**:
  1. Panggil `GET /api/v1/employees/me/profile` dengan token kedaluwarsa.
- **EXPECTED RESULT**:
  - HTTP 401 `TOKEN_EXPIRED`.
  - Response envelope standar tanpa membocorkan stack trace library JWT.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: HIGH

---

### MODUL 02: AUTHORIZATION & ACCESS CONTROL (RBAC/ABAC)

#### TEST ID: QA-AUTHZ-001
- **MODULE**: Authorization
- **SCENARIO**: Vertical Privilege Escalation - Employee Mengakses Endpoint Admin/Payroll
- **PRECONDITION**: User A memiliki role `EMPLOYEE` tanpa permission `payroll:run`.
- **STEPS**:
  1. Karyawan A login dan memperoleh Access Token valid.
  2. Karyawan A mengirim `POST /api/v1/payroll/periods/uuid-period/calculate` secara manual via Postman.
- **EXPECTED RESULT**:
  - HTTP 403 `FORBIDDEN` ("Anda tidak memiliki hak akses untuk aksi ini").
  - Database tidak mengalami perubahan apa pun.
  - Insiden penolakan dicatat pada security log.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-AUTHZ-002
- **MODULE**: Authorization
- **SCENARIO**: Horizontal Privilege Escalation (IDOR) - Employee A Melihat Slip Gaji Employee B
- **PRECONDITION**: User A (Employee ID: 101) dan User B (Employee ID: 102).
- **STEPS**:
  1. User A login dan memanggil `GET /api/v1/payroll/my-payslips/record-id-milik-user-B/download`.
- **EXPECTED RESULT**:
  - HTTP 403 `FORBIDDEN` atau HTTP 404 `NOT_FOUND` (ABAC policy memverifikasi `record.employee_id === req.user.employee_id`).
  - Tidak ada data nominal gaji atau signed URL yang bocor ke User A.
  - Audit trail mencatat percobaan akses tidak sah.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-AUTHZ-003
- **MODULE**: Authorization
- **SCENARIO**: ABAC Department Isolation - Line Manager A Mencoba Menyetujui Cuti Bawahan Line Manager B
- **PRECONDITION**: Manager A (Dept Engineering) dan Manager B (Dept Finance). Karyawan C adalah bawahan Manager B.
- **STEPS**:
  1. Karyawan C mengajukan cuti (Request ID: LR-999).
  2. Manager A mengirimkan `PATCH /api/v1/leaves/requests/LR-999/approve`.
- **EXPECTED RESULT**:
  - HTTP 403 `FORBIDDEN` ("Anda bukan atasan langsung dari pemohon cuti ini").
  - Status cuti Karyawan C tetap `PENDING`.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

---

### MODUL 03: EMPLOYEE DATA & SENSITIVE PII PROTECTION

#### TEST ID: QA-EMP-001
- **MODULE**: Employee Management
- **SCENARIO**: Verifikasi Enkripsi Data Sensitif di Level Basis Data (Security & Data Integrity)
- **PRECONDITION**: Karyawan baru didaftarkan dengan NIK KTP `3171012345670001` dan No Rekening Bank `1234567890`.
- **STEPS**:
  1. Panggil API `POST /api/v1/employees` untuk menyimpan data karyawan baru.
  2. Buka koneksi langsung ke PostgreSQL database (SQL shell).
  3. Jalankan query: `SELECT national_id_encrypted, bank_account_no_encrypted FROM employee_identities WHERE employee_id = '...';`
- **EXPECTED RESULT**:
  - Nilai pada kolom database adalah ciphertext AES-256-GCM yang tidak dapat dibaca mentah (bukan plaintext angka identitas/rekening).
  - Kolom `national_id_masked` dan `account_number_masked` menyimpan format masking (`3171************` dan `******7890`).
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

#### TEST ID: QA-EMP-002
- **MODULE**: Employee Management
- **SCENARIO**: API Manipulation - Karyawan Mencoba Mengubah Gaji Sendiri via Profile Patch (Validation Test)
- **PRECONDITION**: Karyawan login ke portal ESS.
- **STEPS**:
  1. Karyawan mengirim request `PATCH /api/v1/employees/me/profile` dengan payload:
     `{ "phoneNumber": "+6281111", "basicSalary": 50000000, "employmentStatus": "PERMANENT" }`
- **EXPECTED RESULT**:
  - Field `phoneNumber` berhasil diperbarui.
  - Field `basicSalary` dan `employmentStatus` diabaikan total oleh DTO validator whitelist atau ditolak dengan HTTP 400.
  - Gaji di database tetap tidak berubah.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

---

### MODUL 04: ATTENDANCE MANAGEMENT & ANTI-SPOOFING

#### TEST ID: QA-ATT-001
- **MODULE**: Attendance
- **SCENARIO**: Clock-In Berhasil di Dalam Radius Geofence Kantor (Happy Path & Integration)
- **PRECONDITION**: Kantor berada di (-6.2088, 106.8456) radius 100m. Shift kerja: 09:00 - 18:00, toleransi 15 menit. Jam server: 08:50 WIB.
- **STEPS**:
  1. Karyawan mengirim `POST /api/v1/attendances/clock-in` dengan koordinat (-6.2089, 106.8457) [Jarak: ~15m] dan header `X-Idempotency-Key`.
- **EXPECTED RESULT**:
  - HTTP 200 OK. Status: `PRESENT`, `late_minutes = 0`.
  - Database: Record baru di `attendances` mencatat koordinat, IP, jam server, dan `department_id_snapshot`.
  - Event Outbox: Menerbitkan `attendance.clocked_in`.
  - Portal UI: Tombol Clock-In otomatis berganti menjadi Clock-Out.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-ATT-002
- **MODULE**: Attendance
- **SCENARIO**: Clock-In Ditolak Karena Berada di Luar Radius Geofence (Boundary & Negative Test)
- **PRECONDITION**: Karyawan berada di koordinat yang berjarak 250 meter dari kantor.
- **STEPS**:
  1. Kirim `POST /api/v1/attendances/clock-in` dengan koordinat luar kantor.
- **EXPECTED RESULT**:
  - HTTP 422 `OUT_OF_GEOFENCE` ("Anda berada di luar radius kantor yang diizinkan: 250 meter").
  - Tidak ada record yang tersimpan di tabel `attendances`.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

#### TEST ID: QA-ATT-003
- **MODULE**: Attendance
- **SCENARIO**: Pencegahan Presensi Ganda (Duplicate Submission & Idempotency Test)
- **PRECONDITION**: Karyawan sudah berhasil clock-in hari ini pada pukul 08:50.
- **STEPS**:
  1. Karyawan mengirimkan request `POST /api/v1/attendances/clock-in` sekali lagi pada pukul 08:52.
- **EXPECTED RESULT**:
  - HTTP 409 `ALREADY_CLOCKED_IN` ("Anda sudah melakukan presensi masuk hari ini").
  - Database constraint `uq_att_emp_date` mencegah adanya baris duplikat.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: HIGH

#### TEST ID: QA-ATT-004
- **MODULE**: Attendance
- **SCENARIO**: Deteksi Otomatis Keterlambatan Kerja (Business Rule Test)
- **PRECONDITION**: Shift jam 09:00, batas toleransi 09:15. Jam server saat clock-in: 09:40 WIB.
- **STEPS**:
  1. Karyawan melakukan clock-in pada pukul 09:40 WIB.
- **EXPECTED RESULT**:
  - HTTP 200 OK.
  - Record presensi berstatus `LATE`.
  - Kolom `late_minutes` terhitung tepat `40` menit (atau 25 menit tergantung kebijakan `[REQ-DEC-05]`).
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: HIGH

---

### MODUL 05: LEAVE MANAGEMENT & CONCURRENCY QUOTA

#### TEST ID: QA-LEV-001
- **MODULE**: Leave
- **SCENARIO**: Pengajuan Cuti Melebihi Sisa Saldo Kuota (Boundary & Negative Test)
- **PRECONDITION**: Karyawan memiliki sisa saldo cuti tahunan 4 hari.
- **STEPS**:
  1. Karyawan mengajukan cuti 5 hari kerja (contoh: Senin - Jumat) via `POST /api/v1/leaves/requests`.
- **EXPECTED RESULT**:
  - HTTP 422 `INSUFFICIENT_LEAVE_BALANCE` ("Sisa kuota cuti Anda tidak mencukupi. Kuota tersisa: 4 hari, pengajuan: 5 hari").
  - Saldo di `leave_balances` tidak berubah (`pending_days` tetap 0).
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

#### TEST ID: QA-LEV-002
- **MODULE**: Leave
- **SCENARIO**: Concurrency Test - Dua Pengajuan Cuti Diajukan Bersamaan Menghabiskan Kuota (Race Condition)
- **PRECONDITION**: Karyawan memiliki sisa saldo cuti tepat 3 hari.
- **STEPS**:
  1. Kirimkan dua request pengajuan cuti secara bersamaan (paralel) menggunakan multithreading:
     - Request A: 3 hari (10 - 12 Oktober)
     - Request B: 3 hari (17 - 19 Oktober)
- **EXPECTED RESULT**:
  - Berkat isolasi transaksi database dan pessimistic locking (`SELECT ... FOR UPDATE`), hanya 1 request yang berhasil (HTTP 201 Created), sedangkan request lainnya ditolak dengan HTTP 422 `INSUFFICIENT_LEAVE_BALANCE`.
  - Saldo kuota `remaining_days` tidak boleh bernilai negatif (-3).
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-LEV-003
- **MODULE**: Leave
- **SCENARIO**: Verifikasi Atomic Rollback Saat Cuti Ditolak Manager (Integration & DB Integrity)
- **PRECONDITION**: Saldo awal 12 hari. Karyawan mengajukan 3 hari cuti (Status: `PENDING`, `pending_days` = 3, `remaining_days` = 9).
- **STEPS**:
  1. Line Manager memanggil `PATCH /api/v1/leaves/requests/:id/reject` dengan alasan penolakan.
- **EXPECTED RESULT**:
  - HTTP 200 OK. Status cuti berubah menjadi `REJECTED`.
  - Dalam 1 database transaction: `pending_days` kembali ke `0`, dan `remaining_days` kembali utuh menjadi `12`.
  - Outbox event `leave.rejected` diterbitkan -> Notifikasi terkirim ke Karyawan.
  - Jejak penolakan dan komentar manager tersimpan di `leave_approvals` dan `audit_logs`.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-LEV-004
- **MODULE**: Leave
- **SCENARIO**: File Upload Abuse - Unggah File Berbahaya Menyamar Sebagai Surat Dokter (Security Test)
- **PRECONDITION**: Karyawan mengajukan cuti sakit yang mewajibkan lampiran bukti dokter.
- **STEPS**:
  1. Karyawan mengunggah file skrip berbahaya `exploit.php` yang diubah namanya menjadi `surat_dokter.pdf` (MIME spoofing).
- **EXPECTED RESULT**:
  - Server melakukan validasi **Magic Bytes / File Header Signature**.
  - Server mendeteksi ketidaksesuaian binary dan menolak dengan HTTP 422 `INVALID_FILE_TYPE` ("Format berkas tidak valid. Hanya berkas PDF dan gambar asli yang diizinkan").
  - Berkas tidak tersimpan ke media storage.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

---

### MODUL 06: PAYROLL CALCULATION & FINANCIAL IMMUTABILITY

#### TEST ID: QA-PAY-001
- **MODULE**: Payroll
- **SCENARIO**: Presisi Perhitungan Pajak PPh 21 Skema TER Terbaru (Functional & Calculation Test)
- **PRECONDITION**: Karyawan status `TER Kategori A` (TK/0), Gaji Bruto bulan ini Rp 8.000.000. Sesuai PP 58/2023, tarif TER Kategori A untuk rentang Rp 7.500.000 - Rp 8.550.000 adalah **1.5%**.
- **STEPS**:
  1. Jalankan proses kalkulasi periode payroll via `POST /api/v1/payroll/periods/:id/calculate`.
  2. Periksa baris `payroll_items` untuk komponen pajak PPh 21.
- **EXPECTED RESULT**:
  - Nilai potongan PPh 21 dihitung tepat: `1.5% x Rp 8.000.000 = Rp 120.000`.
  - Tidak ada selisih pembulatan desimal yang keliru.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-PAY-002
- **MODULE**: Payroll
- **SCENARIO**: Financial Immutability - Percobaan Manipulasi Data Gaji pada Periode LOCKED (Negative & Security)
- **PRECONDITION**: Periode payroll bulan September 2026 telah berstatus `LOCKED`.
- **STEPS**:
  1. Pengguna memanggil endpoint update slip gaji atau mencoba menambahkan lembur baru pada tanggal di periode terkunci tersebut.
- **EXPECTED RESULT**:
  - HTTP 400 `PAYROLL_PERIOD_LOCKED` ("Periode penggajian telah dikunci. Modifikasi data finansial dan kehadiran dilarang").
  - Basis data menolak mutasi.
  - Slip gaji historis tetap tidak berubah 1 rupiah pun.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-PAY-003
- **MODULE**: Payroll
- **SCENARIO**: Historical Integrity - Kenaikan Gaji Karyawan Bulan Ini Tidak Boleh Mengubah Gaji Masa Lalu
- **PRECONDITION**: Karyawan memiliki slip gaji bulan Agustus Rp 10.000.000. Pada bulan September, HR menaikkan gaji pokok karyawan menjadi Rp 15.000.000 di `employee_salary_structures`.
- **STEPS**:
  1. Buka kembali slip gaji bulan Agustus 2026 melalui `GET /api/v1/payroll/my-payslips/:agustusRecordId`.
- **EXPECTED RESULT**:
  - Gaji pokok pada slip Agustus 2026 **TETAP Rp 10.000.000** (terbaca dari `basic_salary_snapshot_encrypted` pada `payroll_records`).
  - Kenaikan gaji Rp 15.000.000 hanya diterapkan pada periode penggajian September 2026 dan seterusnya.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-PAY-004
- **MODULE**: Payroll
- **SCENARIO**: Network Timeout & Idempotency Saat Batch Payroll Run (Resilience Test)
- **PRECONDITION**: 500 karyawan sedang diproses dalam background worker.
- **STEPS**:
  1. Koneksi jaringan terputus saat request `POST /api/v1/payroll/periods/:id/calculate` dikirimkan.
  2. Klien mengirim ulang request yang sama dengan header `X-Idempotency-Key` yang identik.
- **EXPECTED RESULT**:
  - Server mengenali idempotency key yang sama dan mengembalikan status pekerjaan yang sedang berjalan (HTTP 409 `OPERATION_IN_PROGRESS` atau HTTP 202 dengan Job ID yang sama).
  - Tidak terjadi kalkulasi ganda atau duplikasi slip gaji pada tabel `payroll_records`.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

---

### MODUL 07: BENEFITS & REIMBURSEMENT CLAIMS

#### TEST ID: QA-BEN-001
- **MODULE**: Benefits
- **SCENARIO**: Pengajuan Klaim Melebihi Plafon Pagu Tahunan (Boundary & Validation Test)
- **PRECONDITION**: Karyawan memiliki sisa pagu kacamata Rp 300.000.
- **STEPS**:
  1. Karyawan mengajukan klaim kwitansi kacamata sebesar Rp 500.000.
- **EXPECTED RESULT**:
  - HTTP 422 `BENEFIT_LIMIT_EXCEEDED` ("Nominal klaim melebihi sisa pagu manfaat Anda: Rp 300.000").
  - Pengajuan ditolak sebelum berkas kuitansi disimpan permanen.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: HIGH

#### TEST ID: QA-BEN-002
- **MODULE**: Benefits
- **SCENARIO**: Validasi Kedaluwarsa Tanggal Kuitansi (> 30 Hari) (Business Rule Test)
- **PRECONDITION**: Tanggal pengajuan klaim adalah 26 September 2026.
- **STEPS**:
  1. Karyawan mengunggah kuitansi tertanggal 10 Agustus 2026 (> 45 hari yang lalu).
- **EXPECTED RESULT**:
  - HTTP 422 `INVOICE_EXPIRED` ("Bukti kuitansi tidak boleh lebih dari 30 hari kalender sejak tanggal transaksi").
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: MEDIUM

---

### MODUL 08: PERFORMANCE, CAREER & RECRUITMENT

#### TEST ID: QA-PERF-001
- **MODULE**: Performance Management
- **SCENARIO**: Validasi Total Bobot Target KPI Wajib Tepat 100% (Validation Test)
- **PRECONDITION**: Siklus review kinerja aktif.
- **STEPS**:
  1. Karyawan/Manager mengisi target KPI dengan rincian bobot: KPI 1 (40%), KPI 2 (30%), KPI 3 (20%) [Total: 90%].
  2. Klik Submit Sasaran Kerja.
- **EXPECTED RESULT**:
  - HTTP 422 `VALIDATION_FAILED` ("Akumulasi bobot KPI wajib tepat 100%. Total saat ini: 90%").
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: MEDIUM

#### TEST ID: QA-REC-001
- **MODULE**: Recruitment (ATS)
- **SCENARIO**: Konversi Kandidat Diterima (Hired) Menjadi Master Data Karyawan (End-to-End Integration)
- **PRECONDITION**: Pelamar berstatus `OFFERING_ACCEPTED` di pipeline rekrutmen.
- **STEPS**:
  1. HR Recruiter memanggil `POST /api/v1/recruitment/applications/:id/convert-to-employee` dengan data NIK, departemen, dan gaji awal.
- **EXPECTED RESULT**:
  - HTTP 201 Created.
  - Record baru tercipta di tabel `employees` dan akun baru di tabel `users`.
  - Data resume, kontak, dan nama pelamar tersinkronisasi tanpa input manual ulang.
  - Status lamaran di ATS berubah menjadi `HIRED`.
  - Outbox event `employee.created` memicu email aktivasi kredensial login.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

---

### MODUL 09: NOTIFICATION ENGINE & RESILIENCE FALLBACK

#### TEST ID: QA-NOTIF-001
- **MODULE**: Notification
- **SCENARIO**: Pengiriman Notifikasi Multi-Channel Lengkap (In-App, WebSocket, Email)
- **PRECONDITION**: Karyawan A submit cuti ke Manager B.
- **STEPS**:
  1. Request `POST /api/v1/leaves/requests` berhasil dieksekusi.
  2. Amati record database di tabel `notifications`.
  3. Amati pesan push WebSocket di browser Manager B.
  4. Amati antrian BullMQ mailer.
- **EXPECTED RESULT**:
  - Record notifikasi tersimpan di tabel `notifications` dengan status `is_read = false`.
  - Browser Manager B menerima toast notifikasi dan unread badge lonceng bertambah (+1) secara instan tanpa reload halaman.
  - BullMQ mengirim email notifikasi ke alamat email kerja Manager B.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-NOTIF-002
- **MODULE**: Notification
- **SCENARIO**: Ketahanan Saat WebSocket Terputus - Graceful HTTP Fallback Polling (Resilience Test)
- **PRECONDITION**: Klien membuka portal ESS, koneksi WebSocket terputus mendadak (simulasi network drop / proxy blocking).
- **STEPS**:
  1. Putus koneksi socket klien secara sengaja di DevTools.
  2. Buat notifikasi baru di backend untuk user tersebut.
  3. Amati perilaku klien frontend.
- **EXPECTED RESULT**:
  - Klien mendeteksi socket disconnect dan secara otomatis beralih (*graceful fallback*) ke mekanisme HTTP Polling berkala (interval 30 detik) ke `GET /api/v1/notifications/unread-count`.
  - Notifikasi baru tetap muncul di antarmuka tanpa ada pesan yang hilang.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: HIGH

#### TEST ID: QA-NOTIF-003
- **MODULE**: Notification
- **SCENARIO**: Layanan Email Eksternal (SMTP) Down - Non-Blocking Transaction & Retry Backoff
- **PRECONDITION**: Server SMTP eksternal sengaja dimatikan (simulasi outage Mailgun/SendGrid).
- **STEPS**:
  1. Karyawan mengajukan cuti.
- **EXPECTED RESULT**:
  - Transaksi pengajuan cuti di API **TETAP SUKSES** (HTTP 201 Created) dan tersimpan aman di database PostgreSQL (Tidak terjadi cascading failure).
  - Worker BullMQ mendeteksi error koneksi SMTP dan menjadwalkan ulang (*exponential backoff retry*) hingga 3 kali percobaan.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: CRITICAL

---

### MODUL 10: AUDIT LOG & TAMPER-PROOF TRAIL

#### TEST ID: QA-AUD-001
- **MODULE**: Audit Log
- **SCENARIO**: Perekaman Delta Change Snapshot Pada Perubahan Data Sensitif (Audit Trail)
- **PRECONDITION**: HR Staff memiliki hak mengubah nomor rekening bank karyawan.
- **STEPS**:
  1. HR Staff mengubah nomor rekening karyawan dari `11112222` menjadi `33334444`.
  2. Buka tabel `audit_logs` untuk entitas tersebut.
- **EXPECTED RESULT**:
  - Tercipta baris baru di `audit_logs` dengan kolom:
    - `action`: `UPDATE`
    - `entity_type`: `EmployeeBankAccount`
    - `old_values`: `{ "accountNumberMasked": "******2222" }`
    - `new_values`: `{ "accountNumberMasked": "******4444" }`
    - `ip_address`: Alamat IP klien pelaksana
    - `user_id`: ID HR Staff pelaksana
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

#### TEST ID: QA-AUD-002
- **MODULE**: Audit Log
- **SCENARIO**: Tamper-Proof Verification - Percobaan Hapus/Ubah Record Audit Log (Security & Integrity Test)
- **PRECONDITION**: Super Admin login ke database SQL shell.
- **STEPS**:
  1. Jalankan query: `DELETE FROM audit_logs WHERE id = '...';` atau `UPDATE audit_logs SET action = 'NONE';`
- **EXPECTED RESULT**:
  - PostgreSQL menolak eksekusi dengan error: `permission denied for table audit_logs`.
  - Log audit bersifat absolut **Append-Only** dan tidak dapat dimanipulasi oleh siapa pun.
- **STATUS**: READY FOR AUTOMATION
- **SEVERITY**: BLOCKER

---

## 3. PENGUJIAN KASUS KHUSUS (ADVERSARIAL & EDGE CASES MATRIX)

| ID Uji | Vektor Serangan / Skenario Khusus | Modul Terkait | Dampak / Risiko | Ekspektasi Hasil Uji | Severity |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **ADV-01** | **SQL Injection via Search Query** (`?search=' OR '1'='1`) | Employee | Kebocoran data seluruh karyawan | ORM parameterized query menetralkan input; mencari literal teks; HTTP 200 dengan data kosong. | **BLOCKER** |
| **ADV-02** | **Stored XSS via Catatan Presensi** (`<script>alert(1)</script>`) | Attendance | Eksekusi skrip jahat di browser Admin | Output di-encode otomatis oleh React; sanitasi input DOMPurify; skrip tidak dieksekusi. | **CRITICAL** |
| **ADV-03** | **Manipulasi Lokasi (Fake GPS Mock Provider)** | Attendance | Presensi palsu dari rumah | Validasi koordinat GPS dikombinasikan dengan validasi IP Address WiFi kantor / subnet terdaftar. | **CRITICAL** |
| **ADV-04** | **Mass Assignment pada DTO Update** (`isAdmin: true`) | User | Eskalasi hak akses tidak sah | NestJS `ValidationPipe({ whitelist: true })` membuang atribut di luar DTO. | **CRITICAL** |
| **ADV-05** | **Path Traversal pada File Download** (`../../../../etc/passwd`) | Documents | Pembacaan berkas sensitif server | Validasi UUID nama file dan pembatasan download hanya melalui URL signed storage terisolasi. | **BLOCKER** |
| **ADV-06** | **Race Condition pada Approval Cuti Simultan** | Leave | Saldo cuti terpotong melebihi kuota | `SELECT ... FOR UPDATE` mengantrikan approval kedua secara serial; approver kedua menerima pesan kuota habis. | **BLOCKER** |
| **ADV-07** | **Large File DoS (Unggah file 500MB)** | Documents | Server memory exhaustion | Nginx & Express membatasi payload `limit: 5MB`; request diputus sebelum masuk memori (HTTP 413). | **HIGH** |
| **ADV-08** | **Pembatalan Cuti Saat Payroll Sedang Dihitung** | Leave/Payroll | Inkonsistensi potongan gaji | Database row lock pada periode penggajian mencegah modifikasi absensi/cuti pada tanggal yang sama. | **CRITICAL** |

---

## 4. LAPORAN QA & REKOMENDASI RILIS (QA REPORT & RELEASE RECOMMENDATION)

### 4.1. Audit Temuan Arsitektur & Risiko (Pre-Code Assessment)
Berdasarkan tinjauan komprehensif terhadap dokumen PRD, Desain Basis Data, dan Kontrak API:
1. **Arsitektur Modular Monolith & Clean Layers**: Telah memenuhi standar isolasi domain, pemisahan antarmuka Dual-Panel yang bersih, serta kesiapan transaksional ACID yang mutlak dibutuhkan oleh modul finansial penggajian.
2. **Kekebalan Data Historis (Historical Immutability)**: Penempatan snapshot departemen, jabatan, dan struktur gaji pada tabel `payroll_records` dan `attendances` berhasil memitigasi risiko anomali data di masa depan (misal: mutasi jabatan tidak merusak slip gaji lampau).
3. **Pemberitahuan Asinkron & Outbox Pattern**: Penerapan `transactional_outbox` memitigasi risiko kehilangan pesan event notifikasi saat terjadi kegagalan jaringan atau Redis restart.
4. **Catatan Kritis yang Wajib Dituntaskan Sebelum Rilis Produksi**:
   - Poin ambiguitas bisnis `[REQ-DEC-01]` s/d `[REQ-DEC-11]` pada PRD wajib diputuskan secara formal oleh stakeholder bisnis sebelum Phase 0 selesai.
   - Enkripsi simetris kolom PII (`AES-256-GCM`) wajib menggunakan Key Management Service (KMS) atau rotasi environment key yang terpisah dari repository.

### 4.2. Kriteria Kelulusan Rilis (Release Quality Gates)
Sebelum aplikasi dapat dideploy ke lingkungan Staging/Produksi, seluruh gate berikut wajib berstatus **PASS 100%**:
- [ ] **Zero Blocker & Zero Critical Defects**: Tidak ada bug berkategori Blocker atau Critical yang masih berstatus open.
- [ ] **Automated Test Coverage**: Minimal **95% coverage** pada Core Domain (`Auth`, `Payroll`, `Leave`, `Attendance`) dan minimal **80% global coverage**.
- [ ] **Security Vulnerability Audit**: Hasil scan `npm audit`, `snyk`, dan OWASP ZAP menunjukkan zero high/critical vulnerabilities.
- [ ] **Idempotency & Concurrency Stress Test**: Lulus uji beban konkurensi (Apache JMeter / k6) simulasi 1.000 presensi masuk serentak dalam 60 detik tanpa kegagalan integritas basis data.

### 4.3. Rekomendasi Rilis QA (Final Recommendation)
**STATUS REKOMENDASI: REKOMENDASI PERSETUJUAN BERSYARAT (CONDITIONAL GO FOR FOUNDATION)**
- **Keputusan**: Seluruh spesifikasi pengujian telah lengkap dan siap menjadi panduan *Test-Driven Development (TDD)* bagi tim engineering. 
- **Langkah Lanjutan**: Tim engineering diizinkan melanjutkan ke persiapan **PHASE 0 (Foundation Setup & Infrastructure)** setelah blueprint dan PRD ini disetujui. Implementasi kode fitur bisnis tidak boleh dimulai sebelum fondasi testing dan skema basis data siap.
