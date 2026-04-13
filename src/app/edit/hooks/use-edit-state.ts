import { useState, useCallback } from 'react';
import type { Config } from '../../types';

interface UseEditStateReturn {
  config: Config;
  setConfig: (updater: Config | ((prev: Config) => Config)) => void;
  reset: (initialConfig: Config) => void;
}

export function useEditState(initialConfig: Config): UseEditStateReturn {
  const [config, setConfigState] = useState<Config>(initialConfig);

  const setConfig = useCallback(
    (updater: Config | ((prev: Config) => Config)) => {
      setConfigState((prev) => {
        return typeof updater === 'function' ? (updater as (p: Config) => Config)(prev) : updater;
      });
    },
    []
  );

  const reset = useCallback((newConfig: Config) => {
    setConfigState(newConfig);
  }, []);

  return {
    config,
    setConfig,
    reset,
  };
}
