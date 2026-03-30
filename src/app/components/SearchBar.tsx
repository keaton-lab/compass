"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showResultCount?: boolean;
  resultCount?: number;
  // 新增紧凑模式开关，默认关闭，保持向后兼容
  compact?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = "搜索链接、描述或工作入口...",
  disabled = false,
  showResultCount = false,
  resultCount = 0,
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
      }, 100);
    },
    [handleSearch],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClear = useCallback(() => {
    setQuery("");
    handleSearch("");
  }, [handleSearch]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // 进入紧凑模式时需确保展开状态与聚焦行为一致
  // 其他行为保持与默认模式一致

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  // 桌面模式：始终展开显示搜索框
  if (compact) {
    return (
      <div className="hidden md:flex items-center" aria-label="搜索" role="search">
        <motion.div
          className="flex items-center h-10 min-w-[320px] rounded-2xl bg-white/60 pl-3 pr-2 shadow-md border border-black/10 overflow-hidden dark:border-white/10 dark:bg-slate-800/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Search size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 ml-2"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="清除搜索"
              className="ml-2 p-1 rounded-full border border-black/5 bg-black/5 text-slate-500 hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-slate-400 dark:hover:bg-white/20"
            >
              <X size={14} />
            </button>
          )}
        </motion.div>
        <AnimatePresence>
          {showResultCount && query && (
            <motion.div
              className="absolute left-0 -bottom-5 text-xs tracking-[0.15em] text-[var(--muted)] uppercase"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {resultCount} {resultCount === 1 ? "result" : "results"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 默认模式：保留原有完整宽度搜索框行为
  return (
    <motion.div
      className="relative w-full max-w-2xl"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="glass-panel relative rounded-2xl p-0.125 shadow-md"
        animate={{
          boxShadow: isFocused
            ? "0 20px 50px rgba(0, 0, 0, 0.12), 0 0 0 2px rgba(56, 189, 248, 0.2)"
            : "0 16px 40px rgba(0, 0, 0, 0.08)",
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
          aria-hidden="true"
        >
          <Search
            size={18}
            className={`transition-colors ${isFocused ? "text-sky-400" : "text-[var(--muted)]"}`}
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
          className="w-full rounded-xl border border-transparent bg-transparent py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-[var(--muted)] focus:border-transparent dark:text-white md:py-3.5 md:text-base disabled:cursor-not-allowed disabled:opacity-50"
        />

        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="absolute right-3 inset-y-0 my-auto flex h-7 w-7 items-center justify-center rounded-full border border-black/5 bg-black/5 text-[var(--muted)] transition-all hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {showResultCount && query && (
        <motion.div
          className="absolute -bottom-6 left-1 text-xs tracking-[0.15em] text-[var(--muted)] uppercase"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </motion.div>
      )}
    </motion.div>
  );
}
