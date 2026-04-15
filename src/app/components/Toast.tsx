'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { classNames } from './classNames';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  visible: boolean;
}

export function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  visible,
}: ToastProps) {
  if (!visible) return null;

  return (
    <ToastVisible
      key={`${type}:${message}:${duration}`}
      message={message}
      type={type}
      duration={duration}
      onClose={onClose}
    />
  );
}

function ToastVisible({
  message,
  type,
  duration = 2000,
  onClose,
}: Omit<ToastProps, 'visible'>) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    const closeTimer = setTimeout(() => {
      onClose?.();
    }, duration + 200);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const icon = type === 'success'
    ? <CheckCircle className="h-4 w-4 text-emerald-500" />
    : <XCircle className="h-4 w-4 text-red-500" />;

  return (
    <div
      className={classNames(
        'fixed top-4 left-1/2 z-[200] -translate-x-1/2',
        'flex items-center gap-2 rounded-lg border px-4 py-2.5 shadow-lg',
        'bg-[var(--panel-strong)] transition-all duration-200',
        isExiting ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
      )}
      style={{ borderColor: 'var(--panel-border)' }}
    >
      {icon}
      <span className="text-sm text-[var(--foreground)]">{message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose?.(), 200);
        }}
        className="ml-1 flex h-5 w-5 items-center justify-center rounded text-[var(--muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Hook 用于管理 Toast 状态
export function useToast() {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // 使用 useCallback 缓存函数引用，避免无限循环
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}
