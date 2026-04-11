import { createElement } from 'react';
import type { ResolvedIconData } from '../icon-types';
import BrandIcon from './BrandIcon';

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

  return (
    <BrandIcon
      name={name}
      path={icon?.kind === 'brand' ? icon.path : null}
      size={size}
      className={className}
      color={color}
    />
  );
}
