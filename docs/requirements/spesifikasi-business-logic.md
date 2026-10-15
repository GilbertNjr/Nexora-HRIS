# SPESIFIKASI BUSINESS LOGIC NEXORA HRIS
## Berdasarkan Audit Blueprint Capstone Project (`Capstone Project.pdf`)
**Versi:** 1.0.0-Audit  
**Status:** Menunggu Persetujuan Pemilik Proyek  
**Tim Audit:** Analis Bisnis Senior, Manajer Produk, Arsitek Perangkat Lunak, Analis Sistem, QA Engineer, Security Engineer  

---

## 1. PENDAHULUAN & ACUAN UTAMA

Dokumen ini memetakan seluruh kebutuhan bisnis dan use case yang bersumber langsung dari dokumen `Capstone Project.pdf` (Kelompok 5). Seluruh proses bisnis dipetakan secara objektif dan faktual tanpa penambahan asumsi AI. Bagian yang belum dirinci secara tegas dalam dokumen ditandai dengan **`BELUM DITENTUKAN DALAM DOKUMEN`**, dan ketidaksesuaian antarbagian dokumen ditandai dengan **`KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`**.

### 1.1 Identitas Dokumen Sumber
- **Judul Proyek:** Perencanaan Nexora Human Resource Solutions
- **Penyusun:** Kelompok 5 (Muhammad Saiful Ma’arif, Ferdinas Ebim Khoiruroziy, Ahmat Gebyar Gumelar, Adinda Amelia Putri)
- **Karakteristik Arsitektur Bisnis:** Dual-Panel System (Area Kerja Manajemen / Admin HR dan Area Akses Mandiri Pegawai / Karyawan).
- **Prinsip Data:** Tersentralisasi pada satu basis data utama (*database center*).

---

## 2. DAFTAR AKTOR DAN TANGGUNG JAWAB

Berdasarkan Halaman 2–3 (Bab 5 Use Case) dan Halaman 6 (Bab 8 Class Diagram):

| No | Nama Aktor | Definisi & Hak Tanggung Jawab dalam Dokumen | Panel Akses |
|:---|:---|:---|:---|
| 1 | **Admin HR** | Mengelola seluruh proses administrasi SDM perusahaan: data master pegawai, rekrutmen hingga onboarding, validasi rekapitulasi absensi staf, perhitungan gaji bulanan otomatis (payroll), konfigurasi alokasi benefit (asuransi, BPJS, bonus), input evaluasi kinerja (KPI) divisi, penyusunan jadwal dan peserta pelatihan karier, monitoring grafik statistik SDM dan pengunduhan laporan bulanan, serta konfigurasi dasar aplikasi dan pembagian hak user. | Admin HR Panel |
| 2 | **Karyawan** | Melakukan akses mandiri (*self-service*): autentikasi masuk, pembaruan data kontak personal dinamis (alamat, nomor HP), presensi harian (check-in dan check-out), pengisian formulir digital cuti/sakit/dispensasi, melihat rincian pendapatan harian dan mengunduh berkas slip gaji resmi, memeriksa sisa plafon kesehatan dan jenis asuransi aktif, mengakses penilaian rapot kerja manajemen, serta mengambil tawaran kelas kompetensi atau jadwal diklat wajib. | Employee Self-Service (ESS) Panel |

---

## 3. PEMETAAN LENGKAP 17 USE CASE (15 ATRIBUT DETAIL)

---

### Use Case 01: Login
1. **ID Kebutuhan:** `BR-AUTH-001`
2. **Nama Use Case:** Login
3. **Aktor Terlibat:** Admin HR & Karyawan
4. **Tujuan Proses:** Autentikasi hak akses masuk ke dalam sistem sesuai role.
5. **Kondisi Awal:** Aktor telah terdaftar dalam sistem dan memiliki username serta password aktif.
6. **Pemicu Proses:** Aktor membuka aplikasi HRIS dan mengisi formulir login.
7. **Alur Utama:**
   1. Aktor membuka aplikasi HRIS.
   2. Aktor memasukkan username dan password.
   3. Sistem memvalidasi username dan password terhadap basis data.
   4. Data valid: Sistem mengonfirmasi login berhasil sesuai role (Admin HR atau Karyawan).
   5. Sistem menampilkan Dashboard dengan menu yang sesuai dengan role aktor.
8. **Alur Alternatif:**
   - 3a. Data tidak valid: Sistem menampilkan pesan error dan aktor dikembalikan ke langkah penginputan username dan password.
