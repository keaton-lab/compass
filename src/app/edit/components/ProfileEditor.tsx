'use client';

import type { Profile } from '../../types';
import { validateRequired, validateUrl } from '../utils/validators';

interface ProfileEditorProps {
  profile: Profile;
  onChange: (field: keyof Profile, value: string) => void;
}

export default function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const nameError = validateRequired(profile.name, '名称');
  const descError = validateRequired(profile.description, '描述');
  const repoError = profile.repo ? validateUrl(profile.repo) : null;

  const fields = [
    { key: 'name' as const, label: '名称', value: profile.name, error: nameError, type: 'text' as const },
    { key: 'description' as const, label: '描述', value: profile.description, error: descError, type: 'text' as const },
    { key: 'bio' as const, label: '简介', value: profile.bio || '', error: null, type: 'text' as const },
    { key: 'repo' as const, label: '仓库链接', value: profile.repo || '', error: repoError, type: 'text' as const },
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
            className={`w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border focus:outline-none focus:ring-2 transition-colors text-[var(--foreground)] ${
              error
                ? 'border-red-500/50 focus:ring-red-500/30'
                : 'border-[var(--panel-border)] focus:ring-[var(--accent)]/30'
            }`}
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
