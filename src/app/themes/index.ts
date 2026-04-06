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
      background: '#dbe2ea',
      foreground: '#08111f',
      panel: 'rgba(255, 255, 255, 0.78)',
      panelStrong: 'rgba(255, 255, 255, 0.9)',
      panelBorder: 'rgba(15, 23, 42, 0.08)',
      muted: '#516076',
      gridLine: 'rgba(58, 76, 103, 0.06)',
      glowA: 'transparent',
      glowB: 'transparent',
      accent: '#f59e0b',
      accentAlpha: 'rgba(245, 158, 11, 0.15)',
      accentBorder: 'rgba(245, 158, 11, 0.4)',
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
      background: '#06111f',
      foreground: '#eff6ff',
      panel: 'rgba(7, 19, 34, 0.76)',
      panelStrong: 'rgba(8, 24, 42, 0.88)',
      panelBorder: 'rgba(148, 163, 184, 0.16)',
      muted: '#93a6bf',
      gridLine: 'rgba(129, 160, 201, 0.08)',
      glowA: 'rgba(34, 211, 238, 0.1)',
      glowB: 'rgba(37, 99, 235, 0.12)',
      accent: '#0ea5e9',
      accentAlpha: 'rgba(14, 165, 233, 0.15)',
      accentBorder: 'rgba(14, 165, 233, 0.4)',
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
      background: '#edf6ff',
      foreground: '#0b1f33',
      panel: 'rgba(255, 255, 255, 0.74)',
      panelStrong: 'rgba(255, 255, 255, 0.88)',
      panelBorder: 'rgba(56, 104, 168, 0.14)',
      muted: '#4a6a8a',
      gridLine: 'rgba(74, 118, 171, 0.08)',
      glowA: 'rgba(56, 189, 248, 0.14)',
      glowB: 'rgba(59, 130, 246, 0.1)',
      accent: '#0284c7',
      accentAlpha: 'rgba(2, 132, 199, 0.15)',
      accentBorder: 'rgba(2, 132, 199, 0.4)',
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
