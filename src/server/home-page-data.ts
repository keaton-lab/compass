import { resolveConfigIcons, resolveIcon } from '@/shared/icon-resolver';
import type { Config, HomePagePayload } from '@/shared/types';

export async function createHomePagePayload(
  config: Config,
): Promise<HomePagePayload> {
  const resolvedConfig = await resolveConfigIcons(config);
  const footerGithubIcon = await resolveIcon('github');

  return {
    ...resolvedConfig,
    footerGithubIcon,
  };
}

