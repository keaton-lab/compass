import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Clipboard,
  Code2,
  FolderOpen,
  Loader2,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  Trash2,
  User,
} from "lucide-react";
import type {
  Capabilities,
  Category,
  Config,
  GithubConnectionStatus,
  Link as ConfigLink,
  SessionStatus,
} from "@/shared/types";
import { themePresets } from "@/shared/themes";
import {
  disconnectGithub,
  fetchCapabilities,
  fetchGithubStatus,
  fetchSessionStatus,
  loadRuntimeConfig,
  loginToServer,
  logoutFromServer,
  publishConfigToGithub,
  saveConfigToServer,
} from "@/client/services/config-source";
import { parseConfigYaml, serializeConfig } from "@/shared/config-yaml";
import LoadingSpinner from "@/client/components/LoadingSpinner";

type EditorSection = "profile" | "settings" | "categories" | "yaml";

const EMPTY_SESSION_STATUS: SessionStatus = {
  authenticated: false,
};

const MODE_LABELS: Record<Capabilities["mode"], string> = {
  static: "静态模式",
  server: "Server 模式",
};

const SECTION_ITEMS: Array<{
  key: EditorSection;
  label: string;
  icon: typeof User;
}> = [
  { key: "profile", label: "资料", icon: User },
  { key: "settings", label: "设置", icon: SettingsIcon },
  { key: "categories", label: "分类", icon: FolderOpen },
  { key: "yaml", label: "YAML", icon: Code2 },
];

