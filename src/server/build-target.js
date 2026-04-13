/* eslint-disable @typescript-eslint/no-require-imports */
const BUILD_TARGET_STATIC = 'static';
const BUILD_TARGET_SERVER = 'server';

function getBuildTarget() {
  return process.env.COMPASS_BUILD_TARGET === BUILD_TARGET_SERVER
    ? BUILD_TARGET_SERVER
    : BUILD_TARGET_STATIC;
}

function isServerBuild() {
  return getBuildTarget() === BUILD_TARGET_SERVER;
}

module.exports = {
  BUILD_TARGET_STATIC,
  BUILD_TARGET_SERVER,
  getBuildTarget,
  isServerBuild,
};
