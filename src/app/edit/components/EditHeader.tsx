'use client';

import { Clipboard, Save, LogOut, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import { Toast, useToast } from '../../components/Toast';

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
  isSaving: isSavingProp = false,
  saveSucceeded = false,
  saveError,
  statusMessage,
  onLogout,
}: EditHeaderProps) {
  const [copyState, setCopyState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isMinLoading, setIsMinLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // 合并外部保存状态和本地最小 loading 时间
  const isSaving = isSavingProp || isMinLoading;

  // 监听保存结果，通过 Toast 提示
  useEffect(() => {
    if (isSaving) return;

    if (saveError) {
      showToast(saveError, 'error');
      return;
    }

    if (statusMessage) {
      showToast(statusMessage, 'error');
      return;
    }

    if (saveSucceeded) {
      showToast('保存成功', 'success');
    }
  }, [isSaving, saveError, saveSucceeded, statusMessage, showToast]);

  // 复制到剪贴板的降级方案
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

  // 执行复制操作
  const handleCopy = async () => {
    if (copyState === 'loading') {
      return;
    }

    setCopyState('loading');

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(yamlContent);
      } else if (!fallbackCopyToClipboard(yamlContent)) {
        throw new Error('复制失败');
      }

      setCopyState('success');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  // 处理保存，添加最小 loading 时间避免闪烁
  const handleSave = () => {
    if (isSaving || saveDisabled || !onSave) return;

    // 先进入 loading 状态
    setIsMinLoading(true);

    // 触发实际保存
    onSave();

    // 至少显示 600ms loading，避免闪烁
    setTimeout(() => {
      setIsMinLoading(false);
    }, 600);
  };

  return (
    <>
      <section className="mb-2 rounded-[18px] border bg-[var(--panel-strong)] px-3 py-3 sm:mb-3 sm:px-4 sm:py-3.5" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                shape="icon"
                leftIcon={<ArrowLeft />}
                size="sm"
                variant="ghost"
                aria-label="返回首页"
                title="返回首页"
                className="[&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[var(--muted)]"
                onClick={() => window.location.href = '/'}
              />
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

            <span
              className="inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:hidden"
              style={{ backgroundColor: 'var(--background)', color: 'var(--muted)' }}
            >
              {canSaveToServer ? '在线模式' : '静态模式'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canSaveToServer && onSave && (
              <Button
                variant="primary"
                state={isSaving ? 'loading' : 'idle'}
                loadingText="保存中"
                leftIcon={<Save className="h-4 w-4" />}
                onClick={handleSave}
                disabled={saveDisabled || isSaving}
              >
                保存
              </Button>
            )}

            <Button
              variant="secondary"
              state={copyState}
              onClick={() => void handleCopy()}
              loadingText="复制中"
              successText="已复制"
              leftIcon={<Clipboard className="h-4 w-4" />}
            >
              复制 YAML
            </Button>

            {canSaveToServer && onLogout && (
              <Button
                variant="ghost"
                leftIcon={<LogOut className="h-4 w-4" />}
                onClick={onLogout}
              >
                退出
              </Button>
            )}
          </div>
        </div>
      </section>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />
    </>
  );
}
