'use client';

import { siGithub } from 'simple-icons';

const brandIconsMap: Record<string, { path: string; hex: string }> = {
  github: { path: siGithub.path, hex: siGithub.hex },
};

interface BrandIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function BrandIcon({ name, size = 24, className = '', color }: BrandIconProps) {
  const iconData = brandIconsMap[name];
  
  if (!iconData) {
    return <span className={className} style={{ fontSize: size * 0.5 }}>{name.slice(0, 2)}</span>;
  }
  
  const fillColor = color || 'currentColor';
  
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
