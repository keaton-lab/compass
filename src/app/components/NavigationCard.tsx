'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import type { Link as LinkType } from '../types';

interface NavigationCardProps {
  link: LinkType;
  color: string;
}

export default function NavigationCard({ link, color }: NavigationCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    if (glow) {
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, ${color}33 0%, transparent 56%)`;
      glow.style.opacity = '1';
    }
  }, [color]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;
    card.style.transition = 'transform 0.4s ease';
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    setTimeout(() => {
      if (card) card.style.transition = '';
    }, 400);
    if (glow) {
      glow.style.opacity = '0';
    }
  }, []);

  return (
    <motion.a
      ref={cardRef}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="liquid-glass group relative flex min-h-[88px] flex-col overflow-hidden rounded-[16px] p-3 cursor-pointer md:min-h-[80px] md:flex-row md:items-center md:gap-2.5 md:rounded-[18px] md:p-3.5"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >      {/* Glow effect */}
      <div
        ref={glowRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${color}26 0%, transparent 56%)`
        }}
      />

      {/* Icon */}
      <div className="relative z-10 flex items-start justify-between gap-2 md:flex-none">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg border md:h-11 md:w-11"
          style={{
            backgroundColor: `${color}18`,
            borderColor: `${color}40`
          }}
        >
          <Icon
            name={link.icon}
            size={20}
            color={color}
            className="transition-transform group-hover:scale-110"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-2 min-w-0 flex-1 md:mt-0">
        <h3 className="truncate text-[15px] font-medium text-[var(--text-primary)] group-hover:opacity-80 md:text-[15px]">
          {link.name}
        </h3>
        <p className="mt-0.5 max-w-[24ch] truncate text-xs leading-4 text-[var(--muted)]">
          {link.description}
        </p>
      </div>

      {/* Arrow */}
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