'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FolderOpen, Plus, Folder, GripVertical } from 'lucide-react';
import type { Config, Category } from '../../types';
import DynamicIcon from '../../components/DynamicIcon';
import ColorPicker from './ColorPicker';
import LazyIconPicker from './LazyIconPicker';
import DeleteConfirmButton from './DeleteConfirmButton';
import { validateCategoryName } from '../utils/validators';
import SortableLinkItem from './SortableLinkItem';

interface CategoriesEditorSectionProps {
  categories: Config['categories'];
  onCategoriesChange: (categories: Config['categories']) => void;
  onAddCategory: () => void;
  onUpdateCategory: (catIdx: number, field: keyof Config['categories'][number], value: string) => void;
  onDeleteCategory: (catIdx: number) => void;
  onUpdateLink: (
    catIdx: number,
    linkIdx: number,
    field: keyof Config['categories'][number]['links'][number],
    value: string,
  ) => void;
  onAddLink: (catIdx: number) => void;
  onDeleteLink: (catIdx: number, linkIdx: number) => void;
}

// 空状态组件
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-[20px] border border-dashed py-16 text-center" style={{ borderColor: 'var(--panel-border)' }}>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-secondary)]">
        <Folder className="h-8 w-8 text-[var(--muted)] opacity-60" />
      </div>
      <p className="text-base font-medium text-[var(--foreground)]">还没有分类</p>
      <p className="mt-1 text-sm text-[var(--muted)]">点击按钮添加第一个分类</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-[16px] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        添加分类
      </button>
    </div>
  );
}

