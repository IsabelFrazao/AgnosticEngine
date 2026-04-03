import type { MetadataSchemaItem } from '@/src/lib/metadata-types';
import rawSchema from './mock-schema.json';

/** Sample UTC ISO string used on the home page and in mock table rows. */
export const DEMO_UPDATED_AT = '2026-04-01T12:00:00.000Z';

// Cast is intentional: TypeScript validates the outer MetadataSchemaItem shape
// at compile time; Zod parsers validate the inner metadata shapes at runtime.
export const mockSchema = rawSchema as MetadataSchemaItem[];
