import type { PageManifestEntry } from '@/src/schemas/page.schema';
import {
  CURRENT_SCHEMA_VERSION,
  ensureSupportedSchemaVersion,
} from '@/src/lib/metadata/schema-version';

type LegacyPageManifestEntry = Omit<PageManifestEntry, 'schemaVersion'> & {
  schemaVersion?: string;
};

export function migratePageManifestEntry(raw: LegacyPageManifestEntry): PageManifestEntry {
  const schemaVersion = ensureSupportedSchemaVersion(
    raw.schemaVersion ?? CURRENT_SCHEMA_VERSION,
  );

  return {
    ...raw,
    schemaVersion,
  };
}
