import type { Config, ResolvedConfig, Capabilities } from '@/shared/types';
import { parseConfigYaml } from '@/shared/config-yaml';
import { resolveConfigIcons } from '@/shared/icon-resolver';

/**
 * 获取运行时能力
 */
export async function fetchCapabilities(): Promise<Capabilities> {
  try {
    const response = await fetch('/api/capabilities');
    if (!response.ok) {
      throw new Error('无法获取运行时能力');
    }
    return response.json();
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

/**
 * 加载运行时配置
 * 静态模式直接从 /config.yaml 加载
 * Server/GitHub 模式从 API 加载
 */
export async function loadRuntimeConfig(): Promise<Config> {
  // 首先尝试加载 config.yaml（静态模式）
  try {
    const configResponse = await fetch('/config.yaml');
    if (configResponse.ok) {
      const yamlContent = await configResponse.text();
      return parseConfigYaml(yamlContent);
    }
  } catch {
    // config.yaml 不可用，继续尝试 API
  }

  // 尝试 API 方式（server/github 模式）
  try {
    const response = await fetch('/api/config/runtime');
    if (response.ok) {
      return response.json();
    }
  } catch {
    // API 也不可用
  }

  throw new Error('无法加载配置：静态模式和 API 都不可用');
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
    const error = await response.json();
    throw new Error(error.error || '保存失败');
  }
}
