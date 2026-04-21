'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import ResolvedIcon from './ResolvedIcon';
import { STATIC_BRAND_ICONS } from '../generated/static-brand-icons';
import ThemeToggle from './ThemeToggle';
import { stripAvatarIconPrefix } from '../avatar-utils';
import type { ResolvedCategory, ResolvedProfile, Settings } from '../types';
import Button from './Button';

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
    ? 'transition-colors duration-theme hover:text-[var(--text-primary)]'
    : '';

  return (
    <div id="home-page" className="relative flex min-h-screen flex-col text-foreground">
      <div className="relative z-[1] mx-auto w-full max-w-[1400px] flex-1 px-4 pt-4 pb-10 md:px-6 md:pt-5 md:pb-12 lg:px-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <HomeHeader
            profile={profile}
            query={query}
            setQuery={setQuery}
            shouldShowSearch={shouldShowSearch}
            totalResults={totalResults}
            initialTheme={settings.theme}
          />
        </header>

        <main className="mt-6 space-y-8 md:mt-8">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <CategoryBlock
                category={category}
                layout={settings.layout}
                animations={animationsEnabled}
              />
            </div>
          ))}

          {normalizedQuery && filteredCategories.length === 0 && (
            <div className="rounded-lg border bg-[var(--panel)] py-12 text-center panel-border">
              <h2 className="text-base font-medium text-[var(--text-primary)]">未找到结果</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">尝试其他关键词</p>
            </div>
          )}
        </main>
      </div>

      <footer className="relative z-[1] mt-auto py-5">
        <div className="mx-auto h-px w-full max-w-[180px] bg-gradient-to-r from-transparent via-[var(--panel-border)] to-transparent opacity-40 md:max-w-sm" />
        <div className="mx-auto mt-5 flex max-w-[1400px] flex-col items-center gap-2 px-4 text-center md:px-6 lg:px-8">
          <a
            href="https://github.com/keaton-lab/compass"
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
            <Link href="/edit" className={footerLinkClass}>
              edit
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

type HomeHeaderProps = {
  profile: ResolvedProfile;
  query: string;
  setQuery: (value: string) => void;
  shouldShowSearch: boolean;
  totalResults: number;
  initialTheme: Settings['theme'];
};

