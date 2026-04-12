'use client';

import { useState } from 'react';
import { User, Palette } from 'lucide-react';
import type { Config } from '../../types';
import { themePresets } from '../../themes';
import { Select, Switch } from 'radix-ui';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { validateRequired } from '../utils/validators';
import DynamicIcon from '../../components/DynamicIcon';
import LazyIconPicker from './LazyIconPicker';

interface GeneralSettingsProps {
  profile: Config['profile'];
  settings: Config['settings'];
  onProfileChange: (field: keyof Config['profile'], value: string) => void;
  onSettingsChange: (field: keyof Config['settings'], value: boolean | string) => void;
}

// 扁平开关组件
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
      <span className="text-[length:var(--edit-input-size)] font-medium leading-[var(--edit-input-line-height)] text-[var(--foreground)]">{label}</span>
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

// 扁平选择器组件
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
        className="flex w-full items-center justify-between rounded-[18px] border bg-[var(--background)] px-4 py-3 text-[length:var(--edit-input-size)] leading-[var(--edit-input-line-height)] text-[var(--foreground)] outline-none transition-colors"
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
                className="relative flex cursor-pointer items-center rounded-[14px] px-9 py-2.5 text-[length:var(--edit-input-size)] leading-[var(--edit-input-line-height)] text-[var(--foreground)] outline-none transition-colors data-[highlighted]:bg-[var(--bg-secondary)]"
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

export default function GeneralSettings({
  profile,
  settings,
  onProfileChange,
  onSettingsChange,
}: GeneralSettingsProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const nameError = validateRequired(profile.name, '名称');
  const descError = validateRequired(profile.description, '描述');

  // 获取当前头像图标名称，默认为 Compass
  const avatarIcon = profile.avatar || 'Compass';

  return (
    <div className="edit-section-stack">
      {/* 站点信息卡片 */}
      <section className="edit-panel">
        <div className="edit-panel-header">
          <h2 className="edit-panel-title flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--accent)]" />
            站点信息
          </h2>
        </div>
        <div className="edit-panel-body space-y-4">
          {/* Logo 和 名称 */}
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <div>
              <label className="edit-field-label">
                Logo
              </label>
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="flex h-10 w-10 items-center justify-center rounded-[14px] border bg-[var(--background)] text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: 'var(--panel-border)' }}
                title="更换 Logo"
              >
                <DynamicIcon name={avatarIcon} size={22} />
              </button>
            </div>
            <div>
              <label className="edit-field-label">
                名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onProfileChange('name', e.target.value)}
                className={`edit-field-input ${
                  nameError ? 'border-red-500/50' : ''
                }`}
                style={{ borderColor: nameError ? undefined : 'var(--panel-border)' }}
                placeholder="站点名称"
              />
              {nameError && (
                <p className="edit-helper-text mt-1 text-red-400">{nameError}</p>
              )}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="edit-field-label">
              描述 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={profile.description}
              onChange={(e) => onProfileChange('description', e.target.value)}
              className={`edit-field-input ${
                descError ? 'border-red-500/50' : ''
              }`}
              style={{ borderColor: descError ? undefined : 'var(--panel-border)' }}
              placeholder="站点描述"
            />
            {descError && (
              <p className="edit-helper-text mt-1 text-red-400">{descError}</p>
            )}
          </div>

          {/* 简介 */}
          <div>
            <label className="edit-field-label">
              简介 <span className="text-[var(--muted)]">（可选）</span>
            </label>
            <input
              type="text"
              value={profile.bio || ''}
              onChange={(e) => onProfileChange('bio', e.target.value)}
              className="edit-field-input"
              style={{ borderColor: 'var(--panel-border)' }}
              placeholder="一句简短的自我介绍"
            />
          </div>
        </div>
      </section>

      {showIconPicker && (
        <LazyIconPicker
          value={avatarIcon}
          onChange={(icon) => onProfileChange('avatar', icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}

      {/* 外观设置卡片 */}
      <section className="edit-panel">
        <div className="edit-panel-header">
          <h2 className="edit-panel-title flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--accent)]" />
            外观设置
          </h2>
        </div>
        <div className="edit-panel-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 主题 */}
            <div>
              <label className="edit-field-label">
                主题
              </label>
              <FlatSelect
                value={settings.theme}
                onChange={(value) => onSettingsChange('theme', value)}
                options={themePresets.map((theme) => ({ value: theme.id, label: theme.label }))}
              />
            </div>

            {/* 布局 */}
            <div>
              <label className="edit-field-label">
                布局
              </label>
              <FlatSelect
                value={settings.layout}
                onChange={(value) => onSettingsChange('layout', value)}
                options={[
                  { value: 'grid', label: '网格' },
                  { value: 'list', label: '列表' },
                ]}
              />
            </div>
          </div>

          {/* 开关选项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Toggle
              checked={settings.showSearch}
              onChange={(v) => onSettingsChange('showSearch', v)}
              label="显示搜索"
            />
            <Toggle
              checked={settings.animations}
              onChange={(v) => onSettingsChange('animations', v)}
              label="启用动画"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
