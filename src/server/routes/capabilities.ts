import { Hono } from 'hono';
import type { Capabilities } from '@/shared/types';
import { getRuntimeMode, hasAdminToken, getSessionSecret } from '../env';

const app = new Hono();

/**
 * 获取运行时能力
 * GET /api/capabilities
 */
app.get('/', (c) => {
  const mode = getRuntimeMode();
  const hasToken = hasAdminToken();
  const hasSecret = getSessionSecret().length > 0;

  const capabilities: Capabilities = {
    mode,
    canLogin: mode === 'server' && hasToken && hasSecret,
    canSaveToFile: mode === 'server' && hasToken && hasSecret,
    canPublishToGithub: mode === 'github',
  };

  return c.json(capabilities);
});

export default app;
