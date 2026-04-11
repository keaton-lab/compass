import type { CSSProperties } from 'react';
import ResolvedIcon from './ResolvedIcon';
import type { ResolvedLink as LinkType } from '@/shared/types';

interface NavigationCardProps {
  link: LinkType;
  color: string;
  animations: boolean;
}

export default function NavigationCard({ link, color, animations }: NavigationCardProps) {
  const cardClassName = animations
    ? 'transition-all duration-200 hover:border-[color:var(--card-border-hover)] hover:bg-[var(--panel-strong)] active:scale-[0.99]'
    : '';
  const iconClassName = animations
    ? 'transition-transform duration-200 group-hover:scale-105'
    : '';
  const titleClassName = animations
    ? 'transition-colors duration-200 group-hover:text-[var(--accent)]'
    : '';
  const arrowClassName = animations
    ? 'opacity-0 transition-all duration-200 group-hover:opacity-100 md:opacity-60'
    : 'opacity-60';
  const cardStyle = {
    borderColor: 'var(--panel-border)',
    '--card-border-hover': `${color}55`,
  } as CSSProperties;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-search-item
      data-search-name={link.name.toLowerCase()}
      data-search-description={link.description.toLowerCase()}
      className={`home-nav-card group relative flex min-h-[64px] cursor-pointer flex-col overflow-hidden rounded-lg border bg-[var(--panel)] p-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-border)] xsm:min-h-[72px] xsm:p-3 md:min-h-[68px] md:flex-row md:items-center md:gap-3 ${cardClassName}`}
      style={cardStyle}
    >
      {/* 左侧图标 */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border xsm:h-9 xsm:w-9"
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
        }}
      >
        <ResolvedIcon
          icon={link.resolvedIcon}
          name={link.icon}
          size={18}
          color={color}
          className={iconClassName}
        />
      </div>

      {/* 中间内容 */}
      <div className="mt-1.5 min-w-0 flex-1 xsm:mt-2 md:mt-0">
        <h3 className={`truncate text-[13px] font-medium leading-4 text-[var(--text-primary)] xsm:text-sm ${titleClassName}`}>
          {link.name}
        </h3>
        <p className="mt-0.5 max-w-full truncate text-[11px] leading-4 text-[var(--muted)] xsm:max-w-[24ch] xsm:text-xs">
          {link.description}
        </p>
      </div>

      {/* 右侧箭头 */}
      <div className={`absolute right-2 top-2 text-[var(--muted)] xsm:right-2.5 xsm:top-2.5 md:static md:ml-auto md:flex-none ${arrowClassName}`}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </div>
    </a>
  );
}
