import crypto from 'crypto';
import path from 'path';

const DEFAULT_CONFIG_RELATIVE_PATH = path.join('src', 'config.yaml');

let generatedSessionSecret: string | undefined;
let sessionSecretWasGenerated = false;

function readEnvString(name: string): string | undefined {
  const value = process.env[name];

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? undefined : trimmedValue;
}

export function resolveConfigPath(): string {
  const configuredPath = readEnvString('COMPASS_CONFIG_PATH');

  if (configuredPath) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.join(process.cwd(), configuredPath);
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

export function getRuntimeMode(): 'static' | 'server' | 'github' {
  const mode = readEnvString('COMPASS_RUNTIME_MODE');
  
  if (mode === 'static' || mode === 'server' || mode === 'github') {
    return mode;
  }
  
  // 默认根据是否有 admin token 判断
  return hasAdminToken() ? 'server' : 'static';
}

export const DEFAULT_CONFIG_PATH = DEFAULT_CONFIG_RELATIVE_PATH;
