import crypto from 'crypto';
import type { APIRoute } from 'astro';
import { jsonResponse } from '@/server/api-response';
import {
  getGithubCookieOptions,
  GITHUB_OAUTH_STATE_COOKIE,
} from '@/server/github-publishing';
import {
  canEnableGithubPublishing,
  getAppBaseUrl,
  getGithubRuntimeConfig,
} from '@/server/env';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async ({ cookies, request, redirect }) => {
  if (IS_STATIC_BUILD) {
    return jsonResponse({ error: '静态模式不支持 GitHub 连接' });
  }

  const config = getGithubRuntimeConfig();

  if (!canEnableGithubPublishing() || !config.clientId) {
    return redirect('/edit?error=GitHub%20%E5%8F%91%E5%B8%83%E8%83%BD%E5%8A%9B%E6%9C%AA%E5%AE%8C%E6%95%B4%E9%85%8D%E7%BD%AE');
  }

  const state = crypto.randomBytes(24).toString('hex');
  cookies.set(GITHUB_OAUTH_STATE_COOKIE, state, getGithubCookieOptions(60 * 10));

  const redirectUri = new URL(
    '/api/github/callback',
    getAppBaseUrl() || request.url,
  ).toString();
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', config.clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('scope', 'repo');

  return redirect(authorizeUrl.toString());
};
