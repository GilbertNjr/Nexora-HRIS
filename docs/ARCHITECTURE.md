# SYSTEM ARCHITECTURE DOCUMENT
## NEXORA — Human Resource Information System (HRIS)
**Tagline:** Human Resource Solutions | Connect • Innovate • Grow  
**Version:** 1.0.0  
**Pattern:** Modular Monolith with Clean / Hexagonal Architecture  
**Execution Target:** High-Availability Enterprise Web Application  

---

## 1. Architectural Philosophy: Modular Monolith
Sistem ini menggunakan pola **Modular Monolith** dengan batasan domain (*Domain-Driven Design - Bounded Context*) yang ketat. 

### Mengapa Modular Monolith dan Bukan Microservices?
1. **Integritas Transaksional (ACID)**: Proses bisnis HRIS (misalnya: Approval Cuti yang memotong Saldo Cuti sekaligus memicu pemotongan Payroll dan memvalidasi Kalender Absensi) memerlukan konsistensi data yang sangat ketat tanpa overhead *Two-Phase Commit* atau *Distributed Saga*.
2. **Efisiensi Operasional & Biaya**: Microservices membawa kompleksitas jaringan, service discovery, latency RPC, dan infrastruktur orkestrasi yang tinggi pada fase awal hingga menengah.
3. **Modularitas Tanpa Kompleksitas Jaringan**: Setiap modul diisolasi secara internal (Domain Entities, DTOs, Use Cases, dan Repository masing-masing). Komunikasi antar-modul dilakukan melalui antarmuka publik (*Public Module Contracts / Domain Events*), bukan melalui query silang (*no cross-domain queries*).
4. **Jalur Migrasi Masa Depan (Microservices-Ready)**: Jika di tahun ke-2 atau ke-3 modul tertentu (misalnya *Attendance* yang menangani jutaan traffic clock-in serentak di pagi hari) memerlukan scaling independen, modul tersebut dapat diekstraksi menjadi microservice mandiri tanpa perlu refactoring logika bisnis.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT CLIENTS                                   |
|   +--------------------------------------+   +--------------------------------+   |
|   |          ADMIN / HR PORTAL           |   | EMPLOYEE SELF-SERVICE (ESS)    |   |
|   | (Executive, HR Admin, Payroll, Recr) |   | (Mobile-first, Line Managers)  |   |
|   +--------------------------------------+   +--------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           | HTTP / HTTPS / WSS
                                           v
+-----------------------------------------------------------------------------------+
|                        API GATEWAY / REVERSE PROXY                               |
|   Nginx / Cloudflare (SSL Offloading, WAF, Rate Limiting, Compression, CORS)     |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                       BACKEND APPLICATION RUNTIME                                 |
|                                                                                   |
|  +--------------------+---------------------+--------------------+-------------+  |
|  | Presentation Layer | Controllers         | WebSocket Gateway  | Middleware  |  |
|  +--------------------+---------------------+--------------------+-------------+  |
|  | Application Layer  | Use Cases / Services| Event Handlers     | DTO Mapping |  |
|  +--------------------+---------------------+--------------------+-------------+  |
|  | Domain Layer       | Core Entities       | Business Rules     | Value Obj   |  |
|  +--------------------+---------------------+--------------------+-------------+  |
|  | Infrastructure     | Repositories (ORM)  | Mailers / Push     | Filesystem  |  |
|  +--------------------+---------------------+--------------------+-------------+  |
|                                                                                   |
|  +------------------------- MODULE BOUNDARIES ---------------------------------+  |
|  | [Auth & RBAC] | [Employee Core] | [Attendance]  | [Leave Mgmt] | [Payroll]  |  |
|  | [Benefits]    | [Performance]   | [Recruitment] | [Career]     | [Docs]     |  |
|  | [Audit Log]   | [Notification]  | [Analytics]   | [Reports]    | [Settings] |  |
|  +---------------+-----------------+---------------+--------------+------------+  |
+------------------------------------------+----------------------------------------+
              |                                            |
              v                                            v
