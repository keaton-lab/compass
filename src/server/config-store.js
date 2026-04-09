/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DEFAULT_THEME = 'dark';
const VALID_THEMES = new Set(['light', 'dark', 'ocean']);
const VALID_LAYOUTS = new Set(['grid', 'list']);
const DEFAULT_CONFIG_CANDIDATES = [
  path.join(process.cwd(), 'src', 'config.yaml'),
  path.join(process.cwd(), 'src', 'config.yml'),
];

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ensureObject(value, label) {
  if (!isPlainObject(value)) {
    throw new Error(`${label} 必须是对象`);
  }

  return value;
}

function ensureString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} 不能为空`);
  }

  return value.trim();
}

function ensureOptionalString(value, label) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(`${label} 必须是字符串`);
  }

  return value.trim();
}

function ensureBoolean(value, label, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`${label} 必须是布尔值`);
  }

  return value;
}

function ensureTheme(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_THEME;
  }

  if (typeof value !== 'string' || !VALID_THEMES.has(value)) {
    throw new Error('settings.theme 必须是 light、dark 或 ocean');
  }

  return value;
}

function ensureLayout(value) {
  if (value === undefined || value === null || value === '') {
    return 'grid';
  }

  if (typeof value !== 'string' || !VALID_LAYOUTS.has(value)) {
    throw new Error('settings.layout 必须是 grid 或 list');
  }

  return value;
}

function ensureUrl(value, label) {
  const url = ensureString(value, label);

  try {
    new URL(url);
  } catch {
    throw new Error(`${label} 不是有效的 URL`);
  }

  return url;
}

function ensureColor(value, label) {
  const color = ensureString(value, label);

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error(`${label} 必须是类似 #3b82f6 的十六进制颜色`);
  }

  return color;
}

function normalizeConfig(input) {
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
      repo: ensureOptionalString(profile.repo, 'profile.repo'),
    },
    settings: {
      theme: ensureTheme(settings.theme),
      showSearch: ensureBoolean(settings.showSearch, 'settings.showSearch', true),
      layout: ensureLayout(settings.layout),
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

function resolveConfigPath() {
  const configuredPath = process.env.COMPASS_CONFIG_PATH;

  if (configuredPath && configuredPath.trim() !== '') {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.join(process.cwd(), configuredPath);
  }

  const existingDefault = DEFAULT_CONFIG_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  return existingDefault ?? DEFAULT_CONFIG_CANDIDATES[0];
}

function readConfigSource() {
  const configPath = resolveConfigPath();

  if (!fs.existsSync(configPath)) {
    throw new Error(`配置文件不存在：${configPath}`);
  }

  return {
    configPath,
    fileContents: fs.readFileSync(configPath, 'utf8'),
  };
}

function parseConfigYaml(fileContents) {
  const parsed = yaml.load(fileContents);
  return normalizeConfig(parsed);
}

function loadConfigFile() {
  const { fileContents } = readConfigSource();
  return parseConfigYaml(fileContents);
}

function serializeConfig(config) {
  return yaml.dump(normalizeConfig(config), {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

function saveConfigYaml(fileContents) {
  const normalizedConfig = parseConfigYaml(fileContents);
  const configPath = resolveConfigPath();
  const directoryPath = path.dirname(configPath);
  const tempPath = path.join(
    directoryPath,
    `.${path.basename(configPath)}.${process.pid}.${Date.now()}.tmp`,
  );

  fs.mkdirSync(directoryPath, { recursive: true });
  fs.writeFileSync(tempPath, serializeConfig(normalizedConfig), 'utf8');
  fs.renameSync(tempPath, configPath);

  return normalizedConfig;
}

module.exports = {
  loadConfigFile,
  normalizeConfig,
  parseConfigYaml,
  readConfigSource,
  resolveConfigPath,
  saveConfigYaml,
  serializeConfig,
};
