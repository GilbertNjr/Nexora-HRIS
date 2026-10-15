# LAPORAN AUDIT BLUEPRINT CAPSTONE PROJECT
## SISTEM INFORMASI NEXORA HUMAN RESOURCE SOLUTIONS
**Versi Dokumen:** 1.0.0-Master-Audit  
**Dokumen Sumber Audit:** `Capstone Project.pdf` (Kelompok 5)  
**Tim Auditor:** Analis Bisnis Senior, Manajer Produk, Arsitek Perangkat Lunak, Analis Sistem, QA Engineer, Security Engineer  
**Tanggal Audit:** 13 Oktober 2026  
**Status Audit:** Audit Tahap 1 Selesai — Menunggu Persetujuan Pemilik Proyek Sebelum Masuk Tahap PRD/Pengembangan  

---

## 1. RINGKASAN ISI BLUEPRINT CAPSTONE

Dokumen `Capstone Project.pdf` merancang sistem informasi administrasi SDM terpusat bernama **Nexora Human Resource Solutions**. 

### Karakteristik & Fondasi Utama:
1. **Definisi:** Sistem informasi berbasis digital yang mengotomatisasi, mengintegrasikan, dan mengelola seluruh proses administrasi SDM secara terpusat (*centralized database center*). Seluruh data inputan mandiri karyawan (seperti absensi dan cuti) langsung masuk ke basis data utama, lalu diolah otomatis untuk keperluan penggajian (*payroll*) dan laporan manajemen bagi Admin HR.
2. **Arsitektur Antarmuka:** **Dual-Panel System** yang memisahkan area kerja manajemen (**Admin HR**) dan area akses mandiri pegawai (**Karyawan**).
3. **Tujuan Utama:**
   - Bagi HR: Otomatisasi payroll akurat, mempermudah pemantauan kehadiran & kinerja & pelatihan staf, serta penyediaan analitik SDM valid.
   - Bagi Karyawan: Kemandirian (*self-service*) absensi & profil, percepatan permohonan izin/cuti, serta transparansi benefit & rincian slip gaji.
4. **Cakupan Diagram Sumber:**
   - 1 Use Case Diagram global memuat 17 use case dan 2 aktor.
   - 3 Activity Diagram (Login, Admin HR Menu Flow, Karyawan Menu Flow).
   - 3 Sequence Diagram (Login, Admin HR Interaksi Data, Karyawan Interaksi Data).
   - 1 Class Diagram memuat 15 kelas dengan relasi asosiasi, generalisasi, dan multiplisitas.

---

## 2. DAFTAR AKTOR DAN HAK TANGGUNG JAWABNYA

| No | Aktor | Tanggung Jawab Operasional Sesuai Dokumen |
|:---|:---|:---|
| 1 | **Admin HR** | - Autentikasi ke sistem via Admin Panel.<br>- Menginput, memperbarui, dan menonaktifkan data master pegawai (`Kelola data karyawan`).<br>- Mengatur proses seleksi pelamar baru hingga tahap onboarding (`Kelola rekrutmen`).<br>- Memantau, memvalidasi, dan merekap jam masuk/pulang semua staf (`Rekap absensi staf`).<br>- Menghitung gaji bersih otomatis berdasarkan absensi (`Proses payroll`).<br>- Mengonfigurasi alokasi asuransi, BPJS, dan bonus perusahaan (`Kelola benefit`).<br>- Menginput hasil evaluasi kerja berkala (KPI) tiap divisi (`Penilaian Kinerja`).<br>- Menyusun program, jadwal, dan daftar peserta pelatihan karier (`Kelola pelatihan`).<br>- Memantau grafik statistik SDM dan mengunduh laporan bulanan (`Lihat lap. analitik`).<br>- Mengatur konfigurasi dasar aplikasi dan pembagian hak user (`Pengaturan sistem`). |
| 2 | **Karyawan** | - Autentikasi ke sistem via Employee Self-Service (ESS) Panel.<br>- Mengubah data personal yang bersifat dinamis: alamat dan nomor HP (`Kelola profil mandiri`).<br>- Melakukan check-in dan check-out kehadiran kerja harian (`Absensi digital`).<br>- Mengisi formulir digital permohonan libur, sakit, atau dispensasi (`Ajukan cuti dan izin`).<br>- Melihat rincian pendapatan harian dan mengunduh berkas slip resmi (`Unduh slip gaji`).<br>- Mengecek sisa plafon kesehatan atau jenis asuransi yang aktif (`Lihat benefit`).<br>- Mengakses penilaian rapot kerja yang diberikan oleh manajemen (`Lihat evaluasi`).<br>- Mengambil tawaran kelas kompetensi atau jadwal diklat wajib (`Lihat pelatihan`). |

