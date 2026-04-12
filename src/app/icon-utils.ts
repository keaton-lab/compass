export interface SimpleIconModuleEntry {
  slug: string;
  title: string;
  path: string;
}

export function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export function normalizeBrandIconKey(value: string): string {
  return value
    .trim()
    .replace(/^icon:/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}
