'use client';

import { useState, useEffect } from 'react';
import { icons as lucideIcons } from 'lucide-react';

let brandIconsCache: Record<string, { path: string; hex: string }> | null = null;

async function loadBrandIcons() {
  if (brandIconsCache) return brandIconsCache;
  const si = await import('simple-icons');
  const cache: Record<string, { path: string; hex: string }> = {};
  Object.keys(si).forEach((key) => {
    if (key.startsWith('si') && key.length > 2) {
      const iconData = (si as unknown as Record<string, { slug: string; path: string; hex: string }>)[key];
      cache[iconData.slug] = { path: iconData.path, hex: iconData.hex };
    }
  });
  brandIconsCache = cache;
  return cache;
}

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

function DynamicBrandIcon({ name, size = 20, className = '' }: DynamicIconProps) {
  const [iconData, setIconData] = useState<{ path: string; hex: string } | null>(null);

  useEffect(() => {
    loadBrandIcons().then((cache) => {
      const data = cache[name.toLowerCase()];
      if (data) setIconData(data);
    });
  }, [name]);

  if (!iconData) {
    return <span className={className} style={{ fontSize: size }}>{name.charAt(0).toUpperCase()}</span>;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ fill: '#000' }}
      dangerouslySetInnerHTML={{ __html: `<path d="${iconData.path}"/>` }}
    />
  );
}

export default function DynamicIcon({ name, size = 20, className = '' }: DynamicIconProps) {
  const LucideIcon = lucideIcons[name as keyof typeof lucideIcons];
  if (LucideIcon) {
    return <LucideIcon size={size} className={className} />;
  }
  return <DynamicBrandIcon name={name} size={size} className={className} />;
}
