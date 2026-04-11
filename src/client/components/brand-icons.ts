interface SimpleIconModuleEntry {
  slug: string;
  title: string;
  path: string;
  hex: string;
}

export interface BrandIconDefinition {
  name: string;
  slug: string;
  path: string;
  hex: string;
}

let brandIconsPromise: Promise<BrandIconDefinition[]> | null = null;
let brandIconMapPromise: Promise<Map<string, BrandIconDefinition>> | null = null;

function normalizeBrandIconKey(value: string): string {
  return value
    .trim()
    .replace(/^icon:/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function importSimpleIcons() {
  const simpleIcons = await import('simple-icons');
  return simpleIcons as unknown as Record<string, SimpleIconModuleEntry>;
}

export async function loadBrandIcons(): Promise<BrandIconDefinition[]> {
  if (!brandIconsPromise) {
    brandIconsPromise = importSimpleIcons().then((simpleIcons) =>
      Object.keys(simpleIcons)
        .filter((key) => key.startsWith('si') && key.length > 2)
        .map((key) => {
          const icon = simpleIcons[key];

          return {
            name: icon.title,
            slug: icon.slug,
            path: icon.path,
            hex: icon.hex,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  return brandIconsPromise;
}

async function loadBrandIconMap() {
  if (!brandIconMapPromise) {
    brandIconMapPromise = loadBrandIcons().then((icons) => {
      const iconMap = new Map<string, BrandIconDefinition>();

      icons.forEach((icon) => {
        const aliases = [
          icon.slug,
          icon.name,
          icon.slug.replace(/-/g, ''),
          icon.name.replace(/[^a-zA-Z0-9]/g, ''),
        ];

        aliases.forEach((alias) => {
          const normalizedAlias = normalizeBrandIconKey(alias);
          if (normalizedAlias && !iconMap.has(normalizedAlias)) {
            iconMap.set(normalizedAlias, icon);
          }
        });
      });

      return iconMap;
    });
  }

  return brandIconMapPromise;
}

export async function resolveBrandIcon(name: string): Promise<BrandIconDefinition | null> {
  const normalizedName = normalizeBrandIconKey(name);
  if (!normalizedName) {
    return null;
  }

  const iconMap = await loadBrandIconMap();
  return iconMap.get(normalizedName) ?? null;
}
