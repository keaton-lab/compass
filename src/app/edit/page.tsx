import EditClient from './EditClient';
import { loadConfig, loadEditCapabilities } from '../load-config';

export default function EditPage() {
  const config = loadConfig();
  const capabilities = loadEditCapabilities();

  return (
    <EditClient
      initialConfig={config}
      canSaveToServer={capabilities.canSaveToServer}
    />
  );
}
