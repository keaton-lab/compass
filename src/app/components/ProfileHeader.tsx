'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
import type { Profile } from '../types';

// 新增：桌面端左侧区域的共用头部片段，便于在 Header 一体化布局中复用
// 仅渲染左侧的头像与个人信息，不包含右侧的操作区
export function ProfileHeaderDesktopLeft({ profile }: { profile: Profile }) {
  const { name, avatar, description, bio } = profile;

  const getInitials = (n: string): string => {
    return n
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);

  const avatarValue = avatar ?? '';
  const isIconAvatar = avatarValue.startsWith('icon:');
  const isImageAvatar = !isIconAvatar && avatarValue.trim() !== '';

  const renderAvatar = () => {
    if (isIconAvatar) {
      return (
        <div className="flex items-center justify-center w-14 h-14 rounded-lg border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--panel-border)' }}>
          <Icon
            name={avatarValue.slice(5)}
            size={28}
            className="text-[var(--text-primary)]"
          />
        </div>
      );
    }
    if (isImageAvatar) {
      return (
        <div className={`relative w-14 h-14 rounded-lg overflow-hidden border shadow-md`} style={{ borderColor: 'var(--panel-border)' }}>
          <Image
            src={avatarValue}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40px, 56px"
          />
        </div>
      );
    }
    // initials
    return (
      <div className={`flex items-center justify-center w-14 h-14 rounded-lg border`} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--panel-border)' }}>
        <span className="text-xl font-semibold text-[var(--text-primary)]">{initials}</span>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">{renderAvatar()}</div>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] truncate">{name}</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)] truncate">{description}</p>
        {bio && (
          <p className="mt-0.5 text-sm text-[var(--muted)] truncate">{bio}</p>
        )}
      </div>
    </div>
  );
}

interface ProfileHeaderProps {
  profile: Profile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { name, avatar, description, bio } = profile;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);

  const avatarValue = avatar ?? '';
  const isIconAvatar = avatarValue.startsWith('icon:');
  const isImageAvatar = !isIconAvatar && avatarValue.trim() !== '';

  const renderAvatar = (sizeClass: string, iconSize: number, textSizeClass: string) => {
    if (isIconAvatar) {
      return (
        <div className={`flex items-center justify-center ${sizeClass} rounded-lg border`} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--panel-border)' }}>
          <Icon
            name={avatarValue.slice(5)}
            size={iconSize}
            className="text-[var(--text-primary)]"
          />
        </div>
      );
    }
    if (isImageAvatar) {
      return (
        <div className={`relative ${sizeClass} rounded-lg overflow-hidden border shadow-md`} style={{ borderColor: 'var(--panel-border)' }}>
          <Image
            src={avatarValue}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40px, 56px"
          />
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center ${sizeClass} rounded-lg border`} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--panel-border)' }}>
        <span className={`${textSizeClass} font-bold text-[var(--text-primary)]`}>
          {initials}
        </span>
      </div>
    );
  };

  return (
    <>
      <motion.div
        className="liquid-glass md:hidden w-full rounded-2xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {renderAvatar('w-11 h-11', 24, 'text-base')}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-[var(--text-primary)]">
                {name}
              </h1>
              <p className="truncate text-sm text-[var(--muted)]">
                {description}
              </p>
            </div>
          </div>
          <ThemeToggle mobileOnly />
        </div>
      </motion.div>

      <div className="hidden md:flex items-center gap-4">
        <div className="flex-shrink-0">
          {renderAvatar('w-14 h-14', 28, 'text-xl')}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] truncate">
            {name}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)] truncate">
            {description}
          </p>
          {bio && (
            <p className="mt-0.5 text-sm text-[var(--muted)] truncate">
              {bio}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
