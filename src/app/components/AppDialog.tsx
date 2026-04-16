'use client';

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { AlertDialog, Dialog } from 'radix-ui';
import { classNames } from './classNames';
import {
  modalContentPresenceClassName,
  modalOverlayClassName,
  modalPanelMotionClassName,
} from './modalStyles';

type DialogContentProps = ComponentPropsWithoutRef<typeof Dialog.Content>;
type AlertDialogContentProps = ComponentPropsWithoutRef<typeof AlertDialog.Content>;

interface BaseDialogContentProps {
  children: ReactNode;
  isClosing?: boolean;
  overlayClassName?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
}

type AppDialogContentProps = BaseDialogContentProps & Omit<DialogContentProps, 'children'>;
type AppAlertDialogContentProps = BaseDialogContentProps & Omit<AlertDialogContentProps, 'children'>;

function createDialogContent<P extends BaseDialogContentProps>(
  type: 'dialog' | 'alert',
) {
  const Portal = type === 'dialog' ? Dialog.Portal : AlertDialog.Portal;
  const Overlay = type === 'dialog' ? Dialog.Overlay : AlertDialog.Overlay;
  const Content = type === 'dialog' ? Dialog.Content : AlertDialog.Content;

  return function ContentComponent({
    children,
    isClosing = false,
    overlayClassName,
    panelClassName,
    panelStyle,
    ...props
  }: P) {
    return (
      <Portal>
        <Overlay
          className={classNames(modalOverlayClassName, overlayClassName)}
          data-closing={isClosing ? 'true' : undefined}
        />
        <Content
          className={classNames(modalContentPresenceClassName, panelClassName)}
          style={panelStyle}
          data-closing={isClosing ? 'true' : undefined}
          {...props}
        >
          <div
            className={modalPanelMotionClassName}
            data-closing={isClosing ? 'true' : undefined}
          >
            {children}
          </div>
        </Content>
      </Portal>
    );
  };
}

export const AppDialogContent = createDialogContent<AppDialogContentProps>('dialog');
export const AppAlertDialogContent = createDialogContent<AppAlertDialogContentProps>('alert');
