import fs from 'fs';
import path from 'path';
import { load as yamlLoad } from 'js-yaml';
import ClientLayout from './components/ClientLayout';
import type { Config } from './types';

function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'src', 'data', 'config.yaml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yamlLoad(fileContents) as Config;
}

const config: Config = loadConfig();

export default function HomePage() {
  const { profile, settings, categories } = config;

  return (
    <ClientLayout 
      profile={profile} 
      settings={settings} 
      categories={categories} 
    />
  );
}