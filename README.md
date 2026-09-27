# NEXORA — Human Resource Information System (HRIS)

<div align="center">
  <h3>Human Resource Solutions | Connect • Innovate • Grow</h3>
  <p>Sistem Manajemen Sumber Daya Manusia (HRIS) Berbasis Web Enterprise dengan Arsitektur Modular Monolith, Dual-Panel Portal (HR Admin & ESS), dan End-to-End Type Safety.</p>
</div>

---

## 📌 Ringkasan Proyek

**NEXORA HRIS** dirancang untuk memenuhi standar operasional perusahaan menengah hingga besar sekaligus memiliki kesiapan jangka panjang untuk model B2B SaaS (*Software-as-a-Service*). Sistem ini mengintegrasikan seluruh siklus SDM mulai dari rekrutmen, onboarding karyawan, presensi dengan geofencing anti-fraud, cuti bertingkat, hingga kalkulasi penggajian (Payroll) otomatis yang patuh pada regulasi ketenagakerjaan dan perpajakan Indonesia (PPh 21 skema TER 2024 & BPJS Ketenagakerjaan/Kesehatan).

---

## 🏗️ Arsitektur & Teknologi

Sistem mengadopsi pola **Modular Monolith** dengan prinsip *Clean / Hexagonal Architecture* untuk menjaga integritas transaksional finansial (ACID) tanpa kompleksitas jaringan microservices:

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Backend API** | **Node.js (v20+ LTS) / NestJS** | TypeScript, Modular Monolith, class-validator, Swagger OpenAPI |
| **Frontend Web** | **Next.js 14+ / React** | TypeScript, App Router, SSR/SSG, Tailwind CSS (NEXORA Design Tokens) |
| **Basis Data** | **PostgreSQL 16+ / Supabase** | Relational Integrity (FK), Row-Level Security, JSONB Audit Trail |
| **Cache & Queue** | **Redis 7+ / BullMQ** | Antrian kalkulasi payroll massal, email worker transaksional |
| **Real-Time Engine** | **Socket.io** | WebSocket notifikasi instan & pembaruan status persetujuan |
| **Containerization** | **Docker** | Portabilitas multi-environment (Local, Staging, Production) |

---

## 📂 Struktur Repositori

```text
.
├── apps/
│   ├── api/                   # Backend NestJS (Modular Monolith API)
│   └── web/                   # Frontend Next.js (Dual-Panel: Admin HR & ESS)
├── docs/                      # Blueprint Arsitektur Lengkap & Spesifikasi
│   ├── API.md                 # Standar Kontrak RESTful & Response Envelope
│   ├── ARCHITECTURE.md        # Arsitektur Modular Monolith & Clean Layers
│   ├── BRANDING.md            # Panduan Brand Identity & Token Warna NEXORA
│   ├── CHANGELOG.md           # Catatan Riwayat Rilis & Modifikasi
│   ├── CONTRIBUTING.md         # Pedoman Kontribusi & Standar Kode
│   ├── DATABASE.md            # Skema Relasional Tabel, Indexing & Enkripsi
│   ├── DEPLOYMENT.md          # Spesifikasi Deployment, Docker & DevOps
│   ├── FUTURE_EXPANSIONS.md   # Backlog Strategis (Mobile App, Face Recognition)
│   ├── MAINTENANCE.md         # Protokol Pemeliharaan & Analisis Dampak (17 Poin)
│   ├── PRD.md                 # Product Requirement Document (15 Modul Core)
│   ├── SECURITY.md            # OWASP Mitigations, AES-256 PII & RBAC
│   ├── TESTING.md             # Strategi Pengujian, Piramida Uji & QA Gates
│   ├── UI_SPECIFICATION.md    # Desain Responsif & Ergonomi Antarmuka
│   └── DECISIONS/             # Architecture Decision Records (ADR-001 s/d ADR-005)
├── .gitignore                 # Konfigurasi Git Ignore Enterprise
└── README.md                  # Dokumentasi Utama Proyek
```

---

## 🎨 Dual-Panel Interface Strategy

1. **Admin / HR Portal**:
   - Ditujukan untuk Executive, HR Administrator, dan Payroll Master.
   - Tabel data komprehensif, multi-column filter, kalkulator payroll massal, audit log viewer, dan dashboard analitik SDM.
2. **Employee Self-Service (ESS) Portal**:
   - Ditujukan untuk seluruh staf dan Line Manager.
   - Pengalaman mobile-friendly: Clock-in/out berbasis GPS Geofencing & verifikasi kamera, form pengajuan cuti instan, dan unduh slip gaji terproteksi sandi.

---

## 📖 Dokumentasi Lengkap

Seluruh cetak biru teknis dan aturan bisnis dapat diakses secara detail pada direktori `docs/`:
- **Spesifikasi Kebutuhan Produk**: [`docs/PRD.md`](docs/PRD.md)
- **Arsitektur Sistem**: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Desain Basis Data**: [`docs/DATABASE.md`](docs/DATABASE.md)
- **Kontrak API & Endpoint**: [`docs/API.md`](docs/API.md)
- **Keamanan & Kepatuhan Data**: [`docs/SECURITY.md`](docs/SECURITY.md)
- **Identitas Brand NEXORA**: [`docs/BRANDING.md`](docs/BRANDING.md)

---

## 🚀 Persyaratan Sistem

- **Node.js**: `v20.x` atau lebih baru
- **npm**: `v10.x` atau lebih baru
- **PostgreSQL**: `v15` / `v16` (atau akun Supabase aktif)
- **Git**: Terinstal pada mesin lokal

---

## 📄 Lisensi & Kontribusi

Proyek ini dikembangkan di bawah pedoman kontribusi internal perusahaan. Silakan pelajari [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) sebelum melakukan Pull Request.
