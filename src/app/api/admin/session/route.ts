import { NextRequest, NextResponse } from 'next/server';
import runtime from '@/server/runtime';
import auth from '@/server/auth';
import env from '@/server/env';

const { canSaveToServer } = runtime as {
  canSaveToServer: () => boolean;
};
const { getAdminToken, getSessionSecret } = env as {
  getAdminToken: () => string | undefined;
  getSessionSecret: () => string;
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
  createSessionCookieOptions: (maxAge: number, request?: NextRequest) => {
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
  const secret = getSessionSecret();
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
  const expectedToken = getAdminToken() ?? '';

  if (!isValidAdminToken(token, expectedToken)) {
    return NextResponse.json({ error: '口令不正确' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE_NAME,
    createSessionCookieValue(getSessionSecret()),
    createSessionCookieOptions(SESSION_TTL_SECONDS, request),
  );

  return response;
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', createSessionCookieOptions(0, request));
  return response;
}
