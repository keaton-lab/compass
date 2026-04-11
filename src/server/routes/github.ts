import { Hono } from 'hono';
import crypto from 'crypto';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { GithubConnectionStatus, GithubPublishPayload } from '@/shared/types';
import {
  canEnableGithubPublishing,
  getAppBaseUrl,
  getGithubRuntimeConfig,
} from '../env';

const app = new Hono();
const GITHUB_OAUTH_STATE_COOKIE = 'compass_github_oauth_state';
const GITHUB_ACCESS_TOKEN_COOKIE = 'compass_github_access_token';
const GITHUB_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

interface GithubOauthTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface GithubContentResponse {
  sha?: string;
  commit?: {
    sha?: string;
    html_url?: string;
  };
  content?: {
    sha?: string;
  };
}

function getCookieOptions(maxAge: number) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

function encodeRepoPath(pathname: string): string {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildGithubStatus(authenticated: boolean): GithubConnectionStatus {
  const config = getGithubRuntimeConfig();

  return {
    configured: canEnableGithubPublishing(),
    authenticated,
    repo:
      config.repoOwner && config.repoName
        ? `${config.repoOwner}/${config.repoName}`
        : null,
    branch: config.repoBranch,
    path: config.configPath,
  };
}

async function readGithubError(response: Response): Promise<string> {
  const fallback = `GitHub API 请求失败（${response.status}）`;

  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message || fallback;
  } catch {
    return fallback;
  }
}

function createErrorJsonResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

app.get('/status', (c) => {
  const accessToken = getCookie(c, GITHUB_ACCESS_TOKEN_COOKIE);
  return c.json(buildGithubStatus(Boolean(accessToken)));
});

app.post('/disconnect', (c) => {
  deleteCookie(c, GITHUB_ACCESS_TOKEN_COOKIE, { path: '/' });
  deleteCookie(c, GITHUB_OAUTH_STATE_COOKIE, { path: '/' });
  return c.json({ ok: true });
});

/**
 * 发起 GitHub OAuth 授权
 * GET /api/github/connect
 */
app.get('/connect', (c) => {
  const config = getGithubRuntimeConfig();

  if (!canEnableGithubPublishing() || !config.clientId) {
    return c.redirect('/edit?error=GitHub%20%E6%A8%A1%E5%BC%8F%E6%9C%AA%E5%AE%8C%E6%95%B4%E9%85%8D%E7%BD%AE');
  }

  const state = crypto.randomBytes(24).toString('hex');
  setCookie(c, GITHUB_OAUTH_STATE_COOKIE, state, getCookieOptions(60 * 10));

  const redirectUri = new URL(
    '/api/github/callback',
    getAppBaseUrl() || c.req.url,
  ).toString();
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', config.clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('scope', 'repo');

  return c.redirect(authorizeUrl.toString());
});

/**
 * GitHub App 授权回调
 * GET /api/github/callback
 */
app.get('/callback', async (c) => {
  const config = getGithubRuntimeConfig();
  const code = c.req.query('code');
  const state = c.req.query('state');
  const storedState = getCookie(c, GITHUB_OAUTH_STATE_COOKIE);

  if (!canEnableGithubPublishing() || !config.clientId || !config.clientSecret) {
    return c.redirect('/edit?error=GitHub%20%E6%A8%A1%E5%BC%8F%E6%9C%AA%E5%AE%8C%E6%95%B4%E9%85%8D%E7%BD%AE');
  }

  if (!code) {
    return c.redirect('/edit?error=%E7%BC%BA%E5%B0%91%E6%8E%88%E6%9D%83%E7%A0%81');
  }

  if (!state || !storedState || state !== storedState) {
    deleteCookie(c, GITHUB_OAUTH_STATE_COOKIE, { path: '/' });
    return c.redirect('/edit?error=OAuth%20state%20%E6%A0%A1%E9%AA%8C%E5%A4%B1%E8%B4%A5');
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: new URL(
          '/api/github/callback',
          getAppBaseUrl() || c.req.url,
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

    setCookie(
      c,
      GITHUB_ACCESS_TOKEN_COOKIE,
      tokenData.access_token,
      getCookieOptions(GITHUB_COOKIE_MAX_AGE),
    );
    deleteCookie(c, GITHUB_OAUTH_STATE_COOKIE, { path: '/' });

    return c.redirect('/edit?github=connected');
  } catch (error) {
    deleteCookie(c, GITHUB_OAUTH_STATE_COOKIE, { path: '/' });
    const message = error instanceof Error ? error.message : '授权失败';
    return c.redirect(`/edit?error=${encodeURIComponent(message)}`);
  }
});

/**
 * 发布配置到 GitHub
 * POST /api/github/publish
 */
app.post('/publish', async (c) => {
  const config = getGithubRuntimeConfig();
  const accessToken = getCookie(c, GITHUB_ACCESS_TOKEN_COOKIE);

  if (!canEnableGithubPublishing() || !config.repoOwner || !config.repoName) {
    return c.json({ error: 'GitHub 模式未完整配置' }, 500);
  }

  if (!accessToken) {
    return c.json({ error: '请先连接 GitHub' }, 401);
  }

  try {
    const body = (await c.req.json()) as GithubPublishPayload;
    const yamlContent = body.yamlContent?.trim();
    const commitMessage =
      body.commitMessage?.trim() ||
      'chore: update Compass config';

    if (!yamlContent) {
      return c.json({ error: '缺少 yamlContent' }, 400);
    }

    const encodedPath = encodeRepoPath(config.configPath);
    const contentsUrl = new URL(
      `https://api.github.com/repos/${config.repoOwner}/${config.repoName}/contents/${encodedPath}`,
    );
    contentsUrl.searchParams.set('ref', config.repoBranch);

    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };

    let existingSha: string | undefined;
    const getExistingResponse = await fetch(contentsUrl, {
      headers,
    });

    if (getExistingResponse.ok) {
      const existingPayload = (await getExistingResponse.json()) as GithubContentResponse;
      existingSha = existingPayload.sha || existingPayload.content?.sha;
    } else if (getExistingResponse.status !== 404) {
      return createErrorJsonResponse(
        await readGithubError(getExistingResponse),
        getExistingResponse.status,
      );
    }

    const publishResponse = await fetch(contentsUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: Buffer.from(yamlContent, 'utf8').toString('base64'),
        branch: config.repoBranch,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });

    if (!publishResponse.ok) {
      return createErrorJsonResponse(
        await readGithubError(publishResponse),
        publishResponse.status,
      );
    }

    const publishPayload = (await publishResponse.json()) as GithubContentResponse;

    return c.json({
      ok: true,
      repo: `${config.repoOwner}/${config.repoName}`,
      branch: config.repoBranch,
      path: config.configPath,
      commitSha: publishPayload.commit?.sha || null,
      commitUrl: publishPayload.commit?.html_url || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布失败';
    return c.json({ error: message }, 500);
  }
});

export default app;
