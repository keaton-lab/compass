'use client';

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { AlertDialog, Dialog } from 'radix-ui';
import { classNames } from './classNames';
import { modalOverlayClassName } from './modalStyles';

type DialogContentProps = ComponentPropsWithoutRef<typeof Dialog.Content>;
type AlertDialogContentProps = ComponentPropsWithoutRef<typeof AlertDialog.Content>;

interface AppDialogContentProps extends Omit<DialogContentProps, 'children'> {
  children: ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
}

interface AppAlertDialogContentProps extends Omit<AlertDialogContentProps, 'children'> {
  children: ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
}

export function AppDialogContent({
  children,
  overlayClassName,
  panelClassName,
  panelStyle,
  ...props
}: AppDialogContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={classNames(modalOverlayClassName, overlayClassName)} />
      <Dialog.Content
        className={panelClassName}
        style={panelStyle}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function AppAlertDialogContent({
  children,
  overlayClassName,
  panelClassName,
  panelStyle,
  ...props
}: AppAlertDialogContentProps) {
  return (
    <AlertDialog.Portal>
      <AlertDialog.Overlay className={classNames(modalOverlayClassName, overlayClassName)} />
      <AlertDialog.Content
        className={panelClassName}
        style={panelStyle}
        {...props}
      >
        {children}
      </AlertDialog.Content>
    </AlertDialog.Portal>
  );
}
