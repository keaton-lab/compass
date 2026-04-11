import { spawn } from 'child_process';
import pkg from '@next/env';
const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd(), true);

// 解析命令行参数，默认为 server 模式
const mode = process.argv[2] === 'static' ? 'static' : 'server';

console.log(`Starting development server with mode: ${mode}`);

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
