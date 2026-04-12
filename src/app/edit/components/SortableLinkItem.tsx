"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Link as LinkType } from "../../types";
import LazyIconPicker from "./LazyIconPicker";
import DynamicIcon from "../../components/DynamicIcon";
import DeleteConfirmButton from "./DeleteConfirmButton";
import { validateLinkName, validateLinkUrl } from "../utils/validators";

interface SortableLinkItemProps {
  link: LinkType;
  onUpdate: (field: keyof LinkType, value: string) => void;
  onDelete: () => void;
}

export default function SortableLinkItem({
  link,
  onUpdate,
  onDelete,
}: SortableLinkItemProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const nameError = validateLinkName(link.name);
  const urlError = validateLinkUrl(link.url);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className={`rounded-[14px] border bg-[var(--background)] px-3 py-2 transition-colors ${
          isDragging ? "shadow-lg ring-2 ring-[var(--accent)]" : ""
        }`}
        style={{ borderColor: "var(--panel-border)", ...dndStyle }}
      >
        <div className="flex items-center gap-2">
          {/* 拖拽手柄 */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex h-6 w-4 cursor-grab items-center justify-center text-[var(--muted)] transition-colors hover:text-[var(--foreground)] active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          {/* 图标选择 */}
          <button
            type="button"
            onClick={() => setShowIconPicker(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border bg-[var(--panel-strong)] text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ borderColor: "var(--panel-border)" }}
          >
            <DynamicIcon name={link.icon} size={16} />
          </button>

          {/* 名称输入 */}
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={link.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              className={`w-full rounded-[10px] border bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors ${
                nameError ? "border-red-500/50" : ""
              }`}
              style={{
                borderColor: nameError ? undefined : "var(--panel-border)",
              }}
              placeholder="链接名称"
            />
            {nameError && (
              <p className="mt-0.5 text-[10px] text-red-400">{nameError}</p>
            )}
          </div>

          {/* URL 输入 */}
          <div className="min-w-0 flex-1 hidden sm:block">
            <input
              type="text"
              value={link.url}
              onChange={(e) => onUpdate("url", e.target.value)}
              className={`w-full rounded-[10px] border bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors ${
                urlError ? "border-red-500/50" : ""
              }`}
              style={{
                borderColor: urlError ? undefined : "var(--panel-border)",
              }}
              placeholder="https://..."
            />
            {urlError && (
              <p className="mt-0.5 text-[10px] text-red-400">{urlError}</p>
            )}
          </div>

          {/* 删除按钮 */}
          <DeleteConfirmButton
            title="删除？"
            description={`“${link.name || "未命名链接"}” 将被移除。这个操作不能撤销。`}
            confirmLabel="删除"
            triggerTitle="删除"
            onConfirm={onDelete}
          />
        </div>

        {/* 展开的 URL（移动端）和描述 */}
        <div
          className="space-y-1.5 pl-6"
          style={{ borderColor: "var(--panel-border)" }}
        >
          {/* 移动端 URL 输入 */}
          <div className="sm:hidden">
            <input
              type="text"
              value={link.url}
              onChange={(e) => onUpdate("url", e.target.value)}
              className={`w-full rounded-[10px] border bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors ${
                urlError ? "border-red-500/50" : ""
              }`}
              style={{
                borderColor: urlError ? undefined : "var(--panel-border)",
              }}
              placeholder="https://..."
            />
            {urlError && (
              <p className="mt-0.5 text-[10px] text-red-400">{urlError}</p>
            )}
          </div>

          {/* 描述输入 */}

          <input
            type="text"
            value={link.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            className="w-full rounded-[10px] border bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]"
            style={{ borderColor: "var(--panel-border)" }}
            placeholder="描述（可选）"
          />
        </div>
      </div>

      {showIconPicker && (
        <LazyIconPicker
          value={link.icon}
          onChange={(icon) => onUpdate("icon", icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}
