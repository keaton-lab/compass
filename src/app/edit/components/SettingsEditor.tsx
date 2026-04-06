'use client';

import type { Settings } from '../../types';
import { themePresets } from '../../themes';

interface SettingsEditorProps {
  settings: Settings;
  onChange: (field: keyof Settings, value: boolean | string) => void;
}

export default function SettingsEditor({ settings, onChange }: SettingsEditorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">主题</label>
        <select
          value={settings.theme}
          onChange={(e) => onChange('theme', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 text-[var(--foreground)]"
        >
          {themePresets.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      {/* Layout */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">布局</label>
        <select
          value={settings.layout}
          onChange={(e) => onChange('layout', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 text-[var(--foreground)]"
        >
          <option value="grid">网格</option>
          <option value="list">列表</option>
        </select>
      </div>

      {/* Show Search */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={settings.showSearch}
            onChange={(e) => onChange('showSearch', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 rounded-full bg-[var(--muted)]/20 peer-checked:bg-[var(--accent)]/60 transition-colors" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--foreground)] peer-checked:translate-x-4 transition-transform" />
        </div>
        <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">显示搜索</span>
      </label>

      {/* Animations */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={settings.animations}
            onChange={(e) => onChange('animations', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 rounded-full bg-[var(--muted)]/20 peer-checked:bg-[var(--accent)]/60 transition-colors" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--foreground)] peer-checked:translate-x-4 transition-transform" />
        </div>
        <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">启用动画</span>
      </label>
    </div>
  );
}
