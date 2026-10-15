# ATURAN PENGEMBANGAN JANGKA PANJANG DAN MAINTENANCE NEXORA HRIS
## STANDAR OPERASIONAL PROSEDUR (SOP) REKAYASA & PEMELIHARAAN SISTEM
**Peran:** Senior Software Maintenance Engineer, Software Architect, QA Lead, Security Engineer  
**Versi:** 2.0.0-LongTerm  
**Target Horizon:** 1–3+ Tahun Pemeliharaan Berkelanjutan  
**Prinsip Utama:** Nexora HRIS harus dapat dikembangkan tanpa harus membangun ulang seluruh aplikasi. Pertahankan business logic yang sudah disetujui, dan pastikan setiap perubahan dapat ditelusuri, diuji, serta dipulihkan jika terjadi masalah.

---

## 1. ARSITEKTUR YANG MUDAH DIKEMBANGKAN (MODULAR MONOLITH)

1. **Struktur Kode Modular:**
   - Gunakan struktur kode modular dengan tanggung jawab setiap modul yang terisolasi dan jelas (*Domain-Driven Design / Bounded Context*).
   - Seluruh modul backend ditempatkan di `apps/api/src/modules/<nama_modul>` dengan pemisahan internal yang ketat:
     - `*.controller.ts`: Menangani protokol HTTP, routing, dan validasi decorator.
     - `*.service.ts`: Menjalankan logika bisnis murni (*business logic*). Dilarang menaruh business logic di dalam controller.
     - `dto/*.dto.ts`: Kontrak data transfer dengan validasi skema deklaratif (`class-validator`).
     - Entitas / Prisma Client: Akses basis data terisolasi.
2. **Pemisahan Lapisan Sistem yang Tegas:**
   - **Frontend:** Berada di `apps/web` (Next.js 14 App Router) dengan isolasi area kerja:
     - Panel Manajemen Admin HR: `apps/web/src/app/admin`
     - Portal Mandiri Karyawan (ESS): `apps/web/src/app/ess`
   - **Backend API:** Berada di `apps/api` (NestJS REST API terpusat).
   - **Business Logic:** Diisolasi di layer service, tidak boleh bergantung pada detail implementasi antarmuka atau database engine.
   - **Akses Database:** Dikelola melalui Prisma ORM dengan relasi dan constraint ACID yang terjaga.
   - **Autentikasi & Otorisasi:** Menggunakan JWT + RBAC Guards terpusat, membedakan hak akses Admin HR dan Karyawan secara ketat.
   - **Konfigurasi:** Terpusat melalui environment variables (`.env`) yang divalidasi saat startup.
3. **Anti-Pola yang Dilarang:**
   - Dilarang membuat satu file yang menampung terlalu banyak tanggung jawab (*God Object / Fat File*). Batasi kompleksitas file (idealnya < 300–400 baris kode per file).
   - Hindari duplikasi logika bisnis (*DRY Principle*).
   - Hindari ketergantungan silang antarmodul yang tidak perlu (*tight coupling*). Gunakan interface kontrak publik atau event broker untuk komunikasi antarmodul.
   - Dilarang melakukan refactoring besar tanpa alasan teknis yang kuat, analisis dampak tertulis, dan rencana pengujian regresi yang disetujui.

---

## 2. PENGEMBANGAN FITUR BARU & MANAJEMEN PERUBAHAN

1. **Pemeriksaan Pra-Pengembangan:**
   - Sebelum mengembangkan fitur baru, engineer wajib memeriksa: struktur kode yang ada, dokumentasi di `/docs`, skema database di `schema.prisma`, endpoint API aktif, sistem RBAC, dan komponen UI yang sudah tersedia.
2. **Analisis Dampak Lintas Modul:**
   - Periksa korelasi antarmodul (misalnya: perubahan pada modul *Leave* berdampak langsung pada modul *Attendance* dan perhitungan *Payroll*).
3. **Larangan Merusak Fitur Lama:**
   - Dilarang mengubah atau menghapus fitur/alur lama hanya demi mempermudah pembuatan fitur baru (*strict backward compatibility*).
   - Dilarang membuat fitur baru, aturan bisnis baru, formula baru, atau tahapan persetujuan baru tanpa persetujuan eksplisit pemilik proyek.
4. **Penanganan Konflik Blueprint:**
   - Jika kebutuhan baru bertentangan dengan blueprint bisnis yang telah disetujui (`Capstone Project.pdf`), **HENTIKAN** implementasi bagian yang bertentangan dan ajukan `KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN` untuk mendapatkan arahan stakeholder.

---

## 3. EVOLUSI DATABASE & INTEGRITAS DATA

