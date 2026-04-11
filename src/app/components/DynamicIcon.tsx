'use client';

import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import BrandIcon from './BrandIcon';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

type LucideIconLoader = () => Promise<{ default: LucideIcon }>;

const lucideResolverCache = new Map<string, LucideIcon>();
const brandIconCache = new Map<string, string | null>();

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function normalizeBrandIconKey(value: string): string {
  return value
    .trim()
    .replace(/^icon:/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function loadLucideIcon(name: string): Promise<LucideIcon | null> {
  const kebab = toKebabCase(name);
  const compact = kebab.replace(/-/g, '');

  const dynamicImports = await import('lucide-react/dynamicIconImports');
  const loaders = (dynamicImports.default ?? dynamicImports) as Record<string, LucideIconLoader>;

  const loader = loaders[kebab] ?? loaders[compact];
  if (!loader) return null;

  const mod = await loader();
  return mod.default;
}

async function loadBrandIconPath(name: string): Promise<string | null> {
  const normalizedName = normalizeBrandIconKey(name);
  if (!normalizedName) return null;

  const simpleIcons = await import('simple-icons');
  const entries = simpleIcons as unknown as Record<string, { slug: string; title: string; path: string }>;

  for (const key of Object.keys(entries)) {
    if (!key.startsWith('si') || key.length <= 2) continue;
    const icon = entries[key];
    const aliases = [icon.slug, icon.title, icon.slug.replace(/-/g, ''), icon.title.replace(/[^a-zA-Z0-9]/g, '')];
    for (const alias of aliases) {
      if (normalizeBrandIconKey(alias) === normalizedName) {
        return icon.path;
      }
    }
  }
  return null;
}

export default function DynamicIcon({ name, size = 24, className = '', color }: DynamicIconProps) {
  const [lucideIcon, setLucideIcon] = useState<LucideIcon | null>(() => lucideResolverCache.get(name) ?? null);
  const [brandPath, setBrandPath] = useState<string | null | undefined>(() => brandIconCache.get(name));

  useEffect(() => {
    let cancelled = false;

    // 检查缓存
    const cachedLucide = lucideResolverCache.get(name);
    const cachedBrand = brandIconCache.get(name);

    if (cachedLucide) {
      setLucideIcon(cachedLucide);
      setBrandPath(null);
      return;
    }

    if (cachedBrand !== undefined) {
      setLucideIcon(null);
      setBrandPath(cachedBrand);
      return;
    }

    // 先尝试 Lucide
    loadLucideIcon(name).then((icon) => {
      if (cancelled) return;
      if (icon) {
        lucideResolverCache.set(name, icon);
        setLucideIcon(icon);
        setBrandPath(null);
        return;
      }

      // 再尝试品牌图标
      loadBrandIconPath(name).then((path) => {
        if (cancelled) return;
        brandIconCache.set(name, path);
        setBrandPath(path);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [name]);

  if (lucideIcon) {
    const LucideComponent = lucideIcon;
    return <LucideComponent size={size} className={className} color={color} />;
  }

  return <BrandIcon name={name} path={brandPath} size={size} className={className} color={color} />;
}
