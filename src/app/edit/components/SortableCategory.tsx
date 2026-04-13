'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import type { Category } from '../../types';
import LinkEditor from './LinkEditor';
import LazyIconPicker from './LazyIconPicker';
import DynamicIcon from '../../components/DynamicIcon';
import ColorPicker from './ColorPicker';
import DeleteConfirmButton from './DeleteConfirmButton';
import { validateCategoryName } from '../utils/validators';

interface SortableCategoryProps {
  category: Category;
  onUpdate: (field: keyof Category, value: string) => void;
  onDelete: () => void;
  onUpdateLink: (linkIndex: number, field: keyof Category['links'][number], value: string) => void;
  onAddLink: () => void;
  onDeleteLink: (linkIndex: number) => void;
  onMoveLinkUp?: (linkIndex: number) => void;
  onMoveLinkDown?: (linkIndex: number) => void;
}

export default function SortableCategory({
  category,
  onUpdate,
  onDelete,
  onUpdateLink,
  onAddLink,
  onDeleteLink,
  onMoveLinkUp,
  onMoveLinkDown,
}: SortableCategoryProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const nameError = validateCategoryName(category.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className={`rounded-[20px] border bg-[var(--panel-strong)] overflow-hidden ${
          isDragging ? 'shadow-lg ring-2 ring-[var(--accent)]' : ''
        }`}
        style={{ borderColor: 'var(--panel-border)', ...dndStyle }}
      >
        {/* 分类颜色条 */}
        <div className="h-1.5 w-full" style={{ backgroundColor: category.color }} />

        <div className="p-4">
          {/* 分类头部 */}
          <div className="flex items-center gap-3">
            {/* 拖拽手柄 */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="flex h-10 w-6 cursor-grab items-center justify-center rounded-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] active:cursor-grabbing"
              title="拖动排序"
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* 图标选择 */}
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="flex h-10 w-10 items-center justify-center rounded-[14px] border bg-[var(--background)] text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ borderColor: 'var(--panel-border)' }}
              title="更换图标"
            >
              <DynamicIcon name={category.icon} size={20} />
            </button>

            {/* 名称输入 */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={category.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className={`w-full rounded-[14px] border bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] outline-none transition-colors ${
                  nameError ? 'border-red-500/50' : ''
                }`}
                style={{ borderColor: nameError ? undefined : 'var(--panel-border)' }}
                placeholder="分类名称"
              />
              {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
            </div>

            {/* 颜色选择器 */}
            <ColorPicker value={category.color} onChange={(color) => onUpdate('color', color)} />

            {/* 链接数量 */}
            <span className="hidden sm:inline-flex items-center rounded-[12px] bg-[var(--background)] px-2.5 py-1 text-xs text-[var(--muted)]">
              {category.links.length} 个链接
            </span>

            {/* 删除按钮 */}
            <DeleteConfirmButton
              title="删除这个分类？"
              description={`“${category.name || '未命名分类'}” 下的 ${category.links.length} 个链接也会一起删除。这个操作不能撤销。`}
              confirmLabel="删除分类"
              triggerTitle="删除分类"
              onConfirm={onDelete}
            />
          </div>

          {/* 链接列表 */}
          <div className="mt-4 space-y-2">
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

            {/* 添加链接按钮 */}
            <button
              type="button"
              onClick={onAddLink}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed px-4 py-3 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
              style={{ borderColor: 'var(--panel-border)' }}
            >
              <Plus className="h-4 w-4" />
              添加链接
            </button>
          </div>
        </div>
      </div>

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