+-----------------------------+             +-------------------------------+
|     PRIMARY DATABASE        |             |      CACHE & ASYNC BROKER     |
|   PostgreSQL 16+            |             |   Redis 7+ (In-Memory)        |
| - Relational Integrity (FK) |             | - Session / Token Blacklist   |
| - ACID Financial Records    |             | - BullMQ Background Queues    |
| - JSONB Audit Log Payloads  |             | - WebSocket Pub/Sub Engine    |
| - Row-Level Encryption      |             | - High-performance Cache     |
+-----------------------------+             +-------------------------------+
```

---

## 2. Layered (Clean) Architecture Rules

Setiap modul mengadopsi 4 lapisan pemisahan tanggung jawab:

### 1. Presentation Layer (Tipis / Thin)
- Menangani parsing request HTTP / WebSocket payload.
- Menerapkan guards/middleware autentikasi dan otorisasi peran (*RBAC guards*).
- Menjalankan validasi skema input (class-validator / Zod).
- Memanggil Application Service yang relevan.
- Mengembalikan response dengan format *Standard API Response Envelope*.
- **Pantangan**: Tidak boleh ada business logic, query SQL/ORM, atau perhitungan matematis di Controller.

### 2. Application Layer (Orchestration / Use Case)
- Mengoordinasikan alur bisnis untuk satu skenario use-case (misal: `ApproveLeaveUseCase`, `ProcessMonthlyPayrollUseCase`).
- Mengelola transaksi database (*Database Transaction Manager*).
- Menerbitkan Domain Event setelah operasi berhasil (misal: `LeaveApprovedEvent`).
- Berinteraksi dengan antarmuka Repository (Dependency Inversion).

### 3. Domain Layer (The Core)
- Berisi entitas murni (*Entities*), Aturan Bisnis (*Business Invariants*), dan Objek Nilai (*Value Objects*).
- Independen dari framework, database, ORM, maupun protokol HTTP.
- Memastikan integritas state (misal: "Saldo cuti tidak boleh bernilai negatif", "Slip gaji yang berstatus LOCKED tidak boleh dimutasi").

### 4. Infrastructure Layer (Adapters)
- Implementasi konkret dari antarmuka Repository menggunakan ORM (Prisma / TypeORM / Drizzle / Knex).
- Interaksi ke sistem eksternal: File Storage (S3 / Local Secure Storage), Layanan Email (SMTP/Resend), SMS/WhatsApp Gateway.
- Mekanisme Caching dan integrasi antrian (*Queue Worker*).

---

## 3. Dual-Panel Frontend Architecture
Frontend dirancang dengan pemisahan konteks yang jelas namun berbagi Design System dan Utility Core:

### A. Admin / HR Panel
- **Fokus Pengguna**: Efisiensi input data massal, visualisasi analitik, tabel data tingkat lanjut dengan filter multi-kolom, export data, dan workflow audit.
- **Fitur Utama**:
  - Advanced Data Table (Virtual scrolling, server-side pagination, multi-sort, dynamic columns).
  - Payroll Calculation Console & Verification Matrix.
  - Multi-level Approval Dashboard.
  - Organization Chart Viewer.
  - Audit Trail Log Inspector.

### B. Employee Self-Service (ESS) Panel
- **Fokus Pengguna**: Kemudahan penggunaan di perangkat mobile/desktop, akses cepat dengan interaksi minimal (*one-touch actions*).
- **Fitur Utama**:
  - Quick Clock-in / Clock-out dengan live GPS Geofence & kamera selfie (*anti-spoofing*).
  - Kartu Ringkasan Kehadiran & Status Pengajuan Hari Ini.
  - Form Pengajuan Cuti / Sakit / Lembur yang ringkas dengan drag-and-drop unggah bukti.
  - Payslip Viewer dengan proteksi PIN/Password dan download PDF.
  - Pusat Notifikasi real-time & badge unread.

---

## 4. Technology Stack Recommendation

| Layer | Recommended Technology | Rationale & Justification |
| :--- | :--- | :--- |
| **Backend Framework** | **Node.js with NestJS (TypeScript)** | Dukungan native untuk Modular Monolith, Dependency Injection, class-validator, Swagger OpenAPI otomatis, dan ekosistem enterprise yang kuat. |
| **Database** | **PostgreSQL 16+** | Relational integrity tinggi, dukungan JSONB untuk audit trail fleksibel, partisi tabel kehadiran/audit yang efisien, dan performa tinggi. |
| **Caching & Job Queue** | **Redis 7+ with BullMQ** | Antrian pemrosesan payroll massal, worker pengiriman email, pub/sub untuk WebSocket, dan caching query. |
| **Frontend Framework** | **Next.js / React (TypeScript)** | Single unified framework dengan SSR/SSG untuk performa, modular components, React Server Actions / REST API client, dan ekosistem UI modern. |
| **State & Data Fetching** | **TanStack Query (React Query) + Zustand** | Caching server-state otomatis, optimis update pada pengajuan cuti/presensi, dan penanganan offline/reconnect yang tangguh. |
| **Styling & Design System** | **Tailwind CSS + Headless UI / Radix UI** | Desain responsif, clean aesthetic, support dark/light mode, aksesibilitas WCAG, dan tanpa styling bloat. |
| **Real-Time Engine** | **Socket.io / Native WebSockets with Redis Adapter** | Komunikasi dua arah untuk notifikasi instan, status approval, dan broadcast sistem secara andal. |
| **Containerization & CI/CD** | **Docker & GitHub Actions / GitLab CI** | Portabilitas lingkungan lokal, staging, dan produksi; pipeline pengujian otomatis sebelum merge. |

---

## 5. Event-Driven Inter-Module Communication
Untuk menjaga isolasi antar modul, komunikasi tidak menggunakan import langsung antar service modul lain. Sebagai gantinya, digunakan pola **Internal Domain Event Dispatcher**:

```
[Attendance / Leave Module]
             |
             v (Publishes: "leave.approved")
  [In-Memory / Redis Event Bus]
             |
             +---> [Attendance Module: Marks date as Leave on Attendance Sheet]
             +---> [Payroll Module: Recalculates Unpaid / Paid Leave deduction]
             +---> [Notification Module: Queues In-App & Email to Employee]
             +---> [Audit Module: Records approval trail to immutable log]
```
Dengan pola ini:
- Modul *Leave* tidak perlu tahu implementasi internal *Payroll* atau *Notification*.
- Penambahan modul baru (misal: integrasi Google Calendar atau Slack) di masa depan cukup menambahkan Listener baru tanpa mengubah baris kode di modul *Leave*.
