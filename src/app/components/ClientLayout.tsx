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
      <div className="min-h-screen bg-background text-foreground">
        <header className="px-4 md:container md:mx-auto md:px-4 py-4 md:py-8">
          <div className="hidden md:flex flex-row justify-between items-center gap-6">
            <ProfileHeader profile={profile} />

            {shouldShowSearch && (
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="搜索链接..."
                showResultCount={true}
                resultCount={totalResults}
              />
            )}
          </div>
          <div className="md:hidden">
            <ProfileHeader profile={profile} />
          </div>
        </header>

        <main className="container mx-auto px-4 pb-24 md:pb-16">
          {filteredCategories.map((category, index) => (
            <CategorySection
              key={category.id}
              category={category}
              index={index}
            />
          ))}

          {query && filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-white mb-4">未找到结果</h2>
              <p className="text-gray-400">尝试其他关键词</p>
            </div>
          )}
        </main>

        <footer className="hidden md:block container mx-auto px-4 py-8 border-t border-white/10">
          <div className="flex flex-col items-center gap-2">
            {
              <a
                href={profile.repo || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Icon name="github" size={16} />
                <span className="text-sm">{profile.name}</span>
              </a>
            }
            <p className="text-gray-400 text-sm">
              {categories.length} categories •{" "}
              {categories.reduce((acc, cat) => acc + cat.links.length, 0)} links
            </p>
          </div>
        </footer>

        {shouldShowSearch && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-background/80 backdrop-blur-md border-t border-white/10">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="搜索链接..."
              showResultCount={true}
              resultCount={totalResults}
            />
          </div>
        )}
      </div>
    </>
  );
}
