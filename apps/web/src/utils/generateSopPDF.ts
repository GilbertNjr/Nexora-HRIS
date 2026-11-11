/**
 * Official SOP Kepegawaian & PKB PDF Generator (Pure PDF 1.4)
 * Generates an official, valid downloadable PDF file client-side
 * without external binary dependencies.
 */

function escapePdfText(str: string): string {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '-');
}

export function generateSopPDFBuffer(employeeName = 'Karyawan Nexora', employeeNumber = 'NX-ESS'): Uint8Array {
  const objects: { num: number; content: string }[] = [];

  function addObject(content: string): number {
    const objNum = objects.length + 1;
    objects.push({ num: objNum, content });
    return objNum;
  }

  addObject('<< /Type /Catalog /Pages 2 0 R >>');
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>'
  );
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  let stream = '';

  const rect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
    stream += `${r} ${g} ${b} rg\n${x} ${y} ${w} ${h} re f\n`;
  };

  const text = (
    txt: string,
    x: number,
    y: number,
    font: 'F1' | 'F2' = 'F1',
    size = 10,
    r = 0.06,
    g = 0.09,
    b = 0.16
  ) => {
    stream += `BT\n/${font} ${size} Tf\n${r} ${g} ${b} rg\n1 0 0 1 ${x} ${y} Tm\n(${escapePdfText(txt)}) Tj\nET\n`;
  };

  // Top Header Band
  rect(0, 745, 595.28, 96.89, 0.06, 0.09, 0.16);
  rect(0, 741, 595.28, 4, 0.15, 0.39, 0.92);

  text('NEXORA ENTERPRISE HRIS', 40, 804, 'F2', 17, 1, 1, 1);
  text('PT Nexora Teknologi Nusantara Tbk - SCBD Jakarta Selatan', 40, 787, 'F1', 9, 0.78, 0.84, 0.94);
  text('BUKU PANDUAN SOP KEPEGAWAIAN & PKB RESMI (2024 - 2026)', 40, 762, 'F2', 11, 0.38, 0.65, 0.98);

  // Content Sections
  let y = 705;
  const sections: { title: string; items: string[] }[] = [
    {
      title: 'BAB I - PRESENSI BIOMETRIK, GEOFENCING & KOREKSI ABSEN',
      items: [
        '1. Jam kerja inti (Core Hours) berlangsung pukul 08:30 - 16:30 WIB dengan toleransi shift reguler.',
        '2. Presensi WFO wajib berada dalam radius geofence resmi SCBD menggunakan validasi liveness.',
        '3. Dispensasi pengajuan koreksi lupa tap-in/tap-out dibatasi maksimal 3 kali per bulan kalender.',
      ],
    },
    {
      title: 'BAB II - FLEKSIBILITAS HYBRID WORKING (WFO / WFH)',
      items: [
        '1. Karyawan wajib memenuhi komposisi minimal kehadiran kantor (WFO) sebesar 60% per pekan.',
        '2. Pengajuan jadwal WFH dilakukan melalui portal ESS sebelum hari kerja berlangsung.',
      ],
    },
    {
      title: 'BAB III - KETENTUAN CUTI TAHUNAN, SAKIT & CUTI KHUSUS',
      items: [
        '1. Cuti Tahunan diberikan sebanyak 12 hari kerja penuh per tahun setelah masa kerja 12 bulan.',
        '2. Izin sakit > 1 hari wajib melampirkan surat keterangan dokter yang sah dari fasilitas medis.',
        '3. Alur persetujuan berjalan 3 tingkat: Pengajuan ESS -> Atasan Langsung -> HR Operations.',
      ],
    },
    {
      title: 'BAB IV - PENGGAJIAN (PPh 21 TER) & KLAIM KESEHATAN',
      items: [
        '1. Perhitungan pajak penghasilan menggunakan tarif efektif PP No. 58 Tahun 2023 (TER A/B/C).',
        '2. Pembayaran gaji dilaksanakan setiap tanggal 25 dengan slip digital resmi tersedia di menu Slip Gaji.',
        '3. Kendala administrasi atau klaim dapat diajukan melalui Tiket Helpdesk HR (Ext. 402).',
      ],
    },
  ];

  for (const sec of sections) {
    rect(40, y - 6, 515.28, 22, 0.94, 0.96, 0.99);
    text(sec.title, 48, y + 1, 'F2', 9.5, 0.12, 0.25, 0.68);
    y -= 26;
    for (const line of sec.items) {
      text(line, 48, y, 'F1', 9, 0.20, 0.25, 0.33);
      y -= 16;
    }
    y -= 14;
  }

  // Footer
  rect(40, 82, 515.28, 48, 0.97, 0.98, 0.99);
  text('OTORISASI DOKUMEN REGULASI INTERNAL', 50, 114, 'F2', 8.5, 0.25, 0.35, 0.48);
  text(
    `Diakses melalui ESS oleh: ${employeeName} (${employeeNumber}) | Status: Berlaku Resmi`,
    50,
    98,
    'F1',
    8.5,
    0.40,
    0.45,
    0.55
  );
  text('Nexora HR Operations  |  Dokumen Resmi PKB & SOP Kepegawaian  |  Halaman 1 dari 1', 120, 36, 'F1', 8, 0.55, 0.60, 0.68);

  addObject(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);

  const encoder = new TextEncoder();
  const pdfHeader = '%PDF-1.4\n';
  let pdfBody = '';
  const xrefOffsets: number[] = [0];
  let currentOffset = pdfHeader.length;

  for (const obj of objects) {
    xrefOffsets.push(currentOffset);
    const objStr = `${obj.num} 0 obj\n${obj.content}\nendobj\n`;
    pdfBody += objStr;
    currentOffset += encoder.encode(objStr).length;
  }

  const startXref = currentOffset;
  let xrefStr = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xrefStr += `${xrefOffsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  xrefStr += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return encoder.encode(pdfHeader + pdfBody + xrefStr);
}

export function downloadSopPDF(employeeName?: string, employeeNumber?: string): void {
  if (typeof window === 'undefined') return;
  const buffer = generateSopPDFBuffer(employeeName, employeeNumber);
  const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'SOP_Kepegawaian_PKB_Nexora_2026.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