9. **Data Masukan:** `username : string`, `password : string`
10. **Hasil Proses:** Sesi pengguna aktif, antarmuka dashboard sesuai role (Admin HR Panel atau Employee Self-Service Panel).
11. **Aturan Validasi Ditentukan:** Username dan password wajib cocok dengan data akun pada basis data (`Data valid?`).
12. **Kondisi Akhir:** Aktor berhasil masuk ke dashboard hak aksesnya, atau tetap di halaman login jika kredensial salah.
13. **Modul Berkaitan:** Modul Autentikasi (`User`, `AdminHR`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 2 (Tabel Use Case No. 1), Halaman 4 (Activity Diagram Bagian 1), Halaman 5 (Sequence Diagram Bagian 1), Halaman 6 (Class Diagram `User`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Batas maksimum kegagalan login sebelum akun terkunci (*account lockout*).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Kebijakan panjang dan kompleksitas password untuk method `ubahPassword()`.
   - `KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`: Di PDF menggunakan field `username`, sedangkan implementasi basis data eksisting menggunakan `email` sebagai login identifier utama.

---

### Use Case 02: Kelola data karyawan
1. **ID Kebutuhan:** `BR-EMP-001`
2. **Nama Use Case:** Kelola data karyawan
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Menginput, memperbarui, dan menonaktifkan data master pegawai.
5. **Kondisi Awal:** Admin HR telah login dan berada pada Dashboard Admin.
6. **Pemicu Proses:** Admin HR memilih menu "Kelola data karyawan".
7. **Alur Utama:**
   1. Admin HR memilih menu Kelola Data Karyawan.
   2. Sistem menampilkan daftar data karyawan.
   3. Admin HR melakukan aksi: menambah data baru (`tambah()`), mengubah data (`ubah()`), atau menonaktifkan/menghapus data (`hapus()`).
   4. Admin HR menekan simpan/proses data.
   5. Sistem mengolah dan menyimpan data ke basis data.
   6. Sistem menampilkan konfirmasi data berhasil disimpan dan memperbarui tampilan dashboard.
8. **Alur Alternatif:**
   - 5a. Pengolahan data gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `nip : string`, `nama : string`, `tgl_lahir : date`, `jk : string`, `alamat : string`, `status_kerja : string`, `id_dept : int`
10. **Hasil Proses:** Catatan data master pegawai tersimpan, terperbarui, atau dinonaktifkan di basis data.
11. **Aturan Validasi Ditentukan:** Departemen wajib valid (`id_dept` mengacu ke entitas `Departemen`).
12. **Kondisi Akhir:** Basis data master karyawan terbarui; daftar karyawan pada antarmuka admin termutakhirkan.
13. **Modul Berkaitan:** Modul Data Master Karyawan (`Karyawan`, `Departemen`, `User`).
14. **Referensi Dokumen:** Halaman 2 (Tabel Use Case No. 2), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.1), Halaman 6 (Class Diagram `Departemen` & `Karyawan`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Format penomoran NIP (otomatis atau input manual).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Opsi nilai baku untuk field `status_kerja` (Tetap, Kontrak, Magang, dll.).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Mekanisme method `hapus()` apakah *soft delete* (nonaktif) atau *hard delete*.

---

### Use Case 03: Kelola rekrutmen
1. **ID Kebutuhan:** `BR-REC-001`
2. **Nama Use Case:** Kelola rekrutmen
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Mengatur proses seleksi pelamar baru hingga tahap onboarding.
5. **Kondisi Awal:** Admin HR telah login dan berada pada Dashboard Admin.
6. **Pemicu Proses:** Admin HR memilih menu "Kelola rekrutmen".
7. **Alur Utama:**
   1. Admin HR memilih menu Kelola Rekrutmen.
   2. Sistem menampilkan data rekrutmen yang ada.
   3. Admin HR melakukan penambahan lowongan (`tambah()`), pengubahan status/data (`ubah()`), atau penghapusan (`hapus()`).
   4. Admin HR menyimpan/memproses data seleksi hingga tahap onboarding.
   5. Sistem mengolah dan menyimpan data ke basis data.
   6. Sistem menampilkan hasil pembaharuan data rekrutmen.
8. **Alur Alternatif:**
   - 5a. Pengolahan gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `posisi : string`, `tgl_buka : date`, `tgl_tutup : date`, `status : string`
10. **Hasil Proses:** Catatan posisi rekrutmen dan status proses seleksi hingga onboarding tersimpan.
11. **Aturan Validasi Ditentukan:** Tanggal buka dan tutup wajib berupa tipe `date` yang valid; status terdefinisi.
12. **Kondisi Akhir:** Status rekrutmen dan tahap seleksi pelamar tersimpan di database center.
13. **Modul Berkaitan:** Modul Rekrutmen (`Rekrutmen`, relasi ke `Karyawan` saat onboarding selesai).
14. **Referensi Dokumen:** Halaman 2 (Tabel Use Case No. 3), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.2), Halaman 6 (Class Diagram `Rekrutmen`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Struktur penyimpanan identitas pelamar (nama pelamar, kontak, CV) pada tabel `Rekrutmen`.
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Tahapan status seleksi pelamar yang baku sebelum mencapai onboarding.
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Mekanisme konversi kandidat lolos onboarding menjadi baris baru pada data master `Karyawan`.

---

### Use Case 04: Rekap absensi staf
1. **ID Kebutuhan:** `BR-ATT-001`
2. **Nama Use Case:** Rekap absensi staf
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Memantau, memvalidasi, dan merekap jam masuk/pulang semua staf.
5. **Kondisi Awal:** Karyawan telah melakukan absensi harian di sistem.
6. **Pemicu Proses:** Admin HR memilih menu "Rekap absensi staf" pada dashboard.
7. **Alur Utama:**
   1. Admin HR membuka menu Rekap Absensi Staf.
   2. Sistem menampilkan rekap data absensi staf.
   3. Admin HR memeriksa dan memvalidasi rekapan jam masuk/pulang semua staf (`lihatRekap()`).
   4. Sistem mengolah dan menyimpan status validasi ke basis data.
   5. Sistem menampilkan hasil rekap absensi yang telah divalidasi.
8. **Alur Alternatif:**
   - 4a. Pengolahan gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** Filter periode/tanggal, aksi konfirmasi/validasi rekapan.
10. **Hasil Proses:** Rekapitulasi absensi staf terverifikasi untuk dasar penggajian (*payroll*).
11. **Aturan Validasi Ditentukan:** Rekap absensi terikat pada data karyawan yang sah (`id_karyawan`).
12. **Kondisi Akhir:** Data presensi staf siap pakai untuk pengolahan payroll.
13. **Modul Berkaitan:** Modul Absensi (`Absensi`, `Karyawan`, `Payroll`).
14. **Referensi Dokumen:** Halaman 2 (Tabel Use Case No. 4), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.3), Halaman 6 (Class Diagram `Absensi`).
15. **Informasi yang Belum Ditentukan:**
   - `KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`: Deskripsi use case menyebut "merekap jam masuk/pulang semua staf", tetapi tabel `Absensi` di Class Diagram PDF hanya memuat atribut `tanggal : date`, `status : string`, `keterangan : string` tanpa atribut jam masuk dan jam pulang.
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Aturan jam kerja baku (jam masuk, jam pulang, toleransi keterlambatan).

---

### Use Case 05: Proses payroll
1. **ID Kebutuhan:** `BR-PAY-001`
2. **Nama Use Case:** Proses payroll
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Menghitung gaji bersih otomatis berdasarkan absensi.
5. **Kondisi Awal:** Data rekapitulasi absensi staf pada periode penggajian telah tersedia di sistem.
6. **Pemicu Proses:** Admin HR memilih menu "Proses payroll" dan mengeksekusi perhitungan.
7. **Alur Utama:**
   1. Admin HR memilih menu Proses Payroll pada dashboard.
   2. Admin HR memilih periode penggajian dan memicu proses payroll (`prosesPayroll()`).
   3. Sistem menarik data absensi, menghitung gaji pokok, tunjangan, dan potongan secara otomatis.
   4. Sistem menghasilkan nilai `total_gaji = gaji_pokok + tunjangan - potongan`.
   5. Sistem menyimpan entitas `Payroll` dan secara otomatis menghasilkan dokumen `SlipGaji` (`Payroll` 1 menghasilkan 1 `SlipGaji`).
   6. Sistem menampilkan hasil payroll pada dashboard Admin HR.
8. **Alur Alternatif:**
   - 3a. Pengolahan perhitungan gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `periode : string`, pemicu eksekusi proses payroll.
10. **Hasil Proses:** Catatan `Payroll` terhitung dan entitas `SlipGaji` terbentuk.
11. **Aturan Validasi Ditentukan:** Status payroll tersimpan; relasi 1 `Payroll` menghasilkan 1 `SlipGaji`.
12. **Kondisi Akhir:** Rekap gaji bersih tersimpan dan slip gaji siap diunduh oleh karyawan.
13. **Modul Berkaitan:** Modul Payroll & Kompensasi (`Payroll`, `SlipGaji`, `Absensi`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 5), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.4), Halaman 6 (Class Diagram `Payroll` & `SlipGaji`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Rumus eksak potongan gaji akibat alpa atau keterlambatan absensi.
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Komponen tunjangan (apakah tunjangan tetap atau tunjangan harian per kehadiran).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Tanggal cut-off siklus bulanan penggajian.

---

### Use Case 06: Kelola benefit
1. **ID Kebutuhan:** `BR-BEN-001`
2. **Nama Use Case:** Kelola benefit
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Mengonfigurasi alokasi asuransi, BPJS, dan bonus perusahaan.
5. **Kondisi Awal:** Data master karyawan telah terdaftar.
6. **Pemicu Proses:** Admin HR memilih menu "Kelola benefit".
7. **Alur Utama:**
   1. Admin HR memilih menu Kelola Benefit pada dashboard.
   2. Sistem menampilkan data benefit karyawan.
   3. Admin HR menginput atau memperbarui jenis benefit (asuransi, BPJS, bonus), nominal nilai, dan periode alokasi (`kelolaBenefit()`).
   4. Sistem mengolah dan menyimpan data benefit ke basis data.
   5. Sistem menampilkan konfirmasi data benefit berhasil disimpan.
8. **Alur Alternatif:**
   - 4a. Penyimpanan data gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `id_karyawan : int`, `jenis_benefit : string`, `nilai : decimal`, `periode : string`
10. **Hasil Proses:** Alokasi data benefit karyawan tersimpan dan terbarui di basis data.
11. **Aturan Validasi Ditentukan:** Nilai benefit bertipe desimal; terikat pada karyawan sah (`id_karyawan`).
12. **Kondisi Akhir:** Data alokasi benefit aktif dan dapat dilihat oleh karyawan di panel ESS.
13. **Modul Berkaitan:** Modul Benefit (`Benefit`, `Karyawan`, `Payroll`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 6), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.5), Halaman 6 (Class Diagram `Benefit`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Kebijakan plafon tahunan vs premi bulanan untuk asuransi dan BPJS.
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Keterkaitan langsung alokasi benefit terhadap komponen tunjangan/potongan di modul payroll.

---

### Use Case 07: Penilaian Kinerja
1. **ID Kebutuhan:** `BR-PRF-001`
2. **Nama Use Case:** Penilaian Kinerja
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Menginput hasil evaluasi kerja berkala (KPI) tiap divisi.
5. **Kondisi Awal:** Karyawan terdaftar aktif pada suatu departemen/divisi.
6. **Pemicu Proses:** Admin HR memilih menu "Penilaian kinerja".
7. **Alur Utama:**
   1. Admin HR memilih menu Penilaian Kinerja pada dashboard.
   2. Admin HR memilih karyawan dan periode evaluasi yang dinilai.
   3. Admin HR menginput nilai evaluasi dan catatan evaluasi (`inputNilai()`).
   4. Sistem mengolah dan menyimpan data penilaian ke basis data.
   5. Sistem menampilkan hasil penilaian kinerja pada antarmuka admin.
8. **Alur Alternatif:**
   - 4a. Pengolahan data gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `id_karyawan : int`, `periode : string`, `nilai : decimal`, `catatan : string`
10. **Hasil Proses:** Catatan evaluasi kerja (rapot kerja) tersimpan di basis data.
11. **Aturan Validasi Ditentukan:** Terikat pada `id_karyawan` yang valid; nilai bertipe `decimal`.
12. **Kondisi Akhir:** Rapot kerja tersimpan dan dapat diakses oleh karyawan pada panel ESS.
13. **Modul Berkaitan:** Modul Penilaian Kinerja (`PenilaianKinerja`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 7), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.6), Halaman 6 (Class Diagram `PenilaianKinerja`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Skala baku skor KPI (misal 0–100 atau 1.00–5.00).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Indikator-indikator rincian KPI per divisi sebelum dirangkum menjadi skor nilai tunggal.

---

### Use Case 08: Kelola pelatihan
1. **ID Kebutuhan:** `BR-TRN-001`
2. **Nama Use Case:** Kelola pelatihan
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Menyusun program, jadwal, dan daftar peserta pelatihan karier.
5. **Kondisi Awal:** Admin HR berada pada Dashboard Admin.
6. **Pemicu Proses:** Admin HR memilih menu "Kelola pelatihan".
7. **Alur Utama:**
   1. Admin HR memilih menu Kelola Pelatihan pada dashboard.
   2. Sistem menampilkan program pelatihan yang ada.
   3. Admin HR melakukan penambahan jadwal baru (`tambah()`), pembaharuan (`ubah()`), atau penghapusan jadwal (`hapus()`).
   4. Admin HR menyimpan informasi program, jadwal, lokasi, dan kapasitas peserta.
   5. Sistem mengolah dan menyimpan data pelatihan ke basis data.
   6. Sistem menampilkan daftar pelatihan terbarui pada dashboard.
8. **Alur Alternatif:**
   - 5a. Pengolahan gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `nama_pelatihan : string`, `tanggal : date`, `lokasi : string`, `peserta : int`
10. **Hasil Proses:** Jadwal pelatihan karier dan kuota kapasitas peserta tersimpan di basis data.
11. **Aturan Validasi Ditentukan:** Tanggal pelaksanaan valid; kuota peserta bertipe integer.
12. **Kondisi Akhir:** Program pelatihan aktif dan tampil pada tawaran pelatihan karyawan di panel ESS.
13. **Modul Berkaitan:** Modul Pelatihan (`Pelatihan`, relasi ke `Karyawan`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 8), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.7), Halaman 6 (Class Diagram `Pelatihan`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Skema penyimpanan daftar nama karyawan yang menjadi peserta (relasi peserta per kegiatan).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Pembeda atribut antara diklat wajib dan tawaran kelas kompetensi pilihan.

---

### Use Case 09: Lihat lap. analitik
1. **ID Kebutuhan:** `BR-REP-001`
2. **Nama Use Case:** Lihat lap. analitik
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Memantau grafik statistik SDM dan mengunduh laporan bulanan.
5. **Kondisi Awal:** Data operasional SDM (karyawan, absensi, payroll) telah tercatat di sistem.
6. **Pemicu Proses:** Admin HR memilih menu "Lihat lap. analitik".
7. **Alur Utama:**
   1. Admin HR memilih menu Laporan Analitik pada dashboard.
   2. Sistem menyajikan grafik statistik data SDM perusahaan.
   3. Admin HR melihat grafik pemantauan dan memicu aksi generate/unduh laporan bulanan (`generate()`, `unduh()`).
   4. Sistem memproses penyusunan berkas laporan dan mencatat tanggal generate.
   5. Sistem mengirimkan berkas laporan ke pengguna untuk diunduh.
8. **Alur Alternatif:**
   - 4a. Pengolahan data/berkas gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** Pilihan `jenis : string`, `periode : string`, pemicu unduh.
10. **Hasil Proses:** Visualisasi grafik statistik SDM pada layar dan berkas dokumen laporan bulanan terunduh.
11. **Aturan Validasi Ditentukan:** Berkas laporan terhubung pada jenis dan periode yang sah.
12. **Kondisi Akhir:** Entitas `LaporanAnalitik` mencatat riwayat generate dan berkas tersimpan.
13. **Modul Berkaitan:** Modul Laporan & Analitik (`LaporanAnalitik`, sumber data dari seluruh modul).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 9), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.8), Halaman 6 (Class Diagram `LaporanAnalitik`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Format baku berkas `file_laporan` (PDF, Excel, atau CSV).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Parameter grafik statistik spesifik yang wajib ditampilkan (turnover rate, rasio kehadiran, dll.).

---

### Use Case 10: Pengaturan sistem
1. **ID Kebutuhan:** `BR-SET-001`
2. **Nama Use Case:** Pengaturan sistem
3. **Aktor Terlibat:** Admin HR
4. **Tujuan Proses:** Mengatur konfigurasi dasar aplikasi dan pembagian hak user.
5. **Kondisi Awal:** Admin HR berada pada Dashboard Admin.
6. **Pemicu Proses:** Admin HR memilih menu "Pengaturan sistem".
7. **Alur Utama:**
   1. Admin HR memilih menu Pengaturan Sistem pada dashboard.
   2. Sistem menampilkan daftar konfigurasi dasar aplikasi dan pembagian hak user.
   3. Admin HR melakukan modifikasi pengaturan (`ubahSetting()`) atau mengembalikan ke konfigurasi bawaan (`reset()`).
   4. Sistem mengolah dan memperbarui konfigurasi pada basis data.
   5. Sistem menampilkan konfirmasi keberhasilan pengaturan.
8. **Alur Alternatif:**
   - 4a. Pembaruan pengaturan gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `id_setting : int`, `nama_setting : string`, `nilai : string`, `deskripsi : string`
10. **Hasil Proses:** Parameter konfigurasi dasar aplikasi dan pembagian hak user terbarui.
11. **Aturan Validasi Ditentukan:** Nilai konfigurasi sah; nama pengaturan terdefinisi.
12. **Kondisi Akhir:** Konfigurasi baru langsung berlaku aktif pada aplikasi.
13. **Modul Berkaitan:** Modul Pengaturan Sistem (`PengaturanSistem`, hak akses `User`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 10), Halaman 4 (Activity Diagram Bagian 2), Halaman 5 (Sequence Diagram Bagian 2.9), Halaman 6 (Class Diagram `PengaturanSistem`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Daftar kunci konfigurasi dasar bawaan yang wajib ada.
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Rincian mekanisme pembagian hak user (apakah custom RBAC matrix atau penugasan role Admin/Karyawan).

---

### Use Case 11: Kelola profil mandiri
1. **ID Kebutuhan:** `BR-ESS-EMP-001`
2. **Nama Use Case:** Kelola profil mandiri
3. **Aktor Terlibat:** Karyawan
4. **Tujuan Proses:** Mengubah data personal yang bersifat dinamis (alamat, nomor HP).
5. **Kondisi Awal:** Karyawan telah login ke Employee Self-Service (ESS).
6. **Pemicu Proses:** Karyawan memilih menu "Profil" pada portal ESS.
7. **Alur Utama:**
   1. Karyawan memilih menu Profil Mandiri pada dashboard ESS.
   2. Sistem mengambil dan menampilkan data profil karyawan saat ini.
   3. Karyawan mengubah data personal yang bersifat dinamis (alamat dan/atau nomor HP).
   4. Karyawan menyimpan perubahan.
   5. Sistem memproses pembaruan data ke basis data utama.
   6. Sistem menampilkan hasil profil yang telah terbarui ke layar karyawan.
8. **Alur Alternatif:**
   - 5a. Penyimpanan data gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `alamat : string`, `no_hp : string`
10. **Hasil Proses:** Data kontak dan alamat personal karyawan termutakhirkan.
11. **Aturan Validasi Ditentukan:** Perubahan dibatasi secara tegas hanya pada data personal yang bersifat dinamis (alamat, nomor HP). Data struktural (NIP, nama, status kerja, departemen) tidak dapat diubah mandiri.
12. **Kondisi Akhir:** Basis data utama master karyawan mencatat alamat dan nomor HP terbaru.
13. **Modul Berkaitan:** Modul ESS Profil (`Karyawan`, `User`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 11), Halaman 4 (Activity Diagram Bagian 3), Halaman 5 (Sequence Diagram Bagian 3.1), Halaman 6 (Class Diagram `Karyawan` method `kelolaProfil()`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Validasi format nomor HP (panjang karakter, format negara/08xx).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Apakah perubahan alamat membutuhkan verifikasi HR sebelum aktif atau berlaku seketika (*instant update*).

---

### Use Case 12: Absensi digital
1. **ID Kebutuhan:** `BR-ESS-ATT-001`
2. **Nama Use Case:** Absensi digital
3. **Aktor Terlibat:** Karyawan
4. **Tujuan Proses:** Melakukan check-in dan check-out kehadiran kerja harian.
5. **Kondisi Awal:** Karyawan telah login ke ESS pada hari kerja berjalan.
6. **Pemicu Proses:** Karyawan memilih menu "Absensi" dan menekan tombol check-in atau check-out.
7. **Alur Utama:**
   1. Karyawan memilih menu Absensi pada portal ESS.
   2. Sistem menampilkan status kehadiran hari ini.
   3. Karyawan melakukan aksi check-in saat masuk kerja atau check-out saat pulang kerja (`inputAbsen()`).
   4. Sistem mencatat waktu presensi dan menyimpan data kehadiran ke basis data.
   5. Sistem mengembalikan konfirmasi absensi berhasil ke antarmuka karyawan.
8. **Alur Alternatif:**
   - 4a. Pencatatan absensi gagal: Sistem menampilkan pesan gagal.
9. **Data Masukan:** Pilihan aksi (check-in / check-out), `tanggal : date`, `keterangan : string` (opsional).
10. **Hasil Proses:** Catatan absensi digital harian tersimpan dengan status konfirmasi.
11. **Aturan Validasi Ditentukan:** Absensi terikat pada karyawan bersangkutan (`id_karyawan`) untuk tanggal berjalan.
12. **Kondisi Akhir:** Data presensi masuk ke basis data dan langsung dapat dipantau oleh Admin HR pada menu Rekap Absensi Staf.
13. **Modul Berkaitan:** Modul ESS Absensi (`Absensi`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 12), Halaman 4 (Activity Diagram Bagian 3), Halaman 5 (Sequence Diagram Bagian 3.2), Halaman 6 (Class Diagram `Absensi` method `inputAbsen()`, `Karyawan` method `absenDigital()`).
15. **Informasi yang Belum Ditentukan:**
   - `KONFLIK KEBUTUHAN — MEMERLUKAN KEPUTUSAN`: Deskripsi use case menyebut "check-in dan check-out", namun atribut tabel `Absensi` di Class Diagram tidak memiliki field waktu jam masuk dan jam keluar secara eksplisit.
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Pembatasan geolokasi GPS / radius kantor untuk presensi digital.

---

### Use Case 13: Ajukan cuti dan izin
1. **ID Kebutuhan:** `BR-ESS-LEV-001`
2. **Nama Use Case:** Ajukan cuti dan izin
3. **Aktor Terlibat:** Karyawan
4. **Tujuan Proses:** Mengisi formulir digital permohonan libur, sakit, atau dispensasi.
5. **Kondisi Awal:** Karyawan telah login ke portal ESS.
6. **Pemicu Proses:** Karyawan memilih menu "Ajukan Cuti/Izin".
7. **Alur Utama:**
   1. Karyawan memilih menu Ajukan Cuti/Izin pada portal ESS.
   2. Karyawan mengisi formulir permohonan digital: jenis permohonan (libur/cuti, sakit, atau dispensasi), tanggal mulai, tanggal selesai, dan keterangan.
   3. Karyawan menekan tombol ajukan (`ajukan()`).
   4. Sistem memvalidasi rentang tanggal dan menyimpan permohonan dengan status awal ke basis data.
   5. Sistem menampilkan konfirmasi status pengajuan cuti/izin kepada karyawan.
8. **Alur Alternatif:**
   - 4a. Pengajuan gagal atau validasi tanggal tidak sesuai: Sistem menampilkan pesan gagal.
9. **Data Masukan:** `jenis : string` (libur/cuti, sakit, dispensasi), `tanggal_mulai : date`, `tanggal_selesai : date`, `keterangan : string`
10. **Hasil Proses:** Catatan pengajuan cuti/izin tersimpan dengan status permohonan di basis data.
11. **Aturan Validasi Ditentukan:** Jenis permohonan mencakup libur, sakit, atau dispensasi; rentang tanggal mulai dan selesai valid.
12. **Kondisi Akhir:** Status permohonan cuti/izin tercatat menunggu persetujuan (*pending*) dan dapat dipantau oleh karyawan.
13. **Modul Berkaitan:** Modul ESS Cuti & Izin (`CutiIzin`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 13), Halaman 4 (Activity Diagram Bagian 3), Halaman 5 (Sequence Diagram Bagian 3.3), Halaman 6 (Class Diagram `CutiIzin`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Kuota baku saldo cuti tahunan per karyawan.
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Siapa aktor yang mengeksekusi method `ubahStatus()` pada entitas `CutiIzin` (apakah Admin HR langsung atau atasan langsung).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Kewajiban upload dokumen lampiran surat dokter untuk izin jenis sakit.

---

### Use Case 14: Unduh slip gaji
1. **ID Kebutuhan:** `BR-ESS-PAY-001`
2. **Nama Use Case:** Unduh slip gaji
3. **Aktor Terlibat:** Karyawan
4. **Tujuan Proses:** Melihat rincian pendapatan harian dan mengunduh berkas slip resmi.
5. **Kondisi Awal:** Admin HR telah memproses payroll pada periode tersebut.
6. **Pemicu Proses:** Karyawan memilih menu "Unduh Slip Gaji" pada portal ESS.
7. **Alur Utama:**
   1. Karyawan memilih menu Unduh Slip Gaji pada dashboard ESS.
   2. Sistem mengambil data pendapatan karyawan yang bersangkutan dari entitas `Payroll` dan `SlipGaji`.
   3. Sistem menampilkan rincian pendapatan (gaji pokok, tunjangan, potongan, total gaji).
   4. Karyawan menekan tombol unduh berkas slip resmi (`unduh()`).
   5. Sistem mengirimkan berkas resmi (`file_slip`) untuk diunduh ke perangkat karyawan.
8. **Alur Alternatif:**
   - 3a. Berkas atau data slip belum tersedia: Sistem menampilkan pesan informasi bahwa slip belum tersedia.
9. **Data Masukan:** Pilihan periode gaji yang ingin dilihat/diunduh.
10. **Hasil Proses:** Rincian pendapatan tampil di layar dan dokumen fisik slip gaji resmi terunduh.
11. **Aturan Validasi Ditentukan:** Karyawan hanya dapat mengakses data slip gaji miliknya sendiri (`id_karyawan`).
12. **Kondisi Akhir:** Karyawan memiliki berkas resmi slip gaji.
13. **Modul Berkaitan:** Modul ESS Payroll (`SlipGaji`, `Payroll`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 14), Halaman 4 (Activity Diagram Bagian 3), Halaman 5 (Sequence Diagram Bagian 3.4), Halaman 6 (Class Diagram `SlipGaji` & `Payroll`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Format dokumen berkas `file_slip` (PDF resmi dengan kop surat atau format lain).
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Maksud frasa "melihat rincian pendapatan harian" (apakah memuat tabel rincian presensi harian dalam slip atau sekadar rincian bulanan).

---

### Use Case 15: Lihat benefit
1. **ID Kebutuhan:** `BR-ESS-BEN-001`
2. **Nama Use Case:** Lihat benefit
3. **Aktor Terlibat:** Karyawan
4. **Tujuan Proses:** Mengecek sisa plafon kesehatan atau jenis asuransi yang aktif.
5. **Kondisi Awal:** Admin HR telah mengonfigurasi benefit untuk karyawan.
6. **Pemicu Proses:** Karyawan memilih menu "Lihat Benefit" pada portal ESS.
7. **Alur Utama:**
   1. Karyawan memilih menu Lihat Benefit pada dashboard ESS.
   2. Sistem mengambil data benefit dari entitas `Benefit` berdasarkan identitas karyawan login (`lihatBenefit()`).
   3. Sistem menampilkan jenis asuransi aktif, BPJS, dan sisa plafon kesehatan beserta nilainya.
   4. Karyawan melihat informasi hak benefit.
8. **Alur Alternatif:**
   - 2a. Data benefit belum dikonfigurasi: Sistem menampilkan informasi benefit kosong.
9. **Data Masukan:** Identitas sesi karyawan yang aktif.
10. **Hasil Proses:** Informasi hak benefit dan sisa plafon kesehatan tampil pada antarmuka karyawan.
11. **Aturan Validasi Ditentukan:** Informasi terisolasi hanya menampilkan data benefit milik karyawan yang sedang login.
12. **Kondisi Akhir:** Karyawan mengetahui status kepesertaan asuransi dan sisa plafon kesehatannya.
13. **Modul Berkaitan:** Modul ESS Benefit (`Benefit`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 3 (Tabel Use Case No. 15), Halaman 4 (Activity Diagram Bagian 3), Halaman 5 (Sequence Diagram Bagian 3.5), Halaman 6 (Class Diagram `Benefit`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Struktur pencatatan klaim reimbursement untuk menghitung pengurangan "sisa plafon".

---

### Use Case 16: Lihat evaluasi
1. **ID Kebutuhan:** `BR-ESS-PRF-001`
2. **Nama Use Case:** Lihat evaluasi
3. **Aktor Terlibat:** Karyawan
4. **Tujuan Proses:** Mengakses penilaian rapot kerja yang diberikan oleh manajemen.
5. **Kondisi Awal:** Admin HR telah menginput penilaian kinerja berkala karyawan.
6. **Pemicu Proses:** Karyawan memilih menu "Lihat Evaluasi" pada portal ESS.
7. **Alur Utama:**
   1. Karyawan memilih menu Lihat Evaluasi pada dashboard ESS.
   2. Sistem mengambil data dari entitas `PenilaianKinerja` berdasarkan identitas karyawan login (`lihatHasil()`).
   3. Sistem menampilkan rincian skor nilai evaluasi, periode, dan catatan kerja manajemen.
   4. Karyawan melihat hasil rapot kerja.
8. **Alur Alternatif:**
   - 2a. Evaluasi belum diinput manajemen: Sistem menampilkan informasi bahwa penilaian belum tersedia.
9. **Data Masukan:** Pilihan periode evaluasi (opsional).
10. **Hasil Proses:** Tampilan rapot kerja karyawan disajikan di layar.
11. **Aturan Validasi Ditentukan:** Data evaluasi bersifat *read-only* bagi karyawan; terikat pada karyawan bersangkutan.
12. **Kondisi Akhir:** Karyawan memahami hasil evaluasi kinerjanya.
13. **Modul Berkaitan:** Modul ESS Evaluasi Kinerja (`PenilaianKinerja`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 4 (Tabel Use Case No. 16), Halaman 4 (Activity Diagram Bagian 3), Halaman 5 (Sequence Diagram Bagian 3.6), Halaman 6 (Class Diagram `PenilaianKinerja`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Mekanisme tanggal publikasi resmi hasil penilaian kinerja kepada karyawan.

---

### Use Case 17: Lihat pelatihan
1. **ID Kebutuhan:** `BR-ESS-TRN-001`
2. **Nama Use Case:** Lihat pelatihan
3. **Aktor Terlibat:** Karyawan
4. **Tujuan Proses:** Mengambil tawaran kelas kompetensi atau jadwal diklat wajib.
5. **Kondisi Awal:** Admin HR telah mempublikasikan program pelatihan.
6. **Pemicu Proses:** Karyawan memilih menu "Lihat Pelatihan" pada portal ESS.
7. **Alur Utama:**
   1. Karyawan memilih menu Lihat Pelatihan pada dashboard ESS.
   2. Sistem mengambil dan menampilkan jadwal pelatihan aktif dari entitas `Pelatihan`.
   3. Karyawan melihat informasi program, tanggal, lokasi, dan kapasitas peserta.
   4. Karyawan mengambil tawaran kelas kompetensi atau melihat jadwal diklat wajib.
   5. Sistem mengonfirmasi keikutsertaan atau menampilkan detail jadwal.
8. **Alur Alternatif:**
   - 2a. Tidak ada program pelatihan aktif: Sistem menampilkan pesan bahwa belum ada pelatihan yang tersedia.
9. **Data Masukan:** Pilihan program pelatihan, aksi pemilihan/pengambilan kelas.
10. **Hasil Proses:** Informasi jadwal pelatihan tampil di layar dan keikutsertaan kelas tercatat.
11. **Aturan Validasi Ditentukan:** Program pelatihan yang ditampilkan adalah kegiatan yang aktif.
12. **Kondisi Akhir:** Karyawan terdaftar atau mengetahui jadwal diklat wajibnya.
13. **Modul Berkaitan:** Modul ESS Pelatihan (`Pelatihan`, `Karyawan`).
14. **Referensi Dokumen:** Halaman 4 (Tabel Use Case No. 17), Halaman 4 (Activity Diagram Bagian 3), Halaman 5 (Sequence Diagram Bagian 3.7), Halaman 6 (Class Diagram `Pelatihan`).
15. **Informasi yang Belum Ditentukan:**
   - `BELUM DITENTUKAN DALAM DOKUMEN`: Validasi kuota sisa pendaftaran mandiri jika peserta telah mencapai batas kapasitas `peserta : int`.
