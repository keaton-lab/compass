'use client';

import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Grid, 
  List, 
  Play, 
  Pause,
  LucideIcon
} from 'lucide-react';
import type { Settings } from '../types';

interface SettingsToggleProps {
  settings: Settings;
  onSettingsChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

interface ToggleOption<T> {
  value: T;
  label: string;
  icon: LucideIcon;
  activeColor: string;
}

export default function SettingsToggle({ settings, onSettingsChange }: SettingsToggleProps) {
  const themeOptions: ToggleOption<'dark' | 'light'>[] = [
    { value: 'dark', label: 'Dark', icon: Moon, activeColor: '#3b82f6' },
    { value: 'light', label: 'Light', icon: Sun, activeColor: '#f59e0b' },
  ];

  const layoutOptions: ToggleOption<'grid' | 'list'>[] = [
    { value: 'grid', label: 'Grid', icon: Grid, activeColor: '#10b981' },
    { value: 'list', label: 'List', icon: List, activeColor: '#8b5cf6' },
  ];

  const animationOptions: ToggleOption<boolean>[] = [
    { value: true, label: 'On', icon: Play, activeColor: '#06b6d4' },
    { value: false, label: 'Off', icon: Pause, activeColor: '#6b7280' },
  ];

  const handleToggle = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onSettingsChange(key, value);
  };

  return (
    <motion.div
      className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <h3 className="text-white font-semibold text-lg mb-4">Settings</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-gray-400 text-sm font-medium mb-3">Theme</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            {themeOptions.map((option) => {
              const isActive = settings.theme === option.value;
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle('theme', option.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${isActive 
                    ? 'border-white/20 bg-white/10' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon 
                    size={18} 
                    className={isActive ? 'text-white' : 'text-gray-400'} 
                  />
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-gray-400 text-sm font-medium mb-3">Layout</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            {layoutOptions.map((option) => {
              const isActive = settings.layout === option.value;
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle('layout', option.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${isActive 
                    ? 'border-white/20 bg-white/10' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon 
                    size={18} 
                    className={isActive ? 'text-white' : 'text-gray-400'} 
                  />
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-gray-400 text-sm font-medium mb-3">Animations</h4>
          <div className="flex gap-2">
            {animationOptions.map((option) => {
              const isActive = settings.animations === option.value;
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.value ? 'on' : 'off'}
                  type="button"
                  onClick={() => handleToggle('animations', option.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${isActive 
                    ? 'border-white/20 bg-white/10' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon 
                    size={18} 
                    className={isActive ? 'text-white' : 'text-gray-400'} 
                  />
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}