const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const target = process.argv[2] === 'server' ? 'server' : 'static';
const apiDirectoryPath = path.join(process.cwd(), 'src', 'app', 'api');
const apiBackupPath = path.join(process.cwd(), 'src', '__app_api_backup__');

function runNextBuild() {
  return new Promise((resolve) => {
    const nextBuild = spawn('next', ['build'], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        COMPASS_BUILD_TARGET: target,
      },
    });

    nextBuild.on('exit', (code) => {
      resolve(code ?? 0);
    });
  });
}

function hideApiRoutesForStaticBuild() {
  if (target !== 'static' || !fs.existsSync(apiDirectoryPath)) {
    return false;
  }

  if (fs.existsSync(apiBackupPath)) {
    fs.rmSync(apiBackupPath, { recursive: true, force: true });
  }

  fs.renameSync(apiDirectoryPath, apiBackupPath);
  return true;
}

function restoreApiRoutes(wereHidden) {
  if (!wereHidden) {
    return;
  }

  if (fs.existsSync(apiDirectoryPath)) {
    fs.rmSync(apiDirectoryPath, { recursive: true, force: true });
  }

  if (fs.existsSync(apiBackupPath)) {
    fs.renameSync(apiBackupPath, apiDirectoryPath);
  }
}

async function main() {
  const apiRoutesWereHidden = hideApiRoutesForStaticBuild();

  try {
    const exitCode = await runNextBuild();
    restoreApiRoutes(apiRoutesWereHidden);
    process.exit(exitCode);
  } catch (error) {
    restoreApiRoutes(apiRoutesWereHidden);
    console.error(error);
    process.exit(1);
  }
}

void main();
