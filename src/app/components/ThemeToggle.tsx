'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Moon, Palette, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../contexts/SettingsContext';

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
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const desktopPanelRef = useRef<HTMLDivElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!isDesktopOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (desktopPanelRef.current?.contains(target) || desktopTriggerRef.current?.contains(target)) {
        return;
      }

      setIsDesktopOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDesktopOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isDesktopOpen]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [isMobileOpen]);

  function renderMobileOptions() {
    return (
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
                  ? 'border-sky-400/40 bg-sky-500/15 text-slate-950 shadow-lg dark:text-white'
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
                  <ThemeIcon
                    id={option.id}
                    size={16}
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
    );
  }

  function renderMobilePortal() {
    if (!hasMounted) {
      return null;
    }

    return createPortal(
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-start justify-center px-4 pb-4 pt-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              aria-label="关闭主题弹框"
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/18 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="glass-panel-strong relative w-2/3 max-w-sm rounded-3xl p-6"
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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

              {renderMobileOptions()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );
  }

  function renderMobileTrigger() {
    return (
      <motion.button
        type="button"
        aria-label="切换主题"
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-[var(--muted)] shadow-lg backdrop-blur-md hover:bg-white dark:border-white/10 dark:bg-slate-900/80 md:hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ThemeIcon
          id={theme}
          size={20}
          className={theme === 'light' ? 'text-amber-500' : theme === 'dark' ? 'text-slate-400' : 'text-sky-500'}
        />
      </motion.button>
    );
  }

  if (mobileOnly) {
    return (
      <>
        {renderMobileTrigger()}
        {renderMobilePortal()}
      </>
    );
  }

  if (compact) {
    return (
      <div className="relative hidden md:block">
        <motion.button
          ref={desktopTriggerRef}
          type="button"
          aria-label="切换主题"
          aria-expanded={isDesktopOpen}
          onClick={() => setIsDesktopOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white/60 text-[var(--muted)] shadow-sm backdrop-blur hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ThemeIcon
            id={theme}
            size={18}
            className={theme === 'light' ? 'text-amber-500' : theme === 'dark' ? 'text-slate-300' : 'text-sky-500'}
          />
        </motion.button>

        <AnimatePresence>
          {isDesktopOpen && (
            <motion.div
              ref={desktopPanelRef}
              className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl p-3 shadow-xl glass-panel-strong"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
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
                          ? 'bg-sky-500/15 text-slate-950 shadow-sm dark:text-white'
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
                        <ThemeIcon
                          id={option.id}
                          size={14}
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

  return (
    <>
      {renderMobileTrigger()}
      {renderMobilePortal()}

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
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-sky-400/40 bg-sky-500/15 text-slate-950 shadow-sm dark:text-white'
                      : 'border-black/5 bg-white/40 text-[var(--muted)] hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                  }`}
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
    </>
  );
}
