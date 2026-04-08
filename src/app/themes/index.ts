export interface ThemeIconColors {
  light: { bg: string; text: string; darkBg: string; darkText: string };
  dark: { bg: string; text: string; darkBg: string; darkText: string };
  ocean: { bg: string; text: string; darkBg: string; darkText: string };
}

export interface ThemePreset {
  id: 'light' | 'dark' | 'ocean';
  label: string;
  isDark: boolean;
  colors: {
    background: string;
    foreground: string;
    panel: string;
    panelStrong: string;
    panelBorder: string;
    muted: string;
    gridLine: string;
    glowA: string;
    glowB: string;
    textPrimary: string;
    textSecondary: string;
    bgSecondary: string;
    accent: string;
    accentAlpha: string;
    accentBorder: string;
  };
  iconColors: ThemeIconColors;
}

export type ThemeId = ThemePreset['id'];

export const themePresets: ThemePreset[] = [
  {
    id: 'light',
    label: 'Light',
    isDark: false,
    colors: {
      background: '#f7f4ee',
      foreground: '#1d262b',
      panel: '#fcf8f2',
      panelStrong: '#fffdfa',
      panelBorder: '#d8d0c4',
      muted: '#6f655b',
      gridLine: 'rgba(127, 113, 96, 0.05)',
      glowA: 'rgba(231, 207, 174, 0.2)',
      glowB: 'rgba(248, 236, 217, 0.28)',
      textPrimary: '#1d262b',
      textSecondary: '#62584d',
      bgSecondary: '#f1ebe2',
      accent: '#b56d3c',
      accentAlpha: 'rgba(181, 109, 60, 0.12)',
      accentBorder: 'rgba(181, 109, 60, 0.24)',
    },
    iconColors: {
      light: { bg: '#fef3c7', text: '#d97706', darkBg: 'rgba(217, 119, 6, 0.2)', darkText: '#fbbf24' },
      dark: { bg: '#f1f5f9', text: '#475569', darkBg: '#1e293b', darkText: '#cbd5e1' },
      ocean: { bg: '#e0f2fe', text: '#0369a1', darkBg: 'rgba(3, 105, 161, 0.2)', darkText: '#38bdf8' },
    },
  },
  {
    id: 'dark',
    label: 'Dark',
    isDark: true,
    colors: {
      background: '#0d1519',
      foreground: '#ecf2f2',
      panel: '#121d22',
      panelStrong: '#17242a',
      panelBorder: '#27363d',
      muted: '#8ea2a8',
      gridLine: 'rgba(78, 125, 138, 0.08)',
      glowA: 'transparent',
      glowB: 'transparent',
      textPrimary: '#ecf2f2',
      textSecondary: '#b3c5ca',
      bgSecondary: '#203138',
      accent: '#18b6a4',
      accentAlpha: 'rgba(24, 182, 164, 0.14)',
      accentBorder: 'rgba(24, 182, 164, 0.3)',
    },
    iconColors: {
      light: { bg: '#fef3c7', text: '#d97706', darkBg: 'rgba(217, 119, 6, 0.2)', darkText: '#fbbf24' },
      dark: { bg: '#f1f5f9', text: '#475569', darkBg: '#1e293b', darkText: '#cbd5e1' },
      ocean: { bg: '#e0f2fe', text: '#0369a1', darkBg: 'rgba(3, 105, 161, 0.2)', darkText: '#38bdf8' },
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    isDark: false,
    colors: {
      background: '#edf6f8',
      foreground: '#173247',
      panel: '#f7fbfc',
      panelStrong: '#ffffff',
      panelBorder: '#c7d8df',
      muted: '#627886',
      gridLine: 'rgba(86, 143, 176, 0.06)',
      glowA: 'rgba(109, 188, 214, 0.2)',
      glowB: 'rgba(180, 225, 234, 0.3)',
      textPrimary: '#173247',
      textSecondary: '#5a7483',
      bgSecondary: '#e0eef2',
      accent: '#18766a',
      accentAlpha: 'rgba(24, 118, 106, 0.12)',
      accentBorder: 'rgba(24, 118, 106, 0.28)',
    },
    iconColors: {
      light: { bg: '#fef3c7', text: '#d97706', darkBg: 'rgba(217, 119, 6, 0.2)', darkText: '#fbbf24' },
      dark: { bg: '#f1f5f9', text: '#475569', darkBg: '#1e293b', darkText: '#cbd5e1' },
      ocean: { bg: '#e0f2fe', text: '#0369a1', darkBg: 'rgba(3, 105, 161, 0.2)', darkText: '#38bdf8' },
    },
  },
];

export const defaultThemeId: ThemeId = 'dark';

export function isThemeId(value: string): value is ThemeId {
  return themePresets.some((theme) => theme.id === value);
}

export function getThemePreset(themeId: ThemeId): ThemePreset {
  return themePresets.find((theme) => theme.id === themeId) ?? themePresets[0];
}

export function getThemeStyleVariables(themeId: ThemeId): Record<string, string> {
  const themePreset = getThemePreset(themeId);

  return {
    '--background': themePreset.colors.background,
    '--foreground': themePreset.colors.foreground,
    '--panel': themePreset.colors.panel,
    '--panel-strong': themePreset.colors.panelStrong,
    '--panel-border': themePreset.colors.panelBorder,
    '--muted': themePreset.colors.muted,
    '--grid-line': themePreset.colors.gridLine,
    '--glow-a': themePreset.colors.glowA,
    '--glow-b': themePreset.colors.glowB,
    '--text-primary': themePreset.colors.textPrimary,
    '--text-secondary': themePreset.colors.textSecondary,
    '--bg-secondary': themePreset.colors.bgSecondary,
    '--accent': themePreset.colors.accent,
    '--accent-alpha': themePreset.colors.accentAlpha,
    '--accent-border': themePreset.colors.accentBorder,
    colorScheme: themePreset.isDark ? 'dark' : 'light',
  };
}
