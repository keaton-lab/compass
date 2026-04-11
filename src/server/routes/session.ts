import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { 
  SESSION_COOKIE_NAME, 
  createSessionCookieValue, 
  createSessionCookieOptions,
  isAuthenticatedCookie,
  isValidAdminToken 
} from '../auth';
import { getSessionSecret, getAdminToken } from '../env';

const app = new Hono();

/**
 * 检查登录状态
 * GET /api/session
 */
app.get('/', (c) => {
  const sessionSecret = getSessionSecret();
  const sessionCookie = getCookie(c, SESSION_COOKIE_NAME);
  const isAuthenticated = isAuthenticatedCookie(sessionCookie, sessionSecret);

  return c.json({ authenticated: isAuthenticated });
});

/**
 * 登录
 * POST /api/session
 */
app.post('/', async (c) => {
  const expectedToken = getAdminToken();
  
  if (!expectedToken) {
    return c.json({ error: '服务器未配置登录口令' }, 500);
  }

  try {
    const body = await c.req.json();
    const { token } = body;

    if (!token || !isValidAdminToken(token, expectedToken)) {
      return c.json({ error: '口令错误' }, 401);
    }

    // 创建会话
    const sessionSecret = getSessionSecret();
    const sessionValue = createSessionCookieValue(sessionSecret);
    const cookieOptions = createSessionCookieOptions(7 * 24 * 60 * 60); // 7 天

    setCookie(c, SESSION_COOKIE_NAME, sessionValue, cookieOptions);

    return c.json({ ok: true });
  } catch {
    return c.json({ error: '登录失败' }, 500);
  }
});

/**
 * 登出
 * DELETE /api/session
 */
app.delete('/', (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME);
  return c.json({ ok: true });
});

export default app;
