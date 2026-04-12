'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, X } from 'lucide-react';
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
  const [showDescription, setShowDescription] = useState(Boolean(link.description));
  const [showMobileActions, setShowMobileActions] = useState(false);
  const nameError = validateLinkName(link.name);
  const urlError = validateLinkUrl(link.url);

  return (
    <>
      {/* PC端布局 */}
      <div
        className="hidden sm:flex items-center gap-2 rounded-[16px] border bg-[var(--background)] px-3 py-2.5 transition-colors"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        {/* 上下移动按钮 */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="rounded-[6px] p-0.5 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
            title="上移"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="rounded-[6px] p-0.5 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
            title="下移"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 图标选择 */}
        <button
          type="button"
          onClick={() => setShowIconPicker(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border bg-[var(--panel-strong)] text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
          style={{ borderColor: 'var(--panel-border)' }}
          title="更换图标"
        >
          <DynamicIcon name={link.icon} size={18} />
        </button>

        {/* 名称输入 */}
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={link.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className={`w-full rounded-[12px] border bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors ${
              nameError ? 'border-red-500/50' : ''
            }`}
            style={{ borderColor: nameError ? undefined : 'var(--panel-border)' }}
            placeholder="链接名称"
          />
          {nameError && <p className="mt-0.5 text-xs text-red-400">{nameError}</p>}
        </div>

        {/* URL 输入 */}
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={link.url}
            onChange={(e) => onUpdate('url', e.target.value)}
            className={`w-full rounded-[12px] border bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors ${
              urlError ? 'border-red-500/50' : ''
            }`}
            style={{ borderColor: urlError ? undefined : 'var(--panel-border)' }}
            placeholder="https://..."
          />
          {urlError && <p className="mt-0.5 text-xs text-red-400">{urlError}</p>}
        </div>

        {/* 描述展开按钮 */}
        <button
          type="button"
          onClick={() => setShowDescription(!showDescription)}
          className={`shrink-0 rounded-[10px] px-2.5 py-2 text-xs font-medium transition-colors ${
            showDescription || link.description
              ? 'bg-[var(--accent-alpha)] text-[var(--accent)]'
              : 'text-[var(--muted)] hover:bg-[var(--bg-secondary)]'
          }`}
          title={showDescription ? '隐藏描述' : '添加描述'}
        >
          描述
        </button>

        {/* 删除按钮 */}
        <DeleteConfirmButton
          title="删除这个链接？"
          description={`"${link.name || '未命名链接'}" 将从当前分类中移除。这个操作不能撤销。`}
          confirmLabel="删除链接"
          triggerTitle="删除链接"
          onConfirm={onDelete}
        />
      </div>

      {/* 展开的 URL（仅在PC端显示）和描述 */}
      {showDescription && (
        <div className="hidden sm:block mt-2 space-y-2 pl-10">
          {/* 描述输入 */}
          <input
            type="text"
            value={link.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            className="w-full rounded-[12px] border bg-[var(--panel-strong)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]"
            style={{ borderColor: 'var(--panel-border)' }}
            placeholder="描述（可选）"
          />
        </div>
      )}

      {/* 移动端卡片式布局 */}
      <div
        className="sm:hidden rounded-[16px] border bg-[var(--background)] p-3 transition-colors"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        {/* 第一行：图标 + 名称 + 操作菜单 */}
        <div className="flex items-center gap-2">
          {/* 图标选择 - 增大触摸区域 */}
          <button
            type="button"
            onClick={() => setShowIconPicker(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border bg-[var(--panel-strong)] text-[var(--foreground)] transition-colors active:scale-95"
            style={{ borderColor: 'var(--panel-border)' }}
            title="更换图标"
          >
            <DynamicIcon name={link.icon} size={20} />
          </button>

          {/* 名称输入 */}
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={link.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className={`w-full rounded-[12px] border bg-[var(--panel-strong)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors ${
                nameError ? 'border-red-500/50' : ''
              }`}
              style={{ borderColor: nameError ? undefined : 'var(--panel-border)' }}
              placeholder="链接名称"
            />
            {nameError && <p className="mt-0.5 text-xs text-red-400">{nameError}</p>}
          </div>

          {/* 操作菜单按钮 */}
          <button
            type="button"
            onClick={() => setShowMobileActions(!showMobileActions)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-colors ${
              showMobileActions ? 'bg-[var(--accent-alpha)] text-[var(--accent)]' : 'text-[var(--muted)]'
            }`}
          >
            {showMobileActions ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
          </button>
        </div>

        {/* 移动端操作菜单 */}
        {showMobileActions && (
          <div className="mt-2 flex items-center gap-2 border-t pt-2" style={{ borderColor: 'var(--panel-border)' }}>
            {/* 上移 */}
            <button
              type="button"
              onClick={() => {
                onMoveUp?.();
                setShowMobileActions(false);
              }}
              disabled={!canMoveUp}
              className="flex flex-1 items-center justify-center gap-1 rounded-[10px] py-2 text-xs font-medium text-[var(--muted)] transition-colors disabled:opacity-30 active:bg-[var(--bg-secondary)]"
            >
              <ChevronUp className="w-4 h-4" />
              上移
            </button>
            {/* 下移 */}
            <button
              type="button"
              onClick={() => {
                onMoveDown?.();
                setShowMobileActions(false);
              }}
              disabled={!canMoveDown}
              className="flex flex-1 items-center justify-center gap-1 rounded-[10px] py-2 text-xs font-medium text-[var(--muted)] transition-colors disabled:opacity-30 active:bg-[var(--bg-secondary)]"
            >
              <ChevronDown className="w-4 h-4" />
              下移
            </button>
            {/* 描述切换 */}
            <button
              type="button"
              onClick={() => {
                setShowDescription(!showDescription);
                setShowMobileActions(false);
              }}
              className={`flex flex-1 items-center justify-center gap-1 rounded-[10px] py-2 text-xs font-medium transition-colors active:bg-[var(--bg-secondary)] ${
                showDescription || link.description ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
              }`}
            >
              描述
            </button>
            {/* 删除 */}
            <DeleteConfirmButton
              title="删除这个链接？"
              description={`"${link.name || '未命名链接'}" 将从当前分类中移除。这个操作不能撤销。`}
              confirmLabel="删除"
              triggerTitle="删除"
              onConfirm={() => {
                onDelete();
                setShowMobileActions(false);
              }}
            />
          </div>
        )}

        {/* URL 输入（移动端始终显示） */}
        <div className="mt-2">
          <input
            type="text"
            value={link.url}
            onChange={(e) => onUpdate('url', e.target.value)}
            className={`w-full rounded-[12px] border bg-[var(--panel-strong)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors ${
              urlError ? 'border-red-500/50' : ''
            }`}
            style={{ borderColor: urlError ? undefined : 'var(--panel-border)' }}
            placeholder="https://..."
          />
          {urlError && <p className="mt-0.5 text-xs text-red-400">{urlError}</p>}
        </div>

        {/* 描述输入（移动端可折叠） */}
        {showDescription && (
          <div className="mt-2">
            <input
              type="text"
              value={link.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              className="w-full rounded-[12px] border bg-[var(--panel-strong)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]"
              style={{ borderColor: 'var(--panel-border)' }}
              placeholder="描述（可选）"
            />
          </div>
        )}
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
