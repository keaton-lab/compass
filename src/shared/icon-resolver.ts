import type { ResolvedIconData, ResolvedSvgNode, Config, ResolvedConfig } from './types';

interface SimpleIconModuleEntry {
  slug: string;
  title: string;
  path: string;
}

type LucideIconModule = {
  __iconNode?: [string, Record<string, string | number>][];
};

type LucideIconLoader = () => Promise<LucideIconModule>;

let lucideResolverPromise: Promise<(name: string) => Promise<ResolvedIconData | null>> | null = null;
let brandResolverPromise: Promise<(name: string) => Promise<ResolvedIconData | null>> | null = null;
const resolvedIconCache = new Map<string, ResolvedIconData | null>();

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function normalizeBrandIconKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeLucideNodes(
  iconNode: [string, Record<string, string | number>][],
): ResolvedSvgNode[] {
  return iconNode.map(([tag, attrs]) => ({
    tag,
    attrs: Object.fromEntries(
      Object.entries(attrs).map(([key, value]) => [key, String(value)]),
    ),
  }));
}

async function getLucideResolver() {
  if (!lucideResolverPromise) {
    lucideResolverPromise = import('lucide-react/dynamicIconImports.mjs').then(
      (module) => {
        const iconLoaders = (module.default ?? module) as Record<
          string,
          LucideIconLoader
        >;
        const normalizedLoaderMap = new Map<string, LucideIconLoader>();

        Object.entries(iconLoaders).forEach(([key, loader]) => {
          normalizedLoaderMap.set(key, loader);
          normalizedLoaderMap.set(key.replace(/-/g, ''), loader);
        });

        return async (name: string) => {
          const trimmed = name.trim();
          if (!trimmed) {
            return null;
          }

          const kebab = toKebabCase(trimmed);
          const compact = kebab.replace(/-/g, '');
          const loader =
            normalizedLoaderMap.get(kebab) ??
            normalizedLoaderMap.get(compact);

          if (!loader) {
            return null;
          }

          const iconModule = await loader();
          const iconNode = iconModule.__iconNode;

          if (!Array.isArray(iconNode)) {
            return null;
          }

          return {
            kind: 'lucide',
            nodes: normalizeLucideNodes(iconNode),
          } satisfies ResolvedIconData;
        };
      },
    );
  }

  return lucideResolverPromise;
}

async function getBrandResolver() {
  if (!brandResolverPromise) {
    brandResolverPromise = import('simple-icons').then((simpleIcons) => {
      const iconMap = new Map<string, string>();
      const moduleEntries = simpleIcons as unknown as Record<
        string,
        SimpleIconModuleEntry
      >;

      Object.keys(moduleEntries)
        .filter((key) => key.startsWith('si') && key.length > 2)
        .forEach((key) => {
          const icon = moduleEntries[key];
          const aliases = [
            icon.slug,
            icon.title,
            icon.slug.replace(/-/g, ''),
            icon.title.replace(/[^a-zA-Z0-9]/g, ''),
          ];

          aliases.forEach((alias) => {
            const normalizedAlias = normalizeBrandIconKey(alias);
            if (normalizedAlias && !iconMap.has(normalizedAlias)) {
              iconMap.set(normalizedAlias, icon.path);
            }
          });
        });

      return async (name: string) => {
        const normalizedName = normalizeBrandIconKey(name);
        if (!normalizedName) {
          return null;
        }

        return {
          kind: 'brand',
          path: iconMap.get(normalizedName) ?? null,
        } satisfies ResolvedIconData;
      };
    });
  }

  return brandResolverPromise;
}

/**
 * 解析图标名称为图标数据
 */
export async function resolveIcon(name: string): Promise<ResolvedIconData | null> {
  const cacheKey = name.trim();

  if (!cacheKey) {
    return null;
  }

  if (resolvedIconCache.has(cacheKey)) {
    return resolvedIconCache.get(cacheKey) ?? null;
  }

  const lucideResolver = await getLucideResolver();
  const lucideIcon = await lucideResolver(cacheKey);

  if (lucideIcon) {
    resolvedIconCache.set(cacheKey, lucideIcon);
    return lucideIcon;
  }

  const brandResolver = await getBrandResolver();
  const brandIcon = await brandResolver(cacheKey);
  resolvedIconCache.set(cacheKey, brandIcon);
  return brandIcon;
}

/**
 * 将 ResolvedSvgNode 数组转换为 SVG 元素字符串
 */
function nodesToSvgString(nodes: ResolvedSvgNode[]): string {
  return nodes
    .map((node) => {
      const attrs = Object.entries(node.attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      return `<${node.tag}${attrs ? ' ' + attrs : ''} />`;
    })
    .join('');
}

/**
 * 将解析后的图标数据转换为 SVG 字符串
 * 用于生成 favicon 等场景
 */
export function iconToSvgString(
  icon: ResolvedIconData | null | undefined,
  options: { size?: number; color?: string } = {},
): string | null {
  if (!icon) return null;

  const { size = 32, color = 'currentColor' } = options;
  const viewBox = '0 0 24 24';

  if (icon.kind === 'lucide') {
    const content = nodesToSvgString(icon.nodes);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
  }

  if (icon.kind === 'brand' && icon.path) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}" fill="${color}"><path d="${icon.path}" /></svg>`;
  }

  return null;
}

/**
 * 将 SVG 字符串转换为 data URI
 */
export function svgToDataUri(svg: string): string {
  const encoded = svg
    .replace(/"/g, "'")
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/#/g, '%23')
    .replace(/\s+/g, ' ');
  return `data:image/svg+xml,${encoded}`;
}

/**
 * 解析配置中的所有图标
 */
export async function resolveConfigIcons(config: Config): Promise<ResolvedConfig> {
  return {
    profile: {
      ...config.profile,
      resolvedAvatarIcon: config.profile.avatar ? await resolveIcon(config.profile.avatar) : null,
    },
    settings: config.settings,
    categories: await Promise.all(
      config.categories.map(async (category) => ({
        ...category,
        resolvedIcon: await resolveIcon(category.icon),
        links: await Promise.all(
          category.links.map(async (link) => ({
            ...link,
            resolvedIcon: await resolveIcon(link.icon),
          })),
        ),
      })),
    ),
  };
}
