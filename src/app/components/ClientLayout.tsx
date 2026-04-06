"use client";

import { useMemo, useRef, useCallback } from "react";
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

// 3D悬浮效果Hook
function useTilt3D() {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    const glow = glowRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    if (glow) {
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(56, 189, 248, 0.12) 0%, transparent 50%)`;
      glow.style.opacity = '1';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const element = ref.current;
    const glow = glowRef.current;
    if (!element) return;

    element.style.transition = 'transform 0.5s ease';
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    setTimeout(() => {
      if (element) element.style.transition = '';
    }, 500);

    if (glow) {
      glow.style.opacity = '0';
    }
  }, []);

  return { ref, glowRef, handleMouseMove, handleMouseLeave };
}

export default function ClientLayout({
  profile,
  settings,
  categories,
}: ClientLayoutProps) {
  const { searchQuery, setSearchQuery } = useSettings();
  const query = searchQuery ?? "";

  const { ref: headerRef, glowRef: headerGlowRef, handleMouseMove, handleMouseLeave } = useTilt3D();
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const mobileHeaderGlowRef = useRef<HTMLDivElement>(null);

  const handleMobileMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const element = mobileHeaderRef.current;
    const glow = mobileHeaderGlowRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (glow) {
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(56, 189, 248, 0.12) 0%, transparent 50%)`;
      glow.style.opacity = '1';
    }
  }, []);

  const handleMobileMouseLeave = useCallback(() => {
    const glow = mobileHeaderGlowRef.current;
    if (glow) {
      glow.style.opacity = '0';
    }
  }, []);

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
            {/* 移动端布局 */}
            <div className="md:hidden space-y-3">
              <motion.div
                ref={mobileHeaderRef}
                className="relative"
                onMouseMove={handleMobileMouseMove}
                onMouseLeave={handleMobileMouseLeave}
              >
                {/* Glow effect */}
                <div
                  ref={mobileHeaderGlowRef}
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-2xl"
                />
                <ProfileHeader profile={profile} />
              </motion.div>
              {shouldShowSearch && (
                <SearchBar
                  onSearch={setSearchQuery}
                  value={query}
                  placeholder="搜索链接、描述或工作入口..."
                  showResultCount={true}
                  resultCount={totalResults}
                />
              )}
            </div>

            {/* 桌面端布局 - 只包裹左侧头像区 */}
            <div className="hidden md:flex w-full items-center justify-between">
              <div ref={headerRef} className="relative" style={{ transformStyle: 'preserve-3d' }}>
                {/* Glow effect */}
                <div
                  ref={headerGlowRef}
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-2xl"
                />
                <motion.div
                  className="liquid-glass rounded-2xl px-5 py-3 w-[400px]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <ProfileHeaderDesktopLeft profile={profile} />
                </motion.div>
              </div>
              <div className="flex items-center gap-3">
                {shouldShowSearch && (
                  <SearchBar
                    compact
                    onSearch={setSearchQuery}
                    value={query}
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
                className="liquid-glass py-12 text-center rounded-2xl"
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
                {categories.length} Categories •{" "}
                {categories.reduce((acc, cat) => acc + cat.links.length, 0)} Links •{" "}
                <a href="/edit" className="text-sm text-[var(--muted)] hover:opacity-80">Edit</a>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
