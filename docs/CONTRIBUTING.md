# CONTRIBUTING GUIDELINES
## Human Resource Information System (HRIS)

Terima kasih atas kontribusi Anda pada pengembangan Sistem HRIS Enterprise ini. Untuk memastikan kualitas kode, arsitektur, dan keamanan tetap terjaga dalam jangka panjang (1-3+ tahun), semua kontributor wajib mematuhi pedoman di bawah ini.

---

## 1. Golden Rules of Development
1. **Never Bypass Domain Logic**: Jangan pernah menulis logika bisnis langsung di controller atau file router. Gunakan Application Service / Use Case.
2. **Never Query Across Bounded Contexts Directly**: Modul *Leave* tidak boleh menjalankan query langsung ke tabel *Payroll* atau *Recruitment*. Gunakan internal Domain Events atau Module Contracts.
3. **Database Migrations Are Mandatory**: Jangan pernah memodifikasi tabel, kolom, indeks, atau constraint secara manual di database. Selalu buat file migration baru.
4. **Zero Secrets in Code**: Jangan pernah meletakkan API keys, JWT secrets, password, atau credential apa pun dalam source code. Gunakan `.env`.
5. **No Features Without Tests**: Setiap use-case baru wajib memiliki Unit Test dan Integration Test.

---

## 2. Branching & Commit Conventions
- Format branch:
  - `feature/<module>-<short-description>` (contoh: `feature/leave-half-day-request`)
  - `bugfix/<module>-<short-description>` (contoh: `bugfix/payroll-ter-calculation`)
  - `hotfix/<short-description>`
- Format commit: Mematuhi **Conventional Commits**:
  - `feat(module): description`
  - `fix(module): description`
  - `docs(topic): description`
  - `test(module): description`
  - `refactor(module): description`

---

## 3. Pull Request (PR) Checklist & Quality Gate
Sebelum mengajukan Pull Request, pastikan:
- [ ] Linter & formatter lulus (`npm run lint`, `npm run format:check`).
- [ ] Kompilasi TypeScript lulus tanpa peringatan atau `any` yang tidak perlu (`npm run typecheck`).
- [ ] Seluruh Unit & Integration Test lulus 100% (`npm test`).
- [ ] Dokumentasi API / Swagger diperbarui jika ada perubahan endpoint atau DTO.
- [ ] Migration file dan rollback script telah diverifikasi.
- [ ] Tidak ada log `console.log` liar atau data sensitif yang ter-expose.
