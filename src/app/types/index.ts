import type { ThemeId } from '../themes';

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
  repo?: string;
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
