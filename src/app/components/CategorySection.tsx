import Icon from './Icon';
import type { Category as CategoryType } from '../types';
import NavigationCard from './NavigationCard';

interface CategorySectionProps {
  category: CategoryType;
  layout: 'grid' | 'list';
}

export default function CategorySection({ category, layout }: CategorySectionProps) {
  const gridColumnsClass = layout === 'grid'
    ? 'grid-cols-2 xsm:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1';
  const gapClass = layout === 'list' ? 'gap-3' : 'gap-3';

  return (
    <section
      className="content-auto rounded-[24px] border bg-[var(--panel)] p-4 md:p-5"
      style={{ borderColor: 'var(--panel-border)' }}
    >
      <div className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-[16px] border"
            style={{
              backgroundColor: `${category.color}18`,
              borderColor: `${category.color}45`,
            }}
          >
            <Icon name={category.icon} size={20} color={category.color} />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-[0.01em] text-[var(--text-primary)] md:text-xl">
              {category.name}
            </h2>
          </div>
          <span
            className="ml-1 rounded-[999px] border px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)]"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--panel-border)' }}
          >
            {category.links.length}
          </span>
        </div>
      </div>

      <div className={`grid ${gridColumnsClass} ${gapClass}`}>
        {category.links.map((link) => (
          <div key={link.id} className="h-full">
            <NavigationCard link={link} color={category.color} />
          </div>
        ))}
      </div>
    </section>
  );
}
