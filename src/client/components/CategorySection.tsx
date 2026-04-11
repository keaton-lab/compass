import ResolvedIcon from './ResolvedIcon';
import type { ResolvedCategory as CategoryType } from '@/shared/types';
import NavigationCard from './NavigationCard';

interface CategorySectionProps {
  category: CategoryType;
  layout: 'grid' | 'list';
  animations: boolean;
}

export default function CategorySection({ category, layout, animations }: CategorySectionProps) {
  const gridColumnsClass = layout === 'grid'
    ? 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1';
  const gapClass = layout === 'list' ? 'gap-3' : 'gap-2.5 xsm:gap-3';

  return (
    <section className="content-auto">
      {/* 分类标题 */}
      <div className="mb-3 flex items-center gap-3 md:mb-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md border"
          style={{
            backgroundColor: `${category.color}15`,
            borderColor: `${category.color}30`,
          }}
        >
          <ResolvedIcon
            icon={category.resolvedIcon}
            name={category.icon}
            size={16}
            color={category.color}
          />
        </div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {category.name}
        </h2>
        <span className="text-xs text-[var(--muted)]">
          {category.links.length}
        </span>
      </div>

      {/* 链接网格 */}
      <div className={`grid ${gridColumnsClass} ${gapClass}`}>
        {category.links.map((link) => (
          <div key={link.id} className="h-full">
            <NavigationCard link={link} color={category.color} animations={animations} />
          </div>
        ))}
      </div>
    </section>
  );
}
