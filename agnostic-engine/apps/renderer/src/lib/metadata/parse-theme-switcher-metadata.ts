import type { z } from 'zod';
import { parseWithSchema } from '@agnostic/engine-core';
import { themeSwitcherMetadataSchema } from '@/src/schemas/atoms/theme-switcher.schema';

export type ThemeSwitcherMetadata = z.infer<typeof themeSwitcherMetadataSchema>;

export { themeSwitcherMetadataSchema };

export function parseThemeSwitcherMetadata(raw: unknown): ThemeSwitcherMetadata {
  // `raw` may be undefined when the schema node has no props.metadata — all fields
  // are optional so an empty object is valid and renders all themes with defaults.
  return parseWithSchema(themeSwitcherMetadataSchema, raw, {});
}
