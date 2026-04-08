import Icon from './Icon';
import type { Link as LinkType } from '../types';

interface NavigationCardProps {
  link: LinkType;
  color: string;
  animations: boolean;
}

export default function NavigationCard({ link, color, animations }: NavigationCardProps) {
  const cardClassName = animations
    ? 'transition-all duration-200 hover:border-[color:var(--accent-border)] hover:bg-[var(--panel-strong)] active:scale-[0.99]'
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

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex min-h-[72px] cursor-pointer flex-col overflow-hidden rounded-lg border bg-[var(--panel)] p-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-border)] md:min-h-[68px] md:flex-row md:items-center md:gap-3 ${cardClassName}`}
      style={{ borderColor: 'var(--panel-border)' }}
    >
      {/* 左侧图标 */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
        style={{
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
        }}
      >
        <Icon
          name={link.icon}
          size={18}
          color={color}
          className={iconClassName}
        />
      </div>

      {/* 中间内容 */}
      <div className="mt-2 min-w-0 flex-1 md:mt-0">
        <h3 className={`truncate text-sm font-medium text-[var(--text-primary)] ${titleClassName}`}>
          {link.name}
        </h3>
        <p className="mt-0.5 max-w-[24ch] truncate text-xs text-[var(--muted)]">
          {link.description}
        </p>
      </div>

      {/* 右侧箭头 */}
      <div className={`absolute right-2.5 top-2.5 text-[var(--muted)] md:static md:ml-auto md:flex-none ${arrowClassName}`}>
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
