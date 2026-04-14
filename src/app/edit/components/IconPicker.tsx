'use client';

import { Dialog, Tabs } from 'radix-ui';
import { Search, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState, startTransition } from 'react';
import type { ReactNode, UIEvent } from 'react';
import { AppDialogContent } from '../../components/AppDialog';
import { normalizeBrandIconKey, toKebabCase } from '../../icon-utils';
import { modalIconButtonClassName } from '../../components/modalStyles';

interface BrandIcon {
  name: string;
  slug: string;
  path: string;
  hex: string;
}

interface LucidePickerIcon {
  key: string;
  name: string;
  normalizedKey: string;
  searchValue: string;
  component: LucideIcon;
}

export interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  onClose: () => void;
}

const INITIAL_VISIBLE_COUNT = 60;
const LOAD_MORE_COUNT = 60;

let lucideIconNamesCache: LucidePickerIcon[] | null = null;
let lucideIconNamesPromise: Promise<LucidePickerIcon[]> | null = null;
let brandIconsCache: BrandIcon[] | null = null;
let brandIconsPromise: Promise<BrandIcon[]> | null = null;

function toLucidePickerName(key: string) {
  return key
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function normalizeLucideSelection(value: string) {
  return toKebabCase(value).replace(/-/g, '');
}

async function loadLucideIconNames(): Promise<LucidePickerIcon[]> {
  if (lucideIconNamesCache) return lucideIconNamesCache;
  if (!lucideIconNamesPromise) {
    lucideIconNamesPromise = Promise.all([import('lucide-react/dynamic'), import('lucide-react')])
      .then(([lucideDynamic, lucide]) => {
        const iconNames = Array.from(new Set<string>(lucideDynamic.iconNames));
        const resolvedIcons: LucidePickerIcon[] = [];

        for (const key of iconNames) {
          const name = toLucidePickerName(key);
          const component = lucide[name as keyof typeof lucide] as LucideIcon | undefined;

          if (!component) {
            continue;
          }

          resolvedIcons.push({
            key,
            name,
            normalizedKey: key.replace(/-/g, ''),
            searchValue: `${key} ${name}`.toLowerCase(),
            component,
          });
        }

        resolvedIcons.sort((left, right) => left.name.localeCompare(right.name));

        lucideIconNamesCache = resolvedIcons;
        return resolvedIcons;
      })
      .catch((error) => {
        lucideIconNamesPromise = null;
        throw error;
      });
  }

  return lucideIconNamesPromise;
}

async function loadBrandIcons(): Promise<BrandIcon[]> {
  if (brandIconsCache) return brandIconsCache;
  if (!brandIconsPromise) {
    brandIconsPromise = import('simple-icons')
      .then((simpleIcons) => {
        const entries = simpleIcons as unknown as Record<
          string,
          { title: string; slug: string; path: string; hex: string }
        >;

        brandIconsCache = Object.keys(entries)
          .filter((key) => key.startsWith('si') && key.length > 2)
          .map((key) => {
            const icon = entries[key];

            return {
              name: icon.title,
              slug: icon.slug,
              path: icon.path,
              hex: icon.hex,
            };
          })
          .sort((left, right) => left.name.localeCompare(right.name));

        return brandIconsCache;
      })
      .catch((error) => {
        brandIconsPromise = null;
        throw error;
      });
  }

  return brandIconsPromise;
}

export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [tab, setTab] = useState<'lucide' | 'brand'>('lucide');
  const [lucideIconNames, setLucideIconNames] = useState<LucidePickerIcon[]>(() => lucideIconNamesCache ?? []);
  const [brandIcons, setBrandIcons] = useState<BrandIcon[]>(() => brandIconsCache ?? []);
  const [lucideLoadError, setLucideLoadError] = useState<string | null>(null);
  const [brandLoadError, setBrandLoadError] = useState<string | null>(null);
  const [currentVisibleCount, setCurrentVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    if (lucideIconNames.length > 0 || lucideLoadError) {
      return;
    }

    let cancelled = false;

    void loadLucideIconNames()
      .then((icons) => {
        if (cancelled) {
          return;
        }

        setLucideIconNames(icons);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error('Failed to load Lucide icons for picker:', error);
        setLucideLoadError('通用图标加载失败，请关闭后重试。');
      });

    return () => {
      cancelled = true;
    };
  }, [lucideIconNames.length, lucideLoadError]);

  useEffect(() => {
    if (brandIcons.length > 0 || brandLoadError) {
      return;
    }

    let cancelled = false;

    void loadBrandIcons()
      .then((icons) => {
        if (cancelled) {
          return;
        }

        setBrandIcons(icons);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error('Failed to load brand icons for picker:', error);
        setBrandLoadError('品牌图标加载失败，请关闭后重试。');
      });

    return () => {
      cancelled = true;
    };
  }, [brandIcons.length, brandLoadError]);

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const normalizedLucideValue = useMemo(() => normalizeLucideSelection(value), [value]);
  const normalizedBrandValue = useMemo(() => normalizeBrandIconKey(value), [value]);
  const isLucideLoading = tab === 'lucide' && lucideIconNames.length === 0 && !lucideLoadError;
  const isBrandLoading = tab === 'brand' && brandIcons.length === 0 && !brandLoadError;

  const filteredLucideIcons = useMemo(() => {
    if (!normalizedSearch) return lucideIconNames;
    return lucideIconNames.filter((icon) => icon.searchValue.includes(normalizedSearch));
  }, [lucideIconNames, normalizedSearch]);

  const filteredBrandIcons = useMemo(() => {
    if (!normalizedSearch) return brandIcons;
    return brandIcons.filter(
      (icon) =>
        icon.name.toLowerCase().includes(normalizedSearch) ||
        icon.slug.toLowerCase().includes(normalizedSearch),
    );
  }, [brandIcons, normalizedSearch]);

  const totalVisibleCount = tab === 'lucide' ? filteredLucideIcons.length : filteredBrandIcons.length;

  function loadMoreIcons() {
    setCurrentVisibleCount((previous) => Math.min(previous + LOAD_MORE_COUNT, totalVisibleCount));
  }

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight >= 220) {
      return;
    }

    setCurrentVisibleCount((previous) => {
      if (previous >= totalVisibleCount) {
        return previous;
      }

      return Math.min(previous + LOAD_MORE_COUNT, totalVisibleCount);
    });
  };

  const visibleLucideIcons = filteredLucideIcons.slice(0, currentVisibleCount);
  const visibleBrandIcons = filteredBrandIcons.slice(0, currentVisibleCount);

  function handleSelect(icon: string) {
    onChange(icon);
    onClose();
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AppDialogContent
        panelClassName="fixed inset-x-2 sm:inset-x-4 top-[4vh] sm:top-[6vh] bottom-[4vh] sm:bottom-[6vh] z-[51] mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[20px] sm:rounded-[24px] border bg-[var(--panel-strong)] outline-none"
        panelStyle={{ borderColor: 'var(--panel-border)' }}
      >
          <div
            className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-5"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <div>
              <Dialog.Title className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">选择图标</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs sm:text-sm text-[var(--muted)] hidden sm:block">
                通用图标和品牌图标都在打开时一次性加载，后续切换和滚动只做本地渲染。
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className={modalIconButtonClassName}
                style={{ borderColor: 'var(--panel-border)' }}
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <Tabs.Root
            value={tab}
            onValueChange={(nextTab) => {
              startTransition(() => {
                setTab(nextTab as 'lucide' | 'brand');
                setCurrentVisibleCount(INITIAL_VISIBLE_COUNT);
              });
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="border-b px-4 sm:px-6 py-3 sm:py-4" style={{ borderColor: 'var(--panel-border)' }}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentVisibleCount(INITIAL_VISIBLE_COUNT);
                  }}
                  placeholder="搜索图标..."
                  autoFocus
                  className="w-full rounded-[14px] sm:rounded-[18px] border bg-[var(--background)] px-10 sm:px-11 py-2.5 sm:py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent-border)]"
                  style={{ borderColor: 'var(--panel-border)' }}
                />
              </div>

              <Tabs.List
                className="mt-3 sm:mt-4 inline-flex rounded-[14px] sm:rounded-[18px] border bg-[var(--background)] p-1"
                style={{ borderColor: 'var(--panel-border)' }}
              >
                <Tabs.Trigger
                  value="lucide"
                  className="rounded-[10px] sm:rounded-[14px] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[var(--muted)] outline-none transition-colors data-[state=active]:bg-[var(--accent-alpha)] data-[state=active]:text-[var(--foreground)]"
                >
                  通用 ({lucideIconNames.length > 0 ? filteredLucideIcons.length : '...'})
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="brand"
                  className="rounded-[10px] sm:rounded-[14px] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[var(--muted)] outline-none transition-colors data-[state=active]:bg-[var(--accent-alpha)] data-[state=active]:text-[var(--foreground)]"
                >
                  品牌 ({brandIcons.length > 0 ? filteredBrandIcons.length : '...'})
                </Tabs.Trigger>
              </Tabs.List>
            </div>

            <Tabs.Content
              value="lucide"
              className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none data-[state=inactive]:hidden"
            >
              <PickerPanel
                active={tab === 'lucide'}
                loading={isLucideLoading}
                error={lucideLoadError}
                empty={!isLucideLoading && filteredLucideIcons.length === 0}
                emptyLabel="未找到匹配的图标"
                onScroll={handleScroll}
                canLoadMore={visibleLucideIcons.length < filteredLucideIcons.length}
                onLoadMore={loadMoreIcons}
              >
                <LucideIconGrid
                  icons={visibleLucideIcons}
                  selectedValue={normalizedLucideValue}
                  onSelect={handleSelect}
                />
                {visibleLucideIcons.length < filteredLucideIcons.length && (
                  <FooterAction
                    label={`已显示 ${visibleLucideIcons.length} / ${filteredLucideIcons.length} 个通用图标`}
                    buttonLabel="加载更多"
                    onClick={loadMoreIcons}
                  />
                )}
              </PickerPanel>
            </Tabs.Content>

            <Tabs.Content
              value="brand"
              className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none data-[state=inactive]:hidden"
            >
              <PickerPanel
                active={tab === 'brand'}
                loading={isBrandLoading}
                error={brandLoadError}
                empty={!isBrandLoading && filteredBrandIcons.length === 0}
                emptyLabel="未找到匹配的品牌图标"
                onScroll={handleScroll}
                canLoadMore={visibleBrandIcons.length < filteredBrandIcons.length}
                onLoadMore={loadMoreIcons}
              >
                <BrandIconGrid
                  icons={visibleBrandIcons}
                  selectedValue={normalizedBrandValue}
                  onSelect={handleSelect}
                />
                {visibleBrandIcons.length < filteredBrandIcons.length && (
                  <FooterAction
                    label={`已显示 ${visibleBrandIcons.length} / ${filteredBrandIcons.length} 个品牌图标`}
                    buttonLabel="加载更多"
                    onClick={loadMoreIcons}
                  />
                )}
              </PickerPanel>
            </Tabs.Content>
          </Tabs.Root>

          <div className="border-t px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[var(--muted)]" style={{ borderColor: 'var(--panel-border)' }}>
            当前选中:{' '}
            <code className="rounded-[8px] sm:rounded-[10px] bg-[var(--background)] px-2 py-1 text-[var(--text-primary)]">{value}</code>
          </div>
      </AppDialogContent>
    </Dialog.Root>
  );
}

