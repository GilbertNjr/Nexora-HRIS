# ENTERPRISE DATABASE ARCHITECTURE SPECIFICATION
## Human Resource Information System (HRIS) Berbasis Web
**Role:** Senior Database Architect  
**Version:** 2.0.0-Production-Ready  
**Engine:** PostgreSQL 16+ (ACID Compliant)  
**Encoding:** UTF-8 | Collation: `en_US.UTF-8`  
**Primary Key Convention:** UUIDv7 (Time-Ordered 128-bit UUID) untuk skalabilitas, keamanan, dan indeks B-Tree yang efisien tanpa fragmentasi.  
**Audit Standard:** Setiap tabel operasional wajib memiliki `created_at`, `updated_at`, dan opsi `deleted_at` untuk soft-delete.  

---

## 1. ERD (ENTITY RELATIONSHIP DIAGRAM) DESCRIPTION & DOMAIN BOUNDARIES

Database dirancang dengan prinsip **High Normalization (3NF)** untuk menghindari data redundan, dengan pengecualian *Intentional Snapshotting* pada transaksi masa lampau (Payroll & Attendance) demi menjaga integritas data historis (*Historical Immutability*).

### Ringkasan Domain & Entitas:
```
+---------------------------------------------------------------------------------------------------+
|                                  DATABASE DOMAIN TOPOLOGY                                         |
+---------------------------------------------------------------------------------------------------+
|  [AUTH & USER]               [ROLE & PERMISSION]            [ORGANIZATION]                        |
|  - users                     - roles                        - companies                           |
|  - user_sessions             - permissions                  - departments                         |
|  - user_mfa_settings         - role_permissions             - designations (job titles)           |
|                              - user_roles                   - job_grades                          |
+---------------------------------------------------------------------------------------------------+
|  [EMPLOYEE CORE]             [CAREER & TRAINING]            [ATTENDANCE]                          |
|  - employees                 - career_histories             - work_shifts                         |
|  - employee_identities (PII) - training_programs            - employee_schedules                  |
|  - employee_bank_accounts    - employee_trainings           - attendances (with dept snapshot)    |
|  - emergency_contacts        - employee_certifications      - attendance_corrections              |
|                                                             - overtime_requests                   |
+---------------------------------------------------------------------------------------------------+
|  [LEAVE & PERMISSION]        [PAYROLL (HISTORICAL)]         [BENEFIT & CLAIMS]                    |
|  - leave_types               - employee_salary_structures   - benefit_plans                       |
|  - leave_balances            - payroll_periods              - employee_benefit_allocations        |
|  - leave_requests            - payroll_records (Snapshot)   - reimbursement_claims                |
|  - leave_approvals           - payroll_items                - reimbursement_claim_items           |
|                              - bank_transfer_batches                                              |
+---------------------------------------------------------------------------------------------------+
|  [PERFORMANCE]               [RECRUITMENT (ATS)]            [DOCUMENTS & POLICIES]                |
|  - appraisal_cycles          - job_postings                 - document_categories                 |
|  - kpi_templates             - candidates                   - company_policies                    |
|  - employee_kpis             - job_applications             - policy_acknowledgments              |
|  - appraisal_reviews         - interview_schedules          - employee_documents                  |
+---------------------------------------------------------------------------------------------------+
|  [NOTIFICATION]              [AUDIT & COMPLIANCE]           [SYSTEM SETTINGS & OUTBOX]            |
|  - notifications             - audit_logs (Append-Only)     - system_settings                     |
|  - notification_preferences                                 - public_holidays                     |
|                                                             - transactional_outbox (Event Broker) |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. PRODUCTION-READY TABLE SPECIFICATION

---

### DOMAIN 1: AUTH & USER

#### 1.1. Table: `users`
- **Purpose**: Menyimpan akun pengguna untuk otentikasi login ke Admin atau ESS Portal.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `email` (VARCHAR(150), NOT NULL, Unique)
  - `password_hash` (VARCHAR(255), NOT NULL) - Hash Argon2id
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'ACTIVE') - `ACTIVE`, `SUSPENDED`, `INACTIVE`
  - `failed_login_attempts` (INT, NOT NULL, DEFAULT 0)
  - `locked_until` (TIMESTAMPTZ, NULL)
  - `last_login_at` (TIMESTAMPTZ, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `deleted_at` (TIMESTAMPTZ, NULL)
- **Constraints**:
  - PK: `pk_users` (`id`)
  - UQ: `uq_users_email` (`email`) WHERE `deleted_at IS NULL`
- **Indexes**:
  - `idx_users_email` ON `users(email)`
  - `idx_users_status` ON `users(status)`
- **Soft Delete**: Ya (`deleted_at`).
- **Audit**: Ya, dicatat di `audit_logs`.

#### 1.2. Table: `user_sessions`
- **Purpose**: Menyimpan riwayat refresh token aktif untuk rotasi token dan deteksi penyalahgunaan sesi.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `user_id` (UUID, NOT NULL, FK -> `users(id)` ON DELETE CASCADE)
  - `refresh_token_hash` (VARCHAR(255), NOT NULL, Unique)
  - `user_agent` (VARCHAR(255), NULL)
  - `ip_address` (VARCHAR(45), NOT NULL)
  - `is_revoked` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `expires_at` (TIMESTAMPTZ, NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_user_sessions` (`id`)
  - FK: `fk_user_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users(id)` ON DELETE CASCADE
  - UQ: `uq_user_sessions_token` (`refresh_token_hash`)
- **Indexes**:
  - `idx_user_sessions_lookup` ON `user_sessions(user_id, is_revoked, expires_at)`
- **Soft Delete**: Tidak (Sesi yang kedaluwarsa dibersihkan via retention cron).
- **Audit**: Ya.

