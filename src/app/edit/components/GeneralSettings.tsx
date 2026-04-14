'use client';

import { useState } from 'react';
import { User, Palette } from 'lucide-react';
import type { Config } from '../../types';
import { themePresets } from '../../themes';
import { validateRequired } from '../utils/validators';
import DynamicIcon from '../../components/DynamicIcon';
import LazyIconPicker from './LazyIconPicker';
import AppSelect from '../../components/AppSelect';
import AppSwitchRow from '../../components/AppSwitchRow';

interface GeneralSettingsProps {
  profile: Config['profile'];
  settings: Config['settings'];
  onProfileChange: (field: keyof Config['profile'], value: string) => void;
  onSettingsChange: (field: keyof Config['settings'], value: boolean | string) => void;
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
              <AppSelect
                value={settings.theme}
                onChange={(value) => onSettingsChange('theme', value)}
                options={themePresets.map((theme) => ({ value: theme.id, label: theme.label }))}
                triggerClassName="text-[length:var(--edit-input-size)] leading-[var(--edit-input-line-height)]"
                itemClassName="text-[length:var(--edit-input-size)] leading-[var(--edit-input-line-height)]"
              />
            </div>

            {/* 布局 */}
            <div>
              <label className="edit-field-label">
                布局
              </label>
              <AppSelect
                value={settings.layout}
                onChange={(value) => onSettingsChange('layout', value)}
                options={[
                  { value: 'grid', label: '网格' },
                  { value: 'list', label: '列表' },
                ]}
                triggerClassName="text-[length:var(--edit-input-size)] leading-[var(--edit-input-line-height)]"
                itemClassName="text-[length:var(--edit-input-size)] leading-[var(--edit-input-line-height)]"
              />
            </div>
          </div>

          {/* 开关选项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AppSwitchRow
              checked={settings.showSearch}
              onCheckedChange={(v) => onSettingsChange('showSearch', v)}
              label="显示搜索"
              labelClassName="text-[length:var(--edit-input-size)] leading-[var(--edit-input-line-height)]"
            />
            <AppSwitchRow
              checked={settings.animations}
              onCheckedChange={(v) => onSettingsChange('animations', v)}
              label="启用动画"
              labelClassName="text-[length:var(--edit-input-size)] leading-[var(--edit-input-line-height)]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
