import { spawn } from 'child_process';
import pkg from '@next/env';
const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd(), true);

// 解析命令行参数，默认为 server 模式
const mode = process.argv[2] === 'static' ? 'static' : 'server';

console.log(`Starting development server with mode: ${mode}`);

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

async function main() {
  const iconGenerationExitCode = await runStaticBrandIconGeneration();

  if (iconGenerationExitCode !== 0) {
    process.exit(iconGenerationExitCode);
  }

  const devServer = spawn('next', ['dev', '-H', '0.0.0.0'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      COMPASS_BUILD_TARGET: mode,
    },
  });

  devServer.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

void main();
