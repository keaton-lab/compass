'use client';

import { motion } from 'framer-motion';
import Icon from './Icon';
import type { Link as LinkType } from '../types';

interface NavigationCardProps {
  link: LinkType;
  color: string;
}

export default function NavigationCard({ link, color }: NavigationCardProps) {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-panel group relative flex min-h-[88px] flex-col overflow-hidden rounded-[16px] p-3 cursor-pointer md:min-h-[80px] md:flex-row md:items-center md:gap-2.5 md:rounded-[18px] md:p-3.5"
      whileHover={{
        scale: 1.015,
        y: -2,
        boxShadow: `0 12px 28px ${color}18`
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at top right, ${color}26 0%, transparent 56%)`
        }}
      />
      <div className="relative z-10 flex items-start justify-between gap-2 md:flex-none">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-lg border md:h-11 md:w-11"
          style={{
            backgroundColor: `${color}18`,
            borderColor: `${color}40`
          }}
          animate={{ rotate: 0 }}
          whileHover={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon
            name={link.icon}
            size={20}
            color={color}
            className="transition-transform group-hover:scale-110"
          />
        </motion.div>
      </div>

      <div className="relative z-10 mt-2 min-w-0 flex-1 md:mt-0">
        <h3 className="truncate text-[15px] font-medium text-[var(--text-primary)] group-hover:opacity-80 md:text-[15px]">
          {link.name}
        </h3>
        <p className="mt-0.5 max-w-[24ch] truncate text-xs leading-4 text-[var(--muted)]">
          {link.description}
        </p>
      </div>

      <motion.div
        className="absolute right-2 top-2 z-10 text-[var(--muted)] group-hover:opacity-80 md:static md:ml-auto md:flex-none"
        initial={{ x: 0, opacity: 0.55 }}
        whileHover={{ x: 2, opacity: 1 }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </motion.div>
    </motion.a>
  );
}
