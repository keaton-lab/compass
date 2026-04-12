'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dump as yamlDump, load as yamlLoad } from 'js-yaml';
import { LayoutGrid, FolderOpen, Code2, AlertCircle, Check, Lock, Loader2 } from 'lucide-react';
import type { Config } from '../types';
import { useEditState } from './hooks/use-edit-state';
import EditHeader from './components/EditHeader';

const GeneralSettings = dynamic(() => import('./components/GeneralSettings'), {
  loading: () => <SectionLoading />,
});

const CategoriesEditorSection = dynamic(() => import('./components/CategoriesEditorSection'), {
  loading: () => <SectionLoading />,
});

interface EditClientProps {
  initialConfig: Config;
  canSaveToServer: boolean;
}

type EditSection = 'general' | 'categories' | 'yaml';
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type EditSectionConfig = { key: EditSection; label: string; icon: React.ReactNode; count?: number };

const YAML_DUMP_OPTIONS = { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false } as const;

function useServerEditAccess(canSaveToServer: boolean) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(canSaveToServer ? 'loading' : 'authenticated');
  const [loginToken, setLoginToken] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetSaveFeedback = useCallback(() => {
    setSaveSucceeded(false);
    setSaveError(null);
    setStatusMessage(null);
  }, []);

  useEffect(() => {
    if (!canSaveToServer) {
      return;
    }

    let cancelled = false;

    fetch('/api/admin/session', {
      method: 'GET',
      credentials: 'same-origin',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('无法获取登录状态');
        }

        const data = (await response.json()) as {
          authenticated?: boolean;
        };

        if (!cancelled) {
          setAuthStatus(data.authenticated ? 'authenticated' : 'unauthenticated');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthStatus('unauthenticated');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canSaveToServer]);

  const handleLogin = useCallback(async () => {
    if (!loginToken.trim()) {
      setLoginError('请输入管理口令');
      return;
    }

    setIsSubmittingLogin(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ token: loginToken }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || '登录失败');
      }

      setAuthStatus('authenticated');
      setLoginToken('');
      setSaveSucceeded(false);
      setSaveError(null);
      setStatusMessage('已通过身份验证，现在可以直接保存到服务器');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '登录失败');
    } finally {
      setIsSubmittingLogin(false);
    }
  }, [loginToken]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/session', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } finally {
      window.location.href = '/';
    }
  }, []);

  const handleSave = useCallback(async (yamlContent: string, yamlError: string | null) => {
    if (yamlError) {
      setSaveError('YAML 存在格式错误，修复后才能保存');
      setStatusMessage(null);
      return;
    }

    setIsSaving(true);
    resetSaveFeedback();

    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ yamlContent }),
      });
      const payload = (await response.json()) as { error?: string };

      if (response.status === 401) {
        setAuthStatus('unauthenticated');
        throw new Error(payload.error || '登录已失效，请重新登录');
      }

      if (!response.ok) {
        throw new Error(payload.error || '保存失败');
      }

      setSaveSucceeded(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [resetSaveFeedback]);

  return {
    authStatus,
    loginToken,
    loginError,
    isSubmittingLogin,
    isSaving,
    saveSucceeded,
    saveError,
    statusMessage,
    setLoginToken,
    resetSaveFeedback,
    handleLogin,
    handleLogout,
    handleSave,
  };
}

