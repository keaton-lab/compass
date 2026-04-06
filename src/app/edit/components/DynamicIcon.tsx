'use client';

import { useState, useEffect } from 'react';

let brandIconsCache: Record<string, { path: string; hex: string }> | null = null;
const lucideCache: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {};

async function loadLucideIcon(name: string) {
  if (lucideCache[name]) return lucideCache[name];
  const lucide = await import('lucide-react');
  const Icon = (lucide as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name];
  if (Icon) {
    lucideCache[name] = Icon;
  }
  return Icon;
}

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

function DynamicLucideIcon({ name, size = 20, className = '' }: DynamicIconProps) {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<{ size?: number; className?: string }> | null>(null);

  useEffect(() => {
    loadLucideIcon(name).then((Icon) => {
      if (Icon) setIconComponent(() => Icon);
    });
  }, [name]);

  if (!IconComponent) {
    return <span className={className} style={{ fontSize: size }}>{name.charAt(0)}</span>;
  }
  return <IconComponent size={size} className={className} />;
}

export default function DynamicIcon({ name, size = 20, className = '' }: DynamicIconProps) {
  const name0 = name[0];
  if (name0 && name0 === name0.toUpperCase() && name0 !== name0.toLowerCase()) {
    return <DynamicLucideIcon name={name} size={size} className={className} />;
  }
  return <DynamicBrandIcon name={name} size={size} className={className} />;
}
