'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Link as LinkType } from '../../types';
import LazyIconPicker from './LazyIconPicker';
import DynamicIcon from '../../components/DynamicIcon';
import DeleteConfirmButton from './DeleteConfirmButton';
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
      <div className="flex items-start gap-2 rounded-[18px] border bg-[var(--background)] px-3 py-3 transition-colors" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="flex flex-col gap-0.5 mt-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="rounded-[10px] p-1 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
            title="上移"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="rounded-[10px] p-1 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
            title="下移"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                value={link.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className={`w-full rounded-[16px] border bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors ${
                  nameError ? 'border-red-500/50' : ''
                }`}
                style={{ borderColor: nameError ? undefined : 'var(--panel-border)' }}
                placeholder="链接名称"
              />
              {nameError && <p className="mt-0.5 text-xs text-red-400">{nameError}</p>}
            </div>
            <div>
              <input
                type="text"
                value={link.url}
                onChange={(e) => onUpdate('url', e.target.value)}
                className={`w-full rounded-[16px] border bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors ${
                  urlError ? 'border-red-500/50' : ''
                }`}
                style={{ borderColor: urlError ? undefined : 'var(--panel-border)' }}
                placeholder="https://..."
              />
              {urlError && <p className="mt-0.5 text-xs text-red-400">{urlError}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-2 rounded-[16px] border bg-[var(--panel-strong)] px-3 py-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ borderColor: 'var(--panel-border)' }}
              title="点击更换图标"
            >
              <DynamicIcon name={link.icon} size={18} />
              <span className="max-w-[100px] truncate text-xs">{link.icon}</span>
            </button>
            <input
              type="text"
              value={link.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              className="flex-1 rounded-[16px] border bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]"
              style={{ borderColor: 'var(--panel-border)' }}
              placeholder="描述（可选）"
            />
            <DeleteConfirmButton
              title="删除这个链接？"
              description={`“${link.name || '未命名链接'}” 将从当前分类中移除。这个操作不能撤销。`}
              confirmLabel="删除链接"
              triggerTitle="删除链接"
              onConfirm={onDelete}
            />
          </div>
        </div>
      </div>

      {showIconPicker && (
        <LazyIconPicker
          value={link.icon}
          onChange={(icon) => onUpdate('icon', icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}