---

## 3. DAFTAR SELURUH 17 USE CASE

Berdasarkan tabel pada Halaman 2–4 dokumen capstone:
1. `Use Case 01`: **Login** (Admin HR & Karyawan)
2. `Use Case 02`: **Kelola data karyawan** (Admin HR)
3. `Use Case 03`: **Kelola rekrutmen** (Admin HR)
4. `Use Case 04`: **Rekap absensi staf** (Admin HR)
5. `Use Case 05`: **Proses payroll** (Admin HR)
6. `Use Case 06`: **Kelola benefit** (Admin HR)
7. `Use Case 07`: **Penilaian Kinerja** (Admin HR)
8. `Use Case 08`: **Kelola pelatihan** (Admin HR)
9. `Use Case 09`: **Lihat lap. analitik** (Admin HR)
10. `Use Case 10`: **Pengaturan sistem** (Admin HR)
11. `Use Case 11`: **Kelola profil mandiri** (Karyawan)
12. `Use Case 12`: **Absensi digital** (Karyawan)
13. `Use Case 13`: **Ajukan cuti dan izin** (Karyawan)
14. `Use Case 14`: **Unduh slip gaji** (Karyawan)
15. `Use Case 15`: **Lihat benefit** (Karyawan)
16. `Use Case 16`: **Lihat evaluasi** (Karyawan)
17. `Use Case 17`: **Lihat pelatihan** (Karyawan)

---

## 4. PEMETAAN MODUL HRIS

Berdasarkan analisis arsitektur, 17 use case di atas dikelompokkan ke dalam 10 domain modul logis yang saling terintegrasi:

```
+-----------------------------------------------------------------------------------+
|                            NEXORA HRIS CORE PLATFORM                              |
+-----------------------------------------------------------------------------------+
| 1. Modul Autentikasi & Akun       : UC 01 (Login)                                 |
| 2. Modul Data Master Karyawan     : UC 02 (Kelola data karyawan), UC 11 (Profil)  |
| 3. Modul Rekrutmen & Onboarding   : UC 03 (Kelola rekrutmen)                      |
| 4. Modul Presensi & Absensi       : UC 04 (Rekap absensi), UC 12 (Absensi digital)|
| 5. Modul Cuti & Perizinan         : UC 13 (Ajukan cuti dan izin)                  |
| 6. Modul Payroll & Kompensasi     : UC 05 (Proses payroll), UC 14 (Slip gaji)     |
| 7. Modul Benefit & Asuransi       : UC 06 (Kelola benefit), UC 15 (Lihat benefit) |
| 8. Modul Evaluasi Kinerja (KPI)   : UC 07 (Penilaian kinerja), UC 16 (Evaluasi)   |
| 9. Modul Pelatihan & Kompetensi   : UC 08 (Kelola pelatihan), UC 17 (Pelatihan)   |
| 10. Modul Laporan & Konfigurasi   : UC 09 (Analitik), UC 10 (Pengaturan sistem)   |
+-----------------------------------------------------------------------------------+
```

---

## 5. HASIL PEMERIKSAAN DIAGRAM

### 5.1 Pemeriksaan Activity Diagram (Halaman 4)
- **Konsistensi:**
  - Alur Login memiliki percabangan jelas (`Data valid?`: Ya $\rightarrow$ Dashboard, Tidak $\rightarrow$ Pesan error).
  - Alur Admin HR memuat percabangan standar simpan/proses data (`Berhasil?`: Ya $\rightarrow$ Tampilkan data/hasil, Tidak $\rightarrow$ Pesan gagal).
  - Alur Karyawan berorientasi pada permintaan data mandiri (`Mengambil data sesuai permintaan` $\rightarrow$ `Menampilkan data`).
- **Keterbatasan / Gap Diagram:**
  - Activity Diagram Karyawan pada Bagian 3 menggambarkan alur seragam untuk seluruh aksi (lihat, ajukan, unduh) tanpa mendetailkan percabangan validasi formulir (misal: gagal validasi tanggal cuti).

### 5.2 Pemeriksaan Sequence Diagram (Halaman 5)
- **Konsistensi:**
  - Mengonfirmasi pola pertukaran pesan sinkron (*request-response*) antara kedua Aktor dengan entitas tunggal `Sistem HRIS`.
  - Terdapat pemisahan jelas antara paket pesan Admin HR (9 panggilan fungsi) dan Karyawan (7 panggilan fungsi).
