import { z } from 'zod';

/** Inner metadata for `Button` (parsed again at render via `parseButtonMetadata`). */
export const buttonMetadataSchema = z.object({
  labelKey:   z.string().min(1),
  variant:    z.enum(['primary', 'secondary', 'outline']),
  isDisabled: z.boolean().optional(),
  actionId:   z.string().optional(),
});

/**
 * Engine node for `type: "button"` without `children`.
 * `children` is attached in `root.schema.ts` for recursion.
 */
export const buttonAtomNodeBaseSchema = z.object({
  id:          z.string().min(1),
  type:        z.literal('button'),
  props:       z.object({ metadata: buttonMetadataSchema }).optional(),
  permissions: z.array(z.string()).optional(),
});
