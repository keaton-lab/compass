'use client';

import { motion } from 'framer-motion';
import AnimationController from './AnimationController';
import { useSettings } from '../contexts/SettingsContext';
import Icon from './Icon';
import type { Category as CategoryType } from '../types';
import NavigationCard from './NavigationCard';

interface CategorySectionProps {
  category: CategoryType;
  index: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  }
} as const;

export default function CategorySection({ category, index }: CategorySectionProps) {
  const { layout } = useSettings();
  const { animations } = useSettings();
  const categoryNumber = String(index + 1).padStart(2, '0');

  // Determine grid layout classes based on current settings
  const gridColumnsClass = layout === 'grid'
    ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1';
  const gapClass = layout === 'list' ? 'gap-5' : 'gap-3 md:gap-4';

  // If animations are disabled, render static markup (no motion components)
  if (!animations) {
    return (
      <section className="mb-12 md:mb-14">
        <div className="mb-5 flex flex-col gap-3 md:mb-7 md:flex-row md:items-end md:justify-between md:gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: `${category.color}18`,
                borderColor: `${category.color}38`
              }}
            >
              <Icon name={category.icon} size={20} color={category.color} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
                Sector {categoryNumber}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white md:text-2xl">
                {category.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="h-px w-16 md:w-28"
              style={{
                background: `linear-gradient(to right, transparent, ${category.color}80, transparent)`
              }}
            />
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              {category.links.length} links
            </p>
          </div>
        </div>

        <div className={`grid ${gridColumnsClass} ${gapClass}`}>
          {category.links.map((link) => (
            <div key={link.id}>
              <NavigationCard link={link} color={category.color} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Animations enabled: use AnimationController to apply animated container
  return (
    <AnimationController className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section className="mb-12 md:mb-14">
        <motion.div
          className="mb-5 flex flex-col gap-3 md:mb-7 md:flex-row md:items-end md:justify-between md:gap-4"
          variants={containerVariants}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: `${category.color}18`,
                borderColor: `${category.color}38`
              }}
            >
              <Icon name={category.icon} size={20} color={category.color} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
                Sector {categoryNumber}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white md:text-2xl">
                {category.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="h-px w-16 md:w-28"
              style={{
                background: `linear-gradient(to right, transparent, ${category.color}80, transparent)`
              }}
            />
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              {category.links.length} links
            </p>
          </div>
        </motion.div>

        <motion.div
          className={`grid ${gridColumnsClass} ${gapClass}`}
          variants={containerVariants}
        >
          {category.links.map((link, linkIndex) => (
            <motion.div
              key={link.id}
              variants={itemVariants}
              custom={linkIndex}
            >
              <NavigationCard link={link} color={category.color} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </AnimationController>
  );
}