- **Keterbatasan / Gap Diagram:**
  - Lifeline diagram hanya menggambarkan `Aktor` $\leftrightarrow$ `Sistem HRIS` secara monolitik (tidak membedakan lapisan Controller, Service, dan Database).

### 5.3 Pemeriksaan Class Diagram (Halaman 6)
- **Konsistensi Relasi Inti:**
  - Pewarisan (`Generalisasi`): `User` diwarisi oleh `AdminHR` dan `Karyawan`.
  - Multiplisitas:
    - `Departemen` [1] memiliki [0..*] `Karyawan`
    - `Karyawan` [1] melakukan [0..*] `Absensi`
    - `Karyawan` [1] mengajukan [0..*] `CutiIzin`
    - `Karyawan` [1] memiliki [0..*] `Payroll`
    - `Payroll` [1] menghasilkan [1] `SlipGaji`
- **Keterbatasan / Gap Hubungan Antarkomponen:**
  - Entitas `Rekrutmen`, `Benefit`, `Pelatihan`, `PenilaianKinerja`, `LaporanAnalitik`, dan `PengaturanSistem` berdiri sendiri di baris bawah tanpa garis relasi asosiasi formal ke entitas `Karyawan` atau `AdminHR` di diagram sumber (meskipun memiliki foreign key seperti `id_karyawan`).

---

## 6. DAFTAR KEBUTUHAN YANG TELAH DITENTUKAN (FAKTUAL)

1. Sistem wajib memisahkan area kerja manajemen dan akses mandiri pegawai (**Dual-Panel System**).
2. Seluruh data terpusat dalam satu basis data (**database center**).
3. Data yang diinput karyawan (absensi dan cuti) langsung masuk ke basis data dan diolah otomatis untuk payroll dan laporan.
4. Total gaji pada entitas Payroll dihitung dengan formula eksplisit:
   $$\text{total\_gaji} = \text{gaji\_pokok} + \text{tunjangan} - \text{potongan}$$
5. Relasi antara Payroll dan Slip Gaji adalah tepat $1 : 1$.
6. Karyawan hanya memiliki hak ubah mandiri pada data personal yang dinamis (**alamat dan nomor HP**); data struktural terkunci.
7. Jenis pengajuan pada modul cuti/izin secara tegas mencakup: **libur**, **sakit**, atau **dispensasi**.
8. Hak benefit yang dicatat mencakup alokasi: **asuransi**, **BPJS**, dan **bonus perusahaan**.
9. Penilaian kinerja berbasis hasil evaluasi kerja berkala (**KPI**) tiap divisi.
10. Modul pelatihan mencakup dua jenis program: **tawaran kelas kompetensi** dan **jadwal diklat wajib**.

---

## 7. DAFTAR KEBUTUHAN YANG BELUM DITENTUKAN (`BELUM DITENTUKAN DALAM DOKUMEN`)

Berikut adalah kebutuhan yang belum ada ketentuannya di dokumen capstone:

| No | Kebutuhan Belum Ditentukan | Dampak Implementasi | Rekomendasi / Status |
|:---|:---|:---|:---|
| 1 | Rumus matematis potongan absensi (alpa & keterlambatan) | Perhitungan payroll otomatis tidak dapat dieksekusi tanpa rumus baku | Telah disepakati: Potongan Alpa = (Gaji Pokok / 21) * Hari Alpa; toleransi keterlambatan 15 menit |
| 2 | Sifat tunjangan (tetap bulanan vs variabel kehadiran) | Nilai nominal payroll bulanan | Telah disepakati: Tunjangan tetap bulanan |
| 3 | Kuota saldo cuti tahunan dan aktor penyetuju cuti | Batasan pengajuan cuti dan approval workflow | Telah disepakati: 12 hari/tahun; approval langsung oleh Admin HR |
| 4 | Mekanisme pengurangan sisa plafon kesehatan | Tampilan saldo plafon pada modul benefit ESS | Memerlukan keputusan: apakah pengurangan via admin atau modul klaim |
| 5 | Skala penilaian skor evaluasi kinerja KPI | Rentang input nilai pada modul KPI | Usulan rekomendasi: Skala 0–100 (desimal) |
| 6 | Penyimpanan daftar nama peserta pelatihan karier | Tabel relasi antara kegiatan diklat dan karyawan | Usulan rekomendasi: Tabel relasi `TrainingParticipant` |
| 7 | Detail biodata pelamar kerja pada lowongan rekrutmen | Kelengkapan data seleksi pelamar | Memerlukan keputusan: penyimpanan data pelamar terpisah |
| 8 | Format baku berkas unduhan slip gaji dan laporan analitik | Ekspor dokumen resmi (PDF / Excel) | Usulan rekomendasi: Format PDF resmi |

