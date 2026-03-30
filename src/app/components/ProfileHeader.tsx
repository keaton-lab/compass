'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Icon from './Icon';
import type { Profile } from '../types';

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
        <div className={`flex items-center justify-center ${sizeClass} rounded-lg  bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10`}>
          <Icon 
            name={avatarValue.slice(5)} 
            size={iconSize} 
            className="text-gray-900 dark:text-white"
          />
        </div>
      );
    }
    if (isImageAvatar) {
      return (
        <div className={`relative ${sizeClass} rounded-lg  overflow-hidden border border-black/5 dark:border-white/10 shadow-sm`}>
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
      <div className={`flex items-center justify-center ${sizeClass} rounded-lg  bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10`}>
        <span className={`${textSizeClass} font-bold text-gray-900 dark:text-white`}>
          {initials}
        </span>
      </div>
    );
  };

  return (
    <>
      <motion.div
        className="glass-panel md:hidden w-full rounded-[20px] p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="flex items-center gap-3">
          {renderAvatar('w-11 h-11', 24, 'text-base')}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-950 dark:text-white">
              {name}
            </h1>
            <p className="truncate text-sm text-[var(--muted)]">
              {description}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass-panel hidden md:flex items-center gap-4 rounded-[24px] px-5 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="flex-shrink-0">
          {renderAvatar('w-14 h-14', 28, 'text-xl')}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-slate-950 dark:text-white truncate">
            {name}
          </h1>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 truncate">
            {description}
          </p>
          {bio && (
            <p className="mt-1 text-sm text-[var(--muted)] truncate">
              {bio}
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
}
