import { NextRequest, NextResponse } from 'next/server';
import runtime from '@/server/runtime';
import auth from '@/server/auth';

const { canSaveToServer } = runtime as {
  canSaveToServer: () => boolean;
};
const {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionCookieOptions,
  createSessionCookieValue,
  isAuthenticatedCookie,
  isValidAdminToken,
} = auth as {
  SESSION_COOKIE_NAME: string;
  SESSION_TTL_SECONDS: number;
  createSessionCookieOptions: (maxAge: number) => {
    path: string;
    httpOnly: boolean;
    sameSite: 'lax';
    secure: boolean;
    maxAge: number;
  };
  createSessionCookieValue: (secret: string) => string;
  isAuthenticatedCookie: (cookieValue: string | undefined, secret: string | undefined) => boolean;
  isValidAdminToken: (token: string, expectedToken: string) => boolean;
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = process.env.COMPASS_SESSION_SECRET;
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  return NextResponse.json({
    authenticated: isAuthenticatedCookie(cookieValue, secret),
    canSaveToServer: canSaveToServer(),
  });
}

export async function POST(request: NextRequest) {
  if (!canSaveToServer()) {
    return NextResponse.json({ error: '当前模式未启用在线保存' }, { status: 404 });
  }

  const body = (await request.json()) as { token?: string };
  const token = typeof body.token === 'string' ? body.token : '';
  const expectedToken = process.env.COMPASS_ADMIN_TOKEN ?? '';

  if (!isValidAdminToken(token, expectedToken)) {
    return NextResponse.json({ error: '口令不正确' }, { status: 401 });
  }

  const sessionSecret = process.env.COMPASS_SESSION_SECRET;
  if (!sessionSecret) {
    return NextResponse.json({ error: '服务器未配置会话密钥' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE_NAME,
    createSessionCookieValue(sessionSecret),
    createSessionCookieOptions(SESSION_TTL_SECONDS),
  );

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', createSessionCookieOptions(0));
  return response;
}
