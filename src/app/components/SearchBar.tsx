'use client';

import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
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

  const handleClear = () => {
    setQuery('');
    handleSearch('');
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
      className="relative w-full max-w-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10" aria-hidden="true">
          <Search 
            size={18} 
            className={`transition-colors ${isFocused ? 'text-blue-400' : 'text-gray-400'}`}
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
          className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {query && (
          <motion.button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Clear search"
          >
            <X size={18} className="text-gray-400 hover:text-white transition-colors" />
          </motion.button>
        )}

        {showResultCount && query && (
          <div className="absolute -bottom-6 left-0 text-sm text-gray-400">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </div>
        )}
      </div>
    </motion.div>
  );
}