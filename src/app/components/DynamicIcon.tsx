'use client';

import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { normalizeBrandIconKey, toKebabCase, type SimpleIconModuleEntry } from '../icon-utils';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

type LucideIconLoader = () => Promise<{ default: LucideIcon }>;

const lucideResolverCache = new Map<string, LucideIcon>();
const brandIconCache = new Map<string, string | null>();

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
  const entries = simpleIcons as unknown as Record<string, SimpleIconModuleEntry>;

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

    Promise.resolve().then(async () => {
      const cachedLucide = lucideResolverCache.get(name);
      const cachedBrand = brandIconCache.get(name);

      if (cachedLucide) {
        if (!cancelled) {
          setLucideIcon(cachedLucide);
          setBrandPath(null);
        }
        return;
      }

      if (cachedBrand !== undefined) {
        if (!cancelled) {
          setLucideIcon(null);
          setBrandPath(cachedBrand);
        }
        return;
      }

      const icon = await loadLucideIcon(name);
      if (cancelled) {
        return;
      }

      if (icon) {
        lucideResolverCache.set(name, icon);
        setLucideIcon(icon);
        setBrandPath(null);
        return;
      }

      const path = await loadBrandIconPath(name);
      if (cancelled) {
        return;
      }

      brandIconCache.set(name, path);
      setLucideIcon(null);
      setBrandPath(path);
    });

    return () => {
      cancelled = true;
    };
  }, [name]);

  if (lucideIcon) {
    const LucideComponent = lucideIcon;
    return <LucideComponent size={size} className={className} color={color} />;
  }

  if (!brandPath) {
    return <span className={className} style={{ fontSize: size * 0.5 }}>{name.slice(0, 2)}</span>;
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color || 'currentColor'}
      aria-hidden="true"
    >
      <path d={brandPath} />
    </svg>
  );
}
