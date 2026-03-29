'use client';

import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function ThemeToggle() {
  const { theme } = useSettings();
  
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);
  
  return null;
}
