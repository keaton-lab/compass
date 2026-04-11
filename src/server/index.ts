import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import capabilitiesRoutes from './routes/capabilities';
import configRoutes from './routes/config';
import sessionRoutes from './routes/session';
import githubRoutes from './routes/github';
import { assertServerStartupEnv, getRuntimeMode } from './env';
import { readFileSync } from 'fs';
import { join } from 'path';

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

const mode = getRuntimeMode();

// 生产环境: 托管静态资源
if (mode === 'server' || mode === 'github') {
  const clientDir = join(process.cwd(), 'dist', 'client');
  
  // 托管静态资源 (CSS, JS, images 等)
  app.use('/*', serveStatic({
    root: clientDir,
  }));
  
  // SPA 路由回退 - 所有非 API 路由返回 index.html
  app.get('*', (c) => {
    try {
      const indexPath = join(clientDir, 'index.html');
      const indexHtml = readFileSync(indexPath, 'utf-8');
      return c.html(indexHtml);
    } catch (error) {
      console.error('Failed to read index.html:', error);
      return c.text('index.html not found. Did you run `npm run build`?', 404);
    }
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
  console.log(`📋 Mode: ${mode} (API only)`);
  console.log(`💡 Run 'npm run dev:client' to start Vite dev server`);
}

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Server running at http://localhost:${port}`);

export default app;
