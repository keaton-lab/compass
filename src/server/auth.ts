import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'compass_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 天

export function createSessionSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createSessionCookieValue(secret: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin:${expiresAt}`;
  const signature = createSessionSignature(payload, secret);
  return `${payload}:${signature}`;
}

export function isAuthenticatedCookie(cookieValue: string | undefined, secret: string): boolean {
  if (!cookieValue || !secret) {
    return false;
  }

  const parts = cookieValue.split(':');
  if (parts.length !== 3 || parts[0] !== 'admin') {
    return false;
  }

  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${parts[0]}:${parts[1]}`;
  const actualSignature = parts[2];
  const expectedSignature = createSessionSignature(payload, secret);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(actualSignature),
      Buffer.from(expectedSignature),
    );
  } catch {
    return false;
  }
}

export function isValidAdminToken(token: string, expectedToken: string): boolean {
  try {
    return (
      token.length > 0 &&
      expectedToken.length > 0 &&
      crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))
    );
  } catch {
    return false;
  }
}

export function createSessionCookieOptions(maxAge: number) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

export { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS };
