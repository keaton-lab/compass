'use client';

import type { LucideIcon } from 'lucide-react';
import { lucideIcons, lucideIconNames, brandIconNames } from '../../data/icons-manifest';
import BrandIcon from './BrandIcon';

const lucideIconMap: Record<string, LucideIcon> = {};

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

for (const [name, icon] of Object.entries(lucideIcons)) {
  const key = toKebabCase(name);
  lucideIconMap[name] = icon;
  lucideIconMap[key] = icon;
}

const brandIcons = new Set(brandIconNames);

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function Icon({ name, size = 24, className = '', color }: IconProps) {
  const normalizedName = toKebabCase(name);
  const LucideComponent = lucideIconMap[normalizedName] || lucideIconMap[name];
  
  if (LucideComponent) {
    return <LucideComponent size={size} className={className} color={color} />;
  }

  if (brandIcons.has(normalizedName)) {
    return (
      <BrandIcon
        name={normalizedName}
        size={size}
        className={className}
        color={color}
      />
    );
  }
  
  return (
    <BrandIcon 
      name={normalizedName}
      size={size}
      className={className}
      color={color}
    />
  );
}

export const AVAILABLE_ICONS = {
  lucide: lucideIconNames,
  brands: brandIconNames,
};