export default function EditPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>(EMPTY_SESSION_STATUS);
  const [githubStatus, setGithubStatus] =
    useState<GithubConnectionStatus | null>(null);
  const [yamlContent, setYamlContent] = useState("");
  const [baselineYaml, setBaselineYaml] = useState("");
  const [activeSection, setActiveSection] = useState<EditorSection>("profile");
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const searchError = currentUrl.searchParams.get("error");
    const githubResult = currentUrl.searchParams.get("github");

    if (!searchError && githubResult !== "connected") {
      return;
    }

    if (searchError) {
      setError(searchError);
    }

    if (githubResult === "connected") {
      setSuccess("GitHub 已连接，现在可以直接发布配置了。");
    }

    window.history.replaceState({}, "", "/edit");
  }, []);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccess(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [success]);

  useEffect(() => {
    void loadEditorData();
  }, []);

  async function loadEditorData(showReloadSuccess = false) {
    const isInitialLoad = config === null;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const runtimeCapabilities = await fetchCapabilities();
      const [runtimeConfig, runtimeSession, runtimeGithubStatus] =
        await Promise.all([
          loadRuntimeConfig(runtimeCapabilities),
          runtimeCapabilities.canLogin
            ? fetchSessionStatus().catch(() => EMPTY_SESSION_STATUS)
            : Promise.resolve(EMPTY_SESSION_STATUS),
          runtimeCapabilities.canPublishToGithub
            ? fetchGithubStatus().catch(() => null)
            : Promise.resolve(null),
        ]);
      const serializedYaml = serializeConfig(runtimeConfig);

      setCapabilities(runtimeCapabilities);
      setConfig(runtimeConfig);
      setSessionStatus(runtimeSession);
      setGithubStatus(runtimeGithubStatus);
      setYamlContent(serializedYaml);
      setBaselineYaml(serializedYaml);
      setYamlError(null);
      setFormError(null);

      if (showReloadSuccess) {
        setError(null);
        setSuccess("已重新加载最新配置。");
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError, "加载配置失败"));
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }

  function applyConfigUpdate(nextConfig: Config) {
    setConfig(nextConfig);

    try {
      const nextYaml = serializeConfig(nextConfig);
      setYamlContent(nextYaml);
      setYamlError(null);
      setFormError(null);
    } catch (nextError) {
      setFormError(getErrorMessage(nextError, "配置校验失败"));
    }
  }

  function updateProfileField(field: keyof Config["profile"], value: string) {
    if (!config) {
      return;
    }

    applyConfigUpdate({
      ...config,
      profile: {
        ...config.profile,
        [field]: value,
      },
    });
  }

  function updateSettingsField(
    field: keyof Config["settings"],
    value: Config["settings"][keyof Config["settings"]],
  ) {
    if (!config) {
      return;
    }

    applyConfigUpdate({
      ...config,
      settings: {
        ...config.settings,
        [field]: value,
      },
    });
  }

  function updateCategoryField(
    categoryIndex: number,
    field: keyof Category,
    value: string | Category["links"],
  ) {
    if (!config) {
      return;
    }

    const nextCategories = config.categories.map((category, index) =>
      index === categoryIndex
        ? {
            ...category,
            [field]: value,
          }
        : category,
    );

    applyConfigUpdate({
      ...config,
      categories: nextCategories,
    });
  }

  function addCategory() {
    if (!config) {
      return;
    }

    const nextCategory: Category = {
      id: createDraftId("category", config.categories.length + 1),
      name: "新分类",
      icon: "FolderOpen",
      color: "#3b82f6",
      links: [],
    };

    applyConfigUpdate({
      ...config,
      categories: [...config.categories, nextCategory],
    });
    setActiveSection("categories");
  }

  function removeCategory(categoryIndex: number) {
    if (!config) {
      return;
    }

    const category = config.categories[categoryIndex];
    const confirmed = window.confirm(
      `确认删除分类“${category.name || "未命名分类"}”？该分类下的链接也会一起移除。`,
    );

    if (!confirmed) {
      return;
    }

    applyConfigUpdate({
      ...config,
      categories: config.categories.filter(
        (_, index) => index !== categoryIndex,
      ),
    });
  }

  function moveCategory(categoryIndex: number, direction: -1 | 1) {
    if (!config) {
      return;
    }

    const targetIndex = categoryIndex + direction;
    const nextCategories = moveItem(
      config.categories,
      categoryIndex,
      targetIndex,
    );

    if (nextCategories === config.categories) {
      return;
    }

    applyConfigUpdate({
      ...config,
      categories: nextCategories,
    });
  }

  function addLink(categoryIndex: number) {
    if (!config) {
      return;
    }

    const nextLink: ConfigLink = {
      id: createDraftId(
        "link",
        config.categories[categoryIndex].links.length + 1,
      ),
      name: "新链接",
      url: "https://",
      icon: "Link",
      description: "",
    };

    const nextCategories = config.categories.map((category, index) =>
      index === categoryIndex
        ? {
            ...category,
            links: [...category.links, nextLink],
          }
        : category,
    );

    applyConfigUpdate({
      ...config,
      categories: nextCategories,
    });
  }

  function updateLinkField(
    categoryIndex: number,
    linkIndex: number,
    field: keyof ConfigLink,
    value: string,
  ) {
    if (!config) {
      return;
    }

    const nextCategories = config.categories.map(
      (category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) {
          return category;
        }

        return {
          ...category,
          links: category.links.map((link, currentLinkIndex) =>
            currentLinkIndex === linkIndex
              ? {
                  ...link,
                  [field]: value,
                }
              : link,
          ),
        };
      },
    );

    applyConfigUpdate({
      ...config,
      categories: nextCategories,
    });
  }

  function removeLink(categoryIndex: number, linkIndex: number) {
    if (!config) {
      return;
    }

    const link = config.categories[categoryIndex].links[linkIndex];
    const confirmed = window.confirm(
      `确认删除链接“${link.name || "未命名链接"}”？这个操作不能撤销。`,
    );

    if (!confirmed) {
      return;
    }

    const nextCategories = config.categories.map(
      (category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              links: category.links.filter(
                (_, currentLinkIndex) => currentLinkIndex !== linkIndex,
              ),
            }
          : category,
    );

    applyConfigUpdate({
      ...config,
      categories: nextCategories,
    });
  }

  function moveLink(
    categoryIndex: number,
    linkIndex: number,
    direction: -1 | 1,
  ) {
    if (!config) {
      return;
    }

    const category = config.categories[categoryIndex];
    const nextLinks = moveItem(
      category.links,
      linkIndex,
      linkIndex + direction,
    );

    if (nextLinks === category.links) {
      return;
    }

    const nextCategories = config.categories.map(
      (currentCategory, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...currentCategory,
              links: nextLinks,
            }
          : currentCategory,
    );

    applyConfigUpdate({
      ...config,
      categories: nextCategories,
    });
  }

  function handleYamlChange(value: string) {
    setYamlContent(value);

    try {
      const parsedConfig = parseConfigYaml(value);
      setConfig(parsedConfig);
      setYamlError(null);
      setFormError(null);
    } catch (parseError) {
      setYamlError(getErrorMessage(parseError, "YAML 格式错误"));
    }
  }

  async function handleCopyYaml() {
    if (formError) {
      setError("请先修复表单中的校验问题，再导出 YAML。");
      return;
    }

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(yamlContent);
      } else if (!copyWithFallback(yamlContent)) {
        throw new Error("复制失败，请手动复制 YAML。");
      }

      setError(null);
      setSuccess("YAML 已复制到剪贴板。");
    } catch (copyError) {
      setError(getErrorMessage(copyError, "复制失败"));
    }
  }

  function handleFormatYaml() {
    if (formError) {
      setError("表单存在未完成字段，暂时无法格式化 YAML。");
      return;
    }

    try {
      const parsedConfig = parseConfigYaml(yamlContent);
      const formattedYaml = serializeConfig(parsedConfig);

      setConfig(parsedConfig);
      setYamlContent(formattedYaml);
      setYamlError(null);
      setFormError(null);
      setError(null);
      setSuccess("YAML 已重新格式化。");
    } catch (formatError) {
      setError(getErrorMessage(formatError, "YAML 格式化失败"));
    }
  }

  async function handleReload() {
    if (
      hasUnsavedChanges(yamlContent, baselineYaml, formError) &&
      !window.confirm("当前有未保存修改，确认重新加载并丢弃本地改动吗？")
    ) {
      return;
    }

    await loadEditorData(true);
  }

  async function handleSaveToServer() {
    if (!capabilities || !capabilities.canSaveToFile) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (formError) {
        throw new Error("请先修复表单中的校验问题。");
      }

      const parsedConfig = parseConfigYaml(yamlContent);
      const normalizedYaml = serializeConfig(parsedConfig);

      await saveConfigToServer(parsedConfig);
      setConfig(parsedConfig);
      setYamlContent(normalizedYaml);
      setBaselineYaml(normalizedYaml);
      setYamlError(null);
      setFormError(null);
      setSuccess("已保存到服务器配置文件。");
    } catch (saveError) {
      setError(getErrorMessage(saveError, "保存失败"));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogin() {
    if (!adminToken.trim()) {
      setError("请输入管理口令。");
      return;
    }

    setAuthLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await loginToServer(adminToken.trim());
      setSessionStatus({ authenticated: true });
      setAdminToken("");
      setSuccess("登录成功，现在可以保存到服务器了。");
    } catch (loginError) {
      setError(getErrorMessage(loginError, "登录失败"));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setAuthLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await logoutFromServer();
      setSessionStatus(EMPTY_SESSION_STATUS);
      setSuccess("已退出登录。");
    } catch (logoutError) {
      setError(getErrorMessage(logoutError, "退出登录失败"));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGithubPublish() {
    if (!capabilities || !capabilities.canPublishToGithub) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (formError) {
        throw new Error("请先修复表单中的校验问题。");
      }

      const parsedConfig = parseConfigYaml(yamlContent);
      const normalizedYaml = serializeConfig(parsedConfig);

      await publishConfigToGithub(normalizedYaml);
      setConfig(parsedConfig);
      setYamlContent(normalizedYaml);
      setBaselineYaml(normalizedYaml);
      setYamlError(null);
      setFormError(null);
      setSuccess("已发布到 GitHub 仓库。");
    } catch (publishError) {
      setError(getErrorMessage(publishError, "发布失败"));
    } finally {
      setSaving(false);
    }
  }

  async function handleGithubDisconnect() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await disconnectGithub();
      setGithubStatus((currentStatus) =>
        currentStatus
          ? {
              ...currentStatus,
              authenticated: false,
            }
          : null,
      );
      setSuccess("GitHub 连接已断开。");
    } catch (disconnectError) {
      setError(getErrorMessage(disconnectError, "断开 GitHub 连接失败"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!config || !capabilities) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <div
          className="w-full max-w-md rounded-3xl border bg-[var(--panel)] p-6 text-center"
          style={{ borderColor: "var(--panel-border)" }}
        >
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            加载失败
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {error || "未能加载编辑器数据。"}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => void loadEditorData()}
              className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"
            >
              重新加载
            </button>
            <a
              href="/"
              className="rounded-xl border px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]"
              style={{ borderColor: "var(--panel-border)" }}
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    );
  }

  const linkCount = config.categories.reduce(
    (total, category) => total + category.links.length,
    0,
  );
  const currentMode = MODE_LABELS[capabilities.mode];
  const validationMessage = formError
    ? `${formError} 当前 YAML 保持最近一次有效内容。`
    : yamlError
      ? `${yamlError} 表单继续显示最近一次有效配置。`
      : null;
  const isDirty = hasUnsavedChanges(yamlContent, baselineYaml, formError);
  const saveDisabled =
    saving ||
    authLoading ||
    refreshing ||
    Boolean(formError || yamlError) ||
    !isDirty;
  const exportDisabled = Boolean(formError);
  const formatDisabled = Boolean(formError || yamlError);
  const primaryStatusText =
    formError || yamlError ? "待修复" : isDirty ? "未保存" : "已同步";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </a>
            <button
              type="button"
              onClick={() => void handleReload()}
              disabled={refreshing || saving || authLoading}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: "var(--panel-border)" }}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              重新加载
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                配置编辑器
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <StatusPill label="运行模式" value={currentMode} />
              <StatusPill label="分类" value={`${config.categories.length}`} />
              <StatusPill label="链接" value={`${linkCount}`} />
              <StatusPill
                label="状态"
                value={primaryStatusText}
                accent={!formError && !yamlError}
              />
            </div>
          </div>
        </div>

        <div
          className="sticky top-0 z-20 mt-6 rounded-2xl border bg-[var(--background)]/95 p-4 shadow-sm backdrop-blur"
          style={{ borderColor: "var(--panel-border)" }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {capabilities.canSaveToFile && sessionStatus.authenticated && (
                <>
                  <ActionButton
                    onClick={() => void handleSaveToServer()}
                    disabled={saveDisabled}
                    variant="primary"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    保存到服务器
                  </ActionButton>
                  <ActionButton
                    onClick={() => void handleLogout()}
                    disabled={authLoading || saving}
                    variant="secondary"
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    退出登录
                  </ActionButton>
                </>
              )}

              {capabilities.canPublishToGithub &&
                githubStatus?.configured &&
                !githubStatus.authenticated && (
                  <ActionButton
                    onClick={() => {
                      window.location.href = "/api/github/connect";
                    }}
                    disabled={saving}
                    variant="primary"
                  >
                    连接 GitHub
                  </ActionButton>
                )}

              {capabilities.canPublishToGithub &&
                githubStatus?.configured &&
                githubStatus.authenticated && (
                  <>
                    <ActionButton
                      onClick={() => void handleGithubPublish()}
                      disabled={saveDisabled}
                      variant="primary"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      发布到 GitHub
                    </ActionButton>
                    <ActionButton
                      onClick={() => void handleGithubDisconnect()}
                      disabled={saving}
                      variant="secondary"
                    >
                      断开连接
                    </ActionButton>
                  </>
                )}

              <ActionButton
                onClick={() => void handleCopyYaml()}
                disabled={exportDisabled}
                variant="secondary"
              >
                <Clipboard className="h-4 w-4" />
                复制 YAML
              </ActionButton>

              <ActionButton
                onClick={handleFormatYaml}
                disabled={formatDisabled}
                variant="secondary"
              >
                <Code2 className="h-4 w-4" />
                格式化 YAML
              </ActionButton>
            </div>

            {capabilities.canLogin && !sessionStatus.authenticated && (
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    管理口令
                  </label>
                  <input
                    type="password"
                    value={adminToken}
                    onChange={(event) => setAdminToken(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleLogin();
                      }
                    }}
                    placeholder="输入 COMPASS_ADMIN_TOKEN"
                    className="w-full rounded-xl border bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    style={{ borderColor: "var(--panel-border)" }}
                  />
                </div>

                <div className="flex items-end">
                  <ActionButton
                    onClick={() => void handleLogin()}
                    disabled={authLoading}
                    variant="primary"
                    fullWidth
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    登录后保存
                  </ActionButton>
                </div>
              </div>
            )}

            <ModeHintCard
              capabilities={capabilities}
              sessionStatus={sessionStatus}
              githubStatus={githubStatus}
            />
          </div>
        </div>

        {error && (
          <Banner className="mt-4 border-red-500/30 bg-red-500/10 text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </Banner>
        )}

        {success && (
          <Banner className="mt-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </Banner>
        )}

        {validationMessage && (
          <Banner className="mt-4 border-amber-500/30 bg-amber-500/10 text-amber-500">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{validationMessage}</span>
          </Banner>
        )}

        <div className="mt-6 overflow-x-auto pb-1">
          <div
            className="inline-flex min-w-full gap-2 rounded-2xl border p-1"
            style={{
              borderColor: "var(--panel-border)",
              backgroundColor: "var(--panel)",
            }}
          >
            {SECTION_ITEMS.map((sectionItem) => {
              const Icon = sectionItem.icon;
              const active = activeSection === sectionItem.key;

              return (
                <button
                  key={sectionItem.key}
                  type="button"
                  onClick={() => setActiveSection(sectionItem.key)}
                  className={`inline-flex min-w-[88px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--accent-alpha)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {sectionItem.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeSection === "profile" && (
          <SectionCard
            className="mt-6"
            icon={<User className="h-4 w-4 text-[var(--accent)]" />}
            title="个人资料"
            description="头像可填写图标名称（如 navigation），也可以填写普通图片地址。"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="名称"
                value={config.profile.name}
                onChange={(value) => updateProfileField("name", value)}
                error={validateRequired(config.profile.name, "profile.name")}
                placeholder="Compass"
              />
              <TextField
                label="头像"
                value={config.profile.avatar || ""}
                onChange={(value) => updateProfileField("avatar", value)}
                placeholder="navigation 或 https://..."
                mono
              />
              <TextField
                label="简介"
                value={config.profile.description}
                onChange={(value) => updateProfileField("description", value)}
                error={validateRequired(
                  config.profile.description,
                  "profile.description",
                )}
                placeholder="一句话描述你的导航页"
              />
            </div>

            <div className="mt-4">
              <TextAreaField
                label="补充说明"
                value={config.profile.bio || ""}
                onChange={(value) => updateProfileField("bio", value)}
                placeholder="用于首页简介、欢迎语或说明信息"
              />
            </div>
          </SectionCard>
        )}

        {activeSection === "settings" && (
          <SectionCard
            className="mt-6"
            icon={<SettingsIcon className="h-4 w-4 text-[var(--accent)]" />}
            title="显示设置"
            description="这里只保留最常用的开关，避免把编辑页做得太重。"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="主题"
                value={config.settings.theme}
                onChange={(value) =>
                  updateSettingsField(
                    "theme",
                    value as Config["settings"]["theme"],
                  )
                }
                options={themePresets.map((theme) => ({
                  value: theme.id,
                  label: theme.label,
                }))}
              />
              <SelectField
                label="布局"
                value={config.settings.layout}
                onChange={(value) =>
                  updateSettingsField(
                    "layout",
                    value as Config["settings"]["layout"],
                  )
                }
                options={[
                  { value: "grid", label: "网格" },
                  { value: "list", label: "列表" },
                ]}
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ToggleField
                label="显示搜索框"
                checked={config.settings.showSearch}
                onChange={(checked) =>
                  updateSettingsField("showSearch", checked)
                }
              />
              <ToggleField
                label="启用动画"
                checked={config.settings.animations}
                onChange={(checked) =>
                  updateSettingsField("animations", checked)
                }
              />
            </div>

            <div className="mt-4">
              <TextField
                label="默认搜索词"
                value={config.settings.searchQuery || ""}
                onChange={(value) => updateSettingsField("searchQuery", value)}
                placeholder="可留空"
              />
            </div>
          </SectionCard>
        )}

        {activeSection === "categories" && (
          <SectionCard
            className="mt-6"
            icon={<FolderOpen className="h-4 w-4 text-[var(--accent)]" />}
            title="分类与链接"
            description="采用卡片堆叠布局，手机上也能直接增删改。"
            action={
              <ActionButton onClick={addCategory} variant="primary">
                <Plus className="h-4 w-4" />
                添加分类
              </ActionButton>
            }
          >
            {config.categories.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed px-4 py-10 text-center text-sm text-[var(--text-secondary)]"
                style={{ borderColor: "var(--panel-border)" }}
              >
                暂无分类，先添加一个分类开始编辑。
              </div>
            ) : (
              <div className="space-y-4">
                {config.categories.map((category, categoryIndex) => (
                  <div
                    key={category.id || `category-${categoryIndex}`}
                    className="rounded-2xl border bg-[var(--panel)]"
                    style={{ borderColor: "var(--panel-border)" }}
                  >
                    <div
                      className="h-1.5 rounded-t-2xl"
                      style={{
                        backgroundColor: normalizeColorPreview(category.color),
                      }}
                    />

                    <div
                      className="border-b px-4 py-4"
                      style={{ borderColor: "var(--panel-border)" }}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-[var(--text-primary)]">
                            {category.name || `分类 ${categoryIndex + 1}`}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            {category.links.length} 个链接
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <ActionButton
                            onClick={() => moveCategory(categoryIndex, -1)}
                            disabled={categoryIndex === 0}
                            variant="secondary"
                          >
                            <ArrowUp className="h-4 w-4" />
                            上移
                          </ActionButton>
                          <ActionButton
                            onClick={() => moveCategory(categoryIndex, 1)}
                            disabled={
                              categoryIndex === config.categories.length - 1
                            }
                            variant="secondary"
                          >
                            <ArrowDown className="h-4 w-4" />
                            下移
                          </ActionButton>
                          <ActionButton
                            onClick={() => removeCategory(categoryIndex)}
                            variant="danger"
                          >
                            <Trash2 className="h-4 w-4" />
                            删除
                          </ActionButton>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <TextField
                          label="分类 ID"
                          value={category.id}
                          onChange={(value) =>
                            updateCategoryField(categoryIndex, "id", value)
                          }
                          error={validateRequired(
                            category.id,
                            `categories[${categoryIndex}].id`,
                          )}
                          mono
                        />
                        <TextField
                          label="分类名称"
                          value={category.name}
                          onChange={(value) =>
                            updateCategoryField(categoryIndex, "name", value)
                          }
                          error={validateRequired(
                            category.name,
                            `categories[${categoryIndex}].name`,
                          )}
                        />
                        <TextField
                          label="图标名称"
                          value={category.icon}
                          onChange={(value) =>
                            updateCategoryField(categoryIndex, "icon", value)
                          }
                          error={validateRequired(
                            category.icon,
                            `categories[${categoryIndex}].icon`,
                          )}
                          placeholder="FolderOpen 或 github"
                          mono
                        />
                        <ColorField
                          label="分类颜色"
                          value={category.color}
                          onChange={(value) =>
                            updateCategoryField(categoryIndex, "color", value)
                          }
                          error={validateHexColor(
                            category.color,
                            `categories[${categoryIndex}].color`,
                          )}
                        />
                      </div>

                      <div className="mt-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                              链接列表
                            </h4>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              图标遵循 Lucide PascalCase 或 simple-icons
                              小写命名。
                            </p>
                          </div>

                          <ActionButton
                            onClick={() => addLink(categoryIndex)}
                            variant="secondary"
                          >
                            <Plus className="h-4 w-4" />
                            添加链接
                          </ActionButton>
                        </div>

                        {category.links.length === 0 ? (
                          <div
                            className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-[var(--text-secondary)]"
                            style={{ borderColor: "var(--panel-border)" }}
                          >
                            当前分类还没有链接。
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {category.links.map((link, linkIndex) => (
                              <div
                                key={link.id || `link-${linkIndex}`}
                                className="rounded-2xl border bg-[var(--background)] p-4"
                                style={{ borderColor: "var(--panel-border)" }}
                              >
                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                                      {link.name || `链接 ${linkIndex + 1}`}
                                    </p>
                                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                      第 {linkIndex + 1} 项
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <ActionButton
                                      onClick={() =>
                                        moveLink(categoryIndex, linkIndex, -1)
                                      }
                                      disabled={linkIndex === 0}
                                      variant="secondary"
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                      上移
                                    </ActionButton>
                                    <ActionButton
                                      onClick={() =>
                                        moveLink(categoryIndex, linkIndex, 1)
                                      }
                                      disabled={
                                        linkIndex === category.links.length - 1
                                      }
                                      variant="secondary"
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                      下移
                                    </ActionButton>
                                    <ActionButton
                                      onClick={() =>
                                        removeLink(categoryIndex, linkIndex)
                                      }
                                      variant="danger"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      删除
                                    </ActionButton>
                                  </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <TextField
                                    label="链接 ID"
                                    value={link.id}
                                    onChange={(value) =>
                                      updateLinkField(
                                        categoryIndex,
                                        linkIndex,
                                        "id",
                                        value,
                                      )
                                    }
                                    error={validateRequired(
                                      link.id,
                                      `categories[${categoryIndex}].links[${linkIndex}].id`,
                                    )}
                                    mono
                                  />
                                  <TextField
                                    label="链接名称"
                                    value={link.name}
                                    onChange={(value) =>
                                      updateLinkField(
                                        categoryIndex,
                                        linkIndex,
                                        "name",
                                        value,
                                      )
                                    }
                                    error={validateRequired(
                                      link.name,
                                      `categories[${categoryIndex}].links[${linkIndex}].name`,
                                    )}
                                  />
                                  <TextField
                                    label="链接地址"
                                    value={link.url}
                                    onChange={(value) =>
                                      updateLinkField(
                                        categoryIndex,
                                        linkIndex,
                                        "url",
                                        value,
                                      )
                                    }
                                    error={validateUrl(
                                      link.url,
                                      `categories[${categoryIndex}].links[${linkIndex}].url`,
                                    )}
                                    placeholder="https://..."
                                    type="url"
                                    mono
                                  />
                                  <TextField
                                    label="图标名称"
                                    value={link.icon}
                                    onChange={(value) =>
                                      updateLinkField(
                                        categoryIndex,
                                        linkIndex,
                                        "icon",
                                        value,
                                      )
                                    }
                                    error={validateRequired(
                                      link.icon,
                                      `categories[${categoryIndex}].links[${linkIndex}].icon`,
                                    )}
                                    placeholder="github / Mail / Link"
                                    mono
                                  />
                                </div>

                                <div className="mt-4">
                                  <TextAreaField
                                    label="描述"
                                    value={link.description}
                                    onChange={(value) =>
                                      updateLinkField(
                                        categoryIndex,
                                        linkIndex,
                                        "description",
                                        value,
                                      )
                                    }
                                    placeholder="可留空"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {activeSection === "yaml" && (
          <SectionCard
            className="mt-6"
            icon={<Code2 className="h-4 w-4 text-[var(--accent)]" />}
            title="YAML 编辑"
            description="这里可以直接处理完整的 `config.yaml`，格式正确后会同步回表单。"
          >
            <textarea
              value={yamlContent}
              onChange={(event) => handleYamlChange(event.target.value)}
              className={`min-h-[420px] w-full rounded-2xl border bg-[var(--background)] p-4 font-mono text-sm leading-6 text-[var(--text-primary)] outline-none transition-colors ${
                yamlError ? "border-red-500/40" : ""
              }`}
              style={{
                borderColor: yamlError ? undefined : "var(--panel-border)",
              }}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />

            <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <p>
                当前状态:{" "}
                {yamlError ? "YAML 需要修复" : "YAML 可直接保存或导出"}
              </p>
              <p>
                表单变更会自动刷新 YAML； YAML
                手动修改解析成功后，也会立即回写到表单。
              </p>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

function StatusPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        accent ? "bg-[var(--accent-alpha)]" : "bg-[var(--panel)]"
      }`}
      style={{
        borderColor: accent ? "var(--accent-border)" : "var(--panel-border)",
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}

function Banner({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${className}`}
    >
      {children}
    </div>
  );
}

function ActionButton({
  children,
  disabled = false,
  fullWidth = false,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick: () => void;
  variant: "primary" | "secondary" | "danger";
}) {
  const baseClassName = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
    fullWidth ? "w-full" : ""
  }`;

  if (variant === "primary") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${baseClassName} bg-[var(--accent)] text-white`}
      >
        {children}
      </button>
    );
  }

  if (variant === "danger") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${baseClassName} border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClassName} border bg-[var(--panel)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]`}
      style={{ borderColor: "var(--panel-border)" }}
    >
      {children}
    </button>
  );
}

function ModeHintCard({
  capabilities,
  sessionStatus,
  githubStatus,
}: {
  capabilities: Capabilities;
  sessionStatus: SessionStatus;
  githubStatus: GithubConnectionStatus | null;
}) {
  if (capabilities.mode === "static") {
    return (
      <div
        className="rounded-xl border bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text-secondary)]"
        style={{ borderColor: "var(--panel-border)" }}
      >
        静态模式下不会直接写回服务器，编辑完成后请复制或下载 `config.yaml`
        再替换配置文件。
      </div>
    );
  }

  const messages: React.ReactNode[] = [];

  if (capabilities.canSaveToFile) {
    messages.push(
      sessionStatus.authenticated
        ? "当前已登录，点击“保存到服务器”会直接写入运行时配置文件。"
        : "当前未登录，可以先编辑内容；输入管理口令后即可保存到服务器。",
    );
  } else {
    messages.push(
      "当前服务端未启用直接保存能力，编辑完成后仍可复制或下载 `config.yaml`。",
    );
  }

  if (!capabilities.canPublishToGithub) {
    messages.push("当前服务端未启用 GitHub 发布能力。");
  } else if (!githubStatus?.configured) {
    messages.push("GitHub 发布环境变量尚未配置完整，当前无法执行发布。");
  } else if (githubStatus.authenticated) {
    messages.push(
      <>
        当前将发布到{" "}
        <span className="font-medium text-[var(--text-primary)]">
          {githubStatus.repo}
        </span>{" "}
        的{" "}
        <span className="font-medium text-[var(--text-primary)]">
          {githubStatus.branch}
        </span>{" "}
        分支，路径为{" "}
        <span className="font-mono text-[var(--text-primary)]">
          {githubStatus.path}
        </span>
        。
      </>,
    );
  } else {
    messages.push("连接 GitHub 后即可把当前 YAML 直接发布到固定仓库。");
  }

  return (
    <div
      className="space-y-2 rounded-xl border bg-[var(--panel)] px-4 py-3 text-sm text-[var(--text-secondary)]"
      style={{ borderColor: "var(--panel-border)" }}
    >
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}

function SectionCard({
  action,
  children,
  className,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section
      className={`rounded-3xl border bg-[var(--panel)] ${className || ""}`}
      style={{ borderColor: "var(--panel-border)" }}
    >
      <div
        className="flex flex-col gap-3 border-b px-5 py-5 sm:flex-row sm:items-start sm:justify-between"
        style={{ borderColor: "var(--panel-border)" }}
      >
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            {icon}
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function TextField({
  error,
  label,
  mono = false,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  error?: string | null;
  label: string;
  mono?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)] ${
          mono ? "font-mono" : ""
        } ${error ? "border-red-500/40" : ""}`}
        style={{ borderColor: error ? undefined : "var(--panel-border)" }}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  );
}

function TextAreaField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-xl border bg-[var(--background)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        style={{ borderColor: "var(--panel-border)" }}
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]"
        style={{ borderColor: "var(--panel-border)" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="flex items-center justify-between gap-4 rounded-xl border bg-[var(--background)] px-4 py-3"
      style={{ borderColor: "var(--panel-border)" }}
    >
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--accent)]"
      />
    </label>
  );
}

function ColorField({
  error,
  label,
  onChange,
  value,
}: {
  error?: string | null;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const colorValue = normalizeColorPreview(value);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
        {label}
      </span>
      <div className="flex gap-3">
        <input
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 rounded-xl border bg-[var(--background)] p-1"
          style={{ borderColor: "var(--panel-border)" }}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`flex-1 rounded-xl border bg-[var(--background)] px-4 py-3 font-mono text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)] ${
            error ? "border-red-500/40" : ""
          }`}
          style={{ borderColor: error ? undefined : "var(--panel-border)" }}
          placeholder="#3b82f6"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  );
}

function createDraftId(prefix: string, index: number): string {
  return `${prefix}-${index}-${Date.now().toString(36)}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function hasUnsavedChanges(
  yamlContent: string,
  baselineYaml: string,
  formError: string | null,
): boolean {
  return Boolean(formError) || yamlContent !== baselineYaml;
}

function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) {
    return `${label} 不能为空`;
  }

  return null;
}

function validateUrl(value: string, label: string): string | null {
  if (!value.trim()) {
    return `${label} 不能为空`;
  }

  try {
    new URL(value);
    return null;
  } catch {
    return `${label} 不是有效的 URL`;
  }
}

function validateHexColor(value: string, label: string): string | null {
  if (!value.trim()) {
    return `${label} 不能为空`;
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return `${label} 必须是类似 #3b82f6 的十六进制颜色`;
  }

  return null;
}

function normalizeColorPreview(value: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#3b82f6";
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

function copyWithFallback(content: string): boolean {
  const textarea = document.createElement("textarea");

  textarea.value = content;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;
  const documentWithLegacyCopy = document as {
    execCommand?: unknown;
  };
  const execCommand =
    typeof documentWithLegacyCopy.execCommand === "function"
      ? (documentWithLegacyCopy.execCommand as (commandId: string) => boolean)
      : undefined;

  try {
    copied = execCommand?.call(document, "copy") ?? false;
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
}
