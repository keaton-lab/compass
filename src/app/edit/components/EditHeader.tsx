'use client';

import { Undo2, Redo2, Clipboard, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

interface EditHeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  yamlContent: string;
}

export default function EditHeader({ onUndo, onRedo, canUndo, canRedo, yamlContent }: EditHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--panel-border)]">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          编辑配置
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          修改配置后复制 YAML 到 src/data/config.yaml 文件
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="撤销"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="重做"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90'
          }`}
        >
          {copied ? (
            <>
              <ClipboardCheck className="w-4 h-4" />
              已复制
            </>
          ) : (
            <>
              <Clipboard className="w-4 h-4" />
              复制 YAML
            </>
          )}
        </button>

        {/* Back link */}
        <a
          href="/"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10 transition-colors"
        >
          返回
        </a>
      </div>
    </div>
  );
}
