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
  };
}

export type ThemeId = ThemePreset['id'];

export const themePresets: ThemePreset[] = [
  {
    id: 'light',
    label: 'Light',
    isDark: false,
    colors: {
      background: '#f6f8fb',
      foreground: '#08111f',
      panel: 'rgba(255, 255, 255, 0.78)',
      panelStrong: 'rgba(255, 255, 255, 0.9)',
      panelBorder: 'rgba(15, 23, 42, 0.08)',
      muted: '#516076',
      gridLine: 'rgba(58, 76, 103, 0.06)',
      glowA: 'rgba(41, 121, 255, 0.08)',
      glowB: 'rgba(0, 229, 255, 0.07)',
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
