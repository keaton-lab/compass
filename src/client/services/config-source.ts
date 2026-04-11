import type {
  Config,
  ResolvedConfig,
  Capabilities,
  GithubConnectionStatus,
  SessionStatus,
} from '@/shared/types';
import { parseConfigYaml } from '@/shared/config-yaml';
import { resolveConfigIcons } from '@/shared/icon-resolver';

async function readJsonResponse<T>(
  response: Response,
  fallbackError: string,
): Promise<T> {
  const rawText = await response.text();

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error(fallbackError);
  }
}

/**
 * 获取运行时能力
 */
export async function fetchCapabilities(): Promise<Capabilities> {
  try {
    const response = await fetch('/api/capabilities');
    if (!response.ok) {
      throw new Error('无法获取运行时能力');
    }
    return await readJsonResponse<Capabilities>(
      response,
      '运行时能力接口返回了非 JSON 内容',
    );
  } catch {
    // API 不可用，返回静态模式
    return {
      mode: 'static',
      canLogin: false,
      canSaveToFile: false,
      canPublishToGithub: false,
    };
  }
}

async function loadStaticConfig(): Promise<Config> {
  const configResponse = await fetch('/config.yaml');

  if (!configResponse.ok) {
    throw new Error('无法加载静态配置文件');
  }

  const yamlContent = await configResponse.text();
  return parseConfigYaml(yamlContent);
}

async function loadApiRuntimeConfig(): Promise<Config> {
  const response = await fetch('/api/config/runtime');

  if (!response.ok) {
    const error = await readJsonResponse<{ error?: string }>(
      response,
      '服务器配置接口返回了非 JSON 内容',
    ).catch(() => null);
    throw new Error(error?.error || '无法从服务器加载配置');
  }

  return readJsonResponse<Config>(
    response,
    '服务器配置接口返回了非 JSON 内容',
  );
}

/**
 * 加载运行时配置
 * 静态模式直接从 /config.yaml 加载
 * Server/GitHub 模式从 API 加载
 */
export async function loadRuntimeConfig(
  capabilities?: Capabilities,
): Promise<Config> {
  const runtimeCapabilities = capabilities ?? (await fetchCapabilities());

  if (runtimeCapabilities.mode === 'static') {
    return loadStaticConfig();
  }

  return loadApiRuntimeConfig();
}

/**
 * 加载已解析图标的配置（用于首页显示）
 */
export async function loadResolvedConfig(): Promise<ResolvedConfig> {
  const config = await loadRuntimeConfig();
  return resolveConfigIcons(config);
}

/**
 * 保存配置到服务器
 */
export async function saveConfigToServer(config: Config): Promise<void> {
  const response = await fetch('/api/config/file', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await readJsonResponse<{ error?: string }>(
      response,
      '保存接口返回了非 JSON 内容',
    ).catch(() => null);
    throw new Error(error?.error || '保存失败');
  }
}

export async function fetchSessionStatus(): Promise<SessionStatus> {
  const response = await fetch('/api/session');

  if (!response.ok) {
    throw new Error('无法获取登录状态');
  }

  return readJsonResponse<SessionStatus>(
    response,
    '登录状态接口返回了非 JSON 内容',
  );
}

export async function loginToServer(token: string): Promise<void> {
  const response = await fetch('/api/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await readJsonResponse<{ error?: string }>(
      response,
      '登录接口返回了非 JSON 内容',
    ).catch(() => null);
    throw new Error(error?.error || '登录失败');
  }
}

export async function logoutFromServer(): Promise<void> {
  const response = await fetch('/api/session', {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await readJsonResponse<{ error?: string }>(
      response,
      '登出接口返回了非 JSON 内容',
    ).catch(() => null);
    throw new Error(error?.error || '登出失败');
  }
}

export async function fetchGithubStatus(): Promise<GithubConnectionStatus> {
  const response = await fetch('/api/github/status');

  if (!response.ok) {
    const error = await readJsonResponse<{ error?: string }>(
      response,
      'GitHub 状态接口返回了非 JSON 内容',
    ).catch(() => null);
    throw new Error(error?.error || '无法获取 GitHub 连接状态');
  }

  return readJsonResponse<GithubConnectionStatus>(
    response,
    'GitHub 状态接口返回了非 JSON 内容',
  );
}

export async function disconnectGithub(): Promise<void> {
  const response = await fetch('/api/github/disconnect', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await readJsonResponse<{ error?: string }>(
      response,
      'GitHub 断开接口返回了非 JSON 内容',
    ).catch(() => null);
    throw new Error(error?.error || '无法断开 GitHub 连接');
  }
}

export async function publishConfigToGithub(
  yamlContent: string,
  commitMessage?: string,
): Promise<void> {
  const response = await fetch('/api/github/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ yamlContent, commitMessage }),
  });

  if (!response.ok) {
    const error = await readJsonResponse<{ error?: string }>(
      response,
      'GitHub 发布接口返回了非 JSON 内容',
    ).catch(() => null);
    throw new Error(error?.error || '发布失败');
  }
}
