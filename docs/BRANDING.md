# NEXORA — BRAND IDENTITY & DESIGN GUIDELINES
## Human Resource Solutions
**Tagline:** Human Resource Solutions  
**Pillars:** CONNECT • INNOVATE • GROW  
**Mission:** *"NEXORA hadir untuk memberdayakan manusia dan memajukan setiap organisasi — Partner for a Better Workforce."*  
**Version:** 1.0.0-Official  

---

## 1. MAKNA & FILOSOFI LOGO
1. **Huruf "N" / Identitas NEXORA**:
   - Bentuk huruf "N" pada logo merepresentasikan identitas NEXORA sebagai brand yang kuat, profesional, dan mudah dikenali.
   - Bentuk huruf "N" yang fleksibel berupa pita dinamis berputar (*dynamic ribbon loop*) menggambarkan manusia yang bergerak maju, saling terhubung, dan membentuk masa depan yang lebih baik.
2. **Gradien Biru – Ungu**:
   - Gradasi warna melambangkan identitas modern, digital, inovatif, dan penuh potensi.

---

## 2. PALET WARNA RESMI (OFFICIAL COLOR CODES)

```
+---------------------------------------------------------------------------------------------------+
|                                 NEXORA OFFICIAL COLOR PALETTE                                     |
+---------------------+-------------+---------------------------------------------------------------+
| Nama Warna          | Hex Code    | Makna Filosofis & Penggunaan                                  |
+---------------------+-------------+---------------------------------------------------------------+
| Primary Blue        | #265AE3     | Kepercayaan, Stabilitas, Profesionalisme                      |
|                     |             | -> Tombol utama (Primary Button), active state, navbar aksen  |
+---------------------+-------------+---------------------------------------------------------------+
| Secondary Blue      | #3B82F6     | Inovasi, Kreativitas, Pertumbuhan                             |
|                     |             | -> Elemen interaktif sekunder, badge status, hover effect     |
+---------------------+-------------+---------------------------------------------------------------+
| Accent Purple       | #8B5CF6     | Kreativitas, Kolaborasi, Manusia                              |
|                     |             | -> Aksen gradasi, highlight modul talent & review, premium    |
+---------------------+-------------+---------------------------------------------------------------+
| Neutral             | #F1F5F9     | Keseimbangan, Kejernihan, Keterbacaan                         |
|                     |             | -> Background canvas halaman, border pembatas, cards surface  |
+---------------------+-------------+---------------------------------------------------------------+
| Dark Navy (Text)    | #0F172A     | Otoritas, Kontras Tinggi, Ketegasan                           |
|                     |             | -> Teks Headline (H1-H3), body text, dark mode canvas         |
+---------------------+-------------+---------------------------------------------------------------+
```

### CSS Gradient Syntax:
```css
/* Primary Brand Gradient */
--gradient-nexora: linear-gradient(135deg, #265AE3 0%, #3B82F6 50%, #8B5CF6 100%);

/* Dark Surface Gradient */
--gradient-dark: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
```

---

## 3. TIPOGRAFI RESMI: `INTER`
- **Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Karakter**: Bersih, sangat terbaca di layar gawai kecil maupun monitor besar, geometris, modern.
- **Hierarki Font Weight**:
  - `Bold (700)`: Wordmark NEXORA, Display Title.
  - `SemiBold (600)`: Page Heading (H1), Section Heading (H2).
  - `Medium (500)`: Card Titles, Button Text, Input Labels, Navigation Tabs.
  - `Regular (400)`: Body Text, Paragraph, Table Cell Content.

---

## 4. VARIASI LOGO RESMI
1. **Logo Utama (Latar Terang)**:
   - Digunakan pada: Navbar atas portal Admin/ESS, header dokumen PDF slip gaji, email notifikasi formal.
   - Komposisi: Ikon pita "N" gradasi + Teks "NEXORA" Dark Navy (`#0F172A`) + Subtitle "HUMAN RESOURCE SOLUTIONS" Slate (`#475569`).
2. **Logo Utama (Latar Gelap)**:
   - Digunakan pada: Halaman login, sidebar dark mode, splash screen aplikasi mobile.
   - Komposisi: Ikon pita "N" gradasi + Teks "NEXORA" Putih (`#FFFFFF`) + Subtitle Slate Light (`#94A3B8`).
3. **Ikon Aplikasi (App Icon / Favicon)**:
   - Squircle background Dark Navy (`#0F172A`) dengan lambang pita "N" terpusat.
4. **Logo Monokrom (Hitam/Putih)**:
   - Digunakan pada stempel fisik atau cetakan faktur/laporan monokrom hitam putih.

---

## 5. VECTOR SVG DEFINITION (READY FOR FRONTEND)

Frontend Next.js dapat langsung menggunakan komponen SVG ini untuk rendering logo tajam tanpa pecah di layar retina 4K:

```tsx
export function NexoraLogo({ variant = 'light', className = 'h-9 w-auto' }: { variant?: 'light' | 'dark', className?: string }) {
  const isDark = variant === 'dark';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dynamic Ribbon "N" Symbol */}
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <defs>
          <linearGradient id="nexoraRibbonGrad" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#265AE3" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        {/* Ribbon Loop Path */}
        <path
          d="M20 75C15 65 15 35 25 25C35 15 50 30 50 50C50 70 65 85 75 75C85 65 85 35 80 25C78 20 72 20 70 25C65 35 65 65 55 75C45 85 30 70 30 50C30 30 15 15 25 25"
          stroke="url(#nexoraRibbonGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Wordmark Typography */}
      <div className="flex flex-col">
        <span className={`font-bold tracking-wider text-xl leading-none font-['Inter'] ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          NEXOR<span className="inline-block transform tracking-tighter">Λ</span>
        </span>
        <span className={`text-[8px] font-medium tracking-[0.25em] uppercase mt-1 font-['Inter'] ${isDark ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
          Human Resource Solutions
        </span>
      </div>
    </div>
  );
}
```
