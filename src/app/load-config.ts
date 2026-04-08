import 'server-only';

import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { load as yamlLoad } from 'js-yaml';
import type { Config } from './types';
import { defaultThemeId, isThemeId } from './themes';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'config.yaml');

export const loadConfig = cache(function loadConfig(): Config {
  const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
  return yamlLoad(fileContents) as Config;
});

export const loadInitialTheme = cache(function loadInitialTheme() {
  const theme = loadConfig().settings?.theme;
  return typeof theme === 'string' && isThemeId(theme) ? theme : defaultThemeId;
});
