# HRIS RESPONSIVE DESIGN & PROFESSIONAL UI SPECIFICATION
## Enterprise Human Resource Information System (HRIS)
**Roles:** Senior Responsive UI Engineer, Senior UI/UX Designer, Frontend Architect, Accessibility Specialist, QA Engineer, Design System Engineer  
**Version:** 1.0.0-Master-UI-Spec  
**Design Philosophy:** Responsive-First, Enterprise Professional, Usability-Driven, Accessible (WCAG 2.1 AA)  
**Status:** Awaiting Stakeholder Approval (NO IMPLEMENTATION CODE BEFORE APPROVAL)  

---

## DAFTAR ISI
1. [Filosofi Visual & Karakter Enterprise UI](#1-filosofi-visual--karakter-enterprise-ui)
2. [Responsive-First Design Strategy & Content Hierarchy](#2-responsive-first-design-strategy--content-hierarchy)
3. [Breakpoint Strategy & Viewport Targets](#3-breakpoint-strategy--viewport-targets)
4. [Desktop Layout Architecture (Admin & ESS)](#4-desktop-layout-architecture-admin--ess)
5. [Tablet Layout Architecture (Portrait & Landscape)](#5-tablet-layout-architecture-portrait--landscape)
6. [Mobile Layout Architecture (Phone & Phablet)](#6-mobile-layout-architecture-phone--phablet)
7. [Navigation Transformation Strategy](#7-navigation-transformation-strategy)
8. [Dashboard Responsive Strategy (Widgets & Metrics)](#8-dashboard-responsive-strategy-widgets--metrics)
9. [Data Table Responsive Strategy (5 Adaptive Patterns)](#9-data-table-responsive-strategy-5-adaptive-patterns)
10. [Form Responsive Strategy (Multi-Column to Stacked)](#10-form-responsive-strategy-multi-column-to-stacked)
11. [Modal, Dialog, Drawer & Bottom Sheet Strategy](#11-modal-dialog-drawer--bottom-sheet-strategy)
12. [Responsive Typography System & Modular Scale](#12-responsive-typography-system--modular-scale)
13. [Responsive Spacing & Fluid Grid Tokens](#13-responsive-spacing--fluid-grid-tokens)
14. [Touch Interaction, Hover-Free UI & Ergonomics](#14-touch-interaction-hover-free-ui--ergonomics)
15. [Accessibility (a11y) Strategy (WCAG 2.1 AA)](#15-accessibility-a11y-strategy-wcag-21-aa)
16. [Performance, Large Datasets & Virtualization](#16-performance-large-datasets--virtualization)
17. [Cross-Browser & Device Engine Compatibility](#17-cross-browser--device-engine-compatibility)
18. [Exhaustive Responsive QA Checklist](#18-exhaustive-responsive-qa-checklist)

---

## 1. FILOSOFI VISUAL & KARAKTER ENTERPRISE UI

Sistem ini adalah **Enterprise Human Resource Software**, bukan platform media sosial, game, crypto dashboard, ataupun aplikasi portofolio dekoratif. Setiap piksel harus melayani produktivitas, kejelasan informasi, dan kepercayaan pengguna (*trustworthiness*).

### 1.1. Brand Identity: NEXORA — Human Resource Solutions
- **Brand Name**: **NEXORA**
- **Tagline**: **Human Resource Solutions**
- **Pillar Values**: **Connect • Innovate • Grow**
- **Brand Mission**: *"NEXORA hadir untuk memberdayakan manusia dan memajukan setiap organisasi — Partner for a Better Workforce."*
- **Filosofi Bentuk & Logo**:
  - Huruf "N" berupa pita dinamis (*infinite ribbon loop*) melambangkan fleksibilitas manusia yang bergerak maju, saling terhubung, modern, dan membentuk masa depan yang lebih baik.
  - Gradasi Biru ke Ungu melambangkan teknologi cerdas, kepercayaan institusional, inovasi digital, dan potensi manusia.

### 1.2. Official NEXORA Color Tokens & Palette

#### A. Master Brand Palette
| Token Name | Hex Code | Makna Filosofis & Penggunaan Utama |
| :--- | :---: | :--- |
| **`color-primary-blue`** | **`#265AE3`** | **Kepercayaan, Stabilitas, Profesionalisme**: Tombol aksi utama, tab navigasi aktif, header aksen, dan identitas utama sistem. |
| **`color-secondary-blue`**| **`#3B82F6`** | **Inovasi, Kreativitas, Pertumbuhan**: Aksen sekunder, hover state, indikator progres, dan transisi gradasi. |
| **`color-accent-purple`** | **`#8B5CF6`** | **Kreativitas, Kolaborasi, Manusia**: Aksen interaktif, highlight fitur talent & performance, badge premium, ujung gradasi logo. |
| **`color-neutral-light`** | **`#F1F5F9`** | **Keseimbangan, Kejernihan, Keterbacaan**: Background canvas, surface card subtle, border pembatas, dan muted table header. |
| **`color-dark-navy`**     | **`#0F172A`** | **Otoritas & Ketegasan**: Teks utama (*Headline*), body text kontras tinggi, background dark mode, dan surface sidebar admin. |

#### B. Brand Gradient System
- **`gradient-nexora-primary`**:
  ```css
  background: linear-gradient(135deg, #265AE3 0%, #3B82F6 50%, #8B5CF6 100%);
  ```
  *Digunakan untuk: Logo mark "N", Hero highlight card, badge status promosi/prestasi, dan aksen navigasi terpilih.*
- **`gradient-nexora-surface`**:
  ```css
  background: linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%);
  ```

#### C. Tonal Scale (NEXORA Theme)
- **Primary Blue Scale (`#265AE3`)**:
  - `primary-50`: `#EFF6FF` (Highlight baris tabel & card hover)
  - `primary-100`: `#DBEAFE` (Badge background)
  - `primary-200`: `#BFDBFE`
  - `primary-500`: `#265AE3` (**Base Primary Blue**)
  - `primary-600`: `#1D4ED8` (Hover state tombol)
  - `primary-700`: `#1E40AF` (Active / pressed state)
  - `primary-900`: `#0F172A` (Deep navy)
- **Secondary Blue Scale (`#3B82F6`)**:
  - `secondary-500`: `#3B82F6` (Electric Sky Blue)
  - `secondary-600`: `#2563EB`
- **Accent Purple Scale (`#8B5CF6`)**:
  - `purple-50`: `#F5F3FF`
  - `purple-100`: `#EDE9FE`
  - `purple-500`: `#8B5CF6` (**Base Accent Purple**)
  - `purple-600`: `#7C3AED`

#### D. Semantic Status Tokens
- **`status-danger` / Destructive**: `#DC2626` (Red 600) | Background: `#FEF2F2` (Aksi hapus, cuti rejected, presensi absen/alpha).
- **`status-success`**: `#059669` (Emerald 600) | Background: `#ECFDF5` (Presensi hadir tepat waktu, cuti approved, slip gaji terbit).
- **`status-warning`**: `#D97706` (Amber 600) | Background: `#FFFBEB` (Pending approval, toleransi keterlambatan).
- **`status-info`**: `#0284C7` (Sky 600) | Background: `#F0F9FF` (Pengumuman SOP, info tooltip).

#### E. Tipografi Resmi: `Inter` (Sans Serif Modern)
- **Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headline**: Inter Bold (700) / SemiBold (600) — Warna `#0F172A`.
- **Body**: Inter Regular (400) / Medium (500) — Warna `#0F172A` / `#475569`.
- **Label & Caption**: Inter Medium (500) dengan letter-spacing `0.02em`.

#### F. Variasi Logo Resmi (Logo Variants)
1. **Logo Utama (Latar Terang)**: Ikon pita "N" gradasi biru-ungu + Wordmark "NEXORA" warna `#0F172A` + Subtitle "HUMAN RESOURCE SOLUTIONS" warna `#475569`.
2. **Logo Utama (Latar Gelap)**: Ikon pita "N" gradasi biru-ungu + Wordmark "NEXORA" warna `#FFFFFF` + Subtitle warna `#94A3B8`.
3. **Ikon Aplikasi (App Icon)**: Squircle rounded Dark Navy (`#0F172A`) dengan lambang pita "N" terpusat di tengah.
4. **Logo Monokrom (Hitam/Putih)**: Digunakan untuk cetakan dokumen fisik, formulir resmi hitam-putih, atau watermark slip gaji PDF.



---

## 2. RESPONSIVE-FIRST DESIGN STRATEGY & CONTENT HIERARCHY

Pengembangan antarmuka mematuhi alur **Responsive-First**, bukan "Desktop dipaksa diperkecil":

```
[1. Content & Action Hierarchy]
  ├── Primary   : Tindakan kritis (Clock-in, Submit Cuti, Review Approval)
  ├── Secondary : Konteks pendukung (Sisa kuota, status rekan kerja, kalender)
  └── Tertiary  : Detail historis, logs audit, metadata ekspor
       ↓
[2. Mobile Layout (320px - 639px)]   -> Single-column, stacked, bottom actions, bottom sheets
       ↓
[3. Tablet Layout (640px - 1023px)]  -> 2-column adaptive grid, collapsible sidebar, adaptive tables
       ↓
[4. Desktop Layout (1024px - 1535px)]-> Full persistent sidebar, multi-column cards, advanced tables
       ↓
[5. Large Desktop (≥ 1536px)]        -> Max-width bounded container (1600px) mencegah visual fatigue
```

---

## 3. BREAKPOINT STRATEGY & VIEWPORT TARGETS

Desain tidak dikunci pada merek perangkat fisik tertentu, melainkan menggunakan kontinum breakpoint berbasis perilaku konten:

| Breakpoint Tag | Rentang Viewport | Target Perangkat Tipikal | Karakteristik Layout Utama |
| :--- | :--- | :--- | :--- |
| **`xs` (Compact Mobile)** | `320px - 374px` | iPhone SE, Galaxy A series lama | Single-column rapat, font modular compact, padding 12px, zero horizontal overflow. |
| **`sm` (Standard Mobile)** | `375px - 639px` | iPhone 14/15, Galaxy S23, Pixel | Single-column standar, bottom bar nav (ESS), touch target 48px, drawer admin. |
| **`md` (Large Mobile/Phablet)**| `640px - 767px` | iPad Mini portrait, Foldables unfolded| Transisi 1 ke 2 kolom untuk KPI cards, form 2-kolom opsional. |
| **`lg` (Tablet Portrait)** | `768px - 1023px` | iPad 10.2", Galaxy Tab S portrait | Sidebar ikonik (collapsed), grid 2-kolom, horizontal scrollable tables. |
| **`xl` (Laptop / Small Desktop)**| `1024px - 1279px`| MacBook Air 13", ThinkPad 14" | Full persistent sidebar (260px), multi-column dashboard, full datatable. |
| **`2xl` (Standard Desktop)** | `1280px - 1535px`| Desktop Monitor 24", iMac | Full layout, expandable drawer filters, data table 10+ kolom. |
| **`3xl` (Large Display)** | `≥ 1536px` | Monitor 27"+, 4K Ultrawide | `max-width: 1600px` centered container, margin auto (mencegah teks membentang tak terbatas). |

---

## 4. DESKTOP LAYOUT ARCHITECTURE (ADMIN & ESS)

### 4.1. Admin / HR Portal Desktop
```
+---------------------------------------------------------------------------------------------------+
| TOP BAR (Height: 64px, Sticky, z-index: 40)                                                       |
| [Logo + Org Selector]        [Global Search: Cmd+K]          [Notifications] [Role Switch] [User] |
+------------------------+--------------------------------------------------------------------------+
| SIDEBAR (Width: 260px) | MAIN CONTENT AREA (Fluid width, Max-width: 1600px, Padding: 24px/32px)   |
| Sticky / Fixed         |                                                                          |
| - Dashboard            | Page Header: [Page Title + Breadcrumbs]           [Primary Actions (CTA)]|
| - Employee Core        +--------------------------------------------------------------------------+
| - Attendance           | Metric / KPI Cards Row (Grid 4-columns)                                  |
| - Leave & Permission   +--------------------------------------------------------------------------+
| - Payroll              | Main Workspace: Data Table with Filters / Forms / Visualizations         |
| - Settings             |                                                                          |
| [Collapse Button]      |                                                                          |
+------------------------+--------------------------------------------------------------------------+
```
- **Karakteristik**:
  - Sidebar persisten selebar `260px` dengan kemampuan diperkecil (*collapse*) menjadi `72px` (hanya menampilkan ikon dengan tooltip instan).
  - Main Content dibatasi `max-width: 1600px` untuk menjaga jarak pandang mata ergonomis (*ergonomic eye tracking*).
  - Header halaman konsisten: Breadcrumbs navigasi di kiri atas, tombol aksi utama (*Call to Action*) selalu di kanan atas.

### 4.2. Employee Self-Service (ESS) Desktop
- Layout terpusat (*Centered App Canvas*) dengan lebar optimal `1200px` untuk kenyamanan navigasi mandiri, menampilkan kartu profil ringkas, tombol cepat presensi hari ini, dan rekap sisa cuti.

---

## 5. TABLET LAYOUT ARCHITECTURE (PORTRAIT & LANDSCAPE)

### 5.1. Tablet Landscape (`1024px` atau orientasi horizontal)
- Sidebar otomatis masuk ke mode **Compact Icon Bar** (`72px`) untuk memberikan ruang maksimal bagi tabel presensi dan approval.
- Topbar tetap mempertahankan pencarian dan notifikasi.
- Grid Dashboard bertransisi dari 4 kolom menjadi 2 baris x 2 kolom.

### 5.2. Tablet Portrait (`768px - 834px`)
- Sidebar disembunyikan secara default, dapat dibuka sebagai **Slide-Over Drawer** dengan tombol hamburger di topbar.
- Formulir bertransisi dari 3 kolom menjadi 2 kolom.
- Tombol aksi massal (*Bulk Actions*) pada tabel data bertransisi dari teks panjang menjadi tombol ikonik dengan label ringkas.

---

## 6. MOBILE LAYOUT ARCHITECTURE (PHONE & PHABLET)

Mobile diperlakukan sebagai **First-Class Citizen**, bukan sekadar desktop yang di-scale down:

```
+-------------------------------------------------------------------+
| MOBILE TOP BAR (Height: 56px, Sticky)                             |
| [Menu / Back]          [Screen Title / Context]     [Notif Badge] |
+-------------------------------------------------------------------+
| SCROLLABLE MAIN CONTENT (Padding: 16px, Zero Horizontal Scroll)   |
|                                                                   |
| [Personal Greeting & Attendance Quick Card]                       |
| - Status: Belum Masuk                                             |
| - [ TOMBOL BESAR CLOCK-IN GPS (Height: 52px, Touch Friendly) ]    |
|                                                                   |
| [Statistik Prioritas: Sisa Cuti (10 Hari) | Lembur (4 Jam)]       |
|                                                                   |
| [Aktivitas / Notifikasi Terkini (List Card Representation)]       |
|                                                                   |
+-------------------------------------------------------------------+
| BOTTOM NAVIGATION BAR (Height: 64px, Fixed Bottom, ESS Portal)    |
| [Home]        [Presensi]        [Cuti]        [Gaji]      [Profil]|
+-------------------------------------------------------------------+
```
- **Prinsip Mobile Utama**:
  - Tombol aksi utama (misal: *Clock-In GPS*, *Ajukan Cuti*) selalu berada di **Thumb Zone** (area yang mudah dijangkau satu jempol tangan tanpa meregang).
  - Portal ESS menggunakan **Bottom Navigation Bar** setinggi `64px` dengan indikator aktif yang sangat kontras.
  - Portal Admin pada mobile menggunakan **Off-Canvas Navigation Drawer** dengan backdrop redup (*semi-transparent scrim*) yang dapat ditutup dengan sekali tap atau gesture swipe.

---

## 7. NAVIGATION TRANSFORMATION STRATEGY

| Viewport | Tipe Navigasi Admin Panel | Tipe Navigasi ESS Portal | Perilaku Saat Resize |
| :--- | :--- | :--- | :--- |
| **Desktop (`≥ 1024px`)** | Persistent Sidebar (260px atau 72px collapsed) | Top Bar Navigation terstruktur | Transisi lebar mulus (CSS transition: width 200ms ease) |
| **Tablet (`768px - 1023px`)**| Off-canvas Drawer via Hamburger / Mini Icon Bar | Header Bar + Collapsible Menu | Menutup otomatis saat link diklik |
| **Mobile (`< 768px`)** | Full Drawer Menu dengan header user profil | **Bottom Navigation Bar** (5 tab utama) | Drawer bergeser dari kiri, backdrop lock body scroll |

- **Focus Management**: Ketika mobile drawer terbuka, fokus keyboard langsung berpindah ke tombol tutup (*Close button*), dan tombol `ESC` otomatis menutup navigasi.

---

## 8. DASHBOARD RESPONSIVE STRATEGY (WIDGETS & METRICS)

### 8.1. Perilaku Grid Metrik KPI
- **Desktop (`≥ 1280px`)**: 4 Kolom (`grid-template-columns: repeat(4, 1fr)`).
- **Tablet (`768px - 1279px`)**: 2 Kolom (`grid-template-columns: repeat(2, 1fr)`).
- **Mobile (`< 768px`)**: 1 Kolom Stacked (`grid-template-columns: 1fr`).
- **Mobile Compact (`< 360px`)**: Padding internal kartu berkurang dari 16px menjadi 12px; ukuran angka metrik turun dari `2rem` menjadi `1.5rem` agar tidak terpotong (*no text overflow*).

### 8.2. Hirarki Informasi Mobile Dashboard:
1. *Urutan 1 (Critical)*: Status Presensi Hari Ini & Tombol Aksi Langsung.
2. *Urutan 2 (Actionable)*: Pending Approvals (Untuk Manajer) atau Status Pengajuan (Untuk Karyawan).
3. *Urutan 3 (Informational)*: Sisa Kuota Cuti & Ringkasan Jam Kerja.
4. *Urutan 4 (Secondary)*: Grafik tren kehadiran (dialihkan ke format ringkasan persentase atau mini sparkline horizontal).

---

## 9. DATA TABLE RESPONSIVE STRATEGY (5 ADAPTIVE PATTERNS)

Data table adalah komponen paling krusial di HRIS. Dilarang mengecilkan ukuran teks tabel hingga tidak terbaca. Digunakan 5 pola adaptif berdasarkan kompleksitas data:

```
DESKTOP (Wide Viewport)
+------------+-------------+-------------+------------+------------+---------+
| NIK        | Nama        | Departemen  | Status     | Join Date  | Aksi    |
+------------+-------------+-------------+------------+------------+---------+
| EMP-001    | Jane Doe    | Engineering | PERMANENT  | 2024-01-15 | [Edit]  |
+------------+-------------+-------------+------------+------------+---------+

MOBILE PATTERN C: CARD / LIST REPRESENTATION
+-----------------------------------------------------------+
| Jane Doe                           [ Badge: PERMANENT ]   |
| EMP-001 • Engineering                                     |
| Join: 15 Jan 2024                                         |
|                                                           |
| [ Tombol: Lihat Profil ]           [ Menu Aksi: ••• ]     |
+-----------------------------------------------------------+
```

### 5 Pola Tabel Adaptif:
1. **Pattern A: Priority Columns with Horizontal Scroll Container**:
   - Kolom Nama/NIK dibekukan (*Sticky First Column*).
   - Kolom sekunder dapat digeser secara horizontal dengan indikator bayangan halus (*shadow cues*) di batas kanan kontainer tabel.
2. **Pattern B: Card/List Transformation (Direkomendasikan untuk ESS)**:
   - Pada layar `< 768px`, tag `<table>` otomatis ditransformasi via CSS/Komponen menjadi susunan kartu daftar (*Stacked Cards*).
   - Menampilkan data esensial: Avatar, Nama, Status Badge, dan 1 tombol aksi utama.
3. **Pattern C: Expandable Row (Accordion Table)**:
   - Baris tabel pada layar tablet/mobile menampilkan chevron ekspansi `[+]`.
   - Mengklik baris akan membuka detail tersembunyi (No Rekening, NPWP, Riwayat Tanggal) langsung di bawah baris tanpa berpindah halaman.
4. **Pattern D: Column Toggle Picker**:
   - Pengguna Admin dapat mencentang/memilih kolom mana yang ingin ditampilkan pada layar yang lebih sempit melalui dropdown filter kolom.
5. **Pattern E: Dedicated Mobile Detail Page**:
   - Klik kartu daftar di mobile langsung membuka halaman detail karyawan yang terstruktur rapi per tab (Personal, Kepegawaian, Gaji).

---

## 10. FORM RESPONSIVE STRATEGY (MULTI-COLUMN TO STACKED)

```
DESKTOP FORM (Multi-Column Grid)
+-----------------------------------+-----------------------------------+
| First Name *                      | Last Name                         |
| [ Input Box                     ] | [ Input Box                     ] |
+-----------------------------------+-----------------------------------+
| Email Perusahaan *                | Nomor WhatsApp / HP *             |
| [ Input Box                     ] | [ Input Box                     ] |
+-----------------------------------+-----------------------------------+

MOBILE FORM (Single-Column Strict Stack)
+-----------------------------------------------------------------------+
| First Name *                                                          |
| [ Input Box - Height 44px                                           ] |
|                                                                       |
| Last Name                                                             |
| [ Input Box - Height 44px                                           ] |
|                                                                       |
| Email Perusahaan *                                                    |
| [ Input Box - Height 44px                                           ] |
+-----------------------------------------------------------------------+
```

### Aturan Formulir Responsif:
1. **Transisi Kolom**:
   - Desktop: 2 atau 3 kolom (`grid-cols-2` / `grid-cols-3`, gap: `20px`).
   - Tablet: 2 kolom (`grid-cols-2`, gap: `16px`).
   - Mobile: **1 kolom mutlak** (`grid-cols-1`, gap: `16px`). Dilarang membagi field input menjadi 2 kolom di layar `< 640px`.
2. **Field Labeling**:
   - Label selalu berada di **atas input** (*Top-aligned labels*), bukan di samping kiri input, untuk menjamin keterbacaan konsisten di semua layar.
   - Indikator wajib tanda bintang merah `*` jelas terbaca.
3. **Sticky Form Action Bar pada Mobile**:
   - Pada mobile, tombol [Batal] dan [Simpan] ditempatkan pada bar bawah yang menempel (*Sticky Bottom Bar*) sehingga pengguna tidak perlu menggulir ke paling bawah dokumen panjang untuk melakukan submit.

---

## 11. MODAL, DIALOG, DRAWER & BOTTOM SHEET STRATEGY

Komponen overlay menyesuaikan tipe interaksi perangkat:

```
DESKTOP: CENTERED MODAL               MOBILE: BOTTOM SHEET
+-----------------------------+       +-----------------------------+
| Modal Title             [X] |       | === HANDLE BAR ===          |
|                             |       | Sheet Title             [X] |
| Content area with scroll... |       |                             |
|                             |       | Content scrollable...       |
| [Batal]            [Simpan] |       |                             |
+-----------------------------+       | [ SIMPAN AKSI (Full Width)] |
                                      +-----------------------------+
```

1. **Desktop (`≥ 1024px`)**:
   - Centered Modal dengan lebar terdefinisi: `sm` (400px), `md` (540px), `lg` (720px), `xl` (960px).
   - Maksimal tinggi: `calc(100vh - 80px)` dengan internal scroll pada kontainer body modal.
2. **Tablet (`768px - 1023px`)**:
   - Centered Dialog dengan margin aman minimal 32px dari sisi layar (`max-width: calc(100vw - 64px)`).
3. **Mobile (`< 768px`)**:
   - Modal bertransformasi menjadi **Bottom Sheet** dengan drag handle bar di atas.
   - Untuk formulir kompleks, bertransformasi menjadi **Full-Screen Dialog** lengkap dengan tombol tutup kembali (*Back/Close icon*) di kiri atas.
   - Mencegah *backdrop scroll leak* (`body { overflow: hidden; }` saat modal aktif).

---

## 12. RESPONSIVE TYPOGRAPHY SYSTEM & MODULAR SCALE

Menggunakan skala tipe modular berbasis unit `rem` dengan pemanfaatan formula **CSS `clamp()`** untuk pertumbuhan fluid tanpa lompatan kasar:

| Level Tipografi | Ukuran Desktop (`≥ 1024px`) | Ukuran Tablet (`768px - 1023px`) | Ukuran Mobile (`< 768px`) | Line Height | Font Weight |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Display Title** | `2.25rem` (36px) | `2.00rem` (32px) | `1.75rem` (28px) | 1.2 | Bold (700) |
| **Page Heading (H1)**| `1.75rem` (28px) | `1.50rem` (24px) | `1.375rem` (22px)| 1.25 | SemiBold (600) |
| **Section Title (H2)**| `1.375rem` (22px)| `1.25rem` (20px) | `1.125rem` (18px)| 1.3 | SemiBold (600) |
| **Card Title (H3)** | `1.125rem` (18px)| `1.05rem` (17px) | `1.00rem` (16px) | 1.4 | Medium (500) |
| **Body Standard** | `0.9375rem` (15px)| `0.9375rem` (15px)| `0.875rem` (14px)| 1.5 | Regular (400) |
| **Body Small** | `0.875rem` (14px)| `0.875rem` (14px)| `0.8125rem` (13px)| 1.5 | Regular (400) |
| **Caption / Badge** | `0.75rem` (12px) | `0.75rem` (12px) | `0.75rem` (12px) | 1.4 | Medium (500) |

- **Penanganan Teks Panjang**:
  - Judul kolom tabel atau nama karyawan yang panjang menerapkan `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;` dengan atribut native `title="..."` agar teks lengkap tetap dapat dibaca via tap/hover.

---

## 13. RESPONSIVE SPACING & FLUID GRID TOKENS

Menggunakan sistem kelipatan 4px / 8px (*8-point Grid Standard*):

| Token Spacing | Nilai Numerik | Penggunaan Desktop | Penggunaan Mobile |
| :--- | :---: | :--- | :--- |
| **`space-1`** | `4px` | Jarak mikro antar ikon dan badge label | Jarak mikro |
| **`space-2`** | `8px` | Jarak antar item ringkas / button gap | Jarak antar item ringkas |
| **`space-3`** | `12px` | Padding input compact | Padding kontainer mobile compact (320px) |
| **`space-4`** | `16px` | Gap standar flexbox | **Padding horizontal layar mobile default** |
| **`space-6`** | `24px` | Padding internal kartu desktop | Margin vertikal antar-seksi mobile |
| **`space-8`** | `32px` | **Padding halaman desktop default** | - |
| **`space-12`**| `48px` | Margin antar-seksi halaman desktop | - |

---

## 14. TOUCH INTERACTION, HOVER-FREE UI & ERGONOMICS

1. **Touch Target Size Standar**:
   - Seluruh elemen interaktif (tombol, input, checkbox, tab, baris navigasi) wajib memiliki area sentuh minimal **`44px x 44px`** (sesuai panduan Apple HIG & Google Material).
   - Jarak renggang minimal antar dua tombol interaktif adalah `8px` untuk mencegah salah klik (*fat-finger error*).
2. **Hover-Free Architecture**:
   - **Dilarang keras menyembunyikan informasi atau aksi kritis di balik interaksi hover**.
   - Setiap aksi (Edit, Hapus, Detail) pada mobile wajib memiliki representasi visual tetap (tombol terlihat atau menu aksi 3-titik `•••` yang membuka action sheet saat di-tap).
3. **Pemisahan Destructive Action**:
   - Tombol "Hapus Karyawan" atau "Tolak Cuti" dipisahkan jaraknya dari tombol "Simpan" atau "Setujui" untuk menghindari kesalahan fatal sentuhan pada layar sentuh.

---

## 15. ACCESSIBILITY (a11y) STRATEGY (WCAG 2.1 AA)

1. **Kontras Warna**:
   - Seluruh teks reguler wajib memiliki rasio kontras minimal **4.5:1** terhadap latar belakangnya.
   - Teks besar (≥ 18pt / 24px) wajib memiliki rasio kontras minimal **3.0:1**.
2. **Keyboard Navigation & Focus Indicator**:
   - Seluruh elemen dapat dijelajahi menggunakan tombol `Tab`, `Shift+Tab`, `Enter`, dan `Space`.
   - Indikator fokus aktif (*Focus Ring*) wajib terlihat jelas (`outline: 2px solid #2563eb; outline-offset: 2px`).
3. **Screen Reader Support (ARIA)**:
   - Tombol ikon murni wajib menyertakan label aksesibel (contoh: `<button aria-label="Tutup Dialog">`).
   - Elemen interaktif dropdown dan modal menyertakan `aria-expanded`, `aria-haspopup`, dan `role="dialog"`.
4. **Reduced Motion**:
   - Menghormati preferensi pengguna sistem operasi:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, *::before, *::after {
         animation-duration: 0.01ms !important;
         transition-duration: 0.01ms !important;
       }
     }
     ```

---

## 16. PERFORMANCE, LARGE DATASETS & VIRTUALIZATION

1. **Data Virtualization (10.000+ Karyawan)**:
   - Tabel master karyawan dan log absensi menerapkan *Virtual Scrolling* (menggunakan TanStack Virtual) sehingga browser hanya me-render 20-30 baris DOM yang terlihat di layar, menjaga memory footprint tetap rendah pada smartphone Android entry-level.
2. **Optimasi Asset & Gambar**:
   - Seluruh foto profil dikonversi ke format WebP terkompresi dengan responsive `srcset` (1x, 2x, thumbnail 48px, avatar 96px).
   - Lazy loading native (`loading="lazy"`) diaktifkan untuk seluruh gambar di luar viewport.
3. **Debounced Search Input**:
   - Kolom pencarian karyawan menerapkan *debounce* 300ms untuk mencegah lonjakan request API saat pengguna mengetik cepat.

---

## 17. CROSS-BROWSER & DEVICE ENGINE COMPATIBILITY

1. **Dukungan Mesin Browser**:
   - **Blink Engine**: Google Chrome, Microsoft Edge, Opera (Desktop & Mobile).
   - **Gecko Engine**: Mozilla Firefox (Desktop & Android).
   - **WebKit Engine**: Apple Safari (macOS & iOS).
2. **CSS Fallbacks**:
   - Penggunaan CSS Grid modern dengan fallback Flexbox untuk browser lama.
   - Penggunaan CSS Variables dengan nilai default aman.
   - Menangani issue viewport mobile Safari iOS (*100vh dynamic issue*) menggunakan `100dvh` (*Dynamic Viewport Height*).

---

## 18. EXHAUSTIVE RESPONSIVE QA CHECKLIST

Setiap halaman dan modul **WAJIB LULUS 100%** pada 9 resolusi uji berikut sebelum dinyatakan rilis:

| Resolusi Uji | Kategori Perangkat | Checklist Verifikasi Khusus |
| :---: | :--- | :--- |
| **`320px`** | Very Small Mobile (iPhone SE 1st gen) | Zero horizontal page scroll, teks tidak terpotong, tombol clock-in muat utuh. |
| **`375px`** | Compact Mobile (iPhone SE 2nd gen) | Bottom bar pas, form single-column rapat namun nyaman. |
| **`390px`** | Modern Phone (iPhone 14/15/16) | Standard mobile reference, touch target > 44px, bottom sheet lancar. |
| **`430px`** | Large Phone / Max (iPhone Pro Max) | Konten memanfaatkan lebar tanpa stretched text aneh. |
| **`768px`** | Tablet Portrait (iPad Mini/Air) | Sidebar ter-collapse / drawer aktif, KPI grid 2-kolom, modal fit. |
| **`1024px`**| Tablet Landscape / Small Laptop | Sidebar compact / persistent, tabel mulai menampilkan 6-8 kolom. |
| **`1280px`**| Standard Laptop (13-14 inch) | Full sidebar (260px), datatable full columns, split screens. |
| **`1440px`**| Desktop Standard (24 inch FHD) | Optimal dashboard experience, filter drawers inline. |
| **`1920px`**| Large Desktop Display (QHD/4K) | Max-width container 1600px aktif terpusat, no visual sprawling. |

### 18 Kriteria Lulus Per Halaman:
- [ ] `[ ]` 1. Zero horizontal page overflow (Tidak ada scrolling horizontal di level body halaman).
- [ ] `[ ]` 2. Zero clipped content (Tidak ada teks atau angka terpotong tanpa indikator ellipsis/tooltip).
- [ ] `[ ]` 3. Zero overlapping elements (Tidak ada elemen yang bertumpuk secara tidak sengaja).
- [ ] `[ ]` 4. Modal/Dialog responsif (Menjadi bottom sheet di mobile, centered dialog di desktop).
- [ ] `[ ]` 5. Data table responsif (Menerapkan salah satu dari 5 pola adaptif: card/scroll/expandable).
- [ ] `[ ]` 6. Form input single-column di mobile dan multi-column di desktop.
- [ ] `[ ]` 7. Seluruh teks terbaca jelas (Minimal 12px untuk caption, 14px untuk body).
- [ ] `[ ]` 8. Aksi penting mudah diakses (Berada di thumb zone pada mobile).
- [ ] `[ ]` 9. Navigasi berfungsi mulus (Bottom bar di ESS mobile, drawer di Admin mobile).
- [ ] `[ ]` 10. Tidak ada whitespace berlebih (*No excessive whitespace*).
- [ ] `[ ]` 11. Tidak ada konten yang terlalu padat (*No cramped content*).
- [ ] `[ ]` 12. Tidak ada informasi penting yang hilang tanpa alternatif akses.
- [ ] `[ ]` 13. Area sentuh interaktif memenuhi standar minimal 44x44px.
- [ ] `[ ]` 14. Navigasi keyboard (Tab, Enter, ESC) berfungsi penuh dengan focus ring terlihat.
- [ ] `[ ]` 15. Loading skeleton state tampil rapi dan responsif.
- [ ] `[ ]` 16. Empty state informatif dengan ilustrasi vektor ringan dan tombol ajakan aksi.
- [ ] `[ ]` 17. Error state menampilkan pesan validasi manusiawi di bawah input field terkait.
- [ ] `[ ]` 18. Perubahan orientasi (Portrait <-> Landscape) tidak merusak layout.
