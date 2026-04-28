import { describe, expect, it } from 'vitest';
import {
  CURRENT_SCHEMA_VERSION,
  ensureSupportedSchemaVersion,
  isSupportedSchemaVersion,
} from '../schema-version';

describe('metadata-schema/schema-version', () => {
  it('accepts supported versions', () => {
    expect(isSupportedSchemaVersion(CURRENT_SCHEMA_VERSION)).toBe(true);
    expect(ensureSupportedSchemaVersion(CURRENT_SCHEMA_VERSION)).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('rejects unsupported versions', () => {
    expect(isSupportedSchemaVersion('2.0')).toBe(false);
    expect(() => ensureSupportedSchemaVersion('2.0')).toThrowError(/Unsupported schemaVersion/);
  });
});
