import type { z } from 'zod';
import { buttonMetadataSchema } from '@/src/schemas/atoms/button.schema';

export type ButtonMetadata = z.infer<typeof buttonMetadataSchema>;

export { buttonMetadataSchema };

export function parseButtonMetadata(raw: unknown): ButtonMetadata {
  return buttonMetadataSchema.parse(raw);
}
