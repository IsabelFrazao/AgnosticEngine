import { z } from 'zod';

const tableMetadataSchema = z.object({
  columns: z.array(z.string()).min(1),
  rows:    z.array(z.record(z.string(), z.unknown())),
});

export type TableMetadata = z.infer<typeof tableMetadataSchema>;

export { tableMetadataSchema };

export function parseTableMetadata(raw: unknown): TableMetadata {
  return tableMetadataSchema.parse(raw);
}
