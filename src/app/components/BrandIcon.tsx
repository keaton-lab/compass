'use client';

import * as simpleIcons from 'simple-icons';

function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

interface BrandIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function BrandIcon({ name, size = 24, className = '', color }: BrandIconProps) {
  const key = `si${toPascalCase(name)}` as keyof typeof simpleIcons;
  const iconData = simpleIcons[key] as { path: string; hex: string } | undefined;
  
  if (!iconData) {
    return <span className={`${className}`} style={{ fontSize: size * 0.5 }}>{name.slice(0, 2)}</span>;
  }
  
  const fillColor = color ? color : 'currentColor';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d={iconData.path} />
    </svg>
  );
}
