import EditClient from './EditClient';
import { loadConfig } from '../load-config';

export const dynamic = 'force-static';

export default function EditPage() {
  const config = loadConfig();

  return (
    <EditClient initialConfig={config} />
  );
}
