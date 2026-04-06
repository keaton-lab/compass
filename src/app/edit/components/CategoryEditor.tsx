'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';
import type { Category } from '../../types';
import LinkEditor from './LinkEditor';
import IconPicker from './IconPicker';
import DynamicIcon from './DynamicIcon';
import ColorPicker from './ColorPicker';
import { validateCategoryName } from '../utils/validators';

interface CategoryEditorProps {
  category: Category;
  collapsed: boolean;
  onUpdate: (field: keyof Category, value: string) => void;
  onDelete: () => void;
  onUpdateLink: (linkIndex: number, field: keyof Category['links'][number], value: string) => void;
  onAddLink: () => void;
  onDeleteLink: (linkIndex: number) => void;
  onMoveLinkUp?: (linkIndex: number) => void;
  onMoveLinkDown?: (linkIndex: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onToggleCollapse: () => void;
}

export default function CategoryEditor({
  category,
  collapsed,
  onUpdate,
  onDelete,
  onUpdateLink,
  onAddLink,
  onDeleteLink,
  onMoveLinkUp,
  onMoveLinkDown,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onToggleCollapse,
}: CategoryEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const nameError = validateCategoryName(category.name);

  return (
    <>
      <div className="rounded-xl border border-[var(--panel-border)] overflow-hidden transition-colors bg-[var(--panel)]/20">
        {/* Category header bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: category.color }} />

        <div className="p-4">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-3">
            {/* Order buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="上移分类"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="下移分类"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onToggleCollapse}
              className="p-1 rounded hover:bg-[var(--muted)]/10 transition-colors text-[var(--muted)]"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="flex-1">
              <input
                type="text"
                value={category.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className={`w-full px-3 py-2 text-sm font-medium rounded-lg bg-[var(--background)] border focus:outline-none focus:ring-2 transition-colors text-[var(--foreground)] ${
                  nameError ? 'border-red-500/50 focus:ring-red-500/30' : 'border-[var(--panel-border)] focus:ring-[var(--accent)]/30'
                }`}
                placeholder="分类名称"
              />
              {nameError && <p className="mt-0.5 text-xs text-red-400">{nameError}</p>}
            </div>

            {/* Icon button */}
            <button
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[var(--muted)]/10 hover:bg-[var(--muted)]/20 border border-[var(--panel-border)] transition-colors text-[var(--foreground)]"
              title="点击更换图标"
            >
              <DynamicIcon name={category.icon} size={18} />
              <span className="max-w-[80px] truncate text-xs">{category.icon}</span>
            </button>

            {/* Color picker */}
            <ColorPicker value={category.color} onChange={(color) => onUpdate('color', color)} />

            {/* Delete */}
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              title="删除分类"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Links list */}
          {!collapsed && (
            <div className="space-y-2 pl-6 border-l-2 border-[var(--panel-border)]/50 ml-2">
              {category.links.map((link, linkIndex) => (
                <LinkEditor
                  key={link.id}
                  link={link}
                  onUpdate={(field, value) => onUpdateLink(linkIndex, field, value)}
                  onDelete={() => onDeleteLink(linkIndex)}
                  onMoveUp={onMoveLinkUp ? () => onMoveLinkUp(linkIndex) : undefined}
                  onMoveDown={onMoveLinkDown ? () => onMoveLinkDown(linkIndex) : undefined}
                  canMoveUp={linkIndex > 0}
                  canMoveDown={linkIndex < category.links.length - 1}
                />
              ))}

              {/* Add link button */}
              <button
                onClick={onAddLink}
                className="w-full py-3 rounded-lg border border-dashed border-[var(--panel-border)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all text-sm flex items-center justify-center gap-2 text-[var(--muted)]"
              >
                <Plus className="w-4 h-4" />
                添加链接
              </button>
            </div>
          )}

          {/* Link count when collapsed */}
          {collapsed && (
            <p className="text-xs text-[var(--muted)] pl-6">
              {category.links.length} 个链接
            </p>
          )}
        </div>
      </div>

      {showIconPicker && (
        <IconPicker
          value={category.icon}
          onChange={(icon) => onUpdate('icon', icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}
