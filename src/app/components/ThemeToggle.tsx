'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Moon, Palette, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../contexts/SettingsContext';
import { getThemePreset } from '../themes';

/**
 * 主题图标组件
 * 根据主题ID渲染对应的图标
 */
function ThemeIcon({ id, size = 20, className = '' }: { id: string; size?: number; className?: string }) {
  if (id === 'light') return <Sun size={size} className={className} />;
  if (id === 'dark') return <Moon size={size} className={className} />;
  return <Palette size={size} className={className} />;
}

/**
 * 获取主题图标颜色样式
 * 使用CSS变量实现主题一致的颜色
 */
function getThemeIconStyles(themeId: string) {
  // 使用CSS变量来统一管理颜色
  switch (themeId) {
    case 'light':
      return {
        wrapper: 'bg-[#fef3c7] dark:bg-[rgba(217,119,6,0.2)]',
        icon: 'text-[#d97706] dark:text-[#fbbf24]',
      };
    case 'dark':
      return {
        wrapper: 'bg-[#f1f5f9] dark:bg-[#1e293b]',
        icon: 'text-[#475569] dark:text-[#cbd5e1]',
      };
    case 'ocean':
      return {
        wrapper: 'bg-[#e0f2fe] dark:bg-[rgba(3,105,161,0.2)]',
        icon: 'text-[#0369a1] dark:text-[#38bdf8]',
      };
    default:
      return {
        wrapper: 'bg-[var(--panel)]',
        icon: 'text-[var(--muted)]',
      };
  }
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

  // 获取当前主题的图标样式
  const currentIconStyles = getThemeIconStyles(theme);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 桌面端点击外部关闭
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

  // 移动端ESC关闭和禁止背景滚动
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

  /**
   * 渲染移动端选项列表
   */
  function renderMobileOptions() {
    return (
      <div className="grid grid-cols-1 gap-3">
        {availableThemes.map((option) => {
          const isActive = option.id === theme;
          const iconStyles = getThemeIconStyles(option.id);

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
                  ? 'border-[var(--accent-border)] bg-[var(--accent-alpha)] text-[var(--foreground)] shadow-lg'
                  : 'border-[var(--panel-border)] bg-[var(--panel)] text-[var(--muted)] hover:bg-[var(--panel-strong)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconStyles.wrapper}`}>
                  <ThemeIcon id={option.id} size={16} className={iconStyles.icon} />
                </div>
                <span>{option.label}</span>
              </div>
              {isActive && <Check size={18} className="text-[var(--accent)]" />}
            </motion.button>
          );
        })}
      </div>
    );
  }

  /**
   * 渲染移动端弹窗（Portal）
   */
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
            {/* 背景遮罩 */}
            <motion.button
              type="button"
              aria-label="关闭主题弹框"
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-[8px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="liquid-glass relative w-2/3 max-w-sm rounded-3xl p-6"
              style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
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
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel)] text-[var(--muted)] hover:bg-[var(--panel-strong)]"
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

  /**
   * 渲染移动端触发按钮
   */
  function renderMobileTrigger() {
    return (
      <motion.button
        type="button"
        aria-label="切换主题"
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen(true)}
        className="liquid-glass fixed right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted)] md:hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ThemeIcon id={theme} size={20} className={currentIconStyles.icon} />
      </motion.button>
    );
  }

  // 仅移动端模式
  if (mobileOnly) {
    return (
      <>
        {renderMobileTrigger()}
        {renderMobilePortal()}
      </>
    );
  }

  // 紧凑模式（桌面端下拉菜单）
  if (compact) {
    return (
      <div className="relative hidden md:block">
        <motion.button
          ref={desktopTriggerRef}
          type="button"
          aria-label="切换主题"
          aria-expanded={isDesktopOpen}
          onClick={() => setIsDesktopOpen((value) => !value)}
          className="liquid-glass flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ThemeIcon id={theme} size={18} className={currentIconStyles.icon} />
        </motion.button>

        <AnimatePresence>
          {isDesktopOpen && (
            <motion.div
              ref={desktopPanelRef}
              className="liquid-glass absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl p-3"
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
                  const iconStyles = getThemeIconStyles(option.id);

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
                          ? 'bg-[var(--accent-alpha)] text-[var(--foreground)] shadow-sm'
                          : 'text-[var(--muted)] hover:bg-[var(--panel)]'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconStyles.wrapper}`}>
                        <ThemeIcon id={option.id} size={14} className={iconStyles.icon} />
                      </div>
                      <span className="flex-1 text-left">{option.label}</span>
                      {isActive && <Check size={16} className="text-[var(--accent)]" />}
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

  // 完整模式（桌面端按钮组 + 移动端触发器）
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
        <div className="liquid-glass flex items-center gap-2 rounded-full px-3 py-2">
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
                      ? 'border-[var(--accent-border)] bg-[var(--accent-alpha)] text-[var(--foreground)] shadow-sm'
                      : 'border-[var(--panel-border)] bg-[var(--panel)] text-[var(--muted)] hover:bg-[var(--panel-strong)]'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && <Check size={14} className="text-[var(--accent)]" />}
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
