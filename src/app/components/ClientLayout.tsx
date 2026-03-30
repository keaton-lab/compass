"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import CategorySection from "./CategorySection";
import ProfileHeader from "./ProfileHeader";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import { ProfileHeaderDesktopLeft } from "./ProfileHeader";
import type { Profile, Settings, Category } from "../types";
import { useSettings } from "../contexts/SettingsContext";
import Icon from "./Icon";

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
  const { searchQuery, setSearchQuery } = useSettings();
  const query = searchQuery ?? "";

  const filteredCategories = useMemo(() => {
    if (!query.trim()) {
      return categories;
    }

    const lowerQuery = query.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        links: category.links.filter(
          (link) =>
            link.name.toLowerCase().includes(lowerQuery) ||
            (link.description ?? "").toLowerCase().includes(lowerQuery),
        ),
      }))
      .filter((category) => category.links.length > 0);
  }, [categories, query]);

  const totalResults = filteredCategories.reduce(
    (acc, cat) => acc + cat.links.length,
    0,
  );
  const shouldShowSearch = settings.showSearch;

  return (
    <>
      <div className="min-h-screen text-foreground">
        <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-6 md:px-6 md:pb-12 lg:px-8">
          <header className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-6">
            <div className="md:hidden space-y-3">
              <ProfileHeader profile={profile} />
              {shouldShowSearch && (
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="搜索链接、描述或工作入口..."
                  showResultCount={true}
                  resultCount={totalResults}
                />
              )}
            </div>

            <div className="hidden md:flex w-full items-center justify-between">
              <ProfileHeaderDesktopLeft profile={profile} />
              <div className="flex items-center gap-3">
                {shouldShowSearch && (
                  <SearchBar
                    compact
                    onSearch={setSearchQuery}
                    placeholder="搜索链接、描述或工作入口..."
                    showResultCount={true}
                    resultCount={totalResults}
                  />
                )}
                <ThemeToggle compact />
              </div>
            </div>
          </header>

          <main className="mt-8 md:mt-10">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
              >
                <CategorySection
                  category={category}
                />
              </motion.div>
            ))}

            {query && filteredCategories.length === 0 && (
              <motion.div
                className="glass-panel-strong py-12 text-center rounded-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">未找到结果</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">尝试其他关键词，或者检查链接描述中的命名方式。</p>
              </motion.div>
            )}
          </main>

          <footer className="mt-6 hidden border-t border-white/10 px-2 py-4 md:block">
            <div className="flex flex-col items-center gap-2">
              <a
                href={profile.repo || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--muted)] hover:opacity-80"
              >
                <Icon name="github" size={16} />
                <span className="text-sm">{profile.name}</span>
              </a>
              <p className="text-sm text-[var(--muted)]">
                {categories.length} categories •{" "}
                {categories.reduce((acc, cat) => acc + cat.links.length, 0)} links
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
