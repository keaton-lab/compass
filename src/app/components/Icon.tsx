'use client';

import * as LucideIcons from 'lucide-react';
import * as simpleIcons from 'simple-icons';
import type { LucideIcon } from 'lucide-react';
import BrandIcon from './BrandIcon';

const LUCIDE_ICON_NAMES: string[] = Object.keys(LucideIcons).filter(
  (name) => name !== 'createLucideIcon' && name !== 'LucideIcon' && name !== 'LucideProps' && name !== 'IconProps'
);

const lucideIconMap: Record<string, LucideIcon> = LUCIDE_ICON_NAMES.reduce((acc, name) => {
  const key = name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2');
  const icon = (LucideIcons as Record<string, unknown>)[name];
  if (typeof icon === 'function' || typeof icon === 'object') {
    acc[key] = icon as LucideIcon;
    acc[name] = icon as LucideIcon;
  }
  return acc;
}, {} as Record<string, LucideIcon>);

const BRAND_ICON_NAMES: string[] = Object.keys(simpleIcons).map(
  (name) => name.replace(/^si/, '').toLowerCase()
);

const brandIcons = new Set(BRAND_ICON_NAMES);

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function Icon({ name, size = 24, className = '', color }: IconProps) {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '-');
  
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
  
  const LucideComponent = lucideIconMap[normalizedName] || lucideIconMap[name];
  
  if (LucideComponent) {
    return <LucideComponent size={size} className={className} color={color} />;
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
  lucide: LUCIDE_ICON_NAMES,
  brands: BRAND_ICON_NAMES
};
