'use client';

import { Dialog, DropdownMenu } from 'radix-ui';
import { Check, Moon, Palette, Sun, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

function ThemeIcon({ id, size = 18, className = '' }: { id: string; size?: number; className?: string }) {
  if (id === 'light') return <Sun size={size} className={className} />;
  if (id === 'dark') return <Moon size={size} className={className} />;
  return <Palette size={size} className={className} />;
}

function getThemeIconStyles(themeId: string) {
  switch (themeId) {
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
  compact?: boolean;
  mobileOnly?: boolean;
}

export default function ThemeToggle({ compact = false, mobileOnly = false }: ThemeToggleProps) {
  const { theme, availableThemes, setTheme } = useSettings();

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

  if (mobileOnly) {
    return (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="切换主题"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-[var(--panel-strong)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--accent-border)] md:hidden"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <ThemeIcon id={theme} size={18} className={getThemeIconStyles(theme).icon} />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm md:hidden" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[121] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-[var(--panel)] p-5 outline-none md:hidden" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                <Palette size={16} />
                选择主题
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                >
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            <div className="grid gap-2">
              {availableThemes.map((option) => {
                const isActive = option.id === theme;

                return (
                  <Dialog.Close asChild key={option.id}>
                    <button
                      type="button"
                      onClick={() => setTheme(option.id)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'border-[var(--accent-border)] bg-[var(--accent-alpha)] text-[var(--text-primary)]'
                          : 'border-[var(--panel-border)] bg-[var(--bg-secondary)] text-[var(--muted)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)]'
                      }`}
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border bg-[var(--panel-strong)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--accent-border)]"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <ThemeIcon id={theme} size={18} className={getThemeIconStyles(theme).icon} />
          </button>
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
            <DropdownMenu.RadioGroup value={theme} onValueChange={(value) => setTheme(value as typeof theme)}>
              {availableThemes.map((option) => {
                const isActive = option.id === theme;

                return (
                  <DropdownMenu.RadioItem
                    key={option.id}
                    value={option.id}
                    className={`flex cursor-pointer items-center rounded-md px-2.5 py-2 text-sm outline-none transition-all duration-200 ${
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
        {availableThemes.map((option) => {
          const isActive = option.id === theme;
          const iconStyles = getThemeIconStyles(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--accent-alpha)] text-[var(--text-primary)]'
                  : 'text-[var(--muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded ${iconStyles.wrapper}`}>
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
