# FUTURE EXPANSION BACKLOG & ARCHITECTURAL READINESS SPECIFICATION
## Human Resource Information System (HRIS) Berbasis Web
**Status:** Cataloged for Future Phases (P2 / P3 Backlog)  
**Dokumentasi:** Arsip Rencana Pengembangan Lanjutan  
**Prinsip Arsitektur:** Zero-Core Refactoring (Dapat dipasang tanpa merombak arsitektur inti)  

---

## 1. IKHTISAR PENGEMBANGAN MASA DEPAN (FUTURE SCOPE BACKLOG)

Daftar 8 inisiatif strategis ini disimpan dan dikatalogkan secara resmi sebagai rencana ekspansi sistem ketika kebutuhan bisnis telah siap mengadopsinya:

1. **Mobile App (Native / Cross-Platform)**
2. **Fingerprint Machine Integration**
3. **Face Recognition Attendance with Liveness Detection**
4. **WhatsApp Business Notification Gateway**
5. **AI HR Analytics & Predictive Workforce Intelligence**
6. **Employee Virtual Assistant / HR Chatbot**
7. **Biometric Attendance Engine**
8. **Advanced Payroll (Multi-Currency, Salary Loan, & Flexible Benefits)**

---

## 2. KESIAPAN ARSITEKTUR & STRATEGI INTEGRASI PER FITUR

Setiap fitur masa depan telah dipersiapkan titik kaitnya (*integration hooks*) pada desain blueprint, database, dan API saat ini:

---

### 1. MOBILE APPLICATION (FLUTTER / REACT NATIVE)
- **Tujuan**: Aplikasi ponsel mandiri (Android & iOS) khusus portal Employee Self-Service (ESS).
- **Kesiapan Arsitektur Saat Ini**:
  - API Backend telah dirancang murni **RESTful JSON** (`/api/v1/...`) terpisah dari frontend, sehingga aplikasi mobile dapat langsung mengonsumsi endpoint yang sama persis (`/auth/login`, `/attendances/clock-in`, `/leaves/requests`, `/payroll/my-payslips`).
  - Autentikasi JWT mendukung penyimpanan token di *Flutter Secure Storage* atau *React Native Keychain*.
- **Komponen yang Akan Ditambahkan**:
  - Repositori baru: `/mobile-app`.
  - Push notification provider (Firebase Cloud Messaging - FCM) yang dihubungkan ke modul notifikasi.

---

### 2. FINGERPRINT MACHINE INTEGRATION (MESIN ABSENSI FISIK)
- **Tujuan**: Sinkronisasi otomatis data log ketukan jari dari mesin absensi fisik kantor (ZKTeco, Solution, dll) ke dalam sistem presensi terpusat.
- **Kesiapan Arsitektur Saat Ini**:
  - Skema tabel `attendances` telah memiliki kolom `clock_in_ip` dan `notes` untuk mencatat sumber mesin (`SOURCE: FINGERPRINT_DEVICE_01`).
  - Constraint unik `(employee_id, work_date)` mencegah duplikasi data jika karyawan sudah melakukan presensi.
- **Komponen yang Akan Ditambahkan**:
  - Background Sync Worker (ADMS / PUSH SDK Listener) yang menerima log mesin dan mengubahnya menjadi event internal presensi.
  - Endpoint webhook khusus: `POST /api/v1/attendances/sync-hardware`.

---

### 3. FACE RECOGNITION WITH LIVENESS DETECTION
- **Tujuan**: Verifikasi presensi berbasis pengenalan wajah melalui kamera perangkat dengan deteksi kedipan/gerakan (*anti-spoofing*) agar presensi tidak dapat dimanipulasi dengan foto cetak.
- **Kesiapan Arsitektur Saat Ini**:
  - Endpoint `POST /api/v1/attendances/clock-in` telah mendukung pengiriman payload lampiran gambar selfie terenkripsi.
- **Komponen yang Akan Ditambahkan**:
  - Tabel `employee_biometric_templates` (menyimpan vektor embedding wajah 128/512 dimensi terenkripsi).
  - Micro-service Face Matching berbasis library AI/Vision (TensorFlow / MediaPipe / AWS Rekognition) yang mengembalikan skor *match confidence* (> 90%).

---

### 4. WHATSAPP BUSINESS NOTIFICATION GATEWAY
- **Tujuan**: Mengirimkan pemberitahuan instan via WhatsApp (misal: Slip gaji terbit, permohonan cuti butuh persetujuan darurat, peringatan keterlambatan).
- **Kesiapan Arsitektur Saat Ini**:
  - Tabel `notification_preferences` telah memiliki kolom `whatsapp_enabled`.
  - Notification Engine berbasis **BullMQ** telah dirancang dengan pola *Multi-Channel Transport Adapter*.
