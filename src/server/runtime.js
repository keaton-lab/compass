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
function canSaveToServer() {
  return (
    isServerBuild() &&
    typeof process.env.COMPASS_ADMIN_TOKEN === 'string' &&
    process.env.COMPASS_ADMIN_TOKEN.length > 0 &&
    typeof process.env.COMPASS_SESSION_SECRET === 'string' &&
    process.env.COMPASS_SESSION_SECRET.length > 0
  );
}

module.exports = {
  BUILD_TARGET_STATIC,
  BUILD_TARGET_SERVER,
  getBuildTarget,
  isServerBuild,
  canSaveToServer,
};
