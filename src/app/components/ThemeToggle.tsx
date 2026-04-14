'use client';

import { Dialog, DropdownMenu } from 'radix-ui';
import { Check, Moon, Palette, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  THEME_CSS_VARIABLES,
  THEME_STORAGE_KEY,
  getThemePreset,
  isThemeId,
  themePresets,
  type ThemeId,
} from '../themes';
import { AppDialogContent } from './AppDialog';
import Button from './Button';

function ThemeIcon({ id, size = 18, className = '' }: { id: string; size?: number; className?: string }) {
  if (id === 'light') return <Sun size={size} className={className} />;
  if (id === 'dark') return <Moon size={size} className={className} />;
  return <Palette size={size} className={className} />;
}

function CurrentThemeIcon({ size = 18 }: { size?: number }) {
  return (
    <span
      className="relative block shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Sun
        size={size}
        className="theme-toggle-current-icon theme-toggle-current-icon-light absolute inset-0 text-[#d97706]"
      />
      <Moon
        size={size}
        className="theme-toggle-current-icon theme-toggle-current-icon-dark absolute inset-0 text-[#c9a45c]"
      />
      <Palette
        size={size}
        className="theme-toggle-current-icon theme-toggle-current-icon-ocean absolute inset-0 text-[#4aa6c8]"
      />
    </span>
  );
}

function getThemeIconStyles(domThemeId: string) {
  switch (domThemeId) {
    case 'light':
      return {
        wrapper: 'bg-[#f3f4f6]',
        icon: 'text-[#d97706]',
      };
    case 'dark':
      return {
        wrapper: 'bg-[#25282d]',
        icon: 'text-[#c9a45c]',
      };
    case 'ocean':
      return {
        wrapper: 'bg-[#eef8fb]',
        icon: 'text-[#4aa6c8]',
      };
    default:
      return {
        wrapper: 'bg-[var(--bg-secondary)]',
        icon: 'text-[var(--muted)]',
      };
  }
}

interface ThemeToggleProps {
  initialTheme: ThemeId;
  variant: 'mobile' | 'compact' | 'inline';
}

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  const preset = getThemePreset(theme);

  root.classList.add('theme-switching');

  root.dataset.theme = preset.id;
  root.classList.toggle('dark', preset.isDark);
  root.style.colorScheme = preset.isDark ? 'dark' : 'light';

  for (const [key, cssVariable] of Object.entries(THEME_CSS_VARIABLES)) {
    const colorKey = key as keyof typeof preset.colors;
    root.style.setProperty(cssVariable, preset.colors[colorKey]);
  }

  const duration = parseFloat(getComputedStyle(root).getPropertyValue('--theme-transition-duration')) || 200;
  setTimeout(() => root.classList.remove('theme-switching'), duration);
}

export default function ThemeToggle({ initialTheme, variant }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof document !== 'undefined') {
      const domTheme = document.documentElement.dataset.theme;
      if (domTheme && isThemeId(domTheme)) {
        return domTheme;
      }
    }

    return initialTheme;
  });

  useEffect(() => {
    applyTheme(theme);

    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({
          ...parsed,
          theme,
        }),
      );
    } catch {
      // Ignore storage errors.
    }
  }, [theme]);

  function renderThemeOption(optionId: string, label: string, iconSize: number) {
    const isActive = optionId === theme;
    const iconStyles = getThemeIconStyles(optionId);

    return (
      <div className="flex items-center gap-2.5">
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${iconStyles.wrapper}`}>
          <ThemeIcon id={optionId} size={iconSize} className={iconStyles.icon} />
        </div>
        <span className="flex-1 text-left text-sm">{label}</span>
        {isActive && <Check size={16} className="text-[var(--accent)]" />}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button
            shape="icon"
            leftIcon={<CurrentThemeIcon size={18} />}
            size="md"
            variant="secondary"
            aria-label="切换主题"
            title="切换主题"
            className="md:hidden [&_svg]:text-[var(--muted)]"
          />
        </Dialog.Trigger>

        <AppDialogContent
          overlayClassName="z-[120] bg-black/50 md:hidden"
          panelClassName="fixed left-1/2 top-1/2 z-[121] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-[var(--panel-strong)] p-3 outline-none md:hidden"
          panelStyle={{ borderColor: 'var(--panel-border)' }}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <Dialog.Title className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
              <Palette size={14} />
              选择主题
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="关闭"
                title="关闭"
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]"
              >
                <X size={14} />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-0.5">
            {themePresets.map((option) => {
              const isActive = option.id === theme;
              const iconStyles = getThemeIconStyles(option.id);

              return (
                <Dialog.Close asChild key={option.id}>
                  <button
                    onClick={() => setTheme(option.id)}
                    className={`flex cursor-pointer items-center rounded-md px-2.5 py-2 text-sm outline-none transition-all duration-theme ${
                      isActive
                        ? 'bg-[var(--accent-alpha)] text-[var(--text-primary)]'
                        : 'text-[var(--muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className={`mr-2.5 flex h-6 w-6 items-center justify-center rounded-md ${iconStyles.wrapper}`}>
                      <ThemeIcon id={option.id} size={14} className={iconStyles.icon} />
                    </span>
                    <span className="flex-1 text-left">{option.label}</span>
                    {isActive && <Check size={16} className="text-[var(--accent)]" />}
                  </button>
                </Dialog.Close>
              );
            })}
          </div>
        </AppDialogContent>
      </Dialog.Root>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            shape="icon"
            leftIcon={<CurrentThemeIcon size={18} />}
            size="md"
            variant="secondary"
            aria-label="切换主题"
            title="切换主题"
            className="[&_svg]:text-[var(--muted)]"
          />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="z-50 min-w-[180px] rounded-lg border bg-[var(--panel-strong)] p-2 outline-none shadow-lg"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <div className="px-2 pb-2 pt-1 text-xs font-medium text-[var(--muted)]">
              选择主题
            </div>
            <DropdownMenu.RadioGroup value={theme} onValueChange={(value) => isThemeId(value) && setTheme(value)}>
              {themePresets.map((option) => {
                const isActive = option.id === theme;

                return (
                  <DropdownMenu.RadioItem
                    key={option.id}
                    value={option.id}
                    className={`flex cursor-pointer items-center rounded-md px-2.5 py-2 text-sm outline-none transition-all duration-theme ${
                      isActive
                        ? 'bg-[var(--accent-alpha)] text-[var(--text-primary)]'
                        : 'text-[var(--muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {renderThemeOption(option.id, option.label, 14)}
                  </DropdownMenu.RadioItem>
                );
              })}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-50 hidden md:block">
      <div
        className="flex items-center gap-1 rounded-lg border bg-[var(--panel-strong)] px-1.5 py-1.5"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        {themePresets.map((option) => {
          const isActive = option.id === theme;
          const iconStyles = getThemeIconStyles(option.id);

          return (
            <Button
              key={option.id}
              variant="ghost"
              size="sm"
              onClick={() => setTheme(option.id)}
              className={`!h-7 !px-2 !py-1 !text-xs ${
                isActive
                  ? '!bg-[var(--accent-alpha)] !text-[var(--text-primary)]'
                  : '!text-[var(--muted)] hover:!bg-[var(--bg-secondary)] hover:!text-[var(--text-primary)]'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded ${iconStyles.wrapper}`}>
                <ThemeIcon id={option.id} size={12} className={iconStyles.icon} />
              </span>
              <span>{option.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
