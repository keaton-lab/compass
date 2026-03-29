import fs from 'fs';
import path from 'path';
import { load as yamlLoad } from 'js-yaml';
import { unstable_noStore as noStore } from 'next/cache';
import ClientLayout from './components/ClientLayout';
import type { Config } from './types';

function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'src', 'data', 'config.yaml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yamlLoad(fileContents) as Config;
}

export default function HomePage() {
  noStore();

  const config = loadConfig();
  const { profile, settings, categories } = config;

  return (
    <ClientLayout 
      profile={profile} 
      settings={settings} 
      categories={categories} 
    />
  );
}