1. **Migration yang Terkelola dan Versional:**
   - Seluruh perubahan struktur basis data wajib melalui Prisma Migrations resmi (`prisma migrate dev` / `prisma migrate deploy`) dengan penamaan deskriptif.
   - Migrasi memiliki nomor versi, urutan penerapan waktu yang jelas, dan tersimpan di `apps/api/prisma/migrations/`.
2. **Larangan Manipulasi Manual di Produksi:**
   - Dilarang mengubah skema database produksi secara manual (via GUI atau query ad-hoc) tanpa file migrasi tercatat.
3. **Pemeliharaan Integritas Data:**
   - Pertahankan integritas relasi foreign key, unique constraint, check constraint, dan indeks pencarian.
   - Terapkan pola *Expand and Contract Pattern* saat mengubah kolom untuk menjaga kompatibilitas dengan versi aplikasi sebelumnya.
4. **Prosedur Mitigasi Risiko & Rollback:**
   - Untuk perubahan skema yang berisiko tinggi (misal: modifikasi tabel finansial `payroll_records`), siapkan cadangan database (*backup*) terverifikasi dan skrip rollback yang teruji.
   - Dilarang menghapus tabel, kolom, atau data lama tanpa analisis dampak 17 titik dan persetujuan eksplisit.
5. **Data Dummy & Seeding yang Aman:**
   - Sediakan seed data di `apps/api/prisma/seed.ts` yang mencakup data demo realistis untuk Admin HR dan Karyawan tanpa mengekspos data pribadi asli (*no real PII*).

---

## 4. PENGUJIAN & PENCEGAHAN REGRESI (QA PROTOCOL)

1. **Piramida Pengujian Komprehensif:**
   - **Unit Test (Jest):** Menguji formula bisnis murni (misal: kalkulasi payroll, formula potongan alpa, validasi rentang tanggal cuti).
   - **Integration Test:** Menguji interaksi controller $\leftrightarrow$ service $\leftrightarrow$ database repository.
   - **End-to-End (E2E) Test:** Menguji alur pengguna utuh dari autentikasi hingga output data (misal: proses check-in absensi digital, pengajuan cuti, unduh slip gaji).
