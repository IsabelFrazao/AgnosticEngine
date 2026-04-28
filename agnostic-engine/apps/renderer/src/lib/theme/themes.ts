import type { Theme, ThemeId } from './theme-types';
import { DarkIcon, ForestIcon, LightIcon, OceanIcon, SystemIcon } from './theme-icons';

export const THEMES: readonly Theme[] = [
  { id: 'system', label: 'System', Icon: SystemIcon },
  { id: 'light',  label: 'Light',  Icon: LightIcon  },
  { id: 'dark',   label: 'Dark',   Icon: DarkIcon   },
  { id: 'ocean',  label: 'Ocean',  Icon: OceanIcon  },
  { id: 'forest', label: 'Forest', Icon: ForestIcon },
] as const;

export const THEME_IDS = new Set<ThemeId>(THEMES.map((t) => t.id));

export const DEFAULT_THEME_ID: ThemeId = 'system';
