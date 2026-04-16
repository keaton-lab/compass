'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { classNames } from './classNames';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'ghost';

interface BaseInputProps {
  size?: InputSize;
  variant?: InputVariant;
  error?: boolean;
  inputClassName?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

interface AppInputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  multiline?: false;
}

interface AppTextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  multiline: true;
}

const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: {
    input: 'rounded-[10px] px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
  },
  md: {
    input: 'rounded-[14px] px-4 py-2.5 text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    input: 'rounded-[18px] px-4 py-3 text-sm',
    icon: 'h-5 w-5',
  },
};

const variantStyles: Record<InputVariant, string> = {
  default: 'bg-[var(--background)] border panel-border',
  ghost: 'bg-transparent border-transparent',
};

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(function AppInput(
  {
    size = 'md',
    variant = 'default',
    error = false,
    inputClassName,
    leftIcon,
    rightIcon,
    className,
    ...props
  },
  ref,
) {
  const hasIcon = Boolean(leftIcon || rightIcon);

  return (
    <div className={classNames('relative', className)}>
      {leftIcon && (
        <div className={classNames(
          'absolute top-1/2 -translate-y-1/2 text-[var(--muted)]',
          size === 'sm' ? 'left-2.5' : size === 'md' ? 'left-3.5' : 'left-4',
        )}>
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        className={classNames(
          'w-full outline-none transition-colors placeholder:text-[var(--muted)]',
          'text-[var(--foreground)]',
          'focus:border-[var(--accent-border)]',
          sizeStyles[size].input,
          variantStyles[variant],
          error && 'error-border',
          hasIcon && leftIcon && (size === 'sm' ? 'pl-8' : size === 'md' ? 'pl-10' : 'pl-11') || '',
          hasIcon && rightIcon && (size === 'sm' ? 'pr-8' : size === 'md' ? 'pr-10' : 'pr-11') || '',
          inputClassName,
        )}
        {...props}
      />
      {rightIcon && (
        <div className={classNames(
          'absolute top-1/2 -translate-y-1/2 text-[var(--muted)]',
          size === 'sm' ? 'right-2.5' : size === 'md' ? 'right-3.5' : 'right-4',
        )}>
          {rightIcon}
        </div>
      )}
    </div>
  );
});

const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(function AppTextarea(
  {
    variant = 'default',
    error = false,
    inputClassName,
    className,
    ...props
  },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={classNames(
        'w-full outline-none transition-colors placeholder:text-[var(--muted)]',
        'text-[var(--foreground)]',
        'focus:border-[var(--accent-border)]',
        error && 'error-border',
        variantStyles[variant],
        inputClassName,
        className,
      )}
      {...props}
    />
  );
});

export { AppInput, AppTextarea };
export type { AppInputProps, AppTextareaProps };
