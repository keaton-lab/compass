import { useDeferredValue, useMemo, useState } from 'react';
import CategorySection from './CategorySection';
import ProfileHeader from './ProfileHeader';
import SearchBar from './SearchBar';
import DeferredThemeToggle from './DeferredThemeToggle';
import { ProfileHeaderDesktopLeft } from './ProfileHeader';
import ResolvedIcon from './ResolvedIcon';
import type { ResolvedIconData } from '@/shared/icon-types';
import type { ResolvedProfile, Settings, ResolvedCategory } from '@/shared/types';

const GITHUB_ICON: ResolvedIconData = {
  kind: 'brand',
  path: 'M12 .297a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58l-.02-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.34-1.75-1.34-1.75-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.31-5.47-1.33-5.47-5.91 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.55.12-3.23 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02 0 2.05.14 3.01.41 2.28-1.55 3.29-1.23 3.29-1.23.66 1.68.24 2.92.12 3.23.77.84 1.24 1.91 1.24 3.22 0 4.59-2.81 5.6-5.49 5.9.43.37.82 1.1.82 2.22l-.01 3.29c0 .32.21.69.82.58A12 12 0 0 0 12 .297',
};

interface ClientLayoutProps {
  profile: ResolvedProfile;
  settings: Settings;
  categories: ResolvedCategory[];
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
    <div className="flex min-h-screen flex-col text-foreground">
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-4 pb-10 md:px-6 md:pt-5 md:pb-12 lg:px-8">
        {/* 头部区域 */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* 移动端头部 */}
          <div className="md:hidden">
            <ProfileHeader profile={profile} />
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
            <div className="rounded-xl border bg-[var(--panel)] px-6 py-4 shadow-sm" style={{ borderColor: 'var(--panel-border)' }}>
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
      </div>

      {/* 页脚 - 贴近底部，无框 */}
      <footer className="mt-auto py-5">
        <div className="mx-auto h-px w-full max-w-[180px] bg-gradient-to-r from-transparent via-[var(--panel-border)] to-transparent opacity-40 md:max-w-sm" />
        <div className="mx-auto mt-5 flex max-w-[1400px] flex-col items-center gap-2 px-4 text-center md:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            {profile.repo ? (
              <a
                href={profile.repo}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 text-sm text-[var(--muted)] ${footerLinkClass}`}
              >
                <ResolvedIcon icon={GITHUB_ICON} name="github" size={14} />
                <span>{profile.name}</span>
              </a>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
                <ResolvedIcon icon={GITHUB_ICON} name="github" size={14} />
                <span>{profile.name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
            <span>{categories.length} categories</span>
            <span>{totalLinks} links</span>
            <a href="/edit" className={footerLinkClass}>
              edit
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
