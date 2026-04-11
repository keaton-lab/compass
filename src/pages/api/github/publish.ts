import type { APIRoute } from 'astro';
import type { GithubPublishPayload } from '@/shared/types';
import { errorJsonResponse, jsonResponse } from '@/server/api-response';
import {
  encodeRepoPath,
  getCookieValue,
  GITHUB_ACCESS_TOKEN_COOKIE,
  readGithubError,
} from '@/server/github-publishing';
import type { GithubContentResponse } from '@/server/github-publishing';
import {
  canEnableGithubPublishing,
  getGithubRuntimeConfig,
} from '@/server/env';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async () => {
  if (IS_STATIC_BUILD) {
    return jsonResponse({ error: '静态模式不支持该接口' });
  }

  return errorJsonResponse('Method not allowed', 405);
};

export const POST: APIRoute = async ({ cookies, request }) => {
  if (IS_STATIC_BUILD) {
    return errorJsonResponse('静态模式不支持 GitHub 发布', 405);
  }

  const config = getGithubRuntimeConfig();
  const accessToken = getCookieValue(cookies, GITHUB_ACCESS_TOKEN_COOKIE);

  if (!canEnableGithubPublishing() || !config.repoOwner || !config.repoName) {
    return errorJsonResponse('GitHub 发布能力未完整配置', 500);
  }

  if (!accessToken) {
    return errorJsonResponse('请先连接 GitHub', 401);
  }

  try {
    const body = (await request.json()) as GithubPublishPayload;
    const yamlContent = body.yamlContent?.trim();
    const commitMessage =
      body.commitMessage?.trim() ||
      'chore: update Compass config';

    if (!yamlContent) {
      return errorJsonResponse('缺少 yamlContent', 400);
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
    const getExistingResponse = await fetch(contentsUrl, { headers });

    if (getExistingResponse.ok) {
      const existingPayload = (await getExistingResponse.json()) as GithubContentResponse;
      existingSha = existingPayload.sha || existingPayload.content?.sha;
    } else if (getExistingResponse.status !== 404) {
      return errorJsonResponse(
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
      return errorJsonResponse(
        await readGithubError(publishResponse),
        publishResponse.status,
      );
    }

    const publishPayload = (await publishResponse.json()) as GithubContentResponse;

    return jsonResponse({
      ok: true,
      repo: `${config.repoOwner}/${config.repoName}`,
      branch: config.repoBranch,
      path: config.configPath,
      commitSha: publishPayload.commit?.sha || null,
      commitUrl: publishPayload.commit?.html_url || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布失败';
    return errorJsonResponse(message, 500);
  }
};
