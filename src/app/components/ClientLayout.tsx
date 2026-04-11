'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import CategorySection from './CategorySection';
import ProfileHeader from './ProfileHeader';
import SearchBar from './SearchBar';
import DeferredThemeToggle from './DeferredThemeToggle';
import { ProfileHeaderDesktopLeft } from './ProfileHeader';
import ResolvedIcon from './ResolvedIcon';
import { STATIC_BRAND_ICONS } from '../generated/static-brand-icons';
import type { ResolvedProfile, Settings, ResolvedCategory } from '../types';

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

  useEffect(() => {
    const page = document.getElementById('home-page');

    if (!page) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const getFallbackPointer = () => ({
      x: window.innerWidth * 0.5,
      y: Math.min(window.innerHeight * 0.28, 280),
    });

    let frameId = 0;
    let target = getFallbackPointer();

    const applyPointer = (x: number, y: number) => {
      page.style.setProperty('--matrix-pointer-x', `${x}px`);
      page.style.setProperty('--matrix-pointer-y', `${y}px`);
    };

    const flush = () => {
      frameId = 0;
      applyPointer(target.x, target.y);
    };

    const schedule = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(flush);
    };

    const resetPointer = () => {
      target = getFallbackPointer();
      schedule();
    };

    const handlePointerMove = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY };
      schedule();
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        resetPointer();
      }
    };

    applyPointer(target.x, target.y);

    if (!mediaQuery.matches) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('mouseout', handleMouseOut);
      window.addEventListener('blur', resetPointer);
    }

    window.addEventListener('resize', resetPointer, { passive: true });

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('blur', resetPointer);
      window.removeEventListener('resize', resetPointer);
    };
  }, []);

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
    <div id="home-page" className="relative flex min-h-screen flex-col text-foreground">
      <div className="relative z-[1] mx-auto w-full max-w-[1400px] flex-1 px-4 pt-4 pb-10 md:px-6 md:pt-5 md:pb-12 lg:px-8">
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
      <footer className="relative z-[1] mt-auto py-5">
        <div className="mx-auto h-px w-full max-w-[180px] bg-gradient-to-r from-transparent via-[var(--panel-border)] to-transparent opacity-40 md:max-w-sm" />
        <div className="mx-auto mt-5 flex max-w-[1400px] flex-col items-center gap-2 px-4 text-center md:px-6 lg:px-8">
          <a
            href="https://github.com/imzhoukunqiang/compass"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1.5 text-sm text-[var(--muted)] ${footerLinkClass}`}
          >
            <ResolvedIcon icon={STATIC_BRAND_ICONS.github} name="github" size={14} />
            <span>Compass</span>
          </a>
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