#### 1.3. Table: `user_mfa_settings`
- **Purpose**: Menyimpan konfigurasi Multi-Factor Authentication (TOTP).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `user_id` (UUID, NOT NULL, Unique, FK -> `users(id)` ON DELETE CASCADE)
  - `secret_encrypted` (VARCHAR(255), NOT NULL) - Enkripsi AES-256
  - `is_enabled` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `backup_codes_hash` (JSONB, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_user_mfa` (`id`)
  - FK: `fk_user_mfa_user_id` FOREIGN KEY (`user_id`) REFERENCES `users(id)` ON DELETE CASCADE
  - UQ: `uq_user_mfa_user_id` (`user_id`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 2: ROLE & PERMISSION

#### 2.1. Table: `roles`
- **Purpose**: Definisi peran sistem (Super Admin, HR Admin, HR Staff, Manager, Employee).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `name` (VARCHAR(50), NOT NULL, Unique) - e.g. `SUPER_ADMIN`, `HR_ADMIN`, `MANAGER`, `EMPLOYEE`
  - `display_name` (VARCHAR(100), NOT NULL)
  - `description` (TEXT, NULL)
  - `is_system` (BOOLEAN, NOT NULL, DEFAULT FALSE) - Mencegah peran bawaan dihapus
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_roles` (`id`)
  - UQ: `uq_roles_name` (`name`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 2.2. Table: `permissions`
- **Purpose**: Granular permission actions (format: `module:action`).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `name` (VARCHAR(100), NOT NULL, Unique) - e.g. `payroll:run`, `leave:approve`, `employee:view_sensitive`
  - `module` (VARCHAR(50), NOT NULL)
  - `description` (VARCHAR(255), NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_permissions` (`id`)
  - UQ: `uq_permissions_name` (`name`)
- **Indexes**:
  - `idx_permissions_module` ON `permissions(module)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 2.3. Table: `role_permissions`
- **Purpose**: Junction table relasi many-to-many peran dan hak akses.
- **Columns**:
  - `role_id` (UUID, NOT NULL, FK -> `roles(id)` ON DELETE CASCADE)
  - `permission_id` (UUID, NOT NULL, FK -> `permissions(id)` ON DELETE CASCADE)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_role_permissions` (`role_id`, `permission_id`)
  - FK: `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles(id)` ON DELETE CASCADE
  - FK: `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions(id)` ON DELETE CASCADE
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 2.4. Table: `user_roles`
- **Purpose**: Asosiasi user ke role (Mendukung multi-role jika diperlukan di masa depan).
- **Columns**:
  - `user_id` (UUID, NOT NULL, FK -> `users(id)` ON DELETE CASCADE)
  - `role_id` (UUID, NOT NULL, FK -> `roles(id)` ON DELETE RESTRICT)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_user_roles` (`user_id`, `role_id`)
  - FK: `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users(id)` ON DELETE CASCADE
  - FK: `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles(id)` ON DELETE RESTRICT
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 3: ORGANIZATION

#### 3.1. Table: `companies`
- **Purpose**: Entitas legal perusahaan atau cabang (Mendukung multi-company / multi-branch).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `code` (VARCHAR(20), NOT NULL, Unique)
  - `name` (VARCHAR(150), NOT NULL)
  - `tax_id` (VARCHAR(50), NULL) - NPWP Perusahaan
  - `address` (TEXT, NULL)
  - `latitude` (NUMERIC(10, 7), NULL) - Titik pusat kantor untuk geofence default
  - `longitude` (NUMERIC(10, 7), NULL)
  - `geofence_radius_meters` (INT, NOT NULL, DEFAULT 100)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `deleted_at` (TIMESTAMPTZ, NULL)
- **Constraints**:
  - PK: `pk_companies` (`id`)
  - UQ: `uq_companies_code` (`code`)
- **Soft Delete**: Ya.
- **Audit**: Ya.

#### 3.2. Table: `departments`
- **Purpose**: Struktur departemen/divisi dengan hierarki bersarang (*Self-referencing tree*).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `parent_id` (UUID, NULL, FK -> `departments(id)` ON DELETE SET NULL)
  - `code` (VARCHAR(20), NOT NULL)
  - `name` (VARCHAR(100), NOT NULL)
  - `manager_employee_id` (UUID, NULL) - Di-link ke employees(id) setelah tabel employee ada
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `deleted_at` (TIMESTAMPTZ, NULL)
- **Constraints**:
  - PK: `pk_departments` (`id`)
  - FK: `fk_dept_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
  - FK: `fk_dept_parent` FOREIGN KEY (`parent_id`) REFERENCES `departments(id)` ON DELETE SET NULL
  - UQ: `uq_dept_company_code` (`company_id`, `code`) WHERE `deleted_at IS NULL`
- **Indexes**:
  - `idx_departments_parent` ON `departments(parent_id)`
- **Soft Delete**: Ya.
- **Audit**: Ya.

#### 3.3. Table: `job_grades`
- **Purpose**: Standardisasi level karir dan rentang kompensasi (e.g. G1-G6, M1-M3).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `code` (VARCHAR(20), NOT NULL, Unique)
  - `name` (VARCHAR(50), NOT NULL)
  - `level_rank` (INT, NOT NULL) - Untuk perbandingan hierarki numerik
  - `min_salary` (DECIMAL(14,2), NULL)
  - `max_salary` (DECIMAL(14,2), NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_job_grades` (`id`)
  - UQ: `uq_job_grades_code` (`code`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 3.4. Table: `designations` (Job Titles)
- **Purpose**: Posisi atau jabatan kerja karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `department_id` (UUID, NOT NULL, FK -> `departments(id)` ON DELETE RESTRICT)
  - `job_grade_id` (UUID, NOT NULL, FK -> `job_grades(id)` ON DELETE RESTRICT)
  - `title` (VARCHAR(100), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `deleted_at` (TIMESTAMPTZ, NULL)
- **Constraints**:
  - PK: `pk_designations` (`id`)
  - FK: `fk_desig_dept` FOREIGN KEY (`department_id`) REFERENCES `departments(id)` ON DELETE RESTRICT
  - FK: `fk_desig_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `job_grades(id)` ON DELETE RESTRICT
- **Soft Delete**: Ya.
- **Audit**: Ya.

---

### DOMAIN 4: EMPLOYEE CORE

#### 4.1. Table: `employees`
- **Purpose**: Data induk operasional karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `user_id` (UUID, NOT NULL, Unique, FK -> `users(id)` ON DELETE RESTRICT)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `department_id` (UUID, NOT NULL, FK -> `departments(id)` ON DELETE RESTRICT)
  - `designation_id` (UUID, NOT NULL, FK -> `designations(id)` ON DELETE RESTRICT)
  - `manager_id` (UUID, NULL, FK -> `employees(id)` ON DELETE SET NULL) - Report-to Hierarchy
  - `employee_code` (VARCHAR(50), NOT NULL, Unique) - NIK Karyawan
  - `first_name` (VARCHAR(100), NOT NULL)
  - `last_name` (VARCHAR(100), NULL)
  - `email_work` (VARCHAR(150), NOT NULL, Unique)
  - `phone_number` (VARCHAR(30), NULL)
  - `gender` (VARCHAR(10), NOT NULL) - `MALE`, `FEMALE`
  - `birth_date` (DATE, NOT NULL)
  - `marital_status` (VARCHAR(20), NOT NULL) - `SINGLE`, `MARRIED`, `DIVORCED`
  - `tax_ptkp_status` (VARCHAR(10), NOT NULL, DEFAULT 'TK/0') - e.g. `TK/0`, `K/1`, `K/2` untuk tarif TER PPh 21
  - `employment_status` (VARCHAR(20), NOT NULL, DEFAULT 'PROBATION') - `PERMANENT`, `CONTRACT`, `PROBATION`, `INTERN`
  - `join_date` (DATE, NOT NULL)
  - `end_date` (DATE, NULL) - Tanggal akhir kontrak jika status CONTRACT/PROBATION
  - `current_address` (TEXT, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `deleted_at` (TIMESTAMPTZ, NULL)
- **Constraints**:
  - PK: `pk_employees` (`id`)
  - UQ: `uq_emp_user_id` (`user_id`)
  - UQ: `uq_emp_code` (`employee_code`) WHERE `deleted_at IS NULL`
  - UQ: `uq_emp_email_work` (`email_work`) WHERE `deleted_at IS NULL`
  - FK: `fk_emp_user` FOREIGN KEY (`user_id`) REFERENCES `users(id)` ON DELETE RESTRICT
  - FK: `fk_emp_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
  - FK: `fk_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `departments(id)` ON DELETE RESTRICT
  - FK: `fk_emp_desig` FOREIGN KEY (`designation_id`) REFERENCES `designations(id)` ON DELETE RESTRICT
  - FK: `fk_emp_manager` FOREIGN KEY (`manager_id`) REFERENCES `employees(id)` ON DELETE SET NULL
- **Indexes**:
  - `idx_employees_dept` ON `employees(department_id)`
  - `idx_employees_manager` ON `employees(manager_id)`
  - `idx_employees_status` ON `employees(employment_status)`
  - `idx_employees_join_date` ON `employees(join_date)`
- **Soft Delete**: Ya (`deleted_at`).
- **Audit**: Ya (Setiap perubahan wajib tercatat di `audit_logs`).

#### 4.2. Table: `employee_identities` (PII Data - Strictly Encrypted)
- **Purpose**: Menyimpan nomor identitas negara terenkripsi (KTP, NPWP, BPJS).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, Unique, FK -> `employees(id)` ON DELETE CASCADE)
  - `national_id_encrypted` (VARCHAR(255), NOT NULL) - NIK KTP (AES-256-GCM)
  - `national_id_masked` (VARCHAR(30), NOT NULL) - e.g. `3171************`
  - `tax_id_encrypted` (VARCHAR(255), NULL) - NPWP (AES-256-GCM)
  - `tax_id_masked` (VARCHAR(30), NULL)
  - `bpjs_tk_number_encrypted` (VARCHAR(255), NULL)
  - `bpjs_kes_number_encrypted` (VARCHAR(255), NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_employee_identities` (`id`)
  - FK: `fk_ident_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - UQ: `uq_ident_employee_id` (`employee_id`)
- **Soft Delete**: Tidak.
- **Audit**: Ya (Akses baca `VIEW_SENSITIVE` dicatat ke audit log).

#### 4.3. Table: `employee_bank_accounts` (Financial PII)
- **Purpose**: Data rekening bank karyawan untuk pencairan gaji.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `bank_name` (VARCHAR(50), NOT NULL) - e.g. `BCA`, `MANDIRI`, `BRI`
  - `bank_branch` (VARCHAR(100), NULL)
  - `account_number_encrypted` (VARCHAR(255), NOT NULL) - AES-256-GCM
  - `account_number_masked` (VARCHAR(30), NOT NULL) - e.g. `********1234`
  - `account_holder_name` (VARCHAR(150), NOT NULL)
  - `is_primary` (BOOLEAN, NOT NULL, DEFAULT TRUE)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_employee_bank` (`id`)
  - FK: `fk_bank_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
- **Indexes**:
  - `idx_emp_bank_lookup` ON `employee_bank_accounts(employee_id, is_primary)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 4.4. Table: `emergency_contacts`
- **Purpose**: Kontak darurat karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `name` (VARCHAR(100), NOT NULL)
  - `relationship` (VARCHAR(50), NOT NULL) - `SPOUSE`, `PARENT`, `SIBLING`, `CHILD`
  - `phone_number` (VARCHAR(30), NOT NULL)
  - `address` (TEXT, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_emergency_contacts` (`id`)
  - FK: `fk_contact_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 5: ATTENDANCE

#### 5.1. Table: `work_shifts`
- **Purpose**: Definisi jam kerja dan shift.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `name` (VARCHAR(50), NOT NULL) - e.g. `Regular (09:00 - 18:00)`
  - `start_time` (TIME, NOT NULL)
  - `end_time` (TIME, NOT NULL)
  - `grace_period_minutes` (INT, NOT NULL, DEFAULT 15)
  - `is_overnight` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_work_shifts` (`id`)
  - FK: `fk_shifts_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 5.2. Table: `employee_schedules`
- **Purpose**: Penugasan shift harian karyawan (Roster Jadwal).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `work_shift_id` (UUID, NOT NULL, FK -> `work_shifts(id)` ON DELETE RESTRICT)
  - `schedule_date` (DATE, NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_emp_schedules` (`id`)
  - FK: `fk_sched_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_sched_shift` FOREIGN KEY (`work_shift_id`) REFERENCES `work_shifts(id)` ON DELETE RESTRICT
  - UQ: `uq_emp_schedule_date` (`employee_id`, `schedule_date`)
- **Indexes**:
  - `idx_schedules_date` ON `employee_schedules(schedule_date)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 5.3. Table: `attendances` (Presensi dengan Department Historical Snapshot)
- **Purpose**: Rekap log kehadiran kerja harian karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE RESTRICT)
  - `department_id_snapshot` (UUID, NOT NULL, FK -> `departments(id)` ON DELETE RESTRICT) - Menjaga histori jika karyawan mutasi departemen di kemudian hari!
  - `work_shift_id` (UUID, NULL, FK -> `work_shifts(id)` ON DELETE SET NULL)
  - `work_date` (DATE, NOT NULL)
  - `clock_in_time` (TIMESTAMPTZ, NULL)
  - `clock_out_time` (TIMESTAMPTZ, NULL)
  - `clock_in_lat` (NUMERIC(10, 7), NULL)
  - `clock_in_lng` (NUMERIC(10, 7), NULL)
  - `clock_out_lat` (NUMERIC(10, 7), NULL)
  - `clock_out_lng` (NUMERIC(10, 7), NULL)
  - `clock_in_ip` (VARCHAR(45), NULL)
  - `clock_out_ip` (VARCHAR(45), NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'PRESENT') - `PRESENT`, `LATE`, `HALF_DAY`, `ABSENT`, `ON_LEAVE`, `HOLIDAY`
  - `late_minutes` (INT, NOT NULL, DEFAULT 0)
  - `early_leave_minutes` (INT, NOT NULL, DEFAULT 0)
  - `overtime_minutes` (INT, NOT NULL, DEFAULT 0)
  - `notes` (TEXT, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_attendances` (`id`)
  - FK: `fk_att_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE RESTRICT
  - FK: `fk_att_dept_snap` FOREIGN KEY (`department_id_snapshot`) REFERENCES `departments(id)` ON DELETE RESTRICT
  - FK: `fk_att_shift` FOREIGN KEY (`work_shift_id`) REFERENCES `work_shifts(id)` ON DELETE SET NULL
  - UQ: `uq_att_emp_date` (`employee_id`, `work_date`)
- **Indexes**:
  - `idx_attendances_emp_date` ON `attendances(employee_id, work_date)`
  - `idx_attendances_date_status` ON `attendances(work_date, status)`
  - `idx_attendances_dept_snap` ON `attendances(department_id_snapshot, work_date)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 5.4. Table: `overtime_requests`
- **Purpose**: Pengajuan lembur mandiri.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `approver_id` (UUID, NULL, FK -> `employees(id)` ON DELETE SET NULL)
  - `overtime_date` (DATE, NOT NULL)
  - `start_time` (TIMESTAMPTZ, NOT NULL)
  - `end_time` (TIMESTAMPTZ, NOT NULL)
  - `duration_hours` (DECIMAL(4,2), NOT NULL)
  - `reason` (TEXT, NOT NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'PENDING') - `PENDING`, `APPROVED`, `REJECTED`
  - `action_at` (TIMESTAMPTZ, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_overtime_requests` (`id`)
  - FK: `fk_ot_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_ot_approver` FOREIGN KEY (`approver_id`) REFERENCES `employees(id)` ON DELETE SET NULL
- **Indexes**:
  - `idx_ot_emp_status` ON `overtime_requests(employee_id, status)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 6: LEAVE & PERMISSION

#### 6.1. Table: `leave_types`
- **Purpose**: Definisi master jenis cuti dan izin.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `code` (VARCHAR(20), NOT NULL) - e.g. `ANNUAL`, `SICK`, `MATERNITY`, `UNPAID`
  - `name` (VARCHAR(100), NOT NULL)
  - `default_quota` (INT, NOT NULL, DEFAULT 12)
  - `requires_attachment` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `is_paid` (BOOLEAN, NOT NULL, DEFAULT TRUE)
  - `is_rollover_allowed` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `max_rollover_days` (INT, NOT NULL, DEFAULT 0)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_leave_types` (`id`)
  - FK: `fk_lt_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
  - UQ: `uq_lt_company_code` (`company_id`, `code`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 6.2. Table: `leave_balances`
- **Purpose**: Alokasi kuota saldo cuti tahunan per karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `leave_type_id` (UUID, NOT NULL, FK -> `leave_types(id)` ON DELETE RESTRICT)
  - `period_year` (INT, NOT NULL) - e.g. 2026
  - `allocated_days` (DECIMAL(5,2), NOT NULL, DEFAULT 12.00)
  - `used_days` (DECIMAL(5,2), NOT NULL, DEFAULT 0.00)
  - `pending_days` (DECIMAL(5,2), NOT NULL, DEFAULT 0.00)
  - `remaining_days` (DECIMAL(5,2), GENERATED ALWAYS AS (allocated_days - used_days) STORED)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_leave_balances` (`id`)
  - FK: `fk_lb_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_lb_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types(id)` ON DELETE RESTRICT
  - UQ: `uq_emp_leave_year` (`employee_id`, `leave_type_id`, `period_year`)
  - CK: `chk_leave_used` CHECK (used_days >= 0)
- **Indexes**:
  - `idx_leave_balances_lookup` ON `leave_balances(employee_id, period_year)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 6.3. Table: `leave_requests`
- **Purpose**: Permohonan cuti/izin/sakit karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `leave_type_id` (UUID, NOT NULL, FK -> `leave_types(id)` ON DELETE RESTRICT)
  - `start_date` (DATE, NOT NULL)
  - `end_date` (DATE, NOT NULL)
  - `total_days` (DECIMAL(4,1), NOT NULL)
  - `reason` (TEXT, NOT NULL)
  - `attachment_url` (VARCHAR(255), NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'PENDING') - `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_leave_requests` (`id`)
  - FK: `fk_lr_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_lr_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types(id)` ON DELETE RESTRICT
  - CK: `chk_leave_dates` CHECK (end_date >= start_date)
- **Indexes**:
  - `idx_leave_requests_emp_status` ON `leave_requests(employee_id, status)`
  - `idx_leave_requests_dates` ON `leave_requests(start_date, end_date)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 6.4. Table: `leave_approvals`
- **Purpose**: Catatan riwayat persetujuan bertingkat (*Approval Log*).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `leave_request_id` (UUID, NOT NULL, FK -> `leave_requests(id)` ON DELETE CASCADE)
  - `approver_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE RESTRICT)
  - `approval_level` (INT, NOT NULL, DEFAULT 1) - 1 = Line Manager, 2 = HR Admin
  - `status` (VARCHAR(20), NOT NULL) - `APPROVED`, `REJECTED`
  - `comments` (TEXT, NULL)
  - `action_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_leave_approvals` (`id`)
  - FK: `fk_la_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests(id)` ON DELETE CASCADE
  - FK: `fk_la_approver` FOREIGN KEY (`approver_id`) REFERENCES `employees(id)` ON DELETE RESTRICT
- **Indexes**:
  - `idx_leave_approvals_req` ON `leave_approvals(leave_request_id)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 7: PAYROLL (HISTORICAL INTEGRITY GUARANTEED)

#### 7.1. Table: `employee_salary_structures` (Versioned Salary Profiles)
- **Purpose**: Menyimpan komponen gaji aktif karyawan berbasis masa berlaku efektif (*Time-Travel / Interval Validity*). Perubahan gaji hari ini tidak boleh mengubah periode gaji bulan lalu!
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `basic_salary_encrypted` (VARCHAR(255), NOT NULL) - Gaji pokok terenkripsi AES-256
  - `fixed_allowance_encrypted` (VARCHAR(255), NOT NULL, DEFAULT '0')
  - `effective_start_date` (DATE, NOT NULL)
  - `effective_end_date` (DATE, NULL) - NULL jika masih aktif berjalan
  - `is_current` (BOOLEAN, NOT NULL, DEFAULT TRUE)
  - `notes` (VARCHAR(255), NULL) - Alasan penyesuaian gaji
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_salary_structures` (`id`)
  - FK: `fk_sal_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
- **Indexes**:
  - `idx_sal_emp_current` ON `employee_salary_structures(employee_id, is_current)`
  - `idx_sal_emp_effective` ON `employee_salary_structures(employee_id, effective_start_date, effective_end_date)`
- **Soft Delete**: Tidak.
- **Audit**: Ya (Mutasi struktur gaji wajib tercatat di `audit_logs`).

#### 7.2. Table: `payroll_periods`
- **Purpose**: Periode siklus cut-off penggajian bulanan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `name` (VARCHAR(50), NOT NULL) - e.g. `September 2026 Payroll`
  - `start_date` (DATE, NOT NULL) - Awal cut-off presensi
  - `end_date` (DATE, NOT NULL) - Akhir cut-off presensi
  - `payment_date` (DATE, NOT NULL) - Tanggal pencairan
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'DRAFT') - `DRAFT`, `CALCULATED`, `VERIFIED`, `LOCKED`, `PAID`
  - `locked_by` (UUID, NULL, FK -> `users(id)` ON DELETE SET NULL)
  - `locked_at` (TIMESTAMPTZ, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_payroll_periods` (`id`)
  - FK: `fk_pp_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
  - FK: `fk_pp_locked_by` FOREIGN KEY (`locked_by`) REFERENCES `users(id)` ON DELETE SET NULL
  - UQ: `uq_company_period_dates` (`company_id`, `start_date`, `end_date`)
- **Indexes**:
  - `idx_payroll_periods_status` ON `payroll_periods(status)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 7.3. Table: `payroll_records` (Immutable Snapshot Slip Gaji)
- **Purpose**: Record slip gaji final per karyawan. Menyimpan snapshot gaji pokok, departemen, dan jabatan pada saat periode diproses!
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `payroll_period_id` (UUID, NOT NULL, FK -> `payroll_periods(id)` ON DELETE RESTRICT)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE RESTRICT)
  - `department_id_snapshot` (UUID, NOT NULL, FK -> `departments(id)` ON DELETE RESTRICT) - Historis departemen saat gaji diproses!
  - `designation_id_snapshot` (UUID, NOT NULL, FK -> `designations(id)` ON DELETE RESTRICT) - Historis jabatan saat gaji diproses!
  - `basic_salary_snapshot_encrypted` (VARCHAR(255), NOT NULL) - Snapshot gaji pokok
  - `gross_salary_encrypted` (VARCHAR(255), NOT NULL) - Total penghasilan kotor
  - `total_allowances` (DECIMAL(14,2), NOT NULL, DEFAULT 0.00)
  - `total_deductions` (DECIMAL(14,2), NOT NULL, DEFAULT 0.00)
  - `overtime_amount` (DECIMAL(14,2), NOT NULL, DEFAULT 0.00)
  - `tax_pph21_amount` (DECIMAL(14,2), NOT NULL, DEFAULT 0.00)
  - `bpjs_tk_employee` (DECIMAL(14,2), NOT NULL, DEFAULT 0.00)
  - `bpjs_tk_company` (DECIMAL(14,2), NOT NULL, DEFAULT 0.00)
  - `bpjs_kes_employee` (DECIMAL(14,2), NOT NULL, DEFAULT 0.00)
  - `bpjs_kes_company` (DECIMAL(14,2), NOT NULL, DEFAULT 0.00)
  - `net_salary_encrypted` (VARCHAR(255), NOT NULL) - Take Home Pay final terenkripsi
  - `bank_name_snapshot` (VARCHAR(50), NOT NULL)
  - `bank_account_no_snapshot_encrypted` (VARCHAR(255), NOT NULL)
  - `payslip_pdf_url` (VARCHAR(255), NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'DRAFT') - `DRAFT`, `PUBLISHED`
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_payroll_records` (`id`)
  - FK: `fk_pr_period` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods(id)` ON DELETE RESTRICT
  - FK: `fk_pr_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE RESTRICT
  - FK: `fk_pr_dept_snap` FOREIGN KEY (`department_id_snapshot`) REFERENCES `departments(id)` ON DELETE RESTRICT
  - FK: `fk_pr_desig_snap` FOREIGN KEY (`designation_id_snapshot`) REFERENCES `designations(id)` ON DELETE RESTRICT
  - UQ: `uq_period_employee` (`payroll_period_id`, `employee_id`) - 1 slip per karyawan per periode
- **Indexes**:
  - `idx_payroll_records_lookup` ON `payroll_records(payroll_period_id, employee_id)`
  - `idx_payroll_records_emp` ON `payroll_records(employee_id)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 7.4. Table: `payroll_items`
- **Purpose**: Breakdown rincian komponen pendapatan dan potongan pada slip gaji.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `payroll_record_id` (UUID, NOT NULL, FK -> `payroll_records(id)` ON DELETE CASCADE)
  - `category` (VARCHAR(20), NOT NULL) - `ALLOWANCE`, `DEDUCTION`, `COMPANY_CONTRIBUTION`
  - `code` (VARCHAR(50), NOT NULL) - e.g. `BASIC_SALARY`, `PPH21`, `BPJS_JHT_EMP`, `TRANSPORT`
  - `name` (VARCHAR(100), NOT NULL) - e.g. `Tunjangan Transportasi`
  - `amount` (DECIMAL(14,2), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_payroll_items` (`id`)
  - FK: `fk_pi_record` FOREIGN KEY (`payroll_record_id`) REFERENCES `payroll_records(id)` ON DELETE CASCADE
- **Indexes**:
  - `idx_payroll_items_record` ON `payroll_items(payroll_record_id)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 7.5. Table: `bank_transfer_batches`
- **Purpose**: Log berkas instruksi transfer bank massal (BCA AutoPay, Mandiri MCM, dll).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `payroll_period_id` (UUID, NOT NULL, FK -> `payroll_periods(id)` ON DELETE RESTRICT)
  - `bank_format` (VARCHAR(30), NOT NULL) - `BCA_AUTOPAY`, `MANDIRI_MCM`, `CSV_GENERIC`
  - `total_records` (INT, NOT NULL)
  - `total_amount` (DECIMAL(16,2), NOT NULL)
  - `file_url` (VARCHAR(255), NOT NULL)
  - `generated_by` (UUID, NOT NULL, FK -> `users(id)` ON DELETE RESTRICT)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_bank_transfer_batches` (`id`)
  - FK: `fk_btb_period` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods(id)` ON DELETE RESTRICT
  - FK: `fk_btb_user` FOREIGN KEY (`generated_by`) REFERENCES `users(id)` ON DELETE RESTRICT
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 8: BENEFIT & CLAIMS

#### 8.1. Table: `benefit_plans`
- **Purpose**: Master program tunjangan dan reimbursement.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `code` (VARCHAR(30), NOT NULL) - e.g. `MEDICAL_OUTPATIENT`, `OPTICAL`, `TRANSPORT_CLAIM`
  - `name` (VARCHAR(100), NOT NULL)
  - `annual_limit_default` (DECIMAL(12,2), NOT NULL, DEFAULT 0.00)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_benefit_plans` (`id`)
  - FK: `fk_bp_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
  - UQ: `uq_bp_code` (`company_id`, `code`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 8.2. Table: `employee_benefit_allocations`
- **Purpose**: Pagu tunjangan tahunan per karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `benefit_plan_id` (UUID, NOT NULL, FK -> `benefit_plans(id)` ON DELETE RESTRICT)
  - `period_year` (INT, NOT NULL)
  - `allocated_amount` (DECIMAL(12,2), NOT NULL)
  - `used_amount` (DECIMAL(12,2), NOT NULL, DEFAULT 0.00)
  - `remaining_amount` (DECIMAL(12,2), GENERATED ALWAYS AS (allocated_amount - used_amount) STORED)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_emp_benefit_alloc` (`id`)
  - FK: `fk_eba_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_eba_plan` FOREIGN KEY (`benefit_plan_id`) REFERENCES `benefit_plans(id)` ON DELETE RESTRICT
  - UQ: `uq_emp_benefit_year` (`employee_id`, `benefit_plan_id`, `period_year`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 8.3. Table: `reimbursement_claims`
- **Purpose**: Pengajuan klaim reimbursement karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `benefit_plan_id` (UUID, NOT NULL, FK -> `benefit_plans(id)` ON DELETE RESTRICT)
  - `claim_number` (VARCHAR(50), NOT NULL, Unique)
  - `claim_date` (DATE, NOT NULL)
  - `total_amount` (DECIMAL(12,2), NOT NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'SUBMITTED') - `SUBMITTED`, `VERIFIED`, `APPROVED`, `PAID`, `REJECTED`
  - `payroll_period_id` (UUID, NULL, FK -> `payroll_periods(id)` ON DELETE SET NULL) - Jika dibayarkan via payroll
  - `notes` (TEXT, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_reimbursement_claims` (`id`)
  - FK: `fk_rc_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_rc_plan` FOREIGN KEY (`benefit_plan_id`) REFERENCES `benefit_plans(id)` ON DELETE RESTRICT
  - FK: `fk_rc_payroll` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods(id)` ON DELETE SET NULL
  - UQ: `uq_rc_number` (`claim_number`)
- **Indexes**:
  - `idx_rc_emp_status` ON `reimbursement_claims(employee_id, status)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 8.4. Table: `reimbursement_claim_items`
- **Purpose**: Rincian kuitansi dan berkas faktur dalam satu klaim.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `claim_id` (UUID, NOT NULL, FK -> `reimbursement_claims(id)` ON DELETE CASCADE)
  - `invoice_date` (DATE, NOT NULL)
  - `invoice_number` (VARCHAR(100), NULL)
  - `description` (VARCHAR(255), NOT NULL)
  - `amount` (DECIMAL(12,2), NOT NULL)
  - `receipt_url` (VARCHAR(255), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_claim_items` (`id`)
  - FK: `fk_ci_claim` FOREIGN KEY (`claim_id`) REFERENCES `reimbursement_claims(id)` ON DELETE CASCADE
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 9: PERFORMANCE

#### 9.1. Table: `appraisal_cycles`
- **Purpose**: Siklus penilaian kinerja periodik.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `title` (VARCHAR(100), NOT NULL) - e.g. `Annual Performance Review 2026`
  - `start_date` (DATE, NOT NULL)
  - `end_date` (DATE, NOT NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'SETUP') - `SETUP`, `ACTIVE`, `CALIBRATING`, `CLOSED`
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_appraisal_cycles` (`id`)
  - FK: `fk_ac_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 9.2. Table: `employee_kpis`
- **Purpose**: Rincian target KPI individu.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `cycle_id` (UUID, NOT NULL, FK -> `appraisal_cycles(id)` ON DELETE CASCADE)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `title` (VARCHAR(150), NOT NULL)
  - `weight_percentage` (DECIMAL(5,2), NOT NULL)
  - `target_metric` (VARCHAR(100), NOT NULL)
  - `actual_result` (VARCHAR(100), NULL)
  - `self_rating` (DECIMAL(3,2), NULL)
  - `manager_rating` (DECIMAL(3,2), NULL)
  - `final_score` (DECIMAL(5,2), NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_employee_kpis` (`id`)
  - FK: `fk_ekpi_cycle` FOREIGN KEY (`cycle_id`) REFERENCES `appraisal_cycles(id)` ON DELETE CASCADE
  - FK: `fk_ekpi_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
- **Indexes**:
  - `idx_kpi_cycle_emp` ON `employee_kpis(cycle_id, employee_id)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 9.3. Table: `appraisal_reviews`
- **Purpose**: Review kualitatif dan skor kumulatif akhir.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `cycle_id` (UUID, NOT NULL, FK -> `appraisal_cycles(id)` ON DELETE CASCADE)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `reviewer_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE RESTRICT)
  - `final_score` (DECIMAL(5,2), NULL)
  - `final_grade` (VARCHAR(10), NULL) - `A`, `B`, `C`, `D`, `E`
  - `strengths` (TEXT, NULL)
  - `improvements` (TEXT, NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'DRAFT')
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_appraisal_reviews` (`id`)
  - FK: `fk_ar_cycle` FOREIGN KEY (`cycle_id`) REFERENCES `appraisal_cycles(id)` ON DELETE CASCADE
  - FK: `fk_ar_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_ar_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `employees(id)` ON DELETE RESTRICT
  - UQ: `uq_review_cycle_emp` (`cycle_id`, `employee_id`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 10: CAREER & TRAINING

#### 10.1. Table: `career_histories`
- **Purpose**: Rekam jejak seluruh mutasi, promosi, demosi, dan perubahan jabatan karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `event_type` (VARCHAR(30), NOT NULL) - `JOIN`, `PROMOTION`, `DEMOTION`, `TRANSFER`, `GRADE_CHANGE`
  - `reference_letter_number` (VARCHAR(100), NULL) - Nomor SK Direksi
  - `effective_date` (DATE, NOT NULL)
  - `previous_department_id` (UUID, NULL, FK -> `departments(id)` ON DELETE SET NULL)
  - `new_department_id` (UUID, NOT NULL, FK -> `departments(id)` ON DELETE RESTRICT)
  - `previous_designation_id` (UUID, NULL, FK -> `designations(id)` ON DELETE SET NULL)
  - `new_designation_id` (UUID, NOT NULL, FK -> `designations(id)` ON DELETE RESTRICT)
  - `previous_manager_id` (UUID, NULL, FK -> `employees(id)` ON DELETE SET NULL)
  - `new_manager_id` (UUID, NULL, FK -> `employees(id)` ON DELETE SET NULL)
  - `notes` (TEXT, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_career_histories` (`id`)
  - FK: `fk_ch_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_ch_prev_dept` FOREIGN KEY (`previous_department_id`) REFERENCES `departments(id)` ON DELETE SET NULL
  - FK: `fk_ch_new_dept` FOREIGN KEY (`new_department_id`) REFERENCES `departments(id)` ON DELETE RESTRICT
  - FK: `fk_ch_prev_desig` FOREIGN KEY (`previous_designation_id`) REFERENCES `designations(id)` ON DELETE SET NULL
  - FK: `fk_ch_new_desig` FOREIGN KEY (`new_designation_id`) REFERENCES `designations(id)` ON DELETE RESTRICT
- **Indexes**:
  - `idx_career_emp` ON `career_histories(employee_id, effective_date)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 10.2. Table: `training_programs`
- **Purpose**: Katalog program pelatihan dan sertifikasi.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `title` (VARCHAR(150), NOT NULL)
  - `provider` (VARCHAR(150), NOT NULL)
  - `category` (VARCHAR(50), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_training_programs` (`id`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 10.3. Table: `employee_trainings`
- **Purpose**: Catatan kepesertaan dan kelulusan training karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `training_program_id` (UUID, NOT NULL, FK -> `training_programs(id)` ON DELETE RESTRICT)
  - `start_date` (DATE, NOT NULL)
  - `end_date` (DATE, NOT NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'ENROLLED') - `ENROLLED`, `COMPLETED`, `FAILED`
  - `certificate_url` (VARCHAR(255), NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_emp_trainings` (`id`)
  - FK: `fk_et_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - FK: `fk_et_program` FOREIGN KEY (`training_program_id`) REFERENCES `training_programs(id)` ON DELETE RESTRICT
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 11: RECRUITMENT (ATS)

#### 11.1. Table: `job_postings`
- **Purpose**: Lowongan pekerjaan yang dibuka.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `department_id` (UUID, NOT NULL, FK -> `departments(id)` ON DELETE RESTRICT)
  - `designation_id` (UUID, NOT NULL, FK -> `designations(id)` ON DELETE RESTRICT)
  - `title` (VARCHAR(150), NOT NULL)
  - `description` (TEXT, NOT NULL)
  - `requirements` (TEXT, NOT NULL)
  - `headcount_needed` (INT, NOT NULL, DEFAULT 1)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'OPEN') - `OPEN`, `CLOSED`, `DRAFT`
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_job_postings` (`id`)
  - FK: `fk_jp_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
  - FK: `fk_jp_dept` FOREIGN KEY (`department_id`) REFERENCES `departments(id)` ON DELETE RESTRICT
  - FK: `fk_jp_desig` FOREIGN KEY (`designation_id`) REFERENCES `designations(id)` ON DELETE RESTRICT
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 11.2. Table: `candidates`
- **Purpose**: Master data pelamar kerja.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `first_name` (VARCHAR(100), NOT NULL)
  - `last_name` (VARCHAR(100), NULL)
  - `email` (VARCHAR(150), NOT NULL, Unique)
  - `phone_number` (VARCHAR(30), NOT NULL)
  - `resume_url` (VARCHAR(255), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_candidates` (`id`)
  - UQ: `uq_candidates_email` (`email`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 11.3. Table: `job_applications`
- **Purpose**: Pelacakan lamaran kerja pada pipeline ATS.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `job_posting_id` (UUID, NOT NULL, FK -> `job_postings(id)` ON DELETE CASCADE)
  - `candidate_id` (UUID, NOT NULL, FK -> `candidates(id)` ON DELETE CASCADE)
  - `stage` (VARCHAR(30), NOT NULL, DEFAULT 'APPLIED') - `APPLIED`, `SCREENING`, `INTERVIEW`, `OFFERING`, `HIRED`, `REJECTED`
  - `rating` (INT, NULL) - 1 sampai 5 bintang
  - `notes` (TEXT, NULL)
  - `converted_employee_id` (UUID, NULL, FK -> `employees(id)` ON DELETE SET NULL) - ID karyawan baru saat kandidat hired!
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_job_applications` (`id`)
  - FK: `fk_ja_job` FOREIGN KEY (`job_posting_id`) REFERENCES `job_postings(id)` ON DELETE CASCADE
  - FK: `fk_ja_cand` FOREIGN KEY (`candidate_id`) REFERENCES `candidates(id)` ON DELETE CASCADE
  - FK: `fk_ja_conv_emp` FOREIGN KEY (`converted_employee_id`) REFERENCES `employees(id)` ON DELETE SET NULL
  - UQ: `uq_job_candidate` (`job_posting_id`, `candidate_id`)
- **Indexes**:
  - `idx_ja_stage` ON `job_applications(job_posting_id, stage)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 12: NOTIFICATION

#### 12.1. Table: `notifications`
- **Purpose**: Pusat pesan notifikasi pengguna (In-App).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `recipient_id` (UUID, NOT NULL, FK -> `users(id)` ON DELETE CASCADE)
  - `type` (VARCHAR(50), NOT NULL) - e.g. `LEAVE_APPROVAL_REQUESTED`, `PAYSLIP_PUBLISHED`
  - `title` (VARCHAR(150), NOT NULL)
  - `message` (TEXT, NOT NULL)
  - `payload` (JSONB, NULL) - Data kontekstual link (e.g. `{"leave_id": "xxx"}`)
  - `is_read` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `read_at` (TIMESTAMPTZ, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_notifications` (`id`)
  - FK: `fk_notif_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users(id)` ON DELETE CASCADE
- **Indexes**:
  - `idx_notifications_unread` ON `notifications(recipient_id, is_read, created_at DESC)`
- **Soft Delete**: Tidak.
- **Audit**: Tidak.

#### 12.2. Table: `notification_preferences`
- **Purpose**: Preferensi saluran notifikasi pengguna (Email / In-App / WhatsApp).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `user_id` (UUID, NOT NULL, Unique, FK -> `users(id)` ON DELETE CASCADE)
  - `email_enabled` (BOOLEAN, NOT NULL, DEFAULT TRUE)
  - `in_app_enabled` (BOOLEAN, NOT NULL, DEFAULT TRUE)
  - `whatsapp_enabled` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_notif_pref` (`id`)
  - FK: `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `users(id)` ON DELETE CASCADE
  - UQ: `uq_np_user` (`user_id`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 13: DOCUMENTS & POLICIES

#### 13.1. Table: `company_policies`
- **Purpose**: Berkas Peraturan Perusahaan, SOP, dan Buku Pedoman Karyawan.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `title` (VARCHAR(150), NOT NULL)
  - `version_tag` (VARCHAR(20), NOT NULL) - e.g. `v2026.1`
  - `file_url` (VARCHAR(255), NOT NULL)
  - `is_mandatory_acknowledgment` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `effective_date` (DATE, NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_company_policies` (`id`)
  - FK: `fk_cp_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 13.2. Table: `policy_acknowledgments`
- **Purpose**: Catatan konfirmasi tanda terima digital bahwa karyawan telah membaca SOP.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `policy_id` (UUID, NOT NULL, FK -> `company_policies(id)` ON DELETE CASCADE)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `ip_address` (VARCHAR(45), NOT NULL)
  - `acknowledged_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_policy_ack` (`id`)
  - FK: `fk_pa_policy` FOREIGN KEY (`policy_id`) REFERENCES `company_policies(id)` ON DELETE CASCADE
  - FK: `fk_pa_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
  - UQ: `uq_emp_policy_ack` (`policy_id`, `employee_id`)
- **Indexes**:
  - `idx_policy_ack_lookup` ON `policy_acknowledgments(policy_id, employee_id)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 13.3. Table: `employee_documents`
- **Purpose**: Berkas dokumen personal karyawan (Ijazah, Kontrak Kerja, Sertifikat).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `employee_id` (UUID, NOT NULL, FK -> `employees(id)` ON DELETE CASCADE)
  - `title` (VARCHAR(150), NOT NULL)
  - `document_type` (VARCHAR(50), NOT NULL) - `CONTRACT`, `CERTIFICATE`, `DEGREE`, `ID_CARD`
  - `file_url` (VARCHAR(255), NOT NULL)
  - `file_size_bytes` (INT, NOT NULL)
  - `mime_type` (VARCHAR(50), NOT NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_employee_documents` (`id`)
  - FK: `fk_ed_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees(id)` ON DELETE CASCADE
- **Indexes**:
  - `idx_emp_docs` ON `employee_documents(employee_id)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

---

### DOMAIN 14: AUDIT LOG & COMPLIANCE (TAMPER-PROOF LEDGER)

#### 14.1. Table: `audit_logs` (Append-Only)
- **Purpose**: Catatan forensik mutasi data penting dan audit kepatuhan. Tabel ini dibuat secara **Append-Only** (Dilarang ada operasi UPDATE atau DELETE di level database!).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `user_id` (UUID, NULL) - NULL jika dieksekusi oleh sistem background worker
  - `action` (VARCHAR(50), NOT NULL) - `CREATE`, `UPDATE`, `DELETE`, `VIEW_SENSITIVE`, `LOGIN`, `LOCK_PAYROLL`
  - `entity_type` (VARCHAR(50), NOT NULL) - e.g. `Employee`, `PayrollRecord`, `LeaveRequest`, `UserRole`
  - `entity_id` (VARCHAR(50), NOT NULL)
  - `ip_address` (VARCHAR(45), NOT NULL)
  - `user_agent` (VARCHAR(255), NULL)
  - `old_values` (JSONB, NULL) - Snapshot nilai sebelum mutasi
  - `new_values` (JSONB, NULL) - Snapshot nilai setelah mutasi
  - `metadata` (JSONB, NULL) - Informasi konteks tambahan
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_audit_logs` (`id`)
- **Indexes**:
  - `idx_audit_logs_entity` ON `audit_logs(entity_type, entity_id)`
  - `idx_audit_logs_user` ON `audit_logs(user_id, created_at DESC)`
  - `idx_audit_logs_created` ON `audit_logs(created_at DESC)`
- **Soft Delete**: DILARANG KERAS (Tidak ada kolom `deleted_at`).
- **Audit**: Merupakan fondasi audit itu sendiri.

---

### DOMAIN 15: SYSTEM SETTINGS & EVENT OUTBOX

#### 15.1. Table: `system_settings`
- **Purpose**: Konfigurasi parameter global aplikasi (Key-Value dinamis).
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `setting_key` (VARCHAR(100), NOT NULL, Unique)
  - `setting_value` (TEXT, NOT NULL)
  - `data_type` (VARCHAR(20), NOT NULL, DEFAULT 'STRING') - `STRING`, `NUMBER`, `BOOLEAN`, `JSON`
  - `description` (VARCHAR(255), NULL)
  - `is_public` (BOOLEAN, NOT NULL, DEFAULT FALSE)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_system_settings` (`id`)
  - UQ: `uq_setting_key` (`setting_key`)
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 15.2. Table: `public_holidays`
- **Purpose**: Kalender hari libur nasional dan cuti bersama resmi pemerintah.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `company_id` (UUID, NOT NULL, FK -> `companies(id)` ON DELETE RESTRICT)
  - `holiday_date` (DATE, NOT NULL)
  - `name` (VARCHAR(100), NOT NULL) - e.g. `Hari Raya Idul Fitri 1447 H`
  - `is_joint_leave` (BOOLEAN, NOT NULL, DEFAULT FALSE) - Flag Cuti Bersama
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_public_holidays` (`id`)
  - FK: `fk_ph_company` FOREIGN KEY (`company_id`) REFERENCES `companies(id)` ON DELETE RESTRICT
  - UQ: `uq_company_holiday_date` (`company_id`, `holiday_date`)
- **Indexes**:
  - `idx_holidays_date` ON `public_holidays(holiday_date)`
- **Soft Delete**: Tidak.
- **Audit**: Ya.

#### 15.3. Table: `transactional_outbox` (Reliable Event Dispatcher)
- **Purpose**: Menerapkan pola **Transactional Outbox Pattern** untuk menjamin pengiriman pesan domain ke Redis/BullMQ/WebSocket tanpa risiko kehilangan data (*At-Least-Once Delivery*) ketika transaksi database selesai dicommit.
- **Columns**:
  - `id` (UUID, NOT NULL, DEFAULT uuid_generate_v7(), PK)
  - `aggregate_type` (VARCHAR(50), NOT NULL) - e.g. `LeaveRequest`, `PayrollPeriod`, `Attendance`
  - `aggregate_id` (VARCHAR(50), NOT NULL)
  - `event_type` (VARCHAR(100), NOT NULL) - e.g. `leave.submitted`, `payroll.published`
  - `payload` (JSONB, NOT NULL)
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'PENDING') - `PENDING`, `PROCESSED`, `FAILED`
  - `retry_count` (INT, NOT NULL, DEFAULT 0)
  - `error_message` (TEXT, NULL)
  - `processed_at` (TIMESTAMPTZ, NULL)
  - `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- **Constraints**:
  - PK: `pk_transactional_outbox` (`id`)
- **Indexes**:
  - `idx_outbox_unprocessed` ON `transactional_outbox(status, created_at)` WHERE `status = 'PENDING'`
- **Soft Delete**: Tidak.
- **Audit**: Tidak.

---

## 3. RELATIONSHIP SPECIFICATION & REFERENTIAL INTEGRITY

1. **Aturan Default Foreign Key**:
   - Seluruh relasi entitas struktural mengadopsi `ON DELETE RESTRICT` (contoh: Menghapus Departemen ditolak jika masih ada Karyawan di dalamnya).
   - Relasi data detail dependen menggunakan `ON DELETE CASCADE` (contoh: `payroll_items` milik `payroll_records`, `reimbursement_claim_items` milik `reimbursement_claims`, `employee_identities` milik `employees`).
   - Relasi atasan opsional menggunakan `ON DELETE SET NULL` (contoh: `manager_id` pada `employees`).
2. **Cardinality Mapping Kunci**:
   - `users` (1) <---> (1) `employees`
   - `companies` (1) <---> (N) `departments` <---> (N) `designations` <---> (N) `employees`
   - `employees` (1) <---> (N) `attendances`
   - `employees` (1) <---> (N) `leave_requests` (1) <---> (N) `leave_approvals`
   - `payroll_periods` (1) <---> (N) `payroll_records` (1) <---> (N) `payroll_items`
   - `benefit_plans` (1) <---> (N) `reimbursement_claims` (1) <---> (N) `reimbursement_claim_items`
   - `job_postings` (1) <---> (N) `job_applications` (N) <---> (1) `candidates`

---

## 4. INDEXING STRATEGY

1. **B-Tree Standard Indexes**: Dipasang pada seluruh kolom Foreign Key untuk memastikan kecepatan operasi `JOIN` dan pencegahan table lock saat mutasi.
2. **Composite Indexes**:
   - `attendances (employee_id, work_date)` -> Pencarian status presensi harian karyawan.
   - `leave_requests (employee_id, status)` -> Query rekap cuti karyawan aktif.
   - `payroll_records (payroll_period_id, employee_id)` -> Query pencarian slip gaji bulanan.
   - `audit_logs (entity_type, entity_id)` -> Investigasi forensik histori suatu objek.
3. **Partial Indexes**:
   - `users (email) WHERE deleted_at IS NULL` -> Memastikan email unik hanya pada akun yang tidak dihapus.
   - `transactional_outbox (status, created_at) WHERE status = 'PENDING'` -> Query ultra-cepat untuk worker outbox tanpa memindai event yang sudah sukses diproses.
   - `notifications (recipient_id, created_at DESC) WHERE is_read = FALSE` -> Menghitung badge unread notifikasi dalam fraksi milidetik.
4. **Range / BRIN Indexing (Masa Depan)**:
   - Disiapkan untuk kolom `work_date` pada tabel `attendances` dan `created_at` pada `audit_logs` saat volume record melampaui 10.000.000 baris.

---

## 5. TRANSACTION STRATEGY & ISOLATION BOUNDARIES

1. **Tingkat Isolasi (Isolation Levels)**:
   - **`READ COMMITTED` (Default)**: Digunakan untuk transaksi operasional umum (Clock-In, Pembaruan Profil, Pengajuan Cuti).
   - **`REPEATABLE READ` / `SERIALIZABLE`**: Wajib digunakan saat kalkulasi dan penguncian **Payroll Batch Run** untuk mencegah *phantom reads* dan anomali perhitungan akibat mutasi kehadiran/cuti yang berjalan bersamaan.
2. **Pola Transaksi Presensi & Cuti**:
   - Pengajuan cuti dieksekusi dalam 1 transaksi atomik: Insert `leave_requests` + Update `leave_balances (pending_days = pending_days + X)` + Insert `transactional_outbox (leave.submitted)`. Jika salah satu gagal, seluruh operasi di-*rollback*.
3. **Pencegahan Race Condition (Pessimistic Locking)**:
   - Approval cuti menggunakan `SELECT ... FOR UPDATE` pada baris `leave_balances` terkait untuk mencegah dua approver menyetujui pengajuan cuti yang melebihi kuota secara bersamaan.

---

## 6. DATA RETENTION STRATEGY

1. **Data Finansial (Payroll & Slip Gaji)**: Retensi permanen minimal **10 tahun** sesuai regulasi perpajakan dan hukum ketenagakerjaan Indonesia. Data tidak boleh dihapus.
2. **Data Presensi (Attendance)**: Data aktif disimpan selama **3 tahun** pada primary table. Setelah 3 tahun, data diarsipkan ke tabel partisi *cold storage* atau data warehouse untuk kebutuhan analitik jangka panjang.
3. **Data Audit Trail (Audit Logs)**: Disimpan selama **5 tahun** secara append-only. Partisi tahunan (e.g. `audit_logs_2026`, `audit_logs_2027`) diterapkan untuk mempermudah backup dan *read-only detachment*.
4. **Sesi Pengguna (User Sessions)**: Record sesi yang sudah kedaluwarsa (`expires_at < NOW() - INTERVAL '30 days'`) dibersihkan secara terjadwal setiap minggu menggunakan background cron job.

---

## 7. BACKUP & DISASTER RECOVERY STRATEGY

1. **Continuous WAL Archiving & Point-In-Time Recovery (PITR)**:
   - PostgreSQL Write-Ahead Logging (WAL) dialirkan secara kontinu ke Object Storage (S3 / GCS) terisolasi.
   - Memungkinkan pemulihan sistem ke titik detik mana pun sebelum insiden (*sub-minute recovery*).
2. **Daily Physical/Logical Snapshot**:
   - Snapshot basis data penuh (`pg_dump` terkompresi dan terenkripsi AES-256) dijalankan setiap hari pada pukul 02:00 WIB (periode traffic terendah).
   - Snapshot disimpan di dua lokasi berbeda (lokal server + cloud lintas region).
   - Retensi backup: Harian (disimpan 30 hari), Mingguan (disimpan 12 minggu), Bulanan (disimpan 36 bulan).
3. **Target Metrik Pemulihan**:
   - **RPO (Recovery Point Objective)**: < 15 menit.
   - **RTO (Recovery Time Objective)**: < 1 jam.
4. **Quarterly Drill**: Simulasi restorasi backup dijalankan setiap 3 bulan pada staging environment untuk memvalidasi integritas file backup.

---

## 8. MIGRATION & SCHEMA EVOLUTION STRATEGY

1. **Strict Versioned Migration Engine**: Seluruh perubahan skema wajib menggunakan tool migrasi terstruktur (Prisma Migrate / TypeORM Migration / Flyway / Goose). Dilarang keras melakukan modifikasi DDL manual pada basis data production.
2. **Pola Non-Breaking: Expand and Contract Pattern**:
   - **Tahap 1 (Expand)**: Tambahkan kolom baru dengan constraint nullable atau default value. Deploy aplikasi.
   - **Tahap 2 (Migrate / Dual-Write)**: Aplikasi baru menulis ke kolom baru dan kolom lama secara bersamaan.
   - **Tahap 3 (Backfill)**: Jalankan background script untuk mengisi data historis dari kolom lama ke kolom baru.
   - **Tahap 4 (Contract)**: Hapus kolom lama pada rilis minor berikutnya setelah seluruh sistem stabil.
3. **Safe DDL Guidelines**:
   - Menambahkan indeks pada tabel besar wajib menggunakan sintaks `CREATE INDEX CONCURRENTLY` agar tidak mengunci tabel operasional (*zero table locking*).
   - Menghindari pengubahan tipe data kolom yang memerlukan *full table rewrite* saat jam operasional kantor.

---

## 9. DATABASE RISK & MITIGATION MATRIX

| ID | Resiko Basis Data | Dampak | Probabilitas | Rencana Mitigasi Teknis |
| :---: | :--- | :---: | :---: | :--- |
| **DB-R1** | Kebocoran Data Finansial & PII Karyawan | Kritis | Rendah | Enkripsi AES-256-GCM pada level aplikasi sebelum masuk DB; masking pada query view; pembatasan permission akses database. |
| **DB-R2** | Deadlock pada Payroll Calculation Massal | Tinggi | Sedang | Urutan penguncian baris (*locking order*) yang konsisten berdasarkan `employee_id ASC`; pemisahan kalkulasi per departemen dalam batch queue. |
| **DB-R3** | Degradasi Performa akibat Tabel Presensi Membengkak | Tinggi | Tinggi | Indexing komposit `(employee_id, work_date)`; penerapan *Table Partitioning* berbasis tahunan; caching jadwal shift di Redis. |
| **DB-R4** | Kehabisan Connection Pool (*DB Exhaustion*) | Kritis | Sedang | Penggunaan connection pooler terkelola (PgBouncer); batasan ukuran pool aplikasi (min: 5, max: 25 per instance); timeout query ketat (maks 10 detik). |
| **DB-R5** | Kehilangan Riwayat Gaji saat Karyawan Naik Gaji | Kritis | Rendah | Skema *Salary Interval Versioning* (`employee_salary_structures`) dan *Snapshotting* data pada `payroll_records`. |
| **DB-R6** | Perubahan Log Audit oleh Oknum Internal | Kritis | Rendah | Konfigurasi PostgreSQL Role: User aplikasi hanya diberi hak `INSERT` dan `SELECT` pada tabel `audit_logs` (Hak `UPDATE`, `DELETE`, `TRUNCATE` dicabut mutlak). |
