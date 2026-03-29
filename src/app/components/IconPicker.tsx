'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const BrandIcon = dynamic(() => import('./IconPickerBrand'), { ssr: false });

const BRAND_ICONS = [
  'github', 'vercel', 'figma', 'notion', 'docker', 'npm', 'aws',
  'google', 'microsoft', 'facebook', 'twitter', 'instagram', 'linkedin',
  'youtube', 'reddit', 'discord', 'slack', 'zoom', 'stripe', 'paypal',
  'apple', 'android', 'linux', 'windows', 'macos', 'chrome', 'firefox',
  'safari', 'edge', 'vscode', 'jetbrains', 'gitlab', 'bitbucket',
  'jira', 'confluence', 'trello', 'asana', 'airtable',
  'zapier', 'hubspot', 'salesforce', 'shopify', 'wordpress', 'ghost',
  'medium', 'dev', 'stackoverflow', 'codepen', 'codesandbox', 'replit',
  'mongodb', 'postgresql', 'redis', 'elasticsearch', 'kubernetes',
  'terraform', 'ansible', 'jenkins', 'circleci', 'travisci',
  'heroku', 'digitalocean', 'cloudflare', 'netlify', 'supabase',
  'nextdotjs', 'react', 'vue', 'angular', 'svelte', 'nuxt',
  'tailwind', 'bootstrap', 'materialui', 'framer',
  'javascript', 'typescript', 'python', 'rust', 'go', 'java',
  'php', 'ruby', 'swift', 'kotlin', 'c', 'cpp',
  'vite', 'webpack', 'esbuild', 'rollup', 'babel',
  'eslint', 'prettier', 'yarn', 'pnpm', 'bun'
];

const LUCIDE_ICONS: Record<string, string[]> = {
  'Communication': ['mail', 'message-square', 'message-circle', 'phone', 'at-sign', 'send', 'inbox', 'paperplane'],
  'Navigation': ['home', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'menu', 'grid', 'list', 'more-horizontal', 'more-vertical'],
  'Actions': ['plus', 'minus', 'check', 'x', 'close', 'copy', 'edit', 'pencil', 'trash', 'archive', 'download', 'upload', 'save', 'share', 'link', 'external-link'],
  'Files': ['file', 'file-text', 'file-plus', 'folder', 'folder-plus', 'folder-open', 'image', 'bookmark', 'document'],
  'Development': ['code', 'code-2', 'terminal', 'bug', 'wrench', 'hammer', 'settings', 'cog', 'package', 'box', 'container'],
  'Media': ['play', 'pause', 'skip-back', 'skip-forward', 'volume', 'mic', 'mic-off', 'camera', 'image'],
  'Social': ['users', 'user', 'user-plus', 'heart', 'thumbs-up', 'thumbs-down', 'star', 'award', 'gift', 'smile'],
  'Security': ['shield', 'shield-check', 'lock', 'lock-open', 'key', 'eye', 'eye-off', 'ban', 'alert-triangle'],
  'Time': ['calendar', 'clock', 'timer', 'watch', 'calendar-plus', 'sunrise', 'sunset', 'moon', 'cloud', 'cloud-lightning'],
  'Weather': ['cloud', 'cloud-drizzle', 'cloud-lightning', 'cloud-rain', 'cloud-snow', 'sun', 'moon', 'zap', 'thermometer', 'wind'],
  'Finance': ['dollar-sign', 'euro', 'pound-sign', 'yen', 'bitcoin', 'credit-card', 'wallet', 'banknote'],
  'Location': ['map', 'map-pin', 'pin', 'navigation', 'compass', 'globe', 'earth', 'location'],
  'Objects': ['box', 'briefcase', 'shopping-cart', 'tag', 'tags', 'gift', 'lightbulb', 'tool', 'scissors', 'ruler', 'calculator', 'battery', 'cpu', 'mouse', 'keyboard', 'monitor', 'printer'],
  'UI': ['search', 'zoom-in', 'zoom-out', 'maximize', 'minimize', 'fullscreen', 'layout', 'sidebar', 'panel-left', 'focus', 'cursor']
};

const ALL_LUCIDE = Object.values(LUCIDE_ICONS).flat();

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  trigger?: React.ReactNode;
}

export default function IconPicker({ value, onChange, trigger }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'lucide' | 'brands'>('lucide');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredBrands = useMemo(() => {
    if (!search) return BRAND_ICONS;
    return BRAND_ICONS.filter(icon => icon.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const filteredLucide = useMemo((): string[] => {
    if (!search && !selectedCategory) {
      return ALL_LUCIDE;
    }
    if (!search && selectedCategory) {
      const cats: Record<string, string[]> = LUCIDE_ICONS;
      return cats[selectedCategory] || [];
    }
    return ALL_LUCIDE.filter(icon => icon.toLowerCase().includes(search.toLowerCase()));
  }, [search, selectedCategory]);

  const handleSelect = useCallback((iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  const categories = Object.keys(LUCIDE_ICONS);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <button
            type="button"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-colors flex items-center gap-2"
          >
            <span className="w-5 h-5 flex items-center justify-center text-sm">{value || '?'}</span>
            <span>Select Icon</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[90vw] max-w-2xl max-h-[80vh] bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Select Icon</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                
                <div className="relative mb-4">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search icons..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setActiveTab('lucide'); setSelectedCategory(null); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'lucide' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    Lucide
                  </button>
                  <button
                    onClick={() => { setActiveTab('brands'); setSelectedCategory(null); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'brands' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    Brands
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'lucide' && !search && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          selectedCategory === cat
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-8 gap-2">
                  {activeTab === 'brands' ? (
                    filteredBrands.map((icon: string) => (
                      <button
                        key={icon}
                        onClick={() => handleSelect(icon)}
                        className={`aspect-square flex items-center justify-center rounded-lg transition-all hover:bg-white/10 ${
                          value === icon ? 'bg-blue-500/20 border border-blue-500/50' : ''
                        }`}
                        title={icon}
                      >
                        <BrandIcon name={icon} size={20} />
                      </button>
                    ))
                  ) : (
                    filteredLucide.map((icon: string) => (
                      <button
                        key={icon}
                        onClick={() => handleSelect(icon)}
                        className={`aspect-square flex items-center justify-center rounded-lg transition-all hover:bg-white/10 ${
                          value === icon ? 'bg-blue-500/20 border border-blue-500/50' : ''
                        }`}
                        title={icon}
                      >
                        <span className="text-white/70 text-xs">{icon.slice(0, 3)}</span>
                      </button>
                    ))
                  )}
                </div>

                {((activeTab === 'brands' && filteredBrands.length === 0) || 
                  (activeTab === 'lucide' && filteredLucide.length === 0)) && (
                  <div className="text-center py-8 text-gray-400">
                    No icons found
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
