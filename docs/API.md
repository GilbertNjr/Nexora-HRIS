# ENTERPRISE REST API CONTRACT SPECIFICATION
## Human Resource Information System (HRIS) Berbasis Web
**Roles:** Senior Backend Architect & API Designer  
**Version:** 2.0.0-Production-Contract  
**Base URL:** `/api/v1`  
**Protocol:** HTTPS (TLS 1.3) | Format: JSON (`Content-Type: application/json`)  
**OpenAPI Specification:** Compliant with OpenAPI 3.0 / Swagger  

---

## DAFTAR ISI
1. [Standar Fondasi API & Protocol Architecture](#1-standar-fondasi-api--protocol-architecture)
   - [API Versioning & Deprecation](#11-api-versioning--deprecation)
   - [Authentication & Token Lifecycle Strategy](#12-authentication--token-lifecycle-strategy)
   - [Authorization Strategy (RBAC & ABAC Enforcement)](#13-authorization-strategy-rbac--abac-enforcement)
   - [Rate Limiting Strategy](#14-rate-limiting-strategy)
   - [Pagination, Filtering & Sorting Standards](#15-pagination-filtering--sorting-standards)
   - [Idempotency Key Architecture](#16-idempotency-key-architecture)
   - [Concurrency Handling & Optimistic Locking](#17-concurrency-handling--optimistic-locking)
   - [Standard Response Envelopes](#18-standard-response-envelopes)
2. [Spesifikasi Rinci 12 API Domains](#2-spesifikasi-rinci-12-api-domains)
   - [Domain 01: AUTH API](#domain-01-auth-api)
   - [Domain 02: EMPLOYEE API](#domain-02-employee-api)
   - [Domain 03: ATTENDANCE API](#domain-03-attendance-api)
   - [Domain 04: LEAVE API](#domain-04-leave-api)
   - [Domain 05: PAYROLL API](#domain-05-payroll-api)
   - [Domain 06: PERFORMANCE API](#domain-06-performance-api)
   - [Domain 07: RECRUITMENT API](#domain-07-recruitment-api)
   - [Domain 08: BENEFIT API](#domain-08-benefit-api)
   - [Domain 09: CAREER API](#domain-09-career-api)
   - [Domain 10: NOTIFICATION API](#domain-10-notification-api)
   - [Domain 11: REPORT API](#domain-11-report-api)
   - [Domain 12: ADMIN API](#domain-12-admin-api)

---

## 1. STANDAR FONDASI API & PROTOCOL ARCHITECTURE

### 1.1. API Versioning & Deprecation
- Prefix jalur URL: `/api/v1/...`.
- Breaking changes wajib menaikkan versi menjadi `/api/v2/...`.
- Jalur versi lama dipertahankan dengan header deprecation (`Deprecation: true`, `Sunset: Wed, 31 Dec 2026 23:59:59 GMT`) minimal selama 6 bulan.

### 1.2. Authentication & Token Lifecycle Strategy
- **Access Token**: JWT berumur pendek (15 menit), dikirimkan via header `Authorization: Bearer <access_token>`.
- **Refresh Token**: Berumur 7 hari, disimpan dalam cookie aman (`HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1/auth`).
- **Token Rotation**: Penggunaan refresh token lama yang sudah dirotasi akan memicu pembatalan (*revocation*) seluruh sesi user di Redis (*Token Reuse Detection*).
- **MFA Challenge**: Akun dengan MFA aktif akan menerima `mfa_token` berumur 5 menit yang hanya valid untuk endpoint `/auth/mfa/verify`.

### 1.3. Authorization Strategy (RBAC & ABAC Enforcement)
- **Role-Based (RBAC)**: Ditegakkan di level Route Guard (contoh: `@RequireRoles('HR_ADMIN', 'SUPER_ADMIN')` atau `@RequirePermissions('payroll:run')`).
- **Attribute-Based (ABAC)**: Ditegakkan di Application Service / Repository Query:
  - *Employee Scope*: Record difilter otomatis berdasarkan `employee.user_id === req.user.id`.
  - *Manager Scope*: Record difilter berdasarkan `employee.manager_id === req.user.employee_id` atau keanggotaan departemen.

### 1.4. Rate Limiting Strategy
Dikelola menggunakan Redis Token Bucket:
- **Auth Endpoints (`/auth/login`, `/auth/forgot-password`)**: Maksimal 5 request per 15 menit per kombinasi IP + Email. Melebihi batas -> HTTP 429 `TOO_MANY_REQUESTS`.
- **Public / General API**: Maksimal 120 request per menit per User ID/IP.
- **Reporting & Export (`/reports/export/*`)**: Maksimal 5 request per menit per User ID.

### 1.5. Pagination, Filtering & Sorting Standards
- **Query Parameter Standar**:
  - `page`: Nomor halaman (Integer, default: 1, min: 1).
  - `limit`: Ukuran per halaman (Integer, default: 20, max: 100).
  - `sortBy`: Nama kolom (String, snake_case atau camelCase standar).
  - `sortOrder`: Arah pengurutan (`ASC` atau `DESC`, default: `DESC`).
  - `filter[field]`: Filter nilai spesifik (e.g. `?filter[department_id]=uuid&filter[status]=ACTIVE`).
  - `search`: Pencarian teks parsial (e.g. `?search=Jane`).

### 1.6. Idempotency Key Architecture
- Untuk endpoint transaksi penting (`POST /attendances/clock-in`, `POST /leaves/requests`, `POST /payroll/periods/:id/calculate`), client wajib mengirimkan header:
  `X-Idempotency-Key: <UUIDv4>`
- Server menyimpan hasil request di Redis selama 24 jam. Jika request dengan key sama diterima saat operasi masih berjalan, server mengembalikan HTTP 409 `OPERATION_IN_PROGRESS`. Jika sudah selesai, mengembalikan respon yang tersimpan tanpa mengeksekusi ulang.

### 1.7. Concurrency Handling & Optimistic Locking
- Update data transaksional (misal: Alokasi Cuti atau Status Periode Payroll) menyertakan header `If-Match: "<ETag_or_version>"` atau kolom `version`. Jika versi di database sudah berubah, server menolak dengan HTTP 412 `PRECONDITION_FAILED`.

### 1.8. Standard Response Envelopes

#### A. Standard Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2026-09-26T08:35:00.000Z",
    "requestId": "req-018f67e2-45e0-7981"
  }
}
```

#### B. Standard Paginated Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employees fetched successfully",
  "data": [ ... ],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalRecords": 154,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "timestamp": "2026-09-26T08:35:00.000Z",
    "requestId": "req-018f67e2-45e0-7982"
  }
}
```

#### C. Standard Error Response (Zero Leaks of Secrets / Internal Traces)
```json
{
  "success": false,
  "statusCode": 422,
  "errorCode": "VALIDATION_FAILED",
  "message": "Payload input validation failed",
  "errors": [
    {
      "field": "startDate",
      "rule": "isDate",
      "message": "startDate must be a valid ISO 8601 date string"
    }
  ],
  "meta": {
    "timestamp": "2026-09-26T08:35:00.000Z",
    "requestId": "req-018f67e2-45e0-7983"
  }
}
```

---

## 2. SPESIFIKASI RINCI 12 API DOMAINS

---

### DOMAIN 01: AUTH API

#### 1.1. Login Pengguna
- **Method & URL**: `POST /api/v1/auth/login`
- **Authentication**: Public (None)
- **Authorization**: None
- **Rate Limit**: 5 req / 15 menit / IP + Email
- **Request Body**:
  ```json
  {
    "email": "user@company.com",
    "password": "Password123!"
  }
  ```
- **Validation**:
  - `email`: Required, valid email format, max 150 chars.
  - `password`: Required, string, min 10 chars.
- **Success Response** (HTTP 200 - Normal Flow):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "018f67e2-1111-7981-b2c3-4d5e6f7a8b9c",
        "email": "user@company.com",
        "role": "EMPLOYEE",
        "permissions": ["attendance:clock_in", "leave:submit"]
      },
      "accessToken": "eyJhbGciOi...",
      "expiresIn": 900
    },
    "meta": { "timestamp": "...", "requestId": "..." }
  }
  ```
  *(Header Response menyetel Cookie: `refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`)*
- **Success Response** (HTTP 200 - MFA Required Flow):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "MFA verification required",
    "data": {
      "mfaRequired": true,
      "mfaToken": "temp-mfa-token-valid-5-minutes"
    }
  }
  ```
- **Error Responses**:
  - `401 INVALID_CREDENTIALS`: "Email atau password yang Anda masukkan salah."
  - `403 ACCOUNT_LOCKED`: "Akun terkunci sementara karena percobaan login gagal melebihi batas. Coba lagi setelah 15 menit."
  - `403 ACCOUNT_SUSPENDED`: "Akun Anda dinonaktifkan. Silakan hubungi Administrator HR."
- **Audit**: Log event `LOGIN_SUCCESS` atau `LOGIN_FAILED` lengkap dengan IP address & user agent.
- **Event**: None.

#### 1.2. Verifikasi MFA (TOTP)
- **Method & URL**: `POST /api/v1/auth/mfa/verify`
- **Authentication**: Bearer `mfaToken`
- **Request Body**:
  ```json
  {
    "totpCode": "582910"
  }
  ```
- **Validation**: `totpCode`: Required, numeric string, exact 6 digits.
- **Success Response** (HTTP 200): Return `accessToken` + Set Refresh Cookie.
- **Error Responses**: `401 INVALID_MFA_CODE`.

#### 1.3. Refresh Access Token
- **Method & URL**: `POST /api/v1/auth/refresh`
- **Authentication**: Refresh Cookie (`refresh_token`)
- **Success Response** (HTTP 200): Return access token baru + rotasi refresh cookie baru.
- **Error Responses**: `401 INVALID_OR_REVOKED_REFRESH_TOKEN`. Jika terjadi token reuse, seluruh sesi user dibatalkan di Redis.

#### 1.4. Logout
- **Method & URL**: `POST /api/v1/auth/logout`
- **Authentication**: Bearer Access Token
- **Success Response** (HTTP 200): Menghapus cookie refresh token dan memasukkan access token aktif ke Redis blacklist.
- **Audit**: Log `LOGOUT` pada `audit_logs`.

---

### DOMAIN 02: EMPLOYEE API

#### 2.1. Dapatkan Daftar Karyawan (Admin Panel)
- **Method & URL**: `GET /api/v1/employees`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `HR_ADMIN`, `HR_STAFF`, atau permission `employee:read`
- **Query Parameters**:
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 20)
  - `sortBy`: String (`employee_code`, `first_name`, `join_date`, default: `created_at`)
  - `sortOrder`: `ASC` | `DESC`
  - `filter[department_id]`: UUID
  - `filter[employment_status]`: `PERMANENT` | `CONTRACT` | `PROBATION` | `INTERN`
  - `search`: String (Mencocokkan nama, NIK, atau email)
- **Success Response** (HTTP 200):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Employees retrieved successfully",
    "data": [
      {
        "id": "018f67e2-45e0-7981-b2c3-4d5e6f7a8b9c",
        "employeeCode": "EMP-2026-0001",
        "firstName": "Jane",
        "lastName": "Doe",
        "emailWork": "jane.doe@company.com",
        "department": { "id": "uuid", "name": "Engineering" },
        "designation": { "id": "uuid", "title": "Senior Engineer" },
        "employmentStatus": "PERMANENT",
        "joinDate": "2024-01-15"
      }
    ],
    "meta": { "pagination": { "currentPage": 1, "pageSize": 20, "totalRecords": 154, "totalPages": 8 } }
  }
  ```
- **Security Check**: Kolom sensitif (Gaji, NIK KTP, Rekening Bank) **TIDAK DI-RETURN** pada endpoint list ini.
- **Audit**: Log jika query memuat parameter ekspor/massal.

#### 2.2. Dapatkan Detail Karyawan
- **Method & URL**: `GET /api/v1/employees/:id`
- **Authentication**: Bearer Access Token
- **Authorization**: ABAC:
  - Role `SUPER_ADMIN`, `HR_ADMIN`: Full detail.
  - Role `MANAGER`: Hanya jika `employee.manager_id === req.user.employee_id`.
  - Role `EMPLOYEE`: Hanya jika `employee.id === req.user.employee_id`.
- **Path Parameter**: `id`: UUIDv7
- **Success Response** (HTTP 200): Return detail data karyawan. Kolom NIK KTP dan nomor rekening bank dikembalikan dalam bentuk **Masked** (`3171************`), kecuali jika user memiliki permission `employee:view_sensitive`.
- **Error Response**: `403 FORBIDDEN` jika karyawan lain mencoba membuka data rekan kerjanya.
- **Audit**: Jika dibuka dengan permission `employee:view_sensitive`, catat aksi `VIEW_SENSITIVE` pada `audit_logs`.

#### 2.3. Tambah Karyawan Baru
- **Method & URL**: `POST /api/v1/employees`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `HR_ADMIN` (Permission: `employee:create`)
- **Request Body**:
  ```json
  {
    "employeeCode": "EMP-2026-0050",
    "firstName": "Budi",
    "lastName": "Santoso",
    "emailWork": "budi.santoso@company.com",
    "phone": "+628123456789",
    "gender": "MALE",
    "birthDate": "1992-05-14",
    "maritalStatus": "MARRIED",
    "taxPtkpStatus": "K/1",
    "employmentStatus": "CONTRACT",
    "joinDate": "2026-10-01",
    "endDate": "2027-09-30",
    "companyId": "uuid-company",
    "departmentId": "uuid-dept",
    "designationId": "uuid-desig",
    "managerId": "uuid-manager",
    "nationalId": "3171012345670001",
    "taxId": "09.123.456.7-012.000",
    "bankName": "BCA",
    "bankAccountNumber": "1234567890",
    "bankAccountHolder": "Budi Santoso",
    "basicSalary": 12000000
  }
  ```
- **Validation**:
  - `employeeCode`: Required, regex format standar perusahaan.
  - `emailWork`: Required, email format, domain perusahaan.
  - `nationalId`: Required, 16 digit angka.
  - `basicSalary`: Required, numeric, min 0.
- **Success Response** (HTTP 201 Created): Mengembalikan record karyawan baru dan ID user yang dibuat.
- **Error Responses**:
  - `409 CONFLICT`: NIK atau Email sudah terdaftar.
  - `422 VALIDATION_FAILED`: Format input tidak valid.
- **Audit**: Log `CREATE` pada entitas `Employee` dan `User`.
- **Event**: Menerbitkan event `employee.created` via Transactional Outbox (memicu email aktivasi akun).

#### 2.4. Update Profil Mandiri Karyawan (ESS)
- **Method & URL**: `PATCH /api/v1/employees/me/profile`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Request Body**:
  ```json
  {
    "phoneNumber": "+628129876543",
    "currentAddress": "Jl. Mawar No. 12, Jakarta Selatan",
    "emergencyContact": {
      "name": "Siti Rahma",
      "relationship": "SPOUSE",
      "phoneNumber": "+6281200001111"
    }
  }
  ```
- **Validation**: DTO whitelist ketat. Manipulasi field struktural (gaji, jabatan) diabaikan/ditolak.
- **Success Response** (HTTP 200).
- **Audit**: Log `UPDATE` pada entitas `Employee` (Self profile update).

---

### DOMAIN 03: ATTENDANCE API

#### 3.1. Presensi Masuk (Clock-In)
- **Method & URL**: `POST /api/v1/attendances/clock-in`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Header Khusus**: `X-Idempotency-Key: <UUIDv4>` (Mencegah double click)
- **Request Body**:
  ```json
  {
    "latitude": -6.2088,
    "longitude": 106.8456,
    "notes": "Hadir tepat waktu"
  }
  ```
- **Validation**:
  - `latitude`: Required, numeric range -90 s/d 90.
  - `longitude`: Required, numeric range -180 s/d 180.
- **Business Logic**:
  - Menghitung jarak terhadap koordinat kantor yang ditugaskan (Haversine formula).
  - Jika jarak > `geofence_radius_meters`, tolak.
  - Waktu clock-in diambil dari server (`NOW()`).
  - Menentukan status: `PRESENT` atau `LATE` (berdasarkan shift dan grace period).
- **Success Response** (HTTP 200):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Clock-in recorded successfully",
    "data": {
      "attendanceId": "018f67e2-att-1",
      "workDate": "2026-09-26",
      "clockInTime": "2026-09-26T08:55:12.000Z",
      "status": "PRESENT",
      "distanceMeters": 35.4
    }
  }
  ```
- **Error Responses**:
  - `422 OUT_OF_GEOFENCE`: "Anda berada di luar radius kantor yang diizinkan (Jarak: 350 meter)."
  - `409 ALREADY_CLOCKED_IN`: "Anda sudah melakukan presensi masuk untuk hari ini."
- **Audit**: Mencatat koordinat, IP address, dan timestamp server.
- **Event**: Menerbitkan event `attendance.clocked_in`.

#### 3.2. Presensi Pulang (Clock-Out)
- **Method & URL**: `POST /api/v1/attendances/clock-out`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Header Khusus**: `X-Idempotency-Key: <UUIDv4>`
- **Request Body**:
  ```json
  {
    "latitude": -6.2088,
    "longitude": 106.8456
  }
  ```
- **Success Response** (HTTP 200): Memperbarui `clock_out_time` dan menghitung durasi jam kerja harian.
- **Error Response**: `400 CLOCK_IN_NOT_FOUND`: "Anda belum melakukan clock-in hari ini."

#### 3.3. Dapatkan Status Presensi Saya Hari Ini (ESS Widget)
- **Method & URL**: `GET /api/v1/attendances/my-today`
- **Authentication**: Bearer Access Token
- **Success Response** (HTTP 200): Return shift yang berlaku, status clock-in/out hari ini.

#### 3.4. Ajukan Lembur (Overtime Request)
- **Method & URL**: `POST /api/v1/attendances/overtime-requests`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Request Body**:
  ```json
  {
    "overtimeDate": "2026-09-26",
    "startTime": "2026-09-26T18:00:00.000Z",
    "endTime": "2026-09-26T21:00:00.000Z",
    "durationHours": 3.0,
    "reason": "Deploy rilis versi v1.0.0 ke production"
  }
  ```
- **Success Response** (HTTP 201 Created).
- **Event**: Menerbitkan event `overtime.requested` (Memicu notifikasi in-app & email ke Line Manager).

---

### DOMAIN 04: LEAVE API

#### 4.1. Dapatkan Sisa Saldo Cuti Saya
- **Method & URL**: `GET /api/v1/leaves/balances/my`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Query Parameter**: `year`: Integer (default: tahun berjalan)
- **Success Response** (HTTP 200):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "leaveTypeId": "uuid-annual",
        "leaveCode": "ANNUAL",
        "leaveName": "Cuti Tahunan",
        "allocatedDays": 12.0,
        "usedDays": 3.0,
        "pendingDays": 2.0,
        "remainingDays": 7.0
      }
    ]
  }
  ```

#### 4.2. Buat Pengajuan Cuti (Submit Leave)
- **Method & URL**: `POST /api/v1/leaves/requests`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Header Khusus**: `X-Idempotency-Key: <UUIDv4>`
- **Request Body**:
  ```json
  {
    "leaveTypeId": "uuid-annual",
    "startDate": "2026-10-05",
    "endDate": "2026-10-07",
    "totalDays": 3.0,
    "reason": "Liburan keluarga",
    "attachmentUrl": null
  }
  ```
- **Validation**:
  - `startDate`, `endDate`: Valid date string ISO 8601.
  - `endDate >= startDate`.
  - `leaveTypeId`: Valid UUID.
  - `attachmentUrl`: Wajib ada jika `leave_type.requires_attachment === true` (Surat Dokter).
- **Business Logic**:
  - Mengecek saldo: `remainingDays >= totalDays`.
  - Transaksi atomik: Tambahkan record `leave_requests` + Tambahkan `pendingDays` di `leave_balances` + Buat outbox event.
- **Success Response** (HTTP 201 Created).
- **Error Responses**:
  - `422 INSUFFICIENT_LEAVE_BALANCE`: "Sisa kuota cuti tidak mencukupi."
  - `409 OVERLAPPING_LEAVE_DATES`: "Terdapat pengajuan cuti lain di rentang tanggal yang sama."
- **Event**: Menerbitkan `leave.submitted` (Mengirim notifikasi instan ke Manager).

#### 4.3. Setujui Pengajuan Cuti (Manager / HR Approval)
- **Method & URL**: `PATCH /api/v1/leaves/requests/:id/approve`
- **Authentication**: Bearer Access Token
- **Authorization**: ABAC (Hanya Line Manager atau HR Admin berwenang)
- **Path Parameter**: `id`: UUIDv7
- **Request Body**:
  ```json
  {
    "comments": "Disetujui, pekerjaan didelegasikan ke rekan tim."
  }
  ```
- **Concurrency Protection**: Menggunakan `SELECT ... FOR UPDATE` pada row `leave_balances` untuk mencegah race condition.
- **Success Response** (HTTP 200): Mengubah status menjadi `APPROVED`, memotong saldo resmi (`usedDays = usedDays + X`, `pendingDays = pendingDays - X`).
- **Audit**: Catat approval di `leave_approvals` dan `audit_logs`.
- **Event**: Menerbitkan `leave.approved` (Memperbarui status kalender absensi dan notifikasi ke Karyawan).

#### 4.4. Tolak Pengajuan Cuti (Reject Leave)
- **Method & URL**: `PATCH /api/v1/leaves/requests/:id/reject`
- **Authentication**: Bearer Access Token
- **Request Body**:
  ```json
  {
    "reason": "Mohon ditunda karena jadwal peluncuran produk kritis."
  }
  ```
- **Validation**: `reason`: Required, min 10 karakter.
- **Success Response** (HTTP 200): Status menjadi `REJECTED`, saldo pending dikembalikan utuh ke saldo aktif.
- **Event**: Menerbitkan `leave.rejected`.

---

### DOMAIN 05: PAYROLL API

#### 5.1. Dapatkan Daftar Periode Payroll
- **Method & URL**: `GET /api/v1/payroll/periods`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `HR_ADMIN`, `HR_STAFF` (Permission: `payroll:read`)
- **Success Response** (HTTP 200): Daftar periode payroll, status (`DRAFT`, `LOCKED`, dll), dan total disbursement.

#### 5.2. Eksekusi Kalkulasi Payroll Batch (Background Job)
- **Method & URL**: `POST /api/v1/payroll/periods/:id/calculate`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `HR_ADMIN` (Permission: `payroll:run`)
- **Header Khusus**: `X-Idempotency-Key: <UUIDv4>`
- **Path Parameter**: `id`: UUIDv7 Periode Payroll
- **Business Logic**:
  - Mengecek status periode: Hanya boleh dieksekusi jika status `DRAFT` atau `CALCULATED`. Dilarang jika status `LOCKED`.
  - Memicu background worker BullMQ untuk menghitung ribuan karyawan secara asinkron.
- **Success Response** (HTTP 202 Accepted):
  ```json
  {
    "success": true,
    "statusCode": 202,
    "message": "Payroll calculation job queued successfully",
    "data": {
      "periodId": "uuid-period",
      "jobId": "bullmq-job-9821"
    }
  }
  ```
- **Audit**: Log aksi `CALCULATE_PAYROLL_BATCH`.
- **Event**: Menerbitkan `payroll.calculation_started`.

#### 5.3. Kunci Periode Penggajian (Lock Payroll Period)
- **Method & URL**: `POST /api/v1/payroll/periods/:id/lock`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `HR_ADMIN` (Permission: `payroll:lock`)
- **Success Response** (HTTP 200): Periode berubah menjadi `LOCKED`. Seluruh record gaji menjadi *immutable*. Mutasi absensi dan cuti pada rentang tanggal tersebut terkunci otomatis.
- **Audit**: Log `LOCK_PAYROLL` dengan identitas user dan ringkasan finansial.

#### 5.4. Terbitkan Slip Gaji (Publish Payslips)
- **Method & URL**: `POST /api/v1/payroll/periods/:id/publish`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `HR_ADMIN` (Permission: `payroll:publish`)
- **Success Response** (HTTP 200): Status slip gaji berubah menjadi `PUBLISHED`.
- **Event**: Menerbitkan `payroll.published` (Memicu broadcast notifikasi in-app dan email ke seluruh karyawan penerima gaji).

#### 5.5. Dapatkan Slip Gaji Saya (ESS)
- **Method & URL**: `GET /api/v1/payroll/my-payslips`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Query Parameter**: `year`: Integer
- **Success Response** (HTTP 200): Daftar slip gaji bulanan milik user login.
- **Security Check**: Karyawan **TIDAK BISA** melihat slip gaji karyawan lain.

#### 5.6. Unduh PDF Slip Gaji (Secure Signed URL)
- **Method & URL**: `GET /api/v1/payroll/my-payslips/:recordId/download`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Path Parameter**: `recordId`: UUIDv7
- **Success Response** (HTTP 200):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "downloadUrl": "https://storage.company.com/payslips/xyz.pdf?token=temporary-signed-token",
      "expiresInSeconds": 300
    }
  }
  ```
- **Audit**: Log `DOWNLOAD_PAYSLIP`.

#### 5.7. Ekspor File Batch Transfer Bank (BCA / Mandiri)
- **Method & URL**: `GET /api/v1/payroll/periods/:id/export-bank`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `HR_ADMIN` (Permission: `payroll:export_bank`)
- **Query Parameter**: `format`: `BCA_AUTOPAY` | `MANDIRI_MCM`
- **Success Response** (HTTP 200): Mengembalikan file CSV/TXT format perbankan siap upload ke internet banking bisnis.
- **Audit**: Log `EXPORT_BANK_TRANSFER_FILE`.

---

### DOMAIN 06: PERFORMANCE API

#### 6.1. Dapatkan Sasaran KPI Saya (ESS)
- **Method & URL**: `GET /api/v1/performance/my-kpis`
- **Authentication**: Bearer Access Token
- **Query Parameter**: `cycleId`: UUID
- **Success Response** (HTTP 200): Rincian KPI individu, target bobot, dan capaian.

#### 6.2. Submit Evaluasi Mandiri (Self-Assessment)
- **Method & URL**: `POST /api/v1/performance/my-kpis/submit-self-review`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Request Body**:
  ```json
  {
    "cycleId": "uuid-cycle",
    "ratings": [
      { "kpiId": "uuid-kpi-1", "selfRating": 4.5, "actualResult": "Capai 120% target penjualan" }
    ]
  }
  ```
- **Success Response** (HTTP 200).
- **Event**: Menerbitkan `performance.self_review_submitted` (Memberitahu Line Manager).

#### 6.3. Submit Review Atasan (Manager Review)
- **Method & URL**: `POST /api/v1/performance/reviews/:employeeId/submit-manager-review`
- **Authentication**: Bearer Access Token (Role: `MANAGER`, `HR_ADMIN`)
- **Request Body**:
  ```json
  {
    "cycleId": "uuid-cycle",
    "managerRatings": [
      { "kpiId": "uuid-kpi-1", "managerRating": 4.0 }
    ],
    "strengths": "Inisiatif tinggi dan komunikasi prima.",
    "improvements": "Perlu peningkatan manajemen waktu tugas ganda."
  }
  ```
- **Success Response** (HTTP 200).

---

### DOMAIN 07: RECRUITMENT API

#### 7.1. Buat Lowongan Pekerjaan Baru
- **Method & URL**: `POST /api/v1/recruitment/jobs`
- **Authentication**: Bearer Access Token
- **Authorization**: `HR_ADMIN` (Permission: `recruitment:manage`)
- **Request Body**:
  ```json
  {
    "companyId": "uuid",
    "departmentId": "uuid",
    "designationId": "uuid",
    "title": "Backend Software Engineer",
    "description": "Bertanggung jawab merancang arsitektur API...",
    "requirements": "Minimal 3 tahun pengalaman TypeScript...",
    "headcountNeeded": 2
  }
  ```
- **Success Response** (HTTP 201 Created).

#### 7.2. Konversi Pelamar Menjadi Karyawan (Hired to Employee)
- **Method & URL**: `POST /api/v1/recruitment/applications/:id/convert-to-employee`
- **Authentication**: Bearer Access Token
- **Authorization**: `HR_ADMIN` (Permission: `recruitment:convert`)
- **Request Body**:
  ```json
  {
    "employeeCode": "EMP-2026-0089",
    "joinDate": "2026-11-01",
    "basicSalary": 15000000,
    "employmentStatus": "CONTRACT"
  }
  ```
- **Business Logic**:
  - Mengambil data nama, email, no HP dari tabel `candidates`.
  - Membuat record baru di tabel `employees` dan akun di tabel `users`.
  - Mengubah status aplikasi di pipeline menjadi `HIRED`.
- **Success Response** (HTTP 201 Created).
- **Audit**: Log `CONVERT_CANDIDATE_TO_EMPLOYEE`.

---

### DOMAIN 08: BENEFIT API

#### 8.1. Dapatkan Sisa Pagu Manfaat Karyawan
- **Method & URL**: `GET /api/v1/benefits/allocations/my`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Success Response** (HTTP 200): Daftar plafon manfaat medis/kacamata, nominal terpakai, dan sisa pagu tahunan.

#### 8.2. Ajukan Klaim Reimbursement
- **Method & URL**: `POST /api/v1/benefits/claims`
- **Authentication**: Bearer Access Token (Role: `EMPLOYEE`)
- **Header Khusus**: `X-Idempotency-Key: <UUIDv4>`
- **Request Body**:
  ```json
  {
    "benefitPlanId": "uuid-medical",
    "claimDate": "2026-09-25",
    "totalAmount": 750000,
    "items": [
      {
        "invoiceDate": "2026-09-24",
        "invoiceNumber": "INV-KLINIK-9821",
        "description": "Pemeriksaan Dokter Umum & Resep Obat",
        "amount": 750000,
        "receiptUrl": "https://storage.company.com/receipts/rec-9821.jpg"
      }
    ]
  }
  ```
- **Validation**:
  - `totalAmount <= remainingAllocation`.
  - Tanggal kuitansi maksimal 30 hari yang lalu.
- **Success Response** (HTTP 201 Created).
- **Event**: Menerbitkan `reimbursement.submitted`.

#### 8.3. Verifikasi & Setujui Klaim (HR / Finance)
- **Method & URL**: `PATCH /api/v1/benefits/claims/:id/approve`
- **Authentication**: Bearer Access Token
- **Authorization**: `HR_ADMIN`, `FINANCE` (Permission: `benefit:approve`)
- **Request Body**:
  ```json
  {
    "disbursementMethod": "PAYROLL",
    "payrollPeriodId": "uuid-next-payroll"
  }
  ```
- **Success Response** (HTTP 200).

---

### DOMAIN 09: CAREER API

#### 9.1. Dapatkan Riwayat Karir Karyawan
- **Method & URL**: `GET /api/v1/career/histories/:employeeId`
- **Authentication**: Bearer Access Token
- **Authorization**: ABAC (Admin, Manager dari bawahan terkait, atau Karyawan bersangkutan).
- **Success Response** (HTTP 200): Daftar promosi, demosi, mutasi, dan surat keputusan.

#### 9.2. Terbitkan Surat Keputusan Mutasi/Promosi
- **Method & URL**: `POST /api/v1/career/mutations`
- **Authentication**: Bearer Access Token
- **Authorization**: `HR_ADMIN` (Permission: `career:mutate`)
- **Request Body**:
  ```json
  {
    "employeeId": "uuid-emp",
    "eventType": "PROMOTION",
    "referenceLetterNumber": "SK/HRD/2026/089",
    "effectiveDate": "2026-10-01",
    "newDepartmentId": "uuid-new-dept",
    "newDesignationId": "uuid-new-desig",
    "newManagerId": "uuid-new-mgr",
    "notes": "Promosi menjadi Team Lead Engineering"
  }
  ```
- **Success Response** (HTTP 201 Created).
- **Audit**: Log `MUTATE_EMPLOYEE_CAREER`.

---

### DOMAIN 10: NOTIFICATION API

#### 10.1. Dapatkan Daftar Notifikasi Saya
- **Method & URL**: `GET /api/v1/notifications`
- **Authentication**: Bearer Access Token
- **Query Parameters**:
  - `unreadOnly`: Boolean (default: false)
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 20)
- **Success Response** (HTTP 200): Daftar notifikasi, judul, pesan, payload link, dan status baca.

#### 10.2. Dapatkan Jumlah Notifikasi Belum Dibaca (Badge Count)
- **Method & URL**: `GET /api/v1/notifications/unread-count`
- **Authentication**: Bearer Access Token
- **Success Response** (HTTP 200):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": { "unreadCount": 4 }
  }
  ```

#### 10.3. Tandai Notifikasi Dibaca
- **Method & URL**: `PATCH /api/v1/notifications/:id/read`
- **Authentication**: Bearer Access Token
- **Success Response** (HTTP 200).

#### 10.4. Tandai Semua Notifikasi Dibaca
- **Method & URL**: `PATCH /api/v1/notifications/read-all`
- **Authentication**: Bearer Access Token
- **Success Response** (HTTP 200).

---

### DOMAIN 11: REPORT API

#### 11.1. Ekspor Rekap Kehadiran Bulanan (Excel)
- **Method & URL**: `GET /api/v1/reports/attendance/monthly-summary`
- **Authentication**: Bearer Access Token
- **Authorization**: `HR_ADMIN`, `HR_STAFF` (Permission: `report:attendance`)
- **Query Parameters**:
  - `month`: Integer (1 - 12)
  - `year`: Integer (e.g. 2026)
  - `departmentId`: UUID (Opsional)
  - `format`: `XLSX` | `CSV`
- **Success Response** (HTTP 200): Binary File Stream (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
- **Audit**: Log `EXPORT_ATTENDANCE_REPORT`.

#### 11.2. Ekspor Laporan Pajak PPh 21 (Format 1721-A1)
- **Method & URL**: `GET /api/v1/reports/payroll/pph21-annual`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `HR_ADMIN` (Permission: `report:tax`)
- **Query Parameters**: `year`: Integer
- **Success Response** (HTTP 200): File PDF/Excel formulir pajak resmi.
- **Audit**: Log `EXPORT_TAX_REPORT`.

---

### DOMAIN 12: ADMIN API

#### 12.1. Manajemen Peran & Hak Akses (RBAC Admin)
- **Method & URL**: `GET /api/v1/admin/roles`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`
- **Success Response** (HTTP 200): Daftar role dan mapping permission.

- **Method & URL**: `PUT /api/v1/admin/roles/:id/permissions`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`
- **Request Body**:
  ```json
  {
    "permissionIds": ["uuid-perm-1", "uuid-perm-2"]
  }
  ```
- **Success Response** (HTTP 200).
- **Audit**: Log `UPDATE_ROLE_PERMISSIONS`.

#### 12.2. Audit Trail Inspector (Forensik Log)
- **Method & URL**: `GET /api/v1/admin/audit-logs`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`, `COMPLIANCE_AUDITOR`
- **Query Parameters**:
  - `userId`: UUID
  - `entityType`: `Employee` | `PayrollRecord` | `LeaveRequest`
  - `action`: `CREATE` | `UPDATE` | `DELETE` | `VIEW_SENSITIVE`
  - `startDate`, `endDate`: ISO Date
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 50)
- **Success Response** (HTTP 200):
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": "uuid-log",
        "userId": "uuid-user",
        "action": "UPDATE",
        "entityType": "Employee",
        "entityId": "uuid-emp",
        "ipAddress": "180.252.12.4",
        "oldValues": { "bankAccountNumber": "********1111" },
        "newValues": { "bankAccountNumber": "********2222" },
        "createdAt": "2026-09-26T08:12:00.000Z"
      }
    ]
  }
  ```

#### 12.3. Pengaturan Parameter Sistem (System Settings)
- **Method & URL**: `GET /api/v1/admin/settings` & `PATCH /api/v1/admin/settings/:key`
- **Authentication**: Bearer Access Token
- **Authorization**: `SUPER_ADMIN`
- **Request Body** (Patch):
  ```json
  {
    "settingValue": "150"
  }
  ```
- **Success Response** (HTTP 200).
- **Audit**: Log `UPDATE_SYSTEM_SETTING`.
