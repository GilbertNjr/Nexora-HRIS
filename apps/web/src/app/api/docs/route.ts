import { NextResponse } from 'next/server';

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEXORA HRIS — Unified RESTful API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      margin-bottom: 16px;
    }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    p.subtitle { color: #64748b; font-size: 14px; margin-bottom: 32px; }
    .endpoint-card {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      transition: all 0.2s;
    }
    .endpoint-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.08); }
    .method {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      margin-right: 12px;
    }
    .get { background: #ecfdf5; color: #059669; }
    .post { background: #eff6ff; color: #2563eb; }
    .put { background: #fffbeb; color: #d97706; }
    .delete { background: #fef2f2; color: #dc2626; }
    .url { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #1e293b; }
    .desc { font-size: 13px; color: #64748b; margin-top: 8px; }
    .btn-test {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 14px;
      background: #0f172a;
      color: #ffffff;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
    }
    .btn-test:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">NEXORA HRIS ENGINE v1.0</span>
    <h1>Unified RESTful API Documentation</h1>
    <p class="subtitle">Seluruh endpoint backend terpadu dalam satu link yang sama di <a href="/" style="color:#2563eb;text-decoration:none;font-weight:600;">Nexora HRIS</a>.</p>

    <div class="endpoint-card">
      <span class="method get">GET</span>
      <span class="url">/api/v1/health</span>
      <p class="desc">Health check probe sistem untuk memverifikasi uptime dan status database.</p>
      <a href="/api/v1/health" target="_blank" class="btn-test">Uji Endpoint &rarr;</a>
    </div>

    <div class="endpoint-card">
      <span class="method get">GET</span>
      <span class="url">/api/v1/employees</span>
      <p class="desc">Mengambil daftar seluruh karyawan aktif dengan dukungan pagination dan pencarian.</p>
      <a href="/api/v1/employees" target="_blank" class="btn-test">Uji Endpoint &rarr;</a>
    </div>

    <div class="endpoint-card">
      <span class="method post">POST</span>
      <span class="url">/api/v1/employees</span>
      <p class="desc">Mendaftarkan karyawan baru ke direktori dan menyimpan rekening bank penggajian.</p>
    </div>

    <div class="endpoint-card">
      <span class="method put">PUT</span>
      <span class="url">/api/v1/employees/:id</span>
      <p class="desc">Memperbarui data dan status ketenagakerjaan karyawan.</p>
    </div>

    <div class="endpoint-card">
      <span class="method delete">DELETE</span>
      <span class="url">/api/v1/employees/:id</span>
      <p class="desc">Menghapus data karyawan dari direktori.</p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
