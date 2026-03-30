'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Palette, X, Sun, Moon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useState, useRef, useEffect } from 'react';

function ThemeIcon({ id, size = 20, className = '' }: { id: string; size?: number; className?: string }) {
  if (id === 'light') return <Sun size={size} className={className} />;
  if (id === 'dark') return <Moon size={size} className={className} />;
  return <Palette size={size} className={className} />;
}

interface ThemeToggleProps {
  compact?: boolean;
  mobileOnly?: boolean;
}

export default function ThemeToggle({ compact = false, mobileOnly = false }: ThemeToggleProps) {
  const { theme, availableThemes, setTheme } = useSettings();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isDesktopOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setIsDesktopOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isDesktopOpen]);

  useEffect(() => {
    if (!isDesktopOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDesktopOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isDesktopOpen]);

  if (mobileOnly) {
    return (
      <>
        <motion.button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-[var(--muted)] shadow-lg backdrop-blur-md hover:bg-white dark:border-white/10 dark:bg-slate-900/80 md:hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ThemeIcon id={theme} size={20}
            className={theme === 'light' ? 'text-amber-500' : theme === 'dark' ? 'text-slate-400' : 'text-sky-500'}
          />
        </motion.button>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              className="fixed inset-4 z-50 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="glass-panel-strong w-full max-w-sm rounded-3xl p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <Palette size={20} />
                    <span className="text-sm font-medium">Theme</span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-black/5 text-[var(--muted)] hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {availableThemes.map((option) => {
                    const isActive = option.id === theme;
                    return (
                      <motion.button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setTheme(option.id);
                          setIsMobileOpen(false);
                        }}
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'border-sky-400/40 bg-sky-500/15 text-slate-950 dark:text-white shadow-lg'
                            : 'border-black/5 bg-white/40 text-[var(--muted)] hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            option.id === 'light' ? 'bg-amber-100 dark:bg-amber-900/30' :
                            option.id === 'dark' ? 'bg-slate-100 dark:bg-slate-800' :
                            'bg-sky-100 dark:bg-sky-900/30'
                          }`}>
                            <ThemeIcon id={option.id} size={16}
                              className={
                                option.id === 'light' ? 'text-amber-600 dark:text-amber-400' :
                                option.id === 'dark' ? 'text-slate-600 dark:text-slate-300' :
                                'text-sky-600 dark:text-sky-400'
                              }
                            />
                          </div>
                          <span>{option.label}</span>
                        </div>
                        {isActive && <Check size={18} className="text-sky-500" />}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // 桌面端紧凑模式渲染
  if (compact) {
    return (
      <div className="hidden md:block relative">
        <motion.button
          ref={triggerRef}
          type="button"
          aria-label="切换主题"
          aria-expanded={isDesktopOpen}
          onClick={() => setIsDesktopOpen(v => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white/60 text-[var(--muted)] shadow-sm backdrop-blur hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ThemeIcon id={theme} size={18} className={theme === 'light' ? 'text-amber-500' : theme === 'dark' ? 'text-slate-300' : 'text-sky-500'} />
        </motion.button>

        <AnimatePresence>
          {isDesktopOpen && (
            <motion.div
              ref={panelRef}
              className="absolute right-0 top-full mt-2 z-50 glass-panel-strong rounded-2xl p-3 shadow-xl min-w-[180px]"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            >
              <div className="mb-2 flex items-center gap-2 px-2 text-[var(--muted)]">
                <Palette size={14} />
                <span className="text-xs font-medium">主题</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {availableThemes.map((option) => {
                  const isActive = option.id === theme;
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setTheme(option.id);
                        setIsDesktopOpen(false);
                      }}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-sky-500/15 text-slate-950 dark:text-white shadow-sm'
                          : 'text-[var(--muted)] hover:bg-white/60 dark:hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        option.id === 'light' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        option.id === 'dark' ? 'bg-slate-100 dark:bg-slate-800' :
                        'bg-sky-100 dark:bg-sky-900/30'
                      }`}>
                        <ThemeIcon id={option.id} size={14}
                          className={
                            option.id === 'light' ? 'text-amber-600 dark:text-amber-400' :
                            option.id === 'dark' ? 'text-slate-600 dark:text-slate-300' :
                            'text-sky-600 dark:text-sky-400'
                          }
                        />
                      </div>
                      <span className="flex-1 text-left">{option.label}</span>
                      {isActive && <Check size={16} className="text-sky-500" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 默认模式：保留原有移动端弹出层 + 桌面端固定胶囊
  return (
    <AnimatePresence mode="wait">
      {isMobileOpen ? (
        <motion.div
          className="fixed inset-4 z-50 flex flex-col items-center justify-center md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="glass-panel-strong w-full max-w-sm rounded-3xl p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Palette size={20} />
                <span className="text-sm font-medium">Theme</span>
              </div>
              <motion.button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-black/5 text-[var(--muted)] hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {availableThemes.map((option) => {
                const isActive = option.id === theme;

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setTheme(option.id);
                      setIsMobileOpen(false);
                    }}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all ${isActive
                      ? 'border-sky-400/40 bg-sky-500/15 text-slate-950 dark:text-white shadow-lg'
                      : 'border-black/5 bg-white/40 text-[var(--muted)] hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        option.id === 'light' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        option.id === 'dark' ? 'bg-slate-100 dark:bg-slate-800' :
                        'bg-sky-100 dark:bg-sky-900/30'
                      }`}>
                        <ThemeIcon id={option.id} size={16}
                          className={
                            option.id === 'light' ? 'text-amber-600 dark:text-amber-400' :
                            option.id === 'dark' ? 'text-slate-600 dark:text-slate-300' :
                            'text-sky-600 dark:text-sky-400'
                          }
                        />
                      </div>
                      <span>{option.label}</span>
                    </div>
                    {isActive && <Check size={18} className="text-sky-500" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      ) : null}

      <motion.button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-[var(--muted)] shadow-lg backdrop-blur-md hover:bg-white dark:border-white/10 dark:bg-slate-900/80 md:hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ThemeIcon id={theme} size={20}
          className={theme === 'light' ? 'text-amber-500' : theme === 'dark' ? 'text-slate-400' : 'text-sky-500'}
        />
      </motion.button>

      <motion.div
        className="fixed right-6 top-6 z-50 hidden md:block"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="glass-panel flex items-center gap-2 rounded-full px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 px-2 text-[var(--muted)]">
            <Palette size={16} />
            <span className="text-xs font-medium">Theme</span>
          </div>

          <div className="flex items-center gap-1.5">
            {availableThemes.map((option) => {
              const isActive = option.id === theme;

              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${isActive
                    ? 'border-sky-400/40 bg-sky-500/15 text-slate-950 dark:text-white shadow-sm'
                    : 'border-black/5 bg-white/40 text-[var(--muted)] hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && <Check size={14} />}
                  <span>{option.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