function ProfileAvatar({
  profile,
  name,
  avatar,
  sizeClass,
  iconSize,
  textSizeClass,
}: {
  profile: ResolvedProfile;
  name: string;
  avatar?: string;
  sizeClass: string;
  iconSize: number;
  textSizeClass: string;
}) {
  const avatarValue = avatar ?? '';
  const iconAvatarName = profile.resolvedAvatarIcon ? stripAvatarIconPrefix(avatarValue) : '';
  const isIconAvatar = Boolean(iconAvatarName);
  const isImageAvatar = !isIconAvatar && avatarValue.trim() !== '';
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isIconAvatar) {
    return (
      <div className={`flex items-center justify-center rounded-lg border bg-[var(--bg-secondary)] ${sizeClass} panel-border`}>
        <ResolvedIcon
          icon={profile.resolvedAvatarIcon}
          name={iconAvatarName}
          size={iconSize}
          className="text-[var(--text-primary)]"
        />
      </div>
    );
  }

  if (isImageAvatar) {
    return (
      <div className={`relative overflow-hidden rounded-lg border bg-[var(--bg-secondary)] ${sizeClass} panel-border`}>
        <Image src={avatarValue} alt={name} fill className="object-cover" sizes="(max-width: 768px) 40px, 48px" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-lg border bg-[var(--bg-secondary)] ${sizeClass} panel-border`}>
      <span className={`${textSizeClass} font-semibold text-[var(--text-primary)]`}>{initials}</span>
    </div>
  );
}

function HomeHeader({
  profile,
  query,
  setQuery,
  shouldShowSearch,
  totalResults,
  initialTheme,
}: HomeHeaderProps) {
  const { name, avatar, description, bio } = profile;

  return (
    <>
      <div className="rounded-2xl border bg-[var(--panel)] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:hidden panel-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <ProfileAvatar
              profile={profile}
              name={name}
              avatar={avatar}
              sizeClass="h-14 w-14"
              iconSize={26}
              textSizeClass="text-base"
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-[0.01em] text-[var(--text-primary)]">{name}</h1>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
            </div>
          </div>
          <ThemeToggle initialTheme={initialTheme} variant="mobile" />
        </div>
        {bio && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{bio}</p>}
        {shouldShowSearch && (
          <div className="mt-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="搜索链接..."
              showResultCount
              resultCount={totalResults}
            />
          </div>
        )}
      </div>

      <div className="hidden w-full items-center justify-between md:flex">
        <div className="rounded-xl border bg-[var(--panel)] px-6 py-4 shadow-sm panel-border">
          <DesktopProfileSummary profile={profile} />
        </div>
        <div className="flex items-center gap-3">
          {shouldShowSearch && (
            <SearchInput
              compact
              value={query}
              onChange={setQuery}
              placeholder="搜索链接..."
              showResultCount
              resultCount={totalResults}
            />
          )}
          <ThemeToggle initialTheme={initialTheme} variant="compact" />
        </div>
      </div>
    </>
  );
}

function DesktopProfileSummary({ profile }: { profile: ResolvedProfile }) {
  const { name, avatar, description, bio } = profile;

  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <ProfileAvatar
          profile={profile}
          name={name}
          avatar={avatar}
          sizeClass="h-14 w-14"
          iconSize={28}
          textSizeClass="text-xl"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold text-[var(--text-primary)]">{name}</h1>
        <p className="truncate text-sm text-[var(--text-secondary)]">{description}</p>
        {bio && <p className="truncate text-xs text-[var(--muted)]">{bio}</p>}
      </div>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  showResultCount = false,
  resultCount = 0,
  compact = false,
}: {
  value: string;
  onChange: (query: string) => void;
  placeholder: string;
  disabled?: boolean;
  showResultCount?: boolean;
  resultCount?: number;
  compact?: boolean;
}) {
  const hasQuery = value.length > 0;

  if (compact) {
    return (
      <div className="relative hidden items-center md:flex" aria-label="搜索" role="search">
        <div className="flex h-10 min-w-[280px] items-center rounded-lg border bg-[var(--panel-strong)] pl-3 pr-2 transition-colors duration-theme focus-within:border-[var(--accent-border)] panel-border">
          <Search size={16} className="shrink-0 text-[var(--muted)]" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="ml-2 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--muted)]"
          />
          {hasQuery && (
            <Button
              shape="icon"
              leftIcon={<X size={14} />}
              size="sm"
              variant="ghost"
              aria-label="清除搜索"
              title="清除搜索"
              onClick={() => onChange('')}
              className="ml-2 !h-6 !w-6 !rounded-md [&_svg]:text-[var(--muted)]"
            />
          )}
        </div>
        {showResultCount && hasQuery && (
          <div className="absolute -bottom-5 left-1 text-xs text-[var(--muted)]">{resultCount} 个结果</div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative rounded-lg border bg-[var(--panel-strong)] transition-colors duration-theme focus-within:border-[var(--accent-border)] panel-border">
        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2" aria-hidden="true">
          <Search size={16} className="text-[var(--muted)]" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg bg-transparent py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--muted)] md:py-3 md:text-base disabled:cursor-not-allowed disabled:opacity-50"
        />

        {hasQuery && (
          <div className="absolute inset-y-0 right-2 my-auto">
            <Button
              shape="icon"
              leftIcon={<X size={14} />}
              size="sm"
              variant="ghost"
              aria-label="清除搜索"
              title="清除搜索"
              onClick={() => onChange('')}
              className="[&_svg]:text-[var(--muted)]"
            />
          </div>
        )}
      </div>

      {showResultCount && hasQuery && (
        <div className="absolute -bottom-5 left-1 text-xs text-[var(--muted)]">{resultCount} 个结果</div>
      )}
    </div>
  );
}

function CategoryBlock({
  category,
  layout,
  animations,
}: {
  category: ResolvedCategory;
  layout: 'grid' | 'list';
  animations: boolean;
}) {
  const gridColumnsClass =
    layout === 'grid'
      ? 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      : 'grid-cols-1';
  const gapClass = layout === 'list' ? 'gap-3' : 'gap-2.5 xsm:gap-3';

  return (
    <section className="content-auto">
      <div className="mb-3 flex items-center gap-3 md:mb-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md border"
          style={{
            backgroundColor: `${category.color}15`,
            borderColor: `${category.color}30`,
          }}
        >
          <ResolvedIcon
            icon={category.resolvedIcon}
            name={category.icon}
            size={16}
            color={category.color}
          />
        </div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{category.name}</h2>
        <span className="text-xs text-[var(--muted)]">{category.links.length}</span>
      </div>

      <div className={`grid ${gridColumnsClass} ${gapClass}`}>
        {category.links.map((link) => (
          <div key={link.id} className="h-full">
            <LinkCard link={link} color={category.color} animations={animations} />
          </div>
        ))}
      </div>
    </section>
  );
}

function LinkCard({
  link,
  color,
  animations,
}: {
  link: ResolvedCategory['links'][number];
  color: string;
  animations: boolean;
}) {
  const cardClassName = animations
    ? 'transition-all duration-theme hover:border-[color:var(--accent-border)] hover:bg-[var(--panel-strong)] active:scale-[0.99]'
    : '';
  const iconClassName = animations ? 'transition-transform duration-theme group-hover:scale-105' : '';
  const titleClassName = animations
    ? 'transition-colors duration-theme group-hover:text-[var(--accent)]'
    : '';
  const arrowClassName = animations
    ? 'opacity-0 transition-all duration-theme group-hover:opacity-100 md:opacity-60'
    : 'opacity-60';

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex min-h-[64px] cursor-pointer flex-col overflow-hidden rounded-lg border bg-[var(--panel)] p-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-border)] xsm:min-h-[72px] xsm:p-3 md:min-h-[68px] md:flex-row md:items-center md:gap-3 panel-border ${cardClassName}`}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border xsm:h-9 xsm:w-9"
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
        }}
      >
        <ResolvedIcon
          icon={link.resolvedIcon}
          name={link.icon}
          size={18}
          color={color}
          className={iconClassName}
        />
      </div>

      <div className="mt-1.5 min-w-0 flex-1 xsm:mt-2 md:mt-0">
        <h3 className={`truncate text-[13px] font-medium leading-4 text-[var(--text-primary)] xsm:text-sm ${titleClassName}`}>
          {link.name}
        </h3>
        <p className="mt-0.5 max-w-full truncate text-[11px] leading-4 text-[var(--muted)] xsm:max-w-[24ch] xsm:text-xs">
          {link.description}
        </p>
      </div>

      <div className={`absolute right-2 top-2 text-[var(--muted)] xsm:right-2.5 xsm:top-2.5 md:static md:ml-auto md:flex-none ${arrowClassName}`}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </div>
    </a>
  );
}
