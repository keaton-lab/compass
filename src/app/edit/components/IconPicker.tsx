'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface BrandIcon {
  name: string;
  slug: string;
  path: string;
  hex: string;
}

interface IconPickerProps {
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
  const [visibleCount, setVisibleCount] = useState(100);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef<{ lucide: boolean; brand: boolean }>({ lucide: false, brand: false });

  useEffect(() => {
    loadLucideIconNames().then((names) => {
      setLucideIconNames(names);
      loadedRef.current.lucide = true;
    });
    loadBrandIcons().then((icons) => {
      setBrandIcons(icons);
      loadedRef.current.brand = true;
    });
  }, []);

  useEffect(() => {
    if (tab === 'lucide' && !loadedRef.current.lucide) {
      setLoading(true);
      loadLucideIconNames().then((names) => {
        setLucideIconNames(names);
        loadedRef.current.lucide = true;
        setLoading(false);
      });
    } else if (tab === 'brand' && !loadedRef.current.brand) {
      setLoading(true);
      loadBrandIcons().then((icons) => {
        setBrandIcons(icons);
        loadedRef.current.brand = true;
        setLoading(false);
      });
    }
  }, [tab]);

  const filteredLucideIcons = useMemo(() => {
    if (!search.trim()) return lucideIconNames;
    const s = search.toLowerCase();
    return lucideIconNames.filter((name) => name.toLowerCase().includes(s));
  }, [search, lucideIconNames]);

  const filteredBrandIcons = useMemo(() => {
    if (!brandIcons.length) return [];
    if (!search.trim()) return brandIcons;
    const s = search.toLowerCase();
    return brandIcons.filter(
      (icon) => icon.name.toLowerCase().includes(s) || icon.slug.toLowerCase().includes(s)
    );
  }, [search, brandIcons]);

  useEffect(() => {
    setVisibleCount(100);
  }, [search, tab]);

  const handleSelect = (name: string) => {
    onChange(name);
    onClose();
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      const currentList = tab === 'lucide' ? filteredLucideIcons : filteredBrandIcons;
      if (visibleCount < currentList.length) {
        setVisibleCount((prev) => Math.min(prev + 100, currentList.length));
      }
    }
  }, [tab, filteredLucideIcons, filteredBrandIcons, visibleCount]);

  const visibleLucideIcons = filteredLucideIcons.slice(0, visibleCount);
  const visibleBrandIcons = filteredBrandIcons.slice(0, visibleCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-[var(--panel-strong)] border border-[var(--panel-border)] rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--panel-border)] shrink-0">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">选择图标</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--muted)]/20 transition-colors">
            <X className="w-5 h-5 text-[var(--muted)]" />
          </button>
        </div>

        <div className="p-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索图标名称..."
              autoFocus
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-[var(--background)] border border-[var(--panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
          </div>
        </div>

        <div className="flex gap-2 px-4 shrink-0">
          <button
            onClick={() => setTab('lucide')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'lucide' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Lucide ({filteredLucideIcons.length})
          </button>
          <button
            onClick={() => setTab('brand')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'brand' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            品牌 ({filteredBrandIcons.length})
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4" onScroll={handleScroll}>
          {tab === 'lucide' ? (
            loading && lucideIconNames.length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)] py-12">加载图标中...</p>
            ) : filteredLucideIcons.length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)] py-12">未找到匹配的图标</p>
            ) : (
              <LucideIconGrid icons={visibleLucideIcons} value={value} onSelect={handleSelect} />
            )
          ) : loading && brandIcons.length === 0 ? (
            <p className="text-center text-sm text-[var(--muted)] py-12">加载品牌图标中...</p>
          ) : filteredBrandIcons.length === 0 ? (
            <p className="text-center text-sm text-[var(--muted)] py-12">未找到匹配的图标</p>
          ) : (
            <BrandIconGrid icons={visibleBrandIcons} value={value} onSelect={handleSelect} />
          )}
          {(tab === 'lucide' && visibleLucideIcons.length < filteredLucideIcons.length) ||
           (tab === 'brand' && visibleBrandIcons.length < filteredBrandIcons.length) ? (
            <div className="col-span-full text-center py-4 text-sm text-[var(--muted)]">
              加载更多...
            </div>
          ) : null}
        </div>

        <div className="px-4 pb-4 shrink-0 border-t border-[var(--panel-border)] pt-3">
          <p className="text-sm text-[var(--muted)]">
            当前选中: <code className="bg-[var(--muted)]/20 px-2 py-1 rounded">{value}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

function LucideIconGrid({ icons, value, onSelect }: { icons: string[]; value: string; onSelect: (name: string) => void }) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {icons.map((iconName) => {
        const isSelected = value === iconName;
        return (
          <button
            key={iconName}
            onClick={() => onSelect(iconName)}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs transition-all ${
              isSelected ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--muted)]/10'
            }`}
            title={iconName}
          >
            <LucideIcon name={iconName} size={22} />
            <span className="text-[var(--muted)] truncate w-full text-center" style={{ fontSize: '9px' }}>
              {iconName.length > 10 ? iconName.slice(0, 9) + '…' : iconName}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BrandIconGrid({ icons, value, onSelect }: { icons: BrandIcon[]; value: string; onSelect: (name: string) => void }) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {icons.map((icon) => {
        const isSelected = value === icon.slug;
        return (
          <button
            key={icon.slug}
            onClick={() => onSelect(icon.slug)}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs transition-all ${
              isSelected ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--muted)]/10'
            }`}
            title={icon.name}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" style={{ fill: '#000' }}>
              <path d={icon.path} />
            </svg>
            <span className="text-[var(--muted)] truncate w-full text-center" style={{ fontSize: '9px' }}>
              {icon.name.length > 10 ? icon.name.slice(0, 9) + '…' : icon.name}
            </span>
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
