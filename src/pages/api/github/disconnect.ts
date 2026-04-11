import type { APIRoute } from 'astro';
import { errorJsonResponse, jsonResponse } from '@/server/api-response';
import {
  GITHUB_ACCESS_TOKEN_COOKIE,
  GITHUB_OAUTH_STATE_COOKIE,
} from '@/server/github-publishing';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async () => {
  if (IS_STATIC_BUILD) {
    return jsonResponse({ error: '静态模式不支持该接口' });
  }

  return errorJsonResponse('Method not allowed', 405);
};

export const POST: APIRoute = async ({ cookies }) => {
  if (IS_STATIC_BUILD) {
    return errorJsonResponse('静态模式不支持 GitHub 断开', 405);
  }

  cookies.delete(GITHUB_ACCESS_TOKEN_COOKIE, { path: '/' });
  cookies.delete(GITHUB_OAUTH_STATE_COOKIE, { path: '/' });
  return jsonResponse({ ok: true });
};
