# REGISTER KEPUTUSAN BISNIS & INFORMASI BELUM DITENTUKAN
## NEXORA HRIS
**Dokumen Acuan:** `Capstone Project.pdf` (Kelompok 5)  
**Status:** Register Formal Menunggu Keputusan Pemilik Proyek  
**Prinsip:** Nol Asumsi AI — Informasi Tanpa Aturan Tertulis Wajib Melalui Persetujuan Stakeholder  

---

## 1. PENDAHULUAN

Sesuai aturan audit blueprint, AI dilarang mengarang formula payroll, aturan keterlambatan, kuota cuti, batasan benefit, atau alur persetujuan yang belum tertulis secara eksplisit dalam dokumen `Capstone Project.pdf`.

Dokumen ini menginventarisasi seluruh butir informasi yang berstatus:
- **`BELUM DITENTUKAN DALAM DOKUMEN`**: Informasi yang diperlukan secara teknis untuk implementasi namun tidak dijelaskan dalam PDF.
- **`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`**: Ketidaksesuaian antara narasi teks kebutuhan dengan model diagram pada PDF, atau dengan kode repositori.

---

## 2. DAFTAR KONFLIK KEBUTUHAN (`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`)

### Konflik 01: Pencatatan Jam Masuk dan Jam Pulang pada Tabel Absensi
- **Lokasi Teks Sumber:** Halaman 2, Tabel Use Case No. 4 ("merekap jam masuk/pulang semua staf") dan Halaman 3, Tabel Use Case No. 12 ("check-in dan check-out kehadiran kerja harian").
- **Lokasi Diagram Sumber:** Halaman 6, Class Diagram tabel `Absensi`.
- **Deskripsi Konflik:**
  Tabel `Absensi` pada Class Diagram hanya memuat atribut:
  `- id_absensi : int`, `- id_karyawan : int`, `- tanggal : date`, `- status : string`, `- keterangan : string`.
  Tidak terdapat kolom jam masuk (`clock_in_time`) dan jam pulang (`clock_out_time`).
- **Dampak Teknis:** Jika hanya mengikuti atribut Class Diagram murni, sistem tidak dapat merekap jam masuk/pulang presisi.
- **Rekomendasi Analis Sistem:** Tambahkan atribut `jam_masuk : time` dan `jam_pulang : time` pada entitas database absensi tanpa mengubah logika bisnis use case.
- **Status:** **`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`**.

---

### Konflik 02: Representasi Model Karyawan pada Class Diagram
- **Lokasi Diagram Sumber:** Halaman 6, Class Diagram.
- **Deskripsi Konflik:**
  Terdapat dua entitas bernama `Karyawan`:
  1. `Karyawan` sebagai turunan (*subclass inheritance*) dari `User`, yang memuat method self-service: `kelolaProfil()`, `absenDigital()`, `ajukanCutiIzin()`, `unduhSlipGaji()`, `lihatBenefit()`, `lihatEvaluasi()`, `lihatPelatihan()`.
  2. `Karyawan` sebagai entitas tabel data master yang berelasi dengan `Departemen` (1 to 0..*), memuat data demografi: `id_karyawan`, `nip`, `nama`, `tgl_lahir`, `jk`, `alamat`, `status_kerja`, `id_dept`.
- **Dampak Teknis:** Pada arsitektur basis data relasional, pewarisan kelas (*class inheritance*) dan tabel data master karyawan perlu dimodelkan secara harmonis (misal: relasi 1-to-1 antara akun `User` dan profil `Employee`).
- **Status:** **`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`**.

---

### Konflik 03: Field Identifier Login (Username vs Email)
- **Lokasi Teks & Diagram Sumber:** Halaman 2 (Tabel Use Case 1: Login), Halaman 4 (Activity Diagram: input username & password), Halaman 6 (Class Diagram `User`: atribut `username : string` dan `email : string`).
- **Deskripsi Konflik:**
  Diagram alur aktivitas dan sekuens menyebut "input username dan password". Namun pada basis data modern dan skema eksisting repositori, login menggunakan `email`.
