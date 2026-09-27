# ADR-003: Arsitektur Notifikasi Multi-Channel & Asinkron dengan Redis BullMQ

## Konteks & Latar Belakang
Setiap tindakan operasional di HRIS (pengajuan cuti, approval, penerbitan payroll, pelanggaran absensi) memerlukan notifikasi ke banyak pihak. Jika proses pengiriman email atau push notification dilakukan secara sinkron di thread HTTP request utama, waktu respon API akan melonjak drastis dan jika layanan email (SMTP) down, transaksi bisnis utama akan gagal (*cascading failure*).

## Keputusan
Menerapkan sistem notifikasi berbasis **Asynchronous Event-Driven Architecture** dengan:
1. **Event Dispatcher Internal**: Menerbitkan event domain setelah database transaction commit.
2. **Worker Queue (BullMQ + Redis)**: Memproses antrian pengiriman pesan di background.
3. **Multi-Channel Delivery Engine**: Mengirimkan notifikasi ke:
   - In-App Notification (disimpan di PostgreSQL).
   - Real-Time WebSocket (broadcast via Socket.io / SSE dengan Redis Adapter).
   - Transactional Email (melalui background queue worker).
4. **Resilient Fallback**: Database PostgreSQL tetap menjadi *Single Source of Truth*. Jika koneksi WebSocket gagal atau terputus di sisi klien, antarmuka klien secara otomatis melakukan *HTTP long-polling fallback* tanpa kehilangan data.

## Konsekuensi
- Membutuhkan instance Redis yang selalu tersedia (High Availability).
- Memberikan latensi API < 100ms karena notifikasi diproses di latar belakang secara asinkron.
