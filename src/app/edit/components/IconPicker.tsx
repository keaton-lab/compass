'use client';

import { Dialog, ScrollArea, Tabs } from 'radix-ui';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface BrandIcon {
  name: string;
  slug: string;
  path: string;
  hex: string;
}

export interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  onClose: () => void;
}

let lucideIconNamesCache: string[] | null = null;
let brandIconsCache: BrandIcon[] | null = null;

async function loadLucideIconNames(): Promise<string[]> {
  if (lucideIconNamesCache) return lucideIconNamesCache;
  const lucide = await import('lucide-react');
  lucideIconNamesCache = Object.keys(lucide).filter(
    (key) => key[0] === key[0].toUpperCase() && key !== 'Icon' && key !== 'default' && !key.endsWith('Icon')
  );
  return lucideIconNamesCache;
}

async function loadBrandIcons(): Promise<BrandIcon[]> {
  if (brandIconsCache) return brandIconsCache;
  const si = await import('simple-icons');
  const siRecord = si as unknown as Record<string, { slug: string; path: string; hex: string }>;
  brandIconsCache = Object.keys(siRecord)
    .filter((key) => key.startsWith('si') && key.length > 2)
    .map((key) => {
      const iconData = siRecord[key];
      return {
        name: key.slice(2),
        slug: iconData.slug,
        path: iconData.path,
        hex: iconData.hex,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return brandIconsCache;
}

export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'lucide' | 'brand'>('lucide');
  const [lucideIconNames, setLucideIconNames] = useState<string[]>([]);
  const [brandIcons, setBrandIcons] = useState<BrandIcon[]>([]);
  const [visibleCount, setVisibleCount] = useState(120);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef<{ lucide: boolean; brand: boolean }>({ lucide: false, brand: false });

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    loadLucideIconNames().then((names) => {
      if (cancelled) return;
      setLucideIconNames(names);
      loadedRef.current.lucide = true;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (tab === 'brand' && !loadedRef.current.brand) {
      setLoading(true);
      loadBrandIcons().then((icons) => {
        if (cancelled) return;
        setBrandIcons(icons);
        loadedRef.current.brand = true;
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [tab]);

  const filteredLucideIcons = useMemo(() => {
    if (!search.trim()) return lucideIconNames;
    const normalizedSearch = search.toLowerCase();
    return lucideIconNames.filter((name) => name.toLowerCase().includes(normalizedSearch));
  }, [lucideIconNames, search]);

  const filteredBrandIcons = useMemo(() => {
    if (!brandIcons.length) return [];
    if (!search.trim()) return brandIcons;
    const normalizedSearch = search.toLowerCase();
    return brandIcons.filter(
      (icon) => icon.name.toLowerCase().includes(normalizedSearch) || icon.slug.toLowerCase().includes(normalizedSearch)
    );
  }, [brandIcons, search]);

  useEffect(() => {
    setVisibleCount(120);
  }, [search, tab]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 220) {
      const currentLength = tab === 'lucide' ? filteredLucideIcons.length : filteredBrandIcons.length;
      if (visibleCount < currentLength) {
        setVisibleCount((previous) => Math.min(previous + 120, currentLength));
      }
    }
  }, [filteredBrandIcons.length, filteredLucideIcons.length, tab, visibleCount]);

  const visibleLucideIcons = filteredLucideIcons.slice(0, visibleCount);
  const visibleBrandIcons = filteredBrandIcons.slice(0, visibleCount);

  function handleSelect(icon: string) {
    onChange(icon);
    onClose();
  }

  return (
    <Dialog.Root open onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--background)]/72" />
        <Dialog.Content className="fixed inset-x-4 top-[6vh] z-[51] mx-auto flex max-h-[88vh] w-auto max-w-5xl flex-col overflow-hidden rounded-[24px] border bg-[var(--panel-strong)] outline-none" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: 'var(--panel-border)' }}>
            <div>
              <Dialog.Title className="text-xl font-semibold text-[var(--text-primary)]">选择图标</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[var(--muted)]">
                扁平化图标选择器，支持 Lucide 和品牌图标。
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-[14px] border bg-[var(--background)] text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: 'var(--panel-border)' }}
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <Tabs.Root value={tab} onValueChange={(nextTab) => setTab(nextTab as 'lucide' | 'brand')} className="flex min-h-0 flex-1 flex-col">
            <div className="border-b px-6 py-4" style={{ borderColor: 'var(--panel-border)' }}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索图标名称..."
                  autoFocus
                  className="w-full rounded-[18px] border bg-[var(--background)] px-11 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent-border)]"
                  style={{ borderColor: 'var(--panel-border)' }}
                />
              </div>

              <Tabs.List className="mt-4 inline-flex rounded-[18px] border bg-[var(--background)] p-1" style={{ borderColor: 'var(--panel-border)' }}>
                <Tabs.Trigger
                  value="lucide"
                  className="rounded-[14px] px-4 py-2 text-sm font-medium text-[var(--muted)] outline-none transition-colors data-[state=active]:bg-[var(--accent-alpha)] data-[state=active]:text-[var(--foreground)]"
                >
                  Lucide ({filteredLucideIcons.length})
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="brand"
                  className="rounded-[14px] px-4 py-2 text-sm font-medium text-[var(--muted)] outline-none transition-colors data-[state=active]:bg-[var(--accent-alpha)] data-[state=active]:text-[var(--foreground)]"
                >
                  品牌 ({filteredBrandIcons.length})
                </Tabs.Trigger>
              </Tabs.List>
            </div>

            <Tabs.Content value="lucide" className="min-h-0 flex-1 outline-none">
              <PickerPanel
                loading={loading && lucideIconNames.length === 0}
                empty={filteredLucideIcons.length === 0}
                emptyLabel="未找到匹配的图标"
                onScroll={handleScroll}
              >
                <LucideIconGrid icons={visibleLucideIcons} value={value} onSelect={handleSelect} />
                {visibleLucideIcons.length < filteredLucideIcons.length && (
                  <FooterHint label="继续滚动以加载更多 Lucide 图标" />
                )}
              </PickerPanel>
            </Tabs.Content>

            <Tabs.Content value="brand" className="min-h-0 flex-1 outline-none">
              <PickerPanel
                loading={loading && brandIcons.length === 0}
                empty={filteredBrandIcons.length === 0}
                emptyLabel="未找到匹配的品牌图标"
                onScroll={handleScroll}
              >
                <BrandIconGrid icons={visibleBrandIcons} value={value} onSelect={handleSelect} />
                {visibleBrandIcons.length < filteredBrandIcons.length && (
                  <FooterHint label="继续滚动以加载更多品牌图标" />
                )}
              </PickerPanel>
            </Tabs.Content>
          </Tabs.Root>

          <div className="border-t px-6 py-4 text-sm text-[var(--muted)]" style={{ borderColor: 'var(--panel-border)' }}>
            当前选中: <code className="rounded-[10px] bg-[var(--background)] px-2 py-1 text-[var(--text-primary)]">{value}</code>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PickerPanel({
  loading,
  empty,
  emptyLabel,
  onScroll,
  children,
}: {
  loading: boolean;
  empty: boolean;
  emptyLabel: string;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return <p className="p-10 text-center text-sm text-[var(--muted)]">加载中...</p>;
  }

  if (empty) {
    return <p className="p-10 text-center text-sm text-[var(--muted)]">{emptyLabel}</p>;
  }

  return (
    <ScrollArea.Root className="min-h-0 flex-1">
      <ScrollArea.Viewport className="h-full w-full px-6 py-5" onScroll={onScroll}>
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" className="flex w-3 touch-none p-0.5">
        <ScrollArea.Thumb className="relative flex-1 rounded-full bg-[var(--panel-border)]" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

function FooterHint({ label }: { label: string }) {
  return <div className="pt-4 text-center text-sm text-[var(--muted)]">{label}</div>;
}

function LucideIconGrid({ icons, value, onSelect }: { icons: string[]; value: string; onSelect: (name: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10">
      {icons.map((iconName) => {
        const isSelected = value === iconName;

        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onSelect(iconName)}
            className={`rounded-[16px] border px-2 py-3 text-xs transition-colors ${
              isSelected
                ? 'bg-[var(--accent-alpha)] text-[var(--foreground)]'
                : 'bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--bg-secondary)]'
            }`}
            style={{ borderColor: isSelected ? 'var(--accent-border)' : 'var(--panel-border)' }}
            title={iconName}
          >
            <div className="mb-2 flex justify-center">
              <LucideIcon name={iconName} size={20} />
            </div>
            <div className="truncate text-center">
              {iconName.length > 10 ? `${iconName.slice(0, 9)}…` : iconName}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function BrandIconGrid({ icons, value, onSelect }: { icons: BrandIcon[]; value: string; onSelect: (name: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-3 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-10">
      {icons.map((icon) => {
        const isSelected = value === icon.slug;

        return (
          <button
            key={icon.slug}
            type="button"
            onClick={() => onSelect(icon.slug)}
            className={`rounded-[16px] border px-2 py-3 text-xs transition-colors ${
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

function LucideIcon({ name, size }: { name: string; size: number }) {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<{ size: number }> | null>(null);

  useEffect(() => {
    import('lucide-react').then((lucide) => {
      const Icon = (lucide as unknown as Record<string, React.ComponentType<{ size: number }>>)[name];
      setIconComponent(() => Icon);
    });
  }, [name]);

  if (!IconComponent) {
    return <span className="text-xs text-[var(--muted)]">{name.charAt(0)}</span>;
  }

  return <IconComponent size={size} />;
}
