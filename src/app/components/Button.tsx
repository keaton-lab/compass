'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from './classNames';

// 按钮变体类型
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

// 按钮尺寸类型
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'icon';

// 按钮状态类型
export type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** 按钮变体 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 当前状态 */
  state?: ButtonState;
  /** 加载时显示的文字 */
  loadingText?: string;
  /** 成功时显示的文字 */
  successText?: string;
  /** 错误时显示的文字 */
  errorText?: string;
  /** 左侧图标 */
  leftIcon?: ReactNode;
  /** 右侧图标 */
  rightIcon?: ReactNode;
  /** 是否占满宽度 */
  fullWidth?: boolean;
  /** 自定义样式类 */
  className?: string;
  /** 按钮形状 */
  shape?: ButtonShape;
  /** 子元素 */
  children?: ReactNode;
}

// 变体样式映射
const variantStyles: Record<ButtonVariant, Record<ButtonState, string>> = {
  primary: {
    idle: 'bg-[var(--accent)] text-white hover:opacity-90',
    loading: 'bg-[var(--accent)] text-white opacity-80 cursor-wait',
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
  },
  secondary: {
    idle: 'border border-[var(--panel-border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--bg-secondary)]',
    loading: 'border border-[var(--panel-border)] bg-transparent text-[var(--foreground)] opacity-60 cursor-wait',
    success: 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-500',
    error: 'border border-red-500/50 bg-red-500/10 text-red-500',
  },
  ghost: {
    idle: 'bg-transparent text-[var(--muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--foreground)]',
    loading: 'bg-transparent text-[var(--muted)] opacity-60 cursor-wait',
    success: 'bg-emerald-500/10 text-emerald-500',
    error: 'bg-red-500/10 text-red-500',
  },
  danger: {
    idle: 'bg-red-500 text-white hover:opacity-90',
    loading: 'bg-red-500 text-white opacity-80 cursor-wait',
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-600 text-white',
  },
  success: {
    idle: 'bg-emerald-500 text-white hover:opacity-90',
    loading: 'bg-emerald-500 text-white opacity-80 cursor-wait',
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-500 text-white',
  },
};

// 尺寸样式映射
const sizeStyles: Record<ButtonShape, Record<ButtonSize, string>> = {
  default: {
    sm: 'h-7 px-2.5 text-xs gap-1 rounded-[10px]',
    md: 'h-9 px-3 text-sm gap-1.5 rounded-[12px]',
    lg: 'h-11 px-5 text-base gap-2 rounded-[16px]',
  },
  icon: {
    sm: 'h-8 w-8 rounded-[10px]',
    md: 'h-9 w-9 rounded-[12px]',
    lg: 'h-10 w-10 rounded-[14px]',
  },
};

// 图标尺寸映射
const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

/**
 * 通用 Button 组件
 *
 * 支持多种变体、尺寸和状态反馈
 *
 * @example
 * // 基础用法
 * <Button>点击我</Button>
 *
 * // 带状态的按钮
 * <Button
 *   state={isSaving ? 'loading' : saveSuccess ? 'success' : 'idle'}
 *   loadingText="保存中"
 *   successText="已保存"
 * >
 *   保存
 * </Button>
 *
 * // 不同变体
 * <Button variant="primary">主要</Button>
 * <Button variant="secondary">次要</Button>
 * <Button variant="danger">危险</Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    state = 'idle',
    loadingText,
    successText,
    errorText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    shape = 'default',
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  // 根据状态决定是否禁用
  const isDisabled = disabled || isLoading;

  // 获取当前状态下的文字内容
  const getContent = () => {
    if (isLoading && loadingText) return loadingText;
    if (isSuccess && successText) return successText;
    if (isError && errorText) return errorText;
    return children;
  };

  // 获取当前状态下的图标
  const getLeftIcon = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin" size={iconSizes[size]} />;
    }
    if (leftIcon) {
      return leftIcon;
    }
    return null;
  };

  // 组合样式
  const buttonClasses = classNames(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50',
    variantStyles[variant][state],
    sizeStyles[shape][size],
    shape === 'icon' ? 'shrink-0 px-0' : '',
    fullWidth && shape !== 'icon' ? 'w-full' : '',
    className,
  );

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      className={buttonClasses}
      {...rest}
    >
      {getLeftIcon()}
      {shape === 'icon' ? null : <span>{getContent()}</span>}
      {!isLoading && rightIcon}
    </button>
  );
});

export default Button;
