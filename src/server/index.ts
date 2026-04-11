import { Hono } from 'hono';
import { getRequestListener, serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import {
  createServer as createNodeServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { readFile } from 'node:fs/promises';
import capabilitiesRoutes from './routes/capabilities';
import configRoutes from './routes/config';
import sessionRoutes from './routes/session';
import githubRoutes from './routes/github';
import { assertServerStartupEnv, getRuntimeMode, resolveConfigPath } from './env';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { ViteDevServer } from 'vite';

const app = new Hono();
const mode = getRuntimeMode();
const port = Number(process.env.PORT) || 3000;
const clientDistDir = join(process.cwd(), 'dist', 'client');
const useViteDevMiddleware = process.env.COMPASS_DEV_WITH_VITE === 'true';

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

// 配置文件路由：返回 COMPASS_CONFIG_PATH 指向的文件内容
// 确保开发环境下 COMPASS_CONFIG_PATH 对所有模式（包括 static）生效
app.get('/config.yaml', (c) => {
  try {
    const configPath = resolveConfigPath();
    const content = readFileSync(configPath, 'utf-8');
    return c.text(content, 200, {
      'Content-Type': 'text/yaml; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
  } catch {
    return c.text('config.yaml not found', 404);
  }
});

// 健康检查
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', mode: getRuntimeMode() });
});

function isHonoRequest(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  const pathname = new URL(url, 'http://localhost').pathname;
  return pathname === '/api' || pathname.startsWith('/api/') || pathname === '/config.yaml';
}

function configureProductionApp() {
  if (mode !== 'server' && mode !== 'github') {
    return;
  }

  app.use('/*', serveStatic({
    root: clientDistDir,
  }));

  app.get('*', (c) => {
    try {
      const indexPath = join(clientDistDir, 'index.html');
      const indexHtml = readFileSync(indexPath, 'utf-8');
      return c.html(indexHtml);
    } catch (error) {
      console.error('Failed to read index.html:', error);
      return c.text('index.html not found. Did you run `npm run build`?', 404);
    }
  });
}

function validateStartup() {
  try {
    if (mode === 'server' || mode === 'github') {
      const env = assertServerStartupEnv();
      console.log(
        `🚀 Compass ${mode} ${useViteDevMiddleware ? 'dev' : 'server'} starting on port ${port}`,
      );
      console.log(`📁 Config path: ${env.configPath}`);

      if (env.generatedSessionSecret) {
        console.log('⚠️  COMPASS_SESSION_SECRET 未设置,已生成临时密钥(重启后会失效)');
      }
    } else {
      console.log(
        `🚀 Compass ${useViteDevMiddleware ? 'static dev' : 'static server'} starting on port ${port}`,
      );
      console.log(`📁 Config path: ${resolveConfigPath()}`);
    }
  } catch (error) {
    console.error('❌ 启动失败:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function createViteMiddlewareServer() {
  const nodeServer = createNodeServer();
  const honoListener = getRequestListener(app.fetch);
  const { createServer } = await import('vite');

  const vite = await createServer({
    appType: 'spa',
    server: {
      middlewareMode: {
        server: nodeServer,
      },
      host: '0.0.0.0',
    },
  });

  nodeServer.on('request', (req, res) => {
    if (isHonoRequest(req.url)) {
      honoListener(req, res);
      return;
    }

    vite.middlewares(req, res, async (error?: Error) => {
      if (error) {
        respondWithViteError(vite, res, error);
        return;
      }

      if (res.writableEnded) {
        return;
      }

      await serveViteIndexHtml(vite, req, res);
    });
  });

  nodeServer.listen(port, () => {
    console.log(`✅ Dev server running at http://localhost:${port}`);
  });
}

async function serveViteIndexHtml(
  vite: ViteDevServer,
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const acceptHeader = req.headers.accept || '';

    if (!acceptHeader.includes('text/html')) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    const templatePath = join(process.cwd(), 'index.html');
    const template = await readFile(templatePath, 'utf8');
    const html = await vite.transformIndexHtml(req.url || '/', template);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  } catch (error) {
    respondWithViteError(vite, res, error);
  }
}

function respondWithViteError(
  vite: ViteDevServer,
  res: ServerResponse,
  error: unknown,
) {
  const normalizedError =
    error instanceof Error ? error : new Error('Vite middleware error');

  vite.ssrFixStacktrace(normalizedError);
  console.error(normalizedError);
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(normalizedError.message);
}

async function bootstrap() {
  validateStartup();

  if (useViteDevMiddleware) {
    await createViteMiddlewareServer();
    return;
  }

  configureProductionApp();
  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`✅ Server running at http://localhost:${port}`);
}

void bootstrap();

export default app;
