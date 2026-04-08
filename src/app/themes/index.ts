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
    label: '浅色',
    isDark: false,
    colors: {
      background: '#fafafa',
      foreground: '#1f2937',
      panel: '#ffffff',
      panelStrong: '#f5f5f5',
      panelBorder: '#e5e7eb',
      muted: '#6b7280',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      bgSecondary: '#f3f4f6',
      accent: '#b8954e',
      accentAlpha: 'rgba(184, 149, 78, 0.1)',
      accentBorder: 'rgba(184, 149, 78, 0.2)',
    },
    iconColors: {
      light: { bg: '#fef3c7', text: '#d97706', darkBg: 'rgba(217, 119, 6, 0.2)', darkText: '#fbbf24' },
      dark: { bg: '#f3f4f6', text: '#4b5563', darkBg: '#1f2937', darkText: '#9ca3af' },
      ocean: { bg: '#dbeafe', text: '#2563eb', darkBg: 'rgba(37, 99, 235, 0.2)', darkText: '#60a5fa' },
    },
  },
  {
    id: 'dark',
    label: '深色',
    isDark: true,
    colors: {
      background: '#0f1113',
      foreground: '#f0f0f0',
      panel: '#181a1d',
      panelStrong: '#1e2024',
      panelBorder: '#2a2d32',
      muted: '#6b7280',
      textPrimary: '#f0f0f0',
      textSecondary: '#9ca3af',
      bgSecondary: '#25282d',
      accent: '#c9a45c',
      accentAlpha: 'rgba(201, 164, 92, 0.12)',
      accentBorder: 'rgba(201, 164, 92, 0.25)',
    },
    iconColors: {
      light: { bg: '#fef3c7', text: '#d97706', darkBg: 'rgba(217, 119, 6, 0.2)', darkText: '#fbbf24' },
      dark: { bg: '#f3f4f6', text: '#4b5563', darkBg: '#1f2937', darkText: '#9ca3af' },
      ocean: { bg: '#dbeafe', text: '#2563eb', darkBg: 'rgba(37, 99, 235, 0.2)', darkText: '#60a5fa' },
    },
  },
  {
    id: 'ocean',
    label: '海洋蓝',
    isDark: false,
    colors: {
      background: '#f8fdff',
      foreground: '#17384a',
      panel: 'rgba(255, 255, 255, 0.82)',
      panelStrong: 'rgba(240, 249, 252, 0.92)',
      panelBorder: 'rgba(165, 206, 223, 0.45)',
      muted: '#6e8b99',
      textPrimary: '#17384a',
      textSecondary: '#547181',
      bgSecondary: '#eef8fb',
      accent: '#4aa6c8',
      accentAlpha: 'rgba(74, 166, 200, 0.10)',
      accentBorder: 'rgba(74, 166, 200, 0.20)',
    },
    iconColors: {
      light: { bg: '#fef3c7', text: '#d97706', darkBg: 'rgba(217, 119, 6, 0.2)', darkText: '#fbbf24' },
      dark: { bg: '#f3f4f6', text: '#4b5563', darkBg: '#1f2937', darkText: '#9ca3af' },
      ocean: { bg: '#dbeafe', text: '#2563eb', darkBg: 'rgba(37, 99, 235, 0.2)', darkText: '#60a5fa' },
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
    '--text-primary': themePreset.colors.textPrimary,
    '--text-secondary': themePreset.colors.textSecondary,
    '--bg-secondary': themePreset.colors.bgSecondary,
    '--accent': themePreset.colors.accent,
    '--accent-alpha': themePreset.colors.accentAlpha,
    '--accent-border': themePreset.colors.accentBorder,
    colorScheme: themePreset.isDark ? 'dark' : 'light',
  };
}
