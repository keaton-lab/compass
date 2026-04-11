import type { ThemeId } from '../themes';
import type { ResolvedIconData } from '../icon-types';

export type { ThemeId };

export interface Link {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  links: Link[];
}

export interface Profile {
  name: string;
  avatar?: string;
  description: string;
  bio?: string;
}

export interface Settings {
  theme: ThemeId;
  showSearch: boolean;
  layout: 'grid' | 'list';
  animations: boolean;
  searchQuery?: string;
}

export interface Config {
  profile: Profile;
  settings: Settings;
  categories: Category[];
}

export interface ResolvedLink extends Link {
  resolvedIcon?: ResolvedIconData | null;
}

export interface ResolvedCategory extends Omit<Category, 'links'> {
  links: ResolvedLink[];
  resolvedIcon?: ResolvedIconData | null;
}

export interface ResolvedProfile extends Profile {
  resolvedAvatarIcon?: ResolvedIconData | null;
}

export interface ResolvedConfig {
  profile: ResolvedProfile;
  settings: Settings;
  categories: ResolvedCategory[];
}
