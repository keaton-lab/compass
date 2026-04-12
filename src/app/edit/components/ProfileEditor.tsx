'use client';

import type { Profile } from '../../types';
import { validateRequired } from '../utils/validators';

interface ProfileEditorProps {
  profile: Profile;
  onChange: (field: keyof Profile, value: string) => void;
}

export default function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const nameError = validateRequired(profile.name, '名称');
  const descError = validateRequired(profile.description, '描述');

  const fields = [
    { key: 'name' as const, label: '名称', value: profile.name, error: nameError, type: 'text' as const },
    { key: 'description' as const, label: '描述', value: profile.description, error: descError, type: 'text' as const },
    { key: 'bio' as const, label: '简介', value: profile.bio || '', error: null, type: 'text' as const },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ key, label, value, error, type }) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            className={`w-full rounded-[18px] border bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors ${
              error ? 'border-red-500/50' : ''
            }`}
            style={{ borderColor: error ? undefined : 'var(--panel-border)' }}
            placeholder={label}
          />
          {error && (
            <p className="mt-1 text-xs text-red-400">{error}</p>
          )}
        </div>
      ))}
    </div>
  );
}
