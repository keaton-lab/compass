import 'server-only';

import { unstable_noStore as noStore } from 'next/cache';
import type { Config } from './types';
import { defaultThemeId, isThemeId } from './themes';
import configStore from '../server/config-store';
import runtime from '../server/runtime';
import { resolveConfigIcons } from './resolve-config-icons';

const { loadConfigFile, resolveConfigPath } = configStore as {
  loadConfigFile: () => Config;
  resolveConfigPath: () => string;
};
const { canSaveToServer, isServerBuild } = runtime as {
  canSaveToServer: () => boolean;
  isServerBuild: () => boolean;
};

export interface EditCapabilities {
  canSaveToServer: boolean;
  configPath: string;
}

export function loadConfig(): Config {
  if (isServerBuild()) {
    noStore();
  }

  return loadConfigFile();
}

export async function loadResolvedConfig() {
  return resolveConfigIcons(loadConfig());
}

export function loadInitialTheme() {
  const theme = loadConfig().settings?.theme;
  return typeof theme === 'string' && isThemeId(theme) ? theme : defaultThemeId;
}

export function loadEditCapabilities(): EditCapabilities {
  return {
    canSaveToServer: canSaveToServer(),
    configPath: resolveConfigPath(),
  };
}
