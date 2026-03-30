'use client';

import { motion } from 'framer-motion';
import AnimationController from './AnimationController';
import { useSettings } from '../contexts/SettingsContext';
import Icon from './Icon';
import type { Category as CategoryType } from '../types';
import NavigationCard from './NavigationCard';

interface CategorySectionProps {
  category: CategoryType;
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

export default function CategorySection({ category }: CategorySectionProps) {
  const { layout } = useSettings();
  const { animations } = useSettings();

  // Determine grid layout classes based on current settings - more compact
  const gridColumnsClass = layout === 'grid'
    ? 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1';
  const gapClass = layout === 'list' ? 'gap-3' : 'gap-2';

  // If animations are disabled, render static markup (no motion components)
  if (!animations) {
    return (
      <section className="mb-8 md:mb-10">
        <div className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg border"
              style={{
                backgroundColor: `${category.color}18`,
                borderColor: `${category.color}38`
              }}
            >
              <Icon name={category.icon} size={20} color={category.color} />
            </div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white md:text-xl">
              {category.name}
            </h2>
            <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {category.links.length}
            </span>
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
    <AnimationController className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section className="mb-8 md:mb-10">
        <motion.div
          className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-center md:justify-between md:gap-4"
          variants={containerVariants}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg border"
              style={{
                backgroundColor: `${category.color}18`,
                borderColor: `${category.color}38`
              }}
            >
              <Icon name={category.icon} size={20} color={category.color} />
            </div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white md:text-xl">
              {category.name}
            </h2>
            <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {category.links.length}
            </span>
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
