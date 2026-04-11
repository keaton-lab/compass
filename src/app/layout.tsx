import type { Metadata } from 'next';
import './globals.css';
import { SettingsProvider } from './contexts/SettingsContext';
import { getThemePreset, getThemeStyleVariables, themePresets } from './themes';
import { getAvatarImageUrl } from './avatar-utils';
import type { ResolvedIconData } from './icon-types';
import { loadConfig, loadResolvedConfig } from './load-config';
import { defaultThemeId, isThemeId } from './themes';

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

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function createFallbackFaviconUrl() {
  return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧭</text></svg>";
}

function createSvgDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function renderResolvedIconSvg(icon: ResolvedIconData) {
  if (icon.kind === 'lucide') {
    const nodes = icon.nodes
      .map(({ tag, attrs }) => {
        const serializedAttrs = Object.entries(attrs)
          .filter(([key]) => key !== 'key')
          .map(([key, value]) => `${key}="${escapeXml(value)}"`)
          .join(' ');

        return `<${tag}${serializedAttrs ? ` ${serializedAttrs}` : ''} />`;
      })
      .join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${nodes}</svg>`;
  }

  if (!icon.path) {
    return null;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111827"><path d="${escapeXml(icon.path)}" /></svg>`;
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await loadResolvedConfig();
  const avatarImageUrl = getAvatarImageUrl(config.profile.avatar);
  const avatarSvg = config.profile.resolvedAvatarIcon
    ? renderResolvedIconSvg(config.profile.resolvedAvatarIcon)
    : null;

  return {
    title: 'Compass - 导航中心',
    description: '个人导航中心 - 快速访问常用网站和工具',
    icons: {
      icon: [
        avatarImageUrl
          ? {
              url: avatarImageUrl,
            }
          : {
              url: avatarSvg ? createSvgDataUrl(avatarSvg) : createFallbackFaviconUrl(),
              type: 'image/svg+xml',
            },
      ],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialConfig = loadConfig();
  const initialSettings = initialConfig.settings;
  const initialTheme = isThemeId(initialConfig.settings?.theme)
    ? initialConfig.settings.theme
    : defaultThemeId;
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
