const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const generatorScriptPath = path.join(__dirname, 'generate-icons-manifest.js');
const configPath = path.join(__dirname, '../src/config.yaml');

function runCommand(command, args, options = {}) {
  return spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
}

function runGenerateOnce() {
  return new Promise((resolve, reject) => {
    const generator = runCommand('node', [generatorScriptPath]);
    generator.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`generate-icons-manifest exited with code ${code}`));
    });
  });
}

function createGeneratorWatcher() {
  let isGenerating = false;
  let rerunRequested = false;

  async function runGenerator() {
    if (isGenerating) {
      rerunRequested = true;
      return;
    }

    isGenerating = true;

    try {
      await runGenerateOnce();
    } catch (error) {
      console.error('[icons-watcher] failed to generate icons manifest');
      console.error(error);
    } finally {
      isGenerating = false;

      if (rerunRequested) {
        rerunRequested = false;
        void runGenerator();
      }
    }
  }

  const onChange = (changedPath) => {
    console.log(`[icons-watcher] detected change in ${path.relative(process.cwd(), changedPath)}`);
    void runGenerator();
  };

  const watchers = [
    fs.watch(generatorScriptPath, () => onChange(generatorScriptPath)),
    fs.watch(configPath, () => onChange(configPath)),
  ];

  return function closeWatchers() {
    watchers.forEach((watcher) => watcher.close());
  };
}

async function main() {
  await runGenerateOnce();

  const closeGeneratorWatcher = createGeneratorWatcher();
  const nextDev = runCommand('next', ['dev']);

  const cleanup = () => {
    closeGeneratorWatcher();
    nextDev.kill('SIGTERM');
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  nextDev.on('exit', (code) => {
    cleanup();
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
