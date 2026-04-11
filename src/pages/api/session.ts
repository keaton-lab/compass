import type { APIRoute } from 'astro';
import {
  createSessionCookieOptions,
  createSessionCookieValue,
  isAuthenticatedCookie,
  isValidAdminToken,
  SESSION_COOKIE_NAME,
} from '@/server/auth';
import { errorJsonResponse, jsonResponse } from '@/server/api-response';
import { getRuntimeCapabilities } from '@/server/capabilities';
import { getAdminToken, getSessionSecret } from '@/server/env';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async ({ cookies }) => {
  if (IS_STATIC_BUILD) {
    return jsonResponse({ authenticated: false });
  }

  const sessionSecret = getSessionSecret();
  const sessionCookie = cookies.get(SESSION_COOKIE_NAME)?.value;

  return jsonResponse({
    authenticated: isAuthenticatedCookie(sessionCookie, sessionSecret),
  });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  if (IS_STATIC_BUILD) {
    return errorJsonResponse('静态模式不支持登录', 405);
  }

  if (!getRuntimeCapabilities().canLogin) {
    return errorJsonResponse('服务器未配置登录能力', 503);
  }

  const expectedToken = getAdminToken();

  if (!expectedToken) {
    return errorJsonResponse('服务器未配置登录口令', 500);
  }

  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();

    if (!token || !isValidAdminToken(token, expectedToken)) {
      return errorJsonResponse('口令错误', 401);
    }

    const sessionValue = createSessionCookieValue(getSessionSecret());

    cookies.set(
      SESSION_COOKIE_NAME,
      sessionValue,
      createSessionCookieOptions(7 * 24 * 60 * 60),
    );

    return jsonResponse({ ok: true });
  } catch {
    return errorJsonResponse('登录失败', 500);
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  if (IS_STATIC_BUILD) {
    return errorJsonResponse('静态模式不支持登出', 405);
  }

  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  return jsonResponse({ ok: true });
};
