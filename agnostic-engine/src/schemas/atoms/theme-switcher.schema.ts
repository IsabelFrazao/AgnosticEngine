import { z } from 'zod';
import { THEME_IDS } from '@/src/lib/theme/themes';
import type { ThemeId } from '@/src/lib/theme/theme-types';

const themeIdSchema = z.string().refine(
  (val): val is ThemeId => THEME_IDS.has(val as ThemeId),
  { message: `Must be one of: ${[...THEME_IDS].join(', ')}` },
);

export const themeSwitcherMetadataSchema = z.object({
  visibleThemes: z.array(themeIdSchema).min(1).optional(),
  groupLabel:    z.string().min(1).optional(),
});

export const themeSwitcherAtomNodeBaseSchema = z.object({
  id:          z.string().min(1),
  type:        z.literal('theme-switcher'),
  props:       z.object({ metadata: themeSwitcherMetadataSchema.optional() }).optional(),
  permissions: z.array(z.string()).optional(),
});
