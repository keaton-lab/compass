import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  Config,
  Capabilities,
  GithubConnectionStatus,
  SessionStatus,
} from '@/shared/types';
import {
  fetchCapabilities,
  fetchGithubStatus,
  fetchSessionStatus,
  loadRuntimeConfig,
  loginToServer,
  logoutFromServer,
  publishConfigToGithub,
  saveConfigToServer,
} from '@/client/services/config-source';
import { parseConfigYaml, serializeConfig } from '@/shared/config-yaml';
import LoadingSpinner from '@/client/components/LoadingSpinner';

/**
 * 编辑页（简化版）
 */
export default function EditPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    authenticated: false,
  });
  const [githubStatus, setGithubStatus] = useState<GithubConnectionStatus | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [yamlContent, setYamlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCapabilities()
      .then(async (caps) => {
        setCapabilities(caps);

        const [configData, sessionData, githubData] = await Promise.all([
          loadRuntimeConfig(caps),
          caps.canLogin ? fetchSessionStatus() : Promise.resolve({ authenticated: false }),
          caps.mode === 'github'
            ? fetchGithubStatus().catch(() => null)
            : Promise.resolve(null),
        ]);

        setConfig(configData);
        setYamlContent(serializeConfig(configData));
        setSessionStatus(sessionData);
        setGithubStatus(githubData);
      })
      .catch((err) => {
        console.error('加载失败:', err);
        setError(err instanceof Error ? err.message : '加载失败');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveToServer = async () => {
    if (!capabilities) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const parsedConfig = parseConfigYaml(yamlContent);
      await saveConfigToServer(parsedConfig);
      setConfig(parsedConfig);
      setYamlContent(serializeConfig(parsedConfig));
      setSuccess('保存成功！');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = async () => {
    if (!adminToken.trim()) {
      setError('请输入管理口令');
      return;
    }

    setAuthLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await loginToServer(adminToken.trim());
      setSessionStatus({ authenticated: true });
      setAdminToken('');
      setSuccess('登录成功，现在可以保存到服务器了。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await logoutFromServer();
      setSessionStatus({ authenticated: false });
      setSuccess('已退出登录。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登出失败');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCopyYaml = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent);
      setSuccess('YAML 已复制到剪贴板！');
      window.setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '复制失败');
    }
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGithubPublish = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      parseConfigYaml(yamlContent);
      await publishConfigToGithub(yamlContent);
      setSuccess('已发布到 GitHub。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">加载失败</h1>
          <p className="text-[var(--text-secondary)]">{error}</p>
          <Link to="/" className="mt-4 inline-block text-[var(--accent)]">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <Link to="/" className="text-[var(--accent)] hover:underline">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mt-4">
            配置编辑器
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            当前模式: {capabilities?.mode || 'unknown'}
          </p>
        </div>

        {/* 消息提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* YAML 编辑器 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            config.yaml
          </label>
          <textarea
            value={yamlContent}
            onChange={(e) => setYamlContent(e.target.value)}
            className="w-full h-96 p-4 bg-[var(--panel)] border border-[var(--panel-border)] rounded-lg text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:border-[var(--accent)]"
            spellCheck={false}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 flex-wrap">
          {/* 静态模式 */}
          {capabilities?.mode === 'static' && (
            <>
              <button
                onClick={handleCopyYaml}
                className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                复制 YAML
              </button>
              <button
                onClick={handleDownloadYaml}
                className="px-6 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:opacity-90 transition-opacity"
              >
                下载 YAML
              </button>
            </>
          )}

          {/* Server 模式 */}
          {capabilities?.mode === 'server' && capabilities.canSaveToFile && sessionStatus.authenticated && (
            <>
              <button
                onClick={handleSaveToServer}
                disabled={saving}
                className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存到服务器'}
              </button>
              <button
                onClick={handleLogout}
                disabled={authLoading}
                className="px-6 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {authLoading ? '处理中...' : '退出登录'}
              </button>
            </>
          )}

          {capabilities?.mode === 'server' && capabilities.canLogin && !sessionStatus.authenticated && (
            <div className="flex gap-3 flex-wrap items-center">
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="输入管理口令"
                className="px-4 py-2 min-w-56 bg-[var(--panel)] border border-[var(--panel-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                onClick={handleLogin}
                disabled={authLoading}
                className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {authLoading ? '登录中...' : '登录后保存'}
              </button>
            </div>
          )}

          {/* GitHub 模式 */}
          {capabilities?.mode === 'github' && githubStatus?.configured && !githubStatus.authenticated && (
            <button
              onClick={() => {
                window.location.href = '/api/github/connect';
              }}
              className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              连接 GitHub
            </button>
          )}

          {capabilities?.mode === 'github' && githubStatus?.configured && githubStatus.authenticated && (
            <button
              onClick={handleGithubPublish}
              disabled={saving}
              className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? '发布中...' : '发布到 GitHub'}
            </button>
          )}
        </div>

        {/* 提示 */}
        <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)]">
          <p className="mb-2">💡 提示:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>完整的可视化编辑器正在迁移中,当前为简化版</li>
            <li>可直接编辑 YAML 内容，保存前会先做语法校验</li>
            {capabilities?.mode === 'static' && <li>静态模式下请复制或下载 YAML 后手动替换配置文件</li>}
            {capabilities?.mode === 'server' && capabilities.canLogin && !sessionStatus.authenticated && (
              <li>Server 模式需要先输入管理口令登录后才能保存</li>
            )}
            {capabilities?.mode === 'server' && sessionStatus.authenticated && (
              <li>Server 模式下保存会直接写入服务器配置文件</li>
            )}
            {capabilities?.mode === 'github' && githubStatus?.configured && !githubStatus.authenticated && (
              <li>GitHub 模式需要先完成 OAuth 授权，再发布到固定仓库</li>
            )}
            {capabilities?.mode === 'github' && githubStatus?.configured && githubStatus.authenticated && (
              <li>
                当前将发布到 {githubStatus.repo} 的 {githubStatus.branch} 分支，路径为 {githubStatus.path}
              </li>
            )}
            {capabilities?.mode === 'github' && !githubStatus?.configured && (
              <li>GitHub 模式尚未配置完整环境变量，当前不可发布</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
