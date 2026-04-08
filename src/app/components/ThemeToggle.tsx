'use client';

import { Dialog, DropdownMenu } from 'radix-ui';
import { Check, Moon, Palette, Sun, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

function ThemeIcon({ id, size = 20, className = '' }: { id: string; size?: number; className?: string }) {
  if (id === 'light') return <Sun size={size} className={className} />;
  if (id === 'dark') return <Moon size={size} className={className} />;
  return <Palette size={size} className={className} />;
}

function getThemeIconStyles(themeId: string) {
  switch (themeId) {
    case 'light':
      return {
        wrapper: 'bg-[#efe0c9]',
        icon: 'text-[#c56a2d]',
      };
    case 'dark':
      return {
        wrapper: 'bg-[#17323a]',
        icon: 'text-[#7ee0d4]',
      };
    case 'ocean':
      return {
        wrapper: 'bg-[#d6edf3]',
        icon: 'text-[#0f766e]',
      };
    default:
      return {
        wrapper: 'bg-[var(--bg-secondary)]',
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

  function renderThemeOption(optionId: string, label: string, iconSize: number, dense = false) {
    const isActive = optionId === theme;
    const iconStyles = getThemeIconStyles(optionId);
    const gapClass = dense ? 'gap-2' : 'gap-3';
    const iconBoxClass = dense ? 'h-7 w-7' : 'h-8 w-8';

    return (
      <div className={`flex items-center ${gapClass}`}>
        <div className={`flex ${iconBoxClass} items-center justify-center rounded-lg ${iconStyles.wrapper}`}>
          <ThemeIcon id={optionId} size={iconSize} className={iconStyles.icon} />
        </div>
        <span className="flex-1 text-left">{label}</span>
        {isActive && <Check size={dense ? 16 : 18} className="text-[var(--accent)]" />}
      </div>
    );
  }

  if (mobileOnly) {
    return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="切换主题"
            className="glass-panel-strong z-40 flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border text-[var(--muted)] md:hidden"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <ThemeIcon id={theme} size={20} className={getThemeIconStyles(theme).icon} />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[120] bg-[var(--background)]/72 md:hidden" />
          <Dialog.Content className="fixed inset-x-4 top-20 z-[121] mx-auto w-auto max-w-sm rounded-[24px] border bg-[var(--panel-strong)] p-6 outline-none md:hidden" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="mb-5 flex items-center justify-between">
              <Dialog.Title className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                <Palette size={18} />
                Theme
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-[12px] border bg-[var(--background)] text-[var(--muted)]"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            <div className="grid gap-3">
              {availableThemes.map((option) => {
                const isActive = option.id === theme;

                return (
                  <Dialog.Close asChild key={option.id}>
                    <button
                      type="button"
                      onClick={() => setTheme(option.id)}
                      className={`rounded-[18px] border px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--accent-alpha)] text-[var(--foreground)]'
                          : 'bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--bg-secondary)]'
                      }`}
                      style={{ borderColor: isActive ? 'var(--accent-border)' : 'var(--panel-border)' }}
                    >
                      {renderThemeOption(option.id, option.label, 16)}
                    </button>
                  </Dialog.Close>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  if (compact) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="切换主题"
            className="glass-panel-strong flex h-9 w-9 items-center justify-center rounded-[14px] border text-[var(--muted)]"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <ThemeIcon id={theme} size={18} className={getThemeIconStyles(theme).icon} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={10}
            align="end"
            className="z-50 min-w-[190px] rounded-[20px] border bg-[var(--panel-strong)] p-2 outline-none"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Theme
            </div>
            <DropdownMenu.RadioGroup value={theme} onValueChange={(value) => setTheme(value as typeof theme)}>
              {availableThemes.map((option) => {
                const isActive = option.id === theme;

                return (
                  <DropdownMenu.RadioItem
                    key={option.id}
                    value={option.id}
                    className={`flex cursor-pointer items-center rounded-[16px] px-3 py-2.5 text-sm font-medium outline-none transition-colors ${
                      isActive
                        ? 'bg-[var(--accent-alpha)] text-[var(--foreground)]'
                        : 'text-[var(--muted)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {renderThemeOption(option.id, option.label, 14, true)}
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
    <div className="fixed right-6 top-6 z-50 hidden md:block">
      <div
        className="glass-panel-strong flex items-center gap-1 rounded-[20px] border px-2 py-2"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        {availableThemes.map((option) => {
          const isActive = option.id === theme;
          const iconStyles = getThemeIconStyles(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={`flex items-center gap-2 rounded-[14px] px-3 py-1.5 text-xs font-semibold tracking-[0.04em] transition-colors ${
                isActive
                  ? 'bg-[var(--accent-alpha)] text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-[10px] ${iconStyles.wrapper}`}>
                <ThemeIcon id={option.id} size={12} className={iconStyles.icon} />
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
