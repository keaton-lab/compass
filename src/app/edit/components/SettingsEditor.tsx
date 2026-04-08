'use client';

import { Select, Switch } from 'radix-ui';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
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
    <label className="flex cursor-pointer items-center justify-between rounded-[18px] border bg-[var(--background)] px-4 py-3.5 transition-colors" style={{ borderColor: 'var(--panel-border)' }}>
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        className="relative h-6 w-11 rounded-[999px] border bg-[var(--bg-secondary)] outline-none transition-colors data-[state=checked]:bg-[var(--accent)]"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]" />
      </Switch.Root>
    </label>
  );
}

function FlatSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className="flex w-full items-center justify-between rounded-[18px] border bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[18px] border bg-[var(--panel-strong)] p-1"
          style={{ borderColor: 'var(--panel-border)' }}
        >
          <Select.ScrollUpButton className="flex h-7 items-center justify-center text-[var(--muted)]">
            <ChevronUp className="h-4 w-4" />
          </Select.ScrollUpButton>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer items-center rounded-[14px] px-9 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors data-[highlighted]:bg-[var(--bg-secondary)]"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-3 inline-flex items-center">
                  <Check className="h-4 w-4 text-[var(--accent)]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-7 items-center justify-center text-[var(--muted)]">
            <ChevronDown className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default function SettingsEditor({ settings, onChange }: SettingsEditorProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">主题</label>
          <FlatSelect
            value={settings.theme}
            onChange={(value) => onChange('theme', value)}
            options={themePresets.map((theme) => ({ value: theme.id, label: theme.label }))}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">布局</label>
          <FlatSelect
            value={settings.layout}
            onChange={(value) => onChange('layout', value)}
            options={[
              { value: 'grid', label: '网格' },
              { value: 'list', label: '列表' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
