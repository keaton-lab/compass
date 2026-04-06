import fs from 'fs';
import path from 'path';
import { load as yamlLoad } from 'js-yaml';
import EditClient from './EditClient';
import type { Config } from '../types';

export const dynamic = 'force-static';

function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'src', 'config.yaml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yamlLoad(fileContents) as Config;
}

export default function EditPage() {
  const config = loadConfig();

  return (
    <EditClient initialConfig={config} />
  );
}
