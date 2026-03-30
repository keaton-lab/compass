"use client";

import { useMemo } from "react";
import CategorySection from "./CategorySection";
import ProfileHeader from "./ProfileHeader";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
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
      <ThemeToggle />
      <div className="min-h-screen text-foreground">
        <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-4 md:px-6 md:pb-12 md:pt-6">
          <header className="space-y-4">
            <ProfileHeader profile={profile} />

            {shouldShowSearch && (
              <div className="max-w-2xl">
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="搜索链接、描述或工作入口..."
                  showResultCount={true}
                  resultCount={totalResults}
                />
              </div>
            )}
          </header>

          <main className="mt-6 md:mt-8">
            {filteredCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
              />
            ))}

            {query && filteredCategories.length === 0 && (
              <div className="glass-panel-strong py-12 text-center rounded-[20px]">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">未找到结果</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">尝试其他关键词，或者检查链接描述中的命名方式。</p>
              </div>
            )}
          </main>

          <footer className="mt-6 hidden border-t border-white/10 px-2 py-4 md:block">
            <div className="flex flex-col items-center gap-2">
              <a
                href={profile.repo || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-slate-900 dark:hover:text-white"
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
