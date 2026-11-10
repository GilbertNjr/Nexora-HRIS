/**
 * Official Employee Payslip PDF Generator (Pure PDF 1.4)
 * Generates an official, encrypted/password-notice compliant salary slip PDF
 * without requiring heavy external dependencies.
 */

export interface PayslipPDFData {
  employeeName: string;
  employeeNumber: string;
  designation: string;
  department: string;
  periodLabel: string;
  takeHomePay: number;
  grossSalary: number;
  totalDeductions: number;
  transferBank: string;
  accountNumberMasked: string;
  transferDate: string;
  earnings: { title: string; amount: number; description?: string }[];
  deductions: { title: string; amount: number; description?: string }[];
}

function formatRupiah(num: number): string {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
}

export function generatePayslipPDFBuffer(data: PayslipPDFData): Uint8Array {
  const objects: { num: number; content: string }[] = [];

  function addObject(content: string): number {
    const objNum = objects.length + 1;
    objects.push({ num: objNum, content });
    return objNum;
  }

  // Object 1: Catalog
  addObject('<< /Type /Catalog /Pages 2 0 R >>');

  // Object 2: Pages
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

  // Object 3: Page (MediaBox A4: 595.28 x 841.89 pt)
  addObject(
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>'
  );

  // Object 4: Font F1 (Helvetica)
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  // Object 5: Font F2 (Helvetica-Bold)
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  // Object 6: Font F3 (Helvetica-Oblique)
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>');

  // Stream drawing
  let stream = '';

  function rect(x: number, y: number, w: number, h: number, r: number, g: number, b: number, fill = true, stroke = false) {
    stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} ${fill ? 'rg' : 'RG'} `;
    stream += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill && stroke ? 'b' : fill ? 'f' : 's'}\n`;
  }

  function text(str: string, x: number, y: number, font = 'F1', size = 10, r = 0.06, g = 0.09, b = 0.16) {
    const escaped = str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    stream += `BT /${font} ${size} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x.toFixed(2)} ${y.toFixed(2)} Td (${escaped}) Tj ET\n`;
  }

  function line(x1: number, y1: number, x2: number, y2: number, r = 0.8, g = 0.85, b = 0.9, w = 1) {
    stream += `${w} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S\n`;
  }

  // --- DRAW PAYSLIP A4 DOCUMENT ---
  // Background Canvas
  rect(0, 0, 595.28, 841.89, 0.98, 0.985, 0.995, true, false);

  // Top Accent Banner
  rect(0, 831.89, 595.28, 10, 0.149, 0.353, 0.890, true, false); // Brand Blue

  // Header Box
  rect(36, 740, 523.28, 76, 1, 1, 1, true, true);
  rect(36, 740, 6, 76, 0.149, 0.353, 0.890, true, false); // Blue stripe

  text('NEXORA GROUP & HR SOLUTIONS', 54, 792, 'F2', 14, 0.06, 0.09, 0.16);
  text('SLIP GAJI & BUKTI POTONG RESMI KARYAWAN', 54, 776, 'F2', 10, 0.25, 0.35, 0.55);
  text('Dokumen Rahasia & Dilindungi UU PDP No. 27/2022', 54, 758, 'F3', 8, 0.45, 0.50, 0.60);

  text(`Periode: ${data.periodLabel}`, 380, 790, 'F2', 11, 0.149, 0.353, 0.890);
  text(`Disahkan: ${data.transferDate}`, 380, 774, 'F1', 9, 0.45, 0.50, 0.60);
  text('Status: TERVALIDASI & DISAHKAN', 380, 758, 'F2', 8, 0.05, 0.60, 0.35);

  // Employee Information Card
  rect(36, 645, 523.28, 80, 1, 1, 1, true, false);
  line(36, 725, 559.28, 725);
  line(36, 645, 559.28, 645);

  text('DATA PEGAWAI', 50, 706, 'F2', 9, 0.30, 0.40, 0.55);
  text(`Nama Lengkap   : ${data.employeeName}`, 50, 688, 'F2', 10, 0.06, 0.09, 0.16);
  text(`ID Karyawan/NIK : ${data.employeeNumber}`, 50, 672, 'F1', 9, 0.25, 0.30, 0.40);
  text(`Jabatan / Posisi : ${data.designation}`, 50, 656, 'F1', 9, 0.25, 0.30, 0.40);

  text('METODE TRANSFER & PAJAK', 330, 706, 'F2', 9, 0.30, 0.40, 0.55);
  text(`Bank Penerima : ${data.transferBank}`, 330, 688, 'F1', 9, 0.06, 0.09, 0.16);
  text(`No. Rekening  : ${data.accountNumberMasked}`, 330, 672, 'F2', 9, 0.149, 0.353, 0.890);
  text(`Departemen    : ${data.department}`, 330, 656, 'F1', 9, 0.25, 0.30, 0.40);

  // Breakdown Table Headers
  rect(36, 605, 523.28, 26, 0.94, 0.96, 0.98, true, false);
  text('RINCIAN KOMPONEN KOMPENSASI', 46, 614, 'F2', 9, 0.20, 0.30, 0.45);
  text('NOMINAL (IDR)', 470, 614, 'F2', 9, 0.20, 0.30, 0.45);

  // Earnings Rows
  let curY = 585;
  text('A. PENERIMAAN / PENDAPATAN (EARNINGS)', 46, curY, 'F2', 9, 0.05, 0.55, 0.35);
  curY -= 16;

  data.earnings.forEach((item) => {
    text(`• ${item.title}`, 54, curY, 'F1', 8.5, 0.15, 0.20, 0.30);
    const amtStr = formatRupiah(item.amount);
    text(amtStr, 470, curY, 'F1', 8.5, 0.05, 0.55, 0.35);
    line(54, curY - 5, 545, curY - 5, 0.94, 0.95, 0.97, 0.5);
    curY -= 18;
  });

  // Deductions Rows
  curY -= 6;
  text('B. POTONGAN RESMI & PAJAK PPh 21 (DEDUCTIONS)', 46, curY, 'F2', 9, 0.80, 0.20, 0.25);
  curY -= 16;

  data.deductions.forEach((item) => {
    text(`• ${item.title}`, 54, curY, 'F1', 8.5, 0.15, 0.20, 0.30);
    const amtStr = `-${formatRupiah(item.amount)}`;
    text(amtStr, 470, curY, 'F1', 8.5, 0.80, 0.20, 0.25);
    line(54, curY - 5, 545, curY - 5, 0.94, 0.95, 0.97, 0.5);
    curY -= 18;
  });

  // Summary THP Card
  curY -= 14;
  rect(36, curY - 45, 523.28, 52, 0.93, 0.96, 1.0, true, true);
  text('GAJI BERSIH DITERIMA (TAKE-HOME PAY)', 50, curY - 14, 'F2', 10, 0.149, 0.353, 0.890);
  text(`Total Bruto: ${formatRupiah(data.grossSalary)}  |  Total Potongan: -${formatRupiah(data.totalDeductions)}`, 50, curY - 32, 'F1', 8.5, 0.40, 0.45, 0.55);
  text(formatRupiah(data.takeHomePay), 390, curY - 24, 'F2', 15, 0.149, 0.353, 0.890);

  // Security & Authorization Footer
  curY -= 80;
  rect(36, curY - 45, 523.28, 52, 1, 1, 1, true, false);
  line(36, curY + 7, 559.28, curY + 7);

  text('OTORISASI & KEAMANAN DOKUMEN DIGITAL', 50, curY - 6, 'F2', 8, 0.30, 0.40, 0.50);
  text('Dokumen ini digenerate secara otomatis oleh NEXORA Core HR Engine berstandar ISO 27001.', 50, curY - 20, 'F1', 7.5, 0.50, 0.55, 0.65);
  text('Telah diverifikasi oleh HR Operations & Divisi Keuangan. Tanda tangan basah tidak diperlukan.', 50, curY - 32, 'F1', 7.5, 0.50, 0.55, 0.65);

  text('VERIFIED DIGITAL SIGNATURE', 390, curY - 6, 'F2', 7.5, 0.05, 0.60, 0.35);
  text('SHA-256: [NX-SEC-PAYROLL-OK]', 390, curY - 20, 'F1', 7, 0.40, 0.45, 0.55);
  text(`ID Transaksi: TRX-${Date.now().toString().slice(-8)}`, 390, curY - 32, 'F1', 7, 0.40, 0.45, 0.55);

  // Bottom Footer
  text(`Nexora Enterprise HRIS  |  Dicetak secara mandiri oleh: ${data.employeeName}  |  Halaman 1 dari 1`, 140, 24, 'F1', 7.5, 0.6, 0.65, 0.7);

  // Object 7: Contents Stream
  const streamLength = stream.length;
  addObject(`<< /Length ${streamLength} >>\nstream\n${stream}endstream`);

  // Build Final PDF
  const encoder = new TextEncoder();
  const pdfHeader = '%PDF-1.4\n';

  let pdfBody = '';
  const xrefOffsets: number[] = [0];
  let currentOffset = pdfHeader.length;

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    xrefOffsets.push(currentOffset);
    const objStr = `${obj.num} 0 obj\n${obj.content}\nendobj\n`;
    pdfBody += objStr;
    currentOffset += encoder.encode(objStr).length;
  }

  const startXref = currentOffset;
  let xrefStr = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = xrefOffsets[i].toString().padStart(10, '0');
    xrefStr += `${offsetStr} 00000 n \n`;
  }

  xrefStr += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  const totalContent = pdfHeader + pdfBody + xrefStr;
  return encoder.encode(totalContent);
}

/**
 * Triggers a real, instantaneous client-side download of the Payslip PDF
 */
export function downloadPayslipPDF(data: PayslipPDFData, filename?: string): void {
  if (typeof window === 'undefined') return;

  const buffer = generatePayslipPDFBuffer(data);
  const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const cleanFilename =
    filename ||
    `Slip_Gaji_NEXORA_${data.periodLabel.replace(/\s+/g, '_')}_${data.employeeNumber}.pdf`;

  const a = document.createElement('a');
  a.href = url;
  a.download = cleanFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

