'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
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

  return (
    <motion.div
      className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex-shrink-0">
        {avatar && avatar.trim() !== '' ? (
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-white/10">
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 112px"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/10 border border-white/10">
            <span className="text-3xl md:text-4xl font-bold text-white">
              {initials}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {name}
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-3">
          {description}
        </p>
        {bio && (
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">
            {bio}
          </p>
        )}
      </div>
    </motion.div>
  );
}