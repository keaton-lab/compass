'use client';

import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function ThemeToggle() {
  const { theme, availableThemes, setTheme } = useSettings();

  return (
    <motion.div
      className="fixed right-4 top-4 z-50 hidden md:block"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="glass-panel flex items-center gap-2 rounded-full px-2 py-2">
        <div className="flex items-center gap-2 px-2 text-[var(--muted)]">
          <Palette size={16} />
          <span className="text-xs font-medium">Theme</span>
        </div>

        <div className="flex items-center gap-1">
          {availableThemes.map((option) => {
            const isActive = option.id === theme;

            return (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                  ? 'border-sky-400/40 bg-sky-500/15 text-slate-950 dark:text-white'
                  : 'border-black/5 bg-white/40 text-[var(--muted)] hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && <Check size={14} />}
                <span>{option.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
