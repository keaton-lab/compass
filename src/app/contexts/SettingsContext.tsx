'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import type { Settings } from '../types';
import { defaultThemeId, getThemePreset, isThemeId, themePresets } from '../themes';

interface SettingsContextType extends Settings {
  availableThemes: typeof themePresets;
  setTheme: (theme: Settings['theme']) => void;
  setLayout: (layout: 'grid' | 'list') => void;
  setAnimations: (animations: boolean) => void;
  setSearchQuery: (query: string) => void;
  setShowSearch: (show: boolean) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'compass-settings';
const THEME_SWITCH_CLASS = 'theme-switching';
const THEME_TRANSITION_MS = 280;
const THEME_CSS_VARIABLES = {
  background: '--background',
  foreground: '--foreground',
  panel: '--panel',
  panelStrong: '--panel-strong',
  panelBorder: '--panel-border',
  muted: '--muted',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  bgSecondary: '--bg-secondary',
  accent: '--accent',
  accentAlpha: '--accent-alpha',
  accentBorder: '--accent-border',
} as const;

// Default settings - matching config.yaml defaults
const DEFAULT_SETTINGS: Settings = {
  theme: defaultThemeId,
  layout: 'grid',
  animations: true,
  showSearch: true,
  searchQuery: '',
};

function normalizeSettings(partialSettings: Partial<Settings>, initialSettings?: Partial<Settings>): Settings {
  const defaults = getDefaultSettings(initialSettings);
  const theme = partialSettings.theme;

  return {
    ...defaults,
    ...partialSettings,
    theme: typeof theme === 'string' && isThemeId(theme) ? theme : defaults.theme,
  };
}

function applyTheme(theme: Settings['theme']) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const themePreset = getThemePreset(theme);
  const shouldAnimate =
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateTheme() {
    root.classList.add(THEME_SWITCH_CLASS);

    root.dataset.theme = themePreset.id;
    root.classList.toggle('dark', themePreset.isDark);
    root.style.colorScheme = themePreset.isDark ? 'dark' : 'light';
    for (const [key, cssVariable] of Object.entries(THEME_CSS_VARIABLES)) {
      const colorKey = key as keyof typeof themePreset.colors;
      root.style.setProperty(cssVariable, themePreset.colors[colorKey]);
    }
  }

  updateTheme();

  const clearSwitchClass = () => {
    root.classList.remove(THEME_SWITCH_CLASS);
  };

  if (!shouldAnimate) {
    clearSwitchClass();
    return;
  }

  window.setTimeout(clearSwitchClass, THEME_TRANSITION_MS);
}

function getDefaultSettings(initialSettings?: Partial<Settings>): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...initialSettings,
    theme:
      typeof initialSettings?.theme === 'string' && isThemeId(initialSettings.theme)
        ? initialSettings.theme
        : DEFAULT_SETTINGS.theme,
  };
}

function getMergedDefaultSettings(initialSettings?: Partial<Settings>): Settings {
  return normalizeSettings(initialSettings ?? {}, initialSettings);
}

function getInitialSettings(initialSettings?: Partial<Settings>): Settings {
  return getMergedDefaultSettings(initialSettings);
}

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings?: Partial<Settings>;
}) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...getInitialSettings(initialSettings),
    searchQuery: '',
  }));
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDomReady, setIsDomReady] = useState(false);
  const [hasRestoredSettings, setHasRestoredSettings] = useState(false);
  const lastAppliedThemeRef = useRef<Settings['theme'] | null>(null);

  // 等待 DOM 就绪（data-theme-ready 属性由引导脚本设置）
  useEffect(() => {
    if (document.documentElement.hasAttribute('data-theme-ready')) {
      setIsDomReady(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.documentElement.hasAttribute('data-theme-ready')) {
        setIsDomReady(true);
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-ready'],
    });

    return () => observer.disconnect();
  }, []);

  // 标记客户端水合完成
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 水合完成后从 localStorage 读取设置
  useEffect(() => {
    if (!isHydrated) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as Partial<Settings>;
      // 直接使用存储的设置，只验证 theme 是否有效
      const validTheme = typeof parsed.theme === 'string' && isThemeId(parsed.theme) 
        ? parsed.theme 
        : defaultThemeId;

      setSettings((prev) => {
        const next: Settings = {
          theme: validTheme,
          layout: parsed.layout ?? prev.layout,
          animations: parsed.animations ?? prev.animations,
          showSearch: parsed.showSearch ?? prev.showSearch,
          searchQuery: prev.searchQuery,
        };

        if (
          prev.theme === next.theme &&
          prev.layout === next.layout &&
          prev.animations === next.animations &&
          prev.showSearch === next.showSearch
        ) {
          return prev;
        }

        return next;
      });
    } catch {
      // Ignore parse errors
    } finally {
      setHasRestoredSettings(true);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!isDomReady || !hasRestoredSettings) return;
    if (lastAppliedThemeRef.current === settings.theme) {
      return;
    }

    applyTheme(settings.theme);
    lastAppliedThemeRef.current = settings.theme;
  }, [settings.theme, isDomReady, hasRestoredSettings]);

  // Persist to localStorage on changes
  useEffect(() => {
    if (!hasRestoredSettings) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings, hasRestoredSettings]);

  // Cross-tab synchronization
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      
      try {
        if (e.newValue) {
          const newSettings = JSON.parse(e.newValue) as Partial<Settings>;
          setSettings((prev) => ({
            ...normalizeSettings(newSettings, initialSettings),
            searchQuery: prev.searchQuery,
          }));
        }
      } catch {
        // Ignore parse errors
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initialSettings]);

  const setTheme = useCallback((theme: Settings['theme']) => {
    lastAppliedThemeRef.current = theme;
    applyTheme(theme);
    setSettings(prev => (prev.theme === theme ? prev : { ...prev, theme }));
  }, []);

  const setLayout = useCallback((layout: 'grid' | 'list') => {
    setSettings(prev => ({ ...prev, layout }));
  }, []);

  const setAnimations = useCallback((animations: boolean) => {
    setSettings(prev => ({ ...prev, animations }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setSettings(prev => ({ ...prev, searchQuery }));
  }, []);

  const setShowSearch = useCallback((showSearch: boolean) => {
    setSettings(prev => ({ ...prev, showSearch }));
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const value: SettingsContextType = {
    ...settings,
    availableThemes: themePresets,
    setTheme,
    setLayout,
    setAnimations,
    setSearchQuery,
    setShowSearch,
    updateSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
