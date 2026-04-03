import type { Metadata } from 'next';
import './globals.css';
import { SettingsProvider } from './contexts/SettingsContext';
import { defaultThemeId, themePresets } from './themes';

const THEME_STORAGE_KEY = 'compass-settings';

const themeBootScript = `(() => {
  const root = document.documentElement;
  const fallbackTheme = '${defaultThemeId}';
  const storageKey = '${THEME_STORAGE_KEY}';
  const themeMap = ${JSON.stringify(
    Object.fromEntries(
      themePresets.map((theme) => [
        theme.id,
        {
          background: theme.colors.background,
          isDark: theme.isDark,
        },
      ]),
    ),
  )};

  root.classList.add('theme-preload');

  const applyTheme = (themeId) => {
    const theme = Object.prototype.hasOwnProperty.call(themeMap, themeId) ? themeId : fallbackTheme;
    const themeConfig = themeMap[theme];

    root.dataset.theme = theme;
    root.classList.toggle('dark', themeConfig.isDark);
    root.style.colorScheme = themeConfig.isDark ? 'dark' : 'light';
    root.style.backgroundColor = themeConfig.background;
  };

  try {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : null;
    const themeId = parsed && typeof parsed.theme === 'string' ? parsed.theme : fallbackTheme;

    applyTheme(themeId);
  } catch {
    applyTheme(fallbackTheme);
  }

  window.requestAnimationFrame(() => {
    root.style.removeProperty('background-color');
    root.classList.remove('theme-preload');
  });
})();`;

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
  return (
    <html lang="en" suppressHydrationWarning data-theme={defaultThemeId}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
