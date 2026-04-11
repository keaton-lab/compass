import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { loadConfigFile, saveConfigYaml, readConfigSource } from '../config-store';
import { SESSION_COOKIE_NAME, isAuthenticatedCookie } from '../auth';
import { getSessionSecret } from '../env';

const app = new Hono();

/**
 * 获取运行时配置
 * GET /api/config/runtime
 */
app.get('/runtime', (c) => {
  try {
    const config = loadConfigFile();
    return c.json(config);
  } catch (error) {
    return c.json({ error: '加载配置失败' }, 500);
  }
});

/**
 * 获取配置源码
 * GET /api/config/source
 */
app.get('/source', (c) => {
  try {
    const { configPath, fileContents } = readConfigSource();
    return c.json({
      configPath,
      content: fileContents,
    });
  } catch (error) {
    return c.json({ error: '读取配置文件失败' }, 500);
  }
});

/**
 * 保存配置到文件
 * PUT /api/config/file
 */
app.put('/file', async (c) => {
  // 检查登录状态
  const sessionSecret = getSessionSecret();
  const sessionCookie = getCookie(c, SESSION_COOKIE_NAME);
  
  if (!isAuthenticatedCookie(sessionCookie, sessionSecret)) {
    return c.json({ error: '未登录' }, 401);
  }

  try {
    const config = await c.req.json();
    const savedConfig = saveConfigYaml(config);
    return c.json({ ok: true, config: savedConfig });
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存失败';
    return c.json({ error: message }, 500);
  }
});

export default app;
