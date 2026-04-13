/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('crypto');

const SESSION_COOKIE_NAME = 'compass_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function createSessionSignature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function createSessionCookieValue(secret) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin:${expiresAt}`;
  const signature = createSessionSignature(payload, secret);
  return `${payload}:${signature}`;
}

function isAuthenticatedCookie(cookieValue, secret) {
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

function isValidAdminToken(token, expectedToken) {
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

function createSessionCookieOptions(maxAge) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

module.exports = {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionCookieOptions,
  createSessionCookieValue,
  isAuthenticatedCookie,
  isValidAdminToken,
};
