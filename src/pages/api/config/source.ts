import type { APIRoute } from 'astro';
import { errorJsonResponse, jsonResponse } from '@/server/api-response';
import { readConfigSource } from '@/server/config-store';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async () => {
  try {
    const { configPath, fileContents } = readConfigSource();

    return jsonResponse({
      configPath,
      content: fileContents,
    });
  } catch {
    return errorJsonResponse('读取配置文件失败', 500);
  }
};
