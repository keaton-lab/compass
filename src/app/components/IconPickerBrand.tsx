'use client';

import * as simpleIcons from 'simple-icons';

function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

interface BrandIconProps {
  name: string;
  size: number;
}

export default function IconPickerBrand({ name, size }: BrandIconProps) {
  const key = `si${toPascalCase(name)}` as keyof typeof simpleIcons;
  const iconData = simpleIcons[key] as { path: string; hex: string } | undefined;
  
  if (!iconData) {
    return <span className="text-xs text-gray-500">{name.slice(0, 2)}</span>;
  }
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={`#${iconData.hex}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={iconData.path} />
    </svg>
  );
}
