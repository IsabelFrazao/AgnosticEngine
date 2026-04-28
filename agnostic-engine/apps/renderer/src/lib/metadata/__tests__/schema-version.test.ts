import { describe, expect, it } from 'vitest';
import {
  CURRENT_SCHEMA_VERSION,
  ensureSupportedSchemaVersion,
  isSupportedSchemaVersion,
} from '@/src/lib/metadata/schema-version';

describe('schema version helpers', () => {
  it('accepts the current schema version', () => {
    expect(isSupportedSchemaVersion(CURRENT_SCHEMA_VERSION)).toBe(true);
    expect(ensureSupportedSchemaVersion(CURRENT_SCHEMA_VERSION)).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('rejects unsupported schema versions', () => {
    expect(isSupportedSchemaVersion('2.0')).toBe(false);
    expect(() => ensureSupportedSchemaVersion('2.0')).toThrowError(
      /Unsupported schemaVersion/,
    );
  });
});
