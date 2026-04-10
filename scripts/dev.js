const { spawn } = require('child_process');
const { loadEnvConfig } = require('@next/env');
const env = require('../src/server/env');

const { assertServerStartupEnv } = env;

loadEnvConfig(process.cwd(), true);

const requestedTarget = process.argv[2] === 'static' ? 'static' : 'server';
const target = process.env.COMPASS_BUILD_TARGET || requestedTarget;

if (target === 'server') {
  try {
    const { generatedSessionSecret } = assertServerStartupEnv();

    if (generatedSessionSecret) {
      console.warn('[compass] 未设置 COMPASS_SESSION_SECRET，已自动生成临时会话密钥。');
    }
  } catch (error) {
    console.error(`[compass] ${error instanceof Error ? error.message : 'server 模式启动失败。'}`);
    process.exit(1);
  }
}

const devServer = spawn('next', ['dev', '-H', '0.0.0.0'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    COMPASS_BUILD_TARGET: target,
  },
});

devServer.on('exit', (code) => {
  process.exit(code ?? 0);
});
