/**
 * 运行时模式定义
 */
export type RuntimeMode = 'static' | 'server' | 'github';

/**
 * 运行时能力描述
 */
export interface Capabilities {
  mode: RuntimeMode;
  canLogin: boolean;         // 是否支持登录
  canSaveToFile: boolean;    // 是否支持保存到文件
  canPublishToGithub: boolean; // 是否支持发布到 GitHub
}

/**
 * 图标类型定义
 */
export interface ResolvedSvgNode {
  tag: string;
  attrs: Record<string, string>;
}

export type ResolvedIconData =
  | {
      kind: 'lucide';
      nodes: ResolvedSvgNode[];
    }
  | {
      kind: 'brand';
      path: string | null;
    };

/**
 * 主题类型定义
 */
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

/**
 * 配置数据结构
 */
export interface Link {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  links: Link[];
}

export interface Profile {
  name: string;
  avatar?: string;
  description: string;
  bio?: string;
  repo?: string;
}

export interface Settings {
  theme: ThemeId;
  showSearch: boolean;
  layout: 'grid' | 'list';
  animations: boolean;
  searchQuery?: string;
}

export interface Config {
  profile: Profile;
  settings: Settings;
  categories: Category[];
}

/**
 * 解析后的配置数据结构（包含图标数据）
 */
export interface ResolvedLink extends Link {
  resolvedIcon?: ResolvedIconData | null;
}

export interface ResolvedCategory extends Omit<Category, 'links'> {
  links: ResolvedLink[];
  resolvedIcon?: ResolvedIconData | null;
}

export interface ResolvedProfile extends Profile {
  resolvedAvatarIcon?: ResolvedIconData | null;
}

export interface ResolvedConfig {
  profile: ResolvedProfile;
  settings: Settings;
  categories: ResolvedCategory[];
}

/**
 * GitHub 发布载荷
 */
export interface GithubPublishPayload {
  yamlContent: string;
  commitMessage?: string;
}

export interface SessionStatus {
  authenticated: boolean;
}

export interface GithubConnectionStatus {
  configured: boolean;
  authenticated: boolean;
  repo: string | null;
  branch: string;
  path: string;
}
