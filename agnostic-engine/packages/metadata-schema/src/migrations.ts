import {
  CURRENT_SCHEMA_VERSION,
  ensureSupportedSchemaVersion,
  type SchemaVersion,
} from './schema-version';

type WithOptionalSchemaVersion = {
  [key: string]: unknown;
  schemaVersion?: string;
};

type WithSchemaVersion<T extends WithOptionalSchemaVersion> = Omit<T, 'schemaVersion'> & {
  schemaVersion: SchemaVersion;
};

export function migrateLayout<TLayout extends WithOptionalSchemaVersion>(
  raw: TLayout,
): WithSchemaVersion<TLayout> {
  const schemaVersion = ensureSupportedSchemaVersion(
    raw.schemaVersion ?? CURRENT_SCHEMA_VERSION,
  );

  return {
    ...raw,
    schemaVersion,
  };
}

export function migratePageManifestEntry<TPage extends WithOptionalSchemaVersion>(
  raw: TPage,
): WithSchemaVersion<TPage> {
  const schemaVersion = ensureSupportedSchemaVersion(
    raw.schemaVersion ?? CURRENT_SCHEMA_VERSION,
  );

  return {
    ...raw,
    schemaVersion,
  };
}
