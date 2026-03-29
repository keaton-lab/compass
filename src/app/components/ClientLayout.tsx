'use client';

import { useMemo } from 'react';
import CategorySection from './CategorySection';
import ProfileHeader from './ProfileHeader';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import type { Profile, Settings, Category } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface ClientLayoutProps {
  profile: Profile;
  settings: Settings;
  categories: Category[];
}

export default function ClientLayout({ profile, settings, categories }: ClientLayoutProps) {
  const { searchQuery, setSearchQuery } = useSettings();
  const query = searchQuery ?? '';

  const filteredCategories = useMemo(() => {
    if (!query.trim()) {
      return categories;
    }

    const lowerQuery = query.toLowerCase();
    return categories
      .map(category => ({
        ...category,
        links: category.links.filter(link =>
          link.name.toLowerCase().includes(lowerQuery) ||
          (link.description ?? '').toLowerCase().includes(lowerQuery)
        ),
      }))
      .filter(category => category.links.length > 0);
  }, [categories, query]);

  const totalResults = filteredCategories.reduce((acc, cat) => acc + cat.links.length, 0);

  return (
    <>
      <ThemeToggle />
      <div className="min-h-screen bg-background text-foreground">
        <header className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <ProfileHeader profile={profile} />
            
            <div className="flex items-center gap-4">
              {settings.showSearch && (
                <SearchBar
                  onSearch={setSearchQuery}
                  placeholder="搜索链接..."
                  showResultCount={true}
                  resultCount={totalResults}
                />
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 pb-16">
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

        <footer className="container mx-auto px-4 py-8 border-t border-white/10">
          <div className="text-center text-gray-500 text-sm">
            <p>{profile.name} • {categories.length} categories • {categories.reduce((acc, cat) => acc + cat.links.length, 0)} links</p>
          </div>
        </footer>
      </div>
    </>
  );
}
