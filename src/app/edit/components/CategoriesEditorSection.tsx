'use client';

import { Accordion } from 'radix-ui';
import { FolderOpen, Minus, Plus } from 'lucide-react';
import type { Config } from '../../types';
import CategoryEditor from './CategoryEditor';

interface CategoriesEditorSectionProps {
  categories: Config['categories'];
  collapsedCategories: Set<string>;
  openCategoryIds: string[];
  onOpenChange: (openIds: string[]) => void;
  onToggleAll: () => void;
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
  onMoveLinkUp: (catIdx: number, linkIdx: number) => void;
  onMoveLinkDown: (catIdx: number, linkIdx: number) => void;
  onMoveCategoryUp: (catIdx: number) => void;
  onMoveCategoryDown: (catIdx: number) => void;
}

export default function CategoriesEditorSection({
  categories,
  collapsedCategories,
  openCategoryIds,
  onOpenChange,
  onToggleAll,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateLink,
  onAddLink,
  onDeleteLink,
  onMoveLinkUp,
  onMoveLinkDown,
  onMoveCategoryUp,
  onMoveCategoryDown,
}: CategoriesEditorSectionProps) {
  return (
    <section className="rounded-[24px] border bg-[var(--panel-strong)]" style={{ borderColor: 'var(--panel-border)' }}>
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
          <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
          分类和链接
        </h2>
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <button
              type="button"
              onClick={onToggleAll}
              className="flex items-center gap-1.5 rounded-[16px] border px-3 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
              style={{ borderColor: 'var(--panel-border)' }}
            >
              {collapsedCategories.size === categories.length ? (
                <Plus className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              {collapsedCategories.size === categories.length ? '展开全部' : '折叠全部'}
            </button>
          )}
          <button
            type="button"
            onClick={onAddCategory}
            className="flex items-center gap-1.5 rounded-[16px] bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            添加分类
          </button>
        </div>
      </div>
      <div className="p-5">
        {categories.length === 0 ? (
          <div className="rounded-[20px] border border-dashed py-12 text-center text-[var(--muted)]" style={{ borderColor: 'var(--panel-border)' }}>
            <FolderOpen className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">暂无分类</p>
            <p className="mt-1 text-xs">点击上方按钮添加第一个分类</p>
          </div>
        ) : (
          <Accordion.Root
            type="multiple"
            value={openCategoryIds}
            onValueChange={onOpenChange}
            className="space-y-4"
          >
            {categories.map((category, catIdx) => (
              <CategoryEditor
                key={category.id}
                category={category}
                collapsed={collapsedCategories.has(category.id)}
                onUpdate={(field, value) => onUpdateCategory(catIdx, field, value)}
                onDelete={() => onDeleteCategory(catIdx)}
                onUpdateLink={(linkIdx, field, value) => onUpdateLink(catIdx, linkIdx, field, value)}
                onAddLink={() => onAddLink(catIdx)}
                onDeleteLink={(linkIdx) => onDeleteLink(catIdx, linkIdx)}
                onMoveLinkUp={(linkIdx) => onMoveLinkUp(catIdx, linkIdx)}
                onMoveLinkDown={(linkIdx) => onMoveLinkDown(catIdx, linkIdx)}
                onMoveUp={() => onMoveCategoryUp(catIdx)}
                onMoveDown={() => onMoveCategoryDown(catIdx)}
                canMoveUp={catIdx > 0}
                canMoveDown={catIdx < categories.length - 1}
              />
            ))}
          </Accordion.Root>
        )}
      </div>
    </section>
  );
}
