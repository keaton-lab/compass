'use client';

import type { Settings } from '../../types';
import { themePresets } from '../../themes';

interface SettingsEditorProps {
  settings: Settings;
  onChange: (field: keyof Settings, value: boolean | string) => void;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] border border-[var(--panel-border)] cursor-pointer hover:border-[var(--accent)]/30 transition-colors group">
      <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">{label}</span>
      <div className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 rounded-full bg-[var(--muted)]/30 peer-checked:bg-[var(--accent)] transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm peer-checked:translate-x-5 transition-transform" />
      </div>
    </label>
  );
}

export default function SettingsEditor({ settings, onChange }: SettingsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Toggle
          checked={settings.showSearch}
          onChange={(v) => onChange('showSearch', v)}
          label="显示搜索"
        />
        <Toggle
          checked={settings.animations}
          onChange={(v) => onChange('animations', v)}
          label="启用动画"
        />
      </div>
    </div>
  );
}
