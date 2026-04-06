'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

// Default settings - matching config.yaml defaults
const DEFAULT_SETTINGS: Settings = {
  theme: defaultThemeId,
  layout: 'grid',
  animations: true,
  showSearch: true,
  searchQuery: '',
};

function normalizeSettings(partialSettings: Partial<Settings>): Settings {
  const defaults = getDefaultSettings();
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

  root.dataset.theme = themePreset.id;
  root.classList.toggle('dark', themePreset.isDark);
  root.style.colorScheme = themePreset.isDark ? 'dark' : 'light';
}

function getDefaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}

function getInitialSettings(): Settings {
  if (typeof window === 'undefined') {
    return getDefaultSettings();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Settings>;
      return normalizeSettings(parsed);
    }
  } catch {
    // Ignore parse errors
  }
  
  return getDefaultSettings();
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(getDefaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const initial = getInitialSettings();
    setSettings({ ...initial, searchQuery: '' });
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Persist to localStorage on changes
  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings, isHydrated]);

  // Cross-tab synchronization
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      
      try {
        if (e.newValue) {
          const newSettings = JSON.parse(e.newValue) as Partial<Settings>;
          setSettings(normalizeSettings(newSettings));
        }
      } catch {
        // Ignore parse errors
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = useCallback((theme: Settings['theme']) => {
    setSettings(prev => ({ ...prev, theme }));
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
