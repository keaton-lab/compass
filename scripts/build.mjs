import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const target = process.argv[2] === 'server' ? 'server' : 'static';
const envFiles = [
  '.env.production.local',
  '.env.local',
  '.env.production',
  '.env',
];
const apiDirectoryPath = path.join(process.cwd(), 'src', 'app', 'api');
const buildCacheDirectoryPath = path.join(process.cwd(), '.compass-build-cache');
const apiBackupPath = path.join(buildCacheDirectoryPath, 'app-api-backup');
const legacyApiBackupPath = path.join(process.cwd(), 'src', '__app_api_backup__');

function parseEnvLine(line) {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmedLine.indexOf('=');

  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmedLine.slice(0, separatorIndex).trim();

  if (!key) {
    return null;
  }

  let value = trimmedLine.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadBuildEnv() {
  envFiles.forEach((fileName) => {
    const filePath = path.join(process.cwd(), fileName);

    if (!fs.existsSync(filePath)) {
      return;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');

    fileContents.split(/\r?\n/).forEach((line) => {
      const parsed = parseEnvLine(line);

      if (!parsed || process.env[parsed.key] !== undefined) {
        return;
      }

      process.env[parsed.key] = parsed.value;
    });
  });
}

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

function runStaticBrandIconGeneration() {
  return new Promise((resolve) => {
    const generator = spawn('node', ['scripts/generate-static-brand-icons.mjs'], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    });

    generator.on('exit', (code) => {
      resolve(code ?? 0);
    });
  });
}

function hideApiRoutesForStaticBuild() {
  if (target !== 'static') {
    return false;
  }

  if (fs.existsSync(legacyApiBackupPath)) {
    fs.rmSync(legacyApiBackupPath, { recursive: true, force: true });
  }

  if (!fs.existsSync(apiDirectoryPath)) {
    return false;
  }

  fs.mkdirSync(buildCacheDirectoryPath, { recursive: true });

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
  loadBuildEnv();
  const iconGenerationExitCode = await runStaticBrandIconGeneration();

  if (iconGenerationExitCode !== 0) {
    process.exit(iconGenerationExitCode);
  }

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