function PickerPanel({
  active,
  loading,
  error,
  empty,
  emptyLabel,
  onScroll,
  canLoadMore,
  onLoadMore,
  children,
}: {
  active: boolean;
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyLabel: string;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  canLoadMore: boolean;
  onLoadMore: () => void;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || loading || error || empty || !canLoadMore) {
      return;
    }

    let frameId = 0;

    frameId = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container || container.clientHeight <= 0) {
        return;
      }

      if (container.scrollHeight <= container.clientHeight + 1) {
        onLoadMore();
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [active, canLoadMore, empty, error, loading, onLoadMore]);

  if (loading) {
    return <p className="p-10 text-center text-sm text-[var(--muted)]">加载中...</p>;
  }

  if (error) {
    return <p className="p-10 text-center text-sm text-[var(--muted)]">{error}</p>;
  }

  if (empty) {
    return <p className="p-10 text-center text-sm text-[var(--muted)]">{emptyLabel}</p>;
  }

  return (
    <div
      ref={containerRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
      onScroll={onScroll}
    >
      {children}
    </div>
  );
}

function FooterAction({
  label,
  buttonLabel,
  onClick,
}: {
  label: string;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="pt-4 text-center">
      <div className="mb-3 text-sm text-[var(--muted)]">{label}</div>
      <button
        type="button"
        onClick={onClick}
        className="rounded-[14px] border px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function LucideIconGrid({
  icons,
  selectedValue,
  onSelect,
}: {
  icons: LucidePickerIcon[];
  selectedValue: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 sm:gap-3">
      {icons.map((icon) => {
        const isSelected = selectedValue === icon.normalizedKey;

        return (
          <button
            key={icon.key}
            type="button"
            onClick={() => onSelect(icon.name)}
            className={`rounded-[12px] sm:rounded-[16px] border px-1.5 sm:px-2 py-3 sm:py-4 text-xs transition-colors active:scale-95 ${
              isSelected
                ? 'bg-[var(--accent-alpha)] text-[var(--foreground)]'
                : 'bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--bg-secondary)]'
            }`}
            style={{ borderColor: isSelected ? 'var(--accent-border)' : 'var(--panel-border)' }}
            title={icon.name}
          >
            <div className="mb-2 flex justify-center">
              <icon.component size={20} />
            </div>
            <div className="truncate text-center">
              {icon.name.length > 10 ? `${icon.name.slice(0, 9)}…` : icon.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function BrandIconGrid({
  icons,
  selectedValue,
  onSelect,
}: {
  icons: BrandIcon[];
  selectedValue: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 sm:gap-3">
      {icons.map((icon) => {
        const isSelected = selectedValue === normalizeBrandIconKey(icon.slug);

        return (
          <button
            key={icon.slug}
            type="button"
            onClick={() => onSelect(icon.slug)}
            className={`rounded-[12px] sm:rounded-[16px] border px-1.5 sm:px-2 py-3 sm:py-4 text-xs transition-colors active:scale-95 ${
              isSelected
                ? 'bg-[var(--accent-alpha)] text-[var(--foreground)]'
                : 'bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--bg-secondary)]'
            }`}
            style={{ borderColor: isSelected ? 'var(--accent-border)' : 'var(--panel-border)' }}
            title={icon.name}
          >
            <div className="mb-2 flex justify-center">
              <svg viewBox="0 0 24 24" width="20" height="20" style={{ fill: 'currentColor' }}>
                <path d={icon.path} />
              </svg>
            </div>
            <div className="truncate text-center">
              {icon.name.length > 10 ? `${icon.name.slice(0, 9)}…` : icon.name}
            </div>
          </button>
        );
      })}
    </div>
  );
}
