# SECURITY ARCHITECTURE & COMPLIANCE SPECIFICATION
## Sistem Human Resource Information System (HRIS) Berbasis Web
**Version:** 1.0.0  
**Compliance Standards:** OWASP ASVS Level 2, Indonesia UU Perlindungan Data Pribadi (UU PDP), ISO 27001 Controls.  

---

## 1. Security Core Principles
Data HRIS mencakup Personally Identifiable Information (PII) tingkat tinggi: Kartu Tanda Penduduk (KTP), NPWP, rekening bank, slip gaji, data keluarga, dan data riwayat medis. Keamanan dirancang secara integral (*Security by Design*), bukan sebagai lapisan tambahan di akhir.

---

## 2. Authentication & Session Hardening
1. **Password Security**:
   - Algoritma hashing: **Argon2id** (Memory: 64MB, Iterations: 3, Parallelism: 4) atau **bcrypt** (Cost factor 12).
   - Kebijakan Kompleksitas: Minimal 10 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol.
   - Pengecekan daftar password bocor (*HaveIBeenPwned* blacklist check pada saat registrasi/ganti password).
2. **Token Lifecycle**:
   - **Access Token**: JWT berumur pendek (*Short-lived*, masa aktif 15 menit), ditandatangani dengan algoritma asymmetric RS256 atau HMAC SHA-256. Payload hanya memuat `sub` (User ID), `role`, dan permission hash tanpa data sensitif.
   - **Refresh Token**: Disimpan dalam cookie bertipe `HttpOnly`, `Secure`, `SameSite=Strict`.
   - **Token Rotation**: Setiap kali refresh token digunakan, token lama langsung dibatalkan (*revoked*) dan pasangan token baru diterbitkan.
   - **Revocation List**: Penyimpanan token blacklist pada Redis dengan TTL yang selaras dengan masa kedaluwarsa access token saat pengguna melakukan logout atau saat hak akses diubah.
3. **Multi-Factor Authentication (MFA)**:
   - Wajib untuk akun Super Admin dan HR Payroll Specialist menggunakan TOTP (Time-based One-Time Password standar RFC 6238 via Google Authenticator / Authy).

---

## 3. Centralized Authorization Architecture (RBAC & ABAC)
Sistem menggunakan kombinasi **Role-Based Access Control (RBAC)** untuk modul global dan **Attribute-Based Access Control (ABAC)** untuk isolasi hierarkis:

### Matriks Peran & Hak Akses Dasar
| Modul / Domain | Super Admin | HR Admin | HR Staff | Manager | Employee |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **User & Role Mgmt** | CRUD (Full) | Read | None | None | None |
| **Employee Master Data**| Full | Full | Read/Update | Team Read | Self Read/Update* |
| **Attendance** | Full | Full | Verify/Import | Team Approve | Self Clock-in & History |
| **Leave Management** | Full | Policy/All | Verify | Team Approve | Self Submit & View |
| **Payroll Processing** | System Config | Full (Run/Lock) | Prep Data | None | Self Payslip Only |
| **Performance Review** | Full | Administer | Monitor | Team Assess | Self Assess |
| **Audit Log Trail** | Read-Only | Read-Only | None | None | None |
| **System Settings** | Full | Limited | None | None | None |

*\*Catatan: Self Read/Update terbatas pada data non-struktural (alamat domisili, nomor telepon, kontak darurat).*

### ABAC Rule Enforcement
- Karyawan hanya dapat melihat dan memodifikasi data kepemilikan pribadi (`employee.user_id === current_user.id`).
- Manager hanya dapat menyetujui cuti/lembur untuk karyawan yang berada dalam hirarki langsung di bawahnya (`employee.manager_id === current_user.employee_id`).

---

## 4. Cryptographic Protection of Sensitive Data
1. **Encryption at Rest**:
   - Field database sensitif (`basic_salary`, `net_salary`, `national_id_number`, `bank_account_no`) dienkripsi menggunakan **AES-256-GCM**.
   - Kunci enkripsi (*Data Encryption Key / DEK*) disimpan di Environment Variable atau Key Management Service (KMS), tidak pernah di-commit ke Git.
2. **Encryption in Transit**:
   - Seluruh koneksi klien-ke-server wajib menggunakan TLS 1.3 / HTTPS.
   - HSTS (*HTTP Strict Transport Security*) diaktifkan dengan `max-age=31536000; includeSubDomains; preload`.

---

## 5. Defense Against OWASP Top 10 Vulnerabilities
1. **SQL Injection**:
   - Dilarang keras menggunakan konkatenasi string mentah (*raw string concatenation*) dalam query database.
   - Wajib menggunakan Parameterized Queries melalui ORM (TypeORM / Prisma / Knex).
2. **Cross-Site Scripting (XSS)**:
   - Output encoding otomatis oleh frontend engine (React / Next.js).
   - Sanitasi input menggunakan DOMPurify untuk konten rich-text/notes.
   - Header `Content-Security-Policy (CSP)` ketat diaktifkan.
3. **Cross-Site Request Forgery (CSRF)**:
   - Penggunaan cookie `SameSite=Strict` untuk refresh token.
   - Header kustom `X-Requested-With` atau Double Submit Cookie pattern untuk state-changing requests.
4. **Rate Limiting & Brute Force**:
   - Rate limit ketat pada endpoint `/auth/login` (maksimal 5 percobaan gagal per 15 menit per IP/akun sebelum akun dikunci sementara).
   - Rate limit global API (misal: 100 requests per menit per user).

---

## 6. Secure File Upload Policy
1. **Validasi Tipe Konten**: Pemeriksaan *Magic Number / File Signature Bytes* (bukan hanya ekstensi file atau header `Content-Type`).
2. **Whitelist Ekstensi**: Hanya mengizinkan `.pdf`, `.jpg`, `.jpeg`, `.png`.
3. **Ukuran Maksimal**: Dibatasi maksimal 5 MB untuk dokumen dan 2 MB untuk foto profil/presensi.
4. **Penyimpanan Terisolasi**: File diunggah ke storage terisolasi (Private S3 bucket atau secure directory di luar web root).
5. **Nama File Acak**: Nama file asli di-hash menjadi UUIDv4 acak (misal: `4e72a8c1-1234-4567.pdf`) untuk mencegah *Path Traversal*.
6. **Akses Dokumen Berhak**: Dokumen pribadi (slip gaji, KTP, surat dokter) hanya dapat diakses melalui *Signed URLs* dengan masa kedaluwarsa 5 menit.

---

## 7. Tamper-Proof Audit Logging & Non-Repudiation
1. Tabel `audit_logs` dibuat secara *Append-Only* tanpa trigger UPDATE atau DELETE.
2. Setiap aksi mencatat: `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `user_agent`, `old_values`, `new_values`.
3. Akses audit log hanya dapat dibaca (*Read-Only*) oleh Super Admin dan HR Director.
