import type { APIRoute } from 'astro';
import { errorJsonResponse, jsonResponse } from '@/server/api-response';
import { loadConfigFile } from '@/server/config-store';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async () => {
  try {
    return jsonResponse(loadConfigFile());
  } catch {
    return errorJsonResponse('加载配置失败', 500);
  }
};
