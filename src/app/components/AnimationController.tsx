'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import type { ReactNode } from 'react';

import type { Transition } from 'framer-motion';

interface AnimatedWrapperProps {
  children: ReactNode;
  initial?: Parameters<typeof motion.div>[0]['initial'];
  animate?: Parameters<typeof motion.div>[0]['animate'];
  exit?: Parameters<typeof motion.div>[0]['exit'];
  transition?: Transition;
  className?: string;
}

export default function AnimationController({ 
  children, 
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  exit = { opacity: 0 },
  transition = { duration: 0.3 },
  className 
}: AnimatedWrapperProps) {
  const { animations } = useSettings();
  
  if (!animations) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        className={className}
        key="animation-controller"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
