import type { z } from 'zod';
import { parseWithSchema } from '@agnostic/engine-core';
import { tableMetadataSchema } from '@/src/schemas/atoms/table.schema';

export type TableMetadata = z.infer<typeof tableMetadataSchema>;

export { tableMetadataSchema };

export function parseTableMetadata(raw: unknown): TableMetadata {
  return parseWithSchema(tableMetadataSchema, raw);
}
