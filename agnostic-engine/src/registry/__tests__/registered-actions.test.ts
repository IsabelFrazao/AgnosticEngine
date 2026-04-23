import { describe, expect, it } from 'vitest';
import { ActionRegistry } from '@/src/registry/action-registry';
import { registerApplicationActions } from '@/src/registry/registered-actions';

describe('registered actions bootstrap', () => {
  it('registers demo actions in a single bootstrap location', () => {
    expect(ActionRegistry.has('demo:log')).toBe(true);
    expect(ActionRegistry.has('courses:publish')).toBe(true);
  });

  it('is idempotent when bootstrap is called multiple times', () => {
    expect(() => registerApplicationActions()).not.toThrow();
    expect(() => registerApplicationActions()).not.toThrow();
  });
});
