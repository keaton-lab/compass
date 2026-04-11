import type { APIContext } from 'astro';
import type { GithubConnectionStatus } from '@/shared/types';
import {
  canEnableGithubPublishing,
  getGithubRuntimeConfig,
} from './env';

export const GITHUB_OAUTH_STATE_COOKIE = 'compass_github_oauth_state';
export const GITHUB_ACCESS_TOKEN_COOKIE = 'compass_github_access_token';
export const GITHUB_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

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

export interface GithubOauthTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export function getGithubCookieOptions(maxAge: number) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

export function encodeRepoPath(pathname: string): string {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function buildGithubStatus(
  authenticated: boolean,
): GithubConnectionStatus {
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

export async function readGithubError(response: Response): Promise<string> {
  const fallback = `GitHub API 请求失败（${response.status}）`;

  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message || fallback;
  } catch {
    return fallback;
  }
}

export function getCookieValue(cookies: APIContext['cookies'], name: string) {
  return cookies.get(name)?.value;
}

export type { GithubContentResponse };
