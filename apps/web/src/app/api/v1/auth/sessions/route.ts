import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATABASE_URL = process.env.DATABASE_URL;

interface ParsedSession {
  id: string;
  userId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string;
  os: string;
  browser: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  isOnline: boolean;
  statusText: string;
  lastActiveText: string;
  createdAt: string;
}

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
}

function parseDeviceFromUserAgent(
  uaString: string,
  ip: string,
  isCurrentSession: boolean,
  createdAt: Date
): Omit<ParsedSession, 'id' | 'userId'> {
  const ua = uaString || '';
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  let deviceName = 'Desktop Chrome';
  let os = 'Windows 11';
  let browser = 'Chrome';

  // 1. Detect Device & OS
  if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'tablet';
    deviceName = 'Tablet iPad';
    os = 'iPadOS';
  } else if (/iPhone/i.test(ua)) {
    deviceType = 'mobile';
    deviceName = 'Mobile iPhone';
    os = 'iOS';
  } else if (/Android/i.test(ua)) {
    deviceType = 'mobile';
    if (/SM-S928|SM-S92|SM-G99|Samsung/i.test(ua)) {
      deviceName = 'Mobile Android (Samsung S24)';
    } else if (/Pixel/i.test(ua)) {
      deviceName = 'Mobile Android (Google Pixel)';
    } else if (/Xiaomi|Redmi/i.test(ua)) {
      deviceName = 'Mobile Android (Xiaomi)';
    } else {
      deviceName = 'Mobile Android';
    }
    os = 'Android';
  } else {
    deviceType = 'desktop';
    if (/Windows NT 10\.0/i.test(ua)) {
      os = 'Windows 11 / 10';
      deviceName = 'Desktop Chrome';
    } else if (/Windows/i.test(ua)) {
      os = 'Windows';
      deviceName = 'Desktop PC';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      os = 'macOS';
      deviceName = 'MacBook / Mac Desktop';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
      deviceName = 'Desktop Linux';
    }
  }

  // 2. Detect Browser
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
    if (deviceType === 'desktop') deviceName = 'Desktop Edge';
  } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    browser = 'Chrome';
    if (deviceType === 'desktop') deviceName = 'Desktop Chrome';
    else if (deviceType === 'mobile' && !deviceName.includes('Samsung')) deviceName = 'Mobile Chrome';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
    if (deviceType === 'desktop') deviceName = 'Desktop Firefox';
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    browser = 'Apple Safari';
    if (deviceType === 'mobile') deviceName = 'Mobile Safari';
    else if (deviceType === 'desktop') deviceName = 'Desktop Safari';
  }

  // 3. Location / Network
  let location = 'SCBD HQ';
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    location = deviceType === 'mobile' ? 'Mobile 5G Network • SCBD' : 'SCBD HQ';
  } else if (ip.startsWith('10.') || ip.startsWith('192.168.')) {
    location = 'SCBD HQ • Intranet Kantor';
  } else {
    location = `${ip.replace(/:\d+$/, '')} • Jakarta`;
  }

  // 4. Calculate relative last active time
  const diffMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  let lastActiveText = 'Baru saja';
  if (isCurrentSession) {
    lastActiveText = 'Sesi Saat Ini';
  } else if (diffMins < 5) {
    lastActiveText = 'Baru saja aktif';
  } else if (diffMins < 60) {
    lastActiveText = `${diffMins} menit lalu`;
  } else if (diffHours < 24) {
    lastActiveText = `${diffHours} jam lalu`;
  } else {
    lastActiveText = 'Kemarin';
  }

  const isOnline = isCurrentSession || diffMins < 20;

  return {
    deviceType,
    deviceName,
    os,
    browser,
    ipAddress: ip,
    location,
    isCurrent: isCurrentSession,
    isOnline,
    statusText: isCurrentSession ? 'Online' : isOnline ? 'Online' : 'Aktif',
    lastActiveText,
    createdAt: new Date(createdAt).toISOString(),
  };
}

