'use client';

import Link from 'next/link';
import { Clipboard, ClipboardCheck, Save, LogOut, Loader2, Check, ArrowLeft, AlertCircle } from 'lucide-react';
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

  const feedback = saveError
    ? {
        text: saveError,
        className: 'text-red-400',
        icon: <AlertCircle className="h-3.5 w-3.5 shrink-0" />,
      }
    : statusMessage
      ? {
          text: statusMessage,
          className: 'text-emerald-500',
          icon: <Check className="h-3.5 w-3.5 shrink-0" />,
        }
      : isSaving
        ? {
            text: '正在保存到服务器',
            className: 'text-[var(--muted)]',
            icon: <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />,
          }
        : saved
          ? {
              text: '配置已保存',
              className: 'text-emerald-500',
              icon: <Check className="h-3.5 w-3.5 shrink-0" />,
            }
          : null;

  return (
    <section className="mb-2 rounded-[18px] border bg-[var(--panel-strong)] px-3 py-3 sm:mb-3 sm:px-4 sm:py-3.5" style={{ borderColor: 'var(--panel-border)' }}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
                title="返回首页"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-base font-semibold text-[var(--foreground)] sm:text-lg">
                编辑配置
              </h1>
              <span
                className="hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex"
                style={{ backgroundColor: 'var(--background)', color: 'var(--muted)' }}
              >
                {canSaveToServer ? '在线模式' : '静态模式'}
              </span>
            </div>

            {feedback && (
              <div className={`mt-1 flex items-center gap-1.5 text-xs sm:text-sm ${feedback.className}`}>
                {feedback.icon}
                <span className="truncate">{feedback.text}</span>
              </div>
            )}
          </div>

          <span
            className="inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:hidden"
            style={{ backgroundColor: 'var(--background)', color: 'var(--muted)' }}
          >
            {canSaveToServer ? '在线模式' : '静态模式'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canSaveToServer && onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={saveDisabled}
              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isSaving || saved
                  ? 'bg-emerald-500/16 text-emerald-500'
                  : 'bg-[var(--accent)] text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>保存中</span>
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>已保存</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>保存</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] border px-3 text-sm font-medium transition-colors ${
              copied
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500'
                : 'text-[var(--foreground)] hover:bg-[var(--background)]'
            }`}
            style={{ borderColor: copied ? undefined : 'var(--panel-border)' }}
          >
            {copied ? (
              <>
                <ClipboardCheck className="h-4 w-4" />
                <span>已复制</span>
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4" />
                <span>复制 YAML</span>
              </>
            )}
          </button>

          {canSaveToServer && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] border px-3 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--background)] hover:text-[var(--foreground)]"
              style={{ borderColor: 'var(--panel-border)' }}
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
              <span>退出</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
