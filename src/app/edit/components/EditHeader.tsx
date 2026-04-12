'use client';

import Link from 'next/link';
import { Clipboard, ClipboardCheck, Save, LogOut, Loader2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditHeaderProps {
  yamlContent: string;
  canSaveToServer: boolean;
  onSave?: () => void;
  saveDisabled?: boolean;
  isSaving?: boolean;
  saveSucceeded?: boolean;
  saveError?: string | null;
  statusMessage?: string | null;
  onLogout?: () => void;
}

export default function EditHeader({
  yamlContent,
  canSaveToServer,
  onSave,
  saveDisabled = false,
  isSaving = false,
  saveSucceeded = false,
  saveError,
  statusMessage,
  onLogout,
}: EditHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const showCopiedState = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isSaving || saveError || !saveSucceeded) {
      setSaved(false);
      return;
    }

    setSaved(true);
    const timeoutId = window.setTimeout(() => setSaved(false), 2000);

    return () => window.clearTimeout(timeoutId);
  }, [isSaving, saveError, saveSucceeded]);

  const fallbackCopyToClipboard = (content: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copiedByExecCommand = false;

    try {
      copiedByExecCommand = document.execCommand('copy');
    } catch {
      copiedByExecCommand = false;
    } finally {
      document.body.removeChild(textarea);
    }

    return copiedByExecCommand;
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(yamlContent);
        showCopiedState();
        return;
      }

      if (fallbackCopyToClipboard(yamlContent)) {
        showCopiedState();
        return;
      }

      alert('复制失败，请手动复制 YAML 编辑器中的内容');
    } catch {
      if (fallbackCopyToClipboard(yamlContent)) {
        showCopiedState();
        return;
      }

      alert('复制失败，请手动复制 YAML 编辑器中的内容');
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[22px] border bg-[var(--panel-strong)] px-5 py-4" style={{ borderColor: 'var(--panel-border)' }}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          编辑配置
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {canSaveToServer
            ? `当前为在线编辑模式`
            : `当前为静态导出模式，请复制 YAML 后手动保存到 public/config.yaml`}
        </p>
        {(statusMessage || saveError) && (
          <p className={`mt-2 text-xs ${saveError ? 'text-red-400' : 'text-emerald-500'}`}>
            {saveError ?? statusMessage}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canSaveToServer && onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saveDisabled}
            className={`flex items-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isSaving || saved
                ? 'bg-emerald-500/16 text-emerald-500'
                : 'bg-[var(--accent)] text-white'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存
              </>
            )}
          </button>
        )}

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
              复制
            </>
          )}
        </button>

        {canSaveToServer && onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-[16px] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
          >
            <LogOut className="w-4 h-4" />
            退出
          </button>
        )}

        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-[16px] px-3 py-2 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
        >
          返回
        </Link>
      </div>
    </div>
  );
}
