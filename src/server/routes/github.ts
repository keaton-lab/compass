import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { SESSION_COOKIE_NAME, isAuthenticatedCookie } from '../auth';
import { getSessionSecret, readEnvString } from '../env';

const app = new Hono();

// GitHub App 配置
function getGithubConfig() {
  return {
    appId: readEnvString('GITHUB_APP_ID'),
    privateKey: readEnvString('GITHUB_APP_PRIVATE_KEY'),
    clientId: readEnvString('GITHUB_CLIENT_ID'),
    clientSecret: readEnvString('GITHUB_CLIENT_SECRET'),
    repoOwner: readEnvString('GITHUB_REPO_OWNER'),
    repoName: readEnvString('GITHUB_REPO_NAME'),
    repoBranch: readEnvString('GITHUB_REPO_BRANCH') || 'main',
    configPath: readEnvString('GITHUB_CONFIG_PATH') || 'src/config.yaml',
  };
}

/**
 * 发起 GitHub App 授权
 * GET /api/github/connect
 */
app.get('/connect', (c) => {
  const config = getGithubConfig();
  
  if (!config.clientId) {
    return c.json({ error: 'GitHub Client ID 未配置' }, 500);
  }

  // 生成 state 参数防止 CSRF
  const state = Math.random().toString(36).substring(7);
  
  // TODO: 存储 state 到 session 或临时存储中
  
  const redirectUri = `${c.req.url.split('/api/github')[0]}/api/github/callback`;
  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=repo`;

  return c.redirect(authorizeUrl);
});

/**
 * GitHub App 授权回调
 * GET /api/github/callback
 */
app.get('/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  
  if (!code) {
    return c.json({ error: '缺少授权码' }, 400);
  }

  // TODO: 验证 state

  const config = getGithubConfig();
  
  if (!config.clientId || !config.clientSecret) {
    return c.json({ error: 'GitHub 配置不完整' }, 500);
  }

  try {
    // 交换授权码获取 access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    // TODO: 存储 access token 到 session
    
    // 重定向到编辑页面
    return c.redirect('/edit?github=connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : '授权失败';
    return c.redirect(`/edit?error=${encodeURIComponent(message)}`);
  }
});

/**
 * 发布配置到 GitHub
 * POST /api/github/publish
 */
app.post('/publish', async (c) => {
  // 检查登录状态
  const sessionSecret = getSessionSecret();
  const sessionCookie = getCookie(c, SESSION_COOKIE_NAME);
  
  if (!isAuthenticatedCookie(sessionCookie, sessionSecret)) {
    return c.json({ error: '未登录' }, 401);
  }

  const config = getGithubConfig();
  
  if (!config.appId || !config.privateKey || !config.repoOwner || !config.repoName) {
    return c.json({ error: 'GitHub 配置不完整' }, 500);
  }

  try {
    const body = await c.req.json();
    const { yamlContent, commitMessage } = body;

    // TODO: 实现 GitHub API 提交逻辑
    // 1. 使用 GitHub App JWT 获取 installation token
    // 2. 使用 installation token 提交文件到指定仓库
    
    // 临时返回成功
    return c.json({ 
      ok: true, 
      message: 'GitHub 发布功能待实现',
      config: {
        repo: `${config.repoOwner}/${config.repoName}`,
        branch: config.repoBranch,
        path: config.configPath,
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布失败';
    return c.json({ error: message }, 500);
  }
});

export default app;
