import type { Capabilities } from '@/shared/types';
import {
  canEnableGithubPublishing,
  getRuntimeMode,
  getSessionSecret,
  hasAdminToken,
} from './env';

export function getRuntimeCapabilities(): Capabilities {
  const mode = getRuntimeMode();
  const canLogin = mode === 'server' && hasAdminToken() && getSessionSecret().length > 0;

  return {
    mode,
    canLogin,
    canSaveToFile: canLogin,
    canPublishToGithub: mode === 'server' && canEnableGithubPublishing(),
  };
}
