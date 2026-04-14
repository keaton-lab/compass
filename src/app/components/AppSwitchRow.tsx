'use client';

import type { ReactNode } from 'react';
import { Switch } from 'radix-ui';
import { classNames } from './classNames';

interface AppSwitchRowProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  className?: string;
  labelClassName?: string;
  switchClassName?: string;
  thumbClassName?: string;
}

export default function AppSwitchRow({
  checked,
  onCheckedChange,
  label,
  className,
  labelClassName,
  switchClassName,
  thumbClassName,
}: AppSwitchRowProps) {
  return (
    <label
      className={classNames(
        'flex cursor-pointer items-center justify-between rounded-[18px] border bg-[var(--background)] px-4 py-3.5 transition-colors',
        className,
      )}
      style={{ borderColor: 'var(--panel-border)' }}
    >
      <span className={classNames('text-sm font-medium text-[var(--foreground)]', labelClassName)}>
        {label}
      </span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={classNames(
          'relative h-6 w-11 rounded-[999px] border bg-[var(--bg-secondary)] outline-none transition-colors data-[state=checked]:bg-[var(--accent)]',
          switchClassName,
        )}
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <Switch.Thumb
          className={classNames(
            'block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[22px]',
            thumbClassName,
          )}
        />
      </Switch.Root>
    </label>
  );
}
