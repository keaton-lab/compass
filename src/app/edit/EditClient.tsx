'use client';

import { Accordion, Tabs } from 'radix-ui';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dump as yamlDump, load as yamlLoad } from 'js-yaml';
import { Plus, User, Settings, FolderOpen, Code2, AlertCircle, Check, Minus } from 'lucide-react';
import type { Config } from '../types';
import { useEditState } from './hooks/use-edit-state';
import EditHeader from './components/EditHeader';
import ProfileEditor from './components/ProfileEditor';
import SettingsEditor from './components/SettingsEditor';
import CategoryEditor from './components/CategoryEditor';

interface EditClientProps {
  initialConfig: Config;
}

type EditSection = 'profile' | 'settings' | 'categories' | 'yaml';

export default function EditClient({ initialConfig }: EditClientProps) {
  const { config, setConfig, undo, redo, canUndo, canRedo } = useEditState(initialConfig);
  const [activeSection, setActiveSection] = useState<EditSection>('profile');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [yamlInput, setYamlInput] = useState<string>('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const yamlParseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const yamlContent = useMemo(() => {
    return yamlDump(config, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false });
  }, [config]);

  const openCategoryIds = useMemo(
    () => config.categories.map((category) => category.id).filter((id) => !collapsedCategories.has(id)),
    [collapsedCategories, config.categories]
  );

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

  useEffect(() => {
    setCollapsedCategories((prev) => {
      const currentIds = new Set(config.categories.map((category) => category.id));
      const next = new Set(Array.from(prev).filter((id) => currentIds.has(id)));

      return next.size === prev.size ? prev : next;
    });
  }, [config.categories]);

  const handleYamlChange = useCallback((value: string) => {
    setYamlInput(value);

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
  }, [setConfig]);

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

  const moveCategoryUp = useCallback((index: number) => {
    if (index <= 0) return;
    setConfig((prev: Config) => {
      const categories = [...prev.categories];
      const temp = categories[index];
      categories[index] = categories[index - 1];
      categories[index - 1] = temp;
      return { ...prev, categories };
    });
  }, [setConfig]);

  const moveCategoryDown = useCallback((index: number) => {
    setConfig((prev: Config) => {
      if (index >= prev.categories.length - 1) return prev;
      const categories = [...prev.categories];
      const temp = categories[index];
      categories[index] = categories[index + 1];
      categories[index + 1] = temp;
      return { ...prev, categories };
    });
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

  const moveLinkUp = useCallback((catIdx: number, linkIdx: number) => {
    if (linkIdx <= 0) return;
    setConfig((prev: Config) => {
      const categories = [...prev.categories];
      const links = [...categories[catIdx].links];
      const temp = links[linkIdx];
      links[linkIdx] = links[linkIdx - 1];
      links[linkIdx - 1] = temp;
      categories[catIdx] = { ...categories[catIdx], links };
      return { ...prev, categories };
    });
  }, [setConfig]);

  const moveLinkDown = useCallback((catIdx: number, linkIdx: number) => {
    setConfig((prev: Config) => {
      const categories = [...prev.categories];
      if (linkIdx >= categories[catIdx].links.length - 1) return prev;
      const links = [...categories[catIdx].links];
      const temp = links[linkIdx];
      links[linkIdx] = links[linkIdx + 1];
      links[linkIdx + 1] = temp;
      categories[catIdx] = { ...categories[catIdx], links };
      return { ...prev, categories };
    });
  }, [setConfig]);

  const handleCategoryOpenChange = useCallback((openIds: string[]) => {
    const openIdSet = new Set(openIds);
    setCollapsedCategories(new Set(config.categories.map((category) => category.id).filter((id) => !openIdSet.has(id))));
  }, [config.categories]);

  const toggleAllCategories = useCallback(() => {
    if (collapsedCategories.size === config.categories.length) {
      setCollapsedCategories(new Set());
    } else {
      setCollapsedCategories(new Set(config.categories.map((c) => c.id)));
    }
  }, [collapsedCategories.size, config.categories]);

  const sections: { key: EditSection; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'profile', label: '个人资料', icon: <User className="w-4 h-4" /> },
    { key: 'settings', label: '设置', icon: <Settings className="w-4 h-4" /> },
    { key: 'categories', label: '分类和链接', icon: <FolderOpen className="w-4 h-4" />, count: config.categories.length },
    { key: 'yaml', label: 'YAML 编辑', icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <EditHeader
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          yamlContent={yamlContent}
        />

        <Tabs.Root
          value={activeSection}
          onValueChange={(value) => {
            const nextSection = value as EditSection;
            if (nextSection === 'yaml') {
              setYamlInput(yamlContent);
              setYamlError(null);
            }
            setActiveSection(nextSection);
          }}
          className="min-w-0"
        >
          <div className="mb-6 overflow-x-auto pb-1">
            <Tabs.List className="inline-flex rounded-[22px] border bg-[var(--panel-strong)] p-1" style={{ borderColor: 'var(--panel-border)' }}>
              {sections.map(({ key, label, icon, count }) => (
                <Tabs.Trigger
                  key={key}
                  value={key}
                  className="flex items-center gap-2 rounded-[18px] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-[var(--muted)] outline-none transition-colors data-[state=active]:bg-[var(--accent-alpha)] data-[state=active]:text-[var(--foreground)]"
                >
                  {icon}
                  <span>{label}</span>
                  {count !== undefined && (
                    <span className="text-xs opacity-60">({count})</span>
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>

          <Tabs.Content value="profile" className="outline-none">
            <section className="rounded-[24px] border bg-[var(--panel-strong)]" style={{ borderColor: 'var(--panel-border)' }}>
              <div className="border-b px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
                <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
                  <User className="w-4 h-4 text-[var(--accent)]" />
                  个人资料
                </h2>
              </div>
              <div className="p-5">
                <ProfileEditor profile={config.profile} onChange={updateProfile} />
              </div>
            </section>
          </Tabs.Content>

          <Tabs.Content value="settings" className="outline-none">
            <section className="rounded-[24px] border bg-[var(--panel-strong)]" style={{ borderColor: 'var(--panel-border)' }}>
              <div className="border-b px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
                <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
                  <Settings className="w-4 h-4 text-[var(--accent)]" />
                  设置
                </h2>
              </div>
              <div className="p-5">
                <SettingsEditor settings={config.settings} onChange={updateSettings} />
              </div>
            </section>
          </Tabs.Content>

          <Tabs.Content value="categories" className="outline-none">
            <section className="rounded-[24px] border bg-[var(--panel-strong)]" style={{ borderColor: 'var(--panel-border)' }}>
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
                <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
                  <FolderOpen className="w-4 h-4 text-[var(--accent)]" />
                  分类和链接
                </h2>
                <div className="flex items-center gap-2">
                  {config.categories.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleAllCategories}
                      className="flex items-center gap-1.5 rounded-[16px] border px-3 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
                      style={{ borderColor: 'var(--panel-border)' }}
                    >
                      {collapsedCategories.size === config.categories.length ? (
                        <Plus className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      {collapsedCategories.size === config.categories.length ? '展开全部' : '折叠全部'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center gap-1.5 rounded-[16px] bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    添加分类
                  </button>
                </div>
              </div>
              <div className="p-5">
                {config.categories.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed py-12 text-center text-[var(--muted)]" style={{ borderColor: 'var(--panel-border)' }}>
                    <FolderOpen className="mx-auto mb-3 h-8 w-8 opacity-40" />
                    <p className="text-sm">暂无分类</p>
                    <p className="mt-1 text-xs">点击上方按钮添加第一个分类</p>
                  </div>
                ) : (
                  <Accordion.Root
                    type="multiple"
                    value={openCategoryIds}
                    onValueChange={handleCategoryOpenChange}
                    className="space-y-4"
                  >
                    {config.categories.map((category: Config['categories'][number], catIdx: number) => (
                      <CategoryEditor
                        key={category.id}
                        category={category}
                        collapsed={collapsedCategories.has(category.id)}
                        onUpdate={(field, value) => updateCategory(catIdx, field, value)}
                        onDelete={() => deleteCategory(catIdx)}
                        onUpdateLink={(linkIdx, field, value) => updateLink(catIdx, linkIdx, field, value)}
                        onAddLink={() => addLink(catIdx)}
                        onDeleteLink={(linkIdx) => deleteLink(catIdx, linkIdx)}
                        onMoveLinkUp={(linkIdx) => moveLinkUp(catIdx, linkIdx)}
                        onMoveLinkDown={(linkIdx) => moveLinkDown(catIdx, linkIdx)}
                        onMoveUp={() => moveCategoryUp(catIdx)}
                        onMoveDown={() => moveCategoryDown(catIdx)}
                        canMoveUp={catIdx > 0}
                        canMoveDown={catIdx < config.categories.length - 1}
                      />
                    ))}
                  </Accordion.Root>
                )}
              </div>
            </section>
          </Tabs.Content>

          <Tabs.Content value="yaml" className="outline-none">
            <section className="rounded-[24px] border bg-[var(--panel-strong)]" style={{ borderColor: 'var(--panel-border)' }}>
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
              <div className="p-4">
                <textarea
                  value={yamlInput}
                  onChange={(e) => handleYamlChange(e.target.value)}
                  className={`h-[calc(100vh-280px)] min-h-[400px] w-full resize-y rounded-[20px] border bg-[var(--background)] p-4 font-mono text-sm text-[var(--foreground)] outline-none transition-colors ${
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
                  直接编辑 YAML 内容，修改会自动同步到表单。编辑完成后点击右上角「复制 YAML」按钮保存到文件。
                </p>
              </div>
            </section>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
