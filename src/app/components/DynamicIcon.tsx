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
let lucideLoaderMapPromise: Promise<Map<string, LucideIconLoader>> | null = null;
let brandIconMapPromise: Promise<Map<string, string>> | null = null;

async function getLucideLoaderMap() {
  if (!lucideLoaderMapPromise) {
    lucideLoaderMapPromise = import('lucide-react/dynamicIconImports').then((dynamicImports) => {
      const loaders = (dynamicImports.default ?? dynamicImports) as Record<string, LucideIconLoader>;
      const normalizedLoaderMap = new Map<string, LucideIconLoader>();

      Object.entries(loaders).forEach(([key, loader]) => {
        normalizedLoaderMap.set(key, loader);
        normalizedLoaderMap.set(key.replace(/-/g, ''), loader);
      });

      return normalizedLoaderMap;
    });
  }

  return lucideLoaderMapPromise;
}

async function loadLucideIcon(name: string): Promise<LucideIcon | null> {
  const kebab = toKebabCase(name);
  const compact = kebab.replace(/-/g, '');
  const loaderMap = await getLucideLoaderMap();
  const loader = loaderMap.get(kebab) ?? loaderMap.get(compact);
  if (!loader) return null;

  const mod = await loader();
  return mod.default;
}

async function getBrandIconMap() {
  if (!brandIconMapPromise) {
    brandIconMapPromise = import('simple-icons').then((simpleIcons) => {
      const iconMap = new Map<string, string>();
      const entries = simpleIcons as unknown as Record<string, SimpleIconModuleEntry>;

      for (const key of Object.keys(entries)) {
        if (!key.startsWith('si') || key.length <= 2) continue;

        const icon = entries[key];
        const aliases = [icon.slug, icon.title, icon.slug.replace(/-/g, ''), icon.title.replace(/[^a-zA-Z0-9]/g, '')];

        for (const alias of aliases) {
          const normalizedAlias = normalizeBrandIconKey(alias);
          if (normalizedAlias && !iconMap.has(normalizedAlias)) {
            iconMap.set(normalizedAlias, icon.path);
          }
        }
      }

      return iconMap;
    });
  }

  return brandIconMapPromise;
}

async function loadBrandIconPath(name: string): Promise<string | null> {
  const normalizedName = normalizeBrandIconKey(name);
  if (!normalizedName) return null;

  const iconMap = await getBrandIconMap();
  return iconMap.get(normalizedName) ?? null;
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
