/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('crypto');
const path = require('path');

const DEFAULT_CONFIG_RELATIVE_PATH = path.join('src', 'config.yaml');

let generatedSessionSecret;
let sessionSecretWasGenerated = false;

function readEnvString(name) {
  const value = process.env[name];

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? undefined : trimmedValue;
}

function resolveConfigPath() {
  const configuredPath = readEnvString('COMPASS_CONFIG_PATH');

  if (configuredPath) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.join(process.cwd(), configuredPath);
  }

  return path.join(process.cwd(), DEFAULT_CONFIG_RELATIVE_PATH);
}

function getAdminToken() {
  return readEnvString('COMPASS_ADMIN_TOKEN');
}

function hasAdminToken() {
  return Boolean(getAdminToken());
}

function getSessionSecret() {
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

function didGenerateSessionSecret() {
  getSessionSecret();
  return sessionSecretWasGenerated;
}

function assertServerStartupEnv() {
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

module.exports = {
  DEFAULT_CONFIG_PATH: DEFAULT_CONFIG_RELATIVE_PATH,
  assertServerStartupEnv,
  didGenerateSessionSecret,
  getAdminToken,
  getSessionSecret,
  hasAdminToken,
  resolveConfigPath,
};
