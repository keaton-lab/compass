'use client';

import { useState } from 'react';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { Link as LinkType } from '../../types';
import IconPicker from './IconPicker';
import DynamicIcon from './DynamicIcon';
import { validateLinkName, validateLinkUrl } from '../utils/validators';

interface LinkEditorProps {
  link: LinkType;
  onUpdate: (field: keyof LinkType, value: string) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export default function LinkEditor({
  link,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: LinkEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const nameError = validateLinkName(link.name);
  const urlError = validateLinkUrl(link.url);

  return (
    <>
      <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--background)]/50 border border-[var(--panel-border)] hover:border-[var(--panel-border)]/80 transition-colors">
        {/* Order buttons */}
        <div className="flex flex-col gap-0.5 mt-1">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="上移"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="下移"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          {/* Name + URL row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                value={link.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border focus:outline-none focus:ring-2 transition-colors text-[var(--foreground)] ${
                  nameError ? 'border-red-500/50 focus:ring-red-500/30' : 'border-[var(--panel-border)] focus:ring-[var(--accent)]/30'
                }`}
                placeholder="链接名称"
              />
              {nameError && <p className="mt-0.5 text-xs text-red-400">{nameError}</p>}
            </div>
            <div>
              <input
                type="text"
                value={link.url}
                onChange={(e) => onUpdate('url', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border focus:outline-none focus:ring-2 transition-colors text-[var(--foreground)] ${
                  urlError ? 'border-red-500/50 focus:ring-red-500/30' : 'border-[var(--panel-border)] focus:ring-[var(--accent)]/30'
                }`}
                placeholder="https://..."
              />
              {urlError && <p className="mt-0.5 text-xs text-red-400">{urlError}</p>}
            </div>
          </div>

          {/* Icon + Description row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[var(--muted)]/10 hover:bg-[var(--muted)]/20 border border-[var(--panel-border)] transition-colors text-[var(--foreground)]"
              title="点击更换图标"
            >
              <DynamicIcon name={link.icon} size={18} />
              <span className="max-w-[100px] truncate text-xs">{link.icon}</span>
            </button>
            <input
              type="text"
              value={link.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--panel-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 text-[var(--foreground)] placeholder:text-[var(--muted)]"
              placeholder="描述（可选）"
            />
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              title="删除链接"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showIconPicker && (
        <IconPicker
          value={link.icon}
          onChange={(icon) => onUpdate('icon', icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}
