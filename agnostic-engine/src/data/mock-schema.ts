import type { MetadataSchemaItem } from '@/src/lib/metadata-types';
import rawSchema from './mock-schema.json';

// Cast is intentional: TypeScript validates the outer MetadataSchemaItem shape
// at compile time; Zod parsers validate the inner metadata shapes at runtime.
export const mockSchema = rawSchema as MetadataSchemaItem[];
