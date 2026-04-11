import crypto from 'crypto';
import path from 'path';
import { existsSync, copyFileSync, mkdirSync } from 'fs';
import type { RuntimeMode } from '@/shared/types';

const DEFAULT_CONFIG_RELATIVE_PATH = path.join('public', 'config.yaml');

let generatedSessionSecret: string | undefined;
let sessionSecretWasGenerated = false;

export function readEnvString(name: string): string | undefined {
  const value = process.env[name];

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? undefined : trimmedValue;
}

/**
 * 确保开发环境下配置文件存在。
 * 如果 COMPASS_CONFIG_PATH 指向的文件不存在，且 public/config.yaml 存在，
 * 则自动将 public/config.yaml 复制到目标路径。
 */
function ensureConfigFileExists(configPath: string): string {
  if (existsSync(configPath)) {
    return configPath;
  }

  const defaultPath = path.join(process.cwd(), DEFAULT_CONFIG_RELATIVE_PATH);

  // 如果目标路径就是默认路径但文件不存在，无需复制
  if (configPath === defaultPath) {
    return configPath;
  }

  // 目标文件不存在，尝试从默认路径复制
  if (existsSync(defaultPath)) {
    const targetDir = path.dirname(configPath);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    copyFileSync(defaultPath, configPath);
    console.log(`📋 已自动复制 ${DEFAULT_CONFIG_RELATIVE_PATH} 到 ${configPath}`);
  }

  return configPath;
}

export function resolveConfigPath(): string {
  const configuredPath = readEnvString('COMPASS_CONFIG_PATH');

  if (configuredPath) {
    const resolvedPath = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.join(process.cwd(), configuredPath);
    return ensureConfigFileExists(resolvedPath);
  }

  return path.join(process.cwd(), DEFAULT_CONFIG_RELATIVE_PATH);
}

export function getAdminToken(): string | undefined {
  return readEnvString('COMPASS_ADMIN_TOKEN');
}

export function hasAdminToken(): boolean {
  return Boolean(getAdminToken());
}

export function getSessionSecret(): string {
  const configuredSecret = readEnvString('COMPASS_SESSION_SECRET');

  if (configuredSecret) {
    return configuredSecret;
  }

  if (!generatedSessionSecret) {
    generatedSessionSecret = crypto.randomBytes(32).toString('hex');
    sessionSecretWasGenerated = true;
    process.env.COMPASS_SESSION_SECRET = generatedSessionSecret;
  }

  return generatedSessionSecret;
}

export function didGenerateSessionSecret(): boolean {
  getSessionSecret();
  return sessionSecretWasGenerated;
}

export function assertServerStartupEnv() {
  const adminToken = getAdminToken();

  if (!adminToken) {
    throw new Error('缺少 COMPASS_ADMIN_TOKEN，server 模式无法启动。');
  }

  return {
    adminToken,
    configPath: resolveConfigPath(),
    generatedSessionSecret: didGenerateSessionSecret(),
    sessionSecret: getSessionSecret(),
  };
}

export function getRuntimeMode(): RuntimeMode {
  const mode = readEnvString('COMPASS_RUNTIME_MODE');
  
  if (mode === 'static' || mode === 'server' || mode === 'github') {
    return mode;
  }
  
  // 默认根据是否有 admin token 判断
  return hasAdminToken() ? 'server' : 'static';
}

export interface GithubRuntimeConfig {
  clientId?: string;
  clientSecret?: string;
  repoOwner?: string;
  repoName?: string;
  repoBranch: string;
  configPath: string;
}

export function getGithubRuntimeConfig(): GithubRuntimeConfig {
  return {
    clientId: readEnvString('GITHUB_CLIENT_ID'),
    clientSecret: readEnvString('GITHUB_CLIENT_SECRET'),
    repoOwner: readEnvString('GITHUB_REPO_OWNER'),
    repoName: readEnvString('GITHUB_REPO_NAME'),
    repoBranch: readEnvString('GITHUB_REPO_BRANCH') || 'main',
    configPath: readEnvString('GITHUB_CONFIG_PATH') || 'public/config.yaml',
  };
}

export function canEnableGithubPublishing(): boolean {
  const config = getGithubRuntimeConfig();

  return Boolean(
    config.clientId &&
      config.clientSecret &&
      config.repoOwner &&
      config.repoName,
  );
}

export function getAppBaseUrl(): string | undefined {
  return readEnvString('APP_BASE_URL');
}

export const DEFAULT_CONFIG_PATH = DEFAULT_CONFIG_RELATIVE_PATH;
