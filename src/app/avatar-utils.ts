export function stripAvatarIconPrefix(avatar?: string): string {
  return avatar?.trim().replace(/^icon:/i, '') ?? '';
}

export function isAvatarImageSource(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return (
    /^(?:https?:)?\/\//i.test(trimmed) ||
    /^data:/i.test(trimmed) ||
    /^[./~]/.test(trimmed) ||
    trimmed.includes('/') ||
    /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(trimmed)
  );
}

export function getAvatarIconName(avatar?: string): string | null {
  const trimmed = avatar?.trim() ?? '';

  if (!trimmed || isAvatarImageSource(trimmed)) {
    return null;
  }

  return stripAvatarIconPrefix(trimmed) || null;
}

export function getAvatarImageUrl(avatar?: string): string | null {
  const trimmed = avatar?.trim() ?? '';

  if (!trimmed || !isAvatarImageSource(trimmed)) {
    return null;
  }

  if (/^(?:https?:)?\/\//i.test(trimmed) || /^data:/i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('./')) {
    return `/${trimmed.slice(2)}`;
  }

  return trimmed.startsWith('../') ? trimmed : `/${trimmed}`;
}
