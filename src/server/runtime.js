/* eslint-disable @typescript-eslint/no-require-imports */
const BUILD_TARGET_STATIC = 'static';
const BUILD_TARGET_SERVER = 'server';
const env = require('./env');

const { getSessionSecret, hasAdminToken } = env;

function getBuildTarget() {
  return process.env.COMPASS_BUILD_TARGET === BUILD_TARGET_SERVER
    ? BUILD_TARGET_SERVER
    : BUILD_TARGET_STATIC;
}

function isServerBuild() {
  return getBuildTarget() === BUILD_TARGET_SERVER;
}
function canSaveToServer() {
  return isServerBuild() && hasAdminToken() && getSessionSecret().length > 0;
}

module.exports = {
  BUILD_TARGET_STATIC,
  BUILD_TARGET_SERVER,
  getBuildTarget,
  isServerBuild,
  canSaveToServer,
};
