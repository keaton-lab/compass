'use client';

import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import BrandIcon from './BrandIcon';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

type ResolvedIcon =
  | { kind: 'lucide'; component: LucideIcon }
  | { kind: 'brand'; svg: string | null };

let lucideResolverPromise: Promise<(name: string) => LucideIcon | null> | null = null;
const brandSvgCache: Record<string, string> = {};
const brandSvgPromiseCache: Record<string, Promise<string | null>> = {};
const resolvedIconCache = new Map<string, ResolvedIcon>();

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function toSlug(value: string): string {
  return toKebabCase(value).replace(/^icon:/, '');
}

async function getLucideResolver() {
  if (!lucideResolverPromise) {
    lucideResolverPromise = import('lucide-react').then((module) => {
      const exactMap = new Map<string, LucideIcon>();
      const normalizedMap = new Map<string, LucideIcon>();

      Object.entries(module).forEach(([exportName, icon]) => {
        if (!/^[A-Z]/.test(exportName) || exportName.endsWith('Icon')) {
          return;
        }

        const typedIcon = icon as LucideIcon;
        const kebab = toKebabCase(exportName);

        exactMap.set(exportName, typedIcon);
        normalizedMap.set(kebab, typedIcon);
        normalizedMap.set(kebab.replace(/-/g, ''), typedIcon);
      });

      return (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return null;
        }

        const kebab = toKebabCase(trimmed);
        return (
          exactMap.get(trimmed) ??
          normalizedMap.get(kebab) ??
          normalizedMap.get(kebab.replace(/-/g, '')) ??
          null
        );
      };
    });
  }

  return lucideResolverPromise;
}

async function fetchBrandSvg(slug: string): Promise<string | null> {
  if (brandSvgCache[slug]) {
    return brandSvgCache[slug];
  }

  if (slug in brandSvgPromiseCache) {
    return brandSvgPromiseCache[slug];
  }

  const promise = (async () => {
    try {
      const response = await fetch(`https://cdn.simpleicons.org/${slug}`);
      if (!response.ok) {
        return null;
      }
      const svg = await response.text();
      brandSvgCache[slug] = svg;
      return svg;
    } catch {
      return null;
    }
  })();

  brandSvgPromiseCache[slug] = promise;
  return promise;
}

async function getBrandResolver() {
  return async (name: string) => {
    const slug = toSlug(name);
    if (!slug) {
      return null;
    }

    const svg = await fetchBrandSvg(slug);
    if (svg) {
      return svg;
    }

    return null;
  };
}

export default function Icon({ name, size = 24, className = '', color }: IconProps) {
  const [resolvedIcon, setResolvedIcon] = useState<ResolvedIcon | null>(() => {
    return resolvedIconCache.get(name) ?? null;
  });

  useEffect(() => {
    const cachedIcon = resolvedIconCache.get(name);
    if (cachedIcon) {
      setResolvedIcon(cachedIcon);
      return;
    }

    let cancelled = false;

    async function resolveIcon() {
      const lucideResolver = await getLucideResolver();
      const lucideIcon = lucideResolver(name);

      if (lucideIcon) {
        const result: ResolvedIcon = {
          kind: 'lucide',
          component: lucideIcon,
        };
        resolvedIconCache.set(name, result);
        if (!cancelled) {
          setResolvedIcon(result);
        }
        return;
      }

      const brandResolver = await getBrandResolver();
      const brandSvg = await brandResolver(name);
      const result: ResolvedIcon = {
        kind: 'brand',
        svg: brandSvg,
      };

      resolvedIconCache.set(name, result);
      if (!cancelled) {
        setResolvedIcon(result);
      }
    }

    void resolveIcon();

    return () => {
      cancelled = true;
    };
  }, [name]);

  if (resolvedIcon?.kind === 'lucide') {
    const LucideComponent = resolvedIcon.component;
    return <LucideComponent size={size} className={className} color={color} />;
  }

  return (
    <BrandIcon
      name={name}
      svg={resolvedIcon?.kind === 'brand' ? resolvedIcon.svg : null}
      size={size}
      className={className}
      color={color}
    />
  );
}
