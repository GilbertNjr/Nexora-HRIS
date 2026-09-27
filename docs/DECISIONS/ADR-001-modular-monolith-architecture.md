# ADR-001: Adopsi Pola Modular Monolith dengan Clean Architecture

## Konteks & Latar Belakang
Sistem HRIS enterprise mengelola data yang sangat saling berhubungan: Karyawan, Presensi, Cuti, Lembur, dan Penggajian. Pilihan arsitektur awal berada di antara:
1. Microservices Architecture
2. Monolith Tradisional (Monolitik Berlapis Biasa)
3. Modular Monolith dengan Prinsip Domain-Driven Design (DDD) & Clean Architecture

## Keputusan
Kami memutuskan untuk mengadopsi **Modular Monolith dengan Clean Architecture**.

## Rasional & Justifikasi
1. **Konsistensi Transaksional**: Proses penggajian (Payroll) memerlukan perhitungan kehadiran, lembur, dan potongan cuti yang harus konsisten secara transaksional (ACID). Pada microservices, hal ini memerlukan orkestrasi Saga yang kompleks dan rentan kegagalan transaksi.
2. **Kecepatan & Kemudahan Perawatan**: Modular Monolith dapat di-deploy sebagai satu kesatuan (*single artifact*) dengan overhead operasional minimal, namun memiliki batas modul yang ketat di level kode.
3. **Evolutif & Scalable**: Setiap modul memiliki Domain, Use Case, dan Repository terpisah. Jika di masa depan suatu modul (misal Presensi / Clock-in) mengalami lonjakan traffic jutaan request, modul tersebut dapat diekstraksi menjadi microservice tanpa refactoring logika domain.

## Konsekuensi
- **Positif**: Kemudahan debugging, satu proses deployment, tidak ada network latency antar-modul, integritas foreign key terjamin.
- **Tantangan**: Pengembang harus disiplin agar tidak melakukan direct import atau cross-query liar antar modul. Aturan ini ditegakkan melalui linting dan internal module contracts.
