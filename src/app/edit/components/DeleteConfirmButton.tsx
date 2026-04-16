'use client';

import { AlertDialog } from 'radix-ui';
import { Trash2 } from 'lucide-react';
import { AppAlertDialogContent } from '../../components/AppDialog';
import Button from '../../components/Button';
import { useAnimatedDialogState } from '../../components/useAnimatedDialogState';

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
  const dialog = useAnimatedDialogState();

  return (
    <AlertDialog.Root open={dialog.open} onOpenChange={dialog.handleOpenChange}>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          className="rounded-[16px] p-3 text-red-400 transition-colors hover:bg-red-500/10"
          title={triggerTitle}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialog.Trigger>

      <AppAlertDialogContent
        isClosing={dialog.isClosing}
        overlayClassName="z-[130]"
        panelClassName="fixed inset-x-4 top-[18vh] z-[131] mx-auto w-full max-w-md rounded-[24px] border bg-[var(--panel-strong)] p-6 outline-none"
        panelStyle={{ borderColor: 'var(--panel-border)' }}
      >
          <AlertDialog.Title className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary">
                取消
              </Button>
            </AlertDialog.Cancel>
            <Button variant="danger" onClick={() => dialog.requestClose(onConfirm)}>
              {confirmLabel}
            </Button>
          </div>
      </AppAlertDialogContent>
    </AlertDialog.Root>
  );
}
