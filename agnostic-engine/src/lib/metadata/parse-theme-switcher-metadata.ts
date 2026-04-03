import type { z } from 'zod';
import { themeSwitcherMetadataSchema } from '@/src/schemas/atoms/theme-switcher.schema';

export type ThemeSwitcherMetadata = z.infer<typeof themeSwitcherMetadataSchema>;

export { themeSwitcherMetadataSchema };

export function parseThemeSwitcherMetadata(raw: unknown): ThemeSwitcherMetadata {
  return themeSwitcherMetadataSchema.parse(raw ?? {});
}
