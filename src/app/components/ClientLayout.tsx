'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import CategorySection from './CategorySection';
import ProfileHeader from './ProfileHeader';
import SearchBar from './SearchBar';
import DeferredThemeToggle from './DeferredThemeToggle';
import { ProfileHeaderDesktopLeft } from './ProfileHeader';
import type { Profile, Settings, Category } from '../types';
import Icon from './Icon';

interface ClientLayoutProps {
  profile: Profile;
  settings: Settings;
  categories: Category[];
}

export default function ClientLayout({
  profile,
  settings,
  categories,
}: ClientLayoutProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        links: category.links.filter(
          (link) =>
            link.name.toLowerCase().includes(normalizedQuery) ||
            (link.description ?? '').toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((category) => category.links.length > 0);
  }, [categories, normalizedQuery]);

  const totalResults = filteredCategories.reduce(
    (acc, cat) => acc + cat.links.length,
    0,
  );
  const totalLinks = categories.reduce((acc, cat) => acc + cat.links.length, 0);
  const shouldShowSearch = settings.showSearch;
  const animationsEnabled = settings.animations;
  const footerLinkClass = animationsEnabled
    ? 'transition-colors duration-200 hover:text-[var(--text-primary)]'
    : '';

  return (
    <div className="min-h-screen text-foreground">
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-4 md:px-6 md:pt-5 lg:px-8">
        {/* 头部区域 */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* 移动端头部 */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <ProfileHeader profile={profile} />
            </div>
            {shouldShowSearch && (
              <div className="mt-4">
                <SearchBar
                  onSearch={setQuery}
                  value={query}
                  placeholder="搜索链接..."
                  showResultCount
                  resultCount={totalResults}
                />
              </div>
            )}
          </div>

          {/* 桌面端头部 */}
          <div className="hidden w-full items-center justify-between md:flex">
            <div className="rounded-lg border bg-[var(--panel)] px-5 py-3" style={{ borderColor: 'var(--panel-border)' }}>
              <ProfileHeaderDesktopLeft profile={profile} />
            </div>
            <div className="flex items-center gap-3">
              {shouldShowSearch && (
                <SearchBar
                  compact
                  onSearch={setQuery}
                  value={query}
                  placeholder="搜索链接..."
                  showResultCount
                  resultCount={totalResults}
                />
              )}
              <DeferredThemeToggle compact />
            </div>
          </div>
        </header>

        {/* 主体内容 */}
        <main className="mt-6 space-y-8 md:mt-8">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <CategorySection
                category={category}
                layout={settings.layout}
                animations={animationsEnabled}
              />
            </div>
          ))}

          {normalizedQuery && filteredCategories.length === 0 && (
            <div
              className="rounded-lg border bg-[var(--panel)] py-12 text-center"
              style={{ borderColor: 'var(--panel-border)' }}
            >
              <h2 className="text-base font-medium text-[var(--text-primary)]">未找到结果</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">尝试其他关键词</p>
            </div>
          )}
        </main>

        {/* 页脚 */}
        <footer className="mt-10 hidden md:block">
          <div className="flex items-center justify-between rounded-lg border bg-[var(--panel)] px-4 py-3" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <span>{categories.length} 个分类</span>
              <span className="text-[var(--panel-border)]">•</span>
              <span>{totalLinks} 个链接</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={profile.repo || ''}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 text-sm text-[var(--muted)] ${footerLinkClass}`}
              >
                <Icon name="github" size={14} />
                <span>{profile.name}</span>
              </a>
              <a href="/edit" className={`text-sm text-[var(--muted)] ${footerLinkClass}`}>
                编辑
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
