import type { ZodType } from 'zod';

export function parseWithSchema<T>(
  schema: ZodType<T>,
  raw: unknown,
  fallback?: T,
): T {
  return schema.parse(raw ?? fallback);
}
