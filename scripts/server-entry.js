const env = require('../src/server/env');

const { assertServerStartupEnv } = env;
const serverHost = process.env.COMPASS_SERVER_HOST || '0.0.0.0';

// Next standalone reads HOSTNAME to determine the bind address.
process.env.HOSTNAME = serverHost;

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
