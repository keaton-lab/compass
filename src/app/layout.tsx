import type { Metadata } from 'next';
import './globals.css';
import { SettingsProvider } from './contexts/SettingsContext';
import { getThemePreset, getThemeStyleVariables, themePresets } from './themes';
import { loadConfig, loadInitialTheme } from './load-config';

const THEME_STORAGE_KEY = 'compass-settings';
const VALID_THEMES = ['light', 'dark', 'ocean'];

function getThemeBootScript(initialTheme: string) {
  return `(() => {
  const root = document.documentElement;
  const fallbackTheme = '${initialTheme}';
  const storageKey = '${THEME_STORAGE_KEY}';
  const validThemes = ${JSON.stringify(VALID_THEMES)};
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
    textPrimary: '--text-primary',
    textSecondary: '--text-secondary',
    bgSecondary: '--bg-secondary',
    accent: '--accent',
    accentAlpha: '--accent-alpha',
    accentBorder: '--accent-border'
  };

  root.classList.add('theme-preload');

  const applyTheme = (themeId) => {
    const theme = validThemes.includes(themeId) ? themeId : fallbackTheme;
    const themeConfig = themeMap[theme];

    root.dataset.theme = theme;
    root.classList.toggle('dark', themeConfig.isDark);
    root.style.colorScheme = themeConfig.isDark ? 'dark' : 'light';
    Object.keys(cssVariableMap).forEach((key) => {
      root.style.setProperty(cssVariableMap[key], themeConfig.colors[key]);
    });
  };

  try {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : null;
    const themeId = parsed && typeof parsed.theme === 'string' && validThemes.includes(parsed.theme) ? parsed.theme : fallbackTheme;

    applyTheme(themeId);
  } catch {
    applyTheme(fallbackTheme);
  }

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
  const initialSettings = loadConfig().settings;
  const initialTheme = loadInitialTheme();
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
        <SettingsProvider initialSettings={initialSettings}>
          <div className="app-shell">
            {children}
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
