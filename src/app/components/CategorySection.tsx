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
  void index;

  // Determine grid layout classes based on current settings
  const gridColumnsClass = layout === 'grid'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1';
  const gapClass = layout === 'list' ? 'gap-6' : 'gap-4';

  // If animations are disabled, render static markup (no motion components)
  if (!animations) {
    return (
      <section className="mb-12">
        {/* Category Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon name={category.icon} size={20} />
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{category.name}</h2>
            <div 
              className="h-px flex-1 min-w-[60px]"
              style={{ 
                background: `linear-gradient(to right, ${category.color}40, transparent)` 
              }}
            />
          </div>
        </div>

        {/* Links Grid */}
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
      <section className="mb-12">
        {/* Category Header (animated) */}
        <motion.div 
          className="flex items-center gap-3 mb-6"
          variants={containerVariants}
        >
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon name={category.icon} size={20} />
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{category.name}</h2>
            <div 
              className="h-px flex-1 min-w-[60px]"
              style={{ 
                background: `linear-gradient(to right, ${category.color}40, transparent)` 
              }}
            />
          </div>
        </motion.div>

        {/* Links Grid */}
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
