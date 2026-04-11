import type { APIRoute } from 'astro';
import { jsonResponse } from '@/server/api-response';
import {
  buildGithubStatus,
  GITHUB_ACCESS_TOKEN_COOKIE,
} from '@/server/github-publishing';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async ({ cookies }) => {
  if (IS_STATIC_BUILD) {
    return jsonResponse(buildGithubStatus(false));
  }

  return jsonResponse(
    buildGithubStatus(Boolean(cookies.get(GITHUB_ACCESS_TOKEN_COOKIE)?.value)),
  );
};
