# ADR-005: Penggunaan Supabase (Managed PostgreSQL) sebagai Database Provider Awal

## Konteks & Latar Belakang
Untuk mempercepat fase implementasi awal, mengurangi beban setup lokal di mesin Windows pengembang, dan mempermudah inspeksi data saat demo ke dosen, dibutuhkan solusi basis data yang cepat siap pakai namun tetap mematuhi spesifikasi arsitektur enterprise yang telah dirancang.

## Keputusan
Memilih **Supabase** sebagai penyedia basis data PostgreSQL terkelola (*Managed PostgreSQL Provider*) untuk fase awal pengembangan.

## Rasional & Justifikasi
1. **100% Native PostgreSQL (Zero Vendor Lock-in)**:
   - Supabase pada dasarnya adalah murni **PostgreSQL 15/16**. Seluruh spesifikasi database yang telah dirancang di [`docs/DATABASE.md`](file:///d:/Sistem%20HRIS/docs/DATABASE.md) (Foreign Key, UUIDv7, ACID Transactions, JSONB audit log, Indexing komposit, dan AES-256) berjalan secara native tanpa modifikasi.
2. **Kemudahan Migrasi Masa Depan (Seamless Migration)**:
   - Karena backend NestJS kita terhubung menggunakan koneksi standar PostgreSQL (`DATABASE_URL` via Prisma/TypeORM), jika di kemudian hari sistem ini ingin dipindahkan ke server VPS mandiri, AWS RDS, atau GCP Cloud SQL, **tidak ada satu baris kode pun yang perlu diubah**. Cukup lakukan `pg_dump` / `pg_restore` dan ganti variabel `DATABASE_URL` di file `.env`.
3. **Supabase Studio (GUI Inspeksi Bawaan)**:
   - Menyediakan antarmuka visual tabel berbasis web yang sangat rapi untuk melihat isi data, relasi foreign key, dan menjalankan query SQL. Sangat memudahkan saat demonstrasi sistem di hadapan dosen.
4. **Fitur Pendukung Siap Pakai**:
   - Supabase Storage (kompatibel S3) dapat langsung dimanfaatkan untuk penyimpanan aman dokumen karyawan, surat dokter, dan slip gaji PDF.

## Konsekuensi
- **Positif**: Setup instan, gratis di tier awal, tidak membebani memori RAM komputer lokal pengembang, dan siap diakses kapan pun via internet.
- **Batasan**: Aplikasi backend tetap menjaga independensi arsitektur (*Clean Architecture*) dengan tidak mengunci logika bisnis pada SDK khusus Supabase, melainkan tetap menggunakan ORM/Driver standar PostgreSQL agar migrasi keluar tetap instan.
