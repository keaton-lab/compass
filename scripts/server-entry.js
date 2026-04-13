const env = require('../src/server/env');

const { assertServerStartupEnv } = env;

try {
  const { generatedSessionSecret } = assertServerStartupEnv();

  if (generatedSessionSecret) {
    console.warn('[compass] 未设置 COMPASS_SESSION_SECRET，已自动生成临时会话密钥。');
  }
} catch (error) {
  console.error(`[compass] ${error instanceof Error ? error.message : 'server 模式启动失败。'}`);
  process.exit(1);
}

require('../server.js');
