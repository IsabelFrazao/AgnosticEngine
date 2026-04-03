import { z } from 'zod';
import { buttonAtomNodeBaseSchema } from '@/src/schemas/atoms/button.schema';
import { tableAtomNodeBaseSchema } from '@/src/schemas/atoms/table.schema';
import { themeSwitcherAtomNodeBaseSchema } from '@/src/schemas/atoms/theme-switcher.schema';

export const COMPONENT_TYPES = ['button', 'table', 'theme-switcher'] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

type ButtonNodeBase = z.infer<typeof buttonAtomNodeBaseSchema>;
type TableNodeBase = z.infer<typeof tableAtomNodeBaseSchema>;
type ThemeSwitcherNodeBase = z.infer<typeof themeSwitcherAtomNodeBaseSchema>;

/** Explicit recursive union (avoids `z.infer` on a lazy self-referential schema). */
export type MetadataNode =
  | (ButtonNodeBase & { children?: MetadataNode[] })
  | (TableNodeBase & { children?: MetadataNode[] })
  | (ThemeSwitcherNodeBase & { children?: MetadataNode[] });

/**
 * Recursive discriminated union on `type`.
 * Each branch may nest arbitrary depth via `children`.
 */
export const MetadataNodeSchema: z.ZodType<MetadataNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    buttonAtomNodeBaseSchema.extend({
      children: z.lazy(() => MetadataNodeSchema.array().optional()),
    }),
    tableAtomNodeBaseSchema.extend({
      children: z.lazy(() => MetadataNodeSchema.array().optional()),
    }),
    themeSwitcherAtomNodeBaseSchema.extend({
      children: z.lazy(() => MetadataNodeSchema.array().optional()),
    }),
  ]),
);
