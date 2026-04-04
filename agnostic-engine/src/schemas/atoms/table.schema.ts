import { z } from 'zod';

export const tableMetadataSchema = z.object({
  columns: z.array(z.string()).min(1),
  rows:    z.array(z.record(z.string(), z.unknown())),
  caption: z.string().min(1).optional(),
});

export const tableAtomNodeBaseSchema = z.object({
  id:          z.string().min(1),
  type:        z.literal('table'),
  props:       z.object({ metadata: tableMetadataSchema }).optional(),
  permissions: z.array(z.string()).optional(),
});
