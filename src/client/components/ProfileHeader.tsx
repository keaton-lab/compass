import ResolvedIcon from './ResolvedIcon';
import type { ResolvedProfile as Profile } from '@/shared/types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ProfileAvatar({
  profile,
  name,
  avatar,
  sizeClass,
  iconSize,
  textSizeClass,
}: {
  profile: Profile;
  name: string;
  avatar?: string;
  sizeClass: string;
  iconSize: number;
  textSizeClass: string;
}) {
  const avatarValue = avatar ?? '';
  const isImageAvatar = avatarValue.startsWith('http://') || avatarValue.startsWith('https://');
  const isIconAvatar = !isImageAvatar && avatarValue.trim() !== '';
  const initials = getInitials(name);

  if (isIconAvatar) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border bg-[var(--bg-secondary)] ${sizeClass}`}
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <ResolvedIcon
          icon={profile.resolvedAvatarIcon}
          name={avatarValue}
          size={iconSize}
          className="text-[var(--text-primary)]"
        />
      </div>
    );
  }

  if (isImageAvatar) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg border bg-[var(--bg-secondary)] ${sizeClass}`}
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <img
          src={avatarValue}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg border bg-[var(--bg-secondary)] ${sizeClass}`}
      style={{ borderColor: 'var(--panel-border)' }}
    >
      <span className={`${textSizeClass} font-semibold text-[var(--text-primary)]`}>{initials}</span>
    </div>
  );
}

export function ProfileHeaderDesktopLeft({ profile }: { profile: Profile }) {
  const { name, avatar, description, bio } = profile;

  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <ProfileAvatar
          profile={profile}
          name={name}
          avatar={avatar}
          sizeClass="h-14 w-14"
          iconSize={28}
          textSizeClass="text-xl"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold text-[var(--text-primary)]">{name}</h1>
        <p className="truncate text-sm text-[var(--text-secondary)]">{description}</p>
        {bio && <p className="truncate text-xs text-[var(--muted)]">{bio}</p>}
      </div>
    </div>
  );
}
