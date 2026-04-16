"use client";

import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown } from "lucide-react";
import Button from "../../components/Button";
import type { Link as LinkType } from "../../types";
import LazyIconPicker from "./LazyIconPicker";
import DynamicIcon from "../../components/DynamicIcon";
import DeleteConfirmButton from "./DeleteConfirmButton";
import { validateLinkName, validateLinkUrl } from "../utils/validators";
import { AppInput } from "../../components/AppInput";

interface SortableLinkItemProps {
  link: LinkType;
  defaultExpanded?: boolean;
  autoScrollIntoView?: boolean;
  onUpdate: (field: keyof LinkType, value: string) => void;
  onDelete: () => void;
}

export default function SortableLinkItem({
  link,
  defaultExpanded = false,
  autoScrollIntoView = false,
  onUpdate,
  onDelete,
}: SortableLinkItemProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(defaultExpanded);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const nameError = validateLinkName(link.name);
  const urlError = validateLinkUrl(link.url);

  useEffect(() => {
    if (!autoScrollIntoView || !itemRef.current) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      itemRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [autoScrollIntoView]);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const dragTransform = transform ? { ...transform, x: 0 } : null;
  const dndStyle = {
    transform: CSS.Transform.toString(dragTransform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node);
          itemRef.current = node;
        }}
        className={`rounded-[14px] border bg-[var(--background)] px-3 py-2 transition-colors panel-border ${
          isDragging ? "shadow-lg ring-2 ring-[var(--accent)]" : ""
        }`}
        style={dndStyle}
      >
        <div className="flex items-center gap-2">
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
            onClick={(e: React.MouseEvent) => e.preventDefault()}
          />

          {/* 图标选择 */}
          <Button
            shape="icon"
            leftIcon={<DynamicIcon name={link.icon} size={16} />}
            size="sm"
            variant="secondary"
            title="更换图标"
            aria-label="更换图标"
            className="!bg-[var(--background)] [&_svg]:text-[var(--foreground)]"
            onClick={() => setShowIconPicker(true)}
          />

          {/* 名称输入 */}
          <div className="min-w-0 flex-1">
            <AppInput
              type="text"
              value={link.name}
              onChange={(e) => onUpdate("name", e.target.value)}
              error={!!nameError}
              placeholder="链接名称"
              size="sm"
            />
            {nameError && (
              <p className="mt-0.5 text-[10px] text-red-400">{nameError}</p>
            )}
          </div>

          {/* URL 输入 - PC端 */}
          <div className="min-w-0 flex-1 hidden sm:block">
            <AppInput
              type="text"
              value={link.url}
              onChange={(e) => onUpdate("url", e.target.value)}
              error={!!urlError}
              placeholder="https://..."
              size="sm"
            />
            {urlError && (
              <p className="mt-0.5 text-[10px] text-red-400">{urlError}</p>
            )}
          </div>

          {/* 删除按钮 */}
          <DeleteConfirmButton
            title="删除？"
            description={`"${link.name || "未命名链接"}" 将被移除。这个操作不能撤销。`}
            confirmLabel="删除"
            triggerTitle="删除"
            onConfirm={onDelete}
          />
        </div>

        {/* 展开的 URL（移动端）和描述 */}
        <div className={`${showAdvanced ? 'mt-2 space-y-1.5 pl-6' : 'hidden'} sm:mt-2 sm:block sm:space-y-1.5 sm:pl-6`}>
          {/* 移动端 URL 输入 */}
          <div className="sm:hidden">
            <AppInput
              type="text"
              value={link.url}
              onChange={(e) => onUpdate("url", e.target.value)}
              error={!!urlError}
              placeholder="https://..."
              size="sm"
            />
            {urlError && (
              <p className="mt-0.5 text-[10px] text-red-400">{urlError}</p>
            )}
          </div>

          {/* 描述输入 */}
          <AppInput
            type="text"
            value={link.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            placeholder="描述（可选）"
            size="sm"
          />
        </div>

        {/* 移动端展开/收起按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          rightIcon={<ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />}
          className={`mt-2 w-full sm:hidden ${
            showAdvanced ? '!bg-[var(--accent-alpha)] !text-[var(--accent)]' : '!text-[var(--muted)]'
          }`}
        >
          {showAdvanced ? '收起' : '展开'}
        </Button>
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
