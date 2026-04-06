export interface ValidationErrors {
  [key: string]: string;
}

export function validateUrl(url: string): string | null {
  if (!url) return 'URL 不能为空';
  try {
    new URL(url);
    return null;
  } catch {
    return '请输入有效的 URL 地址';
  }
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} 不能为空`;
  return null;
}

export function validateCategoryName(name: string): string | null {
  return validateRequired(name, '分类名称');
}

export function validateLinkName(name: string): string | null {
  return validateRequired(name, '链接名称');
}

export function validateLinkUrl(url: string): string | null {
  if (!url.trim()) return 'URL 不能为空';
  return validateUrl(url);
}

export function validateIconName(icon: string): string | null {
  if (!icon.trim()) return '图标名称不能为空';
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(icon) && !/^[a-z][a-z0-9-]*$/.test(icon)) {
    return '图标名称格式不正确（Lucide 用 PascalCase，品牌图标用小写）';
  }
  return null;
}

export function validateColor(color: string): string | null {
  if (!color.trim()) return '颜色不能为空';
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return '请输入有效的十六进制颜色值（如 #3b82f6）';
  }
  return null;
}
