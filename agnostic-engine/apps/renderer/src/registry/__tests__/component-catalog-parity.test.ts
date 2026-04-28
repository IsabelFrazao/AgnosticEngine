import { describe, expect, it } from 'vitest';
import { COMPONENT_TYPES } from '@agnostic/component-catalog';
import { ATOM_SCHEMAS } from '@/src/schemas/atoms';
import { COMPONENT_MAP } from '@/src/registry/component-registry';

function sorted(values: string[]): string[] {
  return [...values].sort();
}

describe('component catalog parity', () => {
  it('matches renderer atom schemas', () => {
    expect(sorted(Object.keys(ATOM_SCHEMAS))).toEqual(sorted([...COMPONENT_TYPES]));
  });

  it('matches renderer component registry entries', () => {
    expect(sorted(Object.keys(COMPONENT_MAP))).toEqual(sorted([...COMPONENT_TYPES]));
  });
});
