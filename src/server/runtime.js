/* eslint-disable @typescript-eslint/no-require-imports */
const buildTarget = require('./build-target');

const { BUILD_TARGET_STATIC, BUILD_TARGET_SERVER, getBuildTarget, isServerBuild } = buildTarget;

let env;

function getEnv() {
  if (!env) {
    env = require('./env');
  }

  return env;
}

function canSaveToServer() {
  const { getSessionSecret, hasAdminToken } = getEnv();
  return isServerBuild() && hasAdminToken() && getSessionSecret().length > 0;
}

module.exports = {
  BUILD_TARGET_STATIC,
  BUILD_TARGET_SERVER,
  getBuildTarget,
  isServerBuild,
  canSaveToServer,
};
