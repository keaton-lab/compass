'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { modalCloseAnimationMs } from './modalStyles';

interface UseAnimatedDialogStateOptions {
  initialOpen?: boolean;
  onAfterClose?: () => void;
}

export function useAnimatedDialogState({
  initialOpen = false,
  onAfterClose,
}: UseAnimatedDialogStateOptions = {}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  const finishClose = useCallback((afterClose?: () => void) => {
    setIsClosing(false);
    closeTimerRef.current = null;
    afterClose?.();
    onAfterClose?.();
  }, [onAfterClose]);

  const requestClose = useCallback((afterClose?: () => void) => {
    if (!isOpen || isClosing) {
      return;
    }

    clearCloseTimer();
    setIsOpen(false);
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      finishClose(afterClose);
    }, modalCloseAnimationMs);
  }, [clearCloseTimer, finishClose, isClosing, isOpen]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      clearCloseTimer();
      setIsClosing(false);
      setIsOpen(true);
      return;
    }

    requestClose();
  }, [clearCloseTimer, requestClose]);

  return {
    isClosing,
    open: isOpen || isClosing,
    requestClose,
    handleOpenChange,
  };
}
