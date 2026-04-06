'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { icons as lucideIcons } from 'lucide-react';

const allLucideIconNames = Object.keys(lucideIcons);

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

function renderLucideIcon(name: string, size: number = 24) {
  const IconComponent = lucideIcons[name as keyof typeof lucideIcons];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }
  return <span className="text-xs text-[var(--muted)]">{name.charAt(0)}</span>;
}

export default function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'lucide' | 'brand'>('lucide');
  const [brandIcons, setBrandIcons] = useState<BrandIcon[]>([]);
  const [brandIconsLoaded, setBrandIconsLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(100);

  useEffect(() => {
    if (tab === 'brand' && !brandIconsLoaded) {
      import('simple-icons').then((si) => {
        const siRecord = si as unknown as Record<string, { slug: string; path: string; hex: string }>;
        const icons = Object.keys(siRecord)
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
        setBrandIcons(icons);
        setBrandIconsLoaded(true);
      });
    }
  }, [tab, brandIconsLoaded]);

  const filteredLucideIcons = useMemo(() => {
    if (!search.trim()) return allLucideIconNames;
    const s = search.toLowerCase();
    return allLucideIconNames.filter((name) => name.toLowerCase().includes(s));
  }, [search]);

  const filteredBrandIcons = useMemo(() => {
    if (!brandIcons.length) return [];
    if (!search.trim()) return brandIcons;
    const s = search.toLowerCase();
    return brandIcons.filter(
      (icon) => icon.name.toLowerCase().includes(s) || icon.slug.toLowerCase().includes(s)
    );
  }, [search, brandIcons]);

  // 重置可见数量当搜索或tab改变时
  useEffect(() => {
    setVisibleCount(100);
  }, [search, tab]);

  const handleSelect = (name: string) => {
    onChange(name);
    onClose();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      const currentList = tab === 'lucide' ? filteredLucideIcons : filteredBrandIcons;
      if (visibleCount < currentList.length) {
        setVisibleCount((prev) => Math.min(prev + 100, currentList.length));
      }
    }
  };

  const visibleLucideIcons = filteredLucideIcons.slice(0, visibleCount);
  const visibleBrandIcons = filteredBrandIcons.slice(0, visibleCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-[var(--panel-strong)] border border-[var(--panel-border)] rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--panel-border)] shrink-0">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">选择图标</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--muted)]/20 transition-colors">
            <X className="w-5 h-5 text-[var(--muted)]" />
          </button>
        </div>

        {/* Search */}
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

        {/* Tabs */}
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
            品牌 {brandIconsLoaded ? `(${filteredBrandIcons.length})` : ''}
          </button>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
          {tab === 'lucide' ? (
            filteredLucideIcons.length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)] py-12">未找到匹配的图标</p>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {visibleLucideIcons.map((iconName) => {
                  const isSelected = value === iconName;
                  return (
                    <button
                      key={iconName}
                      onClick={() => handleSelect(iconName)}
                      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs transition-all ${
                        isSelected ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--muted)]/10'
                      }`}
                      title={iconName}
                    >
                      <span className="text-[var(--foreground)]">{renderLucideIcon(iconName, 22)}</span>
                      <span className="text-[var(--muted)] truncate w-full text-center" style={{ fontSize: '9px' }}>
                        {iconName.length > 10 ? iconName.slice(0, 9) + '…' : iconName}
                      </span>
                    </button>
                  );
                })}
                {visibleLucideIcons.length < filteredLucideIcons.length && (
                  <div className="col-span-full text-center py-4 text-sm text-[var(--muted)]">
                    加载更多...
                  </div>
                )}
              </div>
            )
          ) : !brandIconsLoaded ? (
            <p className="text-center text-sm text-[var(--muted)] py-12">加载品牌图标中...</p>
          ) : filteredBrandIcons.length === 0 ? (
            <p className="text-center text-sm text-[var(--muted)] py-12">未找到匹配的图标</p>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {visibleBrandIcons.map((icon) => {
                const isSelected = value === icon.slug;
                return (
                  <button
                    key={icon.slug}
                    onClick={() => handleSelect(icon.slug)}
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
              {visibleBrandIcons.length < filteredBrandIcons.length && (
                <div className="col-span-full text-center py-4 text-sm text-[var(--muted)]">
                  加载更多...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 pb-4 shrink-0 border-t border-[var(--panel-border)] pt-3">
          <p className="text-sm text-[var(--muted)]">
            当前选中: <code className="bg-[var(--muted)]/20 px-2 py-1 rounded">{value}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
