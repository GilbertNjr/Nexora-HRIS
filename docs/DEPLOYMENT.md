# DEPLOYMENT, INFRASTRUCTURE & DEVOPS SPECIFICATION
## Sistem Human Resource Information System (HRIS) Berbasis Web
**Version:** 1.0.0  
**Infrastructure Target:** Cloud / VPS Containerized Environment (Docker / Kubernetes)  

---

## 1. Containerization & Topology
Seluruh dependensi sistem dibungkus dalam kontainer Docker standar untuk memastikan konsistensi antara lingkungan lokal (*development*), staging, dan produksi.

### Topology Diagram
```
                     Internet
                        |
                        v
          +----------------------------+
          | Cloudflare / AWS CloudFront| (CDN, SSL, DDoS Shield)
          +-------------+--------------+
                        |
                        v
          +----------------------------+
          |    Nginx Reverse Proxy     | (SSL Offloading, Port 80/443)
          +-------------+--------------+
                        |
       +----------------+----------------+
       |                                 |
       v                                 v
+--------------+                 +---------------+
| Frontend App |                 |  Backend App  |
| Next.js SSR  |                 | NestJS API    |
| (Port 3000)  |                 | (Port 4000)   |
+--------------+                 +-------+-------+
                                         |
                        +----------------+----------------+
                        |                                 |
                        v                                 v
             +--------------------+            +--------------------+
             | PostgreSQL Cluster |            |   Redis Cluster    |
             |  (Primary + Read)  |            |  (Queue + Cache)   |
             +--------------------+            +--------------------+
```

---

## 2. Multi-Environment Architecture
1. **Local Development**:
   - Dijalankan via `docker-compose.dev.yml` (PostgreSQL, Redis, Mailpit untuk testing email lokal).
   - Hot-reloading aktif untuk frontend dan backend.
2. **Staging Environment**:
   - Cermin persis dari lingkungan produksi (*production mirror*).
   - Menggunakan data dummy yang dimasking (tidak boleh menggunakan data produksi riil).
   - Digunakan untuk User Acceptance Testing (UAT) dan load testing.
3. **Production Environment**:
   - Kontainer terkunci (*read-only root filesystem*).
   - Log terpusat ke cloud monitoring (CloudWatch, Datadog, atau ELK Stack).
   - Backup otomatis setiap 6 jam dengan retensi 30 hari.

---

## 3. Environment Variables & Secret Management
Semua kredensial sensitif disimpan sebagai environment variables yang diinjeksikan saat runtime. File `.env` dilarang keras di-commit ke Git repository (masuk dalam `.gitignore`).

### Key Environment Variables
```ini
# Application Core
NODE_ENV=production
APP_PORT=4000
APP_URL=https://hris.company.com
API_PREFIX=/api/v1

# Security & Secrets
JWT_SECRET=super-secret-jwt-signing-key-min-64-bytes
JWT_REFRESH_SECRET=super-secret-refresh-key-min-64-bytes
DATA_ENCRYPTION_KEY=32-bytes-base64-aes-key-for-pii-columns

# Database
DATABASE_URL=postgresql://hris_user:secure_password@postgres:5432/hris_production?sslmode=require
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=25

# Cache & Queues
REDIS_URL=redis://:redis_password@redis:6379/0

# Storage
STORAGE_DRIVER=s3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=company-hris-private-storage
AWS_REGION=ap-southeast-1

# SMTP / Mail
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=hris-mailer@company.com
SMTP_PASSWORD=xxx
SMTP_FROM_EMAIL=no-reply@company.com
```

---

## 4. Zero-Downtime Deployment Strategy
Untuk pembaruan versi tanpa mengganggu operasional presensi atau payroll:
1. **Rolling Update / Blue-Green Strategy**:
   - Kontainer versi baru (Green) di-deploy dan melewati health check (`/api/v1/health/liveness` & `/readiness`).
   - Nginx mengalihkan traffic secara bertahap ke versi baru setelah verifikasi berhasil.
   - Kontainer versi lama (Blue) dinonaktifkan secara anggun (*graceful termination* setelah request yang berjalan selesai).
2. **Non-Breaking Database Migration**:
   - Migrasi skema database wajib mematuhi aturan *Expand and Contract Pattern*.
   - Jangan pernah menghapus atau mengubah nama kolom secara mendadak. Buat kolom baru, replikasi data, deploy aplikasi yang membaca kolom baru, lalu hapus kolom usang di rilis berikutnya.

---

## 5. Health Checks & Observability
- Endpoint `/api/v1/health/liveness`: Mengecek apakah server runtime aktif (Port listening).
- Endpoint `/api/v1/health/readiness`: Mengecek konektivitas database PostgreSQL dan Redis broker sebelum menerima traffic.
- **Error Tracking**: Integrasi dengan Sentry untuk penangkapan uncaught exceptions di backend dan frontend.
- **Audit Monitoring**: Dashboard khusus untuk memonitor anomali login (misal: 100 failed login berturut-turut) dan pemicu peringatan otomatis ke tim keamanan.

---

## 6. Backup & Disaster Recovery (DR) Plan
- **RPO (Recovery Point Objective)**: Maksimal 1 jam kehilangan data.
- **RTO (Recovery Time Objective)**: Maksimal 2 jam waktu pemulihan sistem.
- **Prosedur Backup**:
  - PostgreSQL *Continuous WAL Archiving* (Point-In-Time Recovery / PITR).
  - Snapshot database harian yang dienkripsi dan dikirim ke lokasi penyimpanan off-site (lintas region cloud).
  - Simulasi pemulihan backup dijalankan secara berkala setiap kuartal untuk menguji validitas file backup.
