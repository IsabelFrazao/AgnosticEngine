import { describe, expect, it } from 'vitest';
import { ActionRegistry } from '@/src/registry/action-registry';

describe('ActionRegistry', () => {
  it('registers and resolves handlers by actionId', () => {
    const id = '__test:registry:resolve';
    const handler = () => undefined;

    ActionRegistry.register({ id, label: 'Resolve test', handler });
    expect(ActionRegistry.has(id)).toBe(true);
    expect(ActionRegistry.resolve(id)).toBe(handler);
  });

  it('throws on duplicate action registration', () => {
    const id = '__test:registry:duplicate';
    ActionRegistry.register({ id, label: 'Duplicate test', handler: () => undefined });

    expect(() =>
      ActionRegistry.register({ id, label: 'Duplicate test', handler: () => undefined }),
    ).toThrow(`ActionRegistry: action "${id}" is already registered.`);
  });

  it('returns null for unknown actionId', () => {
    expect(ActionRegistry.resolve('__test:registry:unknown')).toBeNull();
  });
});
