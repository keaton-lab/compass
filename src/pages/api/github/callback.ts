import type { APIRoute } from 'astro';
import { jsonResponse } from '@/server/api-response';
import {
  getGithubCookieOptions,
  GITHUB_ACCESS_TOKEN_COOKIE,
  GITHUB_COOKIE_MAX_AGE,
  GITHUB_OAUTH_STATE_COOKIE,
} from '@/server/github-publishing';
import type { GithubOauthTokenResponse } from '@/server/github-publishing';
import {
  canEnableGithubPublishing,
  getAppBaseUrl,
  getGithubRuntimeConfig,
} from '@/server/env';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async ({ cookies, redirect, request, url }) => {
  if (IS_STATIC_BUILD) {
    return jsonResponse({ error: '静态模式不支持 GitHub 回调' });
  }

  const config = getGithubRuntimeConfig();
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get(GITHUB_OAUTH_STATE_COOKIE)?.value;

  if (!canEnableGithubPublishing() || !config.clientId || !config.clientSecret) {
    return redirect('/edit?error=GitHub%20%E5%8F%91%E5%B8%83%E8%83%BD%E5%8A%9B%E6%9C%AA%E5%AE%8C%E6%95%B4%E9%85%8D%E7%BD%AE');
  }

  if (!code) {
    return redirect('/edit?error=%E7%BC%BA%E5%B0%91%E6%8E%88%E6%9D%83%E7%A0%81');
  }

  if (!state || !storedState || state !== storedState) {
    cookies.delete(GITHUB_OAUTH_STATE_COOKIE, { path: '/' });
    return redirect('/edit?error=OAuth%20state%20%E6%A0%A1%E9%AA%8C%E5%A4%B1%E8%B4%A5');
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: new URL(
          '/api/github/callback',
          getAppBaseUrl() || request.url,
        ).toString(),
      }),
    });

    const tokenData = (await tokenResponse.json()) as GithubOauthTokenResponse;

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || tokenData.error || 'GitHub 授权失败');
    }

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    if (!tokenData.access_token) {
      throw new Error('GitHub 未返回 access token');
    }

    cookies.set(
      GITHUB_ACCESS_TOKEN_COOKIE,
      tokenData.access_token,
      getGithubCookieOptions(GITHUB_COOKIE_MAX_AGE),
    );
    cookies.delete(GITHUB_OAUTH_STATE_COOKIE, { path: '/' });

    return redirect('/edit?github=connected');
  } catch (error) {
    cookies.delete(GITHUB_OAUTH_STATE_COOKIE, { path: '/' });
    const message = error instanceof Error ? error.message : '授权失败';
    return redirect(`/edit?error=${encodeURIComponent(message)}`);
  }
};