- **Rekomendasi:** Mendukung login dengan `username` ATAU `email` agar kedua ketentuan terpenuhi.
- **Status:** **`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`**.

---

## 3. DAFTAR INFORMASI BELUM DITENTUKAN (`BELUM DITENTUKAN DALAM DOKUMEN`)

Berikut adalah daftar rincian operasional bisnis yang belum dijabarkan dalam `Capstone Project.pdf` dan memerlukan persetujuan pemilik proyek:

### Domain A: Penggajian & Potongan Absensi (Payroll Module)
1. **`BDR-PAY-01` (Formula Pemotongan Gaji Berdasarkan Absensi):**
   - *Kondisi Dokumen:* Use case 5 menyatakan "Menghitung gaji bersih otomatis berdasarkan absensi", namun dokumen tidak menuliskan rumus matematis pengurangan gaji.
   - *Pilihan Keputusan:*
     - Pilihan A (Standar): Potongan alpa = `(Gaji Pokok / 21) × hari alpa`. Toleransi keterlambatan 15 menit.
     - Pilihan B (Flat): Potongan alpa tetap Rp 100.000/hari, potongan terlambat Rp 25.000/kejadian.
     - Pilihan C (Manual): Admin HR mengoreksi nilai potongan secara manual.
   - *Status:* **Telah disetujui Pilihan A oleh Pemilik Proyek (13/10/2026).**

2. **`BDR-PAY-02` (Sifat Tunjangan Karyawan):**
   - *Kondisi Dokumen:* Atribut `tunjangan : decimal` ada pada tabel `Payroll`, namun tidak ada penjelasan apakah ini tunjangan tetap bulanan atau tunjangan harian berdasarkan kehadiran.
   - *Status:* **Telah disetujui sebagai Tunjangan Tetap Bulanan oleh Pemilik Proyek (13/10/2026).**

3. **`BDR-PAY-03` (Siklus Cut-off Tanggal Payroll):**
   - *Kondisi Dokumen:* Tidak ada tanggal cut-off yang dicantumkan.
   - *Pertanyaan:* Apakah tanggal cut-off absensi dihitung per tanggal 1 s/d akhir bulan berjalan, atau tanggal 21 s/d 20 bulan berikutnya?
   - *Status:* `BELUM DITENTUKAN DALAM DOKUMEN` — Memerlukan Keputusan.

---

### Domain B: Pengelolaan Cuti dan Izin (Leave Module)
1. **`BDR-LEV-01` (Kuota Saldo Cuti Tahunan):**
   - *Kondisi Dokumen:* Use case 13 menyatakan permohonan libur, sakit, atau dispensasi, namun tidak ada angka saldo jatah cuti dalam setahun.
   - *Status:* **Telah disetujui 12 Hari/Tahun oleh Pemilik Proyek (13/10/2026).**

2. **`BDR-LEV-02` (Aktor Penyetuju Status Cuti/Izin):**
   - *Kondisi Dokumen:* Class `CutiIzin` memiliki method `ubahStatus()`, namun tidak disebutkan siapa aktor yang berhak mengeksekusi (Admin HR langsung atau atasan divisi/Manager).
   - *Status:* **Telah disetujui diproses langsung oleh Admin HR di Admin Panel (13/10/2026).**

3. **`BDR-LEV-03` (Lampiran Berkas Bukti Izin Sakit):**
   - *Kondisi Dokumen:* Class Diagram tidak memiliki field berkas lampiran pada `CutiIzin`.
   - *Pertanyaan:* Apakah pengajuan sakit wajib melampirkan file surat keterangan dokter?
   - *Status:* `BELUM DITENTUKAN DALAM DOKUMEN` — Memerlukan Keputusan.

---

