'use client';

import { Accordion } from 'radix-ui';
import { useState } from 'react';
import { ChevronDown, Plus, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';
import type { Category } from '../../types';
import LinkEditor from './LinkEditor';
import LazyIconPicker from './LazyIconPicker';
import DynamicIcon from '../../components/DynamicIcon';
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
          {/* PC端头部布局 */}
          <div className="hidden sm:flex mb-3 items-start gap-2">
            {/* 上下移动按钮 */}
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

            {/* 折叠按钮 */}
            <Accordion.Header className="shrink-0">
              <Accordion.Trigger className="accordion-trigger flex h-10 w-10 items-center justify-center rounded-[14px] border bg-[var(--background)] text-[var(--muted)] outline-none transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]" style={{ borderColor: 'var(--panel-border)' }}>
                <ChevronDown className="accordion-chevron h-4 w-4 transition-transform duration-200" />
              </Accordion.Trigger>
            </Accordion.Header>

            {/* 名称输入 */}
            <div className="flex-1 min-w-0">
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

            {/* 图标选择 */}
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="flex items-center gap-2 rounded-[16px] border bg-[var(--background)] px-3 py-3 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
              style={{ borderColor: 'var(--panel-border)' }}
              title="点击更换图标"
            >
              <DynamicIcon name={category.icon} size={18} />
              <span className="max-w-[80px] truncate text-xs">{category.icon}</span>
            </button>

            {/* 颜色选择器 */}
            <ColorPicker value={category.color} onChange={(color) => onUpdate('color', color)} />

            {/* 删除按钮 */}
            <DeleteConfirmButton
              title="删除这个分类？"
              description={`"${category.name || '未命名分类'}" 下的 ${category.links.length} 个链接也会一起删除。这个操作不能撤销。`}
              confirmLabel="删除分类"
              triggerTitle="删除分类"
              onConfirm={onDelete}
            />
          </div>

          {/* 移动端头部布局 */}
          <div className="sm:hidden mb-3">
            {/* 第一行：操作按钮 + 名称 */}
            <div className="flex items-start gap-2">
              {/* 操作按钮组（折叠 + 上下移动） */}
              <div className="flex flex-col gap-1 shrink-0">
                <Accordion.Header>
                  <Accordion.Trigger className="accordion-trigger flex h-10 w-10 items-center justify-center rounded-[12px] border bg-[var(--background)] text-[var(--muted)] outline-none transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]" style={{ borderColor: 'var(--panel-border)' }}>
                    <ChevronDown className="accordion-chevron h-4 w-4 transition-transform duration-200" />
                  </Accordion.Trigger>
                </Accordion.Header>
                {/* 上下移动按钮（移动端简化为横向） */}
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={!canMoveUp}
                    className="flex-1 rounded-[8px] py-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-30"
                    title="上移"
                  >
                    <ChevronUp className="h-3.5 w-3.5 mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={!canMoveDown}
                    className="flex-1 rounded-[8px] py-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] disabled:opacity-30"
                    title="下移"
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5 mx-auto" />
                  </button>
                </div>
              </div>

              {/* 名称输入 */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => onUpdate('name', e.target.value)}
                  className={`w-full rounded-[14px] border bg-[var(--background)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] outline-none transition-colors ${
                    nameError ? 'border-red-500/50' : ''
                  }`}
                  style={{ borderColor: nameError ? undefined : 'var(--panel-border)' }}
                  placeholder="分类名称"
                />
                {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
              </div>

              {/* 删除按钮 */}
              <DeleteConfirmButton
                title="删除这个分类？"
                description={`"${category.name || '未命名分类'}" 下的 ${category.links.length} 个链接也会一起删除。这个操作不能撤销。`}
                confirmLabel="删除"
                triggerTitle="删除"
                onConfirm={onDelete}
              />
            </div>

            {/* 第二行：图标和颜色 */}
            <div className="mt-2 flex items-center gap-2 pl-12">
              {/* 图标选择（移动端简化） */}
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="flex h-10 items-center gap-2 rounded-[12px] border bg-[var(--background)] px-3 text-sm text-[var(--foreground)] transition-colors active:bg-[var(--bg-secondary)]"
                style={{ borderColor: 'var(--panel-border)' }}
              >
                <DynamicIcon name={category.icon} size={18} />
                <span className="text-xs text-[var(--muted)]">图标</span>
              </button>

              {/* 颜色选择器（移动端使用简化版） */}
              <div className="flex-1">
                <ColorPicker value={category.color} onChange={(color) => onUpdate('color', color)} />
              </div>
            </div>
          </div>

          {collapsed && (
            <p className="pl-6 text-xs text-[var(--muted)] sm:block hidden">
              {category.links.length} 个链接
            </p>
          )}

          <Accordion.Content className="overflow-hidden">
            <div className="ml-0 sm:ml-2 space-y-3 sm:border-l sm:border-[var(--panel-border)]/70 sm:pl-6 pt-1">
              {/* 移动端链接计数 */}
              <p className="sm:hidden text-xs text-[var(--muted)] mb-2">
                {category.links.length} 个链接
              </p>

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
