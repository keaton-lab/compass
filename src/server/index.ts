import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import capabilitiesRoutes from './routes/capabilities';
import configRoutes from './routes/config';
import sessionRoutes from './routes/session';
import githubRoutes from './routes/github';
import { assertServerStartupEnv, getRuntimeMode } from './env';

const app = new Hono();

// CORS 中间件
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// API 路由
app.route('/api/capabilities', capabilitiesRoutes);
app.route('/api/config', configRoutes);
app.route('/api/session', sessionRoutes);
app.route('/api/github', githubRoutes);

// 健康检查
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', mode: getRuntimeMode() });
});

// 静态资源服务 (生产环境)
const mode = getRuntimeMode();
if (mode === 'server' || mode === 'github') {
  // 托管前端构建产物
  app.use('/*', serveStatic({
    root: './dist/client',
  }));
  
  // SPA 路由回退
  app.get('*', (c) => {
    return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compass</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/client/main.tsx"></script>
</body>
</html>
    `);
  });
}

// 启动服务器
const port = Number(process.env.PORT) || 3001;

if (mode === 'server' || mode === 'github') {
  // Server/GitHub 模式: 检查必需环境变量
  try {
    const env = assertServerStartupEnv();
    console.log(`🚀 Compass server starting on port ${port}`);
    console.log(`📋 Mode: ${mode}`);
    console.log(`📁 Config path: ${env.configPath}`);
    
    if (env.generatedSessionSecret) {
      console.log('⚠️  COMPASS_SESSION_SECRET 未设置,已生成临时密钥(重启后会失效)');
    }
  } catch (error) {
    console.error('❌ 启动失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
} else {
  console.log(`🚀 Compass development server starting on port ${port}`);
  console.log(`📋 Mode: ${mode} (development)`);
}

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server running at http://localhost:${port}`);

export default app;
