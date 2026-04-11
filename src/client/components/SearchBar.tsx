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
  placeholder = '搜索链接...',
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
      <div className="home-search-bar home-search-bar--compact relative hidden items-center md:flex" aria-label="搜索" role="search">
        <div
          className="flex h-10 min-w-[280px] items-center rounded-lg border bg-[var(--panel-strong)] pl-3 pr-2 transition-colors duration-200 focus-within:border-[var(--accent)]"
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
              className="ml-2 flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {showResultCount && query && (
          <div className="absolute -bottom-5 left-1 text-xs text-[var(--muted)]">
            {resultCount} 个结果
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="home-search-bar relative w-full max-w-2xl">
      <div
        className="relative rounded-lg border bg-[var(--panel-strong)] transition-colors duration-200 focus-within:border-[var(--accent)]"
        style={{ borderColor: 'var(--panel-border)' }}
      >
        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2" aria-hidden="true">
          <Search size={16} className="text-[var(--muted)]" />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg bg-transparent py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--muted)] md:py-3 md:text-base disabled:cursor-not-allowed disabled:opacity-50"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition-colors duration-200 hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showResultCount && query && (
        <div className="absolute -bottom-5 left-1 text-xs text-[var(--muted)]">
          {resultCount} 个结果
        </div>
      )}
    </div>
  );
}
