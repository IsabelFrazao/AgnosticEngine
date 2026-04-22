import type { Layout } from '@/src/schemas/page.schema';
import {
  CURRENT_SCHEMA_VERSION,
  ensureSupportedSchemaVersion,
} from '@/src/lib/metadata/schema-version';

type LegacyLayout = Omit<Layout, 'schemaVersion'> & {
  schemaVersion?: string;
};

export function migrateLayout(raw: LegacyLayout): Layout {
  const schemaVersion = ensureSupportedSchemaVersion(
    raw.schemaVersion ?? CURRENT_SCHEMA_VERSION,
  );

  return {
    ...raw,
    schemaVersion,
  };
}
