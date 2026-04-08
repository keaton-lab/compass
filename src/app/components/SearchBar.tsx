'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showResultCount?: boolean;
  resultCount?: number;
  compact?: boolean;
  value?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = '搜索链接、描述或工作入口...',
  disabled = false,
  showResultCount = false,
  resultCount = 0,
  compact = false,
  value: externalValue,
}: SearchBarProps) {
  const [query, setQuery] = useState(externalValue ?? '');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevExternalValue = useRef(externalValue);

  useEffect(() => {
    if (externalValue !== undefined && externalValue !== prevExternalValue.current) {
      prevExternalValue.current = externalValue;
      setQuery(externalValue);
    }
  }, [externalValue]);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      onSearch(searchQuery);
    },
    [onSearch],
  );

  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 140);
    },
    [handleSearch],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = useCallback(() => {
    setQuery('');
    handleSearch('');
  }, [handleSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (compact) {
    return (
      <div className="relative hidden items-center md:flex" aria-label="搜索" role="search">
        <div
          className="flex h-11 min-w-[320px] items-center rounded-[18px] border bg-[var(--panel-strong)] pl-3 pr-2"
          style={{ borderColor: 'var(--panel-border)' }}
        >
          <Search size={16} className="shrink-0 text-[var(--muted)]" />
          <input
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className="ml-2 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--muted)]"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="清除搜索"
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-[10px] border bg-[var(--background)] text-[var(--muted)]"
              style={{ borderColor: 'var(--panel-border)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {showResultCount && query && (
          <div className="absolute -bottom-6 left-1 text-xs text-[var(--muted)]">
            {resultCount} 个结果
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className="relative rounded-[18px] border bg-[var(--panel-strong)]"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2" aria-hidden="true">
          <Search size={18} className="text-[var(--muted)]" />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-[18px] bg-transparent py-3 pl-11 pr-11 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--muted)] md:py-3.5 md:text-base disabled:cursor-not-allowed disabled:opacity-50"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-3 my-auto flex h-7 w-7 items-center justify-center rounded-[10px] border bg-[var(--background)] text-[var(--muted)]"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showResultCount && query && (
        <div className="absolute -bottom-6 left-1 text-xs text-[var(--muted)]">
          {resultCount} 个结果
        </div>
      )}
    </div>
  );
}
