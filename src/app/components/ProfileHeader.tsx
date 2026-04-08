'use client';

import Image from 'next/image';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
import type { Profile } from '../types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ProfileAvatar({
  name,
  avatar,
  sizeClass,
  iconSize,
  textSizeClass,
}: {
  name: string;
  avatar?: string;
  sizeClass: string;
  iconSize: number;
  textSizeClass: string;
}) {
  const avatarValue = avatar ?? '';
  const isIconAvatar = avatarValue.startsWith('icon:');
  const isImageAvatar = !isIconAvatar && avatarValue.trim() !== '';
  const initials = getInitials(name);

  if (isIconAvatar) {
    return (
      <div
        className={`flex items-center justify-center rounded-[18px] border bg-[var(--bg-secondary)] ${sizeClass}`}
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <Icon name={avatarValue.slice(5)} size={iconSize} className="text-[var(--text-primary)]" />
      </div>
    );
  }

  if (isImageAvatar) {
    return (
      <div
        className={`relative overflow-hidden rounded-[18px] border bg-[var(--bg-secondary)] ${sizeClass}`}
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <Image src={avatarValue} alt={name} fill className="object-cover" sizes="(max-width: 768px) 44px, 56px" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-[18px] border bg-[var(--bg-secondary)] ${sizeClass}`}
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
        <ProfileAvatar name={name} avatar={avatar} sizeClass="h-14 w-14" iconSize={28} textSizeClass="text-xl" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold text-[var(--text-primary)]">{name}</h1>
        <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{description}</p>
        {bio && <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{bio}</p>}
      </div>
    </div>
  );
}

interface ProfileHeaderProps {
  profile: Profile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { name, avatar, description, bio } = profile;

  return (
    <>
      <div className="glass-panel-strong w-full rounded-[22px] p-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ProfileAvatar name={name} avatar={avatar} sizeClass="h-11 w-11" iconSize={24} textSizeClass="text-base" />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-[var(--text-primary)]">{name}</h1>
              <p className="truncate text-sm text-[var(--muted)]">{description}</p>
            </div>
          </div>
          <ThemeToggle mobileOnly />
        </div>
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <div className="shrink-0">
          <ProfileAvatar name={name} avatar={avatar} sizeClass="h-14 w-14" iconSize={28} textSizeClass="text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-[var(--text-primary)]">{name}</h1>
          <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{description}</p>
          {bio && <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{bio}</p>}
        </div>
      </div>
    </>
  );
}