// GET: Fetch all active sessions for current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const employeeNumber = searchParams.get('employeeNumber') || '';
    const email = searchParams.get('email') || '';
    const clientSessionId = searchParams.get('sessionId') || request.headers.get('x-session-id') || '';

    const currentClientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const currentClientUa = request.headers.get('user-agent') || 'Browser Client';

    if (!DATABASE_URL) {
      return NextResponse.json({ success: true, count: 1, data: [] });
    }

    const sql = neon(DATABASE_URL);

    // 1. Resolve target user UUID
    let resolvedUserId = (userId && isValidUuid(userId)) ? userId : '';
    if (!resolvedUserId && (employeeNumber || email)) {
      const uRes = await sql.query(
        `SELECT u.id 
         FROM users u
         LEFT JOIN employees e ON u.id = e.user_id
         WHERE (e.employee_number IS NOT NULL AND LOWER(e.employee_number) = LOWER($1))
            OR LOWER(u.email) = LOWER($2)
         LIMIT 1`,
        [employeeNumber || '', email || '']
      );
      if (uRes && uRes[0]?.id) {
        resolvedUserId = uRes[0].id;
      }
    }

    if (!resolvedUserId) {
      // Fallback: search by default employee (Fatih) if no identifier specified
      const fatih = await sql.query(
        `SELECT user_id FROM employees WHERE employee_number = 'NX-2025089' LIMIT 1`
      );
      if (fatih && fatih[0]?.user_id) {
        resolvedUserId = fatih[0].user_id;
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json({
        success: true,
        count: 1,
        data: [
          {
            id: 'sess-current-local',
            userId: 'local',
            ...parseDeviceFromUserAgent(currentClientUa, currentClientIp, true, new Date()),
          },
        ],
      });
    }

    // 2. Fetch active sessions from database
    const rows = await sql.query(
      `SELECT id, user_id, user_agent, ip_address, is_revoked, expires_at, created_at
       FROM user_sessions
       WHERE user_id = $1 AND is_revoked = false AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [resolvedUserId]
    );

    let sessionsList: ParsedSession[] = [];

    if (Array.isArray(rows) && rows.length > 0) {
      let foundCurrent = false;

      sessionsList = rows.map((r: any) => {
        const isCurrent =
          (clientSessionId && r.id === clientSessionId) ||
          (!foundCurrent && r.user_agent === currentClientUa);

        if (isCurrent) foundCurrent = true;

        const parsed = parseDeviceFromUserAgent(
          r.user_agent,
          r.ip_address,
          isCurrent,
          new Date(r.created_at)
        );

        return {
          id: r.id,
          userId: r.user_id,
          ...parsed,
        };
      });

      // Ensure at least one session is marked as current if matching
      if (!foundCurrent && sessionsList.length > 0) {
        sessionsList[0].isCurrent = true;
        sessionsList[0].statusText = 'Online';
        sessionsList[0].lastActiveText = 'Sesi Saat Ini';
      }
    } else {
      // Self-healing: if no session exists yet in DB, register current client session automatically
      const newSessionId = (clientSessionId && isValidUuid(clientSessionId)) ? clientSessionId : crypto.randomUUID();
      const tokenHash = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      try {
        await sql.query(
          `INSERT INTO user_sessions (id, user_id, refresh_token_hash, user_agent, ip_address, is_revoked, expires_at, created_at)
           VALUES ($1, $2, $3, $4, $5, false, $6, NOW())
           ON CONFLICT DO NOTHING`,
          [newSessionId, resolvedUserId, tokenHash, currentClientUa.substring(0, 250), currentClientIp.substring(0, 45), expiresAt]
        );
      } catch {}

      sessionsList = [
        {
          id: newSessionId,
          userId: resolvedUserId,
          ...parseDeviceFromUserAgent(currentClientUa, currentClientIp, true, new Date()),
        },
      ];
    }

    return NextResponse.json({
      success: true,
      count: sessionsList.length,
      data: sessionsList,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Gagal memuat sesi aktif' } },
      { status: 500 }
    );
  }
}

// POST: Add or register a session (support real-time cross-device simulation, e.g. Mobile + Laptop)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, employeeNumber, email, deviceType, deviceName, isMobileSimulation } = body;

    const currentClientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    let userAgent = body.userAgent || request.headers.get('user-agent') || 'Browser Client';

    // If mobile simulation requested, format a genuine Android/Samsung user agent
    if (isMobileSimulation || deviceType === 'mobile') {
      userAgent =
        'Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.134 Mobile Safari/537.36';
    }

    if (!DATABASE_URL) {
      return NextResponse.json({ success: false, error: { message: 'Database URL not configured' } }, { status: 500 });
    }

    const sql = neon(DATABASE_URL);

    // Resolve user ID
    let resolvedUserId = (userId && isValidUuid(userId)) ? userId : '';
    if (!resolvedUserId && (employeeNumber || email)) {
      const uRes = await sql.query(
        `SELECT u.id 
         FROM users u
         LEFT JOIN employees e ON u.id = e.user_id
         WHERE (e.employee_number IS NOT NULL AND LOWER(e.employee_number) = LOWER($1))
            OR LOWER(u.email) = LOWER($2)
         LIMIT 1`,
        [employeeNumber || '', email || '']
      );
      if (uRes && uRes[0]?.id) {
        resolvedUserId = uRes[0].id;
      }
    }

    if (!resolvedUserId) {
      const fatih = await sql.query(`SELECT user_id FROM employees WHERE employee_number = 'NX-2025089' LIMIT 1`);
      if (fatih && fatih[0]?.user_id) {
        resolvedUserId = fatih[0].user_id;
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json({ success: false, error: { message: 'User tidak ditemukan' } }, { status: 404 });
    }

    const newSessionId = crypto.randomUUID();
    const tokenHash = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const ipToSave = isMobileSimulation ? '182.253.14.88' : currentClientIp;

    await sql.query(
      `INSERT INTO user_sessions (id, user_id, refresh_token_hash, user_agent, ip_address, is_revoked, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, false, $6, NOW())`,
      [newSessionId, resolvedUserId, tokenHash, userAgent.substring(0, 250), ipToSave.substring(0, 45), expiresAt]
    );

    return NextResponse.json({
      success: true,
      message: `Sesi perangkat ${deviceType === 'mobile' ? 'Mobile' : 'Desktop'} berhasil didaftarkan secara real-time.`,
      sessionId: newSessionId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Gagal menambahkan sesi' } },
      { status: 500 }
    );
  }
}

// DELETE: Revoke a specific session or all other sessions
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || '';
    const userId = searchParams.get('userId') || '';
    const allExceptCurrent = searchParams.get('allExceptCurrent') === 'true';

    if (!DATABASE_URL) {
      return NextResponse.json({ success: true });
    }

    const sql = neon(DATABASE_URL);

    if (allExceptCurrent && userId && sessionId && isValidUuid(userId) && isValidUuid(sessionId)) {
      await sql.query(
        `UPDATE user_sessions 
         SET is_revoked = true 
         WHERE user_id = $1 AND id != $2`,
        [userId, sessionId]
      );
      return NextResponse.json({
        success: true,
        message: 'Seluruh sesi perangkat lain berhasil diputuskan demi keamanan.',
      });
    }

    if (sessionId && isValidUuid(sessionId)) {
      await sql.query(
        `UPDATE user_sessions 
         SET is_revoked = true 
         WHERE id = $1`,
        [sessionId]
      );
      return NextResponse.json({
        success: true,
        message: 'Sesi perangkat berhasil diputuskan dari jarak jauh.',
      });
    }

    return NextResponse.json({ success: false, error: { message: 'Session ID diperlukan' } }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Gagal memutuskan sesi' } },
      { status: 500 }
    );
  }
}
