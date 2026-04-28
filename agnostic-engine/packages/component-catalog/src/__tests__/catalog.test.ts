import { describe, expect, it } from 'vitest';
import { COMPONENT_CATALOG, COMPONENT_TYPES, createDefaultComponentMetadata } from '../index';

describe('component-catalog', () => {
  it('has unique component types', () => {
    const unique = new Set(COMPONENT_TYPES);
    expect(unique.size).toBe(COMPONENT_TYPES.length);
  });

  it('provides default metadata for each type', () => {
    for (const entry of COMPONENT_CATALOG) {
      const metadata = createDefaultComponentMetadata(entry.type);
      expect(typeof metadata).toBe('object');
      expect(metadata).not.toBeNull();
    }
  });
});
