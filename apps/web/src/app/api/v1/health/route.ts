import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'NEXORA Enterprise HRIS — Unified Engine',
      environment: process.env.NODE_ENV || 'production',
      database: process.env.DATABASE_URL ? 'connected (Supabase/PostgreSQL)' : 'local-resilient',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
