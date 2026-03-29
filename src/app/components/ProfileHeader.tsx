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
        className="md:hidden flex flex-row items-center justify-between w-full px-4 py-3 bg-white/5 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      > 
        <div className="flex items-center gap-3">
          {renderAvatar('w-10 h-10', 24, 'text-base')}
          <h1 className="text-base font-bold text-gray-900 dark:text-white">
            {name}
          </h1>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {description}
          </p>
          {bio && (
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed mt-0.5">
              {bio}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        className="hidden md:flex flex-row items-center gap-4 p-4 rounded-xl bg-white/5 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      > 
        <div className="flex-shrink-0">
          {renderAvatar('w-12 h-12', 28, 'text-xl')}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {description}
          </p>
        </div>
      </motion.div>
    </>
  );
}