2. **Kriteria Penerimaan & Pengujian Fitur Baru:**
   - Setiap use case dan fitur baru wajib memiliki Kriteria Penerimaan (*Acceptance Criteria*) dan Test Case yang terdefinisi di [matriks-keterlacakan.md](file:///d:/Sistem%20HRIS/docs/requirements/matriks-keterlacakan.md).
3. **Pencegahan Regresi (*Regression Testing*):**
   - Sebelum rilis atau merge, jalankan seluruh test suite (`npm run test`) untuk memastikan fitur lama tidak rusak.
   - Uji secara ketat: validasi input, token expiry/refresh flow, otorisasi RBAC (Admin vs Karyawan), dan pemisahan data antar-pengguna (*data tenancy isolation*).
4. **Integritas Pernyataan Keberhasilan:**
   - Dilarang menyatakan implementasi selesai atau berhasil jika pengujian penting belum dijalankan atau masih ada test case yang gagal (*failing tests*).
   - Catat secara transparan pengujian yang belum dapat dilakukan beserta alasannya.

---

## 5. KEAMANAN & PENGELOLAAN KONFIGURASI

1. **Pemisahan Lingkungan (*Environment Separation*):**
   - Pisahkan file konfigurasi: `.env.development`, `.env.test`, `.env.staging`, `.env.production`.
2. **Larangan Kebocoran Kredensial (*Zero Secrets in Code*):**
   - Dilarang keras menaruh password database, API key, JWT secret, private key, atau token pihak ketiga di dalam source code maupun repository Git.
   - Gunakan `.gitignore` untuk mencegah terunggahnya file rahasia.
3. **Prinsip Least Privilege & Proteksi Input:**
   - Terapkan hak akses minimal pada user database dan role aplikasi.
   - Validasi dan sanitasi seluruh data masukan menggunakan `class-validator` dan whitelist payload (`ValidationPipe({ whitelist: true })`).
4. **Penanganan Error & Logging yang Aman:**
   - Jangan pernah membocorkan stack trace database, kredensial, atau informasi internal server ke pengguna akhir.
   - Dilarang mencatat kata sandi, token otentikasi, nomor rekening lengkap, atau data personal sensitif ke dalam log sistem.
5. **Evaluasi Keamanan Dependensi:**
   - Periksa kerentanan paket pihak ketiga secara rutin menggunakan `npm audit`.

---

## 6. DOKUMENTASI & KONTROL VERSI (GIT)

1. **Disiplin Version Control:**
   - Buat commit Git yang atomik, deskriptif, dan terukur (mengikuti konvensi *Conventional Commits*).
2. **Sinkronisasi Dokumentasi Terpadu:**
   - Setiap perubahan teknis atau bisnis wajib disinkronkan ke dokumen terkait di `/docs`:
     - Arsitektur: [`docs/ARCHITECTURE.md`](file:///d:/Sistem%20HRIS/docs/ARCHITECTURE.md)
     - Logika Bisnis: [`docs/requirements/spesifikasi-business-logic.md`](file:///d:/Sistem%20HRIS/docs/requirements/spesifikasi-business-logic.md)
     - Keterlacakan: [`docs/requirements/matriks-keterlacakan.md`](file:///d:/Sistem%20HRIS/docs/requirements/matriks-keterlacakan.md)
     - Keputusan Bisnis: [`docs/requirements/keputusan-bisnis.md`](file:///d:/Sistem%20HRIS/docs/requirements/keputusan-bisnis.md)
     - Skema Basis Data: [`docs/DATABASE.md`](file:///d:/Sistem%20HRIS/docs/DATABASE.md)
     - Catatan Rilis: [`docs/CHANGELOG.md`](file:///d:/Sistem%20HRIS/docs/CHANGELOG.md)
3. **Pencatatan Keputusan Arsitektur (ADR):**
   - Catat setiap keputusan arsitektural penting di `docs/DECISIONS/ADR-XXX.md` memuat konteks, keputusan, konsekuensi, dan risiko.
4. **Integritas Dokumentasi:**
   - Dilarang mengklaim dokumentasi sudah diperbarui jika perubahannya belum benar-benar selesai dan diverifikasi.

---

## 7. MONITORING, LOGGING, & PEMULIHAN BENCANA

1. **Logging Terstruktur:**
   - Terapkan logger terstruktur (JSON format) memuat: `timestamp`, `level`, `context/module`, `message`, `requestId`, `userId` (jika ada).
2. **Audit Trail Mutasi Data:**
   - Seluruh mutasi kritis (perubahan master karyawan, eksekusi payroll, persetujuan cuti, pengubahan konfigurasi) wajib tersimpan di tabel `audit_logs` memuat snapshot data lama vs baru.
3. **Health Check & Monitoring:**
   - Sediakan endpoint pemeriksaan kesehatan sistem di `GET /api/v1/health` untuk memantau status server, database, dan memori.
4. **Prosedur Pemulihan & Rollback:**
   - Dokumentasikan prosedur deployment dan instruksi penanganan insiden (*runbook*).
   - Siapkan skenario pemulihan data terjadwal (*automated backup & point-in-time recovery*).

---

## 8. ATURAN KERJA WAJIB (SOP 8-LANGKAH SEBELUM MENGUBAH SISTEM)

Setiap engineer/AI yang hendak melakukan modifikasi pada Nexora HRIS **WAJIB** melalui 8 langkah sistematis berikut:

```
[1. Periksa Kondisi Kode & Dokumen] 
               │
               ▼
[2. Identifikasi Tujuan & Ruang Lingkup]
               │
               ▼
[3. Susun Daftar Komponen Terdampak (17-Point Trace)]
               │
               ▼
[4. Analisis Risiko & Siapkan Rencana Pengujian]
               │
               ▼
[5. Implementasi Bertahap (Minimal Safe Change)]
               │
               ▼
[6. Eksekusi Pengujian Otomatis (Unit, Int, Regresi)]
               │
               ▼
[7. Sinkronisasi Dokumentasi & CHANGELOG]
               │
               ▼
[8. Pelaporan Lengkap & Verifikasi Deployment]
```

### Rincian 8 Langkah:
1. **Periksa kondisi kode dan dokumentasi terkini:** Baca kode aktif dan spesifikasi terkait sebelum mengetik baris kode baru.
2. **Identifikasi tujuan serta ruang lingkup perubahan:** Batasi ruang lingkup hanya pada kebutuhan yang diminta; hindari perubahan liar.
3. **Buat daftar file, modul, API, dan tabel database yang terdampak:** Telusuri modul terkait, tabel relasional, kontrak endpoint, halaman frontend, dan audit log.
4. **Jelaskan risiko dan rencana pengujian:** Identifikasi risiko regresi, integritas data finansial, kebocoran hak akses, dan siapkan skenario uji.
5. **Implementasikan perubahan secara bertahap:** Terapkan perubahan terkecil yang aman (*minimal safe change*), pertahankan backward compatibility.
6. **Jalankan pengujian yang relevan:** Eksekusi unit test, verifikasi manual, dan tes regresi.
7. **Perbarui dokumentasi dan catatan perubahan:** Mutakhirkan dokumen di `/docs` dan catat rincian perubahan pada `CHANGELOG.md`.
8. **Laporkan hasil secara transparan:** Sajikan daftar file yang berubah, tes yang dijalankan, status keberhasilan, isu yang tersisa, serta petunjuk deployment.

---
*Pedoman ini mengikat seluruh siklus hidup pengembangan sistem Nexora HRIS untuk memastikan kesinambungan, keandalan, dan kemudahan pemeliharaan jangka panjang.*
