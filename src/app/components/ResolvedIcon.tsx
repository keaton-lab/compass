import { createElement } from 'react';
import type { ResolvedIconData } from '../icon-types';

interface ResolvedIconProps {
  icon: ResolvedIconData | null | undefined;
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function ResolvedIcon({
  icon,
  name,
  size = 24,
  className = '',
  color,
}: ResolvedIconProps) {
  if (icon?.kind === 'lucide') {
    return (
      <svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color ?? 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {icon.nodes.map((node, index) => {
          const { key, ...attrs } = node.attrs;
          return createElement(node.tag, {
            ...attrs,
            key: key ?? `${node.tag}-${index}`,
          });
        })}
      </svg>
    );
  }

  const path = icon?.kind === 'brand' ? icon.path : null;

  if (!path) {
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
      <path d={path} />
    </svg>
  );
}
