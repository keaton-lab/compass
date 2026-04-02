'use client';

import { useState, useMemo, useCallback } from 'react';
import { dump as yamlDump } from 'js-yaml';
import type { Config, Profile, Settings, Category, Link } from '../types';

interface EditClientProps {
  initialConfig: Config;
}

const PRESET_COLORS = [
  { name: '蓝色', value: '#3b82f6' },
  { name: '绿色', value: '#10b981' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '橙色', value: '#f59e0b' },
  { name: '红色', value: '#ef4444' },
  { name: '青色', value: '#06b6d4' },
  { name: '粉色', value: '#ec4899' },
  { name: '靛蓝', value: '#6366f1' },
];

export default function EditClient({ initialConfig }: EditClientProps) {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [copied, setCopied] = useState(false);

  const generatedYaml = useMemo(() => {
    return yamlDump(config, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
  }, [config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedYaml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    }
  };

  const updateProfile = (field: keyof Profile, value: string) => {
    setConfig(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const updateSettings = (field: keyof Settings, value: boolean | string) => {
    setConfig(prev => ({
      ...prev,
      settings: { ...prev.settings, [field]: value }
    }));
  };

  const addCategory = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: '新分类',
          icon: 'Folder',
          color: '#3b82f6',
          links: []
        }
      ]
    }));
  }, []);

  const updateCategory = (index: number, field: keyof Category, value: string) => {
    setConfig(prev => {
      const newCategories = [...prev.categories];
      newCategories[index] = { ...newCategories[index], [field]: value };
      return { ...prev, categories: newCategories };
    });
  };

  const deleteCategory = (index: number) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const addLink = useCallback((categoryIndex: number) => {
    setConfig(prev => {
      const newCategories = [...prev.categories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        links: [
          ...newCategories[categoryIndex].links,
          {
            id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: '新链接',
            url: 'https://',
            icon: 'Link',
            description: ''
          }
        ]
      };
      return { ...prev, categories: newCategories };
    });
  }, []);

  const updateLink = (categoryIndex: number, linkIndex: number, field: keyof Link, value: string) => {
    setConfig(prev => {
      const newCategories = [...prev.categories];
      const newLinks = [...newCategories[categoryIndex].links];
      newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
      newCategories[categoryIndex].links = newLinks;
      return { ...prev, categories: newCategories };
    });
  };

  const deleteLink = (categoryIndex: number, linkIndex: number) => {
    setConfig(prev => {
      const newCategories = [...prev.categories];
      newCategories[categoryIndex].links = newCategories[categoryIndex].links.filter((_, i) => i !== linkIndex);
      return { ...prev, categories: newCategories };
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              编辑导航配置
            </h1>
            <p className="text-muted-foreground">编辑完成后点击复制按钮，将 YAML 粘贴到 src/data/config.yaml 文件中</p>
          </div>
          <a
            href="/"
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>←</span>
            <span>返回首页</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">👤</span>
                个人资料
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">名称</label>
                  <input
                    type="text"
                    value={config.profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">描述</label>
                  <input
                    type="text"
                    value={config.profile.description}
                    onChange={(e) => updateProfile('description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">简介</label>
                  <input
                    type="text"
                    value={config.profile.bio || ''}
                    onChange={(e) => updateProfile('bio', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">仓库链接</label>
                  <input
                    type="text"
                    value={config.profile.repo || ''}
                    onChange={(e) => updateProfile('repo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">⚙️</span>
                设置
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">主题</label>
                  <select
                    value={config.settings.theme}
                    onChange={(e) => updateSettings('theme', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="dark">深色</option>
                    <option value="light">浅色</option>
                    <option value="midnight">午夜</option>
                    <option value="forest">森林</option>
                    <option value="sunset">日落</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">布局</label>
                  <select
                    value={config.settings.layout}
                    onChange={(e) => updateSettings('layout', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="grid">网格</option>
                    <option value="list">列表</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showSearch"
                    checked={config.settings.showSearch}
                    onChange={(e) => updateSettings('showSearch', e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="showSearch" className="text-sm">显示搜索</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="animations"
                    checked={config.settings.animations}
                    onChange={(e) => updateSettings('animations', e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="animations" className="text-sm">启用动画</label>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📁</span>
                  分类和链接
                </h2>
                <button
                  onClick={addCategory}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shadow-lg shadow-primary/20"
                >
                  <span>+</span>
                  <span>添加分类</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {config.categories.map((category, categoryIndex) => (
                  <div key={category.id} className="border border-border rounded-lg overflow-hidden bg-card">
                    <div className="h-1.5 w-full" style={{ backgroundColor: category.color }} />
                    <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                        placeholder="分类名称"
                      />
                      <input
                        type="text"
                        value={category.icon}
                        onChange={(e) => updateCategory(categoryIndex, 'icon', e.target.value)}
                        className="w-20 px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="图标"
                      />
                      <div className="flex items-center gap-1">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => updateCategory(categoryIndex, 'color', color.value)}
                            className={`w-6 h-6 rounded-md transition-all ${
                              category.color === color.value
                                ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                                : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => deleteCategory(categoryIndex)}
                        className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        title="删除分类"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="space-y-3 pl-4 border-l-2 border-border/50 ml-2">
                      {category.links.map((link, linkIndex) => (
                        <div key={link.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
                            <input
                              type="text"
                              value={link.name}
                              onChange={(e) => updateLink(categoryIndex, linkIndex, 'name', e.target.value)}
                              className="px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              placeholder="链接名称"
                            />
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => updateLink(categoryIndex, linkIndex, 'url', e.target.value)}
                              className="px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              placeholder="https://..."
                            />
                            <button
                              onClick={() => deleteLink(categoryIndex, linkIndex)}
                              className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                              title="删除链接"
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="grid grid-cols-[120px,1fr] gap-2">
                            <input
                              type="text"
                              value={link.icon}
                              onChange={(e) => updateLink(categoryIndex, linkIndex, 'icon', e.target.value)}
                              className="px-3 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                              placeholder="图标"
                            />
                            <input
                              type="text"
                              value={link.description}
                              onChange={(e) => updateLink(categoryIndex, linkIndex, 'description', e.target.value)}
                              className="px-3 py-1.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                              placeholder="描述（可选）"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addLink(categoryIndex)}
                        className="w-full py-2.5 rounded-lg border border-dashed border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm flex items-center justify-center gap-1 group"
                      >
                        <span className="group-hover:scale-110 transition-transform">+</span>
                        <span>添加链接</span>
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
                {config.categories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                    暂无分类，点击上方按钮添加
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📄</span>
                  生成的 YAML
                </h2>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {copied ? '✓ 已复制' : '📋 复制'}
                </button>
              </div>
              <div className="relative">
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all max-h-[calc(100vh-300px)] overflow-y-auto">
                  {generatedYaml}
                </pre>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                💡 提示：点击「复制」按钮后，将内容粘贴到 <code className="bg-muted px-1 rounded">src/data/config.yaml</code> 文件中，然后重新构建项目即可生效。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
