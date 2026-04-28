import { describe, expect, it } from 'vitest';
import {
  extendMetadataAncestorIds,
  resolveMetadataAncestorIds,
} from '@agnostic/engine-core';

describe('engine-limits', () => {
  it('resolveMetadataAncestorIds uses an empty set when omitted', () => {
    expect(resolveMetadataAncestorIds(undefined).size).toBe(0);
  });

  it('extendMetadataAncestorIds preserves prior ids and adds the current node', () => {
    const next = extendMetadataAncestorIds(new Set(['a']), 'b');
    expect([...next].sort()).toEqual(['a', 'b']);
  });
});
