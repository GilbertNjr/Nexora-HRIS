# SOFTWARE MAINTENANCE PROTOCOL & CHANGE IMPACT ANALYSIS (SOP)
## Human Resource Information System (HRIS) Berbasis Web
**Role:** Senior Software Maintenance Engineer  
**Version:** 1.0.0  
**Target Horizon:** 1-3 Years Long-Term Maintenance  
**Core Principle:** MINIMAL CHANGE, ZERO BREAKING CHANGES, STRICT BACKWARD COMPATIBILITY  

---

## 1. PROTOKOL INVESTIGASI SEBELUM PERUBAHAN (17-POINT IMPACT TRACE)

Sebelum satu baris kode pun diubah pada existing HRIS, engineer wajib menelusuri 17 elemen sistem berikut:

1. **Modul Terkait (Bounded Context)**: Modul mana yang menjadi target utama dan modul mana yang berelasi (misal: perubahan di *Leave* berdampak ke *Attendance* dan *Payroll*).
2. **Database Table**: Tabel mana yang terpengaruh, kolom apa yang bertambah/berubah, dan apakah tabel tersebut memiliki relasi foreign key aktif.
3. **Database Migration**: Apakah perubahan memerlukan file migrasi baru? Wajib mematuhi pola *Expand and Contract Pattern*.
4. **Model / Entity**: Model ORM dan Domain Entity yang harus diperbarui dengan invariant bisnis yang tetap valid.
5. **Service / Use-Case**: Service layer mana yang memproses logika bisnis tersebut. Dilarang meletakkan logika baru di controller.
6. **Controller**: Controller mana yang menerima request dan apakah decorator/guard otorisasi tetap aman.
7. **API Endpoint**: Apakah ada perubahan kontrak URL, request body, query parameter, atau response payload. Jika ada breaking change, wajib rilis versi baru (`/api/v2/`).
8. **Frontend Page**: Halaman Admin Panel (`/admin`) dan/atau ESS Portal (`/portal`) yang menampilkan fitur tersebut.
9. **Frontend Component**: Komponen UI yang terpengaruh (Form input, modal, tabel data, tombol aksi).
10. **State Management**: Zustand store, TanStack Query cache key, atau invalidation query yang perlu disesuaikan.
11. **Notification**: Apakah perubahan memicu notifikasi baru (In-App badge, push WebSocket, email)?
12. **Event**: Apakah ada Domain Event baru yang diterbitkan ke `transactional_outbox`?
13. **Queue / Job**: Apakah perubahan berdampak pada BullMQ background job (misal kalkulasi payroll atau report worker)?
14. **Audit Log**: Apakah aksi mutasi tersebut wajib mencatat delta snapshot nilai lama vs baru di tabel `audit_logs`?
15. **Automated Tests**: Unit test, Integration test, dan E2E test yang harus ditambahkan atau disesuaikan (Dilarang menghapus test yang sudah ada).
16. **Documentation**: Pembaruan dokumen di `/docs` (PRD, API, Database, Testing, Changelog).
17. **External Dependency**: Ketergantungan pihak ketiga (Penyedia Storage S3, SMTP Mailer, Redis, Bank API).

---

## 2. TEMPLATE STANDAR: CHANGE IMPACT REPORT

Setiap usulan perubahan wajib didokumentasikan dalam format standar berikut sebelum eksekusi:

```markdown
# CHANGE IMPACT REPORT: [JUDUL PERUBAHAN]
**RFC / Ticket ID:** CR-XXXX
**Engineer:** Senior Software Maintenance Engineer
**Date:** YYYY-MM-DD
**Risk Level:** [LOW / MEDIUM / HIGH / CRITICAL]

### 1. CURRENT BEHAVIOR
[Deskripsi perilaku sistem saat ini sebelum perubahan]

### 2. REQUESTED BEHAVIOR
[Deskripsi detail perilaku yang diinginkan oleh stakeholder/user]

### 3. AFFECTED COMPONENTS (17-POINT TRACE)
- Modul Terkait:
- Database Tables & Migrations:
- Backend Entities, Use-Cases, & Controllers:
- API Contracts & Endpoints:
- Frontend Pages, Components, & State:
- Events, Notifications, & BullMQ Jobs:
- Audit Log Requirements:
- Automated Test Suites:

### 4. UNAFFECTED COMPONENTS
[Daftar modul/komponen yang dijamin terisolasi dan tidak terpengaruh]

### 5. RISK ASSESSMENT
- Breaking Change Risk:
- Database & Data Integrity Risk:
- Security & PII Exposure Risk:
- Regression Risk:
- Migration & Schema Evolution Risk:

### 6. ROLLBACK PLAN
[Langkah-langkah pemulihan instan jika terjadi insiden saat deploy]

### 7. MINIMAL IMPLEMENTATION PLAN
[Rencana implementasi dengan perubahan kode terkecil yang paling aman]
```

---

## 3. PROTOKOL VERIFIKASI PASCA IMPLEMENTASI

Setelah kode diimplementasikan di lingkungan pengujian, wajib menjalankan 8 gate verifikasi:
1. **Run Affected Tests**: Menjalankan test suite modul terkait.
2. **Run Regression Tests**: Menjalankan test suite seluruh sistem untuk memastikan tidak ada fitur lama yang rusak.
3. **Run Security Tests**: Memverifikasi RBAC/ABAC guards, sanitasi input, dan enkripsi data PII.
4. **Run Migration Test**: Uji migrasi maju (*migrate*) dan migrasi mundur (*rollback/down*).
5. **Run API Test**: Verifikasi kepatuhan DTO dan response envelope standar.
6. **Run Frontend Test**: Pengujian interaksi komponen dan responsivitas UI.
7. **Update Documentation**: Sinkronisasi dokumen `/docs`.
8. **Update CHANGELOG**: Mencatat rincian perubahan sesuai format *Keep a Changelog*.
