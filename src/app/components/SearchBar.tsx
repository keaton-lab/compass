'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showResultCount?: boolean;
  resultCount?: number;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search links...',
  disabled = false,
  showResultCount = false,
  resultCount = 0,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((searchQuery: string) => {
    onSearch(searchQuery);
  }, [onSearch]);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 100);
  }, [handleSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className="relative w-full max-w-xl"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-panel relative rounded-[24px] p-1.5">
        <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2" aria-hidden="true">
          <Search 
            size={16}
            className={`transition-colors ${isFocused ? 'text-cyan-400' : 'text-[var(--muted)]'}`}
          />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-[20px] border border-transparent bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-[var(--muted)] focus:border-cyan-400/30 dark:text-white md:py-3.5 md:text-base disabled:cursor-not-allowed disabled:opacity-50"
        />

        {showResultCount && query && (
          <div className="absolute -bottom-7 left-1 text-xs tracking-[0.18em] text-[var(--muted)] uppercase">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
