'use client';

import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Select } from 'radix-ui';
import { classNames } from './classNames';

export interface AppSelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
}

export default function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  triggerClassName,
  contentClassName,
  itemClassName,
}: AppSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={classNames(
          'flex w-full items-center justify-between rounded-[18px] border bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors',
          triggerClassName,
        )}
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className={classNames(
            'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[18px] border bg-[var(--panel-strong)] p-1',
            contentClassName,
          )}
          style={{ borderColor: 'var(--panel-border)' }}
        >
          <Select.ScrollUpButton className="flex h-7 items-center justify-center text-[var(--muted)]">
            <ChevronUp className="h-4 w-4" />
          </Select.ScrollUpButton>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={classNames(
                  'relative flex cursor-pointer items-center rounded-[14px] px-9 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors data-[highlighted]:bg-[var(--bg-secondary)]',
                  itemClassName,
                )}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-3 inline-flex items-center">
                  <Check className="h-4 w-4 text-[var(--accent)]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-7 items-center justify-center text-[var(--muted)]">
            <ChevronDown className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
