'use client';

import { Accordion } from 'radix-ui';
import { useState } from 'react';
import { ChevronDown, Plus, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';
import type { Category } from '../../types';
import LinkEditor from './LinkEditor';
import LazyIconPicker from './LazyIconPicker';
import Icon from '../../components/Icon';
import ColorPicker from './ColorPicker';
import DeleteConfirmButton from './DeleteConfirmButton';
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
}: CategoryEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const nameError = validateCategoryName(category.name);

  return (
    <>
      <Accordion.Item value={category.id} className="overflow-hidden rounded-[20px] border bg-[var(--panel-strong)]" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="h-1.5 w-full" style={{ backgroundColor: category.color }} />

        <div className="p-4">
          <div className="mb-3 flex items-start gap-2">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="rounded-[10px] p-1 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
                title="上移分类"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="rounded-[10px] p-1 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
                title="下移分类"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>

            <Accordion.Header className="shrink-0">
              <Accordion.Trigger className="accordion-trigger flex h-10 w-10 items-center justify-center rounded-[14px] border bg-[var(--background)] text-[var(--muted)] outline-none transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]" style={{ borderColor: 'var(--panel-border)' }}>
                <ChevronDown className="accordion-chevron h-4 w-4 transition-transform duration-200" />
              </Accordion.Trigger>
            </Accordion.Header>

            <div className="flex-1">
              <input
                type="text"
                value={category.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className={`w-full rounded-[18px] border bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--foreground)] outline-none transition-colors ${
                  nameError ? 'border-red-500/50' : ''
                }`}
                style={{ borderColor: nameError ? undefined : 'var(--panel-border)' }}
                placeholder="分类名称"
              />
              {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
            </div>

            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-2 rounded-[16px] border bg-[var(--background)] px-3 py-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ borderColor: 'var(--panel-border)' }}
              title="点击更换图标"
            >
              <Icon name={category.icon} size={18} />
              <span className="max-w-[80px] truncate text-xs">{category.icon}</span>
            </button>

            <ColorPicker value={category.color} onChange={(color) => onUpdate('color', color)} />

            <DeleteConfirmButton
              title="删除这个分类？"
              description={`“${category.name || '未命名分类'}” 下的 ${category.links.length} 个链接也会一起删除。这个操作不能撤销。`}
              confirmLabel="删除分类"
              triggerTitle="删除分类"
              onConfirm={onDelete}
            />
          </div>

          {collapsed && (
            <p className="pl-6 text-xs text-[var(--muted)]">
              {category.links.length} 个链接
            </p>
          )}

          <Accordion.Content className="overflow-hidden">
            <div className="ml-2 space-y-3 border-l border-[var(--panel-border)]/70 pl-6 pt-1">
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

              <button
                type="button"
                onClick={onAddLink}
                className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
                style={{ borderColor: 'var(--panel-border)' }}
              >
                <Plus className="h-4 w-4" />
                添加链接
              </button>
            </div>
          </Accordion.Content>
        </div>
      </Accordion.Item>

      {showIconPicker && (
        <LazyIconPicker
          value={category.icon}
          onChange={(icon) => onUpdate('icon', icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}