- **Komponen yang Akan Ditambahkan**:
  - Transport Worker baru pada modul notifikasi yang memanggil Meta WhatsApp Cloud API / Twilio WhatsApp API.
  - Template pesan resmi yang telah disetujui (*Approved WhatsApp Message Templates*).

---

### 5. AI HR ANALYTICS & PREDICTIVE WORKFORCE INTELLIGENCE
- **Tujuan**: Menyajikan analitik prediktif seperti: deteksi risiko karyawan akan keluar (*Flight Risk / Attrition Prediction*), deteksi anomali absensi, dan optimasi jadwal shift kerja.
- **Kesiapan Arsitektur Saat Ini**:
  - Database PostgreSQL memiliki integritas data historis lengkap (Presensi, KPI, Riwayat Karir, Masa Kerja).
  - Skema partisi tabel dan replikasi basis data *Read-Replica* disiapkan untuk query analitik berat tanpa mengganggu kinerja transaksi operasional.
- **Komponen yang Akan Ditambahkan**:
  - Data Pipeline (CDC - Change Data Capture) ke data warehouse atau modul analitik Python (scikit-learn/PyTorch) untuk melatih model prediktif secara offline.

---

### 6. EMPLOYEE HR VIRTUAL ASSISTANT / CHATBOT
- **Tujuan**: Asisten virtual cerdas bagi karyawan untuk menjawab pertanyaan seputar kebijakan perusahaan, hak cuti yang tersisa, dan cara klaim reimbursement secara interaktif 24/7.
- **Kesiapan Arsitektur Saat Ini**:
  - Dokumen SOP dan Peraturan Perusahaan tersimpan terstruktur pada Modul 13 (`company_policies` & `employee_documents`).
- **Komponen yang Akan Ditambahkan**:
  - Retrieval-Augmented Generation (RAG) Engine yang mengindeks dokumen SOP ke dalam Vector Database (pgvector pada PostgreSQL).
  - Widget antarmuka obrolan (*Chat Widget*) di portal ESS.

---

### 7. BIOMETRIC ATTENDANCE ENGINE (MULTIMODAL BIOMETRICS)
- **Tujuan**: Mesin verifikasi kehadiran biometrik gabungan (Fingerprint + Face Recognition + Geofencing) untuk area kerja dengan tingkat keamanan ketat (*High-Security Facility*).
- **Kesiapan Arsitektur Saat Ini**:
  - Tabel `attendances` mendukung pencatatan status otentikasi multi-faktor dan metadata perangkat.
- **Komponen yang Akan Ditambahkan**:
  - Modul otentikasi biometrik terpusat (*Biometric Authentication Broker*) dengan verifikasi identitas berlapis.

---

### 8. ADVANCED PAYROLL ENGINE
- **Tujuan**: Mengakomodasi skenario penggajian kompleks tingkat lanjut:
  - Pembayaran Multi-Mata Uang (Multi-Currency USD/EUR/SGD) dengan kurs konversi otomatis.
  - Pinjaman Karyawan & Kasbon (*Salary Advance / Employee Loans*) dengan pemotongan otomatis per bulan.
  - Tunjangan Fleksibel Terbuka (*Cafeteria Flexible Benefits Scheme*).
  - Integrasi langsung Host-to-Host (H2H API) perbankan untuk transfer gaji tanpa unggah file CSV manual.
- **Kesiapan Arsitektur Saat Ini**:
  - Tabel `payroll_items` menggunakan relasi kategori terbuka (`item_type`, `code`, `amount`) yang memungkinkan penambahan komponen potongan kasbon atau tunjangan valuta asing tanpa perlu migrasi DDL tabel.
  - Tabel `payroll_periods` memiliki status locking yang menjamin integritas pembukuan finansial.
- **Komponen yang Akan Ditambahkan**:
  - Tabel `employee_loans` (pagu pinjaman, tenor, angsuran bulanan).
  - Kurs mata uang harian (*Exchange Rates Table*).
  - Adapter API Host-to-Host Bank (BCA API / Mandiri Cash Management API).

---

## 3. PANDUAN AKTIVASI (ACTIVATION PROTOCOL)
Jika sewaktu-waktu manajemen memutuskan untuk mengaktifkan salah satu dari 8 fitur di atas:
1. **Langkah 1**: Buat dokumen *RFC (Request for Change)* dan *Change Impact Report* sesuai standar [`docs/MAINTENANCE.md`](file:///d:/Sistem%20HRIS/docs/MAINTENANCE.md).
2. **Langkah 2**: Manfaatkan titik integrasi (*Extension Points*) yang telah dirancang tanpa mengubah skema tabel inti (*Non-breaking extension*).
3. **Langkah 3**: Buat migrasi tabel pendukung baru dan daftarkan endpoint baru di bawah versi API yang sesuai.
