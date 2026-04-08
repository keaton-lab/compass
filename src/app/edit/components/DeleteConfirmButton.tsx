'use client';

import { AlertDialog } from 'radix-ui';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmButtonProps {
  title: string;
  description: string;
  confirmLabel: string;
  triggerTitle: string;
  onConfirm: () => void;
}

export default function DeleteConfirmButton({
  title,
  description,
  confirmLabel,
  triggerTitle,
  onConfirm,
}: DeleteConfirmButtonProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          className="rounded-[16px] p-3 text-red-400 transition-colors hover:bg-red-500/10"
          title={triggerTitle}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[130] bg-[var(--background)]/72 backdrop-blur-sm" />
        <AlertDialog.Content
          className="fixed inset-x-4 top-[18vh] z-[131] mx-auto w-full max-w-md rounded-[24px] border bg-[var(--panel-strong)] p-6 outline-none"
          style={{ borderColor: 'var(--panel-border)' }}
        >
          <AlertDialog.Title className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="rounded-[16px] border px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: 'var(--panel-border)' }}
              >
                取消
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-[16px] bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
