'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Settings } from '../types';
import config from '../../data/config.json';

interface SettingsContextType extends Settings {
  setTheme: (theme: 'dark' | 'light') => void;
  setLayout: (layout: 'grid' | 'list') => void;
  setAnimations: (animations: boolean) => void;
  setSearchQuery: (query: string) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'compass-settings';

function getDefaultSettings(): Settings {
  const defaultFromConfig = (config as { settings?: Settings }).settings;
  return {
    theme: defaultFromConfig?.theme ?? 'dark',
    layout: defaultFromConfig?.layout ?? 'grid',
    animations: defaultFromConfig?.animations ?? true,
    showSearch: defaultFromConfig?.showSearch ?? true,
    searchQuery: '',
  };
}

function getInitialSettings(): Settings {
  if (typeof window === 'undefined') {
    return getDefaultSettings();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Settings>;
      const defaults = getDefaultSettings();
      return { ...defaults, ...parsed };
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
    setSettings(getInitialSettings());
    setIsHydrated(true);
  }, []);

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
          setSettings(prev => ({ ...prev, ...newSettings }));
        }
      } catch {
        // Ignore parse errors
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
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

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const value: SettingsContextType = {
    ...settings,
    setTheme,
    setLayout,
    setAnimations,
    setSearchQuery,
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