export default function EditClient({ initialConfig, canSaveToServer }: EditClientProps) {
  const { config, setConfig } = useEditState(initialConfig);
  const [activeSection, setActiveSection] = useState<EditSection>('general');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [yamlInput, setYamlInput] = useState<string>('');
  const yamlParseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    authStatus,
    loginToken,
    loginError,
    isSubmittingLogin,
    isSaving,
    saveSucceeded,
    saveError,
    statusMessage,
    setLoginToken,
    resetSaveFeedback,
    handleLogin,
    handleLogout,
    handleSave,
  } = useServerEditAccess(canSaveToServer);

  const yamlContent = useMemo(() => {
    return yamlDump(config, YAML_DUMP_OPTIONS);
  }, [config]);

  useEffect(() => {
    if (activeSection !== 'yaml') {
      setYamlInput(yamlContent);
    }
  }, [yamlContent, activeSection]);

  useEffect(() => {
    return () => {
      if (yamlParseTimerRef.current) {
        clearTimeout(yamlParseTimerRef.current);
      }
    };
  }, []);

  const handleSectionChange = useCallback((nextSection: EditSection) => {
    if (nextSection === 'yaml') {
      setYamlInput(yamlContent);
      setYamlError(null);
    }

    setActiveSection(nextSection);
  }, [yamlContent]);

  const handleYamlChange = useCallback((value: string) => {
    setYamlInput(value);
    resetSaveFeedback();

    if (yamlParseTimerRef.current) {
      clearTimeout(yamlParseTimerRef.current);
    }

    yamlParseTimerRef.current = setTimeout(() => {
      try {
        const parsed = yamlLoad(value) as Config;
        if (!parsed.profile || !parsed.settings || !parsed.categories) {
          throw new Error('配置结构不完整');
        }
        startTransition(() => {
          setConfig(parsed);
          setYamlError(null);
        });
      } catch (err) {
        setYamlError(err instanceof Error ? err.message : 'YAML 格式错误');
      }
    }, 180);
  }, [setConfig, resetSaveFeedback]);

  const updateProfile = useCallback(
    (field: keyof Config['profile'], value: string) => {
      setConfig((prev: Config) => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    },
    [setConfig]
  );

  const updateSettings = useCallback(
    (field: keyof Config['settings'], value: boolean | string) => {
      setConfig((prev: Config) => ({ ...prev, settings: { ...prev.settings, [field]: value } }));
    },
    [setConfig]
  );

  const addCategory = useCallback(() => {
    setConfig((prev: Config) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: `category-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          name: '新分类',
          icon: 'Folder',
          color: '#3b82f6',
          links: [],
        },
      ],
    }));
    setActiveSection('categories');
  }, [setConfig]);

  const updateCategory = useCallback(
    (index: number, field: keyof Config['categories'][number], value: string) => {
      setConfig((prev: Config) => {
        const categories = [...prev.categories];
        categories[index] = { ...categories[index], [field]: value };
        return { ...prev, categories };
      });
    },
    [setConfig]
  );

  const deleteCategory = useCallback(
    (index: number) => {
      setConfig((prev: Config) => ({
        ...prev,
        categories: prev.categories.filter((_: Config['categories'][number], i: number) => i !== index),
      }));
    },
    [setConfig]
  );

  // 处理分类拖拽排序
  const handleCategoriesChange = useCallback((newCategories: Config['categories']) => {
    setConfig((prev: Config) => ({
      ...prev,
      categories: newCategories,
    }));
  }, [setConfig]);

  const addLink = useCallback(
    (categoryIndex: number) => {
      setConfig((prev: Config) => {
        const categories = [...prev.categories];
        categories[categoryIndex] = {
          ...categories[categoryIndex],
          links: [
            ...categories[categoryIndex].links,
            {
              id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              name: '新链接',
              url: 'https://',
              icon: 'Link',
              description: '',
            },
          ],
        };
        return { ...prev, categories };
      });
    },
    [setConfig]
  );

  const updateLink = useCallback(
    (catIdx: number, linkIdx: number, field: string, value: string) => {
      setConfig((prev: Config) => {
        const categories = [...prev.categories];
        const links = [...categories[catIdx].links];
        links[linkIdx] = { ...links[linkIdx], [field]: value };
        categories[catIdx].links = links;
        return { ...prev, categories };
      });
    },
    [setConfig]
  );

  const deleteLink = useCallback(
    (catIdx: number, linkIdx: number) => {
      setConfig((prev: Config) => {
        const categories = [...prev.categories];
        categories[catIdx].links = categories[catIdx].links.filter((_: Config['categories'][number]['links'][number], i: number) => i !== linkIdx);
        return { ...prev, categories };
      });
    },
    [setConfig]
  );

  const sections: EditSectionConfig[] = [
    { key: 'general', label: '基础设置', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'categories', label: '分类和链接', icon: <FolderOpen className="w-4 h-4" />, count: config.categories.length },
    { key: 'yaml', label: 'YAML 编辑', icon: <Code2 className="w-4 h-4" /> },
  ];

  if (canSaveToServer && authStatus === 'loading') {
    return (
      <CenteredStateCard
        icon={<Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />}
        title="正在检查后台权限"
        description="稍等一下，我们正在确认当前会话是否已经登录。"
      />
    );
  }

  if (canSaveToServer && authStatus === 'unauthenticated') {
    return (
      <EditLoginScreen
        loginToken={loginToken}
        loginError={loginError}
        isSubmittingLogin={isSubmittingLogin}
        onLogin={handleLogin}
        onLoginTokenChange={setLoginToken}
      />
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-3 sm:px-6 sm:py-4">
        <EditHeader
          yamlContent={yamlContent}
          canSaveToServer={canSaveToServer}
          onSave={canSaveToServer ? () => void handleSave(yamlContent, yamlError) : undefined}
          saveDisabled={Boolean(yamlError) || isSaving}
          isSaving={isSaving}
          saveSucceeded={saveSucceeded}
          saveError={saveError}
          statusMessage={statusMessage}
          onLogout={canSaveToServer ? () => void handleLogout() : undefined}
        />

        <div className="mb-3 shrink-0 overflow-x-auto pb-1">
          <div className="inline-flex rounded-[18px] border bg-[var(--panel-strong)] p-1" style={{ borderColor: 'var(--panel-border)' }}>
            {sections.map(({ key, label, icon, count }) => {
              const isActive = key === activeSection;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSectionChange(key)}
                  className={`flex items-center gap-1.5 rounded-[14px] px-3 py-2 text-sm font-medium whitespace-nowrap outline-none transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-alpha)] text-[var(--foreground)]'
                      : 'text-[var(--muted)]'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                  {count !== undefined && (
                    <span className="text-xs opacity-60">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {activeSection === 'general' && (
            <div className="h-full overflow-y-auto pr-1 outline-none [scrollbar-gutter:stable]">
              <GeneralSettings
                profile={config.profile}
                settings={config.settings}
                onProfileChange={updateProfile}
                onSettingsChange={updateSettings}
              />
            </div>
          )}

          {activeSection === 'categories' && (
            <div className="h-full outline-none">
              <CategoriesEditorSection
                categories={config.categories}
                onCategoriesChange={handleCategoriesChange}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
                onUpdateLink={updateLink}
                onAddLink={addLink}
                onDeleteLink={deleteLink}
              />
            </div>
          )}

          {activeSection === 'yaml' && (
            <YamlEditorSection
              yamlInput={yamlInput}
              yamlError={yamlError}
              canSaveToServer={canSaveToServer}
              onChange={handleYamlChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EditLoginScreen({
  loginToken,
  loginError,
  isSubmittingLogin,
  onLogin,
  onLoginTokenChange,
}: {
  loginToken: string;
  loginError: string | null;
  isSubmittingLogin: boolean;
  onLogin: () => Promise<void>;
  onLoginTokenChange: (value: string) => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-[28px] border bg-[var(--panel-strong)] p-6 shadow-sm" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-alpha)] text-[var(--accent)]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--foreground)]">登录编辑后台</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                当前为在线编辑模式，登录后可以直接保存配置。
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm text-[var(--text-primary)]">管理口令</span>
              <input
                type="password"
                value={loginToken}
                onChange={(event) => onLoginTokenChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void onLogin();
                  }
                }}
                className="w-full rounded-[18px] border bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors"
                style={{ borderColor: 'var(--panel-border)' }}
                placeholder="输入 COMPASS_ADMIN_TOKEN"
              />
            </label>

            {loginError && (
              <p className="text-sm text-red-400">{loginError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void onLogin()}
                disabled={isSubmittingLogin}
                className="flex items-center gap-2 rounded-[18px] bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingLogin ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    登录中
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    登录并开始编辑
                  </>
                )}
              </button>
              <Link
                href="/"
                className="rounded-[18px] px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
              >
                返回首页
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function YamlEditorSection({
  yamlInput,
  yamlError,
  canSaveToServer,
  onChange,
}: {
  yamlInput: string;
  yamlError: string | null;
  canSaveToServer: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="h-full outline-none">
      <section
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border bg-[var(--panel-strong)]"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
            <Code2 className="w-4 h-4 text-[var(--accent)]" />
            YAML 编辑器
          </h2>
          <div className="flex items-center gap-2">
            {yamlError ? (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                格式错误
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500">
                <Check className="w-3.5 h-3.5" />
                格式正确
              </span>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-gutter:stable]">
          <textarea
            value={yamlInput}
            onChange={(event) => onChange(event.target.value)}
            className={`h-full min-h-[320px] w-full resize-none rounded-[20px] border bg-[var(--background)] p-4 font-mono text-sm text-[var(--foreground)] outline-none transition-colors ${
              yamlError ? 'border-red-500/50' : ''
            }`}
            style={{ borderColor: yamlError ? undefined : 'var(--panel-border)' }}
            placeholder="在此编辑 YAML 配置..."
            spellCheck={false}
          />
          {yamlError && (
            <p className="mt-2 flex items-start gap-2 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{yamlError}</span>
            </p>
          )}
          <p className="mt-3 text-xs text-[var(--muted)]">
            {canSaveToServer
              ? '直接编辑 YAML 内容，修改会自动同步到表单。格式正确后可以点击右上角「保存」直接写回配置文件。'
              : '直接编辑 YAML 内容，修改会自动同步到表单。编辑完成后点击右上角「复制」按钮保存到文件。'}
          </p>
        </div>
      </section>
    </div>
  );
}

function SectionLoading() {
  return (
    <div className="rounded-[24px] border bg-[var(--panel-strong)] px-5 py-10 text-center text-sm text-[var(--muted)]" style={{ borderColor: 'var(--panel-border)' }}>
      正在加载编辑器...
    </div>
  );
}

function CenteredStateCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-[28px] border bg-[var(--panel-strong)] p-6 text-center shadow-sm" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-alpha)]">
            {icon}
          </div>
          <h1 className="mt-4 text-xl font-semibold text-[var(--foreground)]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </section>
      </div>
    </div>
  );
}
