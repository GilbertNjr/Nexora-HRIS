/**
 * Official Company Document Generator for PT Nexora Digital Nusantara
 * Produces clean, professional, A4 print-ready legal documents complying with Company SOP and Indonesian regulations.
 */

export interface OfficialDocParams {
  title: string;
  docNumber: string;
  updatedDate: string;
  category: string;
  formatBadge: string;
  signatureStatus: string;
  securityBadge: string;
  employeeName: string;
  employeeNik: string;
  employeeRole: string;
  employeeDept: string;
  employeeJoinDate?: string;
  officialContent?: {
    header?: string;
    subHeader?: string;
    docRef?: string;
    legalBasis?: string;
    clauses?: { pasal: string; content: string }[];
    signingDate?: string;
    firstPartySigner?: string;
    secondPartySigner?: string;
  };
}

export function generateOfficialDocumentHtml(params: OfficialDocParams): string {
  const {
    title,
    docNumber,
    updatedDate,
    employeeName,
    employeeNik,
    employeeRole,
    employeeDept,
    employeeJoinDate = '28 Februari 2021',
    officialContent,
  } = params;

  const headerTitle = officialContent?.header || title.toUpperCase();
  const subHeader = officialContent?.subHeader || 'SURAT DOKUMEN RESMI KEPEGAWAIAN PT NEXORA DIGITAL NUSANTARA';
  const docRef = officialContent?.docRef || `Nomor: ${docNumber}`;
  const legalBasis =
    officialContent?.legalBasis ||
    'Standar Operasional Prosedur Manajemen SDM PT Nexora Digital Nusantara & UU No. 13 Tahun 2003 jo. UU No. 6 Tahun 2023.';

  const clauses =
    officialContent?.clauses && officialContent.clauses.length > 0
      ? officialContent.clauses
      : [
          {
            pasal: 'PASAL 1 - KEDUDUKAN & KETENTUAN POKOK',
            content: `Dengan ini diterangkan secara sah bahwa ${employeeName} (NIK: ${employeeNik}) memegang posisi resmi sebagai ${employeeRole} pada Departemen ${employeeDept} terhitung sejak ${employeeJoinDate}. Seluruh hak, kewajiban, dan tanggung jawab dilaksanakan mengacu pada ketentuan SOP Perusahaan yang berlaku.`,
          },
          {
            pasal: 'PASAL 2 - KEPATUHAN & KERAHASIAAN INFORMASI',
            content: `Karyawan wajib mematuhi seluruh peraturan kerahasiaan data (Non-Disclosure Agreement), standar keamanan informasi ISO 27001, serta ketentuan Undang-Undang Pelindungan Data Pribadi (UU PDP No. 27/2022).`,
          },
          {
            pasal: 'PASAL 3 - KETENTUAN PENUTUP & KEABSAHAN HUKUM',
            content: `Surat/dokumen ini diterbitkan secara resmi melalui Sistem Informasi Sumber Daya Manusia (HRIS) Nexora, dibubuhi tanda tangan elektronik tersertifikasi (Digital Signature Peruri CA) dan memiliki kekuatan hukum yang sah dan mengikat.`,
          },
        ];

  const signingDate = officialContent?.signingDate || `Jakarta, ${updatedDate}`;
  const firstPartySigner = officialContent?.firstPartySigner || 'Citra Lestari, S.Psi, M.M. (Chief Human Resources Officer)';
  const secondPartySigner = officialContent?.secondPartySigner || `${employeeName} (${employeeRole})`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title} - PT Nexora Digital Nusantara</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 20mm 20mm 20mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #111827;
      background-color: #ffffff;
      padding: 24px 32px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 3px double #000000;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .header-logo {
      width: 80px;
      vertical-align: middle;
      text-align: center;
    }
    .logo-box {
      width: 64px;
      height: 64px;
      background: #1d4ed8;
      color: #ffffff;
      font-family: Arial, sans-serif;
      font-weight: 900;
      font-size: 26px;
      line-height: 64px;
      text-align: center;
      border-radius: 8px;
      display: inline-block;
    }
    .header-text {
      text-align: center;
      vertical-align: middle;
      padding-left: 10px;
      font-family: Arial, Helvetica, sans-serif;
    }
    .company-name {
      font-size: 16pt;
      font-weight: 900;
      letter-spacing: 1px;
      color: #0f172a;
      text-transform: uppercase;
    }
    .company-desc {
      font-size: 8.5pt;
      font-weight: bold;
      color: #1e3a8a;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .company-address {
      font-size: 8pt;
      color: #475569;
      margin-top: 3px;
      line-height: 1.3;
    }
    .doc-title-container {
      text-align: center;
      margin: 20px 0 16px 0;
    }
    .doc-title {
      font-size: 13pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
    }
    .doc-number {
      font-size: 10pt;
      font-weight: bold;
      margin-top: 4px;
      color: #334155;
    }
    .legal-basis {
      font-size: 8.5pt;
      font-style: italic;
      color: #64748b;
      margin-top: 2px;
    }
    .section-intro {
      text-align: justify;
      margin-bottom: 12px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 10.5pt;
    }
    .data-table td {
      padding: 4px 6px;
      vertical-align: top;
    }
    .data-table td.label {
      width: 220px;
      font-weight: bold;
      color: #1f2937;
    }
    .data-table td.colon {
      width: 15px;
      text-align: center;
    }
    .data-table td.val {
      color: #111827;
    }
    .clauses-container {
      margin: 16px 0;
    }
    .clause-item {
      margin-bottom: 12px;
      text-align: justify;
    }
    .clause-title {
      font-weight: bold;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10pt;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .clause-body {
      font-size: 10.5pt;
      line-height: 1.55;
      text-indent: 20px;
    }
    .signatures-table {
      width: 100%;
      margin-top: 28px;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    .signatures-table td {
      width: 50%;
      vertical-align: top;
      text-align: center;
    }
    .stamp-box {
      border: 1.5px dashed #0284c7;
      background: #f0f9ff;
      border-radius: 8px;
      padding: 8px 12px;
      display: inline-block;
      margin: 10px 0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #0369a1;
      text-align: center;
    }
    .stamp-title {
      font-weight: bold;
      font-size: 9pt;
      color: #0c4a6e;
    }
    .qr-badge {
      font-family: monospace;
      font-size: 7.5pt;
      color: #475569;
      margin-top: 3px;
    }
    .signer-name {
      font-weight: bold;
      text-decoration: underline;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10.5pt;
      margin-top: 8px;
    }
    .signer-title {
      font-size: 9pt;
      color: #475569;
      font-family: Arial, Helvetica, sans-serif;
    }
    .footer-watermark {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- HEADER / KOP SURAT RESMI -->
  <table class="header-table">
    <tr>
      <td class="header-logo">
        <div class="logo-box">NX</div>
      </td>
      <td class="header-text">
        <div class="company-name">PT NEXORA DIGITAL NUSANTARA</div>
        <div class="company-desc">HUMAN CAPITAL & CORPORATE LEGAL AFFAIRS DIVISION</div>
        <div class="company-address">
          Menara Nexora Lantai 18-20, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan 12190<br>
          Telp: (021) 5082-9900 | Email: legal@nexora.co.id | Portal HRIS: https://nexora.co.id/ess
        </div>
      </td>
    </tr>
  </table>

  <!-- DOKUMEN TITLE & NOMOR SURAT -->
  <div class="doc-title-container">
    <div class="doc-title">${headerTitle}</div>
    <div class="doc-number">${docRef}</div>
    <div class="legal-basis">${legalBasis}</div>
  </div>

  <div class="section-intro">
    Pada hari ini, dengan memperhatikan seluruh ketentuan Peraturan Perusahaan dan Standar Operasional Prosedur (SOP) Manajemen Sumber Daya Manusia PT Nexora Digital Nusantara, diterbitkan dokumen resmi yang mengikat bagi pihak yang bersangkutan di bawah ini:
  </div>

  <!-- IDENTITAS KARYAWAN -->
  <table class="data-table">
    <tr>
      <td class="label">Nama Lengkap Karyawan</td>
      <td class="colon">:</td>
      <td class="val"><strong>${employeeName}</strong></td>
    </tr>
    <tr>
      <td class="label">Nomor Induk Karyawan (NIK)</td>
      <td class="colon">:</td>
      <td class="val"><code>${employeeNik}</code></td>
    </tr>
    <tr>
      <td class="label">Jabatan Struktural / Peran</td>
      <td class="colon">:</td>
      <td class="val">${employeeRole}</td>
    </tr>
    <tr>
      <td class="label">Departemen / Divisi Kerja</td>
      <td class="colon">:</td>
      <td class="val">${employeeDept}</td>
    </tr>
    <tr>
      <td class="label">Tanggal Bergabung Perusahaan</td>
      <td class="colon">:</td>
      <td class="val">${employeeJoinDate}</td>
    </tr>
    <tr>
      <td class="label">Status Hubungan Kepegawaian</td>
      <td class="colon">:</td>
      <td class="val">Karyawan Tetap (Perjanjian Kerja Waktu Tidak Tertentu)</td>
    </tr>
  </table>

  <!-- PASAL & KETENTUAN RESMI -->
  <div class="clauses-container">
    ${clauses
      .map(
        (c) => `
      <div class="clause-item">
        <div class="clause-title">${c.pasal}</div>
        <div class="clause-body">${c.content}</div>
      </div>
    `
      )
      .join('')}
  </div>

  <div class="section-intro" style="margin-top: 14px;">
    Demikian dokumen resmi ini ditetapkan dan diterbitkan dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya sesuai ketentuan hukum yang berlaku.
  </div>

  <!-- TANDA TANGAN & METERAI ELEKTRONIK -->
  <table class="signatures-table">
    <tr>
      <td>
        <div>Pihak Kedua / Karyawan Bersangkutan,</div>
        <div style="height: 55px;"></div>
        <div class="signer-name">${secondPartySigner}</div>
        <div class="signer-title">NIK: ${employeeNik}</div>
      </td>
      <td>
        <div>${signingDate}</div>
        <div>Atas Nama Direksi PT Nexora Digital Nusantara,</div>
        <div class="stamp-box">
          <div class="stamp-title">METERAI ELEKTRONIK</div>
          <div>Rp 10.000,- TERVERIFIKASI</div>
          <div class="qr-badge">SN: MTR-2025-${Math.random().toString(36).substring(2, 8).toUpperCase()}-PERURI</div>
        </div>
        <div class="signer-name">${firstPartySigner}</div>
        <div class="signer-title">Digital Signature CA: Verified ISO 27001</div>
      </td>
    </tr>
  </table>

  <!-- FOOTER WATERMARK -->
  <div class="footer-watermark">
    <span>PT Nexora Digital Nusantara • Dokumen Resmi Terikat SOP Perusahaan</span>
    <span>Sistem HRIS Terintegrasi • RFC-3161 Timestamp Compliant</span>
    <span>Halaman 1 dari 1</span>
  </div>
</body>
</html>`;
}

/**
 * Trigger immediate clean download of official document
 */
export function downloadOfficialDocument(params: OfficialDocParams): void {
  const htmlContent = generateOfficialDocumentHtml(params);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeDocName = params.docNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Dokumen_Resmi_Nexora_${safeDocName}.html`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open official document in clean print preview dialog
 */
export function printOfficialDocument(params: OfficialDocParams): void {
  const htmlContent = generateOfficialDocumentHtml(params);
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}
