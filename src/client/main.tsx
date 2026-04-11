import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './globals.css';
import { defaultThemeId, isThemeId } from '@/shared/themes';
import type { Settings } from '@/shared/types';

// 主题初始化脚本（内联到 HTML 避免 FOUC）
const rawStoredSettings = localStorage.getItem('compass-settings');
let theme = defaultThemeId;

try {
  if (rawStoredSettings) {
    const parsedSettings = JSON.parse(rawStoredSettings) as Partial<Settings>;
    if (parsedSettings.theme && isThemeId(parsedSettings.theme)) {
      theme = parsedSettings.theme;
    }
  }
} catch {
  theme = defaultThemeId;
}

document.documentElement.setAttribute('data-theme', theme);
document.documentElement.setAttribute('data-theme-ready', 'true');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
