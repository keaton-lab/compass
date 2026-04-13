import 'server-only';

import type { ResolvedIconData, ResolvedSvgNode } from './icon-types';
import { normalizeBrandIconKey, toKebabCase, type SimpleIconModuleEntry } from './icon-utils';
import type { Config, ResolvedConfig } from './types';
import { getAvatarIconName } from './avatar-utils';

type LucideIconModule = {
  __iconNode?: [string, Record<string, string | number>][];
};

type LucideIconLoader = () => Promise<LucideIconModule>;

let lucideResolverPromise: Promise<(name: string) => Promise<ResolvedIconData | null>> | null = null;
let brandResolverPromise: Promise<(name: string) => Promise<ResolvedIconData | null>> | null = null;
const resolvedIconCache = new Map<string, ResolvedIconData | null>();

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
    lucideResolverPromise = import('lucide-react/dynamicIconImports').then(
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

async function resolveIcon(name: string): Promise<ResolvedIconData | null> {
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

export async function resolveConfigIcons(config: Config): Promise<ResolvedConfig> {
  const avatarIconName = getAvatarIconName(config.profile.avatar);

  return {
    profile: {
      ...config.profile,
      resolvedAvatarIcon: avatarIconName ? await resolveIcon(avatarIconName) : null,
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
