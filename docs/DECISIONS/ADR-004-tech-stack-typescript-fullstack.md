# ADR-004: Pemilihan Full-Stack TypeScript (NestJS & Next.js) sebagai Tech Stack Resmi

## Konteks & Latar Belakang
Sistem HRIS ini dirancang untuk memenuhi standar akademik tingkat tinggi sekaligus memiliki kesiapan penuh untuk dipasarkan secara komersial sebagai produk B2B SaaS (Software-as-a-Service) di masa depan. Dibutuhkan teknologi yang:
1. Menjamin efisiensi perawatan jangka panjang (1-3 tahun ke depan).
2. Mendukung arsitektur Modular Monolith dan Clean Architecture.
3. Menghadirkan antarmuka modern yang cepat, responsif, dan bernilai jual tinggi.
4. Memiliki kesiapan integrasi alami ke aplikasi mobile (*Mobile App Ready*).
5. Dapat dijalankan dengan biaya infrastruktur terjangkau pada tahap awal.

## Pilihan yang Dipertimbangkan
1. **Opsi 1: Full-Stack TypeScript (Backend NestJS + Frontend Next.js)** — *TERPILIH*
2. Opsi 2: PHP (Laravel 11 + Inertia.js / Filament)
3. Opsi 3: Go / Golang (Gin/Fiber Backend + Next.js Frontend)
4. Opsi 4: Java / Kotlin (Spring Boot 3 + Next.js Frontend)

## Keputusan
Memilih secara resmi **Opsi 1: Full-Stack TypeScript**:
- **Backend**: Node.js (v20+ LTS) dengan **NestJS** (TypeScript).
- **Frontend**: **Next.js 14+ / React** (TypeScript, App Router, Tailwind CSS dengan Design Tokens Enterprise Core HRIS).
- **Basis Data**: **PostgreSQL 16+** dengan ORM/Migration Tool.
- **Cache & Asynchronous Job**: **Redis 7+** dengan **BullMQ**.
- **Real-Time Engine**: **Socket.io** dengan Redis Adapter.

## Rasional & Justifikasi
1. **End-to-End Type Safety**: DTO, tipe entitas, dan kontrak API didefinisikan satu kali menggunakan TypeScript, mencegah bug ketidakcocokan tipe antara backend dan frontend sejak masa kompilasi (*Zero Type Mismatch*).
2. **Kesiapan Mobile App Mandiri**: Backend NestJS berupa decoupled RESTful JSON API murni. Saat aplikasi mobile (Flutter / React Native) dibangun di masa depan, seluruh endpoint backend sudah siap pakai 100% tanpa perlu refactoring.
3. **Standar Industri SaaS Modern**: Next.js memberikan kecepatan rendering instan (*Single Page Application experience*) yang memikat pengguna korporat dan memberikan nilai presentasi akademik tertinggi di hadapan dosen.
4. **Efisiensi Pengembang Tunggal / Tim Kecil**: Pengembang hanya perlu menguasai satu bahasa (TypeScript) untuk menangani backend, frontend, skrip migrasi, dan pengujian otomatis tanpa *context-switching*.
5. **Ekosistem Enterprise Bawaan**: NestJS menyediakan arsitektur bawaan yang kokoh (Modules, Dependency Injection, Pipes, Guards, Interceptors) yang mencegah terjadinya kode berantakan (*spaghetti code*).

## Konsekuensi
- **Positif**: Kecepatan pengembangan tinggi, kode sangat modular, dokumentasi OpenAPI/Swagger ter-generate otomatis, dan biaya hosting awal sangat hemat (dapat berjalan di VPS $5-$10/bulan dengan Docker).
- **Tantangan**: Memerlukan manajemen dependensi npm/pnpm yang rapi serta penanganan tugas CPU-bound berat melalui worker thread/BullMQ agar tidak memblokir event loop.
