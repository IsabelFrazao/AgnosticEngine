export const CURRENT_SCHEMA_VERSION = '1.0' as const;

export const SUPPORTED_SCHEMA_VERSIONS = [CURRENT_SCHEMA_VERSION] as const;

export type SchemaVersion = (typeof SUPPORTED_SCHEMA_VERSIONS)[number];

export function isSupportedSchemaVersion(value: unknown): value is SchemaVersion {
  return typeof value === 'string' &&
    (SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(value);
}

export function ensureSupportedSchemaVersion(value: unknown): SchemaVersion {
  if (!isSupportedSchemaVersion(value)) {
    throw new TypeError(
      `Unsupported schemaVersion "${String(value)}". Supported versions: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')}`,
    );
  }

  return value;
}
