'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Modifier,
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
import { FolderOpen, Plus, Folder, GripVertical, ChevronLeft } from 'lucide-react';
import type { Config, Category } from '../../types';
import DynamicIcon from '../../components/DynamicIcon';
import ColorPicker from './ColorPicker';
import LazyIconPicker from './LazyIconPicker';
import DeleteConfirmButton from './DeleteConfirmButton';
import { validateCategoryName } from '../utils/validators';
import SortableLinkItem from './SortableLinkItem';
import Button from '../../components/Button';
import { AppInput } from '../../components/AppInput';

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-[20px] border border-dashed py-16 text-center panel-border">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-secondary)]">
        <Folder className="h-8 w-8 text-[var(--muted)] opacity-60" />
      </div>
      <p className="text-base font-medium text-[var(--foreground)]">还没有分类</p>
      <p className="mt-1 text-sm text-[var(--muted)]">点击按钮添加第一个分类</p>
      <Button
        onClick={onAdd}
        leftIcon={<Plus className="h-4 w-4" />}
        className="mt-4"
      >
        添加分类
      </Button>
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
    setActivatorNodeRef,
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
      className={`group relative flex items-center gap-2 rounded-[14px] border px-3 py-2.5 cursor-pointer transition-colors will-change-transform panel-border ${
        isSelected
          ? 'bg-[var(--accent-alpha)] accent-border'
          : 'bg-[var(--background)] border-transparent hover:bg-[var(--bg-secondary)]'
      } ${isDragging ? 'shadow-lg' : ''}`}
      style={dndStyle}
      onClick={onClick}
    >
      {/* 拖拽手柄 */}
      <Button
        shape="icon"
        leftIcon={<GripVertical />}
        size="sm"
        variant="ghost"
        aria-label="拖拽排序"
        title="拖拽排序"
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}
        className="cursor-grab touch-none select-none active:cursor-grabbing [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[var(--muted)]"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      />

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

      {/* 删除按钮（仅在 PC hover 时显示） */}
      <div
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block"
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
  onBack,
  isMobile,
}: {
  category: Category;
  onUpdate: (field: keyof Category, value: string) => void;
  onAddLink: () => void;
  onUpdateLink: (linkIdx: number, field: keyof Category['links'][number], value: string) => void;
  onDeleteLink: (linkIdx: number) => void;
  onLinksReorder: (newLinks: Category['links']) => void;
  onBack?: () => void;
  isMobile?: boolean;
}) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const nameError = validateCategoryName(category.name);

  // 配置链接拖拽传感器
  const linkSensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 6 },
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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-1 [scrollbar-gutter:stable]">
      {/* 移动端返回按钮 */}
      {isMobile && onBack && (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
          onClick={onBack}
          className="mb-2 !h-7 !px-2 text-xs"
        >
          返回分类列表
        </Button>
      )}

      {/* 分类基本信息 */}
      <div className="rounded-[18px] border bg-[var(--background)] p-3 sm:shrink-0 sm:p-4 panel-border">
        {/* PC端：水平布局 */}
        {!isMobile && (
          <div className="flex items-end gap-3">
            {/* 图标选择 */}
            <div className="shrink-0">
              <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                Logo
              </label>
              <Button
                shape="icon"
                leftIcon={<DynamicIcon name={category.icon} size={20} />}
                size="lg"
                variant="secondary"
                aria-label="更换图标"
                title="更换图标"
                onClick={() => setShowIconPicker(true)}
                className="!h-[42px] !w-[42px] !rounded-[14px] !bg-[var(--panel-strong)] [&_svg]:text-[var(--foreground)]"
              />
            </div>

            {/* 名称输入 */}
            <div className="flex-1 min-w-0">
              <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                分类名称
              </label>
              <AppInput
                type="text"
                value={category.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                error={!!nameError}
                placeholder="分类名称"
                inputClassName="font-medium bg-[var(--panel-strong)]"
                size="sm"
              />
              {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
            </div>

            {/* 颜色选择器 */}
            <div className="shrink-0">
              <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                颜色
              </label>
              <div className="flex h-[42px] items-center">
                <ColorPicker value={category.color} onChange={(color) => onUpdate('color', color)} />
              </div>
            </div>
          </div>
        )}

        {/* 移动端：垂直布局 */}
        {isMobile && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-end gap-2.5">
              <div className="shrink-0">
                <label className="mb-1.5 block text-[11px] font-medium text-[var(--muted)]">
                  Logo
                </label>
                <Button
                  shape="icon"
                  leftIcon={<DynamicIcon name={category.icon} size={18} />}
                  size="md"
                  variant="secondary"
                  aria-label="更换图标"
                  title="更换图标"
                  onClick={() => setShowIconPicker(true)}
                  className="!h-[38px] !w-[38px] !rounded-[12px] !bg-[var(--panel-strong)] [&_svg]:text-[var(--foreground)]"
                />
              </div>

              <div className="flex-1 min-w-0">
                <label className="mb-1.5 block text-[11px] font-medium text-[var(--muted)]">
                  分类名称
                </label>
                <AppInput
                  type="text"
                  value={category.name}
                  onChange={(e) => onUpdate('name', e.target.value)}
                  error={!!nameError}
                  placeholder="分类名称"
                  inputClassName="font-medium bg-[var(--panel-strong)]"
                  size="sm"
                />
                {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-[var(--muted)]">
                颜色
              </label>
              <div className="flex gap-2 overflow-x-auto py-2 [scrollbar-gutter:stable]">
                <ColorPicker value={category.color} onChange={(color) => onUpdate('color', color)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 链接列表 */}
      <div className={isMobile ? 'mt-3 flex flex-1 flex-col' : 'mt-5 flex flex-1 flex-col'}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--foreground)]">
            链接列表 <span className="text-[var(--muted)]">({category.links.length})</span>
          </h3>
          <Button
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={onAddLink}
          >
            添加链接
          </Button>
        </div>

        {category.links.length === 0 ? (
          <div className="rounded-[14px] border border-dashed py-8 text-center panel-border">
            <p className="text-sm text-[var(--muted)]">还没有链接</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddLink}
              className="mt-2 text-xs !text-[var(--accent)] hover:underline"
            >
              添加第一个链接
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={linkSensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleLinkDragEnd}
          >
            <SortableContext
              items={category.links.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex-1">
                <div className="space-y-2">
                  {category.links.map((link, linkIdx) => (
                    (() => {
                      const isNewLink =
                        linkIdx === category.links.length - 1 &&
                        link.name === '新链接' &&
                        link.url === 'https://' &&
                        !link.description;

                      return (
                        <SortableLinkItem
                          key={link.id}
                          link={link}
                          defaultExpanded={isNewLink}
                          autoScrollIntoView={isNewLink}
                          onUpdate={(field, value) => onUpdateLink(linkIdx, field, value)}
                          onDelete={() => onDeleteLink(linkIdx)}
                        />
                      );
                    })()
                  ))}
                </div>
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
  // 移动端是否显示编辑区
  const [showMobileEditor, setShowMobileEditor] = useState(false);

  // 配置分类拖拽传感器
  const categorySensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 6 },
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
    // 移动端删除后返回列表
    setShowMobileEditor(false);
  }, [categories.length, onDeleteCategory, selectedCatIdx]);

  // 处理链接重新排序
  const handleLinksReorder = useCallback((newLinks: Category['links']) => {
    onUpdateCategory(selectedCatIdx, 'links', newLinks as unknown as string);
  }, [onUpdateCategory, selectedCatIdx]);

  // 处理分类选择（移动端）
  const handleCategorySelect = useCallback((idx: number) => {
    setSelectedCatIdx(idx);
    setShowMobileEditor(true);
  }, []);

  // 处理返回列表（移动端）
  const handleBackToList = useCallback(() => {
    setShowMobileEditor(false);
  }, []);

  // 确保选中索引有效
  const validSelectedIdx = Math.min(selectedCatIdx, Math.max(0, categories.length - 1));
  const selectedCategory = categories[validSelectedIdx];

  if (categories.length === 0) {
    return (
      <section className="edit-panel">
        <div className="edit-panel-header flex items-center justify-between">
          <h2 className="edit-panel-title flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
            分类和链接
          </h2>
          <Button
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={onAddCategory}
          >
            添加分类
          </Button>
        </div>
        <div className="edit-panel-body">
          <EmptyState onAdd={onAddCategory} />
        </div>
      </section>
    );
  }

  return (
    <section
      className="edit-panel flex h-full min-h-0 flex-col overflow-hidden"
    >
      <div className="edit-panel-header flex items-center justify-between">
        <h2 className="edit-panel-title flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
          分类和链接
        </h2>
        <Button
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={onAddCategory}
        >
          <span className="hidden xsm:inline">添加分类</span>
          <span className="xsm:hidden">添加</span>
        </Button>
      </div>

      {/* PC端布局：左右分栏 */}
      <div className="hidden lg:flex min-h-0 flex-1">
        {/* 左侧分类列表 */}
        <div className="shrink-0 border-r w-64 xl:w-72 panel-border">
          <div className="h-full p-3 overflow-hidden">
            <DndContext
              sensors={categorySensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleCategoryDragEnd}
            >
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable] h-full">
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
        <div className="flex min-h-0 flex-1 overflow-hidden p-5">
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

      {/* 移动端/平板布局：列表和编辑区切换 */}
      <div className="lg:hidden flex min-h-0 flex-1 overflow-hidden">
        {/* 分类列表（当不显示编辑区时） */}
        <div className={`${showMobileEditor ? 'hidden' : 'flex'} flex-col w-full h-full p-2.5 overflow-hidden sm:p-3`}>
          <DndContext
            sensors={categorySensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
                {categories.map((category, idx) => (
                  <SortableCategoryTab
                    key={category.id}
                    category={category}
                    isSelected={idx === validSelectedIdx}
                    onClick={() => handleCategorySelect(idx)}
                    onDelete={() => handleDeleteCategory(idx)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* 编辑区域（当显示编辑区时） */}
        <div className={`${showMobileEditor ? 'flex' : 'hidden'} flex-col w-full h-full p-3 overflow-hidden sm:p-4`}>
          {selectedCategory && (
            <CategoryEditor
              category={selectedCategory}
              onUpdate={(field, value) => onUpdateCategory(validSelectedIdx, field, value)}
              onAddLink={() => onAddLink(validSelectedIdx)}
              onUpdateLink={(linkIdx, field, value) => onUpdateLink(validSelectedIdx, linkIdx, field, value)}
              onDeleteLink={(linkIdx) => onDeleteLink(validSelectedIdx, linkIdx)}
              onLinksReorder={handleLinksReorder}
              onBack={handleBackToList}
              isMobile={true}
            />
          )}
        </div>
      </div>
    </section>
  );
}