---

## 8. DAFTAR KONFLIK KEBUTUHAN (`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`)

1. **Konflik Atribut Jam Masuk/Pulang pada Absensi:**
   - Deskripsi use case 4 & 12 menyebut rekap dan check-in/out jam masuk/pulang.
   - Atribut class `Absensi` di Class Diagram hanya memuat `tanggal : date`, `status : string`, `keterangan : string`.
   - *Status:* **`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`** (Direkomendasikan menambah `clockInTime` dan `clockOutTime` di skema DB).
2. **Konflik Dual-Role vs Multi-Role RBAC:**
   - Dokumen capstone menetapkan 2 Aktor: `Admin HR` dan `Karyawan`.
   - Repositori eksisting memiliki 5 Role (`SUPER_ADMIN`, `HR_ADMIN`, `HR_STAFF`, `LINE_MANAGER`, `EMPLOYEE`).
   - *Status:* **`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`** (Diselaraskan dengan memetakan 5 role ke dalam 2 Panel utama tanpa mengubah esensi bisnis).

---

## 9. DAFTAR RISIKO AWAL PROYEK

1. **Risiko Integritas Data Historis Payroll (Tinggi):**
   - Data payroll yang sudah terbit (*published*) tidak boleh berubah nilai historisnya meskipun data master gaji pokok atau departemen karyawan diperbarui di kemudian hari (*historical immutability*).
2. **Risiko Integritas Transaksional (ACID) Antarmodul (Tinggi):**
   - Proses penggajian melibatkan pembacaan data absensi dan cuti lintas tabel secara simultan. Jika terjadi kegagalan sistem di tengah kalkulasi massal, diperlukan transaksi rollback yang aman.
3. **Risiko Kepatuhan Hak Akses Data Sensitif (Tinggi):**
   - Data slip gaji, besaran gaji pokok, dan riwayat rapot kerja evaluasi adalah data personal sensitif (*private confidential*). Kebocoran data antar-karyawan pada portal ESS merupakan risiko kepatuhan kritis.
4. **Risiko Ketiadaan Modul di Kode Eksisting (Sedang):**
   - Modul Rekrutmen, Benefit, Pelatihan, dan Penilaian Kinerja belum tersedia di database schema Prisma saat ini, sehingga membutuhkan penambahan model tanpa merusak migrasi yang telah ada.

---

## 10. REKOMENDASI PENGEMBANGAN TEKNIS BERIKUTNYA

Usulan teknis berikut disusun murni untuk meningkatkan kualitas arsitektur, stabilitas, dan keamanan **tanpa mengubah business logic yang telah disetujui**:

1. **Keamanan & Otorisasi:**
   - Menerapkan penguncian akun sementara setelah 5 kali gagal memasukkan password.
   - Menggunakan hashing algoritma kuat (Argon2id / bcrypt) dan penyimpanan token otentikasi yang aman.
   - Memastikan otorisasi berbasis data (*data-level ownership*) pada endpoint ESS agar Karyawan A tidak pernah bisa membaca slip gaji atau benefit Karyawan B.
2. **Struktur Kode & Maintainability:**
   - Mempertahankan arsitektur **Modular Monolith** di backend NestJS ([`apps/api/src/modules`](file:///d:/Sistem%20HRIS/apps/api/src/modules)) agar setiap domain bisnis (karyawan, absensi, payroll, dll.) terisolasi rapi.
   - Menghubungkan Frontend Next.js 14 ([`apps/web/src/app`](file:///d:/Sistem%20HRIS/apps/web/src/app)) secara konsisten ke 2 panel utama: `/admin` dan `/ess`.
3. **Penjaminan Kualitas (QA) & Pengujian Otomatis:**
   - Menyiapkan rangkaian unit test untuk formula perhitungan gaji dan potongan absensi.
   - Menyiapkan skenario pengujian integrasi (E2E) untuk alur check-in/out dan pengajuan cuti.
4. **Audit Trail & Logging:**
   - Mencatat setiap perubahan data kritis (perubahan gaji, persetujuan cuti, update biodata) ke dalam tabel `audit_logs`.

---
*Laporan Audit Tahap 1 Selesai. Seluruh proses dihentikan untuk menunggu persetujuan resmi pemilik proyek sebelum melangkah ke tahap penyusunan PRD.*
