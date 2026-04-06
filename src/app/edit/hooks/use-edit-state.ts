import { useState, useCallback } from 'react';
import type { Config } from '../../types';

const MAX_HISTORY = 30;

interface UseEditStateReturn {
  config: Config;
  setConfig: (updater: Config | ((prev: Config) => Config)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (initialConfig: Config) => void;
}

export function useEditState(initialConfig: Config): UseEditStateReturn {
  const [config, setConfigState] = useState<Config>(initialConfig);
  const [history, setHistory] = useState<Config[]>([]);
  const [future, setFuture] = useState<Config[]>([]);

  const setConfig = useCallback(
    (updater: Config | ((prev: Config) => Config)) => {
      setConfigState((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: Config) => Config)(prev) : updater;
        setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), prev]);
        setFuture([]);
        return next;
      });
    },
    []
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setFuture((f) => [...f, config]);
      setConfigState(previous);
      return h.slice(0, -1);
    });
  }, [config]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[f.length - 1];
      setHistory((h) => [...h, config]);
      setConfigState(next);
      return f.slice(0, -1);
    });
  }, [config]);

  const reset = useCallback((newConfig: Config) => {
    setConfigState(newConfig);
    setHistory([]);
    setFuture([]);
  }, []);

  return {
    config,
    setConfig,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    reset,
  };
}
