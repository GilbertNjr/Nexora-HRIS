# ADR-006: Penetapan Default Standar Industri untuk Keputusan Bisnis [REQ-DEC-01] s/d [REQ-DEC-11]

## Konteks & Latar Belakang
Pada dokumen [PRD.md](../PRD.md) Bagian 3 dan [TESTING.md](../TESTING.md) Bagian 4.1, terdapat 11 poin keputusan bisnis (`[REQ-DEC-01]` s/d `[REQ-DEC-11]`) yang harus ditetapkan secara formal sebelum Phase 0 dinyatakan selesai, agar pengembangan modul MVP (P0) tidak menghadapi ambiguitas logika (*business invariant blocker*).

Dokumen ADR ini menetapkan **Standar Industri Praktik Terbaik (*Enterprise Best Practices*)** sebagai implementasi default bawaan sistem NEXORA HRIS. Parameter ini dirancang tetap fleksibel (*configurable*) melalui tabel `system_settings` di kemudian hari.

---

## Matriks Penetapan Keputusan

| ID | Modul | Deskripsi Isu Bisnis | Ketetapan Default Resmi NEXORA | Rasional & Mitigasi Risiko |
| :---: | :---: | :--- | :--- | :--- |
| **`[REQ-DEC-01]`** | Auth & Session | Single vs Multiple Active Session per akun | **Karyawan (ESS): Single Active Session**.<br>**Admin / HR: Multiple Active Sessions** (max 3 device). | Mencegah kecurangan "titip absen" pada ESS jika karyawan membagikan kredensial ke rekan kerja. Admin membutuhkan akses simultaneous (laptop + smartphone). |
| **`[REQ-DEC-02]`** | Auth & RBAC | Hak Super Admin terhadap data gaji | **Penerapan Ketat *Four-Eyes Principle***.<br>Super Admin dilarang melihat/mengubah nominal gaji. Hanya role `HR_ADMIN` & `PAYROLL_MASTER`. | Mencegah kebocoran rahasia kompensasi eksekutif dan mematuhi asas *Separation of Duties (SoD)* standar ISO 27001. |
| **`[REQ-DEC-03]`** | Employee | Batas tanggal cut-off perubahan rekening bank | **Cut-Off Tanggal 20 pukul 23:59 WIB** setiap bulan berjalan. | Menjamin stabilitas data rekening sebelum proses komputasi dan generate file transfer batch payroll tanggal 25. |
| **`[REQ-DEC-04]`** | Attendance | Alur presensi dinas luar kantor / remote | **Wajib Permohonan H-1 disetujui Line Manager**, ATAU jika mendadak wajib selfie bergeotag GPS & input deskripsi tugas. | Menyeimbangkan kontrol manajerial dengan fleksibilitas operasional mendadak di lapangan. |
| **`[REQ-DEC-05]`** | Attendance | Formula komputasi uang lembur | **Formula Resmi Depnaker RI** (Jam 1: 1.5x upah per jam; Jam 2+: 2x upah per jam. Upah per jam = 1/173 x Penghasilan Tetap). | Kepatuhan hukum ketenagakerjaan Indonesia (UU Ketenagakerjaan & PP No. 35/2021) untuk menghindari sanksi audit Disnaker. |
| **`[REQ-DEC-06]`** | Leave | Pengajuan cuti sakit / darurat lampau (*backdated*) | **Diizinkan maksimal H+2 hari kerja**, wajib unggah foto bukti Surat Keterangan Dokter asli. | Memberikan toleransi manusiawi bagi karyawan yang sakit mendadak tanpa membuka celah pemalsuan absensi lampau. |
| **`[REQ-DEC-07]`** | Leave | Tingkat persetujuan cuti (*Approval Tiers*) | **Cuti Tahunan ≤ 2 hari: 1 Tingkat** (Line Manager).<br>**Cuti > 2 hari / Cuti Khusus: 2 Tingkat** (Manager + HR Admin). | Efisiensi birokrasi persetujuan cepat untuk cuti singkat, namun tetap menjaga kontrol kuota untuk cuti panjang. |
| **`[REQ-DEC-08]`** | Payroll | Formula gaji prorata tengah bulan | **Menggunakan Hari Kerja Riil Kalender Bulan Berjalan** (`Hari Kerja Terpenuhi / Total Hari Kerja Resmi Bulan Berjalan * Gaji Pokok`). | Formula paling akurat dan adil bagi perusahaan maupun pekerja sesuai pedoman perhitungan Disnaker. |
| **`[REQ-DEC-09]`** | Payroll | Koreksi gaji pasca status periode `LOCKED` | **Periode Terkunci Bersifat *Immutable***.<br>Koreksi wajib dilakukan via *Retroactive Adjustment* (Penyesuaian Tambah/Kurang) di periode berikutnya. | Menjamin konsistensi pelaporan pajak PPh 21 dan mencegah manipulasi data historis slip gaji yang telah diserahkan ke bank. |
| **`[REQ-DEC-10]`** | Performance | Batas waktu deadline *self-assessment* KPI lewat | **Form Terkunci Otomatis & Auto-Escalate** ke Manager Penilai dengan status `SUBMITTED_OVERDUE` (-5% penalti kedisiplinan). | Mencegah siklus evaluasi tahunan perusahaan terhenti hanya karena keterlambatan satu individu. |
| **`[REQ-DEC-11]`** | Documents | Akses ESS jika Peraturan Perusahaan wajib belum dibaca | **Grace Period 7 Hari Kalender**.<br>Setelah H+7, fitur ESS terkunci (modal wajib konfirmasi baca) kecuali fitur Clock-In/Clock-Out. | Memastikan kepatuhan sosialisasi hukum ketenagakerjaan tanpa melanggar hak karyawan untuk mencatat kehadiran. |

---

## Konsekuensi & Status
- **Status**: **DITERIMA & DISETUJUI SECARA ARSITEKTURAL (*ACCEPTED*)**.
- **Implementasi**: Seluruh aturan di atas langsung menjadi acuan *business invariant* pada DTO validation, service application layer, dan skema basis data di Phase 0 & Phase 1.