### Domain C: Absensi Digital (Attendance Module)
1. **`BDR-ATT-01` (Validasi Lokasi & Foto Selfie Presensi):**
   - *Kondisi Dokumen:* Use case 12 menyatakan "Melakukan check-in dan check-out kehadiran kerja harian" tanpa menyebut kewajiban GPS atau foto.
   - *Status:* **Telah disetujui Presensi Fleksibel (Waktu real-time tercatat otomatis, GPS/Foto bersifat opsional non-blocking) oleh Pemilik Proyek (13/10/2026).**

2. **`BDR-ATT-02` (Kebijakan Lupa Check-Out):**
   - *Kondisi Dokumen:* Tidak ada aturan tentang status karyawan yang melakukan check-in tetapi lupa melakukan check-out hingga hari berganti.
   - *Pertanyaan:* Apakah status absensi hari tersebut dihitung Hadir (tanpa jam pulang), dianggap Tidak Lengkap, atau divalidasi manual oleh Admin HR?
   - *Status:* `BELUM DITENTUKAN DALAM DOKUMEN` — Memerlukan Keputusan.

---

### Domain D: Benefit & Asuransi (Benefit Module)
1. **`BDR-BEN-01` (Mekanisme Plafon Kesehatan vs Klaim Reimbursement):**
   - *Kondisi Dokumen:* Use case 15 menyebut "Mengecek sisa plafon kesehatan", namun Class `Benefit` hanya memiliki field `nilai : decimal` dan tidak ada tabel transaksi klaim/reimbursement.
   - *Pertanyaan:* Bagaimana sisa plafon berkurang? Apakah melalui input pemakaian oleh Admin HR di panel admin, atau ditambahkan modul klaim reimbursement?
   - *Status:* `BELUM DITENTUKAN DALAM DOKUMEN` — Memerlukan Keputusan.

---

### Domain E: Penilaian Kinerja & Pelatihan Karier (Talent & Development)
1. **`BDR-PRF-01` (Standar Skala Skor Nilai KPI):**
   - *Kondisi Dokumen:* Atribut `nilai : decimal` tanpa rentang skala skor.
   - *Usulan Rekomendasi:* Skala 0–100 (desimal).
   - *Status:* `BELUM DITENTUKAN DALAM DOKUMEN` — Menunggu Konfirmasi Akhir.

2. **`BDR-TRN-01` (Penyimpanan Peserta Pelatihan):**
   - *Kondisi Dokumen:* Class `Pelatihan` hanya memiliki atribut `peserta : int` (angka kapasitas/jumlah). Tidak ada tabel relasi untuk menyimpan daftar nama karyawan yang mendaftar/ditugaskan.
   - *Usulan Rekomendasi:* Tambahkan entitas relasi `PesertaPelatihan` (`id_peserta`, `id_pelatihan`, `id_karyawan`, `status`).
   - *Status:* `BELUM DITENTUKAN DALAM DOKUMEN` — Menunggu Konfirmasi Akhir.

---

### Domain F: Rekrutmen & Pelamar (Recruitment Module)
1. **`BDR-REC-01` (Detail Data Pelamar Kerja):**
   - *Kondisi Dokumen:* Class `Rekrutmen` hanya memuat `posisi`, `tgl_buka`, `tgl_tutup`, `status`. Tidak memuat data pelamar (nama, email, berkas CV).
   - *Pertanyaan:* Apakah data pelamar disimpan dalam tabel terpisah atau cukup status lowongan di level awal?
   - *Status:* `BELUM DITENTUKAN DALAM DOKUMEN` — Memerlukan Keputusan.

2. **`BDR-REC-02` (Konversi Onboarding ke Data Master Karyawan):**
   - *Kondisi Dokumen:* Use case 3 menyebut "hingga tahap onboarding", namun tidak ada alur otomatisasi konversi kandidat menjadi pegawai baru di data master.
   - *Status:* `BELUM DITENTUKAN DALAM DOKUMEN` — Memerlukan Keputusan.
