import type { Config, ResolvedConfig, Capabilities } from '@/shared/types';
import { parseConfigYaml } from '@/shared/config-yaml';
import { resolveConfigIcons } from '@/shared/icon-resolver';

/**
 * 获取运行时能力
 */
export async function fetchCapabilities(): Promise<Capabilities> {
  const response = await fetch('/api/capabilities');
  
  if (!response.ok) {
    throw new Error('无法获取运行时能力');
  }
  
  return response.json();
}

/**
 * 加载运行时配置
 */
export async function loadRuntimeConfig(): Promise<Config> {
  const capabilities = await fetchCapabilities();
  
  if (capabilities.mode === 'static') {
    // 静态模式：从 /config.yaml 加载
    const response = await fetch('/config.yaml');
    
    if (!response.ok) {
      throw new Error('无法加载配置文件');
    }
    
    const yamlContent = await response.text();
    return parseConfigYaml(yamlContent);
  } else {
    // server/github 模式：从 API 加载
    const response = await fetch('/api/config/runtime');
    
    if (!response.ok) {
      throw new Error('无法加载配置');
    }
    
    return response.json();
  }
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
