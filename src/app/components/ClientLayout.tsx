'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import CategorySection from './CategorySection';
import ProfileHeader from './ProfileHeader';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import { ProfileHeaderDesktopLeft } from './ProfileHeader';
import type { Profile, Settings, Category } from '../types';
import Icon from './Icon';

interface ClientLayoutProps {
  profile: Profile;
  settings: Settings;
  categories: Category[];
}

export default function ClientLayout({
  profile,
  settings,
  categories,
}: ClientLayoutProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        links: category.links.filter(
          (link) =>
            link.name.toLowerCase().includes(normalizedQuery) ||
            (link.description ?? '').toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((category) => category.links.length > 0);
  }, [categories, normalizedQuery]);

  const totalResults = filteredCategories.reduce(
    (acc, cat) => acc + cat.links.length,
    0,
  );
  const totalLinks = categories.reduce((acc, cat) => acc + cat.links.length, 0);
  const shouldShowSearch = settings.showSearch;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen text-foreground"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-5 md:px-6 md:pt-6 lg:px-8">
        <motion.header
          className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0"
          variants={itemVariants}
        >
          <div className="space-y-3 md:hidden">
            <ProfileHeader profile={profile} />
            {shouldShowSearch && (
              <SearchBar
                onSearch={setQuery}
                value={query}
                placeholder="搜索链接、描述或工作入口..."
                showResultCount
                resultCount={totalResults}
              />
            )}
          </div>

          <div className="hidden w-full items-center justify-between md:flex">
            <div className="glass-panel-strong w-[440px] rounded-[24px] px-6 py-4">
              <ProfileHeaderDesktopLeft profile={profile} />
            </div>
            <div className="flex items-center gap-3">
              {shouldShowSearch && (
                <SearchBar
                  compact
                  onSearch={setQuery}
                  value={query}
                  placeholder="搜索链接、描述或工作入口..."
                  showResultCount
                  resultCount={totalResults}
                />
              )}
              <ThemeToggle compact />
            </div>
          </div>
        </motion.header>

        <main className="mt-8 space-y-5 md:mt-10 md:space-y-6">
          {filteredCategories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <CategorySection
                category={category}
                layout={settings.layout}
              />
            </motion.div>
          ))}

          {normalizedQuery && filteredCategories.length === 0 && (
            <motion.div
              className="rounded-[22px] border bg-[var(--panel)] py-12 text-center"
              style={{ borderColor: 'var(--panel-border)' }}
              variants={itemVariants}
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">未找到结果</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">尝试其他关键词,或者检查链接描述中的命名方式。</p>
            </motion.div>
          )}
        </main>

        <motion.footer className="mt-8 hidden md:block" variants={itemVariants}>
          <div className="rounded-[22px] border bg-[var(--panel)] px-4 py-4" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="flex flex-col items-center gap-2">
              <a
                href={profile.repo || ''}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--muted)] hover:opacity-80"
              >
                <Icon name="github" size={16} />
                <span className="text-sm">{profile.name}</span>
              </a>
              <p className="text-sm text-[var(--muted)]">
                {categories.length} 个分类 • {totalLinks} 个链接 •{' '}
                <a href="/edit" className="text-sm text-[var(--muted)] hover:opacity-80">编辑</a>
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}
