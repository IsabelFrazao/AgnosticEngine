import { z } from 'zod';
import { THEME_IDS } from '@/src/lib/theme/themes';
import type { ThemeId } from '@/src/lib/theme/theme-types';

const themeIdSchema = z.string().refine(
  (val): val is ThemeId => THEME_IDS.has(val as ThemeId),
  { message: `Must be one of: ${[...THEME_IDS].join(', ')}` },
);

const themeSwitcherMetadataSchema = z.object({
  visibleThemes: z.array(themeIdSchema).min(1).optional(),
  groupLabel:    z.string().min(1).optional(),
});

export type ThemeSwitcherMetadata = z.infer<typeof themeSwitcherMetadataSchema>;

export { themeSwitcherMetadataSchema };

export function parseThemeSwitcherMetadata(raw: unknown): ThemeSwitcherMetadata {
  return themeSwitcherMetadataSchema.parse(raw ?? {});
}
