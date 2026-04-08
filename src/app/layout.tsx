import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { load as yamlLoad } from 'js-yaml';
import type { Config } from './types';
import './globals.css';
import { SettingsProvider } from './contexts/SettingsContext';
import { defaultThemeId, getThemePreset, getThemeStyleVariables, isThemeId, themePresets } from './themes';

const THEME_STORAGE_KEY = 'compass-settings';
const THEME_SWITCH_CLASS = 'theme-switching';

function loadInitialConfigTheme() {
  const configPath = path.join(process.cwd(), 'src', 'config.yaml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  const config = yamlLoad(fileContents) as Config;
  const theme = config.settings?.theme;

  return typeof theme === 'string' && isThemeId(theme) ? theme : defaultThemeId;
}

function getThemeBootScript(initialTheme: string) {
  return `(() => {
  const root = document.documentElement;
  const fallbackTheme = '${initialTheme}';
  const storageKey = '${THEME_STORAGE_KEY}';
  const themeMap = ${JSON.stringify(
    Object.fromEntries(
      themePresets.map((theme) => [
        theme.id,
        {
          colors: theme.colors,
          isDark: theme.isDark,
        },
      ]),
    ),
  )};
  const cssVariableMap = {
    background: '--background',
    foreground: '--foreground',
    panel: '--panel',
    panelStrong: '--panel-strong',
    panelBorder: '--panel-border',
    muted: '--muted',
    gridLine: '--grid-line',
    glowA: '--glow-a',
    glowB: '--glow-b',
    textPrimary: '--text-primary',
    textSecondary: '--text-secondary',
    bgSecondary: '--bg-secondary',
    accent: '--accent',
    accentAlpha: '--accent-alpha',
    accentBorder: '--accent-border'
  };

  root.classList.add('theme-preload');

  const applyTheme = (themeId) => {
    const theme = Object.prototype.hasOwnProperty.call(themeMap, themeId) ? themeId : fallbackTheme;
    const themeConfig = themeMap[theme];
    root.classList.add('${THEME_SWITCH_CLASS}');

    root.dataset.theme = theme;
    root.classList.toggle('dark', themeConfig.isDark);
    root.style.colorScheme = themeConfig.isDark ? 'dark' : 'light';
    Object.keys(cssVariableMap).forEach((key) => {
      root.style.setProperty(cssVariableMap[key], themeConfig.colors[key]);
    });

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        root.classList.remove('${THEME_SWITCH_CLASS}');
      });
    });
  };

  try {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : null;
    const themeId = parsed && typeof parsed.theme === 'string' ? parsed.theme : fallbackTheme;

    applyTheme(themeId);
  } catch {
    applyTheme(fallbackTheme);
  }

  // 滚动到顶部
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  root.setAttribute('data-theme-ready', 'true');
  root.classList.remove('theme-preload');
})();`;
}

export const metadata: Metadata = {
  title: "Compass - 导航中心",
  description: "个人导航中心 - 快速访问常用网站和工具",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧭</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialTheme = loadInitialConfigTheme();
  const initialThemePreset = getThemePreset(initialTheme);
  const themeBootScript = getThemeBootScript(initialTheme);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={initialTheme}
      style={getThemeStyleVariables(initialTheme)}
      className={initialThemePreset.isDark ? 'dark' : undefined}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <SettingsProvider initialSettings={{ theme: initialTheme }}>
          <div className="app-shell">
            {children}
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
