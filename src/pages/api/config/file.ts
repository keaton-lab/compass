import type { APIRoute } from 'astro';
import type { Config } from '@/shared/types';
import { isAuthenticatedCookie, SESSION_COOKIE_NAME } from '@/server/auth';
import { errorJsonResponse, jsonResponse } from '@/server/api-response';
import { getRuntimeCapabilities } from '@/server/capabilities';
import { saveConfigYaml } from '@/server/config-store';
import { getSessionSecret } from '@/server/env';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async () => {
  if (IS_STATIC_BUILD) {
    return jsonResponse({ error: '静态模式不支持该接口' });
  }

  return errorJsonResponse('Method not allowed', 405);
};

export const PUT: APIRoute = async ({ cookies, request }) => {
  if (IS_STATIC_BUILD) {
    return errorJsonResponse('静态模式不支持保存到文件', 405);
  }

  if (!getRuntimeCapabilities().canSaveToFile) {
    return errorJsonResponse('当前服务端未启用保存能力', 503);
  }

  const sessionCookie = cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!isAuthenticatedCookie(sessionCookie, getSessionSecret())) {
    return errorJsonResponse('未登录', 401);
  }

  try {
    const config = (await request.json()) as Config;
    const savedConfig = saveConfigYaml(config);

    return jsonResponse({
      ok: true,
      config: savedConfig,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存失败';
    return errorJsonResponse(message, 500);
  }
};