// 可拖拽的分类列表项
function SortableCategoryTab({
  category,
  isSelected,
  onClick,
  onDelete,
}: {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const dragTransform = transform ? { ...transform, x: 0 } : null;
  const dndStyle = {
    transform: CSS.Transform.toString(dragTransform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex items-center gap-2 rounded-[14px] border px-3 py-2.5 cursor-pointer transition-colors will-change-transform ${
        isSelected
          ? 'bg-[var(--accent-alpha)] border-[var(--accent)]'
          : 'bg-[var(--background)] border-transparent hover:bg-[var(--bg-secondary)]'
      } ${isDragging ? 'shadow-lg' : ''}`}
      style={{ borderColor: isSelected ? 'var(--accent-border)' : 'transparent', ...dndStyle }}
      onClick={onClick}
    >
      {/* 拖拽手柄 */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-6 w-4 cursor-grab touch-none items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--foreground)] active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* 颜色条 */}
      <div
        className="h-6 w-1 rounded-full shrink-0"
        style={{ backgroundColor: category.color }}
      />

      {/* 图标 */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-[var(--panel-strong)]">
        <DynamicIcon name={category.icon} size={16} />
      </div>

      {/* 名称 */}
      <span className={`flex-1 truncate text-sm font-medium ${
        isSelected ? 'text-[var(--foreground)]' : 'text-[var(--text-primary)]'
      }`}>
        {category.name || '未命名分类'}
      </span>

      {/* 链接数量 */}
      <span className="shrink-0 text-xs text-[var(--muted)]">
        {category.links.length}
      </span>

      {/* 删除按钮（仅在 hover 时显示） */}
      <div
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <DeleteConfirmButton
          title="删除这个分类？"
          description={`"${category.name || '未命名分类'}" 下的 ${category.links.length} 个链接也会一起删除。这个操作不能撤销。`}
          confirmLabel="删除分类"
          triggerTitle="删除"
          onConfirm={onDelete}
        />
      </div>
    </div>
  );
}

// 分类编辑表单
function CategoryEditor({
  category,
  onUpdate,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onLinksReorder,
}: {
  category: Category;
  onUpdate: (field: keyof Category, value: string) => void;
  onAddLink: () => void;
  onUpdateLink: (linkIdx: number, field: keyof Category['links'][number], value: string) => void;
  onDeleteLink: (linkIdx: number) => void;
  onLinksReorder: (newLinks: Category['links']) => void;
}) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const nameError = validateCategoryName(category.name);

  // 配置链接拖拽传感器
  const linkSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理链接拖拽结束
  const handleLinkDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = category.links.findIndex((l) => l.id === active.id);
      const newIndex = category.links.findIndex((l) => l.id === over.id);
      onLinksReorder(arrayMove(category.links, oldIndex, newIndex));
    }
  }, [category.links, onLinksReorder]);

  return (
    <div className="space-y-5">
      {/* 分类基本信息 */}
      <div className="rounded-[18px] border bg-[var(--background)] p-4" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="flex items-center gap-3">
          {/* 图标选择 */}
          <button
            type="button"
            onClick={() => setShowIconPicker(true)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border bg-[var(--panel-strong)] text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <DynamicIcon name={category.icon} size={24} />
          </button>

          {/* 名称输入 */}
          <div className="flex-1 min-w-0">
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
              分类名称
            </label>
            <input
              type="text"
              value={category.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className={`w-full rounded-[14px] border bg-[var(--panel-strong)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] outline-none transition-colors ${
                nameError ? 'border-red-500/50' : ''
              }`}
              style={{ borderColor: nameError ? undefined : 'var(--panel-border)' }}
              placeholder="分类名称"
            />
            {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
          </div>

          {/* 颜色选择器 */}
          <div className="shrink-0">
            <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
              颜色
            </label>
            <ColorPicker value={category.color} onChange={(color) => onUpdate('color', color)} />
          </div>
        </div>
      </div>

      {/* 链接列表 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--foreground)]">
            链接列表 <span className="text-[var(--muted)]">({category.links.length})</span>
          </h3>
          <button
            type="button"
            onClick={onAddLink}
            className="flex items-center gap-1.5 rounded-[12px] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            添加链接
          </button>
        </div>

        {category.links.length === 0 ? (
          <div
            className="rounded-[14px] border border-dashed py-8 text-center"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <p className="text-sm text-[var(--muted)]">还没有链接</p>
            <button
              type="button"
              onClick={onAddLink}
              className="mt-2 text-xs text-[var(--accent)] hover:underline"
            >
              添加第一个链接
            </button>
          </div>
        ) : (
          <DndContext
            sensors={linkSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLinkDragEnd}
          >
            <SortableContext
              items={category.links.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {category.links.map((link, linkIdx) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    onUpdate={(field, value) => onUpdateLink(linkIdx, field, value)}
                    onDelete={() => onDeleteLink(linkIdx)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {showIconPicker && (
        <LazyIconPicker
          value={category.icon}
          onChange={(icon) => onUpdate('icon', icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}

export default function CategoriesEditorSection({
  categories,
  onCategoriesChange,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateLink,
  onAddLink,
  onDeleteLink,
}: CategoriesEditorSectionProps) {
  // 当前选中的分类索引
  const [selectedCatIdx, setSelectedCatIdx] = useState(0);

  // 配置分类拖拽传感器
  const categorySensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理分类拖拽结束
  const handleCategoryDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      onCategoriesChange(newCategories);
      // 更新选中索引
      if (selectedCatIdx === oldIndex) {
        setSelectedCatIdx(newIndex);
      } else if (oldIndex < selectedCatIdx && newIndex >= selectedCatIdx) {
        setSelectedCatIdx(selectedCatIdx - 1);
      } else if (oldIndex > selectedCatIdx && newIndex <= selectedCatIdx) {
        setSelectedCatIdx(selectedCatIdx + 1);
      }
    }
  }, [categories, onCategoriesChange, selectedCatIdx]);

  // 处理分类删除
  const handleDeleteCategory = useCallback((idx: number) => {
    onDeleteCategory(idx);
    // 调整选中索引
    if (categories.length <= 1) {
      setSelectedCatIdx(0);
    } else if (idx === selectedCatIdx) {
      setSelectedCatIdx(Math.min(idx, categories.length - 2));
    } else if (idx < selectedCatIdx) {
      setSelectedCatIdx(selectedCatIdx - 1);
    }
  }, [categories.length, onDeleteCategory, selectedCatIdx]);

  // 处理链接重新排序
  const handleLinksReorder = useCallback((newLinks: Category['links']) => {
    onUpdateCategory(selectedCatIdx, 'links', newLinks as unknown as string);
  }, [onUpdateCategory, selectedCatIdx]);

  // 确保选中索引有效
  const validSelectedIdx = Math.min(selectedCatIdx, Math.max(0, categories.length - 1));
  const selectedCategory = categories[validSelectedIdx];

  if (categories.length === 0) {
    return (
      <section className="rounded-[24px] border bg-[var(--panel-strong)]" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
            <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
            分类和链接
          </h2>
          <button
            type="button"
            onClick={onAddCategory}
            className="flex items-center gap-1.5 rounded-[16px] bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white transition-colors hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            添加分类
          </button>
        </div>
        <div className="p-5">
          <EmptyState onAdd={onAddCategory} />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border bg-[var(--panel-strong)]" style={{ borderColor: 'var(--panel-border)' }}>
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
          <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
          分类和链接
        </h2>
        <button
          type="button"
          onClick={onAddCategory}
          className="flex items-center gap-1.5 rounded-[16px] bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white transition-colors hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          添加分类
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* 左侧分类列表 */}
        <div className="border-b lg:border-b-0 lg:border-r lg:w-64 xl:w-72 shrink-0" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="p-3">
            <DndContext
              sensors={categorySensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCategoryDragEnd}
            >
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable] max-h-[300px] lg:max-h-[calc(100vh-300px)]">
                  {categories.map((category, idx) => (
                    <SortableCategoryTab
                      key={category.id}
                      category={category}
                      isSelected={idx === validSelectedIdx}
                      onClick={() => setSelectedCatIdx(idx)}
                      onDelete={() => handleDeleteCategory(idx)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* 右侧编辑区域 */}
        <div className="flex-1 p-5">
          {selectedCategory && (
            <CategoryEditor
              category={selectedCategory}
              onUpdate={(field, value) => onUpdateCategory(validSelectedIdx, field, value)}
              onAddLink={() => onAddLink(validSelectedIdx)}
              onUpdateLink={(linkIdx, field, value) => onUpdateLink(validSelectedIdx, linkIdx, field, value)}
              onDeleteLink={(linkIdx) => onDeleteLink(validSelectedIdx, linkIdx)}
              onLinksReorder={handleLinksReorder}
            />
          )}
        </div>
      </div>
    </section>
  );
}
