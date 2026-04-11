import * as yaml from 'js-yaml';
import type { Config } from './types';

const DEFAULT_THEME = 'dark';
const VALID_THEMES = new Set(['light', 'dark', 'ocean']);
const VALID_LAYOUTS = new Set(['grid', 'list']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ensureObject(value: unknown, label: string): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new Error(`${label} 必须是对象`);
  }

  return value;
}

function ensureString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} 不能为空`);
  }

  return value.trim();
}

function ensureOptionalString(value: unknown, label: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(`${label} 必须是字符串`);
  }

  return value.trim();
}

function ensureBoolean(value: unknown, label: string, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`${label} 必须是布尔值`);
  }

  return value;
}

function ensureTheme(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_THEME;
  }

  if (typeof value !== 'string' || !VALID_THEMES.has(value)) {
    throw new Error('settings.theme 必须是 light、dark 或 ocean');
  }

  return value;
}

function ensureLayout(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return 'grid';
  }

  if (typeof value !== 'string' || !VALID_LAYOUTS.has(value)) {
    throw new Error('settings.layout 必须是 grid 或 list');
  }

  return value;
}

function ensureUrl(value: unknown, label: string): string {
  const url = ensureString(value, label);

  try {
    new URL(url);
  } catch {
    throw new Error(`${label} 不是有效的 URL`);
  }

  return url;
}

function ensureColor(value: unknown, label: string): string {
  const color = ensureString(value, label);

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error(`${label} 必须是类似 #3b82f6 的十六进制颜色`);
  }

  return color;
}

/**
 * 规范化配置数据
 */
export function normalizeConfig(input: unknown): Config {
  const root = ensureObject(input, '配置');
  const profile = ensureObject(root.profile, 'profile');
  const settings = ensureObject(root.settings, 'settings');

  if (!Array.isArray(root.categories)) {
    throw new Error('categories 必须是数组');
  }

  return {
    profile: {
      name: ensureString(profile.name, 'profile.name'),
      avatar: ensureOptionalString(profile.avatar, 'profile.avatar'),
      description: ensureString(profile.description, 'profile.description'),
      bio: ensureOptionalString(profile.bio, 'profile.bio'),
    },
    settings: {
      theme: ensureTheme(settings.theme) as Config['settings']['theme'],
      showSearch: ensureBoolean(settings.showSearch, 'settings.showSearch', true),
      layout: ensureLayout(settings.layout) as Config['settings']['layout'],
      animations: ensureBoolean(settings.animations, 'settings.animations', true),
      searchQuery:
        settings.searchQuery === undefined || settings.searchQuery === null
          ? undefined
          : ensureOptionalString(settings.searchQuery, 'settings.searchQuery'),
    },
    categories: root.categories.map((category, categoryIndex) => {
      const categoryObject = ensureObject(category, `categories[${categoryIndex}]`);

      if (!Array.isArray(categoryObject.links)) {
        throw new Error(`categories[${categoryIndex}].links 必须是数组`);
      }

      return {
        id: ensureString(categoryObject.id, `categories[${categoryIndex}].id`),
        name: ensureString(categoryObject.name, `categories[${categoryIndex}].name`),
        icon: ensureString(categoryObject.icon, `categories[${categoryIndex}].icon`),
        color: ensureColor(categoryObject.color, `categories[${categoryIndex}].color`),
        links: categoryObject.links.map((link, linkIndex) => {
          const linkObject = ensureObject(link, `categories[${categoryIndex}].links[${linkIndex}]`);

          return {
            id: ensureString(linkObject.id, `categories[${categoryIndex}].links[${linkIndex}].id`),
            name: ensureString(linkObject.name, `categories[${categoryIndex}].links[${linkIndex}].name`),
            url: ensureUrl(linkObject.url, `categories[${categoryIndex}].links[${linkIndex}].url`),
            icon: ensureString(linkObject.icon, `categories[${categoryIndex}].links[${linkIndex}].icon`),
            description:
              linkObject.description === undefined || linkObject.description === null
                ? ''
                : String(linkObject.description),
          };
        }),
      };
    }),
  };
}

/**
 * 解析 YAML 配置
 */
export function parseConfigYaml(fileContents: string): Config {
  const parsed = yaml.load(fileContents);
  return normalizeConfig(parsed);
}

/**
 * 序列化配置为 YAML
 */
export function serializeConfig(config: Config): string {
  return yaml.dump(normalizeConfig(config), {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}
