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
    <div className="mb-8 flex items-center justify-between rounded-[22px] border bg-[var(--panel-strong)] px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          编辑配置
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          修改配置后复制 YAML 到 src/config.yaml 文件
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 mr-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-[14px] p-2 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
            title="撤销"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-[14px] p-2 text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-30"
            title="重做"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-medium transition-colors ${
            copied
              ? 'bg-emerald-500/16 text-emerald-500'
              : 'bg-[var(--accent)] text-white'
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
          className="flex items-center gap-1.5 rounded-[16px] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
        >
          返回
        </a>
      </div>
    </div>
  );
}
