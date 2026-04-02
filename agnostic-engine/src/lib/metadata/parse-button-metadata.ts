import { z } from 'zod';

const buttonMetadataSchema = z.object({
  labelKey:   z.string().min(1),
  variant:    z.enum(['primary', 'secondary', 'outline']),
  isDisabled: z.boolean().optional(),
});

export type ButtonMetadata = z.infer<typeof buttonMetadataSchema>;

export { buttonMetadataSchema };

export function parseButtonMetadata(raw: unknown): ButtonMetadata {
  return buttonMetadataSchema.parse(raw);
}
